from rdflib import Graph
import networkx as nx
from networkx.readwrite import gexf

# 加载 .ttl 文件
g = Graph()
g.parse("output.ttl", format="turtle")

# 创建 NetworkX 图
nx_graph = nx.Graph()

# 遍历 RDF 三元组，构建图
for s, p, o in g:
    nx_graph.add_edge(s, o, label=p)

# 保存为 GEXF 文件
gexf.write_gexf(nx_graph, "output.gexf")