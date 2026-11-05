from datetime import date

SYSTEM = f"You are a helpful assistant. Assist the user an expert."
SEARCH_SYSTEM = SYSTEM + " Use the search tools for anything that may have changed."
LAST_ROUND = "That was your last search. Answer now with the results you have."

def search_tool(engine, description):
    return {"type": "function", "function": {"name": engine, "description": description, "parameters": {
        "type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}}}

# One tool per SerpApi engine. Qwen decides which one fits the question.
TOOLS = [
    search_tool("google", "Google web search."),
    search_tool("google_news", "Google News: recent news articles."),
    search_tool("baidu", "Baidu: China's main search engine, Chinese-language web."),
    search_tool("naver", "Naver: South Korea's main search engine, Korean-language web."),
]
