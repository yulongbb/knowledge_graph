from flask import Flask, render_template, request, jsonify
from rdflib import Graph

app = Flask(__name__)

# 加载 RDF 数据
g = Graph()
g.parse("output.ttl", format="turtle")

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        # 获取用户输入的 SPARQL 查询
        sparql_query = request.form.get("query")
        
        try:
            # 执行查询
            results = g.query(sparql_query)
            # 将结果转换为列表
            results_list = [row for row in results]
            return render_template("index.html", results=results_list, query=sparql_query)
        except Exception as e:
            # 如果查询出错，返回错误信息
            return render_template("index.html", error=str(e), query=sparql_query)
    
    # 如果是 GET 请求，渲染查询页面
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)