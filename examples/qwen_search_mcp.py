"""A local Qwen model that searches the web through SerpApi's MCP server."""
import asyncio, json, os
from datetime import date
from dotenv import load_dotenv
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client
from openai import OpenAI

load_dotenv()
qwen = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")  # Ollama
MODEL = os.environ.get("LOCAL_MODEL") or "qwen3.8:27b"
MAX_ROUNDS = 4

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

SYSTEM = f"""You are a helpful assistant. Today's date is {date.today()}.
- If you don't know something or can't confirm it, say so instead of guessing.
- Cite the sources you used as Markdown links.
- Reply in the user's language, and keep it concise."""
LAST_ROUND = "That was your last search. Answer now with the results you have."

async def ask(session, tools, question):
    messages = [{"role": "system", "content": SYSTEM}, {"role": "user", "content": question}]
    for round_number in range(1, MAX_ROUNDS + 1):
        if round_number == MAX_ROUNDS:
            tools = []
            messages.append({"role": "user", "content": LAST_ROUND})
        reply = qwen.chat.completions.create(model=MODEL, messages=messages, tools=tools).choices[0].message
        if not reply.tool_calls:
            return reply.content
        messages.append(reply.model_dump(exclude_none=True))
        for call in reply.tool_calls:
            args = json.loads(call.function.arguments)
            params = args["params"]
            print(f"  [search] {params}")
            engine = params.get("engine", "google_light")
            params["output"] = "md"
            if engine in RESTRICTORS:
                params["json_restrictor"] = RESTRICTORS[engine]
            result = await session.call_tool("search", args)
            messages.append({"role": "tool", "tool_call_id": call.id, "content": result.content[0].text})

async def main():
    headers = {"Authorization": f"Bearer {os.environ['SERPAPI_API_KEY']}"}
    async with streamablehttp_client("https://mcp.serpapi.com/mcp", headers=headers) as (read, write, _):
        async with ClientSession(read, write) as session:
            await session.initialize()
            search = next(tool for tool in (await session.list_tools()).tools if tool.name == "search")
            tools = [{"type": "function", "function": {"name": "search", "description": search.description + LOCALE_HINT,
                                                       "parameters": search.inputSchema}}]
            while True:
                print("\nQwen:", await ask(session, tools, input("\nYou: ")))

if __name__ == "__main__":
    asyncio.run(main())
