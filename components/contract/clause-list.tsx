"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { Clause } from "@/lib/types";
import { Scissors, Search } from "@/components/icons";

export function ClauseList({
  clauses,
  selectedClauseId,
  onSelect,
  fallback,
}: {
  clauses: Clause[];
  selectedClauseId: string | null;
  onSelect: (clauseId: string) => void;
  fallback: boolean;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clauses;
    return clauses.filter(
      (c) =>
        c.heading.toLowerCase().includes(q) ||
        c.text.toLowerCase().includes(q) ||
        (c.clauseNo ?? "").toLowerCase().includes(q),
    );
  }, [clauses, query]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-cocoa-900">
            {clauses.length} clauses
          </h2>
          <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-muted">
            Split on the document&apos;s own structure — numbered headings,
            articles, capitalised headings — not every N tokens.
          </p>
        </div>

        <label className="relative">
          <Search
            width={15}
            height={15}
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter clauses…"
            className="w-56 rounded-full border border-line bg-white py-2 pr-4 pl-9 text-[13px] text-cocoa-900 outline-none transition-colors placeholder:text-muted/70 focus:border-cocoa-300"
          />
        </label>
      </div>

      {fallback ? (
        <div className="mb-5 flex gap-3 rounded-2xl border border-ochre-200 bg-ochre-50/70 px-5 py-4">
          <Scissors width={17} height={17} className="mt-0.5 shrink-0 text-ochre-600" />
          <p className="text-[13px] leading-relaxed text-ochre-700">
            <span className="font-medium">Split by paragraph, not by clause.</span>{" "}
            No numbered headings were found in this PDF, so ClauseLens grouped
            paragraphs instead. Citations will be less precise, and this notice is
            here rather than hidden.
          </p>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong bg-white/60 px-5 py-8 text-center text-[13px] text-muted">
          Nothing matches “{query}”.
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((c) => {
            const active = c.id === selectedClauseId;
            return (
              <li key={c.id}>
                <button
                  onClick={() => onSelect(c.id)}
                  className={cn(
                    "group w-full rounded-2xl border p-4 text-left transition-all duration-200",
                    active
                      ? "border-cocoa-300 bg-cocoa-50 ring-1 ring-cocoa-200"
                      : "border-line bg-white hover:-translate-y-0.5 hover:shadow-soft",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {c.clauseNo ? (
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 font-mono text-[11px] transition-colors",
                          active
                            ? "bg-cocoa-700 text-white"
                            : "bg-cocoa-50 text-cocoa-600 group-hover:bg-cocoa-100",
                        )}
                      >
                        §{c.clauseNo}
                      </span>
                    ) : null}
                    <span className="truncate font-display text-[15px] text-cocoa-900">
                      {c.heading}
                    </span>
                    <span className="ml-auto shrink-0 font-mono text-[11px] text-muted">
                      p.{c.page}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted">
                    {c.text}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
