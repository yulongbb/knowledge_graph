import json
import csv

# 从文件中读取 JSON 数据
with open('data/property.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# 过滤掉 name 为 null 的条目
filtered_data = [item for item in data if item.get("name") is not None]

# 导出为 CSV 文件
with open('output.csv', 'w', encoding='utf-8', newline='') as csvfile:
    # 定义 CSV 文件的列名
    fieldnames = ['_key', 'name']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    # 写入表头
    writer.writeheader()

    # 写入数据
    for item in filtered_data:
        writer.writerow({'_key': item['_key'], 'name': item['name']})

print("CSV 文件已导出：output.csv")