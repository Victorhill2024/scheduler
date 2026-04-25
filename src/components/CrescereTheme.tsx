/**
 * CrescereTheme — applies brand color CSS custom properties at the
 * document root. Pair with `tailwind.config.ts` for full coverage.
 *
 * This is a server component (no client state) wrapping children
 * in a div that exposes the brand vars to descendants.
 */

import { BRAND } from "@/lib/constants";

export function CrescereTheme({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={
        {
          "--crescere-forest": BRAND.colors.forest,
          "--crescere-cream": BRAND.colors.cream,
          "--crescere-gold": BRAND.colors.gold,
          "--crescere-text": BRAND.colors.text,
          "--crescere-border": BRAND.colors.border,
        } as React.CSSProperties
      }
      className="min-h-screen bg-background font-sans text-foreground antialiased"
    >
      {children}
    </div>
  );
}
