from pyArango.connection import *
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# 连接到 ArangoDB
conn = Connection(arangoURL="http://127.0.0.1:8529", username="root", password="root")
db = conn["kgms"]

# 定义 RDF 命名空间
namespace = "http://localhost:4200/"

# 转义特殊字符
def escape_quotes(value):
    if isinstance(value, str):
        return value.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
    else:
        return str(value)

# 格式化值
def format_value(datavalue):
    value = datavalue["value"]
    if isinstance(value, (int, float)):
        return f'"{value}"^^xsd:{"integer" if isinstance(value, int) else "double"}'
    elif isinstance(value, str):
        return f'"{escape_quotes(value)}"'
    else:
        return f'"{str(value)}"'

# 预加载实体数据
def preload_entities():
    entity_collection = db["entity"]
    entities = entity_collection.fetchAll()
    # 创建一个字典，以 _key 为键，id 为值
    return {entity["_key"]: entity["id"] for entity in entities}

# 将边转换为 RDF 三元组
def edge_to_rdf(edge, entity_id_map):
    # 提取 _from 和 _to 对应的实体 ID
    from_entity_key = edge["_from"].split('/')[1]
    to_entity_key = edge["_to"].split('/')[1]
    
    from_entity_id = entity_id_map.get(from_entity_key)
    to_entity_id = entity_id_map.get(to_entity_key)
    
    if not from_entity_id or not to_entity_id:
        logging.warning(f"跳过边 {edge['_key']}，因为无法找到对应的实体 ID")
        return None
    
    subject = f"<{namespace}index/entity/info/{from_entity_id}>"
    object = f"<{namespace}index/entity/info/{to_entity_id}>"
    
    # 处理 mainsnak
    if "mainsnak" in edge:
        mainsnak = edge["mainsnak"]
        if "property" in mainsnak and "datavalue" in mainsnak and "value" in mainsnak["datavalue"]:
            # 属性 ID 不带前缀 P
            property_id = mainsnak["property"].replace("P", "") if mainsnak["property"].startswith("P") else mainsnak["property"]
            predicate = f"<{namespace}index/property/info/{property_id}>"
            value = format_value(mainsnak["datavalue"])
            return f"{subject} {predicate} {value} ."
    
    # 如果没有 mainsnak，则使用默认的边类型
    predicate = f"<{namespace}index/property/info/{edge['type']}>" if 'type' in edge else f"<{namespace}index/property/info/link>"
    return f"{subject} {predicate} {object} ."

# 导出边并转换为 RDF
def export_edge_collection_to_rdf(edge_collection_name):
    if edge_collection_name not in db.collections:
        logging.error(f"边集合 '{edge_collection_name}' 不存在！")
        return []
    
    edge_collection = db[edge_collection_name]
    logging.info(f"正在处理边集合：{edge_collection_name}")
    
    # 预加载实体数据
    logging.info("预加载实体数据...")
    entity_id_map = preload_entities()
    logging.info(f"已加载 {len(entity_id_map)} 个实体")
    
    # 获取所有边数据
    edges = edge_collection.fetchAll()
    logging.info(f"获取到 {len(edges)} 条边")
    
    triples = []
    for edge in edges:
        logging.debug(f"处理边：{edge}")
        triple = edge_to_rdf(edge, entity_id_map)
        if triple:
            triples.append(triple)
    return triples

# 示例：导出 "link" 集合（边）
link_triples = export_edge_collection_to_rdf("link")

# 保存为 Turtle 文件
with open("output.ttl", "w", encoding="utf-8") as f:
    f.write(f"@prefix ex: <{namespace}> .\n\n")
    for triple in link_triples:
        f.write(triple + "\n")

logging.info("RDF 数据已导出到 output.ttl")