"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Chart, FileText, Logo, LogOut, ShieldCheck } from "./icons";

const nav = [
  { href: "/contracts", label: "Contracts", icon: FileText },
  { href: "/playbook", label: "Playbook", icon: ShieldCheck },
  { href: "/accuracy", label: "Accuracy", icon: Chart },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-shell">
      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-line bg-white/80 backdrop-blur-sm transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 px-6 py-6 text-cocoa-800"
          onClick={() => setOpen(false)}
        >
          <Logo width={26} height={26} />
          <span className="font-display text-[17px] tracking-[-0.01em]">
            ClauseLens
          </span>
        </Link>

        <nav className="flex-1 space-y-1 px-3">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                  active
                    ? "bg-cocoa-50 font-medium text-cocoa-800"
                    : "text-cocoa-600/80 hover:bg-cocoa-50/60 hover:text-cocoa-800",
                )}
              >
                <Icon width={18} height={18} className={active ? "" : "opacity-70"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blush-100 font-display text-[13px] text-cocoa-700">
              A
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-cocoa-800">
                Demo account
              </p>
              <p className="truncate text-[11px] text-muted">demo@clauselens.app</p>
            </div>
            <Link
              href="/"
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-cocoa-50 hover:text-cocoa-700"
              aria-label="Sign out"
            >
              <LogOut width={16} height={16} />
            </Link>
          </div>
        </div>
      </aside>

      {open ? (
        <button
          className="fixed inset-0 z-30 bg-cocoa-900/20 backdrop-blur-[2px] lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        />
      ) : null}

      {/* ── Main ──────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-[248px]">
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-shell/85 px-5 py-3 backdrop-blur-md lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-cocoa-700 transition-colors hover:bg-cocoa-50"
            aria-label="Open menu"
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <span className="font-display text-cocoa-800">ClauseLens</span>
        </div>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

/** Page header used at the top of every app screen. */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-b border-line bg-white/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-9 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? <p className="eyebrow mb-2.5">{eyebrow}</p> : null}
          <h1 className="font-display text-[2rem] leading-tight tracking-[-0.02em] text-cocoa-900">
            {title}
          </h1>
          {description ? (
            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
