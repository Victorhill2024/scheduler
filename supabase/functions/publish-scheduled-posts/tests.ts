// supabase/functions/publish-scheduled-posts/tests.ts
//
// Smoke tests for the cron function. Run with:
//   deno test --allow-net --allow-env supabase/functions/publish-scheduled-posts/tests.ts
//
// These don't hit live APIs — they validate the helper contracts.

import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

import { publishToInstagram } from "../helpers/instagramPublisher.ts";
import { publishToLinkedIn } from "../helpers/linkedinPublisher.ts";
import { publishToTwitter } from "../helpers/twitterPublisher.ts";
import { statusUpdate } from "../helpers/notionClient.ts";

Deno.test("instagram placeholder returns ok=false", async () => {
  const res = await publishToInstagram(
    { caption: "test", imageUrl: "https://example.com/x.jpg" },
    { businessAccountId: "x", accessToken: "y" },
  );
  assertEquals(res.ok, false);
  assert(res.error?.includes("placeholder"));
});

Deno.test("linkedin placeholder returns ok=false", async () => {
  const res = await publishToLinkedIn(
    { caption: "test" },
    { accessToken: "x", personId: "urn:li:person:x" },
  );
  assertEquals(res.ok, false);
  assert(res.error?.includes("placeholder"));
});

Deno.test("twitter placeholder returns ok=false", async () => {
  const res = await publishToTwitter({ caption: "test" }, { bearerToken: "x" });
  assertEquals(res.ok, false);
  assert(res.error?.includes("placeholder"));
});

Deno.test("statusUpdate builds valid Notion payload", () => {
  const update = statusUpdate("Published", { postedAt: "2026-05-15T09:00:00Z" });
  assert("Status" in update);
  assert("Posted At" in update);
});
