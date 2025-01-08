import json
import re
from transformers import BertTokenizerFast, BertForTokenClassification, Trainer, TrainingArguments, pipeline
from datasets import Dataset, DatasetDict
from evaluate import load  # 使用evaluate库来加载评估指标
import torch

# 设置设备为CPU或GPU
device = 'cuda' if torch.cuda.is_available() else 'cpu'

# 定义标签映射
label_mapping = {
    'O': 0,
    'B-WEAPON': 1,
    'I-WEAPON': 2,
    'B-COUNTRY': 3,
    'I-COUNTRY': 4,
    'B-ORGANIZATION': 5,
    'I-ORGANIZATION': 6,
    'B-AIRCRAFT': 7,  # 新增标签：飞机型号
    'I-AIRCRAFT': 8,
}

# 初始化分词器
tokenizer = BertTokenizerFast.from_pretrained('./model/bert-base-chinese')

# 加载并预处理单个条目
def process_entry(entry):
    text = entry.get('标签', '') + '。' + entry.get('别名', '') + '。' +entry.get('名称', '') + '。' +entry.get('描述', '')
    entities = [
        ('AIRCRAFT', entry.get('标签', '')),
        ('AIRCRAFT', entry.get('别名', '')),
        ('AIRCRAFT', entry.get('名称', '')),
        ('COUNTRY', entry.get('国家', '')),
        ('ORGANIZATION', entry.get('研发单位', ''))
    ]
        
    tokens = tokenizer.tokenize(text)
    labels = [0] * len(tokens)  # 默认所有token都是'O'
    
    for entity_type, entity_text in entities:
        matches = [(m.start(), m.end()) for m in re.finditer(re.escape(entity_text), text)]
        for start, end in matches:
            token_start = len(tokenizer.tokenize(text[:start]))
            token_end = token_start + len(tokenizer.tokenize(entity_text))
            if token_start < len(labels) and token_end <= len(labels):
                labels[token_start] = label_mapping[f'B-{entity_type}']
                for i in range(token_start + 1, token_end):
                    if i < len(labels):
                        labels[i] = label_mapping[f'I-{entity_type}']
    
    return {'tokens': tokens, 'ner_tags': labels}

# 加载并处理整个文件
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

# 对数据集进行tokenization，并对齐标签
def tokenize_and_align_labels(examples):
    tokenized_inputs = tokenizer(
        examples['tokens'], 
        truncation=True, 
        is_split_into_words=True, 
        padding="max_length", 
        max_length=64
    )
    
    labels = []
    for i, label in enumerate(examples['ner_tags']):
        word_ids = tokenized_inputs.word_ids(batch_index=i)  # 获取每个token对应的原始单词索引
        previous_word_idx = None
        label_ids = []
        for word_idx in word_ids:
            if word_idx is None:
                label_ids.append(-100)  # 对于特殊token（如[PAD]、[CLS]、[SEP]），我们忽略它们
            elif word_idx != previous_word_idx:
                # 如果是新的单词，则使用该单词的标签
                label_ids.append(label[word_idx])
            else:
                # 否则，对于同一个单词的子词，我们通常保留相同的标签
                label_ids.append(label[previous_word_idx] if label[previous_word_idx] != 2 else 3)
            previous_word_idx = word_idx
        
        # 确保label_ids和input_ids长度相同
        if len(label_ids) != len(tokenized_inputs["input_ids"][i]):
            print(f"Warning: Length mismatch for example {i}. Label IDs: {len(label_ids)}, Input IDs: {len(tokenized_inputs['input_ids'][i])}")
            # 根据实际情况调整，这里简单地填充-100以匹配长度
            while len(label_ids) < len(tokenized_inputs["input_ids"][i]):
                label_ids.append(-100)

        labels.append(label_ids)
    
    tokenized_inputs["labels"] = labels
    return tokenized_inputs

# 文件路径
file_path = '飞行器.jsonl'
dataset = load_and_process_jsonl(file_path)

# 应用tokenize_and_align_labels函数
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

# 初始化Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["validation"],
    tokenizer=tokenizer,
)

# 开始训练
trainer.train()

# 保存模型
trainer.save_model("./model/custom_ner_model")

# 使用训练好的模型进行预测
nlp = pipeline("ner", model="./model/custom_ner_model", tokenizer=tokenizer, device=0 if device == 'cuda' else -1)

# 测试文本
test_text = "Ki-109试作特殊防空战斗机是由三菱为日本陆军研发的秘密战机。"

# 进行预测
predictions = nlp(test_text)

# 映射标签名称，并过滤低置信度预测
confidence_threshold = 0.5
predictions_mapped = [
    {
        'entity': list(label_mapping.keys())[list(label_mapping.values()).index(int(pred['entity'].split('_')[-1]))],
        'score': float(pred['score']),
        'word': pred['word'],
        'start': pred['start'],
        'end': pred['end']
    }
    for pred in predictions if float(pred['score']) >= confidence_threshold
]

# 将连续的同类型实体合并成一个整体
def group_entities(predictions):
    grouped = []
    current_entity = None
    for pred in predictions:
        entity_type = pred['entity'].split('-')[0]
        if current_entity is None or current_entity['entity'] != pred['entity']:
            if current_entity is not None:
                grouped.append(current_entity)
            current_entity = pred.copy()
        else:
            current_entity['word'] += pred['word']
            current_entity['end'] = pred['end']
    if current_entity is not None:
        grouped.append(current_entity)
    return grouped

# 打印改进后的预测结果
grouped_predictions = group_entities(predictions_mapped)

for entity in grouped_predictions:
    print(f"Entity Type: {entity['entity']}, Word: '{entity['word']}', Confidence: {entity['score']:.2f}")

