"""A local Qwen model with Qwen-Agent, searching the web through SerpApi's MCP server.
Needs: pip install "qwen-agent[mcp]" soundfile"""
import json, os
from datetime import date
from dotenv import load_dotenv
from qwen_agent.agents import Assistant
from qwen_agent.log import logger

load_dotenv()
logger.setLevel("WARNING")
MODEL = os.environ.get("LOCAL_MODEL") or "qwen3.8:27b"

# Only the top 5 results with the fields Qwen needs, plus SerpApi's error when a search finds nothing.
# google_light is the server's default engine.
RESTRICTORS = {
    "google_light": "answer_box,organic_results[0:5].{title,link,snippet,date},error",
    "google": "answer_box,organic_results[0:5].{title,link,snippet,date},error",
    "google_news": "news_results[0:5].{title,link,source.name,date},error",
    "baidu": "answer_box,organic_results[0:5].{title,link,snippet},error",
    "naver": "web_results[0:5].{title,link,snippet},error",
}
LOCALE_HINT = ("\n\nFor google, google_light and google_news, set gl (country) and hl (language) to match the question, "
               "such as gl: kr, hl: ko for a Korean question. Without them, Google searches in US English, "
               "and google_news often finds nothing in other languages.")

SYSTEM = f"""You are a helpful assistant. Today's date is {date.today()}.
- If you don't know something or can't confirm it, say so instead of guessing.
- Cite the sources you used as Markdown links.
- Reply in the user's language, and keep it concise."""

class SerpApiAssistant(Assistant):
    def _call_tool(self, tool_name, tool_args="{}", **kwargs):  # Qwen-Agent calls this for every tool call
        args = json.loads(tool_args)
        params = args["params"]
        print(f"  [search] {params}")
        engine = params.get("engine", "google_light")
        params["output"] = "md"
        if engine in RESTRICTORS:
            params["json_restrictor"] = RESTRICTORS[engine]
        return super()._call_tool(tool_name, json.dumps(args), **kwargs)

bot = SerpApiAssistant(
    llm={"model": MODEL, "model_server": "http://localhost:11434/v1", "api_key": "ollama",
         "generate_cfg": {"use_raw_api": True}},  # Ollama's tool calling instead of Qwen-Agent's tool prompt
    system_message=SYSTEM,
    function_list=[{"mcpServers": {"serpapi": {
        "type": "streamable-http",
        "url": "https://mcp.serpapi.com/mcp",
        "headers": {"Authorization": f"Bearer {os.environ['SERPAPI_API_KEY']}"},
    }}}],
)
bot.function_map = {"serpapi-search": bot.function_map["serpapi-search"]}  # Qwen-Agent adds all the server's tools
bot.function_map["serpapi-search"].description += LOCALE_HINT

if __name__ == "__main__":
    messages = []
    while True:
        messages.append({"role": "user", "content": input("\nYou: ")})
        *_, response = bot.run(messages)  # run() yields the response as it grows; the last one is complete
        messages.extend(response)
        print("\nQwen:", response[-1]["content"])
