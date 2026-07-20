import json
from graphify.cache import save_semantic_cache
from pathlib import Path

SPEC_PATH = r"C:\Users\Gowtham S\.gemini\config\skills\graphify\references\extraction-spec.md"

new = json.loads(Path("graphify-out/.graphify_semantic_new.json").read_text(encoding="utf-8"))
uncached = [line for line in Path("graphify-out/.graphify_uncached.txt").read_text(encoding="utf-8").splitlines() if line]
saved = save_semantic_cache(new.get("nodes", []), new.get("edges", []), new.get("hyperedges", []), root=".", allowed_source_files=uncached, prompt_file=SPEC_PATH)
print("Cached " + str(saved) + " files")

# Merge cached + new into final semantic
cached = json.loads(Path("graphify-out/.graphify_cached.json").read_text(encoding="utf-8")) if Path("graphify-out/.graphify_cached.json").exists() else {"nodes":[],"edges":[],"hyperedges":[]}
all_nodes = cached["nodes"] + new.get("nodes", [])
all_edges = cached["edges"] + new.get("edges", [])
all_hyperedges = cached.get("hyperedges", []) + new.get("hyperedges", [])
seen = set()
deduped = []
for n in all_nodes:
    if n["id"] not in seen:
        seen.add(n["id"])
        deduped.append(n)

merged = {
    "nodes": deduped,
    "edges": all_edges,
    "hyperedges": all_hyperedges,
    "input_tokens": new.get("input_tokens", 0),
    "output_tokens": new.get("output_tokens", 0),
}
Path("graphify-out/.graphify_semantic.json").write_text(json.dumps(merged, indent=2, ensure_ascii=False), encoding="utf-8")
print("Semantic complete: " + str(len(deduped)) + " nodes, " + str(len(all_edges)) + " edges")
