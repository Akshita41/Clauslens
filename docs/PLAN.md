# ClauseLens — Plan v2 (scope-corrected)

Status: plan only, no code written.

**What this is:** a small, polished LegalTech AI SaaS. Upload a contract PDF →
it splits into clauses → extracts key deal terms → flags risky clauses against a
playbook → answers questions with citations → you accept or reject each flag →
an in-app Accuracy page shows how well it actually does.

**What this is not:** a queue-backed distributed pipeline with an evaluation
platform bolted on. v1 of this plan was that, and it was wrong for the goal.

**Budget:** free tiers only. The Anthropic API key is the sole paid dependency.
No credit card required for anything.

**Target effort:** ~22 hours, three stages, each one independently demo-able.

---

## 1. The test applied to every component

The question for each piece was: *does this materially improve the
portfolio/interview value?*

### Removed

| Cut | Why it failed the test |
|---|---|
| BullMQ + Redis + separate worker process | Queue plumbing is undifferentiated. Nobody asks an early-career candidate to explain BullMQ. It also forces local-only hosting, which costs a live demo URL — a real loss for a much bigger loss. |
| Cloudflare R2 | Needs a card. Supabase Storage does the identical job in 3 lines with the client already installed, and drops two AWS SDK packages. |
| HNSW index | At ~1,000 clauses an exact scan is sub-millisecond. Adding an ANN index would be cargo cult. *Knowing why not to* is the better answer. |
| `eval_runs` / `eval_results` tables | Eval runs are ~5 JSON files. Committing them to the repo means a reviewer sees real numbers without running anything. Strictly better than a database. |
| Prompt version A/B diff + regression banner | Only pays off across dozens of runs over months. This is a portfolio project, not a maintained model service. |
| Confidence calibration analysis | Calibrating a model-reported number requires far more labelled data than we will have. Keeping the analysis would mean publishing a meaningless correlation. |
| `sha256` content-hash caching | Solves a cost problem that only exists at 40 contracts. We will have 5. |
| Playbook rules CRUD table + UI | A whole authenticated CRUD screen to manage 7 rules. The rules ship as a constant file instead. |
| pdfjs coordinate extraction (x/y) | Only needed to draw highlight boxes on a rendered PDF. We cite *page numbers*, which per-page text extraction already gives. |
| Multiple deploy environments, `tsx`, `dotenv`, `ioredis` | Node 24 runs TypeScript and loads `--env-file` natively. The rest went with the worker. |

### Kept

| Kept | Why it passed |
|---|---|
| Clause-level splitting | The actual differentiator. "I didn't chunk by tokens, and here's the specific contract question that breaks when you do." |
| Hybrid retrieval (keyword + vector) | ~40 lines total, and contracts are keyword-dense enough that pure vector search visibly fails on defined terms. A concrete failing example is worth more than the feature. |
| Grounded citations with validation | Rejecting an answer whose cited clause doesn't exist is the single most interesting thing in the project. Almost nobody implements it. |
| Prompt-injection guardrail | Two hours of work, and it is the AI-engineering-specific instinct that separates you from a full-stack dev who called an API. |
| Simple confidence (high/med/low) | Drives which rows the human review UI highlights. One column, real product purpose. |
| In-app Accuracy page | A *product feature* answering "how much should I trust this?", not an eval platform. Real numbers on a resume project are rare. |
| Anthropic prompt caching | Two lines (`cache_control`), directly cuts your API bill on the same document. |

---

## 2. Architecture

```
Browser ──upload──> Supabase Storage (PDF)
   │
   ├─ POST /api/contracts/[id]/parse     pdfjs → clauses → embeddings → Postgres
   ├─ POST /api/contracts/[id]/extract   Haiku → 8 deal terms + citations
   ├─ POST /api/contracts/[id]/analyze   Sonnet → risk flags vs playbook
   │        (client calls these three in sequence, polling status)
   │
   └─ POST /api/contracts/[id]/ask       hybrid retrieval → Sonnet → cited answer
```

