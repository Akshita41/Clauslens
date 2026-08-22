"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Contract } from "@/lib/types";
import { riskFlags } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui";
import { ChevronRight } from "@/components/icons";
import { ClausePanel } from "./clause-panel";
import { DealTerms } from "./deal-terms";
import { RiskReview } from "./risk-review";
import { AskPanel } from "./ask-panel";

type Tab = "terms" | "risk" | "ask";

export function ContractWorkspace({ contract }: { contract: Contract }) {
  const [tab, setTab] = useState<Tab>("terms");
  const [selected, setSelected] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);

  const highRisk = riskFlags.filter((f) => f.severity === "HIGH_RISK").length;

  const select = (clauseId: string) => {
    setSelected(clauseId);
    setDrawer(true);
  };

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: "terms", label: "Deal terms" },
    { key: "risk", label: "Risk review", badge: highRisk },
    { key: "ask", label: "Ask" },
  ];

  return (
    <>
      {/* ── Contract header ────────────────────────────────── */}
      <div className="border-b border-line bg-white/60">
        <div className="mx-auto max-w-6xl px-6 pt-8 pb-0">
          <nav className="flex items-center gap-1.5 text-[12.5px] text-muted">
            <Link href="/contracts" className="transition-colors hover:text-cocoa-700">
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
                {contract.filename} · {contract.pageCount} pages ·{" "}
                {contract.clauseCount} clauses detected
              </p>
            </div>
            <StatusBadge status={contract.status} className="mt-1" />
          </div>

          {/* Tabs */}
          <div className="mt-7 flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "relative flex items-center gap-2 rounded-t-xl px-4 py-3 text-sm whitespace-nowrap transition-colors duration-200",
                  tab === t.key
                    ? "font-medium text-cocoa-900"
                    : "text-muted hover:text-cocoa-700",
                )}
              >
                {t.label}
                {t.badge ? (
                  <span className="rounded-full bg-brick-50 px-1.5 py-0.5 text-[10.5px] font-semibold text-brick-700">
                    {t.badge}
                  </span>
                ) : null}
                <span
                  className={cn(
                    "absolute inset-x-3 -bottom-px h-0.5 rounded-full transition-all duration-300",
                    tab === t.key ? "bg-cocoa-700" : "bg-transparent",
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
            {tab === "terms" ? (
              <DealTerms selectedClauseId={selected} onSelect={select} />
            ) : null}
            {tab === "risk" ? (
              <RiskReview selectedClauseId={selected} onSelect={select} />
            ) : null}
            {tab === "ask" ? <AskPanel onSelect={select} /> : null}
          </div>

          {/* Desktop rail */}
          <ClausePanel
            clauseId={selected}
            className="sticky top-8 hidden max-h-[calc(100dvh-4rem)] self-start overflow-hidden rounded-3xl border border-line bg-white shadow-soft lg:flex"
          />
        </div>
      </div>

      {/* Mobile drawer */}
      {drawer && selected ? (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden">
          <button
            className="absolute inset-0 bg-cocoa-900/25 backdrop-blur-[2px]"
            onClick={() => setDrawer(false)}
            aria-label="Close clause"
          />
          <ClausePanel
            clauseId={selected}
            onClose={() => setDrawer(false)}
            className="relative max-h-[80dvh] w-full overflow-hidden rounded-t-3xl border-t border-line bg-white shadow-lift"
          />
        </div>
      ) : null}
    </>
  );
}
