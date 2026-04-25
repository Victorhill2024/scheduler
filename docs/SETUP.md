# Local Setup

This guide walks you from a fresh clone to a running dashboard at `http://localhost:3000`.

---

## Prerequisites

| Tool        | Version | Why |
|-------------|---------|-----|
| Node.js     | ≥ 20.x  | Next.js 14 runtime |
| npm         | ≥ 10.x  | Bundled with Node 20 |
| Notion      | Workspace + API access | Source of truth for posts |
| Supabase    | Free tier project | Auth + queue table |

Optional for cron development:

| Tool         | Why |
|--------------|-----|
| Supabase CLI | Run Edge Functions locally |
| Deno         | Runs the Edge Function code |

---

## 1. Clone & install

```bash
git clone https://github.com/victorhill2024/scheduler.git
cd scheduler
npm install
```

---

## 2. Environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the values you have. The dashboard tolerates missing values gracefully — pages will render an "EmptyConfigCard" until credentials arrive.

| Variable                              | Required for      | How to get it |
|----------------------------------------|-------------------|---------------|
| `NOTION_API_KEY`                       | Reading posts     | [notion.so/my-integrations](https://www.notion.so/my-integrations) → "New integration" |
| `NEXT_PUBLIC_NOTION_DATABASE_ID`       | Reading posts     | Open your DB in Notion → URL contains `?v=...` and a 32-char ID |
| `NEXT_PUBLIC_SUPABASE_URL`             | Auth + queue      | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`        | Auth + queue      | Supabase dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY`            | API routes        | Supabase dashboard → Settings → API (**server-only**) |
| `INSTAGRAM_*` / `LINKEDIN_*` / `TWITTER_*` | v2 publishing | Leave blank for v1 |

---

## 3. Create the Notion database

Follow [`NOTION_SCHEMA.md`](NOTION_SCHEMA.md) to create the **Scheduler – Posts** database with the right fields.

After creating it, **share** the database with your Notion integration:

1. Open the database in Notion
2. Click `· · ·` (top-right) → **Connections** → **Add connections**
3. Pick the integration you created in step 2

---

## 4. Create the Supabase project

```bash
# Option A — Supabase Dashboard (easier)
# 1. Create a new project at https://supabase.com/dashboard
# 2. SQL editor → paste supabase/migrations/001_create_posts_queue.sql → run

# Option B — Supabase CLI
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

---

## 5. Run the dashboard

```bash
npm run dev
```

Open http://localhost:3000. You should see the dashboard hero, stats cards, and an empty "Recent activity" state.

Create a test post via **+ New post** to confirm Notion writes are working.

---

## 6. (Optional) Run the Edge Function locally

```bash
supabase functions serve publish-scheduled-posts --env-file .env.local
curl http://localhost:54321/functions/v1/publish-scheduled-posts
```

Expected response:

```json
{ "considered": 0, "published": 0, "failed": 0, "skipped": 0, "details": [] }
```

(Until placeholder publishers are replaced with real API calls, all sends will be marked failed — see [`API_INTEGRATION.md`](API_INTEGRATION.md).)

---

## Useful commands

```bash
npm run dev          # start Next.js dev server
npm run build        # production build
npm run typecheck    # TypeScript only, no emit
npm run lint         # ESLint
npm run format       # Prettier
```
