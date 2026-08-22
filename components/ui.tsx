import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Confidence, ContractStatus, Severity } from "@/lib/types";
import { AlertTriangle, Check, Info, ShieldCheck, Spinner } from "./icons";

/* ── Button ─────────────────────────────────────────────────────── */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:opacity-45 disabled:pointer-events-none whitespace-nowrap";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-cocoa-700 text-white shadow-soft hover:bg-cocoa-800 hover:shadow-lift active:translate-y-px",
  secondary:
    "bg-white text-cocoa-800 border border-line-strong hover:border-cocoa-300 hover:bg-cocoa-50 active:translate-y-px",
  ghost: "text-cocoa-700 hover:bg-cocoa-50",
  danger: "bg-brick-600 text-white hover:bg-brick-700 active:translate-y-px",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "text-[13px] px-3.5 py-1.5",
  md: "text-sm px-5 py-2.5",
  lg: "text-[15px] px-7 py-3",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <Link
      className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], className)}
      {...props}
    />
  );
}

/* ── Surfaces ───────────────────────────────────────────────────── */

export function Card({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-line bg-white shadow-soft",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-6", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow mb-2.5">{eyebrow}</p> : null}
        <h2 className="font-display text-[1.6rem] leading-tight tracking-[-0.015em] text-cocoa-900">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ── Severity ───────────────────────────────────────────────────── */

const severityStyles: Record<
  Severity,
  { label: string; chip: string; dot: string; icon: typeof Check }
> = {
  OK: {
    label: "OK",
    chip: "bg-sage-50 text-sage-700 border-sage-200",
    dot: "bg-sage-600",
    icon: ShieldCheck,
  },
  CAUTION: {
    label: "Caution",
    chip: "bg-ochre-50 text-ochre-700 border-ochre-200",
    dot: "bg-ochre-600",
    icon: Info,
  },
  HIGH_RISK: {
    label: "High risk",
    chip: "bg-brick-50 text-brick-700 border-brick-200",
    dot: "bg-brick-600",
    icon: AlertTriangle,
  },
};

export function SeverityBadge({
  severity,
  withIcon = true,
  className,
}: {
  severity: Severity;
  withIcon?: boolean;
  className?: string;
}) {
  const s = severityStyles[severity];
  const Icon = s.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.06em] uppercase",
        s.chip,
        className,
      )}
    >
      {withIcon ? <Icon width={13} height={13} /> : null}
      {s.label}
    </span>
  );
}

export function severityAccent(severity: Severity) {
  return severityStyles[severity].dot;
}

/* ── Confidence ─────────────────────────────────────────────────── */

const confidenceStyles: Record<Confidence, { label: string; className: string }> = {
  high: { label: "High confidence", className: "text-sage-700 bg-sage-50 border-sage-200" },
  medium: {
    label: "Needs a look",
    className: "text-ochre-700 bg-ochre-50 border-ochre-200",
  },
  low: { label: "Low confidence", className: "text-brick-700 bg-brick-50 border-brick-200" },
};

export function ConfidencePill({
  confidence,
  className,
}: {
  confidence: Confidence;
  className?: string;
}) {
  const c = confidenceStyles[confidence];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        c.className,
        className,
      )}
      title="Model-reported confidence. Used to order your review queue, not as a probability."
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {c.label}
    </span>
  );
}

/* ── Contract status ────────────────────────────────────────────── */

const statusStyles: Record<
  ContractStatus,
  { label: string; className: string; busy?: boolean }
> = {
  uploaded: { label: "Queued", className: "bg-cocoa-50 text-cocoa-600 border-cocoa-200" },
  parsing: {
    label: "Reading clauses",
    className: "bg-cocoa-50 text-cocoa-600 border-cocoa-200",
    busy: true,
  },
  extracting: {
    label: "Extracting terms",
    className: "bg-cocoa-50 text-cocoa-600 border-cocoa-200",
    busy: true,
  },
  analyzing: {
    label: "Checking playbook",
    className: "bg-cocoa-50 text-cocoa-600 border-cocoa-200",
    busy: true,
  },
  ready: { label: "Ready", className: "bg-sage-50 text-sage-700 border-sage-200" },
  failed: { label: "Failed", className: "bg-brick-50 text-brick-700 border-brick-200" },
};

export function StatusBadge({
  status,
  className,
}: {
  status: ContractStatus;
  className?: string;
}) {
  const s = statusStyles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        s.className,
        className,
      )}
    >
      {s.busy ? (
        <Spinner width={12} height={12} className="animate-spin" />
      ) : (
        <span className="size-1.5 rounded-full bg-current opacity-70" />
      )}
      {s.label}
    </span>
  );
}

/* ── Empty state ────────────────────────────────────────────────── */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {icon ? (
        <div className="mb-5 grid size-14 place-items-center rounded-2xl border border-line bg-cocoa-50 text-cocoa-400">
          {icon}
        </div>
      ) : null}
      <p className="font-display text-lg text-cocoa-900">{title}</p>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

/* ── Small helpers ──────────────────────────────────────────────── */

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-line", className)} />;
}

export function MockNotice({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line-strong bg-linen px-2.5 py-1 text-[11px] text-muted">
      <span className="size-1.5 rounded-full bg-blush-300" />
      {children}
    </p>
  );
}
