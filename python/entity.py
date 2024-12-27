from elasticsearch import Elasticsearch

# 连接到 Elasticsearch 数据库
es = Elasticsearch([{'host': '10.117.2.46', 'port': 9200, 'scheme': 'http'}])

# 导出实体标签和 ID 到本地文本文件
def export_entities_to_file():
    query = {
        "size": 10000,
        "query": {
            "match_all": {}
        }
    }
    with open('entities.txt', 'w', encoding='utf-8') as file:
        results = es.search(index="entity", body=query, scroll='2m')
        scroll_id = results['_scroll_id']
        while len(results['hits']['hits']):
            for result in results['hits']['hits']:
                entity_name = result['_source']['labels']['zh']['value']
                entity_id = result['_id']
                file.write(f"{entity_name}\t{entity_id}\n")
            results = es.scroll(scroll_id=scroll_id, scroll='2m')

export_entities_to_file()