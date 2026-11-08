from functools import partial
from chat import ask
from tools import GOOGLE_TOOLS, SERPAPI_TOOLS

# Same model and prompt everywhere; only the search tools Qwen gets change.
SETUPS = {
    "none": partial(ask, tools=None),
    "serpapi-google": partial(ask, tools=GOOGLE_TOOLS),  # Google only
    "serpapi": partial(ask, tools=SERPAPI_TOOLS),  # Qwen picks Google, Google News, Baidu or Naver
}
