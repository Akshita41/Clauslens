"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { clauseById, riskFlags as seedFlags } from "@/lib/mock-data";
import type { HumanVerdict, Severity } from "@/lib/types";
import { ConfidencePill, SeverityBadge } from "@/components/ui";
import { Check, Quote, X } from "@/components/icons";

const ORDER: Severity[] = ["HIGH_RISK", "CAUTION", "OK"];

export function RiskReview({
  selectedClauseId,
  onSelect,
}: {
  selectedClauseId: string | null;
  onSelect: (clauseId: string) => void;
}) {
  const [verdicts, setVerdicts] = useState<Record<string, HumanVerdict>>(() =>
    Object.fromEntries(seedFlags.map((f) => [f.id, f.humanVerdict])),
  );

  const flags = useMemo(
    () =>
      [...seedFlags].sort(
        (a, b) => ORDER.indexOf(a.severity) - ORDER.indexOf(b.severity),
      ),
    [],
  );

  const counts = useMemo(() => {
    const c: Record<Severity, number> = { HIGH_RISK: 0, CAUTION: 0, OK: 0 };
    for (const f of flags) c[f.severity] += 1;
    return c;
  }, [flags]);

  const reviewed = Object.values(verdicts).filter(Boolean).length;

  const setVerdict = (id: string, v: HumanVerdict) =>
    setVerdicts((prev) => ({ ...prev, [id]: prev[id] === v ? null : v }));

  return (
    <div>
      {/* ── Summary ────────────────────────────────────────── */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {(
          [
            ["HIGH_RISK", "High risk", "border-clay-200 bg-clay-50 text-clay-700"],
            ["CAUTION", "Caution", "border-amber-soft-200 bg-amber-soft-50 text-amber-soft-700"],
            ["OK", "Matches playbook", "border-sage-200 bg-sage-50 text-sage-700"],
          ] as const
        ).map(([key, label, style]) => (
          <div key={key} className={cn("rounded-2xl border p-4", style)}>
            <p className="font-display text-[2rem] leading-none">{counts[key]}</p>
            <p className="mt-2 text-[12.5px] font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-plum-900">Playbook review</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            Each clause checked against your standard positions. Accept a flag to
            keep it, reject it if the model got it wrong.
          </p>
        </div>
        <span className="rounded-full border border-line bg-white px-3 py-1.5 text-[12px] text-muted">
          {reviewed} of {flags.length} reviewed
        </span>
      </div>

      {/* ── Flags ──────────────────────────────────────────── */}
      <ul className="space-y-3">
        {flags.map((f, i) => {
          const clause = clauseById.get(f.clauseId);
          const active = f.clauseId === selectedClauseId;
          const verdict = verdicts[f.id];

          return (
            <li
              key={f.id}
              className="animate-rise"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div
                className={cn(
                  "rounded-3xl border bg-white p-5 shadow-soft transition-all duration-200",
                  active ? "border-plum-300 ring-1 ring-plum-200" : "border-line",
                  verdict === "rejected" && "opacity-55",
                )}
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <SeverityBadge severity={f.severity} />
                  <span className="font-mono text-[11px] text-muted">{f.ruleId}</span>
                  <span className="text-[13px] font-medium text-plum-800">
                    {f.ruleTitle}
                  </span>
                  {f.confidence !== "high" ? (
                    <ConfidencePill confidence={f.confidence} />
                  ) : null}
                </div>

                <p className="mt-3.5 text-[14px] leading-relaxed text-plum-800">
                  {f.reason}
                </p>

                <div className="mt-4 rounded-2xl border border-line bg-cream/50 px-4 py-3">
                  <p className="text-[11px] font-medium tracking-[0.08em] text-plum-400 uppercase">
                    Your standard position
                  </p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                    {f.standardPosition}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => onSelect(f.clauseId)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11.5px] transition-colors",
                      active
                        ? "border-plum-700 bg-plum-700 text-white"
                        : "border-line bg-white text-plum-600 hover:border-plum-200 hover:bg-plum-50",
                    )}
                  >
                    <Quote width={13} height={13} />
                    §{clause?.clauseNo} · page {clause?.page}
                  </button>

                  <div className="flex items-center gap-2">
                    {verdict ? (
                      <span
                        className={cn(
                          "text-[12px] font-medium",
                          verdict === "accepted" ? "text-sage-700" : "text-muted",
                        )}
                      >
                        {verdict === "accepted" ? "Accepted" : "Rejected"}
                      </span>
                    ) : null}
                    <VerdictButton
                      active={verdict === "accepted"}
                      tone="accept"
                      onClick={() => setVerdict(f.id, "accepted")}
                      label="Accept flag"
                    >
                      <Check width={15} height={15} />
                    </VerdictButton>
                    <VerdictButton
                      active={verdict === "rejected"}
                      tone="reject"
                      onClick={() => setVerdict(f.id, "rejected")}
                      label="Reject flag"
                    >
                      <X width={15} height={15} />
                    </VerdictButton>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function VerdictButton({
  active,
  tone,
  onClick,
  label,
  children,
}: {
  active: boolean;
  tone: "accept" | "reject";
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        "grid size-9 place-items-center rounded-full border transition-all duration-200 active:translate-y-px",
        active && tone === "accept" && "border-sage-600 bg-sage-600 text-white",
        active && tone === "reject" && "border-clay-600 bg-clay-600 text-white",
        !active &&
          "border-line bg-white text-muted hover:border-plum-200 hover:bg-plum-50 hover:text-plum-700",
      )}
    >
      {children}
    </button>
  );
}
