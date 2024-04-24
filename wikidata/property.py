import requests
import json
from pyArango.connection import *


conn = Connection(arangoURL="http://127.0.0.1:8529",
                  username="root", password="root")
arangodb = conn["kgms"]
property = arangodb["property"]

response = requests.post('http://localhost:3000/api/properties/10000/1')
print(response)

properties = json.loads(response.text)
for p in properties['list']:
    print(p)
    # 获取头部实体
    query = {"filter": [{"field": "id", "value":  p['id'],
                         "relation": "properties", "operation": "="}]}

    headers = {
        "X-Member-Id": "23832170000",
        "X-Region": "1100000",
        "X-Channel": "01",
        "Content-Type": "application/json;charset=UTF-8"
    }

    schemas_response = requests.post(
        'http://localhost:3000/api/schemas/1/1', headers=headers, data=json.dumps(query)),

    schemas = json.loads(schemas_response[0].text)
    # 获取尾部部实体
   # 获取头部实体
    query = {"filter": [{"field": "id", "value": p['id'],
                         "relation": "values", "operation": "="}]}
    headers = {
        "X-Member-Id": "23832170000",
        "X-Region": "1100000",
        "X-Channel": "01",
        "Content-Type": "application/json;charset=UTF-8"
    }
    values_response = requests.post(
        'http://localhost:3000/api/schemas/1/1', headers=headers, data=json.dumps(query)),

    values = json.loads(values_response[0].text)
    prop = property['P' + str(p['id'])]
    prop['name'] = p['name']
    prop['enName'] = p['enName']
    prop['description'] = p['description']
    prop['enDescription'] = p['enDescription']
    if (schemas['list']):
        prop['head'] = schemas['list'][0]['label']
    if (values['list']):
        prop['tail'] = values['list'][0]['label']
    prop.save()

    # r = requests.post('http://localhost:3000/api/properties', data=p)
    # print(r)
