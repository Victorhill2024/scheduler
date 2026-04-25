# Deployment

End-to-end deploy of:

1. The Next.js dashboard → **Vercel**
2. The Postgres queue + auth → **Supabase**
3. The cron worker → **Supabase Edge Functions** (with a schedule trigger)

---

## 1. Vercel (frontend + API routes)

### One-time setup

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) → import the repo.
3. Framework preset: **Next.js** (auto-detected).
4. Set the environment variables in **Project Settings → Environment Variables** (use the same keys as `.env.example`). Mark `SUPABASE_SERVICE_ROLE_KEY`, `NOTION_API_KEY`, and all `*_ACCESS_TOKEN` vars as **Sensitive**.
5. Deploy.

### Branch strategy

- `main` → production deploy
- All other branches → preview deploys (Vercel auto-creates them)
- The `.github/workflows/deploy.yml` workflow runs `lint → typecheck → build` on every PR

### Custom domain

Project Settings → Domains → add e.g. `scheduler.crescere.consulting`. Update `NEXT_PUBLIC_APP_URL` in env vars to match.

---

## 2. Supabase (auth + queue)

### Create the project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Note the project URL + anon key + service role key → paste into Vercel env vars.
3. **SQL editor** → paste [`supabase/migrations/001_create_posts_queue.sql`](../supabase/migrations/001_create_posts_queue.sql) → run.

### Configure auth

- Authentication → Providers → Email (enable email/password)
- Authentication → URL Configuration → Site URL = `https://scheduler.crescere.consulting`
- (Optional) Add Google OAuth for SSO

---

## 3. Edge Function (cron worker)

> The worker is **scaffolded but not yet deployed** in v1. Follow these steps once the publisher placeholders are replaced with real API calls (see [`API_INTEGRATION.md`](API_INTEGRATION.md)).

### Install the Supabase CLI

```bash
brew install supabase/tap/supabase   # or: npm i -g supabase
supabase login
supabase link --project-ref <your-project-ref>
```

### Push secrets

The Edge Function reads from Supabase Secrets, **not** from your local `.env`:

```bash
supabase secrets set \
  NOTION_API_KEY=...\
  NOTION_DATABASE_ID=...\
  INSTAGRAM_BUSINESS_ACCOUNT_ID=...\
  INSTAGRAM_ACCESS_TOKEN=...\
  LINKEDIN_ACCESS_TOKEN=...\
  LINKEDIN_PERSON_ID=...\
  TWITTER_BEARER_TOKEN=...
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are auto-injected by the runtime.

### Deploy + schedule

```bash
supabase functions deploy publish-scheduled-posts
supabase functions schedule create publish-scheduled-posts \
  --cron "* * * * *"          # every minute
```

### Verify

```bash
supabase functions invoke publish-scheduled-posts --no-verify-jwt
```

Expected output:

```json
{ "considered": 0, "published": 0, "failed": 0, "skipped": 0, "details": [] }
```

---

## Post-deploy checklist

- [ ] Vercel build is green
- [ ] Dashboard loads at production URL
- [ ] You can sign in (Supabase auth)
- [ ] Creating a post via the dashboard appears in Notion within 2s
- [ ] Editing a post in the dashboard updates Notion
- [ ] Edge Function returns `200` when invoked manually
- [ ] (Once APIs are wired) A scheduled post in the past gets published on the next cron tick
