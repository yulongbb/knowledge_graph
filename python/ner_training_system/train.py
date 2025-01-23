import json
from datasets import Dataset
from transformers import BertTokenizerFast, BertForTokenClassification, TrainingArguments, Trainer
import torch
from transformers import TrainerCallback

def train_model(data_path, model_save_path="./saved_model", training_logs=None):
    # 定义标签映射
    label_to_id = {"B-Flight": 0, "I-Flight": 1, "O": 2}
    id_to_label = {v: k for k, v in label_to_id.items()}

    # 加载NER数据
    ner_data = []
    with open(data_path, "r", encoding="utf-8") as f:
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

    # 自定义回调函数，用于记录日志
    class LogCallback(TrainerCallback):
        def on_log(self, args, state, control, logs=None, **kwargs):
            if logs:
                log_message = f"Epoch {state.epoch}/{state.num_train_epochs} - Loss: {logs.get('loss', 'N/A')}"
                if training_logs is not None:
                    training_logs.append(log_message)

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

    return model_save_path