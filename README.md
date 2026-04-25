# Scheduler

> Social media content automation for **[Crescere Consulting](https://crescere.consulting)** — plan, schedule, and ship posts across Instagram, LinkedIn, and Twitter from a single Notion source of truth.

This repo contains the **v1 admin dashboard** plus the **backend scaffolding** for the eventual cron-driven publishing pipeline. APIs are stubbed with clearly marked placeholders so you can drop in credentials and ship in hours, not weeks.

---

## What's inside

| Layer        | Tech                                            | Status |
|--------------|--------------------------------------------------|--------|
| Frontend     | Next.js 14 (App Router) · TypeScript · Tailwind · shadcn/ui | ✅ v1 |
| Source of truth | Notion (Posts database)                         | ✅ wired |
| Auth + queue | Supabase (Postgres + Auth)                       | ✅ scaffolded |
| Cron worker  | Supabase Edge Function (Deno runtime)            | 🟡 scaffolded, not deployed |
| Publishers   | Instagram Graph · LinkedIn Marketing · Twitter v2 | 🟡 placeholder helpers |

---

## Quick start

```bash
git clone https://github.com/victorhill2024/scheduler.git
cd scheduler
npm install
cp .env.example .env.local
# fill in NOTION_API_KEY, NEXT_PUBLIC_NOTION_DATABASE_ID,
# NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Then open http://localhost:3000.

> No credentials? The dashboard renders friendly empty states so you can see the UI immediately. Connect Notion + Supabase whenever you're ready.

---

## Documentation

| Doc                                         | What it covers                                  |
|---------------------------------------------|-------------------------------------------------|
| [`docs/SETUP.md`](docs/SETUP.md)            | Local dev: prerequisites, env vars, first run   |
| [`docs/NOTION_SCHEMA.md`](docs/NOTION_SCHEMA.md) | Exact Notion database fields + sample data      |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)  | Vercel + Supabase deploy, Edge Function rollout |
| [`docs/API_INTEGRATION.md`](docs/API_INTEGRATION.md) | Where to add Instagram / LinkedIn / Twitter calls |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System diagram + data flow                       |

---

## Project structure

```
scheduler/
├── src/
│   ├── app/                 # Next.js App Router pages + API routes
│   ├── components/          # UI + feature components
│   └── lib/                 # Notion / Supabase / utility code
├── supabase/
│   ├── functions/           # Edge Function + publisher helpers
│   └── migrations/          # SQL for posts_queue + audit_log
├── docs/                    # All deployment + integration docs
└── public/                  # Logo and static assets
```

---

## Brand

Crescere brand colors — **Forest** `#0D3B3B`, **Cream** `#FAF3E8`, **Gold** `#E8A838`, font: **Manrope**. Tokens live in [`tailwind.config.ts`](tailwind.config.ts) and [`src/lib/constants.ts`](src/lib/constants.ts).

---

## Roadmap

- [x] v1 — Notion schema, dashboard, post CRUD, multi-platform preview
- [x] v1 — Edge Function scaffold + Supabase queue
- [ ] v2 — Live Instagram / LinkedIn / Twitter publishing
- [ ] v2 — Cron deploy + retry logic
- [ ] v2 — Error notifications (Slack / email)
- [ ] v2 — Team roles + audit log UI
- [ ] v3 — Cross-platform analytics
- [ ] v3 — Asset library + hashtag suggestions

---

## Contributing

This dashboard is a **template for Crescere's future SaaS clients** — design and document like you're going to white-label it. Comments and clarity matter.

```bash
npm run lint
npm run typecheck
npm run build
```

---

## License

See [`LICENSE`](LICENSE).
