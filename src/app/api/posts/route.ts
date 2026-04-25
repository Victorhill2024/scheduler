import { NextRequest, NextResponse } from "next/server";

import { createPost, listPosts, type ListPostsFilter } from "@/lib/notion";
import { upsertQueueItem } from "@/lib/queue";
import { createPostSchema } from "@/lib/validation";
import type { Platform, PostStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filter: ListPostsFilter = {
    status: (searchParams.get("status") as PostStatus | null) ?? undefined,
    platform: (searchParams.get("platform") as Platform | null) ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
  };
  try {
    const posts = await listPosts(filter);
    return NextResponse.json({ posts });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const post = await createPost(parsed.data);

    // Mirror to Supabase queue if scheduled. Failure here shouldn't break the
    // create flow — Notion is the source of truth and the cron job re-syncs.
    if (post.status === "scheduled") {
      try {
        await upsertQueueItem({
          notionPageId: post.notionPageId,
          scheduledAt: post.scheduledDateTime,
          platforms: post.platforms,
          status: "pending",
        });
      } catch (queueErr) {
        console.warn("[posts] queue upsert failed:", queueErr);
      }
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}

function errorResponse(err: unknown) {
  const message = err instanceof Error ? err.message : "Internal error";
  console.error("[api/posts]", err);
  return NextResponse.json({ error: message }, { status: 500 });
}
