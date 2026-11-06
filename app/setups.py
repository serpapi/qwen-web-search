from functools import partial
from chat import ask
from searxng_search import searxng_search
from serpapi_search import serpapi_search

# Same model, prompt and tools everywhere; only the search backend or format changes.
SETUPS = {
    "none": partial(ask, search=None),
    "searxng": partial(ask, search=searxng_search),
    "serpapi-md": partial(ask, search=partial(serpapi_search, fmt="md")),
    "serpapi-json": partial(ask, search=partial(serpapi_search, fmt="json")),
}
