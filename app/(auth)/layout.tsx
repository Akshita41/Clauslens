import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/icons";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* ── Form side ─────────────────────────────────────── */}
      <div className="wash flex flex-col">
        <header className="px-8 py-7">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-cocoa-800"
          >
            <Logo width={26} height={26} />
            <span className="font-display text-[17px] tracking-[-0.01em]">
              ClauseLens
            </span>
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-[26rem] animate-rise">{children}</div>
        </main>

        <footer className="px-8 py-6 text-[12.5px] text-muted">
          Not legal advice. A demonstration project for grounded contract review.
        </footer>
      </div>

      {/* ── Photo side ────────────────────────────────────── */}
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="/images/linen-ceramics.jpg"
          alt="Cream ceramic vessels resting on folded linen"
          fill
          priority
          sizes="50vw"
          className="photo-warm object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa-900/80 via-cocoa-900/25 to-transparent" />
        <blockquote className="absolute inset-x-0 bottom-0 p-12">
          <p className="max-w-sm font-display text-[1.7rem] leading-[1.25] tracking-[-0.02em] text-white">
            “Every flag points at the clause it came from.”
          </p>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-white/75">
            Nothing appears in ClauseLens unless it can name its source — clause
            number, page, and the sentence itself.
          </p>
        </blockquote>
      </div>
    </div>
  );
}
