import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from Levenshtein import ratio as levenshtein_ratio
from sentence_transformers import SentenceTransformer, util

# 加载预训练语言模型
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# 示例数据：两个数据源的关系列表
data_source_A = [
    {
        "_key": "53584139",
        "_id": "link/53584139",
        "_from": "entity/53584133",
        "_to": "entity/53584133",
        "_rev": "_j-besBe---",
        "mainsnak": {
            "snaktype": "value",
            "property": "生日",
            "datavalue": {"value": "1995.02.27", "type": "string"},
            "datatype": "string"
        },
        "type": "statement",
        "rank": "normal"
    }
]

data_source_B = [
    {
        "_key": "53584140",
        "_id": "link/53584140",
        "_from": "entity/53584133",
        "_to": "entity/53584133",
        "_rev": "_j-besBe---",
        "mainsnak": {
            "snaktype": "value",
            "property": "出生日期",
            "datavalue": {"value": "1995年2月27日", "type": "string"},
            "datatype": "string"
        },
        "type": "statement",
        "rank": "normal"
    }
]

# 提取关系的关键信息（属性、属性值）
def extract_key_info(relation):
    property_id = relation["mainsnak"]["property"]
    value = relation["mainsnak"]["datavalue"]["value"]
    return property_id, value

# 计算Jaccard系数
def jaccard_similarity(set1, set2):
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    return intersection / union if union != 0 else 0

# 计算余弦相似度
def cosine_sim(text1, text2):
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([text1, text2])
    return cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

# 计算语义相似度（使用预训练语言模型）
def calculate_semantic_similarity(text1, text2):
    # 计算文本嵌入
    embedding1 = model.encode(text1, convert_to_tensor=True)
    embedding2 = model.encode(text2, convert_to_tensor=True)
    
    # 计算余弦相似度
    return util.cos_sim(embedding1, embedding2).item()

# 属性相似度计算（结合语义相似度、编辑距离和Jaccard相似度）
def calculate_property_similarity(property_A, property_B):
    # 语义相似度
    semantic_sim = calculate_semantic_similarity(property_A, property_B)
    # 编辑距离相似度
    levenshtein_sim = levenshtein_ratio(property_A, property_B)
    # Jaccard相似度
    set_A = set(property_A)
    set_B = set(property_B)
    jaccard_sim = jaccard_similarity(set_A, set_B)
    
    # 综合相似度（动态调整权重）
    # 权重可以根据实际需求调整
    weight_semantic = 0.5
    weight_levenshtein = 0.3
    weight_jaccard = 0.2
    return (weight_semantic * semantic_sim +
            weight_levenshtein * levenshtein_sim +
            weight_jaccard * jaccard_sim)

# 属性值相似度计算（结合编辑距离和语义相似度）
def calculate_value_similarity(value_A, value_B):
    # 编辑距离
    levenshtein_sim = levenshtein_ratio(value_A, value_B)
    
    # 语义相似度
    semantic_sim = calculate_semantic_similarity(value_A, value_B)
    
    # 综合相似度
    return (levenshtein_sim + semantic_sim) / 2

# 关系对齐函数
def relation_alignment(source_A, source_B, property_threshold=0.6, value_threshold=0.5):
    aligned_relations = []
    
    for relation_A in source_A:
        for relation_B in source_B:
            # 提取关键信息
            property_A, value_A = extract_key_info(relation_A)
            property_B, value_B = extract_key_info(relation_B)
            
            # 属性相似度
            property_sim = calculate_property_similarity(property_A, property_B)
            print(f"属性相似度: {property_sim} (关系A: {property_A}, 关系B: {property_B})")
            
            # 属性值相似度
            value_sim = calculate_value_similarity(value_A, value_B)
            print(f"属性值相似度: {value_sim} (关系A: {value_A}, 关系B: {value_B})")
            
            # 判断是否对齐
            if property_sim >= property_threshold and value_sim >= value_threshold:
                aligned_relations.append((relation_A, relation_B))
    
    return aligned_relations

# 运行关系对齐
aligned_relations = relation_alignment(data_source_A, data_source_B)

# 输出对齐结果
if aligned_relations:
    for pair in aligned_relations:
        print(f"对齐关系：\n- {pair[0]['mainsnak']['property']}: {pair[0]['mainsnak']['datavalue']['value']} (来自数据源A)\n- {pair[1]['mainsnak']['property']}: {pair[1]['mainsnak']['datavalue']['value']} (来自数据源B)\n")
else:
    print("没有对齐的关系。")