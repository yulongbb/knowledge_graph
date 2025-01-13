import json

# 读取 .jsonl 文件
data = []
with open("飞行器.jsonl", "r", encoding="utf-8") as f:
    for line in f:
        try:
            item = json.loads(line)
            if item:  # 检查是否为空
                data.append(item)
        except json.JSONDecodeError:
            print(f"警告：无法解析行：{line}")

# 标注函数
def annotate_text(text, entities):
    tokens = list(text)  # 按字符分词
    labels = ["O"] * len(tokens)  # 初始化标签
    
    # 标注实体
    for entity in entities:
        print(entity)
        start_idx = text.find(entity)
        if start_idx != -1:
            end_idx = start_idx + len(entity)
            labels[start_idx] = "B-Flight"
            for i in range(start_idx + 1, end_idx):
                labels[i] = "I-Flight"
    
    return tokens, labels

# 构建NER数据集
ner_data = []

for item in data:
    # 检查是否存在 "名称" 字段
    if "标签" not in item:
        print(f"警告：缺少 '名称' 字段，跳过该数据：{item}")
        continue
    
    # 提取名称和别名
    entities = [item["标签"]]
    
    # 标注描述文本
    tokens, labels = annotate_text(item["描述"], entities)
    
    # 添加到NER数据集
    ner_data.append({
        "tokens": tokens,
        "labels": labels
    })

# 保存为 .jsonl 文件
with open("ner_data.jsonl", "w", encoding="utf-8") as f:
    for item in ner_data:
        f.write(json.dumps(item, ensure_ascii=False) + "\n")

print("NER数据已保存到 ner_data.jsonl")