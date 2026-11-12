# Insights

What we learned from the three tests. How we built the questions, ran the tests and graded the answers is in [methodology](methodology.md).

## Which model searches best? (`models`)

**Setup**
- **Models:** qwen3.8:27b, qwen3.5:9b and qwen3.5:4b on Ollama, each with SerpApi search (Qwen picks Google, Google News, Baidu or Naver).
- **Questions:** 100, all about events in 2026, so they need a search: 60 English, 20 Chinese and 20 Korean.
- **Mix:** topics from sports to economy, 18 multi-hop and 10 false-premise questions.
- **Grading:** a text match against verified answers, then an AI review, which changed 23 grades.
- **Runs:** one per question, on a MacBook Pro with 36 GB of memory.

| | 27b | 9b | 4b |
|---|---|---|---|
| Correct / partly / wrong | **90** / 3 / 7 | 73 / 4 / 23 | 67 / 10 / 23 |
| English (60) | 51 | 47 | 39 |
| Chinese (20) | 20 | 16 | 15 |
| Korean (20) | 19 | 10 | 13 |
| Multi-hop (18) | 16 | 12 | 6 |
| False premise (10) | 7 | 4 | 5 |
| Answer was in its search results | 88 of 98 | 78 of 98 | 73 of 100 |
| Searches per question | 2.3 | 1.8 | 2.0 |
| Time per answer | 36.9 s | 18.5 s | 21.9 s |

