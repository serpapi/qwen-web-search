"""Runs one benchmark test on each model and appends one row per answer to results.jsonl."""
import json, os, sys, time
import yaml
from models import load, qwen_models, unload
from setups import SETUPS

RUNS = 1
# Each test asks the questions in questions/<test>.yaml with these setups, each on the first N models (None: all).
TESTS = {
    "models": [("serpapi", None)],  # model vs model
}

test, *names = sys.argv[1:]  # python bench.py models [qwen3.5:9b qwen3.5:4b]
models = names or [m["name"] for m in qwen_models()]  # default: every installed Qwen model, biggest first
setups = TESTS[test]
questions = yaml.safe_load(open(f"questions/{test}.yaml", encoding="utf-8"))
done = set()  # rows already in results.jsonl, so an interrupted run picks up where it stopped
if os.path.exists("results.jsonl"):
    done = {(r["model"], r["setup"], r["question"], r["run"]) for r in map(json.loads, open("results.jsonl", encoding="utf-8"))}

with open("results.jsonl", "a", encoding="utf-8") as out:
    for model in models:
        todo = [(setup, q, run) for setup, first in setups if model in models[:first] for q in questions
                for run in range(1, RUNS + 1) if (model, setup, q["id"], run) not in done]
        if not todo:
            continue
        load(model)  # so the first answer's time doesn't include loading the model
        for setup, q, run in todo:
            print(f"\n{model} | {setup} | {q['id']} | run {run}: {q['prompt']}")
            squash = lambda text: "".join((text or "").lower().split())  # ignore spaces: "168 만 3,000원" is "168만 3,000원"
            found = lambda text: any(squash(a) in squash(text) for a in q["accept"])
            start, payloads = time.time(), []
            try:
                for event in SETUPS[setup](q["prompt"], model=model):
                    if "payload" in event:
                        payloads.append(event["payload"])
                result = event  # the last event is the answer
            except Exception as e:
                result = {"answer": "", "searches": [], "error": str(e)}
            row = {"test": test, "model": model, "setup": setup, "question": q["id"], "run": run, **result,
                   "total_seconds": round(time.time() - start, 1), "correct": found(result["answer"]),
                   "grounded": any(map(found, payloads)) if payloads else None}  # did the results hold the answer?
            print(f"  -> {[s['tool'] for s in result['searches']]} | correct: {row['correct']} | grounded: {row['grounded']}")
            out.write(json.dumps(row, ensure_ascii=False) + "\n")
            out.flush()
        unload(model)  # free its memory before the next model loads
