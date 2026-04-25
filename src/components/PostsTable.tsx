"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Filter, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlatformIconList } from "@/components/PlatformIcon";
import { StatusBadge } from "@/components/StatusBadge";
import { ALL_PLATFORMS, PLATFORMS, STATUS_LABELS } from "@/lib/constants";
import { formatScheduled, truncate } from "@/lib/utils";
import type { Platform, Post, PostStatus } from "@/lib/types";

interface PostsTableProps {
  posts: Post[];
}

export function PostsTable({ posts }: PostsTableProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<PostStatus | "all">("all");
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (platformFilter !== "all" && !p.platforms.includes(platformFilter)) return false;
      return true;
    });
  }, [posts, statusFilter, platformFilter]);

  const duplicate = async (post: Post) => {
    const res = await fetch(`/api/posts/${post.notionPageId}/duplicate`, { method: "POST" });
    if (res.ok) router.refresh();
  };

  const remove = async (post: Post) => {
    if (!confirm(`Delete "${post.title}"? It will be archived in Notion.`)) return;
    const res = await fetch(`/api/posts/${post.notionPageId}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="flex items-center gap-1.5 text-sm font-medium text-forest">
            <Filter className="h-4 w-4" /> Filter
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PostStatus | "all")}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {(Object.keys(STATUS_LABELS) as PostStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={platformFilter} onValueChange={(v) => setPlatformFilter(v as Platform | "all")}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              {ALL_PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>
                  {PLATFORMS[p].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="ml-auto text-sm text-muted-foreground">
            {filtered.length} of {posts.length}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
            <p className="text-sm text-muted-foreground">No posts match the current filters.</p>
            <Button asChild size="sm" variant="outline">
              <Link href="/posts/new">Create your first post</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-cream-100 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Caption</th>
                  <th className="px-4 py-3 font-semibold">Platforms</th>
                  <th className="px-4 py-3 font-semibold">Scheduled</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((post) => (
                  <tr
                    key={post.notionPageId}
                    className="border-b border-border last:border-0 hover:bg-cream-100/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/posts/${post.notionPageId}`}
                        className="font-medium text-forest hover:underline"
                      >
                        {post.title || "Untitled"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-foreground/70">
                      {truncate(post.caption, 60)}
                    </td>
                    <td className="px-4 py-3">
                      <PlatformIconList platforms={post.platforms} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {formatScheduled(post.scheduledDateTime)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/posts/${post.notionPageId}`}
                          className="rounded p-1.5 text-muted-foreground hover:bg-cream-200 hover:text-forest"
                          aria-label="Edit post"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => duplicate(post)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-cream-200 hover:text-forest"
                          aria-label="Duplicate post"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(post)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-red-100 hover:text-red-700"
                          aria-label="Delete post"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
