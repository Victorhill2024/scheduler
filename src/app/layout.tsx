import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import { CrescereTheme } from "@/components/CrescereTheme";
import { Header } from "@/components/Header";
import { BRAND } from "@/lib/constants";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND.product} · ${BRAND.name}`,
  description:
    "Plan, schedule, and ship social posts across Instagram, LinkedIn, and Twitter from a single Notion source of truth.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        <CrescereTheme>
          <Header />
          <main className="container py-8">{children}</main>
          <footer className="border-t border-border bg-card">
            <div className="container flex h-14 items-center justify-between text-xs text-muted-foreground">
              <span>
                © {new Date().getFullYear()} {BRAND.name}
              </span>
              <span>{BRAND.product} v0.1</span>
            </div>
          </footer>
        </CrescereTheme>
      </body>
    </html>
  );
}
