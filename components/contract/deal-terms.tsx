"use client";

import { cn } from "@/lib/utils";
import { clauseById, extractions } from "@/lib/mock-data";
import { ConfidencePill } from "@/components/ui";
import { ChevronRight, Info } from "@/components/icons";

export function DealTerms({
  selectedClauseId,
  onSelect,
}: {
  selectedClauseId: string | null;
  onSelect: (clauseId: string) => void;
}) {
  const needsReview = extractions.filter((e) => e.confidence !== "high").length;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-plum-900">Key deal terms</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            Eight fields pulled from the contract. Each one links to the clause it
            was read from.
          </p>
        </div>
        {needsReview > 0 ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-soft-200 bg-amber-soft-50 px-3 py-1.5 text-[12px] text-amber-soft-700">
            <Info width={14} height={14} />
            {needsReview} worth a second look
          </span>
        ) : null}
      </div>

      <ul className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
        {extractions.map((e, i) => {
          const clause = e.clauseId ? clauseById.get(e.clauseId) : null;
          const active = e.clauseId === selectedClauseId;
          const uncertain = e.confidence !== "high";

          return (
            <li key={e.id}>
              <button
                onClick={() => e.clauseId && onSelect(e.clauseId)}
                disabled={!e.clauseId}
                className={cn(
                  "group flex w-full items-start gap-4 px-5 py-4 text-left transition-colors duration-200",
                  i > 0 && "border-t border-line",
                  active ? "bg-plum-50" : "hover:bg-cream/70",
                  uncertain && !active && "bg-amber-soft-50/40",
                )}
              >
                <span className="w-[9.5rem] shrink-0 pt-0.5 text-[13px] font-medium text-muted">
                  {e.label}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] leading-relaxed text-plum-900">
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
                            ? "bg-plum-700 text-white"
                            : "bg-plum-50 text-plum-500 group-hover:bg-plum-100",
                        )}
                      >
                        §{clause.clauseNo} · p.{clause.page}
                      </span>
                    ) : null}
                  </span>
                </span>

                <ChevronRight
                  width={16}
                  height={16}
                  className={cn(
                    "mt-1 shrink-0 transition-all duration-200",
                    active
                      ? "translate-x-0.5 text-plum-500"
                      : "text-line-strong group-hover:translate-x-0.5 group-hover:text-plum-400",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 flex gap-2.5 text-[12.5px] leading-relaxed text-muted">
        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-rose-300" />
        Confidence is reported by the model, so treat it as an ordering for your
        review queue rather than a probability. Fields it is unsure about are
        tinted and listed first in your attention, not hidden.
      </p>
    </div>
  );
}
