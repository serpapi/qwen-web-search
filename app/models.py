"""The local Qwen models in Ollama: which ones are installed, and which one the app uses by default."""
import json, os, sys
from urllib.error import URLError
from urllib.request import urlopen
from dotenv import load_dotenv

load_dotenv()
OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434/v1")

def ollama(path, body=None):
    """Calls Ollama's own API, which can say which models support tools; the OpenAI-compatible one can't."""
    data = json.dumps(body).encode() if body else None  # a body makes it a POST
    return json.load(urlopen(OLLAMA_BASE_URL.removesuffix("/v1") + path, data))

def qwen_models():
    """The installed Qwen models that support tool calling, biggest first."""
    models = [m for m in ollama("/api/tags")["models"] if "qwen" in m["name"].lower()
              and "tools" in ollama("/api/show", {"model": m["name"]}).get("capabilities", [])]
    return sorted(models, key=lambda m: m["size"], reverse=True)

def is_loaded(model):
    return model in [m["name"] for m in ollama("/api/ps")["models"]]

def load(model):
    """Loads a model into memory, so the next answer's time doesn't include loading it."""
    ollama("/api/generate", {"model": model, "stream": False})  # without a prompt, Ollama only loads the model

def unload(model):
    """Frees the model's memory now, instead of after Ollama's 5-minute keep-alive."""
    ollama("/api/generate", {"model": model, "keep_alive": 0})

def default_model():
    """LOCAL_MODEL from .env if Ollama has it, otherwise the biggest Qwen model (None until one is pulled),
    plus a message saying why LOCAL_MODEL wasn't used, or None."""
    local = os.environ.get("LOCAL_MODEL")
    installed = [m["name"] for m in ollama("/api/tags")["models"]]
    for name in (local, f"{local}:latest"):  # Ollama lists a model pulled without a tag as name:latest
        if local and name in installed:
            return name, None
    biggest = next((m["name"] for m in qwen_models()), None)
    if not local or not biggest:  # with no Qwen model at all, the app already says to pull one
        return biggest, None
    return biggest, (f"LOCAL_MODEL in .env is {local}, which Ollama doesn't have, so the app started with {biggest}. "
                     f"Check the name with `ollama list`, or pull it with `ollama pull {local}`.")

try:
    MODEL, MODEL_WARNING = default_model()
except URLError:
    sys.exit(f"Can't reach Ollama at {OLLAMA_BASE_URL}. Start it with `ollama serve` (see Setup in the README).")
if MODEL_WARNING:
    print(MODEL_WARNING, file=sys.stderr)
