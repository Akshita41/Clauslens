"use client";

import { cn } from "@/lib/utils";
import { clauseById } from "@/lib/mock-data";
import { Quote, X } from "@/components/icons";

/**
 * The right-hand rail. Whatever the user last clicked — an extracted field,
 * a risk flag, a citation in an answer — lands here as the literal clause
 * text plus its page number. This panel is the whole point of the product:
 * nothing the model says is more than one click from its source.
 */
export function ClausePanel({
  clauseId,
  onClose,
  className,
}: {
  clauseId: string | null;
  onClose?: () => void;
  className?: string;
}) {
  const clause = clauseId ? clauseById.get(clauseId) : null;

  return (
    <aside className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <p className="eyebrow">Source clause</p>
        {onClose ? (
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted transition-colors hover:bg-plum-50 hover:text-plum-700 lg:hidden"
            aria-label="Close"
          >
            <X width={16} height={16} />
          </button>
        ) : null}
      </div>

      {clause ? (
        <div key={clause.id} className="animate-rise overflow-y-auto p-5">
          <div className="flex flex-wrap items-center gap-2">
            {clause.clauseNo ? (
              <span className="rounded-lg bg-plum-700 px-2 py-1 font-mono text-[11px] font-medium text-white">
                §{clause.clauseNo}
              </span>
            ) : null}
            <span className="rounded-lg border border-line bg-cream px-2 py-1 font-mono text-[11px] text-muted">
              page {clause.page}
            </span>
          </div>

          <h3 className="mt-3.5 font-display text-xl leading-snug tracking-[-0.01em] text-plum-900">
            {clause.heading}
          </h3>

          <div className="relative mt-5 rounded-2xl border border-line bg-cream/50 p-5">
            <Quote
              width={18}
              height={18}
              className="absolute -top-2.5 left-4 bg-white px-0.5 text-rose-300"
            />
            <p className="font-display text-[14.5px] leading-[1.75] text-plum-800">
              {clause.text}
            </p>
          </div>

          <p className="mt-4 text-[12px] leading-relaxed text-muted">
            Quoted verbatim from the uploaded PDF. Clause boundaries were detected
            from the document&apos;s own numbering, not by cutting at a fixed token
            count.
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 text-center">
          <span className="grid size-12 place-items-center rounded-2xl border border-line bg-plum-50 text-plum-300">
            <Quote width={20} height={20} />
          </span>
          <p className="mt-4 text-sm font-medium text-plum-800">Nothing selected</p>
          <p className="mt-1.5 max-w-[15rem] text-[13px] leading-relaxed text-muted">
            Click any extracted term, risk flag or citation to read the clause it
            came from.
          </p>
        </div>
      )}
    </aside>
  );
}
