# Qwen + SerpApi: web search for local Qwen models

A chat app and two short Python examples that give a local Qwen model real-time web search with [SerpApi](https://serpapi.com). Qwen runs on your computer in [Ollama](https://ollama.com), searches when a question needs current information, and answers with sources.

![How a local Qwen model searches the web with SerpApi](assets/qwen-serpapi-flow.png)

- **[Chat app](#run-the-chat-app)** (`app/`): ask questions in your browser, see every search Qwen makes, and compare Qwen with and without search.
- **[Examples](#run-the-examples)** (`examples/`): two standalone Python scripts with the minimum code to connect Qwen to SerpApi.

## Requirements

- [Ollama](https://ollama.com/download)
- Python 3.10 or newer
- Node.js 20 or newer, to build the chat app
- A [SerpApi API key](https://serpapi.com/dashboard). The free plan includes 250 searches a month.

## Setup

**1. Clone the repository and install the Python packages:**

```bash
git clone https://github.com/serpapi/qwen-web-search.git
cd qwen-web-search
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

**2. Add your SerpApi key.** Copy the example file, then set `SERPAPI_API_KEY` in `.env`:

```bash
cp .env.example .env
```

**3. Download a Qwen model** that fits your computer's memory, and set `LOCAL_MODEL` in `.env` to its name:

| Model | Download size | Memory needed |
|---|---|---|
| qwen3.5:4b | 3.4 GB | 6 GB |
| qwen3.5:9b | 6.6 GB | 8 GB |
| qwen3.8:27b | 18 GB | 24 GB |
| qwen3-coder:30b | 19 GB | 24 GB |

```bash
ollama pull qwen3.5:9b
```

Any Qwen model with the [tools tag on Ollama](https://ollama.com/search?c=tools&q=qwen) works.

**4. Start Ollama** in its own terminal and leave it running. If the Ollama app is open, quit it first.

```bash
OLLAMA_CONTEXT_LENGTH=32768 OLLAMA_FLASH_ATTENTION=1 OLLAMA_KV_CACHE_TYPE=q8_0 ollama serve
```

## Run the chat app

Build the UI once, then start the server from `app/`:

```bash
cd app/web && npm install && npm run build && cd ..
python server.py
```

Open http://localhost:8000.

### Use the app

Switch between the two modes at the top of the page.

**Dedicated:** chat with one setup. Pick a setup, then type a question or click an example prompt. Each search appears as a card while Qwen works, with:

- the engine Qwen chose and its search query
- the tokens and time the search took
- **What Qwen read**: the results sent back to Qwen

The **Turn stats** panel adds up the searches, tokens and time for each answer.

**Battleground:** send one question to several setups and read their answers side by side. A table compares the engines used, searches, tokens and total time, and highlights the lowest search tokens and the fastest setup. Setups run one after another, so they don't compete for your computer's memory.

### Setups

| Setup | Where the search results come from |
|---|---|
| No search | Nowhere. Qwen answers from its training data. |
| SerpApi | SerpApi, top 5 results as Markdown |

In the SerpApi setup, Qwen chooses Google, Google News, Baidu or Naver for each search.

### Chat in the terminal

From `app/`, run `python chat.py` to chat with SerpApi search in the terminal.

## Run the examples

Each example is one file. Set `MODEL` at the top of the file to the model you pulled, then run it from the repository root:

```bash
python examples/qwen_search.py
python examples/qwen_search_multi_engines.py
```

| File | What it does |
|---|---|
| [`qwen_search.py`](examples/qwen_search.py) | Qwen searches Google. |
| [`qwen_search_multi_engines.py`](examples/qwen_search_multi_engines.py) | Qwen chooses Google, Google News, Baidu or Naver for each search. |

Type a question after `You:`. A `[search]` line appears for each search Qwen makes before it answers. Press Ctrl+C to quit.

## Run the benchmark

The benchmark asks every question in [`questions.yaml`](app/questions.yaml) with each setup and saves the answers to `results.jsonl`. From `app/`:

```bash
python bench.py                     # all setups: none and serpapi
python bench.py serpapi             # only the setups you name
python report.py                    # summary tables
```

- The answers to the 15 questions were verified on 2026-10-19. Some change quickly, so check them before you run.
- An answer counts as correct when it contains an accepted answer, so review the results by hand.
- A full run uses about 25 SerpApi searches.

## Project structure

```
qwen-web-search/
├── examples/
│   ├── qwen_search.py                # Google search in one file
│   └── qwen_search_multi_engines.py  # Qwen chooses the SerpApi engine
├── app/
│   ├── server.py                     # Web server for the chat UI
│   ├── chat.py                       # Search loop with local Qwen, and the terminal chat
│   ├── tools.py                      # Prompts and search tools Qwen sees
│   ├── serpapi_search.py             # SerpApi search
│   ├── setups.py                     # The setups shared by the UI and the benchmark
│   ├── bench.py, report.py           # Benchmark and summary tables
│   ├── questions.yaml                # Benchmark questions
│   └── web/                          # React chat UI
├── assets/                           # Images
├── .env.example
└── requirements.txt
```

## Development

To work on the UI, run `python server.py` in `app/` and `npm run dev` in `app/web/` at the same time, then open http://localhost:5173. Restart `server.py` after you change Python files.

## Troubleshooting

| Problem | Fix |
|---|---|
| `address already in use` when you start Ollama | Ollama is already running. Quit the Ollama app, then start Ollama again. |
| `openai.APIConnectionError: Connection error` | Ollama isn't running. Start it as in [Setup](#setup). |
| `model "..." not found` | Pull the model with `ollama pull`, or set `LOCAL_MODEL` (app) or `MODEL` (examples) to a name from `ollama list`. |
| `KeyError: 'SERPAPI_API_KEY'` | Create `.env` in the repository root, as in [Setup](#setup). |
| `401 Unauthorized` from SerpApi | The key in `.env` is wrong. Copy it again from your [SerpApi dashboard](https://serpapi.com/dashboard). |
| Your computer slows down while Qwen answers | Close other apps or pick a smaller model. Run `ollama stop <model>` to free the memory. |

## Learn more

- [How to Connect Your Local LLM with Web Search Data](https://serpapi.com/blog/how-to-connect-your-local-llm-with-web-search-data/) (SerpApi blog)
- SerpApi [Markdown output](https://serpapi.com/markdown-output) and [JSON Restrictor](https://serpapi.com/json-restrictor)
