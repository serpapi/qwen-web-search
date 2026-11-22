"""Qwen-Agent with SerpApi's MCP server, for the benchmark. Needs: pip install "qwen-agent[mcp]" soundfile"""
import json, time
from functools import cache
from qwen_agent.agents import Assistant
from qwen_agent.log import logger
from chat import tokenizer
from mcp_search import HEADERS, LOCALE_HINT, SERPAPI_MCP, with_markdown
from models import MODEL, OLLAMA_BASE_URL
from tools import SYSTEM

logger.setLevel("WARNING")

class SerpApiAssistant(Assistant):
    def _call_tool(self, tool_name, tool_args="{}", **kwargs):
        args, engine, fields = with_markdown(json.loads(tool_args), self.top5)
        start = time.time()
        text = super()._call_tool(tool_name, json.dumps(args, ensure_ascii=False), **kwargs)
        failed = text.startswith(("Error", "An error occurred", "Tool "))  # how the server and Qwen-Agent report errors
        step = {"tool": engine, **fields, "engine": engine, "format": "error" if failed else "markdown",
                "tokens": len(tokenizer.encode(text).ids), "seconds": round(time.time() - start, 2)}
        self.steps.append((step, text))
        return text

@cache
def agent(model, top5):
    bot = SerpApiAssistant(
        llm={"model": model, "model_server": OLLAMA_BASE_URL, "api_key": "ollama",
             "generate_cfg": {"use_raw_api": True}},  # Ollama's tool calling instead of Qwen-Agent's tool prompt
        system_message=SYSTEM,
        function_list=[{"mcpServers": {"serpapi": {"type": "streamable-http", "url": SERPAPI_MCP, "headers": HEADERS}}}],
    )
    bot.function_map = {"serpapi-search": bot.function_map["serpapi-search"]}  # Qwen-Agent adds all the server's tools
    bot.function_map["serpapi-search"].description += LOCALE_HINT
    bot.top5 = top5
    return bot

def ask(question, history=(), model=MODEL, top5=True):
    """Yields each search, then the answer, like chat.ask."""
    bot = agent(model, top5)
    bot.steps, yielded, response = [], 0, []
    for response in bot.run([*history, {"role": "user", "content": question}]):
        for step, text in bot.steps[yielded:]:
            yield {"search": step, "payload": text}
        yielded = len(bot.steps)
    answer = response[-1]["content"] if response and response[-1]["role"] == "assistant" else ""
    yield {"answer": answer, "searches": [step for step, _ in bot.steps],
           "prompt_tokens": None, "completion_tokens": None}  # Qwen-Agent doesn't report token usage
