import json, os, time
import serpapi
from dotenv import load_dotenv

load_dotenv()  # chat.py imports this module before it loads .env itself
serpapi_client = serpapi.Client(api_key=os.environ["SERPAPI_API_KEY"], timeout=60)

# Top 5 results per engine, trimmed to the fields Qwen needs. Used for both formats.
RESTRICTORS = {
    "google": "answer_box,organic_results[0:5].{title,link,snippet,date}",
    "google_news": "news_results[0:5].{title,link,source.name,date}",
    "baidu": "answer_box,organic_results[0:5].{title,link,snippet}",
    "naver": "web_results[0:5].{title,link,snippet}",
}

def serpapi_search(engine, query, fmt="md"):
    params = {"engine": engine, "query" if engine == "naver" else "q": query, "json_restrictor": RESTRICTORS[engine]}
    if fmt == "md":
        params["output"] = "md"  # Markdown instead of JSON

    start = time.time()
    results = serpapi_client.search(params)  # Markdown text, or parsed JSON
    if fmt != "md":
        results = json.dumps(results.as_dict(), indent=2, ensure_ascii=False)  # byte-for-byte the JSON SerpApi sent
    return {
        "engine": engine,
        "format": "markdown" if fmt == "md" else "json",
        "text": results,
        "seconds": round(time.time() - start, 2),
    }
