# Status — end of the frontend build

Last updated: 22 Aug 2026

---

## Done (nothing left to do here)

**The whole frontend, on mock data.** Eight routes, all building clean, no
console errors, no horizontal overflow, mobile layouts included.

| Screen | State |
|---|---|
| `/` landing | Hero, how-it-works, features, stats strip, footer |
| `/login` · `/signup` | Styled forms, fake submit, both routed to the workspace |
| `/contracts` | Contract list with 5 fixtures covering every status, drag-and-drop upload with an animated 3-step pipeline |
| `/contracts/[id]` | Three tabs — deal terms, risk review, ask — plus the source-clause rail |
| `/playbook` | The 7 playbook rules |
| `/accuracy` | Headline stats, per-field bars with run-over-run deltas, misses table |

**Interactions verified working in the browser:**

- Clicking any deal term opens its clause (§8.1, page 8) in the right rail
- Risk flags accept/reject and toggle off again; 7 flags, counts by severity
- Q&A answers with source chips and an expandable "clauses retrieved" list
  showing fusion scores
- **The guardrail path works**: asking something the contract does not cover
  returns *"Not found in this contract"* instead of inventing an answer

**Design system.** Warm ivory ground, plum primary, dusty-rose accent, sage /
amber / clay for OK / Caution / High risk. Fraunces (serif) for headings, Inter
for UI. All tokens live in `app/globals.css` — change the palette in one place.

**Also done:** branded SVG favicon, README with the four engineering decisions
written out, `docs/PLAN.md` with the full scope, Turbopack lockfile warning
fixed.

**Dependencies installed: zero beyond `create-next-app`.** Icons are hand-drawn
SVG rather than an icon library; `cn()` is eight lines rather than `clsx` +
`tailwind-merge`.

---

## Your turn — three things, in this order

### 1. Look at it and tell me what to change (30 min)

```bash
npm run dev
```

Then walk `/` → `/contracts` → click a contract → all three tabs → `/accuracy`.

Specifically decide:
- **Is the palette right?** Too pink, not pink enough, too muted? Every colour is
  a token at the top of `app/globals.css`, so this is a five-minute change.
- **Is Fraunces the right heading font?** Alternatives that fit the same brief:
  Playfair Display (more classical), Cormorant (lighter, more delicate),
  Instrument Serif (more modern).
- **Anything missing from a screen** before we make it real.

If you have Canva templates you liked, send me a screenshot and I will match the
type scale and spacing to it.

### 2. Create a Supabase project (15 min, free, no card)

At [supabase.com](https://supabase.com) → new project. Then send me, or put in
`.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Also create a **storage bucket named `contracts`**, set to private.

> Note: free Supabase projects pause after about a week of no activity. One click
> to wake — just do not discover that the night before an interview.

### 3. Check whether Voyage AI is still free (5 min)

Sign up at [voyageai.com](https://voyageai.com) and see whether the free tier
asks for a credit card.

- **No card asked** → grab the API key, we use it.
- **Card asked** → tell me, and we switch to Google's free embedding API. It is
  one environment variable and one `fetch`, so nothing in the code has to be
  restructured.

Either way: **no paid dependency gets added.** Your Anthropic key stays the only
thing that spends money.

---

## Not needed yet

Do not sign up for these until we reach them:

- **Anthropic key** — not needed until extraction (you already have it)
- **Vercel** — not needed until we deploy
- **CUAD contracts** — not needed until we label the test set

---

## What I do next, once you have looked

1. Supabase schema — 4 tables, pgvector, RLS policies
2. Real auth, replacing the fake forms
3. Real upload to Supabase Storage
4. Swap `lib/mock-data.ts` for live queries

Step 4 is intentionally cheap: every component already reads the shapes in
`lib/types.ts`, which are the database columns. Wiring the backend should not
require touching the UI.

---

## One thing worth doing early

Label the five test contracts **before** the extraction prompt gets written, not
after. Deciding by hand what the correct answer is for "term length" on five real
contracts is what tells us the prompt is ambiguous — and finding that out after
the code exists means rewriting it. It costs no extra hours, only a different
order.
