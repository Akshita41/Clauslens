"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { clauses, suggestedQuestions } from "@/lib/mock-data";
import type { ChatMessage } from "@/lib/types";
import { Layers, Search, Send, Sparkle } from "@/components/icons";

/* ------------------------------------------------------------------ *
 * Placeholder answering. The real version posts to /api/contracts/[id]/ask,
 * which runs hybrid retrieval and returns a zod-validated answer whose
 * cited clause ids are checked against this contract before rendering.
 * The "not found" branch below is not decoration — it is the behaviour the
 * real endpoint falls back to when the model cannot cite a clause.
 * ------------------------------------------------------------------ */

const CANNED: { match: RegExp; answer: Omit<ChatMessage, "id" | "role"> }[] = [
  {
    match: /terminat|walk away|exit|cancel|notice/i,
    answer: {
      content:
        "Yes. Either party can terminate for convenience on 120 days' written notice. If they do, you still owe fees accrued up to the termination date, plus any non-cancellable third-party commitments they had already made under the active Statement of Work — that second amount is not capped or disclosed anywhere in the agreement.",
      citations: [
        { clauseId: "c-10", clauseNo: "9.2", heading: "Termination for Convenience", page: 9 },
        { clauseId: "c-05", clauseNo: "4.2", heading: "Fees and Payment", page: 4 },
      ],
      retrieved: [
        { clauseId: "c-10", heading: "Termination for Convenience", score: 0.0323 },
        { clauseId: "c-04", heading: "Renewal", score: 0.0262 },
        { clauseId: "c-05", heading: "Fees and Payment", score: 0.021 },
        { clauseId: "c-03", heading: "Term", score: 0.0169 },
      ],
    },
  },
  {
    match: /\bip\b|intellectual|deliverable|own/i,
    answer: {
      content:
        "Once you have paid in full, all rights in the Deliverables are assigned to you — with one carve-out. Anything the Provider brought with them (tools, libraries, know-how) stays theirs as “Provider Background IP,” and you only get a perpetual non-exclusive licence to use it as embedded in the Deliverables. In practice that means you cannot lift their libraries out and reuse them elsewhere.",
      citations: [
        { clauseId: "c-07", clauseNo: "7.3", heading: "Intellectual Property", page: 7 },
      ],
      retrieved: [
        { clauseId: "c-07", heading: "Intellectual Property", score: 0.0328 },
        { clauseId: "c-01", heading: "Definitions", score: 0.0246 },
        { clauseId: "c-05", heading: "Fees and Payment", score: 0.0161 },
      ],
    },
  },
  {
    match: /liabilit|cap|mutual|indemn/i,
    answer: {
      content:
        "No, it is not mutual. The Provider's liability is capped at fees paid in the preceding 24 months, but the indemnity you give them runs “without limitation as to amount” and sits outside that cap entirely. Their indemnity back to you covers third-party IP infringement only and is subject to the cap. So the ceiling on your exposure is effectively open, and theirs is not.",
      citations: [
        { clauseId: "c-08", clauseNo: "8.1", heading: "Limitation of Liability", page: 8 },
        { clauseId: "c-09", clauseNo: "8.4", heading: "Indemnification", page: 8 },
      ],
      retrieved: [
        { clauseId: "c-08", heading: "Limitation of Liability", score: 0.0331 },
        { clauseId: "c-09", heading: "Indemnification", score: 0.0303 },
        { clauseId: "c-06", heading: "Confidentiality", score: 0.0154 },
      ],
    },
  },
  {
    match: /renew|auto|price|increase/i,
    answer: {
      content:
        "It renews automatically for 12 months at a time, and to stop it you must give written notice at least 90 days before the current term ends. That window is unusually long — miss it and you are committed for another full year. Fees for a renewal term may also be raised at the Provider's sole discretion, with no cap on the increase.",
      citations: [
        { clauseId: "c-04", clauseNo: "3.2", heading: "Renewal", page: 3 },
        { clauseId: "c-03", clauseNo: "3.1", heading: "Term", page: 2 },
      ],
      retrieved: [
        { clauseId: "c-04", heading: "Renewal", score: 0.0328 },
        { clauseId: "c-03", heading: "Term", score: 0.0244 },
        { clauseId: "c-10", heading: "Termination for Convenience", score: 0.0161 },
      ],
    },
  },
];

const NOT_FOUND: Omit<ChatMessage, "id" | "role"> = {
  content: "Not found in this contract.",
  notFound: true,
};

let counter = 0;
const nextId = () => `m-${++counter}`;

