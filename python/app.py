from flask import Flask, request, jsonify
from flask_cors import CORS
import jieba
from transformers import BertTokenizerFast, BertForTokenClassification
import torch
import os

app = Flask(__name__)
CORS(app)  # 启用CORS

# 自动加载dicts文件夹下的所有词典文件
dicts_folder = 'dicts'
for filename in os.listdir(dicts_folder):
    if filename.endswith('.txt'):
        jieba.load_userdict(os.path.join(dicts_folder, filename))

# 加载训练好的模型和分词器
tokenizer = BertTokenizerFast.from_pretrained('./custom-ner-model')
model = BertForTokenClassification.from_pretrained('./custom-ner-model')

# 预处理函数
def preprocess(text):
    words = jieba.lcut(text)
    return words

@app.route('/segment', methods=['POST'])
def segment():
    data = request.json
    text = data['text']
    words = preprocess(text)
    return jsonify({'words': words})

@app.route('/recognize', methods=['POST'])
def recognize():
    data = request.json
    words = data['words']

    # 对文本进行编码
    inputs = tokenizer(words, return_tensors="pt", is_split_into_words=True)

    # 进行预测
    outputs = model(**inputs)
    logits = outputs.logits

    # 获取预测结果
    predictions = torch.argmax(logits, dim=2)

    # 将预测结果转换为实体
    tokens = tokenizer.convert_ids_to_tokens(inputs['input_ids'][0])
    pred_labels = predictions[0].numpy()

    entities = []
    for token, label in zip(tokens, pred_labels):
        if label != 0 and token not in ["[CLS]", "[SEP]"]:  # 0表示非实体，排除特殊标记
            entities.append((token, label))

    # 将实体按类型分类
    entity_dict = {"人名": [], "地名": [], "组织": [], "职位": []}
    current_entity = ""
    current_label = None

    for token, label in entities:
        if label == current_label:
            current_entity += token
        else:
            if current_label == 1:
                entity_dict["人名"].append(current_entity)
            elif current_label == 3:
                entity_dict["地名"].append(current_entity)
            elif current_label == 4:
                entity_dict["组织"].append(current_entity)
            elif current_label == 5:
                entity_dict["职位"].append(current_entity)
            current_entity = token
            current_label = label

    # 添加最后一个实体
    if current_label == 1:
        entity_dict["人名"].append(current_entity)
    elif current_label == 3:
        entity_dict["地名"].append(current_entity)
    elif current_label == 4:
        entity_dict["组织"].append(current_entity)
    elif current_label == 5:
        entity_dict["职位"].append(current_entity)

    return jsonify({'entities': entity_dict})

@app.route('/extract', methods=['POST'])
def extract():
    data = request.json
    entities = data['entities']

    # 改进的关系抽取模型
    def extract_relations(entity_dict):
        relations = []
        if entity_dict["人名"] and entity_dict["地名"]:
            for person in entity_dict["人名"]:
                for location in entity_dict["地名"]:
                    relations.append((person, "在", location))
        if entity_dict["人名"] and entity_dict["组织"]:
            for person in entity_dict["人名"]:
                for organization in entity_dict["组织"]:
                    relations.append((person, "属于", organization))
        if entity_dict["人名"] and entity_dict["职位"]:
            for person in entity_dict["人名"]:
                for position in entity_dict["职位"]:
                    relations.append((person, "担任", position))
        return relations

    relations = extract_relations(entities)

    return jsonify({'relations': relations})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5555)