import json
from datasets import Dataset
from transformers import BertTokenizerFast, BertForTokenClassification, TrainingArguments, Trainer
import torch
import jieba

# 定义标签映射
label_to_id = {"B-Flight": 0, "I-Flight": 1, "O": 2}
id_to_label = {v: k for k, v in label_to_id.items()}  # 反向映射，用于推理时

# 加载NER数据
ner_data = []
with open("ner_data.jsonl", "r", encoding="utf-8") as f:
    for line in f:
        item = json.loads(line)
        ner_data.append(item)

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
tokenizer = BertTokenizerFast.from_pretrained("./model/bert-base-chinese")

# 添加实体词到词汇表
# 从文件中提取标签
new_tokens = set()  # 使用集合存储唯一的标签

with open("飞行器.jsonl", "r", encoding="utf-8") as f:
    for line in f:
        try:
            item = json.loads(line.strip())  # 解析 JSON 行
            print(item["标签"])
            if "标签" in item:  # 检查是否有 labels 字段
                new_tokens.update(item["标签"])  # 将 labels 添加到集合中
        except json.JSONDecodeError as e:
            print(f"警告：无法解析行：{line}，错误信息：{e}")

# 将集合转换为列表
new_tokens = list(new_tokens)
print("提取的标签：", new_tokens)

# 加载模型并调整词嵌入层
model = BertForTokenClassification.from_pretrained(
    "./model/bert-base-chinese", num_labels=len(label_to_id)  # 标签数量
)
model.resize_token_embeddings(len(tokenizer))  # 调整词嵌入层大小

# 定义标注对齐函数
def tokenize_and_align_labels(examples):
    tokenized_inputs = tokenizer(
        examples["tokens"],
        truncation=True,
        is_split_into_words=True,
        padding="max_length",  # 确保填充到最大长度
        max_length=128  # 设置最大长度
    )
    labels = []
    for i, label in enumerate(examples["labels"]):
        word_ids = tokenized_inputs.word_ids(batch_index=i)
        previous_word_idx = None
        label_ids = []
        for word_idx in word_ids:
            if word_idx is None:
                label_ids.append(-100)  # 特殊token（如[CLS], [SEP], padding）的标签设为-100
            elif word_idx != previous_word_idx:
                label_ids.append(label[word_idx])  # 当前词的标签
            else:
                label_ids.append(-100)  # 子词的标签设为-100
            previous_word_idx = word_idx
        
        # 确保label_ids的长度与input_ids的长度一致
        if len(label_ids) < len(tokenized_inputs["input_ids"][i]):
            # 如果label_ids太短，填充-100
            label_ids.extend([-100] * (len(tokenized_inputs["input_ids"][i]) - len(label_ids)))
        elif len(label_ids) > len(tokenized_inputs["input_ids"][i]):
            # 如果label_ids太长，截断
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

# 定义训练参数
training_args = TrainingArguments(
    output_dir="./results",
    evaluation_strategy="epoch",
    learning_rate=3e-5,  # 调整学习率
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=5,  # 增加训练轮数
    weight_decay=0.01,
    save_strategy="epoch",
    save_total_limit=2,
    logging_dir="./logs",
    logging_steps=10,
)

# 定义Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
)

# 训练模型
trainer.train()

# 保存模型和分词器
trainer.save_model("./model/saved_model")
tokenizer.save_pretrained("./model/saved_model")

# 加载模型和分词器
model = BertForTokenClassification.from_pretrained("./model/saved_model")
tokenizer = BertTokenizerFast.from_pretrained("./model/saved_model")

# 推理函数
def predict_entities(text):
    # 使用 jieba 分词
    tokens = jieba.lcut(text)
    print("jieba 分词结果:", tokens)

    # 将分词结果输入模型
    inputs = tokenizer(
        tokens,
        is_split_into_words=True,  # 表示输入已分词
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128
    )
    with torch.no_grad():
        outputs = model(**inputs)
    predictions = torch.argmax(outputs.logits, dim=-1).squeeze().tolist()
    predicted_labels = [id_to_label[label_id] for label_id in predictions]

    # 对齐分词和标签
    word_ids = inputs.word_ids()  # 获取每个 token 对应的原始分词索引
    aligned_labels = []
    for word_idx, label in zip(word_ids, predicted_labels):
        if word_idx is not None:  # 过滤特殊标记
            aligned_labels.append((tokens[word_idx], label))

    # 提取实体
    entities = []
    current_entity = ""
    current_entity_type = None
    for token, label in aligned_labels:
        if label == "B-Flight" or (label == "I-Flight" and not current_entity):
            if current_entity:
                entities.append((current_entity, current_entity_type))
            current_entity = token
            current_entity_type = "Flight"
        elif label == "I-Flight" and current_entity_type == "Flight":
            current_entity += token
        else:
            if current_entity:
                entities.append((current_entity, current_entity_type))
            current_entity = ""
            current_entity_type = None

    # 处理最后一个实体
    if current_entity:
        entities.append((current_entity, current_entity_type))

    return entities

# 测试推理函数
text = "肖特360由330发展而来，对机身作了加长，以便利用美国撤销管制规定后产生的容积增长空间。360与330最明显的不同在于用常规尾翼替换了330的双尾翼。肖特360机型于1981年6月1日首飞，1982年12月1日在美国SuburbanAirlines航空公司开始服役。该机型共计交付了164架。"
entities = predict_entities(text)
print("识别到的实体：", entities)