"""Searches through SerpApi's MCP server, always as Markdown."""
import asyncio, os, threading, time
from concurrent.futures import Future
from functools import cache
from dotenv import load_dotenv
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

load_dotenv()
SERPAPI_MCP = "https://mcp.serpapi.com/mcp"
HEADERS = {"Authorization": f"Bearer {os.environ['SERPAPI_API_KEY']}"}

# Only the top 5 results with the fields Qwen needs, plus SerpApi's error when a search finds nothing.
# google_light is the server's default engine.
RESTRICTORS = {
    "google_light": "answer_box,organic_results[0:5].{title,link,snippet,date},error",
    "google": "answer_box,organic_results[0:5].{title,link,snippet,date},error",
    "google_news": "news_results[0:5].{title,link,source.name,date},error",
    "baidu": "answer_box,organic_results[0:5].{title,link,snippet},error",
    "naver": "web_results[0:5].{title,link,snippet},error",
}
LOCALE_HINT = ('\n\nFor google, google_light and google_news, set gl (country) and hl (language) to match the question, '
               'such as "gl": "kr", "hl": "ko" for Korean or "gl": "cn", "hl": "zh-cn" for Chinese. '
               'Without them, Google searches in US English, and google_news often finds nothing, '
               'or only English news, for other languages.')

# The MCP SDK is async and chat.ask isn't, so one session stays open in a background event loop.
loop = asyncio.new_event_loop()
threading.Thread(target=loop.run_forever, daemon=True).start()

async def open_session(ready):
    async with streamablehttp_client(SERPAPI_MCP, headers=HEADERS) as (read, write, _):
        async with ClientSession(read, write) as session:
            await session.initialize()
            ready.set_result(session)
            await asyncio.Event().wait()  # wait forever, so the session stays open

@cache
def session():
    ready = Future()
    asyncio.run_coroutine_threadsafe(open_session(ready), loop)
    return ready.result(timeout=60)

def run(coroutine):
    return asyncio.run_coroutine_threadsafe(coroutine, loop).result(timeout=120)

@cache
def mcp_tools():
    search = next(tool for tool in run(session().list_tools()).tools if tool.name == "search")
    return [{"type": "function", "function": {"name": "search", "description": search.description + LOCALE_HINT,
                                              "parameters": search.inputSchema}}]

def with_markdown(args, top5):
    """Qwen's search arguments with Markdown output (and our top-5 restrictor, with top5), the engine,
    and the step fields to record."""
    params = args["params"]
    engine = params.get("engine", "google_light")
    sent = {**params, "output": "md"}
    if top5 and engine in RESTRICTORS:
        sent["json_restrictor"] = RESTRICTORS[engine]
    return {**args, "params": sent}, engine, {"query": params.get("q") or params.get("query"), "params": params}

def mcp_call(args, top5=True):
    sent, engine, fields = with_markdown(args, top5)
    start = time.time()
    try:
        result = run(session().call_tool("search", sent))
        text, failed = result.content[0].text, result.isError
    except Exception as e:
        text, failed = f"Search failed: {type(e).__name__}", True
    return fields, {"engine": engine, "format": "error" if failed else "markdown", "text": text,
                    "seconds": round(time.time() - start, 2)}
