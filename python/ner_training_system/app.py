from flask import Flask, request, jsonify, render_template, Response, send_from_directory, send_file
import os
import time
import json
import threading
from datasets import Dataset
from transformers import BertTokenizerFast, BertForTokenClassification, TrainingArguments, Trainer
from transformers import TrainerCallback, pipeline
import torch

app = Flask(__name__)

# 文件保存路径
UPLOAD_FOLDER = 'uploads'
MODEL_FOLDER = 'saved_model'
ANNOTATIONS_FILE = os.path.join(UPLOAD_FOLDER, 'annotations.jsonl')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(MODEL_FOLDER, exist_ok=True)

# 全局变量，用于存储训练日志和进度
training_logs = []
training_progress = 0  # 训练进度（0-100）

# 首页
@app.route('/')
def home():
    return render_template('index.html')  # 渲染前端页面

# 文件下载接口
@app.route('/download')
def download_file():
    filename = "annotations.jsonl"
    return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=True)

# 下载标注数据接口
@app.route('/download-annotations', methods=['GET'])
def download_annotations():
    if not os.path.exists(ANNOTATIONS_FILE):
        return jsonify({"error": "No annotations available"}), 404

    return send_file(ANNOTATIONS_FILE, as_attachment=True, download_name='annotations.jsonl')

# 上传数据并训练模型
@app.route('/train', methods=['POST'])
def train():
    global training_logs, training_progress

    # 检查是否有文件上传
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # 保存上传的文件
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    # 清空训练日志和进度
    training_logs = []
    training_progress = 0

    # 启动训练线程
    def train_task():
        global training_logs, training_progress
        try:
            train_model(file_path, MODEL_FOLDER, training_logs, lambda p: set_progress(p))
        except Exception as e:
            training_logs.append(f"Error: {str(e)}")

    threading.Thread(target=train_task).start()

    return jsonify({"message": "Training started!"})

# 使用本地文件训练模型接口
@app.route('/train-local', methods=['POST'])
def train_local():
    global training_logs, training_progress

    # 本地文件路径
    local_file_path = os.path.join(UPLOAD_FOLDER, 'annotations.jsonl')
    if not os.path.exists(local_file_path):
        return jsonify({"error": "Local file not found"}), 404

    # 清空训练日志和进度
    training_logs = []
    training_progress = 0

    # 启动训练线程
    def train_task():
        global training_logs, training_progress
        try:
            train_model(local_file_path, MODEL_FOLDER, training_logs, lambda p: set_progress(p))
        except Exception as e:
            training_logs.append(f"Error: {str(e)}")

    threading.Thread(target=train_task).start()

    return jsonify({"message": "Training started with local file!"})

# 设置训练进度
def set_progress(progress):
    global training_progress
    training_progress = progress

# 获取训练日志和进度
@app.route('/train-log')
def train_log():
    def generate():
        global training_logs, training_progress
        while True:
            if training_logs:
                log = training_logs.pop(0)
                yield f"data: {json.dumps({'log': log, 'progress': training_progress})}\n\n"
            else:
                yield f"data: {json.dumps({'progress': training_progress})}\n\n"
            time.sleep(1)  # 每秒检查一次日志和进度

    return Response(generate(), mimetype='text/event-stream')

