import { NextRequest, NextResponse } from "next/server";

import { archivePost, getPost, updatePost } from "@/lib/notion";
import { deleteQueueItem, upsertQueueItem } from "@/lib/queue";
import { updatePostSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const post = await getPost(params.id);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ post });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updatePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const post = await updatePost(params.id, parsed.data);

    try {
      if (post.status === "scheduled") {
        await upsertQueueItem({
          notionPageId: post.notionPageId,
          scheduledAt: post.scheduledDateTime,
          platforms: post.platforms,
          status: "pending",
        });
      } else if (post.status === "draft") {
        await deleteQueueItem(post.notionPageId);
      }
    } catch (queueErr) {
      console.warn("[posts/:id] queue sync failed:", queueErr);
    }

    return NextResponse.json({ post });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    await archivePost(params.id);
    try {
      await deleteQueueItem(params.id);
    } catch (queueErr) {
      console.warn("[posts/:id] queue delete failed:", queueErr);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}

function errorResponse(err: unknown) {
  const message = err instanceof Error ? err.message : "Internal error";
  console.error("[api/posts/:id]", err);
  return NextResponse.json({ error: message }, { status: 500 });
}
