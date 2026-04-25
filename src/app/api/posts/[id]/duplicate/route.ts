import { NextRequest, NextResponse } from "next/server";

import { duplicatePost } from "@/lib/notion";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

export async function POST(_req: NextRequest, { params }: RouteContext) {
  try {
    const clone = await duplicatePost(params.id);
    return NextResponse.json({ post: clone }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[api/posts/:id/duplicate]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
