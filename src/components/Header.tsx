"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, LayoutDashboard, ListChecks, BarChart3, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/constants";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/posts", label: "Posts", icon: ListChecks },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-forest text-cream">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-md bg-gold text-forest-900"
          >
            <CalendarClock className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold">{BRAND.product}</div>
            <div className="text-[11px] uppercase tracking-widest text-cream/70">
              {BRAND.name}
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-cream/10 text-cream"
                    : "text-cream/70 hover:bg-cream/5 hover:text-cream",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/posts/new"
            className="hidden rounded-md bg-gold px-3 py-1.5 text-sm font-semibold text-forest-900 transition-colors hover:bg-gold-300 md:inline-flex"
          >
            + New post
          </Link>
        </div>
      </div>
    </header>
  );
}
