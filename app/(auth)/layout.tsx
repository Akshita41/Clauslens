import Link from "next/link";
import { Logo } from "@/components/icons";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="wash flex min-h-dvh flex-col">
      <header className="mx-auto w-full max-w-6xl px-6 py-6">
        <Link href="/" className="inline-flex items-center gap-2.5 text-plum-800">
          <Logo width={26} height={26} />
          <span className="font-display text-[17px] tracking-[-0.01em]">
            ClauseLens
          </span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-[26rem] animate-rise">{children}</div>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 py-6 text-[12.5px] text-muted">
        Not legal advice. A demonstration project for grounded contract review.
      </footer>
    </div>
  );
}
