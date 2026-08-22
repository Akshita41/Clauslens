import Link from "next/link";
import { ButtonLink } from "@/components/ui";
import {
  ArrowRight,
  Chart,
  Logo,
  Quote,
  Scissors,
  ShieldCheck,
} from "@/components/icons";

const steps = [
  {
    n: "01",
    title: "Upload the contract",
    body: "Drop in a PDF. ClauseLens reads it page by page and keeps track of where every sentence came from.",
  },
  {
    n: "02",
    title: "It splits into clauses",
    body: "Not into fixed-size chunks — into real clauses, so a liability cap never gets separated from its carve-out.",
  },
  {
    n: "03",
    title: "You review, it cites",
    body: "Key terms, risk flags and answers arrive with the clause number and page attached. Accept or reject each one.",
  },
];

const features = [
  {
    icon: Scissors,
    title: "Clause-level understanding",
    body: "Contracts are split on their own structure — numbered headings, articles, defined-term blocks — instead of being cut every 900 tokens. Meaning survives the split.",
  },
  {
    icon: Quote,
    title: "Every answer cites its source",
    body: "Each extracted term, risk flag and answer names the clause and page it came from. If the model can't point to a clause, it says “not found in this contract” rather than guessing.",
  },
  {
    icon: ShieldCheck,
    title: "Reviewed against your playbook",
    body: "Your standard positions, applied to their paper. Flags come back as OK, Caution or High risk with a plain-English reason — and you accept or reject each one.",
  },
  {
    icon: Chart,
    title: "Accuracy you can check",
    body: "A published accuracy page: how often each field is right on a labelled test set, what a review costs, how long it takes. Including the fields it's worst at.",
  },
];

