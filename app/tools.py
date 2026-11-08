from datetime import date
from serpapi_search import RESTRICTORS

SYSTEM = f"You are a helpful assistant. Assist the user an expert."
SEARCH_SYSTEM = SYSTEM + " Use the search tools for anything that may have changed."
LAST_ROUND = "That was your last search. Answer now with the results you have."

# Google only, like examples/qwen_search.py.
GOOGLE_TOOLS = [{"type": "function", "function": {
    "name": "google_search",
    "description": "Web search for current information. Returns the top 5 results with titles, links, snippets and dates.",
    "parameters": {
        "type": "object",
        "properties": {"query": {"type": "string", "description": "A short, specific search query."}},
        "required": ["query"],
    },
}}]

# Qwen passes the SerpApi engine that fits each search, like examples/qwen_search_multi_engines.py.
SERPAPI_TOOLS = [{"type": "function", "function": {
    "name": "serpapi_search",
    "description": "Search the web with SerpApi. Returns the top 5 results with titles, links, snippets and dates.",
    "parameters": {
        "type": "object",
        "properties": {
            "engine": {
                "type": "string",
                "enum": list(RESTRICTORS),  # the SerpApi engines Qwen can choose from
                "description": "google: Google web search. google_news: Google News, recent news articles. "
                               "baidu: China's main search engine, Chinese-language web. "
                               "naver: South Korea's main search engine, Korean-language web.",
            },
            "query": {"type": "string", "description": "A short, specific search query."},
        },
        "required": ["engine", "query"],
    },
}}]
