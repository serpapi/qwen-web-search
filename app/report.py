import json
from collections import Counter, defaultdict
from statistics import mean
import yaml

rows = [json.loads(line) for line in open("results.jsonl", encoding="utf-8")]
category = {q["id"]: q["category"] for q in yaml.safe_load(open("questions.yaml", encoding="utf-8"))}

by_setup = defaultdict(list)
for r in rows:
    by_setup[r["setup"]].append(r)

def avg(values):
    return round(mean(values)) if values else "-"

print("| Setup | Correct | Partly | Wrong | Searches | Failed searches | Errors | Qwen tokens/search | Search s | Answer s | Prompt tokens | Completion tokens |")
print("|---" * 12 + "|")
for setup, rs in by_setup.items():
    grades = Counter(r["correct"] for r in rs)  # true / false, or "partial" after manual review
    searches = [s for r in rs for s in r["searches"]]
    ok = [s for s in searches if s["format"] != "error"]
    print(f"| {setup} | {grades[True]} | {grades['partial']} | {grades[False]} | {len(searches)} "
          f"| {len(searches) - len(ok)} | {sum('error' in r for r in rs)} | {avg([s['tokens'] for s in ok])} "
          f"| {avg([s['seconds'] for s in ok])} | {avg([r['total_seconds'] for r in rs])} "
          f"| {sum(r.get('prompt_tokens', 0) for r in rs)} | {sum(r.get('completion_tokens', 0) for r in rs)} |")

tools = Counter((category[r["question"]], s["tool"]) for r in rows for s in r["searches"])
print("\n| Category | Search Qwen chose | Searches |\n|---|---|---|")
for (cat, tool), n in sorted(tools.items()):
    print(f"| {cat} | {tool} | {n} |")
