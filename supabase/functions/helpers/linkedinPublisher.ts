// supabase/functions/helpers/linkedinPublisher.ts
//
// PLACEHOLDER — LinkedIn Share API publishing.
//
// Real implementation will POST to /v2/ugcPosts (or /rest/posts on the
// newer Versioned API). For images, you must register an upload first
// and stream the binary, then reference it in the post body.
//
// Required env vars:
//   LINKEDIN_ACCESS_TOKEN  (3-legged OAuth, refreshed periodically)
//   LINKEDIN_PERSON_ID     (urn:li:person:XXXX or urn:li:organization:XXXX)
//
// Reference:
//   https://learn.microsoft.com/linkedin/marketing/integrations/community-management/shares/posts-api

import type { PublishResult } from "./instagramPublisher.ts";

export interface LinkedInPostInput {
  caption: string;
  imageUrl?: string;
}

export async function publishToLinkedIn(
  _input: LinkedInPostInput,
  _credentials: { accessToken: string; personId: string },
): Promise<PublishResult> {
  // ---------------------------------------------------------------
  // TODO: real implementation outline:
  //
  // const body = {
  //   author: credentials.personId,                  // "urn:li:person:..."
  //   commentary: input.caption,
  //   visibility: "PUBLIC",
  //   distribution: { feedDistribution: "MAIN_FEED" },
  //   lifecycleState: "PUBLISHED",
  // };
  //
  // const res = await fetch("https://api.linkedin.com/rest/posts", {
  //   method: "POST",
  //   headers: {
  //     "Authorization": `Bearer ${credentials.accessToken}`,
  //     "Content-Type": "application/json",
  //     "LinkedIn-Version": "202404",
  //     "X-Restli-Protocol-Version": "2.0.0",
  //   },
  //   body: JSON.stringify(body),
  // });
  //
  // if (!res.ok) return { ok: false, error: await res.text() };
  // const externalId = res.headers.get("x-restli-id") ?? undefined;
  // return { ok: true, externalId };
  // ---------------------------------------------------------------
  return {
    ok: false,
    error: "LinkedIn publishing not yet implemented (placeholder).",
  };
}
