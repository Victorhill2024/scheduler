# API Integration Guide

Where to plug in real Instagram, LinkedIn, and Twitter publishing.

The cron worker ([`supabase/functions/publish-scheduled-posts/index.ts`](../supabase/functions/publish-scheduled-posts/index.ts)) calls three helpers:

- [`helpers/instagramPublisher.ts`](../supabase/functions/helpers/instagramPublisher.ts)
- [`helpers/linkedinPublisher.ts`](../supabase/functions/helpers/linkedinPublisher.ts)
- [`helpers/twitterPublisher.ts`](../supabase/functions/helpers/twitterPublisher.ts)

Each helper returns a `PublishResult` of shape `{ ok: boolean, externalId?: string, error?: string }`. The worker doesn't care what's inside — it just rolls up the results.

> **Don't change the function signatures.** Keep the contract; replace the body.

---

## Instagram (Graph API)

**Auth:** Long-lived Page access token from a Facebook Business account that owns an Instagram Business / Creator account.

**Two-step publish flow:**

```ts
// 1. Create a media container
const containerRes = await fetch(
  `https://graph.facebook.com/v19.0/${businessAccountId}/media`,
  {
    method: "POST",
    body: new URLSearchParams({
      image_url: input.imageUrl,
      caption: input.caption,
      access_token: accessToken,
    }),
  },
);
const { id: creationId } = await containerRes.json();

// 2. Publish the container
const publishRes = await fetch(
  `https://graph.facebook.com/v19.0/${businessAccountId}/media_publish`,
  {
    method: "POST",
    body: new URLSearchParams({
      creation_id: creationId,
      access_token: accessToken,
    }),
  },
);
const { id: mediaId } = await publishRes.json();
return { ok: true, externalId: mediaId };
```

**Gotchas:**

- Image URL must be **publicly accessible HTTPS** (not signed S3).
- For carousels, container `media_type=CAROUSEL` plus an array of child container IDs.
- Long-lived tokens expire every **60 days** — set up a refresh job or use a Page-level token.

📖 [Official docs](https://developers.facebook.com/docs/instagram-api/guides/content-publishing)

---

## LinkedIn (Posts API)

**Auth:** 3-legged OAuth → bearer token. Scopes: `w_member_social` (personal) or `w_organization_social` (company page).

```ts
const res = await fetch("https://api.linkedin.com/rest/posts", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "LinkedIn-Version": "202404",
    "X-Restli-Protocol-Version": "2.0.0",
  },
  body: JSON.stringify({
    author: personId,                          // "urn:li:person:..." or "urn:li:organization:..."
    commentary: input.caption,
    visibility: "PUBLIC",
    distribution: { feedDistribution: "MAIN_FEED" },
    lifecycleState: "PUBLISHED",
  }),
});
if (!res.ok) return { ok: false, error: await res.text() };
return { ok: true, externalId: res.headers.get("x-restli-id") ?? undefined };
```

**Gotchas:**

- For images, you must **register an upload** (`POST /rest/images?action=initializeUpload`) → PUT the binary → reference the asset URN in the post body.
- Tokens expire after **60 days**; capture the refresh token at OAuth time and use it.
- Versioned API headers (`LinkedIn-Version`) must match the docs you're following.

📖 [Posts API reference](https://learn.microsoft.com/linkedin/marketing/integrations/community-management/shares/posts-api)

---

## Twitter / X (API v2)

**Auth:** OAuth 2.0 user context bearer token with scopes `tweet.write users.read offline.access`.

```ts
// Text-only tweet
const res = await fetch("https://api.twitter.com/2/tweets", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${bearerToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ text: input.caption }),
});
if (!res.ok) return { ok: false, error: await res.text() };
const { data } = await res.json();
return { ok: true, externalId: data.id };
```

**With an image (still v1.1 upload):**

```ts
// 1. Upload to v1.1
const formData = new FormData();
formData.append("media", await (await fetch(input.imageUrl)).blob());
const upload = await fetch("https://upload.twitter.com/1.1/media/upload.json", {
  method: "POST",
  headers: { Authorization: `Bearer ${bearerToken}` },
  body: formData,
});
const { media_id_string } = await upload.json();

// 2. Reference in v2 tweet
const tweet = await fetch("https://api.twitter.com/2/tweets", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${bearerToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    text: input.caption,
    media: { media_ids: [media_id_string] },
  }),
});
```

**Gotchas:**

- 280-char hard limit (already enforced in the dashboard preview).
- Free tier rate limits are aggressive — back off on `429`.
- Threads = sequential `POST /2/tweets` calls with `reply.in_reply_to_tweet_id`.

📖 [POST /2/tweets reference](https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets)

---

## After wiring real APIs

1. Re-run the smoke tests:

   ```bash
   deno test --allow-net --allow-env supabase/functions/publish-scheduled-posts/tests.ts
   ```

2. Push secrets to Supabase:

   ```bash
   supabase secrets set INSTAGRAM_ACCESS_TOKEN=...  # etc.
   ```

3. Deploy:

   ```bash
   supabase functions deploy publish-scheduled-posts
   ```

4. Manually publish a test post: set its **Status** to `Scheduled` in Notion with a `Scheduled DateTime` 1 minute in the past, then invoke the function.

5. Monitor:

   ```bash
   supabase functions logs publish-scheduled-posts --tail
   ```
