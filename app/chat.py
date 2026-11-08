import json, os
from dotenv import load_dotenv
from openai import OpenAI
from tokenizers import Tokenizer
from models import MODEL
from tools import LAST_ROUND, SERPAPI_TOOLS, SYSTEM
from serpapi_search import serpapi_search

load_dotenv()
client = OpenAI(base_url=os.environ["OLLAMA_BASE_URL"], api_key="ollama")
tokenizer = Tokenizer.from_pretrained("Qwen/Qwen3.8-27B")  # count tokens the way Qwen sees them
MAX_ROUNDS = 4

def ask(question, tools=SERPAPI_TOOLS, history=(), model=MODEL):
    """Yields each search as it happens, then the answer. Pass tools=None for no search."""
    messages = [{"role": "system", "content": SYSTEM}, *history, {"role": "user", "content": question}]
    run = {"searches": [], "prompt_tokens": 0, "completion_tokens": 0}
    for round_number in range(1, MAX_ROUNDS + 1):
        last_round = round_number == MAX_ROUNDS
        if last_round:  # Qwen is still searching: make it answer with what it found
            messages.append({"role": "user", "content": LAST_ROUND})
        resp = client.chat.completions.create(model=model, messages=messages,
                                              tools=tools if tools and not last_round else [])
        run["prompt_tokens"] += resp.usage.prompt_tokens
        run["completion_tokens"] += resp.usage.completion_tokens
        reply = resp.choices[0].message
        if not reply.tool_calls:
            yield {"answer": reply.content, **run}
            return
        messages.append(reply.model_dump(exclude_none=True))
        for call in reply.tool_calls:
            args = json.loads(call.function.arguments)
            engine, query = args.get("engine", "google"), args["query"]  # google_search has no engine argument
            try:
                result = serpapi_search(engine, query, args.get("recency"))
            except Exception as e:  # tell Qwen the search failed and let it carry on
                result = {"engine": engine, "format": "error", "text": f"Search failed: {type(e).__name__}", "seconds": 0}
            step = {"tool": engine, "query": query, "recency": args.get("recency"), "engine": result["engine"], "format": result["format"],
                    "tokens": len(tokenizer.encode(result["text"]).ids), "seconds": result["seconds"]}
            run["searches"].append(step)
            yield {"search": step, "payload": result["text"]}
            messages.append({"role": "tool", "tool_call_id": call.id, "content": result["text"]})

if __name__ == "__main__":
    while True:
        for event in ask(input("\nYou: ")):
            if s := event.get("search"):
                print(f"  [search] {s['tool']} | {s['tokens']} tokens | {s['seconds']}s | \"{s['query']}\"")
            else:
                print("\nQwen:", event["answer"])
