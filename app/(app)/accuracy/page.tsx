import { PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { Info } from "@/components/icons";
import { evalRuns } from "@/lib/mock-data";
import { cn, formatDate, pct, usd } from "@/lib/utils";

export const metadata = { title: "Accuracy" };

export default function AccuracyPage() {
  const [run, previous] = evalRuns;

  const correct = run.fields.reduce((a, f) => a + f.correct, 0);
  const total = run.fields.reduce((a, f) => a + f.total, 0);
  const overall = pct(correct, total);

  const prevCorrect = previous.fields.reduce((a, f) => a + f.correct, 0);
  const prevTotal = previous.fields.reduce((a, f) => a + f.total, 0);
  const prevOverall = pct(prevCorrect, prevTotal);
  const delta = overall - prevOverall;

  const prevByField = new Map(previous.fields.map((f) => [f.fieldName, f]));

  return (
    <>
      <PageHeader
        eyebrow="Quality"
        title="How accurate is ClauseLens?"
        description="Every prompt change is re-run over a hand-labelled set of contracts. These are the numbers from the latest run, including the fields it gets wrong."
      />

      <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        {/* ── Run meta ───────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-muted">
          <span>
            Latest run{" "}
            <span className="font-medium text-cocoa-800">{run.label}</span>
          </span>
          <span className="font-mono text-[12px]">{run.model}</span>
          <span>{formatDate(run.date)}</span>
          <span>
            {run.contracts} contracts · {total} labelled fields
          </span>
        </div>

        {/* ── Headline stats ─────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat
            value={`${overall}%`}
            label="Field-level accuracy"
            sub={
              <span
                className={cn(
                  "font-medium",
                  delta > 0 && "text-sage-700",
                  delta < 0 && "text-brick-700",
                  delta === 0 && "text-muted",
                )}
              >
                {delta > 0 ? "▲" : delta < 0 ? "▼" : "—"} {Math.abs(delta)} pts vs{" "}
                {previous.label.split(" — ")[0]}
              </span>
            }
            emphasis
          />
          <Stat
            value={usd(run.totalCostUsd / run.contracts)}
            label="API cost per contract"
            sub={`${usd(run.totalCostUsd)} for the whole run`}
          />
          <Stat
            value={`${(run.avgLatencyMs / 1000).toFixed(1)}s`}
            label="Average extraction latency"
            sub="Upload to structured terms"
          />
        </div>

        {/* ── Honest caveat ──────────────────────────────── */}
        <div className="flex gap-3.5 rounded-2xl border border-ochre-200 bg-ochre-50/70 px-5 py-4">
          <Info width={18} height={18} className="mt-0.5 shrink-0 text-ochre-600" />
          <p className="text-[13px] leading-relaxed text-ochre-700">
            <span className="font-medium">Read these with the sample size in mind.</span>{" "}
            {run.contracts} contracts and {total} labelled fields is a small set —
            one extra mistake moves a field&apos;s score by 20 points. It is enough
            to catch a prompt change that makes things clearly worse, and not
            enough to claim a precise accuracy figure.
          </p>
        </div>

        {/* ── Per-field ──────────────────────────────────── */}
        <Card className="overflow-hidden">
          <div className="border-b border-line px-6 py-5">
            <h2 className="font-display text-xl text-cocoa-900">Accuracy by field</h2>
            <p className="mt-1.5 text-[13px] text-muted">
              Sorted worst first — the weak fields are the interesting ones.
            </p>
          </div>

          <ul>
            {[...run.fields]
              .sort((a, b) => a.correct / a.total - b.correct / b.total)
              .map((f, i) => {
                const score = pct(f.correct, f.total);
                const prev = prevByField.get(f.fieldName);
                const d = prev ? score - pct(prev.correct, prev.total) : 0;
                const tone =
                  score >= 90 ? "sage" : score >= 70 ? "amber-soft" : "clay";

                return (
                  <li
                    key={f.fieldName}
                    className={cn(
                      "flex items-center gap-5 px-6 py-4",
                      i > 0 && "border-t border-line",
                    )}
                  >
                    <span className="w-[9.5rem] shrink-0 text-[13.5px] font-medium text-cocoa-800">
                      {f.label}
                    </span>

                    <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-cocoa-50">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          tone === "sage" && "bg-sage-600",
                          tone === "amber-soft" && "bg-ochre-600",
                          tone === "clay" && "bg-brick-600",
                        )}
                        style={{ width: `${score}%` }}
                      />
                    </div>

                    <span className="w-12 shrink-0 text-right font-mono text-[13px] text-cocoa-800">
                      {score}%
                    </span>
                    <span className="hidden w-14 shrink-0 text-right font-mono text-[11.5px] text-muted sm:block">
                      {f.correct}/{f.total}
                    </span>
                    <span
                      className={cn(
                        "hidden w-12 shrink-0 text-right font-mono text-[11.5px] sm:block",
                        d > 0 && "text-sage-700",
                        d < 0 && "text-brick-700",
                        d === 0 && "text-muted/50",
                      )}
                    >
                      {d === 0 ? "—" : `${d > 0 ? "+" : ""}${d}`}
                    </span>
                  </li>
                );
              })}
          </ul>
        </Card>

        {/* ── Misses ─────────────────────────────────────── */}
        <Card className="overflow-hidden">
          <div className="border-b border-line px-6 py-5">
            <h2 className="font-display text-xl text-cocoa-900">
              What it got wrong
            </h2>
            <p className="mt-1.5 text-[13px] text-muted">
              Every miss in the latest run, with the label it should have produced.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left text-[13px]">
              <thead>
                <tr className="border-b border-line text-[11px] tracking-[0.08em] text-cocoa-400 uppercase">
                  <th className="px-6 py-3 font-medium">Contract</th>
                  <th className="px-4 py-3 font-medium">Field</th>
                  <th className="px-4 py-3 font-medium">Expected</th>
                  <th className="px-6 py-3 font-medium">ClauseLens said</th>
                </tr>
              </thead>
              <tbody>
                {run.misses.map((m, i) => (
                  <tr
                    key={`${m.contract}-${m.field}`}
                    className={cn(i > 0 && "border-t border-line")}
                  >
                    <td className="px-6 py-3.5 font-mono text-[11.5px] text-muted">
                      {m.contract}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-cocoa-800">
                      {m.field}
                    </td>
                    <td className="px-4 py-3.5 text-sage-700">{m.expected}</td>
                    <td className="px-6 py-3.5 text-brick-700">{m.actual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <p className="max-w-2xl text-[12.5px] leading-relaxed text-muted">
          Indemnity is the weakest field, and consistently so: it is often spread
          across two clauses, and sometimes absent entirely from a short statement
          of work. That is the next prompt to work on, and this page is how the
          change gets judged.
        </p>
      </div>
    </>
  );
}

function Stat({
  value,
  label,
  sub,
  emphasis,
}: {
  value: string;
  label: string;
  sub?: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border p-6",
        emphasis
          ? "border-cocoa-200 bg-cocoa-50/60"
          : "border-line bg-white shadow-soft",
      )}
    >
      <p className="font-display text-[2.6rem] leading-none tracking-[-0.02em] text-cocoa-800">
        {value}
      </p>
      <p className="mt-3 text-[13px] font-medium text-cocoa-700">{label}</p>
      {sub ? <p className="mt-1 text-[12px] text-muted">{sub}</p> : null}
    </div>
  );
}
