Angular 和 Nestjs 构建的开源后台管理系统，基于 @ng-nest/ui 组件库


npm run start

docker build -t api .

docker run --name api --restart=always -d -p 3333:3000 api


docker build -t ui .


docker run --name ui  --restart=always -d -p 80:80 ui

docker-compose up -d


ng build --configuration production

ng serve --proxy-config proxy.conf.json


wikidata数据dump到arangodb的方法

第一步：下载wikidata全量数据压缩包
第二步：使用python脚本提取实体到entity.json，提取属性信息到statement.json
第三步：通过arangodb导入json的命令将数据导入到库中

arangoimport --threads 4  --server.endpoint tcp://127.0.0.1:8529 --server.username root --server.password root --server.database kgms --file "\mnt\entity.json" --type json --collection "entity" --batch-size 33554432
arangoimport --threads 4  --server.endpoint tcp://127.0.0.1:8529 --server.username root --server.password root --server.database kgms --file "\mnt\link.json" --type json --collection "link" --batch-size 33554432





arangodb初始化库方法

第一步：创建数据库
第二部：创建数据表
第三步：创建图
第四步：创建视图





需求：批量筛选实体列表导出属性到excel

1. 筛选实体
方法一：通过关键词检索entity表
方法二：通过属性和值筛选link表
结果，返回实体id数组

[ "Q22099965","Q21040218"]

2. 配置属性
通过多个实体id获取属性并集，勾选需要导出的属性

RETURN UNIQUE(FOR l IN link
FILTER l['_from'] IN ["entity/Q22099965","entity/Q21040218"]
RETURN l.mainsnak.property)


[
    "P31",
    "P569",
    "P106",
    "P21",
    "P39",
    "P69",
    "P734",
    "P102",
    "P3373",
    "P27",
    "P19"
]

3. 转换到excel



FOR l IN link
FILTER l['_from'] IN ["entity/Q22099965","entity/Q21040218"]
FILTER l.mainsnak.property IN [
    "P31",
    "P569",
    "P106",
    "P21",
    "P39",
    "P69",
    "P734",
    "P102",
    "P3373",
    "P27",
    "P19"
]

COLLECT id=l['_from']  INTO groups

LET gs = (
    FOR g IN groups
    LET value = g.l.mainsnak.datavalue.type=='wikibase-entityid' ? g.l.mainsnak.datavalue.value.id : (g.l.mainsnak.datavalue.type=='time' ? g.l.mainsnak.datavalue.value.time : g.l.mainsnak.datavalue.value)
    RETURN {[g.l.mainsnak.property]: value}
)


RETURN MERGE(gs)


总结

let items = ["entity/Q22099965","entity/Q21040218","entity/Q21040220"]

let properties = (RETURN UNIQUE(FOR l IN link FILTER l['_from'] IN items RETURN {id:l.mainsnak.property, label:DOCUMENT(CONCAT('entity/',l.mainsnak.property))['labels']['zh']['value']}))[0]

FOR i in items
let values = (FOR p in properties LET value = (FOR l IN link FILTER l['_from'] == i AND l.mainsnak.property==p.id RETURN l.mainsnak.datavalue) RETURN value[0]['type']=='wikibase-entityid'? TO_ARRAY(DOCUMENT(CONCAT('entity/',value[0]['value']['id']))['labels']['zh']['value']): value[0]['type']=='time'?value[0]['value']['time']:value)

RETURN ZIP(UNION(['ID', '标签', '描述', '别名'],properties[*].label), UNION( [DOCUMENT(i)['_key'], TO_ARRAY(DOCUMENT(i).labels.zh.value), TO_ARRAY(DOCUMENT(i).descriptions.zh.value), DOCUMENT(i).aliases.zh[*].value],values))



实体

1. 模糊搜索
提供通过关键词搜索实体目标的标签、描述、别名信息
要求：不区分大小写、不区分繁简

FOR doc IN entity_view
SEARCH LIKE(doc.labels.zh.value, TOKENS(@keyword, "en")[0])
OR LIKE(doc.labels.zh.value, TOKENS(@keyword, "norm_en")[0])
OR LIKE(doc.labels.en.value, TOKENS(@keyword, "en")[0])
OR LIKE(doc.labels.en.value, TOKENS(@keyword, "norm_en")[0])
OR LIKE(doc.descriptions.zh.value, TOKENS(@keyword, "en")[0])
OR LIKE(doc.descriptions.zh.value, TOKENS(@keyword, "norm_en")[0])
OR LIKE(doc.descriptions.en.value, TOKENS(@keyword, "en")[0])
OR LIKE(doc.descriptions.en.value, TOKENS(@keyword, "norm_en")[0])
OR LIKE(doc.aliases.zh.value, TOKENS(@keyword, "en")[0])
OR LIKE(doc.aliases.zh.value, TOKENS(@keyword, "norm_en")[0])
OR LIKE(doc.aliases.en.value, TOKENS(@keyword, "en")[0])
OR LIKE(doc.aliases.ne.value, TOKENS(@keyword, "norm_en")[0])
SORT LENGTH(doc.labels)+LENGTH(doc.descriptions)+LENGTH(doc.aliases) DESC
LIMIT 100
RETURN {
    title: doc.labels.zh.value,
    description: doc.descriptions.zh.value,
    title_en: doc.labels.en.value,
    description_en: doc.descriptions.en.value,
    aliases:  doc.aliases.zh,
    aliases_en:  doc.aliases.en,
}
  


