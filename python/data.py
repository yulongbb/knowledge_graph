from elasticsearch import Elasticsearch, exceptions
import json

# 连接到 Elasticsearch 数据库
es = Elasticsearch([{'host': '10.117.2.46', 'port': 9200, 'scheme': 'http'}])

def export_entities_to_json():
    query = {
        "size": 10000,
        "query": {
            "match_all": {}
        }
    }

    entities_list = []

    try:
        # 初始化滚动搜索
        results = es.search(index="entity", body=query, scroll='2m')
        scroll_id = results['_scroll_id']
        hits = results['hits']['hits']

        while hits:
            for result in hits:
                entity_name = result['_source'].get('labels', {}).get('zh', {}).get('value', 'N/A')
                entity_id = result['_id']

                # 创建标注数据条目
                if entity_name and len(entity_name) > 0:
                    text = f"{entity_name}是一款商用飞机。"  # 示例句子模板，你可以根据需要调整
                    labels = ["O"] * len(text)

                    # 分配飞行器名称的标签
                    flight_labels = ["B-FLIGHT"]
                    if len(entity_name) > 1:
                        flight_labels.extend(["I-FLIGHT"] * (len(entity_name) - 1))

                    # 将飞行器名称插入到句子中并更新标签
                    start_index = text.find(entity_name)
                    if start_index >= 0:
                        for i, label in zip(range(start_index, start_index + len(entity_name)), flight_labels):
                            labels[i] = label

                    # 构建最终的 JSON 对象
                    entity_entry = {
                        "text": text,
                        "label": labels
                    }
                    entities_list.append(entity_entry)

            # 获取下一批数据
            response = es.scroll(scroll_id=scroll_id, scroll='2m')
            hits = response['hits']['hits']

        # 写入 JSON 文件
        with open('train_data.json', 'w', encoding='utf-8') as file:
            json.dump(entities_list, file, ensure_ascii=False, indent=2)

        print("导出完成.")

    except exceptions.ElasticsearchException as e:
        print(f"发生错误: {e}")
    finally:
        # 清除滚动上下文
        if 'scroll_id' in locals():
            try:
                es.clear_scroll(scroll_id=scroll_id)
            except exceptions.ElasticsearchException as e:
                print(f"清除滚动上下文时发生错误: {e}")

export_entities_to_json()