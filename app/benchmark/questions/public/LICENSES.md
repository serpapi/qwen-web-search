# Licences of the public benchmark material

The repo's MIT licence covers our code and our own questions. The files in this folder are samples of public datasets, and each keeps its original licence. [`app/grade.py`](../../../grade.py) also uses OpenAI's SimpleQA grading prompt, unchanged, under its MIT licence (below).

| File | Dataset | Source and pinned version | Licence | What we changed |
|---|---|---|---|---|
| [`simpleqa_verified.yaml`](simpleqa_verified.yaml) | SimpleQA Verified, Haas et al. 2025, Google DeepMind ([arXiv 2509.07968](https://arxiv.org/abs/2509.07968)) | [google/simpleqa-verified](https://huggingface.co/datasets/google/simpleqa-verified), revision `0dc97e0d28d8233463e005cdc4475cc2a13ba2dc` (2026-03-09) | MIT | Sampled 400 of 1,000 questions in proportion to topic (seed 2026), renamed the fields, added `accept`, and removed a stray ")" from some source links |
| [`frames.yaml`](frames.yaml) | FRAMES, Krishna et al. 2024, Google ([arXiv 2409.12941](https://arxiv.org/abs/2409.12941)) | [google/frames-benchmark](https://huggingface.co/datasets/google/frames-benchmark), revision `58d9fb6330f3ab1316d1eca12e5e8ef23dcc22ef` (2024-10-15) | Apache-2.0 ([text](LICENSE-Apache-2.0.txt)) | Sampled 400 of the 722 questions whose answer has 60 characters or fewer (seed 2026), renamed the fields and added `accept` |
| [`livenewsbench.yaml`](livenewsbench.yaml) | LiveNewsBench, Zhang et al. 2026, Columbia University ([arXiv 2602.13543](https://arxiv.org/abs/2602.13543)) | [YunfanZhang42/LiveNewsBench](https://github.com/YunfanZhang42/LiveNewsBench), commit `8a6b96e7904893977ac8a3ae3342ae3d39f89c2e`, `datasets/jan_2026_release_2/human_verified_test.jsonl` | MIT | Kept all 200 questions but only their question, answer, event date and category (the news article text is left out), renamed the fields and added `accept` |

LiveNewsBench's canary string is kept at the top of its file, so training pipelines that filter it leave these questions out.

## MIT licence (SimpleQA Verified, LiveNewsBench)

SimpleQA Verified declares the MIT licence on its dataset card without a copyright line. LiveNewsBench's licence reads:

```
MIT License

Copyright (c) 2025 LiveNewsBench

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## MIT licence (SimpleQA grading prompt in `app/grade.py`)

From [openai/simple-evals](https://github.com/openai/simple-evals), `simpleqa_eval.py`, commit `5e623c2b400af62a1278e23595f95b0853d7fe8a`:

```
MIT License

Copyright (c) 2024 OpenAI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Apache License 2.0 (FRAMES)

The full text is in [`LICENSE-Apache-2.0.txt`](LICENSE-Apache-2.0.txt).