# 训练模型函数
def train_model(data_path, model_save_path="./saved_model", training_logs=None, progress_callback=None):
    # 动态生成标签映射
    label_to_id = {}
    id_to_label = {}
    current_label_id = 0

    # 加载NER数据
    ner_data = []
    with open(data_path, "r", encoding="utf-8") as f:
        for line in f:
            item = json.loads(line)
            ner_data.append(item)
            for label in item["labels"]:
                if label not in label_to_id:
                    label_to_id[label] = current_label_id
                    id_to_label[current_label_id] = label
                    current_label_id += 1

    # 保存标签映射
    with open(os.path.join(model_save_path, "label_to_id.json"), "w", encoding="utf-8") as f:
        json.dump(label_to_id, f, ensure_ascii=False)

    # 转换为Dataset格式
    dataset = Dataset.from_dict({
        "tokens": [item["tokens"] for item in ner_data],
        "labels": [item["labels"] for item in ner_data]
    })

    # 过滤掉空数据和长度不匹配的数据
    dataset = dataset.filter(lambda x: len(x["tokens"]) > 0 and len(x["labels"]) > 0 and len(x["tokens"]) == len(x["labels"]))

    # 转换标签为整数
    def convert_labels_to_ids(examples):
        examples["labels"] = [[label_to_id[label] for label in labels] for labels in examples["labels"]]
        return examples

    dataset = dataset.map(convert_labels_to_ids, batched=True)

    # 初始化快速分词器
    tokenizer = BertTokenizerFast.from_pretrained("model/bert-base-chinese")

    # 定义标注对齐函数
    def tokenize_and_align_labels(examples):
        tokenized_inputs = tokenizer(
            examples["tokens"],
            truncation=True,
            is_split_into_words=True,
            padding="max_length",
            max_length=128
        )
        labels = []
        for i, label in enumerate(examples["labels"]):
            word_ids = tokenized_inputs.word_ids(batch_index=i)
            previous_word_idx = None
            label_ids = []
            for word_idx in word_ids:
                if word_idx is None:
                    label_ids.append(-100)
                elif word_idx != previous_word_idx:
                    label_ids.append(label[word_idx])
                else:
                    label_ids.append(-100)
                previous_word_idx = word_idx

            # 确保label_ids的长度与input_ids的长度一致
            if len(label_ids) < len(tokenized_inputs["input_ids"][i]):
                label_ids.extend([-100] * (len(tokenized_inputs["input_ids"][i]) - len(label_ids)))
            elif len(label_ids) > len(tokenized_inputs["input_ids"][i]):
                label_ids = label_ids[:len(tokenized_inputs["input_ids"][i])]

            labels.append(label_ids)

        tokenized_inputs["labels"] = labels
        return tokenized_inputs

    # 处理数据集
    tokenized_dataset = dataset.map(tokenize_and_align_labels, batched=True)

    # 分割数据集为训练集和验证集
    split_dataset = tokenized_dataset.train_test_split(test_size=0.1)
    train_dataset = split_dataset["train"]
    eval_dataset = split_dataset["test"]

    # 加载模型
    model = BertForTokenClassification.from_pretrained(
        "model/bert-base-chinese", num_labels=len(label_to_id)
    )

    # 将模型移动到CPU
    device = torch.device("cpu")
    model.to(device)

    # 定义训练参数
    training_args = TrainingArguments(
        output_dir="./results",
        evaluation_strategy="epoch",
        learning_rate=2e-5,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=16,
        num_train_epochs=3,
        weight_decay=0.01,
        save_strategy="epoch",
        save_total_limit=2,
        logging_dir="./logs",
        logging_steps=10,
    )

    # 自定义回调函数，用于记录日志和更新进度
    class LogCallback(TrainerCallback):
        def on_log(self, args, state, control, logs=None, **kwargs):
            if logs:
                log_message = f"Epoch {state.epoch}/{state.num_train_epochs} - Loss: {logs.get('loss', 'N/A')}"
                if training_logs is not None:
                    training_logs.append(log_message)

                # 计算训练进度
                progress = int((state.epoch / state.num_train_epochs) * 100)
                if progress_callback:
                    progress_callback(progress)

    # 定义Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        callbacks=[LogCallback()],  # 添加自定义回调函数
    )

    # 训练模型
    trainer.train()

    # 保存模型
    trainer.save_model(model_save_path)
    tokenizer.save_pretrained(model_save_path)

    if training_logs is not None:
        training_logs.append("Training completed!")
        training_logs.append("complete")  # 发送完成事件

    return model_save_path

