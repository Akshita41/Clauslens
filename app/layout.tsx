import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

// SOFT and WONK are what give Fraunces its warm, slightly quirky letterforms —
// without requesting the axes here, the font-variation-settings in globals.css
// would have nothing to act on.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ClauseLens — contract review you can check",
    template: "%s · ClauseLens",
  },
  description:
    "Upload a contract and get key terms, risk flags and answers — every one of them citing the exact clause and page it came from.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
