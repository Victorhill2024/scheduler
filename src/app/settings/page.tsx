import { KeyRound, Lock, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformIcon } from "@/components/PlatformIcon";
import { ALL_PLATFORMS, PLATFORMS } from "@/lib/constants";

export const metadata = { title: "Settings · Scheduler" };

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-forest">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Platform credentials and team management — coming in v2.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" /> Platform credentials
          </CardTitle>
          <CardDescription>
            For v1, credentials are read from environment variables (see{" "}
            <code className="rounded bg-cream-200 px-1.5 py-0.5 text-xs">.env.example</code>
            ). v2 will move these into Supabase with per-team encryption.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {ALL_PLATFORMS.map((p) => (
              <li key={p} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <PlatformIcon platform={p} size={20} />
                  <span className="font-medium text-forest">{PLATFORMS[p].label}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" /> Configured via env vars
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Team
          </CardTitle>
          <CardDescription>
            Role-based access (Owner / Editor / Viewer) ships with v2.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
