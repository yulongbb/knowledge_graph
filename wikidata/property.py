import requests, json
 
response = requests.get('http://localhost:3000/api/fusion/property/10000/1')
properties = json.loads(response.text)
for p in properties:
    print(p)
    r = requests.post('http://localhost:3000/api/properties', data=p)
    print(r)
