import torch
from transformers import BertTokenizerFast, BertForTokenClassification, Trainer, TrainingArguments
from datasets import Dataset

# 自定义训练数据
train_data = {
    'tokens': [
        ["张", "三", "在", "北", "京", "工", "作"],
        ["李", "四", "在", "上", "海", "工", "作"],
        ["王", "五", "在", "深", "圳", "工", "作"]
    ],
    'labels': [
        [1, 1, 0, 3, 3, 0, 0],  # 1表示人名，3表示地名，0表示非实体
        [1, 1, 0, 3, 3, 0, 0],
        [1, 1, 0, 3, 3, 0, 0]
    ]
}

# 自定义验证数据
eval_data = {
    'tokens': [["赵", "六", "在", "广", "州", "工", "作"]],
    'labels': [[1, 1, 0, 3, 3, 0, 0]]  # 1表示人名，3表示地名，0表示非实体
}

# 创建数据集
train_dataset = Dataset.from_dict(train_data)
eval_dataset = Dataset.from_dict(eval_data)

# 加载预训练的BERT模型和分词器
tokenizer = BertTokenizerFast.from_pretrained('bert-base-chinese')
model = BertForTokenClassification.from_pretrained('bert-base-chinese', num_labels=4)

# 数据预处理
def tokenize_and_align_labels(examples):
    tokenized_inputs = tokenizer(examples['tokens'], truncation=True, is_split_into_words=True)
    labels = []
    for i, label in enumerate(examples['labels']):
        word_ids = tokenized_inputs.word_ids(batch_index=i)
        label_ids = []
        previous_word_idx = None
        for word_idx in word_ids:
            if word_idx is None:
                label_ids.append(-100)
            elif word_idx != previous_word_idx:
                label_ids.append(label[word_idx])
            else:
                label_ids.append(label[word_idx])
            previous_word_idx = word_idx
        labels.append(label_ids)
    tokenized_inputs["labels"] = labels
    return tokenized_inputs

train_dataset = train_dataset.map(tokenize_and_align_labels, batched=True)
eval_dataset = eval_dataset.map(tokenize_and_align_labels, batched=True)

# 训练参数
training_args = TrainingArguments(
    output_dir='./results',
    evaluation_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=5,  # 增加训练轮次
    weight_decay=0.01,
)

# 训练模型
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,  # 提供验证数据集
)

trainer.train()

# 保存模型
model.save_pretrained('./custom-ner-model')
tokenizer.save_pretrained('./custom-ner-model')