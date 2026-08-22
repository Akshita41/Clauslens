import Link from "next/link";
import { PageHeader } from "@/components/app-shell";
import { UploadCard } from "@/components/upload-card";
import { MockNotice, StatusBadge } from "@/components/ui";
import { ChevronRight, FileText } from "@/components/icons";
import { contracts } from "@/lib/mock-data";
import { cn, formatRelative } from "@/lib/utils";

export const metadata = { title: "Contracts" };

export default function ContractsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Your workspace"
        title="Contracts"
        description="Every contract you have uploaded, and what ClauseLens found in it."
        action={<MockNotice>Sample data — backend not wired yet</MockNotice>}
      />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* ── List ───────────────────────────────────────── */}
          <div className="order-2 lg:order-1">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-display text-xl text-plum-900">
                {contracts.length} contracts
              </h2>
              <span className="text-[13px] text-muted">Newest first</span>
            </div>

            <ul className="space-y-3">
              {contracts.map((c, i) => {
                const disabled = c.status === "failed";
                const Row = (
                  <div
                    className={cn(
                      "group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-soft transition-all duration-200",
                      !disabled && "hover:-translate-y-0.5 hover:shadow-lift",
                      disabled && "opacity-70",
                    )}
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-rose-50 text-plum-500">
                      <FileText width={19} height={19} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <p className="truncate font-display text-[17px] tracking-[-0.01em] text-plum-900">
                          {c.title}
                        </p>
                        <StatusBadge status={c.status} />
                        {c.splitFallback ? (
                          <span
                            className="rounded-full border border-amber-soft-200 bg-amber-soft-50 px-2 py-0.5 text-[10px] font-medium text-amber-soft-700"
                            title="No clause headings found — split by paragraph instead. Citations are less precise."
                          >
                            fallback split
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 truncate text-[13px] text-muted">
                        {c.counterparty}
                      </p>
                      <p className="mt-1.5 font-mono text-[11px] text-muted/80">
                        {c.filename} · {c.pageCount} pages
                        {c.clauseCount > 0 ? ` · ${c.clauseCount} clauses` : ""}
                      </p>
                    </div>

                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="text-[12px] text-muted">
                        {formatRelative(c.createdAt)}
                      </p>
                    </div>

                    {!disabled ? (
                      <ChevronRight
                        width={18}
                        height={18}
                        className="shrink-0 text-line-strong transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-plum-400"
                      />
                    ) : (
                      <span className="shrink-0 pr-1 text-[11px] text-clay-600">
                        No text layer
                      </span>
                    )}
                  </div>
                );

                return (
                  <li
                    key={c.id}
                    className="animate-rise"
                    style={{ animationDelay: `${i * 45}ms` }}
                  >
                    {disabled ? (
                      Row
                    ) : (
                      <Link href={`/contracts/${c.id}`}>{Row}</Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ── Upload ─────────────────────────────────────── */}
          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-8">
              <UploadCard />
              <div className="mt-5 rounded-2xl border border-line bg-cream/60 p-5">
                <p className="eyebrow mb-3">Good to know</p>
                <ul className="space-y-2.5 text-[13px] leading-relaxed text-muted">
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-rose-300" />
                    Scanned PDFs are rejected — there is no OCR step, and a
                    silent bad read is worse than a clear refusal.
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-rose-300" />
                    Nothing here is legal advice. It is a first pass to tell you
                    where to look.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
