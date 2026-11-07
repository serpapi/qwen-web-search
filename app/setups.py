from functools import partial
from chat import ask
from serpapi_search import serpapi_search

# Same model, prompt and tools everywhere; only search on or off changes.
SETUPS = {
    "none": partial(ask, search=None),
    "serpapi": partial(ask, search=serpapi_search),
}
