import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarDays, CheckCircle2, FilePlus, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostCard } from "@/components/PostCard";
import { BRAND } from "@/lib/constants";
import type { DashboardStats, Post } from "@/lib/types";

interface DashboardProps {
  stats: DashboardStats;
  recentPosts: Post[];
}

export function Dashboard({ stats, recentPosts }: DashboardProps) {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl bg-forest text-cream shadow-lg">
        <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-[2fr_1fr] md:p-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-cream/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
              {BRAND.name}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Plan, schedule, and ship across every channel.
            </h1>
            <p className="max-w-xl text-cream/80">
              {BRAND.product} unifies Instagram, LinkedIn, and Twitter publishing on top
              of a single Notion source of truth — so your team writes once and reaches
              everyone.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild variant="secondary" size="lg">
                <Link href="/posts/new">
                  <FilePlus className="h-4 w-4" />
                  Create new post
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="text-cream hover:bg-cream/10"
              >
                <Link href="/posts">
                  View all posts <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="hidden items-end justify-end md:flex">
            <div
              aria-hidden
              className="flex h-32 w-32 items-center justify-center rounded-full bg-gold/20 text-gold"
            >
              <CalendarDays className="h-14 w-14" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Total posts"
          value={stats.totalPosts}
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          label="Scheduled · 7d"
          value={stats.scheduledNext7Days}
          icon={<CalendarDays className="h-4 w-4" />}
          accent
        />
        <StatCard
          label="Published this month"
          value={stats.publishedThisMonth}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatCard
          label="Failed"
          value={stats.failedPosts}
          icon={<AlertTriangle className="h-4 w-4" />}
          tone={stats.failedPosts > 0 ? "alert" : "default"}
        />
      </section>

      {/* Recent activity */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-forest">
              Recent activity
            </h2>
            <p className="text-sm text-muted-foreground">
              Your five most recently scheduled or edited posts.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/posts">
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {recentPosts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <PostCard key={post.notionPageId} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: boolean;
  tone?: "default" | "alert";
}

function StatCard({ label, value, icon, accent, tone = "default" }: StatCardProps) {
  return (
    <Card className={accent ? "border-gold/40 bg-gold-50" : undefined}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
        <span
          className={
            tone === "alert" && value > 0
              ? "text-red-600"
              : accent
                ? "text-gold-600"
                : "text-forest"
          }
        >
          {icon}
        </span>
      </CardHeader>
      <CardContent>
        <div
          className={
            tone === "alert" && value > 0
              ? "text-3xl font-semibold tracking-tight text-red-700"
              : "text-3xl font-semibold tracking-tight text-forest"
          }
        >
          {value.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-center">
        <div
          aria-hidden
          className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-200 text-forest"
        >
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-forest">No posts yet</p>
          <p className="text-sm text-muted-foreground">
            Create your first post and schedule it across platforms.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/posts/new">
            <FilePlus className="h-4 w-4" />
            Create new post
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
