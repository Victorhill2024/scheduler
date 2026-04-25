import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">404</p>
      <h1 className="text-2xl font-semibold text-forest">We couldn't find that page.</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The post may have been archived, or the URL might be incorrect.
      </p>
      <Button asChild>
        <Link href="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
