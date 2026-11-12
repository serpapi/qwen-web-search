# Methodology

How we built the questions, ran the tests and graded the answers. The results are in the [README](README.md), and what we learned is in [insights](insights.md).

## The questions

Each test has 100 questions of its own, in [`questions/`](questions/):

| Test | Questions | What they ask |
|---|---|---|
| `models` | 60 English, 20 Chinese, 20 Korean | Facts from 2026 that the models can't know from training. Each stays true until at least the end of November 2026 and differs from its 2025 value, so an answer from memory can't pass by luck. 18 questions combine two facts and 10 have a false premise. |
| `engines` | 40 Chinese, 40 Korean, 20 English | Local and long-tail facts from 2026, such as a county's new mayor or a city's metro opening, where Baidu or Naver might know more than Google. The English questions are a control. |
| `known_facts` | 60 English, 20 Chinese, 20 Korean | Facts that have been true since before 2020, from easy (who painted *The Starry Night*) to obscure, so a model could know them from training. |

AI research agents gathered the candidate questions with web search and checked each answer against a source, or two sources for `known_facts`, where disputed facts were left out. We then cut the weakest candidates, such as overlapping facts, weak sources and answers that are easy to match by accident, and kept 100 of 110–117 per test.

Each question records:

- `prompt`: what Qwen is asked
- `expected`: the verified answer
- `accept`: the strings that count as a correct answer
- `review`: what makes an answer wrong when the text match could be fooled
- `source` and `recorded_on`: where and when the answer was checked
- `language`, `category`, `difficulty` and `hop` (one fact, or two combined), plus `locality` in `engines`

## The runs

- **Computer:** a MacBook Pro with 36 GB of memory.
- **Models:** qwen3.5:4b, qwen3.5:9b and qwen3.8:27b on Ollama, with a 32k-token context, flash attention and a q8_0 KV cache, one request at a time.
- **Dates:** 9–11 November 2026.
- **Same conditions everywhere:** every setup uses the same system prompt, which gives today's date, the same tool definitions and the top 5 SerpApi results as Markdown. Qwen can make up to 4 model calls per answer.
- **One run per question.** Each model was loaded before its first question and unloaded after its last, so loading time isn't in the answer times.

| Test | Setups | Models |
|---|---|---|
| `models` | `serpapi` (Qwen picks Google, Google News, Baidu or Naver) | all three |
| `engines` | `serpapi-google` (Google only) and `serpapi` | qwen3.8:27b, the only model that picked Baidu and Naver on its own |
| `known_facts` | `none` (no search) and `serpapi` | all three |

## Grading

Every answer was graded in two steps:

1. **Text match.** An answer is correct when it contains one of the question's `accept` strings, ignoring case and spaces. It's fast but rough: it passes an answer when the right name appears only in a cited link or in the wrong role, and it fails correct answers written differently.
2. **AI review.** An AI agent reviewed every answer the text match failed, and the passes most likely to be false matches: 641 of the 1,100 answers. It compared each answer with the `expected` answer and the question's `review` note, set the verdict to correct, partial or wrong, and noted why a failed answer failed. The review changed 23 grades in `models`, 6 in `engines` and 20 in `known_facts`. We spot-checked its verdicts.

"Answer in results" records whether any of Qwen's search results contained an accepted answer. It tells a search that didn't find the answer apart from a model that misread what it found.

The reasons the review gave for failed answers:

| Reason | Meaning |
|---|---|
| `results_missing` | The search results didn't contain the answer. |
| `misread_results` | The answer was in the results, but Qwen got it wrong. |
| `stale_knowledge` | Qwen searched for or answered with an older year or edition. |
| `no_search`, `skipped_search` | Qwen answered from memory although it could search. |
| `wrong_memory` | Without search, Qwen answered wrongly from memory. |
| `abstained` | Without search, Qwen said it didn't know. |
| `wrong_hop` | Qwen found one fact of a two-fact question, but not the other. |
| `accepted_premise` | Qwen went along with a false premise. |
| `empty` | Qwen returned no answer. |
| `other` | Anything else. |

## Statistics

To check whether a difference could be chance, we compare two setups only on the questions where one was right and the other wasn't, and run a two-sided sign test. For example, in `models` 27b alone answered 24 questions that 9b missed, and 9b alone answered 7 that 27b missed, which gives p = 0.003. We treat p < 0.05 as a real difference.

## Results files

[`results/`](results/) has one file per test, with one JSON line per answer:

| Field | Meaning |
|---|---|
| `model`, `setup`, `question`, `run` | Which answer this is |
| `answer` | Qwen's full answer |
| `searches` | Each search: the engine Qwen chose, its query, the time range, tokens and seconds |
| `prompt_tokens`, `completion_tokens`, `total_seconds` | What the answer cost |
| `correct` | The final verdict: `true`, `false` or `"partial"` |
| `grounded` | Whether the search results held an accepted answer, or null without searches |
| `auto_correct` | The text match's verdict, on reviewed answers |
| `failure`, `review_note` | The review's reason and note, on reviewed answers |

The search results themselves aren't stored, only their size in tokens. To print the tables from a file, run `python report.py models benchmark/results/models.jsonl` from `app/`.

## Limitations

- **One run per question.** Qwen's answers vary between runs, so small gaps such as 93 vs 95 can be chance. [Insights](insights.md) gives the p-values.
- **The answers were found with web search.** The research agents verified answers with web search, which may favor facts that Google indexes well. This matters most for `engines`.
- **The AI review can be wrong.** Every answer and verdict is in `results/`, so you can check them.
- **Facts change.** We verified every answer in November 2026. Some, such as the latest Next.js version, change quickly.
- **One computer.** The times come from one Mac and depend on its memory and chip.
