"""Web API for the chat UI: streams each search and the final answer as server-sent events."""
import json, os, time
from contextlib import closing
import uvicorn
from fastapi import FastAPI
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

@app.get("/api/config")
def config():
    models = [{"name": m["name"], "parameters": m["details"]["parameter_size"]} for m in qwen_models()]
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
            yield f"data: {json.dumps({'error': f'{type(e).__name__}: {e}'})}\n\n"
    return StreamingResponse(close_on_disconnect(events()), media_type="text/event-stream")

if os.path.isdir("web/dist"):  # the built React UI (cd web && npm run build)
    app.mount("/", StaticFiles(directory="web/dist", html=True), name="web")

if __name__ == "__main__":
    uvicorn.run(app, port=8000)
