"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn, usd } from "@/lib/utils";
import type { Clause, Extraction } from "@/lib/types";
import { ConfidencePill, Button } from "@/components/ui";
import { ChevronRight, Info, Sparkle, Spinner } from "@/components/icons";

type RunResult = {
  found: number;
  fields: number;
  costUsd: number;
  latencyMs: number;
  attempts: number;
  uncited: string[];
  model: string;
};

export function DealTerms({
  contractId,
  extractions,
  clausesById,
  selectedClauseId,
  onSelect,
  readOnly = false,
}: {
  contractId: string;
  extractions: Extraction[];
  clausesById: Map<string, Clause>;
  selectedClauseId: string | null;
  onSelect: (clauseId: string) => void;
  /** True for the worked example, which is fixtures and cannot be re-run. */
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);

  const answered = extractions.filter((e) => e.value !== null).length;
  const needsReview = extractions.filter(
    (e) => e.value !== null && e.confidence !== "high",
  ).length;
  const neverRun = answered === 0 && !readOnly;

  async function run() {
    setRunning(true);
    setError(null);
    const response = await fetch(`/api/contracts/${contractId}/extract`, {
      method: "POST",
    });
    const body = await response.json();
    setRunning(false);

    if (!response.ok) {
      setError(body.error ?? "Extraction failed.");
      return;
    }
    setResult(body);
    router.refresh();
  }

  if (neverRun) {
    return (
      <div className="rounded-3xl border border-dashed border-line-strong bg-white/70 p-10 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blush-50 text-blush-500">
          <Sparkle width={22} height={22} />
        </span>
        <h2 className="mt-5 font-display text-xl text-cocoa-900">
          Pull out the deal terms
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-muted">
          One call to Claude Haiku reads all {clausesById.size} clauses and
          returns eight key terms, each citing the clause it came from. Typically
          costs under a cent.
        </p>
        {error ? (
          <p className="mx-auto mt-5 max-w-md rounded-2xl border border-brick-200 bg-brick-50 px-4 py-3 text-[13px] leading-relaxed text-brick-700">
            {error}
          </p>
        ) : null}
        <Button className="mt-7" size="lg" onClick={run} disabled={running}>
          {running ? (
            <>
              <Spinner width={16} height={16} className="animate-spin" />
              Reading the contract…
            </>
          ) : (
            "Extract deal terms"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-cocoa-900">Key deal terms</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            {answered} of {extractions.length} terms found. Each links to the
            clause it was read from.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {needsReview > 0 ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-ochre-200 bg-ochre-50 px-3 py-1.5 text-[12px] text-ochre-700">
              <Info width={14} height={14} />
              {needsReview} worth a second look
            </span>
          ) : null}
          {!readOnly ? (
            <Button variant="secondary" size="sm" onClick={run} disabled={running}>
              {running ? (
                <>
                  <Spinner width={14} height={14} className="animate-spin" />
                  Running
                </>
              ) : (
                "Re-run"
              )}
            </Button>
          ) : null}
        </div>
      </div>

      {result ? (
        <p className="mb-4 rounded-2xl border border-line bg-linen/60 px-4 py-3 font-mono text-[11.5px] text-muted">
          {result.model} · {result.found}/{result.fields} found ·{" "}
          {usd(result.costUsd)} · {(result.latencyMs / 1000).toFixed(1)}s
          {result.attempts > 1
            ? ` · retried once for a bad citation`
            : ""}
          {result.uncited.length > 0
            ? ` · ${result.uncited.length} field(s) could not be cited and were dropped`
            : ""}
        </p>
      ) : null}

      {error ? (
        <p className="mb-4 rounded-2xl border border-brick-200 bg-brick-50 px-4 py-3 text-[13px] text-brick-700">
          {error}
        </p>
      ) : null}

      <ul className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
        {extractions.map((e, i) => {
          const clause = e.clauseId ? clausesById.get(e.clauseId) : null;
          const active = e.clauseId === selectedClauseId;
          const uncertain = e.value !== null && e.confidence !== "high";

          return (
            <li key={e.id}>
              <button
                onClick={() => e.clauseId && onSelect(e.clauseId)}
                disabled={!e.clauseId}
                className={cn(
                  "group flex w-full items-start gap-4 px-5 py-4 text-left transition-colors duration-200",
                  i > 0 && "border-t border-line",
                  active ? "bg-cocoa-50" : "hover:bg-linen/70",
                  uncertain && !active && "bg-ochre-50/40",
                )}
              >
                <span className="w-[9.5rem] shrink-0 pt-0.5 text-[13px] font-medium text-muted">
                  {e.label}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] leading-relaxed text-cocoa-900">
                    {e.value ?? (
                      <span className="text-muted italic">
                        Not found in this contract
                      </span>
                    )}
                  </span>
                  <span className="mt-2 flex flex-wrap items-center gap-2">
                    {uncertain ? <ConfidencePill confidence={e.confidence} /> : null}
                    {clause ? (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 font-mono text-[11px] transition-colors",
                          active
                            ? "bg-cocoa-700 text-white"
                            : "bg-cocoa-50 text-cocoa-500 group-hover:bg-cocoa-100",
                        )}
                      >
                        {clause.clauseNo ? `§${clause.clauseNo} · ` : ""}p.
                        {clause.page}
                      </span>
                    ) : null}
                  </span>
                </span>

                {e.clauseId ? (
                  <ChevronRight
                    width={16}
                    height={16}
                    className={cn(
                      "mt-1 shrink-0 transition-all duration-200",
                      active
                        ? "translate-x-0.5 text-cocoa-500"
                        : "text-line-strong group-hover:translate-x-0.5 group-hover:text-cocoa-400",
                    )}
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 flex gap-2.5 text-[12.5px] leading-relaxed text-muted">
        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-blush-300" />
        Confidence is reported by the model, so treat it as an ordering for your
        review queue rather than a probability. Anything it was unsure about is
        tinted rather than hidden — and any value it could not tie to a real
        clause was dropped before it reached this table.
      </p>
    </div>
  );
}
