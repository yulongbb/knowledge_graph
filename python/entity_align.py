import re
import jieba
from sentence_transformers import SentenceTransformer, util
from Levenshtein import ratio as levenshtein_ratio

# 加载本地模型
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# 示例数据：两个数据源的实体列表
data_source_A = [
    {
        "type": "2baf9211-0ba2-4735-8d38-5f1ec19ac3b9",
        "labels": {"zh": {"language": "zh", "value": "Ar 196"}},
        "descriptions": {"zh": {"language": "zh", "value": "Ar196是一种由德国阿拉多飞机制造厂设计生产的舰载型水上侦察机。"}},
        "aliases": {"zh": [{"language": "zh", "value": "Ar 196"}, {"language": "zh", "value": "Ar 196水上侦察机"}]},
        "tags": ["德国", "侦察机"],
        "modified": "2024-12-27T09:09:40.985Z",
        "items": ["entity/53588464"],
        "images": ["https://img4.utuku.china.com//weapon/130002605/20190724/4f0842862141bc591200f882f053e91b.jpg"]
    }
]

data_source_B = [
    {
        "type": "3caf9211-0ba2-4735-8d38-5f1ec19ac3b9",
        "labels": {"zh": {"language": "zh", "value": "Ar 196水上飞机"}},
        "descriptions": {"zh": {"language": "zh", "value": "Ar196是纳粹德国海军在二战期间使用的标准舰载水上飞机。"}},
        "aliases": {"zh": [{"language": "zh", "value": "Ar 196"}, {"language": "zh", "value": "Ar196侦察机"}]},
        "tags": ["德国", "水上飞机"],
        "modified": "2024-12-27T09:09:40.985Z",
        "items": ["entity/53588464"],
        "images": ["https://img4.utuku.china.com//weapon/130002605/20190724/4f0842862141bc591200f882f053e91b.jpg"]
    }
]

# 中文分词函数
def chinese_tokenize(text):
    return set(jieba.lcut(text))

# 提取实体的关键信息（名称、描述、别名、标签）
def extract_key_info(entity):
    name = entity["labels"]["zh"]["value"]
    description = entity["descriptions"]["zh"]["value"]
    aliases = [alias["value"] for alias in entity["aliases"]["zh"]]
    tags = entity["tags"]
    return name, description, aliases, tags

# 计算Jaccard系数
def jaccard_similarity(set1, set2):
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    return intersection / union if union != 0 else 0

# 名称相似度计算（结合Jaccard系数和编辑距离）
def calculate_name_similarity(name_A, name_B):
    # 分词
    tokens_A = chinese_tokenize(name_A.lower())
    tokens_B = chinese_tokenize(name_B.lower())
    
    # 计算Jaccard系数
    jaccard_sim = jaccard_similarity(tokens_A, tokens_B)
    
    # 计算编辑距离
    levenshtein_sim = levenshtein_ratio(name_A.lower(), name_B.lower())
    
    # 综合相似度
    return (jaccard_sim + levenshtein_sim) / 2

# 描述相似度计算（使用预训练语言模型）
def calculate_description_similarity(desc_A, desc_B):
    # 计算文本嵌入
    embedding_A = model.encode(desc_A, convert_to_tensor=True)
    embedding_B = model.encode(desc_B, convert_to_tensor=True)
    
    # 计算余弦相似度
    return util.cos_sim(embedding_A, embedding_B).item()

# 别名相似度计算
def calculate_alias_similarity(aliases_A, aliases_B):
    max_sim = 0
    for alias_A in aliases_A:
        for alias_B in aliases_B:
            sim = calculate_name_similarity(alias_A, alias_B)
            if sim > max_sim:
                max_sim = sim
    return max_sim

# 标签相似度计算
def calculate_tag_similarity(tags_A, tags_B):
    return jaccard_similarity(set(tags_A), set(tags_B))

# 实体对齐函数
def entity_alignment(source_A, source_B, name_threshold=0.5, desc_threshold=0.3, alias_threshold=0.5, tag_threshold=0.3):
    aligned_entities = []
    
    for entity_A in source_A:
        for entity_B in source_B:
            # 提取关键信息
            name_A, desc_A, aliases_A, tags_A = extract_key_info(entity_A)
            name_B, desc_B, aliases_B, tags_B = extract_key_info(entity_B)
            
            # 计算名称相似度
            name_sim = calculate_name_similarity(name_A, name_B)
            print(f"名称相似度: {name_sim} (实体A: {name_A}, 实体B: {name_B})")
            
            # 计算描述相似度
            desc_sim = calculate_description_similarity(desc_A, desc_B)
            print(f"描述相似度: {desc_sim} (实体A: {desc_A}, 实体B: {desc_B})")
            
            # 计算别名相似度
            alias_sim = calculate_alias_similarity(aliases_A, aliases_B)
            print(f"别名相似度: {alias_sim} (实体A: {aliases_A}, 实体B: {aliases_B})")
            
            # 计算标签相似度
            tag_sim = calculate_tag_similarity(tags_A, tags_B)
            print(f"标签相似度: {tag_sim} (实体A: {tags_A}, 实体B: {tags_B})")
            
            # 判断是否对齐
            if (name_sim >= name_threshold and desc_sim >= desc_threshold and
                alias_sim >= alias_threshold and tag_sim >= tag_threshold):
                aligned_entities.append((entity_A, entity_B))
    
    return aligned_entities

# 运行实体对齐
aligned_entities = entity_alignment(data_source_A, data_source_B)

# 输出对齐结果
if aligned_entities:
    for pair in aligned_entities:
        print(f"对齐实体：\n- {pair[0]['labels']['zh']['value']} (来自数据源A)\n- {pair[1]['labels']['zh']['value']} (来自数据源B)\n")
else:
    print("没有对齐的实体。")