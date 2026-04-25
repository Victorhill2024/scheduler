import Link from "next/link";
import { ImageOff } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { PlatformIconList } from "@/components/PlatformIcon";
import { StatusBadge } from "@/components/StatusBadge";
import type { Post } from "@/lib/types";
import { formatScheduled, truncate } from "@/lib/utils";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/posts/${post.notionPageId}`}
            className="font-semibold leading-snug text-forest hover:underline"
          >
            {post.title || "Untitled post"}
          </Link>
          <StatusBadge status={post.status} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 pb-3">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.imageAltText ?? ""}
            className="aspect-video w-full rounded-md object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-md bg-cream-200 text-muted-foreground">
            <ImageOff className="h-6 w-6" aria-hidden />
          </div>
        )}
        <p className="text-sm text-foreground/80">{truncate(post.caption, 140)}</p>
      </CardContent>
      <CardFooter className="justify-between gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
        <PlatformIconList platforms={post.platforms} />
        <span>{formatScheduled(post.scheduledDateTime)}</span>
      </CardFooter>
    </Card>
  );
}
