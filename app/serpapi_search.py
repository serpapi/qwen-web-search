import os, sys, time
import serpapi
from dotenv import load_dotenv

load_dotenv()
if not os.environ.get("SERPAPI_API_KEY"):
    sys.exit("SERPAPI_API_KEY isn't set. Copy .env.example to .env in the repository root and add your SerpApi key.")
serpapi_client = serpapi.Client(api_key=os.environ["SERPAPI_API_KEY"], timeout=60)

# Only the top 5 results, with the fields Qwen needs.
RESTRICTORS = {
    "google": "answer_box,organic_results[0:5].{title,link,snippet,date}",
    "google_news": "news_results[0:5].{title,link,source.name,date}",
    "baidu": "answer_box,organic_results[0:5].{title,link,snippet}",
    "naver": "web_results[0:5].{title,link,snippet}",
}

def serpapi_search(engine, query, recency=None):
    params = {"engine": engine, "query" if engine == "naver" else "q": query,
              "json_restrictor": RESTRICTORS[engine], "output": "md"}
    if recency and engine == "google":  # Google's time filter: qdr:d, qdr:w, qdr:m or qdr:y
        params["tbs"] = "qdr:" + recency[0]
    start = time.time()
    results = serpapi_client.search(params)
    return {"engine": engine, "format": "markdown", "text": results, "seconds": round(time.time() - start, 2)}
