"""Web API for the chat UI: streams each search and the final answer as server-sent events."""
import json, os, time
import uvicorn
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from chat import MODEL
from setups import SETUPS

app = FastAPI()

class ChatRequest(BaseModel):
    setup: str
    message: str
    history: list[dict] = []  # earlier {"role", "content"} turns of this conversation

@app.get("/api/config")
def config():
    return {"model": MODEL, "setups": list(SETUPS)}

@app.post("/api/chat")
def chat(request: ChatRequest):
    def events():
        start = time.time()
        try:
            for event in SETUPS[request.setup](request.message, history=request.history):
                if "answer" in event:
                    event["total_seconds"] = round(time.time() - start, 2)
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': f'{type(e).__name__}: {e}'})}\n\n"
    return StreamingResponse(events(), media_type="text/event-stream")

if os.path.isdir("web/dist"):  # the built React UI (cd web && npm run build)
    app.mount("/", StaticFiles(directory="web/dist", html=True), name="web")

if __name__ == "__main__":
    uvicorn.run(app, port=8000)
