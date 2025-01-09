from flask import Flask, request, jsonify
import json
import re
from transformers import BertTokenizerFast, BertForTokenClassification, Trainer, TrainingArguments
from datasets import Dataset, DatasetDict
import torch
import os
from threading import Thread

# 初始化 Flask 应用
app = Flask(__name__)

# 定义标签映射
label_mapping = {
    'O': 0,
    'B-WEAPON': 1,
    'I-WEAPON': 2,
    'B-COUNTRY': 3,
    'I-COUNTRY': 4,
    'B-ORGANIZATION': 5,
    'I-ORGANIZATION': 6,
    'B-AIRCRAFT': 7,
    'I-AIRCRAFT': 8,
}

# 初始化分词器
tokenizer = BertTokenizerFast.from_pretrained('./model/bert-base-chinese')

# 训练状态和结果存储
training_status = {
    "is_training": False,
    "progress": 0.0,
    "result": None,
    "error": None
}

# 加载并处理数据
def load_and_process_jsonl(file_path):
    data = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            entry = json.loads(line.strip())
            processed_entry = process_entry(entry)
            data.append(processed_entry)
    
    split_ratio = 0.8
    train_size = int(len(data) * split_ratio)
    train_dataset = Dataset.from_dict({k: [entry[k] for entry in data[:train_size]] for k in data[0]})
    val_dataset = Dataset.from_dict({k: [entry[k] for entry in data[train_size:]] for k in data[0]})
    dataset = DatasetDict({'train': train_dataset, 'validation': val_dataset})
    return dataset

# 训练函数
def train_model(file_path):
    try:
        # 更新训练状态
        training_status["is_training"] = True
        training_status["progress"] = 0.0
        training_status["result"] = None
        training_status["error"] = None

        # 加载数据
        dataset = load_and_process_jsonl(file_path)
        tokenized_datasets = dataset.map(tokenize_and_align_labels, batched=True)

        # 初始化模型
        model = BertForTokenClassification.from_pretrained('./model/bert-base-chinese', num_labels=len(label_mapping))

        # 定义训练参数
        training_args = TrainingArguments(
            output_dir='./results',
            eval_strategy="epoch",
            learning_rate=2e-5,
            per_device_train_batch_size=16,
            per_device_eval_batch_size=16,
            num_train_epochs=3,
            weight_decay=0.01,
        )

        # 初始化 Trainer
        trainer = Trainer(
            model=model,
            args=training_args,
            train_dataset=tokenized_datasets["train"],
            eval_dataset=tokenized_datasets["validation"],
            tokenizer=tokenizer,
        )

        # 开始训练
        trainer.train()
        training_status["progress"] = 1.0
        training_status["result"] = "Training completed successfully!"

        # 保存模型
        trainer.save_model("./model/custom_ner_model")
        tokenizer.save_pretrained("./model/custom_ner_model")

    except Exception as e:
        training_status["error"] = str(e)
    finally:
        training_status["is_training"] = False

# 训练接口
@app.route("/train", methods=["POST"])
def start_training():
    if training_status["is_training"]:
        return jsonify({"error": "Training is already in progress."}), 400
    
    file_path = "飞行器.jsonl"  # 替换为你的数据文件路径
    thread = Thread(target=train_model, args=(file_path,))
    thread.start()
    return jsonify({"message": "Training started in the background."})

# 获取训练状态接口
@app.route("/training-status", methods=["GET"])
def get_training_status():
    return jsonify(training_status)

# 测试接口
@app.route("/test", methods=["GET"])
def test_model():
    if not os.path.exists("./model/custom_ner_model"):
        return jsonify({"error": "Model not found. Please train the model first."}), 404
    
    text = request.args.get("text")
    if not text:
        return jsonify({"error": "Missing 'text' parameter."}), 400
    
    nlp = pipeline("ner", model="./model/custom_ner_model", tokenizer=tokenizer, device=0 if torch.cuda.is_available() else -1)
    predictions = nlp(text)
    return jsonify({"text": text, "predictions": predictions})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6666)