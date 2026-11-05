import os
from dotenv import load_dotenv
from openai import OpenAI
from tools import SEARCH_SYSTEM

load_dotenv()

def ask_cloud(question, history=()):
    """Hosted Qwen with its built-in web_search. Yields each search, then the answer."""
    client = OpenAI(base_url="https://maas.qwencloudapi.com/compatible-mode/v1",
                    api_key=os.environ["QWEN_CLOUD_API_KEY"])
    resp = client.responses.create(model="qwen3.8-27b", instructions=SEARCH_SYSTEM,
                                   input=[*history, {"role": "user", "content": question}],
                                   tools=[{"type": "web_search"}])
    run = {"searches": [], "prompt_tokens": resp.usage.input_tokens, "completion_tokens": resp.usage.output_tokens}
    sources = []
    for item in resp.output:
        if item.type == "web_search_call":
            step = {"tool": "web_search", "query": item.action.query, "engine": "qwen-cloud", "format": "hosted"}
            run["searches"].append(step)
            sources += [source.url for source in item.action.sources or []]
            yield {"search": step}
    yield {"answer": resp.output_text + "\nSources:\n" + "\n".join(sources), **run}

if __name__ == "__main__":
    while True:
        print("\nQwen:", list(ask_cloud(input("\nYou: ")))[-1]["answer"])
