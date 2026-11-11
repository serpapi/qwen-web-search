import json, os
from dotenv import load_dotenv
from openai import OpenAI
from tokenizers import Tokenizer
from models import MODEL, OLLAMA_BASE_URL
from tools import LAST_ROUND, SERPAPI_TOOLS, SYSTEM
from serpapi_search import RESTRICTORS, serpapi_search

load_dotenv()
client = OpenAI(base_url=OLLAMA_BASE_URL, api_key="ollama")
tokenizer = Tokenizer.from_pretrained("Qwen/Qwen3.8-27B")  # count tokens the way Qwen sees them
MAX_ROUNDS = 4

def stream_reply(model, messages, tools, run):
    """Yields Qwen's thinking and text as they stream, then returns the whole reply."""
    reply = {"role": "assistant", "content": "", "reasoning": "", "tool_calls": []}
    with client.chat.completions.create(model=model, messages=messages, tools=tools, stream=True,
                                        stream_options={"include_usage": True}) as stream:
        for chunk in stream:  # if the caller stops reading (Stop in the UI), the stream closes and Ollama stops
            if chunk.usage:
                run["prompt_tokens"] += chunk.usage.prompt_tokens
                run["completion_tokens"] += chunk.usage.completion_tokens
            if not chunk.choices:
                continue
            delta = chunk.choices[0].delta
            if thinking := (delta.model_extra or {}).get("reasoning"):  # Ollama streams Qwen's thinking here
                reply["reasoning"] += thinking
                yield {"thinking": thinking}
            if delta.content:
                reply["content"] += delta.content
                yield {"delta": delta.content}
            for call in delta.tool_calls or []:
                if call.id:  # a new call: Ollama sends each one whole, other servers send the arguments in pieces
                    reply["tool_calls"].append({"id": call.id, "type": "function",
                                                "function": {"name": call.function.name, "arguments": ""}})
                reply["tool_calls"][-1]["function"]["arguments"] += call.function.arguments or ""
    return reply

def search(engine, query, recency):
    """Runs one search, or tells Qwen why it failed so it can carry on."""
    if engine not in RESTRICTORS:  # Ollama doesn't enforce the tool's enum, and Qwen sometimes invents engines
        reason = f"unknown engine {engine!r}; use one of {', '.join(RESTRICTORS)}"
    else:
        try:
            return serpapi_search(engine, query, recency)
        except Exception as e:  # SerpApi's own message, such as "Invalid API key"; never str(e), which has the URL with the api_key
            reason = getattr(e, "error", None) or type(e).__name__
    return {"engine": engine, "format": "error", "text": f"Search failed: {reason}", "seconds": 0}

def ask(question, tools=SERPAPI_TOOLS, history=(), model=MODEL):
    """Yields Qwen's thinking and text as they stream and each search as it happens, then the answer.
    Pass tools=None for no search."""
    messages = [{"role": "system", "content": SYSTEM}, *history, {"role": "user", "content": question}]
    run = {"searches": [], "prompt_tokens": 0, "completion_tokens": 0}
    for round_number in range(1, MAX_ROUNDS + 1):
        last_round = round_number == MAX_ROUNDS
        if last_round:  # Qwen is still searching: make it answer with what it found
            messages.append({"role": "user", "content": LAST_ROUND})
        reply = yield from stream_reply(model, messages, tools if tools and not last_round else [], run)
        if not reply["tool_calls"]:
            yield {"answer": reply["content"], **run}
            return
        messages.append(reply)
        for call in reply["tool_calls"]:
            args = json.loads(call["function"]["arguments"])
            engine, query = args.get("engine", "google"), args["query"]  # google_search has no engine argument
            result = search(engine, query, args.get("recency"))
            step = {"tool": engine, "query": query, "recency": args.get("recency"), "engine": result["engine"], "format": result["format"],
                    "tokens": len(tokenizer.encode(result["text"]).ids), "seconds": result["seconds"]}
            run["searches"].append(step)
            yield {"search": step, "payload": result["text"]}
            messages.append({"role": "tool", "tool_call_id": call["id"], "content": result["text"]})

if __name__ == "__main__":
    while True:
        for event in ask(input("\nYou: ")):
            if s := event.get("search"):
                print(f"  [search] {s['tool']} | {s['tokens']} tokens | {s['seconds']}s | \"{s['query']}\"")
            elif "answer" in event:
                print("\nQwen:", event["answer"])
