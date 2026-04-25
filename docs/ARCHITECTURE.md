# Architecture

## System diagram

```
              ┌────────────────┐
              │   Operator     │  (Crescere team in browser)
              └───────┬────────┘
                      │ HTTPS
                      ▼
              ┌────────────────┐
              │  Vercel        │
              │  Next.js 14    │
              │  ┌──────────┐  │
              │  │ Pages    │  │  Server components hit Notion directly
              │  ├──────────┤  │
              │  │ /api/*   │  │  Route handlers — auth-gated CRUD
              │  └────┬─────┘  │
              └───────┼────────┘
            Notion SDK│         Supabase JS
                      ▼                ▼
        ┌─────────────────┐    ┌──────────────────┐
        │  Notion          │    │  Supabase         │
        │  Posts database  │    │  ┌────────────┐   │
        │  (source of      │    │  │  posts_    │   │
        │   truth)         │    │  │  queue     │◄──┼── Cron worker
        └──────────────────┘    │  ├────────────┤   │
                ▲               │  │  audit_log │   │
                │               │  ├────────────┤   │
                │               │  │  auth.users│   │
                │               │  └────────────┘   │
                │               └──────────────────┘
                │                        │
                │                        ▼
                │              ┌────────────────────┐
                │              │ Edge Function      │
                │              │ publish-scheduled- │
                │              │ posts              │
                └──────────────┤ (cron: * * * * *)  │
                  Notion update│                    │
                  on success/  │ ┌────────────────┐ │
                  failure      │ │ Instagram API  │ │
                               │ ├────────────────┤ │
                               │ │ LinkedIn API   │ │
                               │ ├────────────────┤ │
                               │ │ Twitter API    │ │
                               │ └────────────────┘ │
                               └────────────────────┘
```

---

## Why Notion as the source of truth?

- The team **already lives in Notion**. Letting them edit posts in either Notion or the dashboard removes friction.
- Notion gives us free **comments, history, mentions, and approvals**.
- The dashboard becomes a **lightweight controller**, not a data lake — easier to white-label.

## Why Supabase if Notion holds the data?

- **Notion isn't a queue.** Querying it from a cron loop every minute is slow and rate-limited.
- We mirror just **`(notion_page_id, status, scheduled_at, platforms, error_message)`** into Postgres so the cron can use indexed `WHERE status = 'pending' AND scheduled_at <= now()` reads.
- Supabase also ships Auth + Edge Functions in one project, which keeps the surface area small.

---

## Data flow: creating a post

```
User clicks "Schedule post"
        │
        ▼
POST /api/posts                         ← Next.js route handler
        │
        │ 1. Validate with Zod
        │ 2. createPost() → Notion API
        │ 3. upsertQueueItem() → Supabase (best-effort, non-blocking)
        ▼
201 Created  { post: {...} }
        │
        ▼
router.refresh()                        ← Server components re-render with fresh data
```

## Data flow: publishing

```
Every minute, cron triggers Edge Function
        │
        ▼
queryDatabase(Notion)                   ← filter Status=Scheduled AND date <= now
        │
        ▼
For each due post:
    UPDATE posts_queue SET status='publishing'
    UPDATE Notion       SET Status='Publishing'
        │
        ├── publishToInstagram()  ──┐
        ├── publishToLinkedIn()   ──┤  (concurrent in v2)
        └── publishToTwitter()    ──┤
                                    ▼
                            All ok? ──► UPDATE Notion SET Status='Published', Posted At=now
                                        UPDATE posts_queue SET status='published'
                            Any fail? ─► UPDATE Notion SET Status='Failed', Error Log=...
                                        UPDATE posts_queue SET status='failed', error_message=...
```

---

## Failure modes & recovery

| Failure                                  | Behaviour |
|-------------------------------------------|-----------|
| Notion API 429 / 5xx during cron read     | Function returns `500`. Next cron tick retries. |
| Notion update succeeds but queue write fails | Cron resyncs from Notion next tick. Notion is canonical. |
| One platform succeeds, another fails      | Whole post is marked `Failed`. Operator sees Error Log. v2: per-platform retry + idempotency keys. |
| Edge Function timeout (30s default)       | Function exits; remaining due posts are picked up next tick. |
| Service role key leaked                   | Rotate in Supabase → update Vercel env var → redeploy. |

---

## Security boundary

- **Browser code** never sees `SUPABASE_SERVICE_ROLE_KEY` or `NOTION_API_KEY`. Both are read inside server components / route handlers / the Edge Function only.
- The Notion integration is **scoped to one database**, so an exposed token has limited blast radius.
- All API routes will require an authenticated Supabase session in v2 (`getCurrentUser()` from [`src/lib/auth.ts`](../src/lib/auth.ts)).

---

## Why this is a template for SaaS clients

- Brand tokens are isolated in `tailwind.config.ts` + `src/lib/constants.ts`. Swap `forest`/`gold`/`cream` and `BRAND.name` to re-skin.
- Notion as a back-office gives clients a "data store they already understand" — easy demo, easy migration.
- The cron + queue pattern generalises to any "scheduled outbound message" use case: email, SMS, podcast distribution.
