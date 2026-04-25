// supabase/functions/helpers/notionClient.ts
//
// Thin Notion API wrapper for use inside Supabase Edge Functions
// (Deno runtime). Uses fetch directly — the @notionhq/client npm
// package is heavy; Edge Functions favour small bundles.

const NOTION_VERSION = "2022-06-28";

export interface NotionPage {
  id: string;
  properties: Record<string, unknown>;
}

function authHeaders(apiKey: string): Headers {
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${apiKey}`);
  headers.set("Notion-Version", NOTION_VERSION);
  headers.set("Content-Type", "application/json");
  return headers;
}

export async function queryDatabase(
  apiKey: string,
  databaseId: string,
  body: Record<string, unknown> = {},
): Promise<NotionPage[]> {
  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: authHeaders(apiKey),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Notion query failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { results: NotionPage[] };
  return json.results;
}

export async function updatePage(
  apiKey: string,
  pageId: string,
  properties: Record<string, unknown>,
): Promise<NotionPage> {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "PATCH",
    headers: authHeaders(apiKey),
    body: JSON.stringify({ properties }),
  });
  if (!res.ok) {
    throw new Error(`Notion update failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as NotionPage;
}

/** Convenience: writes the standard "Status" select + optional Posted At / Error Log. */
export function statusUpdate(
  status: "Scheduled" | "Publishing" | "Published" | "Failed",
  opts: { postedAt?: string; errorLog?: string } = {},
): Record<string, unknown> {
  const props: Record<string, unknown> = {
    Status: { select: { name: status } },
  };
  if (opts.postedAt) {
    props["Posted At"] = { date: { start: opts.postedAt } };
  }
  if (opts.errorLog) {
    props["Error Log"] = {
      rich_text: [{ type: "text", text: { content: opts.errorLog.slice(0, 1900) } }],
    };
  }
  return props;
}
