import os, time
import serpapi
from dotenv import load_dotenv

load_dotenv()  # chat.py imports this module before it loads .env itself
serpapi_client = serpapi.Client(api_key=os.environ["SERPAPI_API_KEY"], timeout=60)

# Top 5 results per engine, trimmed to the fields Qwen needs.
RESTRICTORS = {
    "google": "answer_box,organic_results[0:5].{title,link,snippet,date}",
    "google_news": "news_results[0:5].{title,link,source.name,date}",
    "baidu": "answer_box,organic_results[0:5].{title,link,snippet}",
    "naver": "web_results[0:5].{title,link,snippet}",
}

def serpapi_search(engine, query):
    params = {"engine": engine, "query" if engine == "naver" else "q": query,
              "json_restrictor": RESTRICTORS[engine], "output": "md"}  # Markdown uses fewer tokens than JSON
    start = time.time()
    results = serpapi_client.search(params)
    return {
        "engine": engine,
        "format": "markdown",
        "text": results,
        "seconds": round(time.time() - start, 2),
    }