export function AskPanel({
  onSelect,
}: {
  onSelect: (clauseId: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  const ask = (question: string) => {
    const q = question.trim();
    if (!q || thinking) return;
    setMessages((m) => [...m, { id: nextId(), role: "user", content: q }]);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const hit = CANNED.find((c) => c.match.test(q));
      setMessages((m) => [
        ...m,
        { id: nextId(), role: "assistant", ...(hit ? hit.answer : NOT_FOUND) },
      ]);
      setThinking(false);
    }, 1100);
  };

  return (
    <div className="flex min-h-[32rem] flex-col">
      <div className="mb-5">
        <h2 className="font-display text-xl text-plum-900">Ask this contract</h2>
        <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-muted">
          Answers are written only from clauses retrieved out of this document. If
          nothing relevant is found, you get told so rather than given a guess.
        </p>
      </div>

      {/* ── Thread ─────────────────────────────────────────── */}
      <div className="flex-1 space-y-5">
        {messages.length === 0 && !thinking ? (
          <div className="rounded-3xl border border-dashed border-line-strong bg-white/60 p-8 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-50 text-plum-500">
              <Sparkle width={20} height={20} />
            </span>
            <p className="mt-4 font-display text-lg text-plum-900">
              What do you want to know?
            </p>
            <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
              Try one of these, or ask something the contract doesn&apos;t cover to
              see what happens.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  className="rounded-full border border-line bg-white px-3.5 py-2 text-[12.5px] text-plum-700 transition-all hover:-translate-y-px hover:border-plum-200 hover:bg-plum-50 hover:shadow-soft"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[85%] rounded-3xl rounded-br-lg bg-plum-700 px-4.5 py-3 text-[14px] leading-relaxed text-white shadow-soft">
                {m.content}
              </p>
            </div>
          ) : (
            <div key={m.id} className="animate-rise">
              <div
                className={cn(
                  "rounded-3xl rounded-bl-lg border bg-white p-5 shadow-soft",
                  m.notFound ? "border-amber-soft-200" : "border-line",
                )}
              >
                <p
                  className={cn(
                    "text-[14.5px] leading-relaxed",
                    m.notFound ? "text-amber-soft-700 italic" : "text-plum-900",
                  )}
                >
                  {m.content}
                </p>

                {m.notFound ? (
                  <p className="mt-3 border-t border-line pt-3 text-[12.5px] leading-relaxed text-muted">
                    The retriever found nothing in this document that answers your
                    question, so the model was not allowed to answer. An uncited
                    answer is rejected before it ever reaches you.
                  </p>
                ) : null}

                {m.citations?.length ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-medium tracking-[0.08em] text-plum-400 uppercase">
                      Sources
                    </span>
                    {m.citations.map((c) => (
                      <button
                        key={c.clauseId}
                        onClick={() => onSelect(c.clauseId)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream/70 px-2.5 py-1 font-mono text-[11px] text-plum-600 transition-all hover:-translate-y-px hover:border-plum-200 hover:bg-plum-50"
                      >
                        §{c.clauseNo} · {c.heading} · p.{c.page}
                      </button>
                    ))}
                  </div>
                ) : null}

                {m.retrieved?.length ? (
                  <details className="group mt-4 border-t border-line pt-3">
                    <summary className="flex cursor-pointer list-none items-center gap-2 text-[12px] text-muted transition-colors hover:text-plum-700">
                      <Layers width={14} height={14} />
                      {m.retrieved.length} clauses retrieved
                      <span className="ml-auto font-mono text-[11px] text-muted/70">
                        keyword + vector, fused
                      </span>
                    </summary>
                    <ul className="mt-3 space-y-1.5">
                      {m.retrieved.map((r, idx) => (
                        <li
                          key={r.clauseId}
                          className="flex items-center gap-3 text-[12px]"
                        >
                          <span className="w-4 shrink-0 text-right font-mono text-muted/70">
                            {idx + 1}
                          </span>
                          <button
                            onClick={() => onSelect(r.clauseId)}
                            className="min-w-0 flex-1 truncate text-left text-plum-700 hover:underline"
                          >
                            {r.heading}
                          </button>
                          <span className="shrink-0 font-mono text-[11px] text-muted/80">
                            {r.score.toFixed(4)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
            </div>
          ),
        )}

        {thinking ? (
          <div className="flex items-center gap-2.5 rounded-3xl rounded-bl-lg border border-line bg-white px-5 py-4 text-[13px] text-muted shadow-soft">
            <Search width={15} height={15} className="animate-pulse text-plum-400" />
            Searching {clauses.length} clauses…
          </div>
        ) : null}

        <div ref={endRef} />
      </div>

      {/* ── Composer ───────────────────────────────────────── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="sticky bottom-0 mt-6 flex items-center gap-2 rounded-full border border-line bg-white p-1.5 shadow-soft focus-within:border-plum-300"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about termination, liability, IP…"
          className="min-w-0 flex-1 bg-transparent px-4 py-2 text-[14px] text-plum-900 outline-none placeholder:text-muted/70"
        />
        <button
          type="submit"
          disabled={!input.trim() || thinking}
          aria-label="Send question"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-plum-700 text-white transition-all hover:bg-plum-800 disabled:opacity-40"
        >
          <Send width={17} height={17} />
        </button>
      </form>
    </div>
  );
}
