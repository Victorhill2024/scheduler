/**
 * Notion API client + post serialization.
 *
 * Notion is the source of truth for post content. The Supabase
 * `posts_queue` table only mirrors enough state for the cron job
 * to safely publish without race conditions.
 */

import { Client, isFullPage } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

import { NOTION_PROPS } from "./constants";
import type {
  CreatePostInput,
  Platform,
  PlatformCaption,
  Post,
  PostStatus,
  UpdatePostInput,
} from "./types";

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID =
  process.env.NEXT_PUBLIC_NOTION_DATABASE_ID ?? process.env.NOTION_DATABASE_ID;

let _client: Client | null = null;

export function getNotionClient(): Client {
  if (!NOTION_API_KEY) {
    throw new Error(
      "NOTION_API_KEY is not set. Add it to your .env.local — see .env.example.",
    );
  }
  if (!_client) {
    _client = new Client({ auth: NOTION_API_KEY });
  }
  return _client;
}

export function getDatabaseId(): string {
  if (!NOTION_DATABASE_ID) {
    throw new Error(
      "NEXT_PUBLIC_NOTION_DATABASE_ID is not set. See .env.example for setup.",
    );
  }
  return NOTION_DATABASE_ID;
}

// -------------------------------------------------------------------
// Property helpers — cope with Notion's verbose property shapes
// -------------------------------------------------------------------

function getRichText(page: PageObjectResponse, key: string): string {
  const prop = page.properties[key];
  if (!prop) return "";
  if (prop.type === "rich_text") {
    return prop.rich_text.map((r) => r.plain_text).join("");
  }
  if (prop.type === "title") {
    return prop.title.map((r) => r.plain_text).join("");
  }
  return "";
}

function getUrl(page: PageObjectResponse, key: string): string {
  const prop = page.properties[key];
  if (prop?.type === "url") return prop.url ?? "";
  return "";
}

function getDate(page: PageObjectResponse, key: string): string | undefined {
  const prop = page.properties[key];
  if (prop?.type === "date") return prop.date?.start ?? undefined;
  return undefined;
}

function getSelect(page: PageObjectResponse, key: string): string | undefined {
  const prop = page.properties[key];
  if (prop?.type === "select") return prop.select?.name;
  return undefined;
}

function getMultiSelect(
  page: PageObjectResponse,
  key: string,
): string[] {
  const prop = page.properties[key];
  if (prop?.type === "multi_select") return prop.multi_select.map((s) => s.name);
  return [];
}

function getCreatedBy(page: PageObjectResponse, key: string): string {
  const prop = page.properties[key];
  if (prop?.type === "people" && prop.people[0]) {
    const first = prop.people[0];
    // Person object may not always include name (e.g. service users)
    return "name" in first && typeof first.name === "string" ? first.name : "";
  }
  return "";
}

// -------------------------------------------------------------------
// Page → Post mapping
// -------------------------------------------------------------------

const PLATFORM_FROM_NOTION: Record<string, Platform> = {
  Instagram: "instagram",
  LinkedIn: "linkedin",
  Twitter: "twitter",
};

const PLATFORM_TO_NOTION: Record<Platform, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  twitter: "Twitter",
};

const STATUS_FROM_NOTION: Record<string, PostStatus> = {
  Draft: "draft",
  Scheduled: "scheduled",
  Publishing: "publishing",
  Published: "published",
  Failed: "failed",
};

const STATUS_TO_NOTION: Record<PostStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  publishing: "Publishing",
  published: "Published",
  failed: "Failed",
};

export function pageToPost(page: PageObjectResponse): Post {
  const platforms = getMultiSelect(page, NOTION_PROPS.platforms)
    .map((name) => PLATFORM_FROM_NOTION[name])
    .filter((p): p is Platform => Boolean(p));

  const platformCaptions: PlatformCaption[] = [];
  const ig = getRichText(page, NOTION_PROPS.instagramCaption);
  const li = getRichText(page, NOTION_PROPS.linkedinSummary);
  const tw = getRichText(page, NOTION_PROPS.twitterText);
  if (ig) platformCaptions.push({ platform: "instagram", caption: ig });
  if (li) platformCaptions.push({ platform: "linkedin", caption: li });
  if (tw) platformCaptions.push({ platform: "twitter", caption: tw });

  const statusName = getSelect(page, NOTION_PROPS.status);
  const status: PostStatus = statusName
    ? (STATUS_FROM_NOTION[statusName] ?? "draft")
    : "draft";

  return {
    id: page.id,
    notionPageId: page.id,
    title: getRichText(page, NOTION_PROPS.title),
    caption: getRichText(page, NOTION_PROPS.caption),
    imageUrl: getUrl(page, NOTION_PROPS.imageUrl),
    imageAltText: getRichText(page, NOTION_PROPS.imageAltText),
    scheduledDateTime: getDate(page, NOTION_PROPS.scheduledDateTime) ?? "",
    status,
    platforms,
    platformCaptions: platformCaptions.length ? platformCaptions : undefined,
    errorLog: getRichText(page, NOTION_PROPS.errorLog) || undefined,
    postedAt: getDate(page, NOTION_PROPS.postedAt),
    createdBy: getCreatedBy(page, NOTION_PROPS.createdBy),
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
  };
}

// -------------------------------------------------------------------
// Property serialization (Post → Notion)
// -------------------------------------------------------------------