export default function LandingPage() {
  return (
    <div className="wash min-h-full">
      {/* ── Nav ───────────────────────────────────────────── */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2.5 text-plum-800">
          <Logo width={28} height={28} />
          <span className="font-display text-lg tracking-[-0.01em]">ClauseLens</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-plum-700 md:flex">
          <a href="#how" className="transition-colors hover:text-plum-900">
            How it works
          </a>
          <a href="#features" className="transition-colors hover:text-plum-900">
            Features
          </a>
          <Link href="/accuracy" className="transition-colors hover:text-plum-900">
            Accuracy
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm text-plum-700 transition-colors hover:bg-white/60 sm:block"
          >
            Sign in
          </Link>
          <ButtonLink href="/contracts" size="sm">
            Open the demo
          </ButtonLink>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 md:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          <div className="animate-rise">
            <p className="eyebrow mb-5">Contract review, grounded</p>
            <h1 className="font-display text-[2.7rem] leading-[1.06] tracking-[-0.025em] text-plum-900 sm:text-[3.4rem]">
              Read the contract
              <br />
              <span className="italic text-plum-600">before</span> you sign it.
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-plum-700/85">
              ClauseLens pulls the deal terms out of a contract, checks each clause
              against your playbook, and answers your questions — every single
              output pointing at the exact clause and page it came from.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink href="/contracts" size="lg">
                Review a contract
                <ArrowRight width={17} height={17} />
              </ButtonLink>
              <ButtonLink href="/accuracy" size="lg" variant="secondary">
                See the accuracy numbers
              </ButtonLink>
            </div>
            <p className="mt-6 text-[13px] text-muted">
              A portfolio project. Real pipeline, real citations, published
              evaluation — not a wrapper around one prompt.
            </p>
          </div>

          {/* Preview card */}
          <div className="animate-rise [animation-delay:120ms]">
            <PreviewCard />
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section id="how" className="border-t border-line/70 bg-white/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow mb-3">How it works</p>
          <h2 className="max-w-xl font-display text-[2rem] leading-tight tracking-[-0.02em] text-plum-900">
            Three steps, and you can check every one of them.
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n}>
                <span className="font-display text-[2.4rem] leading-none text-rose-300">
                  {s.n}
                </span>
                <h3 className="mt-4 font-display text-lg text-plum-900">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <p className="eyebrow mb-3">What makes it different</p>
        <h2 className="max-w-2xl font-display text-[2rem] leading-tight tracking-[-0.02em] text-plum-900">
          Most contract tools ask you to trust them. This one shows its working.
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group rounded-3xl border border-line bg-white p-8 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="grid size-11 place-items-center rounded-2xl bg-rose-50 text-plum-600 transition-colors group-hover:bg-rose-100">
                  <Icon width={21} height={21} />
                </div>
                <h3 className="mt-5 font-display text-xl tracking-[-0.01em] text-plum-900">
                  {f.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{f.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Numbers strip ─────────────────────────────────── */}
      <section className="border-y border-line/70 bg-white/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-3">
          {[
            { k: "89%", v: "field-level accuracy across 8 deal terms" },
            { k: "$0.04", v: "average API cost to review one contract" },
            { k: "7.4s", v: "average end-to-end extraction latency" },
          ].map((stat) => (
            <div key={stat.k}>
              <p className="font-display text-[2.6rem] leading-none tracking-[-0.02em] text-plum-800">
                {stat.k}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{stat.v}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto max-w-6xl px-6 pb-10">
          <p className="text-[13px] text-muted">
            Measured on a hand-labelled set of five contracts — small enough that
            these numbers carry real error bars, and the{" "}
            <Link href="/accuracy" className="text-plum-600 underline underline-offset-4">
              accuracy page
            </Link>{" "}
            says so.
          </p>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="mx-auto max-w-xl font-display text-[2.2rem] leading-tight tracking-[-0.02em] text-plum-900">
          Try it on a contract you already know.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
          The fastest way to judge a review tool is to run it on something you have
          already read, and see whether it finds what you found.
        </p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/contracts" size="lg">
            Open ClauseLens
            <ArrowRight width={17} height={17} />
          </ButtonLink>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-line/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5 text-plum-700">
            <Logo width={22} height={22} />
            <span className="font-display">ClauseLens</span>
          </div>
          <p className="text-[13px]">
            Not legal advice. A demonstration project for contract review with
            grounded citations.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ── The floating product preview in the hero ─────────────────────── */

function PreviewCard() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-rose-100/50 blur-2xl" />
      <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-lift">
        <div className="flex items-center justify-between border-b border-line bg-cream/60 px-5 py-3.5">
          <div className="flex items-center gap-2 text-plum-700">
            <span className="size-2 rounded-full bg-rose-300" />
            <span className="text-[13px] font-medium">BrightHarbor_MSA.pdf</span>
          </div>
          <span className="rounded-full border border-sage-200 bg-sage-50 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-sage-700 uppercase">
            Ready
          </span>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-2xl border border-clay-200 bg-clay-50/60 p-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-clay-200 bg-white px-2 py-0.5 text-[10px] font-semibold tracking-wider text-clay-700 uppercase">
                High risk
              </span>
              <span className="text-[11px] text-muted">Clause 8.4 · page 8</span>
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-plum-800">
              The indemnity you give is uncapped and sits outside the liability
              cap. Theirs is capped and covers IP claims only.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              ["Liability cap", "Fees paid in preceding 24 months", "8.1"],
              ["Termination notice", "120 days for convenience", "9.2"],
              ["Governing law", "Delaware, USA", "11.4"],
            ].map(([k, v, c]) => (
              <div key={k} className="flex items-baseline justify-between gap-4">
                <span className="shrink-0 text-[12px] text-muted">{k}</span>
                <span className="h-px flex-1 translate-y-[-2px] bg-line" />
                <span className="text-right text-[12.5px] text-plum-800">{v}</span>
                <span className="shrink-0 rounded-md bg-plum-50 px-1.5 py-0.5 font-mono text-[10px] text-plum-500">
                  §{c}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
