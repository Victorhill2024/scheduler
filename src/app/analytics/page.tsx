import { BarChart3, Eye, Heart, Link2, Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Analytics · Scheduler" };

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-forest">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Cross-platform performance — coming soon.
        </p>
      </div>

      <Card className="border-dashed border-forest/30 bg-cream-100">
        <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/20 text-gold-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-forest">Coming soon</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Once API integrations are live, this view will pull engagement data from
              Instagram Graph, LinkedIn Marketing, and Twitter v2 APIs into a unified
              report.
            </p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Metrics we'll track
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PlannedMetric icon={<Eye className="h-4 w-4" />} label="Impressions" />
          <PlannedMetric icon={<Heart className="h-4 w-4" />} label="Engagement" />
          <PlannedMetric icon={<Link2 className="h-4 w-4" />} label="Link clicks" />
          <PlannedMetric icon={<BarChart3 className="h-4 w-4" />} label="Reach by platform" />
        </div>
      </div>
    </div>
  );
}

function PlannedMetric({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">{label}</CardTitle>
        <span className="text-forest">{icon}</span>
      </CardHeader>
      <CardContent>
        <CardDescription>per post · per platform · per period</CardDescription>
      </CardContent>
    </Card>
  );
}
