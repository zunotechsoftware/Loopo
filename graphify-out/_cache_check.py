import json
# pyrefly: ignore [missing-import]
from graphify.cache import check_semantic_cache
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

SPEC_PATH = r"C:\Users\Gowtham S\.gemini\config\skills\graphify\references\extraction-spec.md"

detect = load_json_robust("graphify-out/.graphify_detect.json")
all_files = [f for cat in ("document", "paper", "image") for f in detect["files"].get(cat, [])]

cached_nodes, cached_edges, cached_hyperedges, uncached = check_semantic_cache(all_files, root=".", prompt_file=SPEC_PATH)

if cached_nodes or cached_edges or cached_hyperedges:
    Path("graphify-out/.graphify_cached.json").write_text(
        json.dumps({"nodes": cached_nodes, "edges": cached_edges, "hyperedges": cached_hyperedges}, ensure_ascii=False),
        encoding="utf-8"
    )
else:
    Path("graphify-out/.graphify_cached.json").unlink(missing_ok=True)

Path("graphify-out/.graphify_uncached.txt").write_text("\n".join(uncached), encoding="utf-8")
print("Cache: " + str(len(all_files)-len(uncached)) + " files hit, " + str(len(uncached)) + " files need extraction")
print("Uncached:", uncached[:5])
