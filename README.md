# Qwen + SerpApi: real-time web search for local Qwen models

Give a local Qwen model real-time web search with [SerpApi](https://serpapi.com). Qwen decides when a question needs current information and which search engine fits it. Your code runs the search through SerpApi and sends back compact results, and Qwen answers with sources.

![How a local Qwen model searches the web with SerpApi](assets/qwen-serpapi-flow.png)

The repository has two parts:

- **[`examples/`](examples)**: two short, standalone scripts from the blog post. Start here.
- **[`app/`](app)**: a chat UI and a benchmark that compare Qwen with no search, SearXNG, SerpApi (Markdown and JSON) and Qwen Cloud's built-in search.

## Requirements

- [Ollama](https://ollama.com/download) and a Qwen model with tool support (see below)
- Python 3.10 or newer
- A [SerpApi API key](https://serpapi.com/dashboard). The free plan includes 250 searches a month.
- For the app: Node.js 20 or newer
- Optional: Docker, to run SearXNG for the comparison, and a Qwen Cloud API key

### Pick a Qwen model

A model needs about its download size in memory, plus a little for the conversation. Pick one that leaves room for your other apps:

| Your memory | Model | Download size |
|---|---|---|
| 8 GB | `qwen3.5:4b` | about 3.5 GB |
| 16 GB | `qwen3.5:9b` | about 7 GB |
| 32 GB or more | `qwen3.8:27b` | about 18 GB |

Any Qwen model with the [tools tag on Ollama](https://ollama.com/search?c=tools&q=qwen) works.

## Setup

```bash
git clone https://github.com/serpapi/qwen-web-search.git
cd qwen-web-search
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # add your SerpApi key, and set LOCAL_MODEL to your model
ollama pull qwen3.5:9b      # or the model you picked
```

Start Ollama in its own terminal, with a 32k context and an 8-bit KV cache. If the Ollama app is already running, quit it first.

```bash
OLLAMA_CONTEXT_LENGTH=32768 OLLAMA_FLASH_ATTENTION=1 OLLAMA_KV_CACHE_TYPE=q8_0 ollama serve
```

## Run the examples

Set `MODEL` at the top of the file to the model you pulled, then run:

```bash
python examples/qwen_search.py                  # Google only
python examples/qwen_search_multi_engines.py    # Qwen picks Google, Google News, Baidu or Naver
```

Each one starts a chat in your terminal. A `[search]` line shows each search Qwen asked for:

```
You: 2026年全国高考报名人数是多少？
  [search] baidu: 2026年全国高考报名人数
  [search] google_news: 2026年全国高考报名人数

Qwen: 根据教育部2026年6月3日发布的数据，2026年全国高考报名人数为1290万人。...
```

| File | What it shows |
|---|---|
| [`qwen_search.py`](examples/qwen_search.py) | One `google_search` tool, and the loop that lets Qwen search, then answer |
| [`qwen_search_multi_engines.py`](examples/qwen_search_multi_engines.py) | One `serpapi_search` tool where Qwen also passes the SerpApi engine |

Each question uses 1–6 SerpApi searches. Press Ctrl+C to quit.

## Run the app

Run the app's commands from `app/`. Build the UI once, then start the server:

```bash
cd app/web && npm install && npm run build && cd ..
python server.py    # open http://localhost:8000
```

- **Dedicated mode:** chat with one setup and watch each search as it happens: the engine, the query, tokens, time and the raw results Qwen read.
- **Battleground mode:** send the same question to several setups side by side and compare searches, tokens and time. Setups run one after another, so they don't compete for the local model.

| Setup | Search | Needs |
|---|---|---|
| `none` | No search (baseline) | |
| `serpapi-md` | SerpApi, Markdown results | `SERPAPI_API_KEY` |
| `serpapi-json` | SerpApi, JSON results | `SERPAPI_API_KEY` |
| `searxng` | Self-hosted SearXNG | SearXNG running (see below) |
| `cloud` | Qwen Cloud with its built-in `web_search` | `QWEN_CLOUD_API_KEY` |

The local setups use the model in `LOCAL_MODEL`. To run SearXNG, start it from `app/` with Docker. [`searxng/settings.yml`](app/searxng/settings.yml) turns on JSON output and enables SearXNG's Google, Baidu and Naver engines.

```bash
docker run -d --name searxng -p 8080:8080 -v ./searxng:/etc/searxng searxng/searxng
```

You can also chat in the terminal: `python chat.py md` or `python chat.py json` for SerpApi, and `python cloud.py` for Qwen Cloud.

For frontend work, run `python server.py` and `cd web && npm run dev` together. The dev UI at http://localhost:5173 sends `/api` requests to port 8000.

## Run the benchmark

```bash
cd app
python bench.py                     # none, searxng, serpapi-md, serpapi-json
python bench.py serpapi-md cloud    # only some setups
python report.py                    # summary tables from results.jsonl
```

- [`questions.yaml`](app/questions.yaml) has 15 questions with answers verified on 2026-10-19: recent facts, news, prices, local information, Chinese and Korean questions, and controls. Several are real user prompts from [lmarena Search Arena](https://huggingface.co/datasets/lmarena-ai/search-arena-24k) and [FreshQA](https://github.com/freshllms/freshqa). Re-check fast-changing answers before you run it.
- `bench.py` appends one line per answer to `results.jsonl`. `correct` is a simple match against the accepted answers, so review the results by hand.
- A full run uses about 45 SerpApi searches.

## Project structure

```
qwen-web-search/
├── examples/
│   ├── qwen_search.py                # Google search in one file
│   └── qwen_search_multi_engines.py  # Qwen picks the SerpApi engine
├── app/
│   ├── server.py                     # Web API: streams searches and answers to the UI
│   ├── chat.py                       # Tool loop with local Qwen, and the terminal chat
│   ├── cloud.py                      # Qwen Cloud with its built-in web_search
│   ├── tools.py                      # Prompts and search tools Qwen sees
│   ├── serpapi_search.py             # SerpApi search: Markdown or JSON, top 5 results
│   ├── searxng_search.py             # SearXNG search, for comparison
│   ├── setups.py                     # The setups shared by the UI and the benchmark
│   ├── bench.py                      # Runs questions.yaml across setups
│   ├── report.py                     # Summary tables from results.jsonl
│   ├── questions.yaml                # Benchmark questions with verified answers
│   ├── searxng/settings.yml          # SearXNG configuration
│   └── web/                          # React + Vite + Tailwind UI
├── assets/                           # Images
├── .env.example
└── requirements.txt
```

## Troubleshooting

| Problem | Fix |
|---|---|
| `address already in use` when you start Ollama | Ollama is already running. Quit the Ollama app, then start it again with the command above. |
| `openai.APIConnectionError: Connection error` | Ollama isn't running. Start it as in [Setup](#setup). |
| `model "..." not found` | Pull the model with `ollama pull`, or set `MODEL` (examples) or `LOCAL_MODEL` (app) to a tag from `ollama list`. |
| `KeyError: 'SERPAPI_API_KEY'` | Create `.env` in the repository root, as in [Setup](#setup). |
| `HTTPError: 401 ... Unauthorized` from SerpApi | The key in `.env` is wrong. Copy it again from your [SerpApi dashboard](https://serpapi.com/dashboard). |
| SearXNG searches fail with `ConnectionError` | SearXNG isn't running on port 8080. Start it as in [Run the app](#run-the-app). |
| Qwen Cloud returns `401 InvalidApiKey` | Set `QWEN_CLOUD_API_KEY` in `.env`. |
| The UI doesn't show your changes | Rebuild it with `npm run build`, and restart `server.py` after Python changes. |
| Your computer slows down while Qwen answers | Close other apps or pick a smaller model. Run `ollama stop <model>` to free the memory right away. |

## Learn more

- [How to Connect Your Local LLM with Web Search Data](https://serpapi.com/blog/how-to-connect-your-local-llm-with-web-search-data/) (SerpApi blog)
- SerpApi [Markdown output](https://serpapi.com/markdown-output) and [JSON Restrictor](https://serpapi.com/json-restrictor)
- [Qwen Cloud web search](https://docs.qwencloud.com/developer-guides/tool-calling/web-search)