**Insights**
1. **The 27B model is clearly better; 9B vs 4B is close to a coin flip.** 27b alone answered 24 questions that 9b missed, against 7 the other way (p = 0.003). The 9b vs 4b difference (20 vs 14) could be chance.
2. **The bigger model wins by searching better, not just by reading better.** Whenever 27b answered wrong, the right answer was in its search results; that happened 9 times to 9b and 12 times to 4b. 27b runs more searches, writes sharper queries and follows up when the first results fall short.
3. **Only the big model uses local search engines on its own.** 27b sent 13 of its 44 Chinese searches to Baidu and also used Naver, and scored 20/20 on Chinese and 19/20 on Korean. 9b and 4b used Baidu twice in total and Naver never.
4. **Small models stop after the first fact.** On multi-hop questions (for example, how old a prize winner was when it was announced), 27b got 16 of 18, 9b 12 and 4b 6.
5. **The big model fails by trusting its memory.** Most of 27b's misses came from:
   - skipping a search because it "knew" the answer;
   - putting remembered facts into its queries ("Bob Chapek" for Disney's CEO);
   - overcorrecting a premise that was actually true.
6. **The small models went along with false premises.** Both confirmed that the USA topped the 2026 Winter Olympics medal table, which it didn't. False-premise scores: 27b 7/10, 9b 4/10, 4b 5/10.
7. **Old dates leak into queries for every model.** The prompt gives today's date, yet the models still searched with "2024 2025", read "this year" as 2025, or looked up past editions of an event.
8. **Accuracy costs time, and the cost is thinking, not searching.** 27b takes about twice as long per answer as 9b. Search is about 4 seconds of each answer for every model. 4b thinks twice as long as 9b, so the smaller model isn't faster.
9. **Small-model quirks to guard against in code:**
   - **Made-up engine names:** 9b invented `google_google_news` (Ollama doesn't enforce the tool's enum), so validate tool arguments.
   - **Empty replies:** 9b returned two.
   - **Snippet-less results:** 4b sends most searches to Google News, whose results carry titles but no snippets.
10. **Text-match grading needs a second check.** It passed answers where the name appeared only in a cited link or in the wrong role (a presenter instead of the winner), and failed correct answers written differently ("168 만 3,000원").

## Side test: can a short prompt make Qwen pick local engines?

**Setup**
- **Models:** 9b and 4b.
- **Questions:** 10 Chinese, 10 Korean and 10 English per variant.
- **What was recorded:** only the engine Qwen asked for in its first search; no searches were run.

**Insights**
1. **By default Qwen sends Chinese and Korean questions to Google.** Baidu and Naver were chosen 0 times out of 20.
2. **Tool descriptions barely help.** Saying "baidu: use for Chinese-language questions" in the tool's engine description changed nothing. Putting it in the tool's main description helped a little on 4b only.
3. **A short system-prompt line works, but Baidu needs a firmer one.**
   - "Search with the engine that matches the question's language: Baidu for Chinese, Naver for Korean" sent Korean questions to Naver 8–9 times out of 10, but Chinese to Baidu only 0–1 times.
   - "Always search Chinese questions with Baidu and Korean questions with Naver" raised Baidu to 6–7 out of 10.
4. **Why Baidu resists:** on Chinese questions Qwen thinks in Chinese ("让我用google搜索引擎搜索", "let me search with Google") and never weighs Baidu.
5. **English questions were never sent to Baidu or Naver** in any variant.

## Google only vs multiple engines (`engines`)

**Setup**
- **Model:** qwen3.8:27b, the only model that picks Baidu and Naver on its own.
- **Questions:** 100 new ones, all about 2026.
  - 40 Chinese and 40 Korean questions about local and long-tail facts: a county newly created in Xinjiang, the new head of a Seoul district, a city's metro opening, a province's university cut-off score.
  - 20 English questions as a control: recent news and general web.
- **Two setups, same prompt:** SerpApi with Google only, and SerpApi with a choice of Google, Google News, Baidu and Naver.
- **Grading:** a text match, then an AI review, which changed 6 grades.
- **Runs:** one per question.

| | Google only | Choice of engines |
|---|---|---|
| Correct / partly / wrong | 93 / 3 / 4 | **95** / 2 / 3 |
| Chinese (40) | 39 | 39 |
| Korean (40) | 35 | 36 |
| English (20) | 19 | 20 |
| Answer was in its search results | 96 | 94 |
| Searches per question | 2.2 | 2.4 |
| Time per answer | **32.5 s** | 39.5 s |

**Insights**
1. **Google alone already handles local Chinese and Korean questions.** With Google only, 27b answered 93 of 100, including county-level Chinese and district-level Korean facts, and the answer was in Google's results for 96 of them.
2. **Offering more engines didn't measurably improve accuracy.** It scored 95 vs 93, with 5 questions only the choice got right and 3 only Google got right, which could easily be chance (p = 0.73).
3. **Where the extra engines helped, it was very fresh or very local news:**
   - **Naver** found the new head of a Seoul district (동작구) that six Google searches missed.
   - **Google News** found a golf award decided two days earlier, while the Google-only run trusted August standings and named the runner-up.
   - **Baidu** found the name of Xiaomi's new phone chip on the first search.
4. **27b treats Baidu and Naver as a second opinion, never a replacement.** It used Baidu on 18 of 40 Chinese questions and Naver on 8 of 40 Korean ones, always next to Google. Its first search went to Google on 34 of 40 questions in each language.
5. **The choice costs time.** Answers took 22% longer, because of more searches and bigger, slower results:
   - Baidu: 749 tokens in 4.0 s per search
   - Naver: 828 tokens in 2.5 s
   - Google: 590 tokens in 1.2 s
6. **Even the 27B model misuses engines.**
   - It invented a `bing` engine twice; Ollama doesn't enforce the tool's enum.
   - It used Baidu for Korean questions three times.
   - Both did no harm here, but validate tool arguments in code.
7. **The remaining misses come from the queries, not the engines.** Qwen put guessed names ("박성한", "폰세") and the previous year into its searches, in both setups.

**Takeaways for developers**
- **Default:** Google through SerpApi is a strong default, even for Chinese and Korean local questions.
- **When to add more:** add Naver, Baidu or Google News for very recent or hyper-local questions, and expect slower answers.
- **Small models won't use the extra engines unless told firmly** (see the side test above).

**Caveat:** the research agents found and checked these answers with web search, which may favor facts that Google already indexes well.

## Small model with search vs big model without (`known_facts`)

**Setup**
- **Questions:** 100 old, stable facts, all true since before 2020, so a model could know them from training.
  - **Languages:** 60 English, 20 Chinese and 20 Korean.
  - **Difficulty:** 25 easy (who painted *The Starry Night*), 43 medium (who proclaimed Haiti's independence) and 32 hard (who first synthesized urea).
- **Runs:** every question asked twice on each model, once with no search and once with SerpApi, which the model may choose to use. One run per question.
- **Grading:** a text match, then an AI review, which changed 20 grades.

| | No search | With search | Searched on | Time per answer, no search → with search | Thinking tokens per answer, no search → with search |
|---|---|---|---|---|---|
| 27b | 82 | 91 | 31 questions | 11.5 s → 17.4 s | 250 → 282 |
| 9b | 75 | **97** | 74 questions | 80.6 s → **8.1 s** | 4,235 → 344 |
| 4b | 66 | **95** | 72 questions | 53.9 s → **7.7 s** | 4,336 → 500 |

The scores are correct answers out of 100. Korean, no search → with search: 27b 7 → 14, 9b 4 → 19, 4b 2 → 16 (out of 20).

**Insights**
1. **A 4B model with search beats a 27B model without it.** 4b with search scored 95 against 82 for 27b from memory alone: 15 questions only 4b got right, 2 the other way (p = 0.002). 9b with search scored 97 (16 vs 1, p = 0.0003).
2. **The small models with search even edged out 27b with search** (97 and 95 vs 91), because 27b trusted its memory. It searched only 31 of the 100 facts, and 7 of its 9 misses were questions it didn't search. 9b and 4b searched about three quarters of them. These two gaps aren't statistically solid (p = 0.11 and 0.34), but the pattern is clear: the model that searches more wins.
3. **Search makes small models faster, not slower.** Without search, 9b and 4b thought for over 4,000 tokens per answer trying to remember, taking 54–81 seconds on average and sometimes 10 minutes. With search, they answered in about 8 seconds using 344–500 tokens, faster than 27b in either mode.
4. **Long thinking is a warning sign.** Without search, 9b's correct answers took a median of 1,867 thinking tokens and its wrong ones 7,369. 4b: 2,042 vs 7,352. 27b: 169 vs 384.
5. **Without search, models guess instead of admitting they don't know.** The prompt says "if you can't confirm it, say so", yet 27b guessed wrong 16 times and abstained once; 9b guessed 22 times and abstained twice. 4b abstained more (12 times), but several of those "abstentions" claimed the fact was unrecorded or denied that the event happened.
6. **Korean is where memory fails, and search fixes it.** Without search the models scored 2–7 of 20 on old Korean facts, mostly by inventing names. With search, 9b got 19 of 20. English and Chinese facts were mostly known already: 27b got 20 of 20 Chinese without search.
7. **Search also helps the big model.** 27b went from 82 to 91 with search (10 vs 1, p = 0.01), all on medium and hard facts. It would gain more if it searched more often.
8. **When the models did search, the answer was in the results almost every time:** 28 of 31 for 27b, 73 of 74 for 9b, 71 of 72 for 4b. On old facts, SerpApi's top 5 results nearly always contain the answer.

**Takeaway for developers:** a small local model plus web search is more accurate and faster than a model six times its size answering from memory. And a big model needs to be nudged to search, because it overestimates what it knows.
