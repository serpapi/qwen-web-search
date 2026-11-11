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

**3. Download a Qwen model** that fits your computer's memory:

| Model | Download size | Memory needed |
|---|---|---|
| qwen3.5:4b | 3.4 GB | 6 GB |
| qwen3.5:9b | 6.6 GB | 8 GB |
| qwen3.8:27b | 18 GB | 24 GB |
| qwen3-coder:30b | 19 GB | 24 GB |

```bash
ollama pull qwen3.5:9b
```

Any Qwen model with the [tools tag on Ollama](https://ollama.com/search?c=tools&q=qwen) works. The app lists every Qwen model you've pulled and starts with the biggest. To start with a different one, set `LOCAL_MODEL` in `.env`.

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

Pick a model and switch between the two modes at the top of the page. Switching to a model that isn't loaded yet makes the next answer slower while Ollama loads it.

**Dedicated:** chat with one setup. Pick a setup, then type a question or click an example prompt. Each search appears as a card while Qwen works, with:

- the engine Qwen chose and its search query
- the tokens and time the search took
- **What Qwen read**: the results sent back to Qwen

The **Turn stats** panel adds up the searches, tokens and time for each answer.

![Dedicated mode: Qwen searches with SerpApi and streams its answer](assets/chat-demo.gif)

**Battleground:** send one question to up to four columns and read their answers side by side. Each column is a model and a setup, so you can compare search with no search, Google with multiple engines, or one model with another. The presets fill the columns in one click:

| Preset | Columns |
|---|---|
| Search vs no search | Your model with SerpApi, and without search |
| Google vs multiple engines | Your model with SerpApi · Google, and with SerpApi · Multiple engines |
| Model vs model | Every Qwen model you've pulled (up to four), each with SerpApi |
| Small + search vs big alone | Your smallest model with SerpApi, and your biggest without search |

A table compares the engines used, searches, tokens and total time, and highlights the lowest search tokens and the fastest column. Columns run one after another, so they don't compete for your computer's memory. When a column needs a different model, Ollama loads it first; the time shown doesn't include loading.

![Battleground mode: three Qwen models answer the same question, one after another (sped up 5x)](assets/battleground-demo.gif)

### Setups

| Setup | Where the search results come from |
|---|---|
| No search | Nowhere. Qwen answers from its training data. |
| SerpApi · Google | Google, through SerpApi, like [`qwen_search.py`](examples/qwen_search.py) |
| SerpApi · Multiple engines | Qwen chooses Google, Google News, Baidu or Naver for each search, like [`qwen_search_multi_engines.py`](examples/qwen_search_multi_engines.py) |

The SerpApi setups get the top 5 results as Markdown. In the app, Qwen can also limit a Google search to the past day, week, month or year when a question is about recent events. The examples leave this out to stay short.

### Chat in the terminal

From `app/`, run `python chat.py` to chat in the terminal, with Qwen choosing the SerpApi engine.

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

Each benchmark test asks its own questions from [`app/questions/`](app/questions/) and saves the answers to `results.jsonl`:

- **Model vs model** (`models`): 100 questions that need a web search (60 English, 20 Chinese, 20 Korean), asked with SerpApi · Multiple engines on each Qwen model you've pulled. Every answer is from 2026, so the models can't know it from training. The questions mix topics, easy to hard questions, multi-hop questions that combine two facts, and false-premise questions that a good answer should push back on.
- **Google vs multiple engines** (`engines`): 100 questions asked with SerpApi · Google and with SerpApi · Multiple engines on the biggest model. 40 Chinese and 40 Korean questions ask about local and long-tail facts, such as a county's new mayor or a city's metro line, where Baidu and Naver may know more than Google. 20 English questions (recent news and general web) are the control.
- **Small model with search vs big model without** (`known_facts`): 100 old, stable facts (60 English, 20 Chinese, 20 Korean), from common knowledge to specialist trivia, asked without search and with SerpApi · Multiple engines on each model. It shows where each model's memory runs out, and whether search lets a small model catch up with a big one.

From `app/`:

```bash
python bench.py models                        # every installed Qwen model, biggest first
python bench.py models qwen3.5:9b qwen3.5:4b  # only the models you name
python bench.py engines                       # both setups on the biggest model
python bench.py known_facts                   # no search and SerpApi, on every installed Qwen model
python report.py models                       # summary, and results by language, topic, difficulty and question
```

- Each model is loaded before its first question, so answer times don't include loading, and unloaded after its last one.
- If a run stops, run the same command again. It skips the answers already in `results.jsonl`.
- A full run takes hours, so keep the computer awake. A sleeping Mac makes searches fail and inflates answer times. On a Mac, plug it in, keep the lid open and run `caffeinate -s python bench.py models`.
- The biggest model needs most of your memory. If the computer starts swapping, quit other apps or run that model on its own.
- The answers were verified on 2026-11-09 against the source in each question. Some change quickly, such as the latest Next.js version, so check them before you run.
- An answer counts as correct when it contains an accepted answer. "Answer in results" counts the answers whose search results contained an accepted answer. Review the results by hand; the `review` notes say what to look out for.
- A full run on three models uses about 450 SerpApi searches.

## Project structure

```
qwen-web-search/
├── examples/
│   ├── qwen_search.py                # Google search in one file
│   └── qwen_search_multi_engines.py  # Qwen chooses the SerpApi engine
├── app/
│   ├── server.py                     # Web server for the chat UI
│   ├── chat.py                       # Search loop with local Qwen, and the terminal chat
│   ├── models.py                     # The installed Qwen models, and the default one
│   ├── tools.py                      # The prompt and search tools Qwen sees
│   ├── serpapi_search.py             # SerpApi search
│   ├── setups.py                     # The setups shared by the UI and the benchmark
│   ├── bench.py, report.py           # Benchmark and summary tables
│   ├── questions/                    # Benchmark questions, one file per test
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
| `Can't reach Ollama` | Ollama isn't running. Start it as in [Setup](#setup), then start the app. |
| `Ollama doesn't have ...` or `model "..." not found` | Pull the model with `ollama pull`, or set `LOCAL_MODEL` (app) or `MODEL` (examples) to a name from `ollama list`. |
| The app says no Qwen model was found | Pull one, for example `ollama pull qwen3.5:9b`, then reload the page. Only Qwen models with tool support are listed. |
| `SERPAPI_API_KEY isn't set` | Create `.env` in the repository root, as in [Setup](#setup). |
| A search says `Search failed: Invalid API key` | The key in `.env` is wrong. Copy it again from your [SerpApi dashboard](https://serpapi.com/dashboard). |
| A search says `Search failed: Your account has run out of searches` | You've used this month's searches. Check your usage on the [SerpApi dashboard](https://serpapi.com/dashboard). |
| Your computer slows down while Qwen answers | Close other apps or pick a smaller model. Run `ollama stop <model>` to free the memory. |

## Learn more

- [How to Connect Your Local LLM with Web Search Data](https://serpapi.com/blog/how-to-connect-your-local-llm-with-web-search-data/) (SerpApi blog)
- SerpApi [Markdown output](https://serpapi.com/markdown-output) and [JSON Restrictor](https://serpapi.com/json-restrictor)
