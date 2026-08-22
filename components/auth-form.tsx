"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./ui";
import { Check, Info, Spinner } from "./icons";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const isLogin = mode === "login";

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();

    const supabase = createClient();

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
      // With email confirmation switched on, signUp succeeds but returns no
      // session — the user has to click the link before they can sign in.
      if (!data.session) {
        setCheckEmail(true);
        setBusy(false);
        return;
      }
    }

    router.push(params.get("next") ?? "/contracts");
    router.refresh();
  }

  if (checkEmail) {
    return (
      <div className="rounded-3xl border border-line bg-white p-8 shadow-lift">
        <div className="grid size-12 place-items-center rounded-2xl bg-sage-50 text-sage-700">
          <Check width={22} height={22} />
        </div>
        <h1 className="mt-5 font-display text-[1.6rem] leading-tight tracking-[-0.02em] text-cocoa-900">
          Check your inbox
        </h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
          We sent you a confirmation link. Click it, then come back and sign in.
        </p>
        <Link
          href="/login"
          className="mt-7 flex w-full items-center justify-center rounded-full border border-line-strong bg-white px-5 py-3 text-sm text-cocoa-800 transition-all hover:border-cocoa-300 hover:bg-cocoa-50"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

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

      <form className="mt-7 space-y-4" onSubmit={onSubmit}>
        {!isLogin ? (
          <Field
            label="Name"
            name="name"
            type="text"
            placeholder="Akshita Pal"
            autoComplete="name"
          />
        ) : null}
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="you@firm.com"
          autoComplete="email"
          required
        />
        <Field
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete={isLogin ? "current-password" : "new-password"}
          minLength={6}
          required
        />

        {error ? (
          <p className="flex items-start gap-2.5 rounded-2xl border border-brick-200 bg-brick-50 px-4 py-3 text-[13px] leading-relaxed text-brick-700">
            <Info width={15} height={15} className="mt-0.5 shrink-0" />
            {error}
          </p>
        ) : null}

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

      <p className="mt-7 border-t border-line pt-5 text-center text-[13px] text-muted">
        {isLogin ? "No account yet? " : "Already have an account? "}
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="font-medium text-blush-600 underline underline-offset-4 hover:text-blush-500"
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
