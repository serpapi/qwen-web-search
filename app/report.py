"""Prints one benchmark test's tables from results.jsonl as Markdown: python report.py models"""
import json, sys
from collections import Counter
from statistics import mean
import yaml

test = sys.argv[1]
questions = {q["id"]: q for q in yaml.safe_load(open(f"questions/{test}.yaml", encoding="utf-8"))}
rows = [r for r in map(json.loads, open("results.jsonl", encoding="utf-8")) if r.get("test") == test]
columns = list(dict.fromkeys((r["model"], r["setup"]) for r in rows))  # in the order bench.py ran them
headers = [f"{model} · {setup}" for model, setup in columns]
MARK = {True: "✓", "partial": "~", False: "✗"}  # "partial" is set by hand after review

def avg(values):
    return round(mean(values), 1) if values else "-"

def table(header, lines):
    print("\n| " + " | ".join(header) + " |\n" + "|---" * len(header) + "|")
    for line in lines:
        print("| " + " | ".join(map(str, line)) + " |")

def of(column, qids=questions):
    return [r for r in rows if (r["model"], r["setup"]) == column and r["question"] in qids]

def summary(column):
    rs = of(column)
    grades = Counter(r["correct"] for r in rs)
    searches = [s for r in rs for s in r["searches"]]
    ok = [s for s in searches if s["format"] != "error"]
    searched = [r for r in rs if r["grounded"] is not None]
    return [*column, grades[True], grades["partial"], grades[False], sum("error" in r for r in rs),
            avg([len(r["searches"]) for r in rs]), f"{sum(r['grounded'] for r in searched)}/{len(searched)}",
            len(searches) - len(ok), avg([s["tokens"] for s in ok]), avg([r["total_seconds"] for r in rs]),
            avg([r.get("completion_tokens", 0) for r in rs])]

table(["Model", "Setup", "Correct", "Partly", "Wrong", "Errors", "Searches per question", "Answer in results",
       "Failed searches", "Tokens per search", "Answer s", "Completion tokens"], map(summary, columns))

for field in ("language", "category", "difficulty", "hop"):  # correct answers per group, for each model and setup
    groups = list(dict.fromkeys(q[field] for q in questions.values()))
    lines = []
    for group in groups:
        qids = {i for i, q in questions.items() if q[field] == group}
        lines.append([group] + [f"{sum(r['correct'] is True for r in of(c, qids))}/{len(of(c, qids))}" for c in columns])
    table([field.capitalize()] + headers, lines)

table(["Question", "Category", "Prompt"] + headers,
      [[i, q["category"], q["prompt"][:50]] + ["".join(MARK[r["correct"]] for r in of(c, {i})) or "–" for c in columns]
       for i, q in questions.items()])

failures = Counter((r["failure"], (r["model"], r["setup"])) for r in rows if r.get("failure"))  # set by hand review
if failures:
    kinds = sorted({kind for kind, _ in failures}, key=lambda kind: -sum(n for (k, _), n in failures.items() if k == kind))
    table(["Why it wasn't correct"] + headers, [[kind] + [failures[kind, c] for c in columns] for kind in kinds])

engines = Counter((questions[r["question"]]["language"], r["model"], s["tool"]) for r in rows for s in r["searches"])
table(["Language", "Model", "Search Qwen chose", "Searches"], [[*key, n] for key, n in sorted(engines.items())])