type NotionProperties = Record<string, unknown>;

function buildProperties(input: UpdatePostInput): NotionProperties {
  const props: NotionProperties = {};

  if (input.title !== undefined) {
    props[NOTION_PROPS.title] = {
      title: [{ type: "text", text: { content: input.title } }],
    };
  }
  if (input.caption !== undefined) {
    props[NOTION_PROPS.caption] = {
      rich_text: [{ type: "text", text: { content: input.caption } }],
    };
  }
  if (input.imageUrl !== undefined) {
    props[NOTION_PROPS.imageUrl] = { url: input.imageUrl || null };
  }
  if (input.imageAltText !== undefined) {
    props[NOTION_PROPS.imageAltText] = {
      rich_text: [{ type: "text", text: { content: input.imageAltText } }],
    };
  }
  if (input.scheduledDateTime !== undefined) {
    props[NOTION_PROPS.scheduledDateTime] = {
      date: { start: input.scheduledDateTime },
    };
  }
  if (input.status !== undefined) {
    props[NOTION_PROPS.status] = {
      select: { name: STATUS_TO_NOTION[input.status] },
    };
  }
  if (input.platforms !== undefined) {
    props[NOTION_PROPS.platforms] = {
      multi_select: input.platforms.map((p) => ({ name: PLATFORM_TO_NOTION[p] })),
    };
  }
  if (input.platformCaptions !== undefined) {
    const find = (p: Platform) =>
      input.platformCaptions?.find((c) => c.platform === p)?.caption ?? "";
    props[NOTION_PROPS.instagramCaption] = {
      rich_text: [{ type: "text", text: { content: find("instagram") } }],
    };
    props[NOTION_PROPS.linkedinSummary] = {
      rich_text: [{ type: "text", text: { content: find("linkedin") } }],
    };
    props[NOTION_PROPS.twitterText] = {
      rich_text: [{ type: "text", text: { content: find("twitter") } }],
    };
  }
  if (input.errorLog !== undefined) {
    props[NOTION_PROPS.errorLog] = {
      rich_text: [{ type: "text", text: { content: input.errorLog } }],
    };
  }
  if (input.postedAt !== undefined) {
    props[NOTION_PROPS.postedAt] = { date: { start: input.postedAt } };
  }

  return props;
}

// -------------------------------------------------------------------
// CRUD
// -------------------------------------------------------------------

export interface ListPostsFilter {
  status?: PostStatus;
  platform?: Platform;
  dateFrom?: string;
  dateTo?: string;
}

export async function listPosts(filter: ListPostsFilter = {}): Promise<Post[]> {
  const notion = getNotionClient();
  const filters: Record<string, unknown>[] = [];

  if (filter.status) {
    filters.push({
      property: NOTION_PROPS.status,
      select: { equals: STATUS_TO_NOTION[filter.status] },
    });
  }
  if (filter.platform) {
    filters.push({
      property: NOTION_PROPS.platforms,
      multi_select: { contains: PLATFORM_TO_NOTION[filter.platform] },
    });
  }
  if (filter.dateFrom) {
    filters.push({
      property: NOTION_PROPS.scheduledDateTime,
      date: { on_or_after: filter.dateFrom },
    });
  }
  if (filter.dateTo) {
    filters.push({
      property: NOTION_PROPS.scheduledDateTime,
      date: { on_or_before: filter.dateTo },
    });
  }

  const response = await notion.databases.query({
    database_id: getDatabaseId(),
    sorts: [{ property: NOTION_PROPS.scheduledDateTime, direction: "ascending" }],
    filter: filters.length ? ({ and: filters } as never) : undefined,
  });

  return response.results.filter(isFullPage).map(pageToPost);
}

export async function getPost(notionPageId: string): Promise<Post | null> {
  const notion = getNotionClient();
  const page = await notion.pages.retrieve({ page_id: notionPageId });
  if (!isFullPage(page)) return null;
  return pageToPost(page);
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const notion = getNotionClient();
  const page = await notion.pages.create({
    parent: { database_id: getDatabaseId() },
    properties: buildProperties({ status: "draft", ...input }) as never,
  });
  if (!isFullPage(page)) {
    throw new Error("Notion returned a partial page response.");
  }
  return pageToPost(page);
}

export async function updatePost(
  notionPageId: string,
  input: UpdatePostInput,
): Promise<Post> {
  const notion = getNotionClient();
  const page = await notion.pages.update({
    page_id: notionPageId,
    properties: buildProperties(input) as never,
  });
  if (!isFullPage(page)) {
    throw new Error("Notion returned a partial page response.");
  }
  return pageToPost(page);
}

export async function archivePost(notionPageId: string): Promise<void> {
  const notion = getNotionClient();
  await notion.pages.update({ page_id: notionPageId, archived: true });
}

export async function duplicatePost(
  notionPageId: string,
  overrides: Partial<CreatePostInput> = {},
): Promise<Post> {
  const original = await getPost(notionPageId);
  if (!original) throw new Error(`Post ${notionPageId} not found.`);
  return createPost({
    title: `${original.title} (copy)`,
    caption: original.caption,
    imageUrl: original.imageUrl,
    imageAltText: original.imageAltText,
    scheduledDateTime: original.scheduledDateTime,
    platforms: original.platforms,
    platformCaptions: original.platformCaptions,
    status: "draft",
    ...overrides,
  });
}
