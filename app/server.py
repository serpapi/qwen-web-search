"""Web API for the chat UI: streams each search and the final answer as server-sent events."""
import json, os, time
from contextlib import closing
from urllib.error import HTTPError, URLError
import openai
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.concurrency import iterate_in_threadpool
from models import MODEL, is_loaded, load, qwen_models
from setups import SETUPS

app = FastAPI()

class ChatRequest(BaseModel):
    setup: str
    message: str
    history: list[dict] = []  # earlier {"role", "content"} turns of this conversation
    model: str | None = MODEL

OLLAMA_DOWN = "Can't reach Ollama. Start it with `ollama serve`, then try again."

def explain(error, model):
    """The error in plain words, with what to do about it."""
    if isinstance(error, openai.NotFoundError) or (isinstance(error, HTTPError) and error.code == 404):
        return f"Ollama doesn't have {model}. Pull it with `ollama pull {model}`, then reload the page."
    if isinstance(error, (URLError, openai.APIConnectionError)):  # after HTTPError, which is a URLError too
        return OLLAMA_DOWN
    return f"{type(error).__name__}: {error}"

@app.get("/api/config")
def config():
    try:
        models = [{"name": m["name"], "parameters": m["details"]["parameter_size"]} for m in qwen_models()]
    except URLError:
        raise HTTPException(503, OLLAMA_DOWN)
    return {"models": models, "default_model": MODEL, "setups": list(SETUPS)}

async def close_on_disconnect(events):
    """Streams a sync generator and closes it when the browser disconnects (Stop), which closes the Ollama stream.
    Starlette only abandons it, and Ollama would finish the reply for nobody."""
    try:
        async for event in iterate_in_threadpool(events):
            yield event
    finally:
        events.close()

@app.post("/api/chat")
def chat(request: ChatRequest):
    def events():
        try:
            if not is_loaded(request.model):  # load it first, so loading doesn't count as answer time
                yield f"data: {json.dumps({'loading': request.model})}\n\n"
                load(request.model)
            start = time.time()
            with closing(SETUPS[request.setup](request.message, history=request.history, model=request.model)) as chat:
                for event in chat:
                    if "answer" in event:
                        event["total_seconds"] = round(time.time() - start, 2)
                    yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': explain(e, request.model)})}\n\n"
    return StreamingResponse(close_on_disconnect(events()), media_type="text/event-stream")

if os.path.isdir("web/dist"):  # the built React UI (cd web && npm run build)
    app.mount("/", StaticFiles(directory="web/dist", html=True), name="web")

if __name__ == "__main__":
    uvicorn.run(app, port=8000)
