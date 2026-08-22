"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui";
import { Lock, Spinner } from "./icons";

/**
 * Presentation only. Wiring this up means swapping `onSubmit` for
 * supabase.auth.signInWithPassword / signUp — the markup does not change.
 */
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";

  return (
    <div className="rounded-3xl border border-line bg-white p-8 shadow-lift">
      <h1 className="font-display text-[1.75rem] leading-tight tracking-[-0.02em] text-cocoa-900">
        {isLogin ? "Welcome back" : "Create your workspace"}
      </h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
        {isLogin
          ? "Sign in to pick up where you left off."
          : "Upload a contract and see the whole review in about a minute."}
      </p>

      <form
        className="mt-7 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          setTimeout(() => router.push("/contracts"), 650);
        }}
      >
        {!isLogin ? (
          <Field label="Name" type="text" placeholder="Aditi Sharma" autoComplete="name" />
        ) : null}
        <Field
          label="Email"
          type="email"
          placeholder="you@firm.com"
          autoComplete="email"
          required
        />
        <Field
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
        />

        <Button type="submit" className="w-full" size="lg" disabled={busy}>
          {busy ? (
            <>
              <Spinner width={16} height={16} className="animate-spin" />
              One moment…
            </>
          ) : isLogin ? (
            "Sign in"
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[11px] tracking-[0.1em] text-muted uppercase">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <Link
        href="/contracts"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-line-strong bg-white px-5 py-3 text-sm text-cocoa-800 transition-all hover:border-cocoa-300 hover:bg-cocoa-50"
      >
        Continue to the demo workspace
      </Link>

      <p className="mt-6 flex items-start gap-2 text-[12px] leading-relaxed text-muted">
        <Lock width={13} height={13} className="mt-0.5 shrink-0" />
        Auth is not connected in this build — either button takes you straight to
        the workspace.
      </p>

      <p className="mt-6 border-t border-line pt-5 text-center text-[13px] text-muted">
        {isLogin ? "No account yet? " : "Already have an account? "}
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="font-medium text-cocoa-700 underline underline-offset-4 hover:text-cocoa-900"
        >
          {isLogin ? "Create one" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  ...props
}: React.ComponentProps<"input"> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-medium text-cocoa-700">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-2xl border border-line bg-linen/40 px-4 py-3 text-[14px] text-cocoa-900 transition-colors outline-none placeholder:text-muted/60 focus:border-cocoa-300 focus:bg-white"
      />
    </label>
  );
}
