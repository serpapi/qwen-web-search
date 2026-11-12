# Benchmark

Three tests that check how well local Qwen models answer with web search. Each test has 100 questions in English, Chinese and Korean, and you can run it on the models you have.

| Path | What it holds |
|---|---|
| [`questions/`](questions/) | The 100 questions of each test |
| [`results/`](results/) | Our answers and their grades, one file per test |
| [`methodology.md`](methodology.md) | How we built the questions, ran the tests and graded the answers |
| [`insights.md`](insights.md) | What we learned |
| `runs.jsonl` | Your own runs, written by `bench.py` (not in git) |

## Results

We ran the tests in November 2026 on a MacBook Pro with 36 GB of memory, using qwen3.5:4b, qwen3.5:9b and qwen3.8:27b on Ollama. Each question was asked once. The answers were graded with a text match, then checked by an AI review.

### Which model searches best? (test name: `models`)

All 100 questions are about events in 2026, so the models have to search.

| Metric | qwen3.8:27b | qwen3.5:9b | qwen3.5:4b |
|---|---|---|---|
| Correct answers | **90** | 73 | 67 |
| Time per answer | 36.9 s | 18.5 s | 21.9 s |

- The 27B model wrote sharper queries and searched again when the first results fell short. The gap was largest on questions that combine two facts: 16 of 18, against 12 and 6.
- When the 27B model was wrong, it had usually trusted its memory instead of searching.

### Google only vs multiple search engines (test name: `engines`)

100 local and recent questions, mostly in Chinese and Korean, on qwen3.8:27b.

| Category | Google only | Google, Google News, Baidu or Naver |
|---|---|---|
| Correct answers | 93 | 95 |
| Time per answer | **32.5 s** | 39.5 s |

- Google covers regional questions well. The other engines helped on very fresh or very local facts, but made answers slower.

### Small model with search vs big model without (test name: `known_facts`)

100 old, stable facts that the models could know from training.

| Model | Without search | With search |
|---|---|---|
| qwen3.8:27b | 82 | 91 |
| qwen3.5:9b | 75 | **97** |
| qwen3.5:4b | 66 | 95 |

- A small model with search beat the big model answering from memory.
- It was also faster. Without search, the small models spent about a minute per answer trying to remember. With search, they answered in about 8 seconds.

## Run the tests

From `app/`:

```bash
python bench.py models                        # every Qwen model you've pulled, biggest first
python bench.py models qwen3.5:9b qwen3.5:4b  # only the models you name
python bench.py engines                       # Google only and multiple engines, on your biggest model
python bench.py known_facts                   # without and with search, on every model
python report.py models                       # tables for one test, from your runs
python report.py models benchmark/results/models.jsonl  # the same tables from our results
```

Before you start:

- **Searches.** Our runs on three models used about 610 SerpApi searches for `models`, 470 for `engines` and 220 for `known_facts`. The free plan has 250 a month, so try one model first.
- **Time.** A full test takes hours. Keep the computer awake: on a Mac, plug it in, keep the lid open and run `caffeinate -s python bench.py models`.
- **Memory.** The biggest model needs most of your memory, so quit other apps while it runs.
- **Stopping.** If a run stops, run the same command again. It skips the answers it already has in `runs.jsonl`.

## Read the results

`python report.py <test>` prints Markdown tables. They show correct answers per model and setup, broken down by language, topic and difficulty, and one row per question. They also show which engines Qwen chose.

An answer counts as correct when it contains one of the question's accepted answers. That's a quick first pass: it misses correct answers written differently and passes some wrong ones. So check the answers yourself or with an AI review, as we did. Each question's `review` note says what to look out for. To record your verdict, set `correct` in `runs.jsonl` to `true`, `false` or `"partial"`.

## The questions

| File | Test |
|---|---|
| [`models.yaml`](questions/models.yaml) | 60 English, 20 Chinese and 20 Korean questions about 2026 events, including questions that combine two facts and questions with a false premise |
| [`engines.yaml`](questions/engines.yaml) | 40 Chinese and 40 Korean local questions (a county's new mayor, a city's metro line), plus 20 English questions |
| [`known_facts.yaml`](questions/known_facts.yaml) | 60 English, 20 Chinese and 20 Korean facts that haven't changed in years, from easy to obscure |

Each question has the expected answer, the strings used for grading and the source it was checked against. We verified the answers in November 2026. Some change quickly, such as the latest Next.js version, so check them before you run and update `accept` if needed.
