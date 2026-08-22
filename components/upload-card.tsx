"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Check, Info, Spinner, Upload } from "./icons";
import { Button } from "./ui";

const MAX_BYTES = 25 * 1024 * 1024;

type Phase = "idle" | "uploading" | "parsing" | "done" | "error";

export function UploadCard() {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [filename, setFilename] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [contractId, setContractId] = useState<string | null>(null);
  const [clauseCount, setClauseCount] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setPhase("idle");
    setFilename(null);
    setMessage(null);
    setContractId(null);
    setClauseCount(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const upload = useCallback(
    async (file: File) => {
      setFilename(file.name);
      setMessage(null);

      if (file.type !== "application/pdf") {
        setPhase("error");
        setMessage("That isn't a PDF. ClauseLens only reads PDF contracts.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setPhase("error");
        setMessage("That file is over 25 MB. Try a smaller contract.");
        return;
      }

      setPhase("uploading");
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setPhase("error");
        setMessage("Your session expired. Sign in again.");
        return;
      }

      // The first path segment is the owner — the storage policies in the
      // migration compare it against auth.uid(), so a user can only ever
      // write into their own folder.
      const id = crypto.randomUUID();
      const storagePath = `${user.id}/${id}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("contracts")
        .upload(storagePath, file, { contentType: "application/pdf" });

      if (uploadError) {
        setPhase("error");
        setMessage(uploadError.message);
        return;
      }

      const { error: insertError } = await supabase.from("contracts").insert({
        id,
        user_id: user.id,
        filename: file.name,
        storage_path: storagePath,
        status: "uploaded",
      });

      if (insertError) {
        // Do not leave an orphaned file behind if the row failed to write.
        await supabase.storage.from("contracts").remove([storagePath]);
        setPhase("error");
        setMessage(insertError.message);
        return;
      }

      setContractId(id);

      // Step one of the pipeline. Its own request, so a long parse never holds
      // the upload open and the UI can show what stage it reached.
      setPhase("parsing");
      const response = await fetch(`/api/contracts/${id}/parse`, {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok) {
        setPhase("error");
        setMessage(result.error ?? "Could not read that PDF.");
        router.refresh();
        return;
      }

      setClauseCount(result.clauseCount);
      setPhase("done");
      router.refresh();
    },
    [router],
  );

  const onFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) void upload(file);
  };

  const busy = phase === "uploading" || phase === "parsing";

  if (phase !== "idle") {
    return (
      <div className="rounded-3xl border border-line bg-white p-7 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow mb-2">
              {phase === "uploading"
                ? "Uploading"
                : phase === "parsing"
                  ? "Reading clauses"
                  : phase === "done"
                    ? "Ready"
                    : "Didn't work"}
            </p>
            <p className="truncate font-display text-lg text-cocoa-900">
              {filename}
            </p>
          </div>
          {!busy ? (
            <button
              onClick={reset}
              className="shrink-0 rounded-full px-3 py-1.5 text-[13px] text-muted transition-colors hover:bg-cocoa-50 hover:text-cocoa-700"
            >
              {phase === "done" ? "Upload another" : "Try again"}
            </button>
          ) : null}
        </div>

        <div className="mt-6 flex items-start gap-3.5">
          <span
            className={cn(
              "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border",
              busy && "border-cocoa-200 bg-white text-cocoa-600",
              phase === "done" && "border-sage-200 bg-sage-50 text-sage-700",
              phase === "error" && "border-brick-200 bg-brick-50 text-brick-700",
            )}
          >
            {busy ? (
              <Spinner width={14} height={14} className="animate-spin" />
            ) : phase === "done" ? (
              <Check width={14} height={14} />
            ) : (
              <Info width={14} height={14} />
            )}
          </span>

          <p className="text-[13px] leading-relaxed text-muted">
            {phase === "uploading"
              ? "Sending the file to your private storage bucket…"
              : phase === "parsing"
                ? "Reading the PDF and splitting it on its own clause structure…"
                : phase === "done"
                  ? `Split into ${clauseCount} clauses, each with its page number.`
                  : message}
          </p>
        </div>

        {phase === "done" && contractId ? (
          <Link
            href={`/contracts/${contractId}`}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-cocoa-700 px-5 py-3 text-sm font-medium text-white shadow-soft transition-all hover:bg-cocoa-800 hover:shadow-lift"
          >
            Open the clauses
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onFiles(e.dataTransfer.files);
      }}
      className={cn(
        "rounded-3xl border-2 border-dashed p-9 text-center transition-all duration-300",
        dragging
          ? "border-cocoa-300 bg-cocoa-50 shadow-lift"
          : "border-line-strong bg-white/70 hover:border-cocoa-200 hover:bg-white",
      )}
    >
      <div
        className={cn(
          "mx-auto grid size-14 place-items-center rounded-2xl transition-colors duration-300",
          dragging ? "bg-white text-cocoa-600" : "bg-blush-50 text-blush-500",
        )}
      >
        <Upload width={22} height={22} />
      </div>
      <p className="mt-5 font-display text-lg text-cocoa-900">
        Drop a contract here
      </p>
      <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-muted">
        PDF with a text layer, up to 25 MB. Scanned documents aren&apos;t
        supported yet.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />
      <Button
        variant="secondary"
        className="mt-6"
        onClick={() => inputRef.current?.click()}
      >
        Choose a file
      </Button>
    </div>
  );
}
