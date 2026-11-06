from functools import partial
from chat import ask
from serpapi_search import serpapi_search

# Same model, prompt and tools everywhere; only search on or off and the result format change.
SETUPS = {
    "none": partial(ask, search=None),
    "serpapi-md": partial(ask, search=partial(serpapi_search, fmt="md")),
    "serpapi-json": partial(ask, search=partial(serpapi_search, fmt="json")),
}
