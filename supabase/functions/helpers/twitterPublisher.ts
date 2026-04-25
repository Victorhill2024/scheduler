// supabase/functions/helpers/twitterPublisher.ts
//
// PLACEHOLDER — Twitter/X API v2 publishing.
//
// Real implementation will POST to /2/tweets. For images, you must
// upload to /1.1/media/upload first (still v1.1 at time of writing)
// then reference media_ids in the v2 tweet body.
//
// Required env vars:
//   TWITTER_BEARER_TOKEN  (OAuth 2.0 with tweet.write + users.read)
//
// Reference:
//   https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets

import type { PublishResult } from "./instagramPublisher.ts";

export interface TwitterPostInput {
  caption: string;
  imageUrl?: string;
}

export async function publishToTwitter(
  _input: TwitterPostInput,
  _credentials: { bearerToken: string },
): Promise<PublishResult> {
  // ---------------------------------------------------------------
  // TODO: real implementation outline (text-only path):
  //
  // const res = await fetch("https://api.twitter.com/2/tweets", {
  //   method: "POST",
  //   headers: {
  //     "Authorization": `Bearer ${credentials.bearerToken}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({ text: input.caption }),
  // });
  //
  // if (!res.ok) return { ok: false, error: await res.text() };
  // const { data } = await res.json();
  // return { ok: true, externalId: data.id };
  //
  // For images, first POST to https://upload.twitter.com/1.1/media/upload.json
  // (multipart form-data) → returns media_id_string → include in v2 body
  // as { media: { media_ids: [media_id_string] } }.
  // ---------------------------------------------------------------
  return {
    ok: false,
    error: "Twitter publishing not yet implemented (placeholder).",
  };
}
