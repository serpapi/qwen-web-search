import json, os, time, requests

# SearXNG mixes many engines, so Qwen's engine choice becomes a category or language hint.
HINTS = {"google_news": {"categories": "news"}, "baidu": {"language": "zh-CN"}, "naver": {"language": "ko"}}

def searxng_search(engine, query):
    params = {"q": query, "format": "json", **HINTS.get(engine, {})}

    start = time.time()
    resp = requests.get(f"{os.environ['SEARXNG_URL']}/search", params=params, timeout=30)
    resp.raise_for_status()
    results = resp.json().get("results", [])[:5]  # same top 5 as SerpApi, passed as returned
    upstream = sorted({name for result in results for name in result.get("engines", [])})
    return {
        "engine": f"searxng ({', '.join(upstream) or 'no results'})",  # engines that supplied the results
        "format": "json",
        "text": json.dumps(results, ensure_ascii=False),
        "seconds": round(time.time() - start, 2),
    }
