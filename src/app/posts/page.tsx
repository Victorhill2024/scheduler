import Link from "next/link";
import { FilePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyConfigCard } from "@/components/EmptyConfigCard";
import { PostsTable } from "@/components/PostsTable";
import { listPosts } from "@/lib/notion";
import type { Post } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  let posts: Post[] = [];
  let configError: string | null = null;
  try {
    posts = await listPosts();
  } catch (err) {
    configError = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-forest">Posts</h1>
          <p className="text-sm text-muted-foreground">
            All posts across Instagram, LinkedIn, and Twitter — drafts, scheduled, and published.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/posts/new">
            <FilePlus className="h-4 w-4" />
            New post
          </Link>
        </Button>
      </div>

      {configError ? <EmptyConfigCard message={configError} /> : <PostsTable posts={posts} />}
    </div>
  );
}
