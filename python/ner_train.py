import json
from datasets import Dataset
from transformers import BertTokenizerFast, BertForTokenClassification, TrainingArguments, Trainer
import torch

# 定义标签映射
label_to_id = {"B-Flight": 0, "I-Flight": 1, "O": 2}
id_to_label = {v: k for k, v in label_to_id.items()}  # 反向映射，用于推理时

# # 加载NER数据
# ner_data = []
# with open("ner_data.jsonl", "r", encoding="utf-8") as f:
#     for line in f:
#         item = json.loads(line)
#         ner_data.append(item)

# # 转换为Dataset格式
# dataset = Dataset.from_dict({
#     "tokens": [item["tokens"] for item in ner_data],
#     "labels": [item["labels"] for item in ner_data]
# })

# # 过滤掉空数据和长度不匹配的数据
# dataset = dataset.filter(lambda x: len(x["tokens"]) > 0 and len(x["labels"]) > 0 and len(x["tokens"]) == len(x["labels"]))

# # 转换标签为整数
# def convert_labels_to_ids(examples):
#     examples["labels"] = [[label_to_id[label] for label in labels] for labels in examples["labels"]]
#     return examples

# dataset = dataset.map(convert_labels_to_ids, batched=True)

# # 初始化快速分词器
# tokenizer = BertTokenizerFast.from_pretrained("model/bert-base-chinese")

# # 定义标注对齐函数
# def tokenize_and_align_labels(examples):
#     tokenized_inputs = tokenizer(
#         examples["tokens"],
#         truncation=True,
#         is_split_into_words=True,
#         padding="max_length",  # 确保填充到最大长度
#         max_length=128  # 设置最大长度
#     )
#     labels = []
#     for i, label in enumerate(examples["labels"]):
#         word_ids = tokenized_inputs.word_ids(batch_index=i)
#         previous_word_idx = None
#         label_ids = []
#         for word_idx in word_ids:
#             if word_idx is None:
#                 label_ids.append(-100)  # 特殊token（如[CLS], [SEP], padding）的标签设为-100
#             elif word_idx != previous_word_idx:
#                 label_ids.append(label[word_idx])  # 当前词的标签
#             else:
#                 label_ids.append(-100)  # 子词的标签设为-100
#             previous_word_idx = word_idx
        
#         # 确保label_ids的长度与input_ids的长度一致
#         if len(label_ids) < len(tokenized_inputs["input_ids"][i]):
#             # 如果label_ids太短，填充-100
#             label_ids.extend([-100] * (len(tokenized_inputs["input_ids"][i]) - len(label_ids)))
#         elif len(label_ids) > len(tokenized_inputs["input_ids"][i]):
#             # 如果label_ids太长，截断
#             label_ids = label_ids[:len(tokenized_inputs["input_ids"][i])]
        
#         labels.append(label_ids)
    
#     tokenized_inputs["labels"] = labels
#     return tokenized_inputs

# # 处理数据集
# tokenized_dataset = dataset.map(tokenize_and_align_labels, batched=True)

# # 分割数据集为训练集和验证集
# split_dataset = tokenized_dataset.train_test_split(test_size=0.1)
# train_dataset = split_dataset["train"]
# eval_dataset = split_dataset["test"]

# # 加载模型
# model = BertForTokenClassification.from_pretrained(
#     "model/bert-base-chinese", num_labels=len(label_to_id)  # 标签数量
# )

# # 定义训练参数
# training_args = TrainingArguments(
#     output_dir="./results",
#     evaluation_strategy="epoch",
#     learning_rate=2e-5,
#     per_device_train_batch_size=16,
#     per_device_eval_batch_size=16,
#     num_train_epochs=3,
#     weight_decay=0.01,
#     save_strategy="epoch",
#     save_total_limit=2,
#     logging_dir="./logs",
#     logging_steps=10,
# )

# # 定义Trainer
# trainer = Trainer(
#     model=model,
#     args=training_args,
#     train_dataset=train_dataset,
#     eval_dataset=eval_dataset,
# )

# # 训练模型
# trainer.train()

# # 保存模型
# trainer.save_model("./saved_model")
# tokenizer.save_pretrained("./saved_model")

# 加载模型
model = BertForTokenClassification.from_pretrained("./model/saved_model")
tokenizer = BertTokenizerFast.from_pretrained("./model/saved_model")

# 添加自定义词汇
# custom_tokens = ["塞斯纳-170", "'安-140"]
# tokenizer.add_tokens(custom_tokens)
# model.resize_token_embeddings(len(tokenizer))

# 改进后的推理函数
def predict_entities(text):
    inputs = tokenizer(
        text,
        return_tensors="pt",  # 返回PyTorch张量
        truncation=True,
        padding=True,
        max_length=128,
        is_split_into_words=False  # 输入是原始文本，而不是预分词的列表
    )
    with torch.no_grad():  # 禁用梯度计算
        outputs = model(**inputs)
    predictions = torch.argmax(outputs.logits, dim=-1).squeeze().tolist()
    predicted_labels = [id_to_label[label_id] for label_id in predictions]
    tokens = tokenizer.convert_ids_to_tokens(inputs["input_ids"].squeeze().tolist())
    
    # 对齐标签和token
    aligned_labels = []
    for token, label in zip(tokens, predicted_labels):
        if token in [tokenizer.cls_token, tokenizer.sep_token, tokenizer.pad_token]:
            continue  # 跳过特殊token
        aligned_labels.append((token, label))
    print(aligned_labels)
    # 合并实体
    entities = []
    current_entity = ""
    for token, label in aligned_labels:
        if label == "B-Flight":
            if current_entity:
                entities.append(current_entity)
            current_entity = token
        elif label == "I-Flight":
            if current_entity:
                current_entity += token
            else:
                # 如果当前没有实体，但遇到 I-Flight，则开始一个新实体
                current_entity = token
        else:
            if current_entity:
                entities.append(current_entity)
            current_entity = ""
    if current_entity:
        entities.append(current_entity)
    
    return entities

# 测试推理函数
text = "塞斯纳-170和安-140和是日本旧日本陆军X系列秘密战机。"
entities = predict_entities(text)
print("识别到的实体：", entities)  # 输出：['安-140', '塞斯纳-170']