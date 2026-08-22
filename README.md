# ClauseLens

Contract review for small law firms and startup founders. Upload a contract PDF
and get the key deal terms, a risk review against your playbook, and answers to
your questions — where **every output cites the exact clause and page it came
from**.

> **Build status:** the full frontend is complete and running on mock data. The
> pipeline (PDF parsing, clause splitting, embeddings, Claude calls) is not wired
> up yet. See [Roadmap](#roadmap).

---

## Why this exists

Most AI contract tools ask you to trust a summary. This one is built the other
way around: nothing appears in the interface unless it can point at the clause it
came from, and if the model cannot cite a clause, the answer is rejected before
it reaches the screen.

---

## The four decisions this project is really about

### 1. Clauses, not chunks

Contracts are split on their own structure — numbered headings (`4.2`,
`Section 4.2`, `ARTICLE V`), short ALL-CAPS headings, `(a)`-style sub-items —
not every N tokens.

A fixed-size window will happily cut a liability cap away from its carve-out.
Retrieval then returns half an obligation, and the model answers confidently from
the half it can see. Clause boundaries are where the legal meaning actually ends,
so that is where the splits go.

When a PDF yields fewer than three detectable boundaries, the splitter falls back
to paragraph chunking and the contract is **visibly marked** as a fallback split
rather than silently degrading.

### 2. Hybrid retrieval, entirely inside Postgres

Postgres `tsvector` keyword search and pgvector cosine similarity, each ranked
and then merged with reciprocal rank fusion. About 40 lines. No LangChain, no
vector database, and deliberately no ANN index — at roughly a thousand clauses an
exact scan is sub-millisecond, and adding HNSW would be cargo cult.

Contracts are keyword-dense (defined terms in Title Case, `indemnif*`,
`Force Majeure`), which pure vector search misses. But "can they walk away early"
never matches the word *termination*, which pure keyword search misses. Both are
needed.

### 3. Grounded citations, enforced not requested

Every model response is validated with zod, then checked a second way that a
schema cannot express: **each cited `clause_id` must exist and belong to this
contract**. A miss rejects the entire response and retries once with the
violation quoted back. A second failure returns *"not found in this contract"*
rather than an uncited answer.

You can see this in the demo — ask the contract something it does not cover and
watch it refuse instead of improvise.

### 4. Confidence as triage, not as truth

Each extracted field carries a model-reported confidence. That number is not
calibrated and this project does not pretend otherwise — it is used to order your
review queue and tint the rows worth a second look. Risk flags are then accepted
or rejected by a human, and those verdicts are recorded.

---

## Screens

| Route | What it does |
|---|---|
| `/` | Landing page |
| `/login`, `/signup` | Auth screens (not yet wired to Supabase) |
| `/contracts` | Upload a PDF, see all your contracts and their pipeline status |
| `/contracts/[id]` | The workspace: deal terms, risk review, Q&A — with a source-clause rail |
| `/playbook` | The seven standard positions every contract is measured against |
| `/accuracy` | Field-level accuracy, cost and latency on a labelled test set |

---

## Architecture

```
Browser ──upload──▶ Supabase Storage (PDF)
   │
   ├─ POST /api/contracts/[id]/parse     pdfjs → clause splitter → embeddings → Postgres
   ├─ POST /api/contracts/[id]/extract   Haiku → 8 deal terms, each with a citation
   ├─ POST /api/contracts/[id]/analyze   Sonnet → risk flags vs the playbook
   │        (the client runs these three in sequence and shows real progress)
   │
   └─ POST /api/contracts/[id]/ask       hybrid retrieval → Sonnet → cited answer
```

**Why three endpoints instead of a job queue.** A long pipeline should not block a
single request, but a queue is not the only way to avoid that. Three sequential
calls, each updating `contracts.status`, give the user a genuine progress bar,
keep every request inside Vercel's free 60-second limit, and need no
infrastructure at all. This stops being adequate with concurrent users or
contracts beyond ~50 pages — at that point the answer is a queue, and it is a
deliberate *later*, not an oversight.

### Stack

Next.js (App Router) · React · Tailwind v4 · Supabase (Postgres + pgvector + Auth
+ Storage) · Anthropic Claude (Haiku for extraction and Q&A, Sonnet for risk
reasoning) · Voyage AI embeddings · pdfjs-dist · zod · Vitest

### Data model

```sql
contracts    id, user_id, filename, storage_path, page_count, status, created_at
clauses      id, contract_id, clause_no, heading, text, page, embedding vector(1024)
extractions  id, contract_id, field_name, value, confidence, clause_id
risk_flags   id, contract_id, clause_id, severity, reason, rule_id, human_verdict
```

Four tables, row-level security on all of them. Playbook rules are a constants
file, not a table. Evaluation runs are JSON files committed to the repo.

---

## Running it

```bash
npm install
npm run dev
```

Open http://localhost:3000. No environment variables are needed yet — every
screen runs on the fixtures in `lib/mock-data.ts`.

---

## Project layout

```
app/
  (auth)/          login, signup
  (app)/           authenticated shell — contracts, playbook, accuracy
  page.tsx         landing
components/
  contract/        workspace, deal terms, risk review, ask panel, clause rail
  ui.tsx           buttons, badges, confidence pills, empty states
  icons.tsx        hand-rolled icon set
lib/
  types.ts         shapes shared by UI and database
  mock-data.ts     fixtures — replaced by Supabase queries
docs/
  PLAN.md          scope, decisions, roadmap
  STATUS.md        what is built, what is next
```

---

## Roadmap

- [x] **Frontend** — every screen, on mock data
- [ ] **Supabase** — schema, RLS, auth, storage
- [ ] **Pipeline** — pdfjs parsing, clause splitter, Voyage embeddings
- [ ] **Extraction** — 8 deal terms via Claude, zod-validated, with citations
- [ ] **Risk review** — playbook rules → flags, verdicts persisted
- [ ] **Q&A** — hybrid retrieval, citation verification
- [ ] **Accuracy** — label 5 contracts, `npm run eval`, publish the numbers
- [ ] **Guardrail test** — hostile contract that tries to hijack the model

---

## Known limitations

These are deliberate, and stated rather than hidden.

- **No OCR.** Scanned PDFs are detected and rejected. A silent bad read is worse
  than a clear refusal.
- **Small test set.** Accuracy is measured on five hand-labelled contracts, which
  is enough to catch a prompt change that makes things clearly worse and not
  enough to claim a precise figure. The accuracy page says so on the page itself.
- **Confidence is uncalibrated.** It orders your review queue. It is not a
  probability.
- **Sequential processing.** Long contracts will approach the request timeout.
- **Not legal advice.** It is a first pass that tells you where to look.
