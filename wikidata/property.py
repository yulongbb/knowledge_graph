import requests, json
from pyArango.connection import *


conn = Connection(arangoURL="http://127.0.0.1:8529",
                      username="root", password="root")
arangodb = conn["kgms"]
property = arangodb["property"]

response = requests.post('http://localhost:3000/api/properties/10000/1')
properties = json.loads(response.text)
for p in properties['list']:
    prop = property.createDocument()
    prop['_key'] = 'P'+ str(p['id'])
    prop['name'] = p['name']
    prop['enName'] = p['enName']
    prop['description'] = p['description']
    prop['enDescription'] = p['enDescription']
    prop.save()

    # r = requests.post('http://localhost:3000/api/properties', data=p)
    # print(r)