**Why three endpoints instead of a job queue.** A long pipeline still needs to
not block a single request. Splitting it into three sequential calls, each
updating `contracts.status`, gives the user a real progress bar, keeps every
request under Vercel's free 60-second limit, and needs zero infrastructure. The
README states plainly when this stops being adequate (concurrent users,
contracts over ~50 pages) and that a queue is the answer at that point. That is
a better interview moment than having built the queue.

### Stack

- Next.js App Router + React + Tailwind
- Supabase free tier: Postgres + pgvector + Auth + Storage
- `@anthropic-ai/sdk` — Haiku 4.5 for extraction and Q&A, Sonnet 5 for risk reasoning
- Voyage AI embeddings via plain `fetch`, one env var
- `pdfjs-dist` for per-page text
- `zod` for validating every model response
- `vitest` — about 5 tests, not a test suite
- Deployed on Vercel free tier. One environment.

Full dependency list, beyond what `create-next-app` installs:
`@supabase/supabase-js`, `@supabase/ssr`, `@anthropic-ai/sdk`, `pdfjs-dist`,
`zod`, `vitest`. That is six.

### Data model — 4 tables

```sql
contracts    id, user_id, filename, storage_path, page_count, status, created_at
clauses      id, contract_id, clause_no, heading, text, page, embedding vector(1024)
extractions  id, contract_id, field_name, value, confidence, clause_id
risk_flags   id, contract_id, clause_id, severity, reason, rule_id, human_verdict
```

RLS on all four, scoped by `user_id` (joined through `contract_id` for the
child tables). Playbook rules live in `lib/playbook.ts`. Eval runs live in
`evals/runs/*.json`.

---

## 3. The four things worth explaining in an interview

### 3.1 Clause splitting

Deterministic, no LLM, ~120 lines in `lib/clauses/split.ts`. pdfjs gives text
per page; join into a document while recording where each page starts. Split on:
numbered headings (`4.2`, `Section 4.2`, `ARTICLE V`), short ALL-CAPS lines, and
`(a)`-style sub-items. Merge fragments under 200 characters into the previous
clause. If fewer than 3 boundaries are found, fall back to paragraph splitting
and record `status = 'parsed_fallback'` so the degradation is visible, not silent.

Each clause stores `clause_no`, `heading`, `text`, and `page`.

**The README argument:** a 900-token window will happily cut a liability cap away
from its carve-out. Retrieval then returns half an obligation and the model
answers confidently from the half it can see. Clause boundaries are where the
legal meaning actually ends.

### 3.2 Hybrid retrieval

One SQL query: Postgres `tsvector` keyword search and pgvector cosine similarity,
each ranked, merged with reciprocal rank fusion (`1 / (60 + rank)`). Roughly 40
lines. No LangChain, no ANN index, no vector database.

**The README argument:** vector search alone missed a query naming a defined term
in Title Case; keyword search alone missed "can they walk away early" → the
termination clause. Both examples go in the README as real before/after output.

### 3.3 Grounded citations

Every model response is validated by zod, then checked a second way that zod
cannot do: each cited `clause_id` must exist **and** belong to this contract. A
miss rejects the whole response and retries once with the violation quoted back;
a second failure returns "not found in this contract" rather than an
uncited answer. Lives in `lib/ai/verify.ts`.

### 3.4 Prompt-injection guardrail

Contract text only ever appears inside `<untrusted_document>` tags, never
interpolated into the instruction part of a prompt, with an explicit system rule
that content inside those tags is data. One hostile test PDF in `evals/` contains
a line instructing the model to mark every clause as OK. A vitest asserts the
unlimited-liability clause is still flagged HIGH RISK. The README shows the real
output.

---

## 4. The Accuracy page (the eval feature)

Framed as a product feature — "how accurate is ClauseLens?" — not a platform.

- **Test set: 5 contracts from CUAD, 8 fields each = 40 labels.** One sitting,
  about an hour. Stored as `evals/golden.json`.
- `npm run eval` runs the pipeline over those 5, compares to the labels, writes
  `evals/runs/<date>.json`, prints a summary.
