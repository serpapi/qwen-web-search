from datetime import date
from serpapi_search import RESTRICTORS

# One prompt for every setup, with or without search, so only the tools differ. It never mentions
# search: when it did, Qwen without tools replied "let me search…" and stopped.
SYSTEM = f"""You are a helpful assistant. Today's date is {date.today()}.
- If you don't know something or can't confirm it, say so instead of guessing.
- Cite the sources you used as Markdown links.
- Reply in the user's language, and keep it concise."""

LAST_ROUND = "That was your last search. Answer now with the results you have."

# Google only, like examples/qwen_search.py.
GOOGLE_TOOLS = [{"type": "function", "function": {
    "name": "google_search",
    "description": "Web search for current information. Returns the top 5 results with titles, links, snippets and dates. "
                   "Snippets are short and can be outdated: check their dates, prefer recent official sources, and "
                   "search again with a more specific query if the results don't fully answer the question.",
    "parameters": {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "A short, specific search query."},
            "recency": {
                "type": "string",
                "enum": ["day", "week", "month", "year"],
                "description": "Optional. Only return results from the past day, week, month or year. "
                               "Use it for news and recent events; leave it out for anything else.",
            },
        },
        "required": ["query"],
    },
}}]

# Qwen passes the SerpApi engine that fits each search, like examples/qwen_search_multi_engines.py.
SERPAPI_TOOLS = [{"type": "function", "function": {
    "name": "serpapi_search",
    "description": "Search the web with SerpApi. Returns the top 5 results with titles, links, snippets and dates. "
                   "Snippets are short and can be outdated: check their dates, prefer recent official sources, and "
                   "search again with a more specific query if the results don't fully answer the question.",
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
            "recency": {
                "type": "string",
                "enum": ["day", "week", "month", "year"],
                "description": "Optional, google only. Only return results from the past day, week, month or year. "
                               "Use it for news and recent events; leave it out for anything else.",
            },
        },
        "required": ["engine", "query"],
    },
}}]
