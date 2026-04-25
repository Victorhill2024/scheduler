import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PostForm } from "@/components/PostForm";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyConfigCard } from "@/components/EmptyConfigCard";
import { getPost } from "@/lib/notion";
import { formatScheduled, relativeTime } from "@/lib/utils";
import type { Post } from "@/lib/types";

export const dynamic = "force-dynamic";

interface EditPostPageProps {
  params: { id: string };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  let post: Post | null = null;
  let configError: string | null = null;
  try {
    post = await getPost(params.id);
  } catch (err) {
    configError = err instanceof Error ? err.message : "Unknown error";
  }

  if (configError) {
    return <EmptyConfigCard message={configError} />;
  }

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/posts"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-forest"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to posts
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-forest">
              {post.title || "Untitled post"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Scheduled for {formatScheduled(post.scheduledDateTime)} · last edited{" "}
              {relativeTime(post.updatedAt)}
            </p>
          </div>
          <StatusBadge status={post.status} />
        </div>
      </div>
      <PostForm mode="edit" initial={post} />
    </div>
  );
}
