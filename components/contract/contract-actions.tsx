"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Spinner, X } from "@/components/icons";

/**
 * Deleting a contract removes the database row and the stored PDF.
 *
 * The row goes first: the foreign keys cascade, so clauses, extractions and
 * flags go with it. Only then is the file removed — an orphaned file wastes a
 * little storage, while an orphaned row would render a contract whose PDF can
 * no longer be read.
 */
export function DeleteContractButton({
  contractId,
  filename,
  className,
}: {
  contractId: string;
  filename: string;
  className?: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    const supabase = createClient();

    const { data: row } = await supabase
      .from("contracts")
      .select("storage_path")
      .eq("id", contractId)
      .maybeSingle();

    const { error } = await supabase
      .from("contracts")
      .delete()
      .eq("id", contractId);

    if (error) {
      setBusy(false);
      setConfirming(false);
      return;
    }

    if (row?.storage_path) {
      await supabase.storage.from("contracts").remove([row.storage_path]);
    }

    router.refresh();
  }

  if (confirming) {
    return (
      <span
        className={cn("flex items-center gap-1.5", className)}
        onClick={(e) => e.preventDefault()}
      >
        <span className="hidden text-[11.5px] text-muted sm:inline">
          Delete {filename}?
        </span>
        <button
          onClick={remove}
          disabled={busy}
          className="rounded-full bg-brick-600 px-2.5 py-1 text-[11.5px] font-medium text-white transition-colors hover:bg-brick-700 disabled:opacity-50"
        >
          {busy ? (
            <Spinner width={12} height={12} className="animate-spin" />
          ) : (
            "Delete"
          )}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={busy}
          className="rounded-full border border-line px-2.5 py-1 text-[11.5px] text-muted transition-colors hover:bg-cocoa-50"
        >
          Keep
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        setConfirming(true);
      }}
      aria-label={`Delete ${filename}`}
      title="Delete"
      className={cn(
        "rounded-lg p-1.5 text-line-strong opacity-0 transition-all group-hover:opacity-100 hover:bg-brick-50 hover:text-brick-600 focus-visible:opacity-100",
        className,
      )}
    >
      <X width={15} height={15} />
    </button>
  );
}

/**
 * Re-runs the parse step. Needed when a contract failed, and useful after a
 * change to the splitter — the route replaces the previous clauses rather than
 * adding to them, so this is safe to press twice.
 */
export function ReparseButton({
  contractId,
  label = "Try reading it again",
}: {
  contractId: string;
  label?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/contracts/${contractId}/parse`, {
      method: "POST",
    });
    const body = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(body.error ?? "Could not read that PDF.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={run}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-white px-5 py-2.5 text-sm text-cocoa-800 transition-all hover:border-cocoa-300 hover:bg-cocoa-50 disabled:opacity-50"
      >
        {busy ? (
          <>
            <Spinner width={15} height={15} className="animate-spin" />
            Reading…
          </>
        ) : (
          label
        )}
      </button>
      {error ? (
        <p className="max-w-sm text-center text-[12.5px] leading-relaxed text-brick-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
