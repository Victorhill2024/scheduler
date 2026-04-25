/**
 * Supabase posts_queue helpers — keep the queue table in sync with Notion.
 *
 * The cron job (supabase/functions/publish-scheduled-posts) reads
 * from this table to decide what to publish, then writes status
 * updates back to both the queue and Notion.
 */

import { serviceClient } from "./supabase";
import type { Platform, PostsQueueItem, QueueStatus } from "./types";

const TABLE = "posts_queue";

export interface UpsertQueueInput {
  notionPageId: string;
  scheduledAt: string;
  platforms: Platform[];
  status?: QueueStatus;
}

export async function upsertQueueItem(input: UpsertQueueInput): Promise<void> {
  const supabase = serviceClient();
  const { error } = await supabase.from(TABLE).upsert(
    {
      notion_page_id: input.notionPageId,
      scheduled_at: input.scheduledAt,
      platforms: input.platforms,
      status: input.status ?? "pending",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "notion_page_id" },
  );
  if (error) throw error;
}

export async function deleteQueueItem(notionPageId: string): Promise<void> {
  const supabase = serviceClient();
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("notion_page_id", notionPageId);
  if (error) throw error;
}

export async function listQueueItems(): Promise<PostsQueueItem[]> {
  const supabase = serviceClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("scheduled_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row): PostsQueueItem => ({
    id: row.id,
    notionPageId: row.notion_page_id,
    status: row.status,
    scheduledAt: row.scheduled_at,
    platforms: row.platforms ?? [],
    errorMessage: row.error_message ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
