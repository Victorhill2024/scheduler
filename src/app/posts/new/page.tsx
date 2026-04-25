import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PostForm } from "@/components/PostForm";

export const dynamic = "force-dynamic";

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/posts"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-forest"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to posts
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-forest">New post</h1>
        <p className="text-sm text-muted-foreground">
          Compose once. Tailor per-platform if you need to. Schedule and ship.
        </p>
      </div>
      <PostForm mode="create" />
    </div>
  );
}
