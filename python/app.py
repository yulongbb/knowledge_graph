from flask import Flask, request, jsonify
from flask_cors import CORS
import jieba
from transformers import BertTokenizer, BertForTokenClassification, pipeline
import torch
import os

app = Flask(__name__)
CORS(app)  # 启用CORS

# 加载本地文本文件中的实体标签和 ID 到分词器中
knowledge_entities = {}

# def load_knowledge_entities_from_file():
#     with open('entities.txt', 'r', encoding='utf-8') as file:
#         for line in file:
#             entity_name, entity_id = line.strip().split('\t')
#             jieba.add_word(entity_name)
#             knowledge_entities[entity_name] = entity_id

# load_knowledge_entities_from_file()

# 检查是否有可用的GPU
device = 0 if torch.cuda.is_available() else -1

# 加载预训练的BERT模型和分词器
tokenizer = BertTokenizer.from_pretrained("bert-base-chinese")
model = BertForTokenClassification.from_pretrained("bert-base-chinese-ner")

# 创建一个实体识别的pipeline
nlp = pipeline("ner", model=model, tokenizer=tokenizer, device=device)

# 预处理函数
def preprocess(text):
    words = jieba.lcut(text)
    # 仅返回知识库中的词
    knowledge_words = list(set(word for word in words if word in knowledge_entities))
    return knowledge_words

@app.route('/segment', methods=['POST'])
def segment():
    data = request.json
    if 'text' not in data:
        return jsonify({'error': 'Missing text field'}), 400
    text = data['text']
    words = preprocess(text)
    links = []
    for word in words:
        entity_id = knowledge_entities[word]
        link = f'<a href="http://localhost:4200/index/search/info/{entity_id}">{word}</a>'
        links.append(link)
    return jsonify({'words': links})

@app.route('/recognize', methods=['POST'])
def recognize():
    data = request.json
    if 'text' not in data:
        return jsonify({'error': 'Missing text field'}), 400
    text = data['text']

    # 使用pipeline进行实体识别
    ner_results = nlp(text)
    
    # 初始化实体类别字典
    entities = {}
    
    # 提取实体并分类
    current_entity = ""
    current_label = ""
    for entity in ner_results:
        label = entity['entity']
        word = entity['word']
        entity_type = label.split("-")[1]
        
        if label.startswith("B-"):
            if current_entity:
                if current_label not in entities:
                    entities[current_label] = []
                entities[current_label].append(current_entity)
            current_entity = word
            current_label = entity_type
        elif label.startswith("I-") or label.startswith("E-"):
            current_entity += word
            if label.startswith("E-"):
                if current_label not in entities:
                    entities[current_label] = []
                entities[current_label].append(current_entity)
                current_entity = ""
                current_label = ""
        else:
            if current_entity:
                if current_label not in entities:
                    entities[current_label] = []
                entities[current_label].append(current_entity)
                current_entity = ""
                current_label = ""
    
    # 如果最后一个实体未添加到字典中
    if current_entity and current_label:
        if current_label not in entities:
            entities[current_label] = []
        entities[current_label].append(current_entity)
    
    # 打印分类后的实体
    entity_dict = {key: value for key, value in entities.items() if value}
    
    return jsonify({'entities': entity_dict})

@app.route('/extract', methods=['POST'])
def extract():
    data = request.json
    if 'text' not in data:
        return jsonify({'error': 'Missing text field'}), 400
    text = data['text']

    # 使用pipeline进行实体识别
    ner_results = nlp(text)
    
    # 初始化实体类别字典
    entities = {}
    
    # 提取实体并分类
    current_entity = ""
    current_label = ""
    for entity in ner_results:
        label = entity['entity']
        word = entity['word']
        entity_type = label.split("-")[1]
        
        if label.startswith("B-"):
            if current_entity:
                if current_label not in entities:
                    entities[current_label] = []
                entities[current_label].append(current_entity)
            current_entity = word
            current_label = entity_type
        elif label.startswith("I-") or label.startswith("E-"):
            current_entity += word
            if label.startswith("E-"):
                if current_label not in entities:
                    entities[current_label] = []
                entities[current_label].append(current_entity)
                current_entity = ""
                current_label = ""
        else:
            if current_entity:
                if current_label not in entities:
                    entities[current_label] = []
                entities[current_label].append(current_entity)
                current_entity = ""
                current_label = ""
    
    # 如果最后一个实体未添加到字典中
    if current_entity and current_label:
        if current_label not in entities:
            entities[current_label] = []
        entities[current_label].append(current_entity)
    
    # 打印分类后的实体
    entity_dict = {key: value for key, value in entities.items() if value}
    
    # 改进的关系抽取模型
    def extract_relations(entity_dict):
        relations = []
        if entity_dict.get("PER") and entity_dict.get("LOC"):
            for person in entity_dict["PER"]:
                for location in entity_dict["LOC"]:
                    relations.append((person, "在", location))
        if entity_dict.get("PER") and entity_dict.get("ORG"):
            for person in entity_dict["PER"]:
                for organization in entity_dict["ORG"]:
                    relations.append((person, "属于", organization))
        if entity_dict.get("PER") and entity_dict.get("MISC"):
            for person in entity_dict["PER"]:
                for misc in entity_dict["MISC"]:
                    relations.append((person, "相关", misc))
        if entity_dict.get("ORG") and entity_dict.get("LOC"):
            for organization in entity_dict["ORG"]:
                for location in entity_dict["LOC"]:
                    relations.append((organization, "位于", location))
        if entity_dict.get("ORG") and entity_dict.get("PRODUCT"):
            for organization in entity_dict["ORG"]:
                for product in entity_dict["PRODUCT"]:
                    relations.append((organization, "生产", product))
        if entity_dict.get("LOC") and entity_dict.get("DATE"):
            for location in entity_dict["LOC"]:
                for date in entity_dict["DATE"]:
                    relations.append((location, "在", date))
        if entity_dict.get("PER") and entity_dict.get("DATE"):
            for person in entity_dict["PER"]:
                for date in entity_dict["DATE"]:
                    relations.append((person, "在", date))
        if entity_dict.get("ORG") and entity_dict.get("DATE"):
            for organization in entity_dict["ORG"]:
                for date in entity_dict["DATE"]:
                    relations.append((organization, "在", date))
        if entity_dict.get("PRODUCT") and entity_dict.get("DATE"):
            for product in entity_dict["PRODUCT"]:
                for date in entity_dict["DATE"]:
                    relations.append((product, "在", date))
        if entity_dict.get("PRODUCT") and entity_dict.get("LOC"):
            for product in entity_dict["PRODUCT"]:
                for location in entity_dict["LOC"]:
                    relations.append((product, "位于", location))
        if entity_dict.get("PER") and entity_dict.get("GPE"):
            for person in entity_dict["PER"]:
                for gpe in entity_dict["GPE"]:
                    relations.append((person, "来自", gpe))
        if entity_dict.get("ORG") and entity_dict.get("GPE"):
            for organization in entity_dict["ORG"]:
                for gpe in entity_dict["GPE"]:
                    relations.append((organization, "位于", gpe))
        if entity_dict.get("PRODUCT") and entity_dict.get("ORG"):
            for product in entity_dict["PRODUCT"]:
                for organization in entity_dict["ORG"]:
                    relations.append((product, "由", organization))
        if entity_dict.get("PRODUCT") and entity_dict.get("PER"):
            for product in entity_dict["PRODUCT"]:
                for person in entity_dict["PER"]:
                    relations.append((product, "由", person))
        return relations

    relations = extract_relations(entity_dict)


    return jsonify({'entities': entity_dict, 'relations': relations})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5555)