值

1. 查询年龄等于80的人物

分析：首先筛选属性值是数量类型且值等于80的边，在筛选属性是年龄


FOR document IN link
FILTER document.mainsnak.property=='P2044'
FILTER document.mainsnak.datatype=='quantity'
FILTER document.mainsnak.datavalue.value.amount=='+20'
LIMIT 10
RETURN {id: document['_from'], property: document.mainsnak.property,document:document.mainsnak.datavalue.value}





FOR doc IN entity 
FILTER doc.labels
LIMIT 100
RETURN {id:doc['_key'], label: doc.labels.zh.value}


FOR e IN entity
FILTER e['_key']==@id
RETURN e


FOR v, e, p IN 0..1 OUTBOUND @id GRAPH "graph"
FILTER e!=null
SORT e.mainsnak.property
LIMIT 0, 10
RETURN e


FOR l IN link
FILTER l.mainsnak.datatype=='globe-coordinate'
SORT  GEO_DISTANCE([l.mainsnak.datavalue.value.latitude, l.mainsnak.datavalue.value.longitude], GEO_POINT(74,40)) ASC
LIMIT 100
RETURN {l:DOCUMENT('entity',l['_from']).labels.zh.value, loc: [l.mainsnak.datavalue.value.latitude, l.mainsnak.datavalue.value.longitude]}


FOR document IN FULLTEXT(link, 'mainsnak.datavalue.value', '123') 
FILTER document.mainsnak.datavalue.type=='string'
RETURN {id: document['_from'], property: document.mainsnak.property,document:document.mainsnak.datavalue.value}


FOR doc IN entity OPTIONS { indexHint: "idx_1778095045005541376", forceIndexHint: true }
FILTER LIKE(doc.labels.zh.value, TOKENS("b", "norm_en")[0])
RETURN doc.labels.zh



SEARCH doc.labels.zh.value LIKE @keyword
OR doc.labels.en.value LIKE @keyword
OR doc.descriptions.zh.value LIKE @keyword
OR doc.descriptions.en.value LIKE @keyword
OR doc.aliases.zh.value LIKE @keyword
OR doc.aliases.en.value LIKE @keyword


检索并导出


let langulage = 'zh'

let items = (FOR doc IN entity_view
SEARCH LIKE(doc.labels.zh.value, TOKENS(@keyword, "en")[0])
OR LIKE(doc.labels.zh.value, TOKENS(@keyword, "norm_en")[0])
OR LIKE(doc.labels.en.value, TOKENS(@keyword, "en")[0])
OR LIKE(doc.labels.en.value, TOKENS(@keyword, "norm_en")[0])
OR LIKE(doc.descriptions.zh.value, TOKENS(@keyword, "en")[0])
OR LIKE(doc.descriptions.zh.value, TOKENS(@keyword, "norm_en")[0])
OR LIKE(doc.descriptions.en.value, TOKENS(@keyword, "en")[0])
OR LIKE(doc.descriptions.en.value, TOKENS(@keyword, "norm_en")[0])
OR LIKE(doc.aliases.zh.value, TOKENS(@keyword, "en")[0])
OR LIKE(doc.aliases.zh.value, TOKENS(@keyword, "norm_en")[0])
OR LIKE(doc.aliases.en.value, TOKENS(@keyword, "en")[0])
OR LIKE(doc.aliases.ne.value, TOKENS(@keyword, "norm_en")[0])
SORT LENGTH(doc.labels) DESC
LIMIT 10
RETURN doc['_id'])
  

let properties = (RETURN UNIQUE(FOR l IN link FILTER l['_from'] IN items RETURN {id:l.mainsnak.property, label:DOCUMENT(CONCAT('entity/',l.mainsnak.property))['labels'][langulage]['value']}))[0]

FOR i in items
let values = (FOR p in properties LET value = (FOR l IN link FILTER l['_from'] == i AND l.mainsnak.property==p.id RETURN l.mainsnak.datavalue) RETURN value[0]['type']=='wikibase-entityid'? TO_ARRAY(DOCUMENT(CONCAT('entity/',value[0]['value']['id']))['labels'][langulage]['value']): value[0]['type']=='time'?TO_ARRAY(value[0]['value']['time']):value[0]['type']=='string'? TO_ARRAY(value[0]['value']): value[0]['type']=='quantity'?TO_ARRAY(value[*]['value']['amount']):value)

RETURN ZIP(UNION(['ID', '标签', '描述', '别名'],properties[*].label), UNION( [TO_ARRAY(DOCUMENT(i)['_key']), TO_ARRAY(DOCUMENT(i).labels[langulage].value), TO_ARRAY(DOCUMENT(i).descriptions[langulage].value), DOCUMENT(i).aliases[langulage][*].value],values))