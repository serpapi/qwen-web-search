import json, sys, time
import yaml
from setups import SETUPS

RUNS = 1

setups = sys.argv[1:] or list(SETUPS)  # python bench.py none serpapi-md
questions = yaml.safe_load(open("questions.yaml", encoding="utf-8"))

with open("results.jsonl", "a", encoding="utf-8") as out:
    for q in questions:
        for setup in setups:
            for run in range(1, RUNS + 1):
                print(f"\n{q['id']} | {setup} | run {run}: {q['prompt']}")
                start = time.time()
                try:
                    *_, result = SETUPS[setup](q["prompt"])  # the last event is the answer
                except Exception as e:
                    result = {"answer": "", "searches": [], "error": str(e)}
                correct = any(a.lower() in (result["answer"] or "").lower() for a in q["accept"])
                print(f"  -> {[s['tool'] for s in result['searches']]} | correct: {correct}")
                row = {"setup": setup, "question": q["id"], "run": run, **result,
                       "total_seconds": round(time.time() - start, 1), "correct": correct}
                out.write(json.dumps(row, ensure_ascii=False) + "\n")
                out.flush()
