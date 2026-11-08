"""A local Qwen model that searches Google with SerpApi when it needs current information."""
import json, os
from datetime import date
import serpapi
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()  # reads SERPAPI_API_KEY from .env
serpapi_client = serpapi.Client(api_key=os.environ["SERPAPI_API_KEY"], timeout=60)
qwen = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")  # Ollama's OpenAI-compatible API
MODEL = "qwen3.5:9b"  # the model you pulled, as shown by `ollama list`
MAX_ROUNDS = 4  # calls to Qwen per question; the last one must answer

def google_search(query):
    """Searches Google with SerpApi and returns the top 5 results as Markdown."""
    return serpapi_client.search(
        engine="google",
        q=query,
        json_restrictor="answer_box,organic_results[0:5].{title,link,snippet,date}",  # only what the model needs
        output="md",  # Markdown uses fewer tokens than JSON
    )

SYSTEM = f"""You are a helpful assistant. Today's date is {date.today()}.
- If you don't know something or can't confirm it, say so instead of guessing.
- Cite the sources you used as Markdown links.
- Reply in the user's language, and keep it concise."""
LAST_ROUND = "That was your last search. Answer now with the results you have."

TOOLS = [{"type": "function", "function": {
    "name": "google_search",
    "description": "Web search for current information. Returns the top 5 results with titles, links, snippets and dates.",
    "parameters": {
        "type": "object",
        "properties": {"query": {"type": "string", "description": "A short, specific search query."}},
        "required": ["query"],
    },
}}]

def ask(question):
    """Lets Qwen search until it can answer, in at most MAX_ROUNDS calls."""
    messages = [{"role": "system", "content": SYSTEM}, {"role": "user", "content": question}]
    for round_number in range(1, MAX_ROUNDS + 1):
        tools = TOOLS
        if round_number == MAX_ROUNDS:  # Qwen is still searching: take the tool away and make it answer
            tools = []
            messages.append({"role": "user", "content": LAST_ROUND})
        reply = qwen.chat.completions.create(model=MODEL, messages=messages, tools=tools).choices[0].message
        if not reply.tool_calls:
            return reply.content  # no search requested, so this is the answer
        messages.append(reply.model_dump(exclude_none=True))  # keep Qwen's search request in the conversation
        for call in reply.tool_calls:  # Qwen can ask for several searches at once
            query = json.loads(call.function.arguments)["query"]
            print(f"  [search] {query}")
            messages.append({"role": "tool", "tool_call_id": call.id, "content": google_search(query)})

if __name__ == "__main__":
    while True:
        print("\nQwen:", ask(input("\nYou: ")))
