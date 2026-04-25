# Notion Schema

The **Scheduler – Posts** database is the single source of truth for everything Scheduler publishes. Create it once in Notion, share it with your integration, and never touch the columns again — the dashboard, API routes, and cron worker all assume this exact shape.

> Property names are **case-sensitive**. They're mirrored in [`src/lib/constants.ts`](../src/lib/constants.ts) (`NOTION_PROPS`).

---

## Fields

| Property              | Type              | Required | Notes |
|-----------------------|-------------------|----------|-------|
| **Title**             | Title             | ✅       | Internal post name. Shown in tables and the breadcrumb. |
| **Caption**           | Rich text         | ✅       | Default caption used on every platform that doesn't have an override. |
| **Image URL**         | URL               |          | Hosted image link. Required when Instagram is selected. |
| **Image Alt Text**    | Text              |          | A11y + SEO. Surfaces in `alt=""` on every preview. |
| **Scheduled DateTime**| Date (with time)  | ✅ for scheduled | When the cron worker should publish. |
| **Status**            | Select            | ✅       | Options: `Draft`, `Scheduled`, `Publishing`, `Published`, `Failed`. |
| **Platforms**         | Multi-select      | ✅       | Options: `Instagram`, `LinkedIn`, `Twitter`. |
| **Posted At**         | Date              |          | Auto-filled by the cron worker on success. |
| **Instagram Caption** | Rich text         |          | Override only — leave blank to inherit Caption. |
| **LinkedIn Summary**  | Rich text         |          | Override only — leave blank to inherit Caption. |
| **Twitter Text**      | Rich text         |          | Override only — leave blank to inherit Caption. |
| **Error Log**         | Rich text         |          | Auto-filled with the API error message if a publish fails. |
| **Created By**        | Person            |          | Author. Notion populates this on creation. |
| **Last Modified**     | Last edited time  |          | Built-in Notion property — no setup needed. |

---

## Status options (exact spelling matters)

```
Draft       — gray
Scheduled   — blue
Publishing  — yellow
Published   — green
Failed      — red
```

## Platforms options (exact spelling matters)

```
Instagram   — pink
LinkedIn    — blue
Twitter     — light blue
```

---

## Sample row

| Field                  | Value |
|------------------------|-------|
| Title                  | Q2 Crescere Launch Announcement |
| Caption                | We're thrilled to launch Scheduler — the first social tool built around how consultancies actually work … |
| Image URL              | https://cdn.example.com/q2-launch.jpg |
| Image Alt Text         | Crescere team raising glasses at the Q2 launch event |
| Scheduled DateTime     | 2026-05-15 09:00 |
| Status                 | Scheduled |
| Platforms              | Instagram, LinkedIn, Twitter |
| Posted At              | _(empty)_ |
| Instagram Caption      | _(empty — uses default Caption)_ |
| LinkedIn Summary       | We're announcing Scheduler — built so your consultancy can publish once and reach every channel … |
| Twitter Text           | 🎉 Scheduler is live. Plan once, post everywhere. crescere.consulting/scheduler |
| Error Log              | _(empty)_ |
| Created By             | Victor |

---

## Sharing with the integration

1. **Create the integration:** Notion → Settings → Integrations → New integration. Copy the **Internal Integration Token** into `NOTION_API_KEY`.
2. **Get the database ID:** open the database as a full page. The URL looks like `https://www.notion.so/<workspace>/<DATABASE_ID>?v=<view>`. Copy the 32-char hex into `NEXT_PUBLIC_NOTION_DATABASE_ID`.
3. **Connect the database:** open the database → `· · ·` (top right) → **Connections** → search for your integration → **Confirm**.

> Without step 3 the API will return `object_not_found` even with a valid token.
