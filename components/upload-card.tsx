"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Spinner, Upload } from "./icons";
import { Button } from "./ui";

/**
 * The three pipeline steps map 1:1 to the three API routes in the plan:
 * /parse, /extract, /analyze. The client drives them in sequence and polls
 * status — which is why the UI can show real progress without a job queue.
 */
const PIPELINE = [
  { key: "parse", label: "Splitting into clauses", detail: "pdfjs → clause splitter → embeddings" },
  { key: "extract", label: "Extracting deal terms", detail: "8 fields, each with a clause citation" },
  { key: "analyze", label: "Checking your playbook", detail: "7 rules → risk flags" },
] as const;

type Phase = "idle" | "running" | "done";

export function UploadCard() {
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [filename, setFilename] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  const start = useCallback((name: string) => {
    setFilename(name);
    setPhase("running");
    setStep(0);
    // Placeholder timings. Replaced by real fetch() calls to the pipeline routes.
    timers.current.push(setTimeout(() => setStep(1), 1400));
    timers.current.push(setTimeout(() => setStep(2), 3000));
    timers.current.push(
      setTimeout(() => {
        setStep(3);
        setPhase("done");
      }, 4600),
    );
  }, []);

  const onFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    start(file.name);
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase("idle");
    setStep(0);
    setFilename(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (phase !== "idle") {
    return (
      <div className="rounded-3xl border border-line bg-white p-7 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow mb-2">
              {phase === "done" ? "Review ready" : "Processing"}
            </p>
            <p className="truncate font-display text-lg text-plum-900">{filename}</p>
          </div>
          <button
            onClick={reset}
            className="shrink-0 rounded-full px-3 py-1.5 text-[13px] text-muted transition-colors hover:bg-plum-50 hover:text-plum-700"
          >
            {phase === "done" ? "Upload another" : "Cancel"}
          </button>
        </div>

        <ol className="mt-7 space-y-1">
          {PIPELINE.map((s, i) => {
            const state = i < step ? "done" : i === step ? "active" : "todo";
            return (
              <li
                key={s.key}
                className={cn(
                  "flex items-start gap-3.5 rounded-2xl px-3 py-3 transition-colors duration-300",
                  state === "active" && "bg-plum-50/70",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border transition-colors duration-300",
                    state === "done" && "border-sage-200 bg-sage-50 text-sage-700",
                    state === "active" && "border-plum-200 bg-white text-plum-600",
                    state === "todo" && "border-line bg-white text-line-strong",
                  )}
                >
                  {state === "done" ? (
                    <Check width={13} height={13} />
                  ) : state === "active" ? (
                    <Spinner width={13} height={13} className="animate-spin" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-current" />
                  )}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-sm transition-colors duration-300",
                      state === "todo" ? "text-muted" : "font-medium text-plum-800",
                    )}
                  >
                    {s.label}
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] text-muted/80">
                    {s.detail}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>

        {phase === "done" ? (
          <Link
            href="/contracts/msa-brightharbor"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-plum-700 px-5 py-3 text-sm font-medium text-white shadow-soft transition-all hover:bg-plum-800 hover:shadow-lift"
          >
            Open the review
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
          ? "border-plum-300 bg-plum-50 shadow-lift"
          : "border-line-strong bg-white/70 hover:border-plum-200 hover:bg-white",
      )}
    >
      <div
        className={cn(
          "mx-auto grid size-14 place-items-center rounded-2xl transition-colors duration-300",
          dragging ? "bg-white text-plum-600" : "bg-rose-50 text-plum-500",
        )}
      >
        <Upload width={22} height={22} />
      </div>
      <p className="mt-5 font-display text-lg text-plum-900">
        Drop a contract here
      </p>
      <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-muted">
        PDF with a text layer, up to about 50 pages. Scanned documents aren&apos;t
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
