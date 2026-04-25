// supabase/functions/publish-scheduled-posts/index.ts
//
// Cron entry point — runs on a schedule (e.g. every minute) and
// fans posts out to Instagram, LinkedIn, and Twitter.
//
// Status flow:
//   Notion(Status=Scheduled) + scheduledTime <= now
//     → mark queue row "publishing"
//     → publish to each platform
//     → mark Notion + queue "Published" or "Failed"
//
// Deploy:
//   supabase functions deploy publish-scheduled-posts
//   supabase functions schedule create publish-scheduled-posts \
//     --cron "* * * * *"

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { queryDatabase, statusUpdate, updatePage } from "../helpers/notionClient.ts";
import {
  publishToInstagram,
  type PublishResult,
} from "../helpers/instagramPublisher.ts";
import { publishToLinkedIn } from "../helpers/linkedinPublisher.ts";
import { publishToTwitter } from "../helpers/twitterPublisher.ts";

interface PublishSummary {
  considered: number;
  published: number;
  failed: number;
  skipped: number;
  details: Array<{ pageId: string; status: "published" | "failed" | "skipped"; error?: string }>;
}

Deno.serve(async (_req) => {
  const summary: PublishSummary = {
    considered: 0,
    published: 0,
    failed: 0,
    skipped: 0,
    details: [],
  };

  const NOTION_API_KEY = Deno.env.get("NOTION_API_KEY") ?? "";
  const NOTION_DATABASE_ID =
    Deno.env.get("NOTION_DATABASE_ID") ?? Deno.env.get("NEXT_PUBLIC_NOTION_DATABASE_ID") ?? "";
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!NOTION_API_KEY || !NOTION_DATABASE_ID || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing required env vars" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const nowIso = new Date().toISOString();

  // 1. Find scheduled posts ready to publish
  const dueRows = await queryDatabase(NOTION_API_KEY, NOTION_DATABASE_ID, {
    filter: {
      and: [
        { property: "Status", select: { equals: "Scheduled" } },
        { property: "Scheduled DateTime", date: { on_or_before: nowIso } },
      ],
    },
  });

  summary.considered = dueRows.length;

  for (const page of dueRows) {
    const pageId = page.id;
    const props = page.properties as Record<string, any>;

    const caption =
      props["Caption"]?.rich_text?.map((r: any) => r.plain_text).join("") ?? "";
    const imageUrl = props["Image URL"]?.url ?? "";
    const imageAltText =
      props["Image Alt Text"]?.rich_text?.map((r: any) => r.plain_text).join("") ?? "";
    const platforms: string[] = (props["Platforms"]?.multi_select ?? []).map(
      (s: any) => s.name,
    );

    // 2. Mark as publishing in queue + Notion
    await supabase
      .from("posts_queue")
      .update({ status: "publishing" })
      .eq("notion_page_id", pageId);
    await updatePage(NOTION_API_KEY, pageId, statusUpdate("Publishing"));

    const results: PublishResult[] = [];

    if (platforms.includes("Instagram")) {
      const igCaption =
        props["Instagram Caption"]?.rich_text?.map((r: any) => r.plain_text).join("") ||
        caption;
      results.push(
        await publishToInstagram(
          { caption: igCaption, imageUrl, imageAltText },
          {
            businessAccountId: Deno.env.get("INSTAGRAM_BUSINESS_ACCOUNT_ID") ?? "",
            accessToken: Deno.env.get("INSTAGRAM_ACCESS_TOKEN") ?? "",
          },
        ),
      );
    }

    if (platforms.includes("LinkedIn")) {
      const liCaption =
        props["LinkedIn Summary"]?.rich_text?.map((r: any) => r.plain_text).join("") ||
        caption;
      results.push(
        await publishToLinkedIn(
          { caption: liCaption, imageUrl },
          {
            accessToken: Deno.env.get("LINKEDIN_ACCESS_TOKEN") ?? "",
            personId: Deno.env.get("LINKEDIN_PERSON_ID") ?? "",
          },
        ),
      );
    }

    if (platforms.includes("Twitter")) {
      const twCaption =
        props["Twitter Text"]?.rich_text?.map((r: any) => r.plain_text).join("") || caption;
      results.push(
        await publishToTwitter(
          { caption: twCaption, imageUrl },
          { bearerToken: Deno.env.get("TWITTER_BEARER_TOKEN") ?? "" },
        ),
      );
    }

    const allOk = results.length > 0 && results.every((r) => r.ok);
    if (allOk) {
      await updatePage(
        NOTION_API_KEY,
        pageId,
        statusUpdate("Published", { postedAt: new Date().toISOString() }),
      );
      await supabase
        .from("posts_queue")
        .update({ status: "published", error_message: null })
        .eq("notion_page_id", pageId);
      summary.published++;
      summary.details.push({ pageId, status: "published" });
    } else {
      const errorLog = results
        .filter((r) => !r.ok)
        .map((r) => r.error ?? "unknown error")
        .join(" | ");
      await updatePage(NOTION_API_KEY, pageId, statusUpdate("Failed", { errorLog }));
      await supabase
        .from("posts_queue")
        .update({ status: "failed", error_message: errorLog })
        .eq("notion_page_id", pageId);
      summary.failed++;
      summary.details.push({ pageId, status: "failed", error: errorLog });
    }
  }

  return new Response(JSON.stringify(summary), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
