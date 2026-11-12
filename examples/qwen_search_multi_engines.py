"""qwen_search.py with four engines: Qwen passes the SerpApi engine that fits each search."""
import json, os
from datetime import date
import serpapi
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()  # reads SERPAPI_API_KEY and LOCAL_MODEL from .env
serpapi_client = serpapi.Client(api_key=os.environ["SERPAPI_API_KEY"], timeout=60)
qwen = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")  # Ollama's OpenAI-compatible API
MODEL = os.environ.get("LOCAL_MODEL") or "qwen3.8:27b"  # set LOCAL_MODEL in .env to use another model
MAX_ROUNDS = 4  # calls to Qwen per question; the last one must answer

# Top 5 results per engine, with only the fields the model needs.
RESTRICTORS = {
    "google": "answer_box,organic_results[0:5].{title,link,snippet,date}",
    "google_news": "news_results[0:5].{title,link,source.name,date}",
    "baidu": "answer_box,organic_results[0:5].{title,link,snippet}",
    "naver": "web_results[0:5].{title,link,snippet}",
}

def serpapi_search(engine, query):
    """Searches one SerpApi engine and returns the top 5 results as Markdown."""
    query_key = "query" if engine == "naver" else "q"  # Naver calls its query parameter "query"
    return serpapi_client.search({
        "engine": engine,
        query_key: query,
        "json_restrictor": RESTRICTORS[engine],
        "output": "md",
    })

SYSTEM = f"""You are a helpful assistant. Today's date is {date.today()}.
- If you don't know something or can't confirm it, say so instead of guessing.
- Cite the sources you used as Markdown links.
- Reply in the user's language, and keep it concise."""
LAST_ROUND = "That was your last search. Answer now with the results you have."

TOOLS = [{"type": "function", "function": {
    "name": "serpapi_search",
    "description": "Search the web with SerpApi. Returns the top 5 results with titles, links, snippets and dates.",
    "parameters": {
        "type": "object",
        "properties": {
            "engine": {
                "type": "string",
                "enum": list(RESTRICTORS),  # the SerpApi engines Qwen can choose from
                "description": "google: Google web search. "
                               "google_news: Google News, recent news articles. "
                               "baidu: China's main search engine, Chinese-language web. "
                               "naver: South Korea's main search engine, Korean-language web.",
            },
            "query": {"type": "string", "description": "A short, specific search query."},
        },
        "required": ["engine", "query"],
    },
}}]

def ask(question):
    """Lets Qwen search until it can answer, in at most MAX_ROUNDS calls."""
    messages = [{"role": "system", "content": SYSTEM}, {"role": "user", "content": question}]
    for round_number in range(1, MAX_ROUNDS + 1):
        tools = TOOLS
        if round_number == MAX_ROUNDS:  # Qwen is still searching: take the tool away and make it answer
            tools = []
            messages.append({"role": "user", "content": LAST_ROUND})
        reply = qwen.chat.completions.create(model=MODEL, messages=messages, tools=tools).choices[0].message
        if not reply.tool_calls:
            return reply.content  # no search requested, so this is the answer
        messages.append(reply.model_dump(exclude_none=True))  # keep Qwen's search request in the conversation
        for call in reply.tool_calls:  # Qwen can ask for several searches at once, on different engines
            args = json.loads(call.function.arguments)  # the engine and query Qwen chose
            print(f"  [search] {args['engine']}: {args['query']}")
            results = serpapi_search(args["engine"], args["query"])
            messages.append({"role": "tool", "tool_call_id": call.id, "content": results})

if __name__ == "__main__":
    while True:
        print("\nQwen:", ask(input("\nYou: ")))
