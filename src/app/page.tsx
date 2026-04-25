import { addDays, isAfter, isBefore, parseISO, startOfMonth } from "date-fns";

import { Dashboard } from "@/components/Dashboard";
import { EmptyConfigCard } from "@/components/EmptyConfigCard";
import { listPosts } from "@/lib/notion";
import type { DashboardStats, Post } from "@/lib/types";

export const dynamic = "force-dynamic";

function computeStats(posts: Post[]): DashboardStats {
  const now = new Date();
  const in7 = addDays(now, 7);
  const monthStart = startOfMonth(now);

  let scheduledNext7Days = 0;
  let publishedThisMonth = 0;
  let failedPosts = 0;

  for (const p of posts) {
    if (p.status === "failed") failedPosts++;
    if (p.status === "published" && p.postedAt) {
      try {
        if (isAfter(parseISO(p.postedAt), monthStart)) publishedThisMonth++;
      } catch {
        /* ignore parse errors */
      }
    }
    if (p.status === "scheduled" && p.scheduledDateTime) {
      try {
        const d = parseISO(p.scheduledDateTime);
        if (isAfter(d, now) && isBefore(d, in7)) scheduledNext7Days++;
      } catch {
        /* ignore parse errors */
      }
    }
  }

  return {
    totalPosts: posts.length,
    scheduledNext7Days,
    publishedThisMonth,
    failedPosts,
  };
}

export default async function HomePage() {
  let posts: Post[] = [];
  let configError: string | null = null;
  try {
    posts = await listPosts();
  } catch (err) {
    configError = err instanceof Error ? err.message : "Unknown error";
  }

  if (configError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-forest">Welcome</h1>
        <EmptyConfigCard message={configError} />
      </div>
    );
  }

  const stats = computeStats(posts);
  const recent = [...posts]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 5);

  return <Dashboard stats={stats} recentPosts={recent} />;
}
