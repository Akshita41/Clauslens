"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { Clause, Contract } from "@/lib/types";
import { riskFlags } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui";
import { ChevronRight, Lock } from "@/components/icons";
import { ClausePanel } from "./clause-panel";
import { ClauseList } from "./clause-list";
import { DealTerms } from "./deal-terms";
import { RiskReview } from "./risk-review";
import { AskPanel } from "./ask-panel";

type Tab = "clauses" | "terms" | "risk" | "ask";

export function ContractWorkspace({
  contract,
  clauses,
  demo,
}: {
  contract: Contract;
  clauses: Clause[];
  /** True for the worked example, which runs on fixtures end to end. */
  demo: boolean;
}) {
  const [tab, setTab] = useState<Tab>(demo ? "terms" : "clauses");
  const [selected, setSelected] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);

  const byId = useMemo(
    () => new Map(clauses.map((c) => [c.id, c])),
    [clauses],
  );
  const selectedClause = selected ? (byId.get(selected) ?? null) : null;

  const select = (clauseId: string) => {
    setSelected(clauseId);
    setDrawer(true);
  };

  const highRisk = riskFlags.filter((f) => f.severity === "HIGH_RISK").length;

  // Deal terms, risk review and Q&A need the extraction and retrieval stages,
  // which do not exist yet. Rather than hide the tabs, they are shown locked —
  // the roadmap is part of the story.
  const tabs: { key: Tab; label: string; badge?: number; locked: boolean }[] = [
    { key: "clauses", label: "Clauses", badge: clauses.length, locked: false },
    { key: "terms", label: "Deal terms", locked: !demo },
    { key: "risk", label: "Risk review", badge: demo ? highRisk : undefined, locked: !demo },
    { key: "ask", label: "Ask", locked: !demo },
  ];

  return (
    <>
      {/* ── Contract header ────────────────────────────────── */}
      <div className="border-b border-line bg-white/60">
        <div className="mx-auto max-w-6xl px-6 pt-8 pb-0">
          <nav className="flex items-center gap-1.5 text-[12.5px] text-muted">
            <Link
              href="/contracts"
              className="transition-colors hover:text-cocoa-700"
            >
              Contracts
            </Link>
            <ChevronRight width={13} height={13} className="text-line-strong" />
            <span className="truncate text-cocoa-700">{contract.title}</span>
          </nav>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-[2rem] leading-tight tracking-[-0.02em] text-cocoa-900">
                {contract.title}
              </h1>
              <p className="mt-1.5 text-sm text-muted">
                with {contract.counterparty}
              </p>
              <p className="mt-2.5 font-mono text-[11.5px] text-muted/80">
                {contract.filename}
                {contract.pageCount > 0 ? ` · ${contract.pageCount} pages` : ""}
                {clauses.length > 0 ? ` · ${clauses.length} clauses detected` : ""}
              </p>
            </div>
            <StatusBadge status={contract.status} className="mt-1" />
          </div>

          <div className="mt-7 flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => !t.locked && setTab(t.key)}
                disabled={t.locked}
                title={
                  t.locked
                    ? "Arrives with the extraction stage — open the worked example to see it"
                    : undefined
                }
                className={cn(
                  "relative flex items-center gap-2 rounded-t-xl px-4 py-3 text-sm whitespace-nowrap transition-colors duration-200",
                  t.locked && "cursor-not-allowed text-muted/45",
                  !t.locked && tab === t.key
                    ? "font-medium text-cocoa-900"
                    : !t.locked && "text-muted hover:text-cocoa-700",
                )}
              >
                {t.locked ? <Lock width={13} height={13} /> : null}
                {t.label}
                {t.badge ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold",
                      t.key === "risk"
                        ? "bg-brick-50 text-brick-700"
                        : "bg-cocoa-50 text-cocoa-600",
                    )}
                  >
                    {t.badge}
                  </span>
                ) : null}
                <span
                  className={cn(
                    "absolute inset-x-3 -bottom-px h-0.5 rounded-full transition-all duration-300",
                    tab === t.key && !t.locked ? "bg-cocoa-700" : "bg-transparent",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-9">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            {tab === "clauses" ? (
              <ClauseList
                clauses={clauses}
                selectedClauseId={selected}
                onSelect={select}
                fallback={Boolean(contract.splitFallback)}
              />
            ) : null}
            {tab === "terms" ? (
              <DealTerms selectedClauseId={selected} onSelect={select} />
            ) : null}
            {tab === "risk" ? (
              <RiskReview selectedClauseId={selected} onSelect={select} />
            ) : null}
            {tab === "ask" ? <AskPanel onSelect={select} /> : null}
          </div>

          <ClausePanel
            clause={selectedClause}
            className="sticky top-8 hidden max-h-[calc(100dvh-4rem)] self-start overflow-hidden rounded-3xl border border-line bg-white shadow-soft lg:flex"
          />
        </div>
      </div>

      {/* Mobile drawer */}
      {drawer && selectedClause ? (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden">
          <button
            className="absolute inset-0 bg-cocoa-900/25 backdrop-blur-[2px]"
            onClick={() => setDrawer(false)}
            aria-label="Close clause"
          />
          <ClausePanel
            clause={selectedClause}
            onClose={() => setDrawer(false)}
            className="relative max-h-[80dvh] w-full overflow-hidden rounded-t-3xl border-t border-line bg-white shadow-lift"
          />
        </div>
      ) : null}
    </>
  );
}
