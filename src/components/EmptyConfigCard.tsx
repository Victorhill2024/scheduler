import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

/**
 * Friendly placeholder shown on pages that need Notion / Supabase env vars
 * before they can render real data. Keeps local dev unblockable.
 */
export function EmptyConfigCard({
  title = "Connect your data sources",
  message,
}: {
  title?: string;
  message?: string;
}) {
  return (
    <Card className="border-amber-300 bg-amber-50">
      <CardContent className="flex items-start gap-3 p-5">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        <div className="space-y-2">
          <p className="font-semibold text-amber-900">{title}</p>
          <p className="text-sm text-amber-900/90">
            {message ??
              "Notion or Supabase credentials aren't set yet. Copy .env.example to .env.local and fill in the values."}
          </p>
          <p className="text-sm text-amber-900/90">
            See{" "}
            <Link href="/" className="underline">
              docs/SETUP.md
            </Link>{" "}
            for the full walkthrough.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