- `/accuracy` reads the committed JSON files and shows: per-field accuracy,
  overall accuracy, total cost, cost per contract, average latency, and a small
  table of which specific fields were wrong.

Cost and latency come from `response.usage` on each Anthropic call, summed by
the eval script. No `llm_calls` table.

Being able to say *"extraction is 87% accurate across 8 fields, costs $0.04 per
contract, and governing law is my weakest field at 60%"* is the single most
valuable sentence in this project. Everything above exists to make that sentence
true.

Extraction fields: parties, effective date, term length, renewal, termination
notice, liability cap, indemnity, governing law.

---

## 5. Roadmap

### Stage 1 — MVP (~8 h): "it works"

Goal: upload a real contract and see correct extracted terms with citations.

1. `create-next-app`, Tailwind, Supabase project, one SQL migration (4 tables,
   pgvector, RLS)
2. Supabase email auth, protected routes
3. Upload PDF to Supabase Storage, row in `contracts`, `/contracts` list
4. `/api/parse`: pdfjs → clause splitter → Voyage embeddings → `clauses`
5. `/api/extract`: Haiku, zod-validated, 8 fields with `clause_id` + confidence
6. `/contracts/[id]`: deal-terms table, each row clickable to reveal the cited
   clause text and page

**Demo-able at the end of Stage 1.** If you stopped here you would still have a
respectable project.

### Stage 2 — The product (~7 h): "it's trustworthy"

7. Hybrid retrieval query + `/api/ask`, Q&A panel with inline citations and a
   "clauses retrieved" list
8. `lib/playbook.ts` with 7 rules; `/api/analyze` → Sonnet → risk flags with
   severity, plain-English reason, and cited clause
9. Review UI: OK / CAUTION / HIGH RISK badges, accept or reject each flag,
   low-confidence rows highlighted, click a flag to jump to its clause

### Stage 3 — Resume-ready (~7 h): "it's measured and it's mine"

10. Label 5 CUAD contracts → `evals/golden.json`
11. `npm run eval` + `/accuracy` page, run it, commit the results
12. Injection test PDF + vitest, plus ~4 tests on the clause splitter
13. Deploy to Vercel, seed a demo account
14. README: architecture diagram, the four decisions in §3 in plain English, the
    real accuracy and cost numbers, the honest limitations list, setup steps
15. A 90-second screen recording linked at the top of the README

---

## 6. Known limitations, stated up front in the README

Owning these is worth more than hiding them.

- Scanned PDFs are rejected (no OCR) — detected via text-per-page threshold
- Tested on 5 contracts, so the accuracy figure has wide error bars, and the
  README says so with the actual sample size
- Confidence is model-reported and uncalibrated; it orders the review queue, it
  is not a probability
- Sequential API calls, so contracts over ~50 pages will approach the request
  timeout — a queue is the fix, deliberately not built
- Single-tenant assumptions in places; RLS is enforced but not load-tested

---

## 7. Cost control

- Haiku for extraction and Q&A; Sonnet only for risk reasoning
- `cache_control` on the contract text block — 8 extraction fields against one
  document means the document is billed near-full price once, ~10% after
- 5 contracts in the test set, not 40
- Short contracts (5–15 pages) chosen from CUAD for the demo and test set
- A printed cost estimate before `npm run eval` runs

Realistic total spend across the whole build, including re-runs while iterating:
a few dollars.

---

## 8. Accounts needed (all free, no card)

1. **Supabase** — project URL, anon key, service-role key, plus a `contracts`
   storage bucket. Needed for Stage 1.
2. **Voyage AI** — one API key. Free tier, no card at time of writing. Needed at
   step 4. *If signup demands a card, the fallback is Google's free embedding
   API — still one env var and a `fetch`, no code restructuring.*
3. **Anthropic** — already held. Needed at step 5.
4. **Vercel** — free hobby tier. Needed at step 13.

Note: Supabase free projects pause after about a week of inactivity. One click to
wake, but do not discover that the night before an interview.