# 改进后的推理函数
def predict_entities(text):
    # 加载模型和分词器
    model = BertForTokenClassification.from_pretrained("./saved_model")
    tokenizer = BertTokenizerFast.from_pretrained("./saved_model")
    # 动态加载标签映射
    label_path = os.path.join("./saved_model", "label_to_id.json")
    if os.path.exists(label_path):
        with open(label_path, "r", encoding="utf-8") as f:
            label_to_id = json.load(f)
        id_to_label = {v: k for k, v in label_to_id.items()}
    else:
        id_to_label = {}

    print(id_to_label)

    # 确保所有可能的标签ID都在映射中
    max_label_id = max(id_to_label.keys(), default=-1)
    for i in range(max_label_id + 1):
        if i not in id_to_label:
            id_to_label[i] = "O"  # 默认标签

    # 将模型和输入数据移动到CPU
    model.to('cpu')
    inputs = tokenizer(
        text,
        return_tensors="pt",  # 返回PyTorch张量
        truncation=True,
        padding=True,
        max_length=128,
        is_split_into_words=False  # 输入是原始文本，而不是预分词的列表
    ).to('cpu')
    
    with torch.no_grad():  # 禁用梯度计算
        outputs = model(**inputs)
    predictions = torch.argmax(outputs.logits, dim=-1).squeeze().tolist()
    predicted_labels = [id_to_label.get(label_id, "O") for label_id in predictions]  # 使用默认标签
    tokens = tokenizer.convert_ids_to_tokens(inputs["input_ids"].squeeze().tolist())

    print(predicted_labels)
    print(tokens)
    
    # 对齐标签和token
    aligned_labels = []
    for token, label in zip(tokens, predicted_labels):
        if token in [tokenizer.cls_token, tokenizer.sep_token, tokenizer.pad_token]:
            continue  # 跳过特殊token
        aligned_labels.append((token, label))
    
    # 动态生成实体类型
    entity_types = {label.split('-')[1] for label in id_to_label.values() if '-' in label}
    entities = {entity_type: [] for entity_type in entity_types}
    
    # 合并实体
    current_entity = ""
    current_label = None
    for token, label in aligned_labels:
        if label.startswith("B-"):
            if current_entity and current_label:
                entities[current_label].append(current_entity)
            current_entity = token
            current_label = label.split('-')[1]
        elif label.startswith("I-") and current_label:
            current_entity += token
        else:
            if current_entity and current_label:
                entities[current_label].append(current_entity)
            current_entity = ""
            current_label = None
    if current_entity and current_label:
        entities[current_label].append(current_entity)
    
    # 确保所有实体类型都在结果中
    for entity_type in entity_types:
        if entity_type not in entities:
            entities[entity_type] = []
    
    return entities

# 预测接口
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    text = data.get('text', '')
    if not text:
        return jsonify({"error": "No text provided"}), 400

    # 调用推理函数
    entities = predict_entities(text)

    # 返回预测结果
    return jsonify({"entities": entities})

# 标注函数
def annotate_text(text, entities, entity_type):
    tokens = list(text)  # 按字符分词
    labels = ["O"] * len(tokens)  # 初始化标签
    
    # 标注实体
    for entity in entities:
        start_idx = text.find(entity)
        if (start_idx != -1):
            end_idx = start_idx + len(entity)
            labels[start_idx] = f"B-{entity_type}"
            for i in range(start_idx + 1, end_idx):
                labels[i] = f"I-{entity_type}"
    
    return tokens, labels

# 构建NER数据集
def build_ner_data(entity_obj):
    description = entity_obj["descriptions"]["zh"]
    labels = entity_obj["labels"]["zh"]
    entity_type = entity_obj["type"]
    entities = [labels]
    
    # 拼接标签和描述
    text = f"{labels} {description}"
    
    tokens, labels = annotate_text(text, entities, entity_type)
    
    ner_data = {
        "tokens": tokens,
        "labels": labels
    }
    
    return ner_data

# 标注接口
@app.route('/annotate', methods=['POST'])
def annotate():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    ner_data = build_ner_data(data)
    
    # 增量写入到 JSONL 文件
    with open(ANNOTATIONS_FILE, 'a', encoding='utf-8') as f:
        f.write(json.dumps(ner_data, ensure_ascii=False) + '\n')
    
    return jsonify(ner_data)

# 预览标注数据接口
@app.route('/preview-annotations', methods=['GET'])
def preview_annotations():
    if not os.path.exists(ANNOTATIONS_FILE):
        return jsonify({"error": "No annotations available"}), 404

    annotations = []
    with open(ANNOTATIONS_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            annotations.append(json.loads(line.strip()))

    return jsonify(annotations)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
    app.run(host='0.0.0.0', port=5000)