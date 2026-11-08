"""The local Qwen models in Ollama: which ones are installed, and which one the app uses by default."""
import json, os
from urllib.request import urlopen
from dotenv import load_dotenv

load_dotenv()

def ollama(path, body=None):
    """Calls Ollama's own API, which can say which models support tools; the OpenAI-compatible one can't."""
    data = json.dumps(body).encode() if body else None  # a body makes it a POST
    return json.load(urlopen(os.environ["OLLAMA_BASE_URL"].removesuffix("/v1") + path, data))

def qwen_models():
    """The installed Qwen models that support tool calling, biggest first."""
    models = [m for m in ollama("/api/tags")["models"] if "qwen" in m["name"].lower()
              and "tools" in ollama("/api/show", {"model": m["name"]}).get("capabilities", [])]
    return sorted(models, key=lambda m: m["size"], reverse=True)

# LOCAL_MODEL from .env if set, otherwise the biggest Qwen model; None until one is pulled.
MODEL = os.environ.get("LOCAL_MODEL") or next((m["name"] for m in qwen_models()), None)
