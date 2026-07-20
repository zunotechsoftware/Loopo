import sys, json
# pyrefly: ignore [missing-import]
from graphify.build import build_from_json
# pyrefly: ignore [missing-import]
from graphify.cluster import cluster, score_all
# pyrefly: ignore [missing-import]
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
# pyrefly: ignore [missing-import]
from graphify.report import generate
# pyrefly: ignore [missing-import]
from graphify.export import to_json
from pathlib import Path

def load_json_robust(path):
    p = Path(path)
    content = p.read_bytes()
    if content.startswith(b'\xff\xfe') or content.startswith(b'\xfe\xff'):
        return json.loads(content.decode('utf-16'))
    try:
        return json.loads(content.decode('utf-8-sig'))
    except UnicodeDecodeError:
        return json.loads(content.decode('utf-16'))

extraction = load_json_robust("graphify-out/.graphify_extract.json")
detection  = load_json_robust("graphify-out/.graphify_detect.json")

G = build_from_json(extraction, root=".", directed=False)
if G.number_of_nodes() == 0:
    print("ERROR: Graph is empty")
    raise SystemExit(1)
communities = cluster(G)
cohesion = score_all(G, communities)
tokens = {"input": extraction.get("input_tokens", 0), "output": extraction.get("output_tokens", 0)}
gods = god_nodes(G)
surprises = surprising_connections(G, communities)
labels = {cid: "Community " + str(cid) for cid in communities}
questions = suggest_questions(G, communities, labels)

wrote = to_json(G, communities, "graphify-out/graph.json")
if not wrote:
    print("ERROR: refused to shrink graph.json")
    raise SystemExit(1)
report = generate(G, communities, cohesion, labels, gods, surprises, detection, tokens, ".", suggested_questions=questions)
Path("graphify-out/GRAPH_REPORT.md").write_text(report, encoding="utf-8")
analysis = {
    "communities": {str(k): v for k, v in communities.items()},
    "cohesion": {str(k): v for k, v in cohesion.items()},
    "gods": gods,
    "surprises": surprises,
    "questions": questions,
}
Path("graphify-out/.graphify_analysis.json").write_text(json.dumps(analysis, indent=2, ensure_ascii=False), encoding="utf-8")
print("Graph: " + str(G.number_of_nodes()) + " nodes, " + str(G.number_of_edges()) + " edges, " + str(len(communities)) + " communities")
