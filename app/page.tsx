import Image from "next/image";
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
    <div className="min-h-full">
      {/* ── Nav ───────────────────────────────────────────── */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-2.5 text-cocoa-800">
            <Logo width={28} height={28} />
            <span className="font-display text-lg tracking-[-0.01em]">
              ClauseLens
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-cocoa-700 md:flex">
            <a href="#how" className="transition-colors hover:text-blush-600">
              How it works
            </a>
            <a href="#features" className="transition-colors hover:text-blush-600">
              Features
            </a>
            <Link href="/accuracy" className="transition-colors hover:text-blush-600">
              Accuracy
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 text-sm text-cocoa-700 transition-colors hover:bg-white/70 sm:block"
            >
              Sign in
            </Link>
            <ButtonLink href="/contracts" size="sm">
              Open the demo
            </ButtonLink>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="wash relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-32 pb-24 md:pt-40">
          <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_1fr]">
            <div className="animate-rise">
              <p className="eyebrow mb-6">Contract review, grounded</p>
              <h1 className="font-display text-[2.9rem] leading-[1.02] tracking-[-0.03em] text-cocoa-900 sm:text-[3.9rem]">
                Read the contract
                <br />
                <span className="text-blush-500 italic">before</span> you sign it.
              </h1>
              <p className="mt-7 max-w-lg text-[17px] leading-relaxed text-cocoa-700/85">
                ClauseLens pulls the deal terms out of a contract, checks each
                clause against your playbook, and answers your questions — every
                single output pointing at the exact clause and page it came from.
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
              <p className="mt-7 text-[13px] leading-relaxed text-muted">
                A portfolio project. Real pipeline, real citations, published
                evaluation — not a wrapper around one prompt.
              </p>
            </div>

            {/* Arch-cropped photograph, echoing the reference layout */}
            <div className="animate-rise relative [animation-delay:140ms]">
              <div className="absolute -inset-6 -z-10 rounded-full bg-blush-100/70 blur-3xl" />
              <div className="arch relative mx-auto aspect-[4/5] w-full max-w-[24rem] overflow-hidden shadow-lift ring-1 ring-blush-200/60">
                <Image
                  src="/images/arch-stair.jpg"
                  alt="Soft daylight falling across a pale plaster staircase"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 24rem"
                  className="photo-warm object-cover"
                />
              </div>

              {/* Floating result card */}
              <div className="absolute -bottom-6 -left-2 w-[17rem] rounded-2xl border border-line bg-white/95 p-4 shadow-lift backdrop-blur-sm sm:-left-6">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-brick-200 bg-brick-50 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-brick-700 uppercase">
                    High risk
                  </span>
                  <span className="font-mono text-[10.5px] text-muted">
                    §8.4 · p.8
                  </span>
                </div>
                <p className="mt-2.5 text-[12.5px] leading-relaxed text-cocoa-800">
                  The indemnity you give is uncapped and sits outside the liability
                  cap.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Full-bleed band: light plaster, dark type ─────── */}
      <section className="relative isolate">
        <div className="relative h-[22rem] w-full overflow-hidden sm:h-[27rem]">
          <Image
            src="/images/plaster.jpg"
            alt="A warm plaster wall in soft light"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linen/45" />
        </div>
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="mx-auto w-full max-w-6xl px-6 text-center">
            <p className="mx-auto max-w-2xl font-display text-[2.1rem] leading-[1.12] tracking-[-0.025em] text-cocoa-900 sm:text-[3rem]">
              A contract is only as clear as the clause you can find.
            </p>
            <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-cocoa-700/80">
              So every answer here arrives with its clause attached — number, page,
              and the sentence itself.
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section id="how" className="bg-shell">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.05fr]">
            <div className="arch-top relative aspect-[5/6] overflow-hidden shadow-lift ring-1 ring-blush-200/60">
              <Image
                src="/images/terracotta-arch.jpg"
                alt="A terracotta archway cut into a rose-coloured wall"
                fill
                sizes="(max-width: 1024px) 90vw, 30rem"
                className="object-cover"
              />
            </div>

            <div>
              <p className="eyebrow mb-3">How it works</p>
              <h2 className="max-w-md font-display text-[2.2rem] leading-[1.1] tracking-[-0.025em] text-cocoa-900">
                Three steps, and you can check every one of them.
              </h2>
              <div className="mt-11 space-y-9">
                {steps.map((s) => (
                  <div key={s.n} className="flex gap-6">
                    <span className="font-display text-[2rem] leading-none text-blush-300">
                      {s.n}
                    </span>
                    <div>
                      <h3 className="font-display text-lg text-cocoa-900">
                        {s.title}
                      </h3>
                      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
                        {s.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" className="bg-linen/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="eyebrow mb-3">What makes it different</p>
          <h2 className="max-w-2xl font-display text-[2.2rem] leading-[1.1] tracking-[-0.025em] text-cocoa-900">
            Most contract tools ask you to trust them. This one shows its working.
          </h2>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-3xl border border-line bg-white p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="grid size-11 place-items-center rounded-2xl bg-blush-50 text-blush-500 transition-colors group-hover:bg-blush-100">
                    <Icon width={21} height={21} />
                  </div>
                  <h3 className="mt-5 font-display text-xl tracking-[-0.01em] text-cocoa-900">
                    {f.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{f.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Numbers ───────────────────────────────────────── */}
      <section className="bg-shell">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <p className="eyebrow mb-3">Measured, not claimed</p>
              <h2 className="max-w-md font-display text-[2.2rem] leading-[1.1] tracking-[-0.025em] text-cocoa-900">
                The numbers are on the site, including the bad ones.
              </h2>

              <dl className="mt-11 space-y-8">
                {[
                  { k: "89%", v: "field-level accuracy across 8 deal terms" },
                  { k: "$0.04", v: "average API cost to review one contract" },
                  { k: "7.4s", v: "average end-to-end extraction latency" },
                ].map((stat) => (
                  <div key={stat.k} className="flex items-baseline gap-6">
                    <dt className="w-[6.5rem] shrink-0 font-display text-[2.6rem] leading-none tracking-[-0.03em] text-blush-500">
                      {stat.k}
                    </dt>
                    <dd className="text-sm leading-relaxed text-muted">{stat.v}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-11 max-w-lg text-[13px] leading-relaxed text-muted">
                Measured on a hand-labelled set of five contracts — small enough
                that these numbers carry real error bars, and the{" "}
                <Link
                  href="/accuracy"
                  className="text-blush-600 underline underline-offset-4"
                >
                  accuracy page
                </Link>{" "}
                says so on the page itself.
              </p>
            </div>

            <div className="arch-top relative aspect-[4/5] overflow-hidden shadow-lift ring-1 ring-line">
              <Image
                src="/images/shelf-books.jpg"
                alt="A stack of books and a cream ceramic lamp on a wooden sideboard"
                fill
                sizes="(max-width: 1024px) 90vw, 26rem"
                className="photo-warm object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing CTA ───────────────────────────────────── */}
      <section className="relative isolate">
        <div className="photo-veil relative h-[24rem] w-full overflow-hidden sm:h-[28rem]">
          <Image
            src="/images/signing.jpg"
            alt="A hand signing a document at a desk"
            fill
            sizes="100vw"
            className="photo-warm object-cover"
          />
        </div>
        <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
          <div>
            <h2 className="mx-auto max-w-xl font-display text-[2.2rem] leading-[1.12] tracking-[-0.025em] text-white sm:text-[2.7rem]">
              Try it on a contract you already know.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-white/85">
              The fastest way to judge a review tool is to run it on something you
              have already read, and see whether it finds what you found.
            </p>
            <div className="mt-9 flex justify-center">
              <ButtonLink
                href="/contracts"
                size="lg"
                className="bg-white text-cocoa-900 hover:bg-blush-50"
              >
                Open ClauseLens
                <ArrowRight width={17} height={17} />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="bg-cocoa-900 text-blush-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-12 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Logo width={22} height={22} />
            <span className="font-display text-[15px]">ClauseLens</span>
          </div>
          <p className="max-w-md text-[13px] leading-relaxed text-blush-100/70">
            Not legal advice. A demonstration project for contract review with
            grounded citations.
          </p>
        </div>
      </footer>
    </div>
  );
}
