import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/app-shell";
import { UploadCard } from "@/components/upload-card";
import { StatusBadge } from "@/components/ui";
import { ChevronRight, FileText } from "@/components/icons";
import { DeleteContractButton } from "@/components/contract/contract-actions";
import { listContracts } from "@/lib/supabase/queries";
import { contracts as demoContracts } from "@/lib/mock-data";
import type { Contract } from "@/lib/types";
import { cn, formatRelative } from "@/lib/utils";

export const metadata = { title: "Contracts" };

// The one worked example, kept reachable so the finished screens can be seen
// before the pipeline exists. Removed once real contracts get analysed.
const example = demoContracts[0];

export default async function ContractsPage() {
  const contracts = await listContracts();

  return (
    <>
      <PageHeader
        eyebrow="Your workspace"
        title="Contracts"
        description="Every contract you have uploaded, and what ClauseLens found in it."
      />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="order-2 lg:order-1">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-display text-xl text-cocoa-900">
                {contracts.length === 0
                  ? "Nothing uploaded yet"
                  : `${contracts.length} contract${contracts.length === 1 ? "" : "s"}`}
              </h2>
              {contracts.length > 0 ? (
                <span className="text-[13px] text-muted">Newest first</span>
              ) : null}
            </div>

            {contracts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-line-strong bg-white/60 px-6 py-10 text-center">
                <p className="font-display text-lg text-cocoa-900">
                  Drop your first contract in
                </p>
                <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
                  Use the panel on the right. Or look at the worked example below
                  to see what a finished review looks like.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {contracts.map((c, i) => (
                  <li
                    key={c.id}
                    className="animate-rise"
                    style={{ animationDelay: `${i * 45}ms` }}
                  >
                    <ContractRow contract={c} />
                  </li>
                ))}
              </ul>
            )}

            {/* ── Worked example ─────────────────────────── */}
            <div className="mt-10">
              <div className="mb-3 flex items-center gap-3">
                <span className="eyebrow">Worked example</span>
                <span className="h-px flex-1 bg-line" />
              </div>
              <ContractRow contract={example} isExample />
              <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
                Sample data, not a real upload — it shows the deal-terms table,
                risk review and Q&amp;A as they will look once the pipeline runs.
              </p>
            </div>
          </div>

          {/* ── Upload ─────────────────────────────────────── */}
          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-8">
              <UploadCard />
              <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-linen/60">
                <div className="relative h-32 w-full overflow-hidden">
                  <Image
                    src="/images/cream-arch.jpg"
                    alt="A pale sculptural archway"
                    fill
                    sizes="360px"
                    className="photo-warm object-cover"
                  />
                </div>
                <div className="p-5">
                  <p className="eyebrow mb-3">Good to know</p>
                  <ul className="space-y-2.5 text-[13px] leading-relaxed text-muted">
                    <li className="flex gap-2.5">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-blush-300" />
                      Your files are private. Storage policies scope every upload
                      to your own account.
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-blush-300" />
                      Scanned PDFs will be rejected — there is no OCR step, and a
                      silent bad read is worse than a clear refusal.
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-blush-300" />
                      Nothing here is legal advice. It is a first pass to tell you
                      where to look.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ContractRow({
  contract: c,
  isExample = false,
}: {
  contract: Contract;
  isExample?: boolean;
}) {
  const failed = c.status === "failed";

  return (
    <div
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-soft transition-all duration-200",
        isExample ? "border-dashed border-line-strong" : "border-line",
        "hover:-translate-y-0.5 hover:shadow-lift",
      )}
    >
      {/* The whole card is the link; the delete control opts back in below. */}
      <Link
        href={`/contracts/${c.id}`}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`Open ${c.title}`}
      />

      <span className="relative z-10 grid size-11 shrink-0 place-items-center rounded-xl bg-blush-50 text-cocoa-500">
        <FileText width={19} height={19} />
      </span>

      <div className="relative z-10 min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <p className="truncate font-display text-[17px] tracking-[-0.01em] text-cocoa-900">
            {c.title}
          </p>
          {isExample ? (
            <span className="rounded-full border border-line-strong bg-linen px-2 py-0.5 text-[10px] font-medium text-muted">
              example
            </span>
          ) : (
            <StatusBadge status={c.status} />
          )}
          {c.splitFallback ? (
            <span
              className="rounded-full border border-ochre-200 bg-ochre-50 px-2 py-0.5 text-[10px] font-medium text-ochre-700"
              title="No clause headings found — split by paragraph instead."
            >
              fallback split
            </span>
          ) : null}
        </div>
        <p className="mt-1 truncate text-[13px] text-muted">{c.counterparty}</p>
        <p className="mt-1.5 truncate font-mono text-[11px] text-muted/80">
          {c.filename}
          {c.pageCount > 0 ? ` · ${c.pageCount} pages` : ""}
          {c.clauseCount > 0 ? ` · ${c.clauseCount} clauses` : ""}
        </p>
        {failed && c.errorMessage ? (
          <p className="mt-2 rounded-lg border border-brick-200 bg-brick-50 px-2.5 py-1.5 text-[11.5px] leading-relaxed text-brick-700">
            {c.errorMessage}
          </p>
        ) : null}
      </div>

      <div className="relative z-10 hidden shrink-0 text-right sm:block">
        <p className="text-[12px] text-muted">{formatRelative(c.createdAt)}</p>
      </div>

      {!isExample ? (
        <DeleteContractButton
          contractId={c.id}
          filename={c.filename}
          className="relative z-10"
        />
      ) : null}

      <ChevronRight
        width={18}
        height={18}
        className="relative z-10 shrink-0 text-line-strong transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-cocoa-400"
      />
    </div>
  );
}
