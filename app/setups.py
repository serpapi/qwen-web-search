from functools import partial
from chat import ask
from mcp_search import mcp_call, mcp_tools
from tools import GOOGLE_TOOLS, SERPAPI_TOOLS

# Same model and prompt everywhere; only the search tools Qwen gets change.
SETUPS = {
    "none": partial(ask, tools=None),
    "serpapi-google": partial(ask, tools=GOOGLE_TOOLS),  # Google only
    "serpapi": partial(ask, tools=SERPAPI_TOOLS),  # Qwen picks Google, Google News, Baidu or Naver
}

def mcp(question, top5=True, **kwargs):
    return ask(question, tools=mcp_tools(), run_tool=partial(mcp_call, top5=top5), **kwargs)

def qwen_agent(question, **kwargs):
    import qwen_agent_chat  # here, so only this setup needs Qwen-Agent installed
    return qwen_agent_chat.ask(question, **kwargs)

BENCH_SETUPS = {**SETUPS, "mcp": mcp, "mcp-full": partial(mcp, top5=False), "qwen-agent": qwen_agent}
