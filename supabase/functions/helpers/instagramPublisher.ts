// supabase/functions/helpers/instagramPublisher.ts
//
// PLACEHOLDER — Instagram Graph API publishing.
//
// Real implementation will use the Instagram Graph API two-step flow:
//   1. POST /{ig-user-id}/media        → returns a creation_id (container)
//   2. POST /{ig-user-id}/media_publish → publishes the container
//
// Required env vars:
//   INSTAGRAM_BUSINESS_ACCOUNT_ID
//   INSTAGRAM_ACCESS_TOKEN  (long-lived, refreshed every 60d)
//
// Reference:
//   https://developers.facebook.com/docs/instagram-api/guides/content-publishing

export interface InstagramPostInput {
  caption: string;
  imageUrl: string;
  imageAltText?: string;
}

export interface PublishResult {
  ok: boolean;
  externalId?: string;
  error?: string;
}

export async function publishToInstagram(
  _input: InstagramPostInput,
  _credentials: { businessAccountId: string; accessToken: string },
): Promise<PublishResult> {
  // ---------------------------------------------------------------
  // TODO: replace placeholder with the real two-step flow:
  //
  // const containerRes = await fetch(
  //   `https://graph.facebook.com/v19.0/${credentials.businessAccountId}/media`,
  //   {
  //     method: "POST",
  //     body: new URLSearchParams({
  //       image_url: input.imageUrl,
  //       caption: input.caption,
  //       access_token: credentials.accessToken,
  //     }),
  //   },
  // );
  // const { id: creationId } = await containerRes.json();
  //
  // const publishRes = await fetch(
  //   `https://graph.facebook.com/v19.0/${credentials.businessAccountId}/media_publish`,
  //   {
  //     method: "POST",
  //     body: new URLSearchParams({
  //       creation_id: creationId,
  //       access_token: credentials.accessToken,
  //     }),
  //   },
  // );
  // const { id: mediaId } = await publishRes.json();
  // return { ok: true, externalId: mediaId };
  // ---------------------------------------------------------------
  return {
    ok: false,
    error: "Instagram publishing not yet implemented (placeholder).",
  };
}
