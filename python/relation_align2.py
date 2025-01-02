from sklearn.cluster import KMeans
from sentence_transformers import SentenceTransformer, util
import numpy as np
from Levenshtein import ratio as levenshtein_ratio

# 加载预训练语言模型
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# 示例数据：属性表
attributes = ["生日", "出生日期", "出生地", "出生时间", "出生年份", "年龄", "年纪", "地址", "地点", "位置"]

# 计算属性向量
def get_attribute_vectors(attributes):
    return model.encode(attributes)

# 基于 K-Means 聚类
def cluster_attributes(attributes, vectors, n_clusters=3):
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    clusters = kmeans.fit_predict(vectors)
    return clusters

# 计算综合相似度（结合语义相似度和编辑距离）
def calculate_similarity(attr1, attr2):
    # 语义相似度
    semantic_sim = util.cos_sim(model.encode(attr1), model.encode(attr2)).item()
    # 编辑距离相似度
    levenshtein_sim = levenshtein_ratio(attr1, attr2)
    # 综合相似度
    return (semantic_sim + levenshtein_sim) / 2

# 相似属性对齐函数
def align_similar_attributes(attributes, similarity_threshold=0.7):
    # 获取属性向量
    vectors = get_attribute_vectors(attributes)
    
    # 聚类
    clusters = cluster_attributes(attributes, vectors, n_clusters=3)
    
    # 对齐结果
    aligned_pairs = []
    
    # 对每个簇进行两两比较
    for cluster_id in set(clusters):
        cluster_attrs = [attr for attr, c in zip(attributes, clusters) if c == cluster_id]
        for i in range(len(cluster_attrs)):
            for j in range(i + 1, len(cluster_attrs)):
                attr1 = cluster_attrs[i]
                attr2 = cluster_attrs[j]
                similarity = calculate_similarity(attr1, attr2)
                if similarity >= similarity_threshold:
                    aligned_pairs.append((attr1, attr2))
    
    return aligned_pairs

# 运行相似属性对齐
aligned_pairs = align_similar_attributes(attributes)

# 输出对齐结果
if aligned_pairs:
    print("对齐关系：")
    for pair in aligned_pairs:
        print(f"- {pair[0]} 和 {pair[1]}")
else:
    print("没有对齐的关系。")