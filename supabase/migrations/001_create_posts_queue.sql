-- =============================================================
-- Scheduler — initial schema
-- =============================================================
-- The posts_queue table mirrors just enough Notion state for the
-- cron job (publish-scheduled-posts) to safely fan posts out to
-- Instagram, LinkedIn, and Twitter without race conditions.
--
-- Notion remains the source of truth for content; this table is
-- an operational queue.
-- =============================================================

create extension if not exists "pgcrypto";

-- Status enum mirrors src/lib/types.ts QueueStatus
do $$
begin
  if not exists (select 1 from pg_type where typname = 'queue_status') then
    create type queue_status as enum ('pending', 'publishing', 'published', 'failed');
  end if;
end $$;

create table if not exists public.posts_queue (
  id              uuid          primary key default gen_random_uuid(),
  notion_page_id  text          not null unique,
  status          queue_status  not null default 'pending',
  scheduled_at    timestamptz   not null,
  platforms       jsonb         not null default '[]'::jsonb,
  error_message   text,
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now()
);

create index if not exists posts_queue_scheduled_at_idx on public.posts_queue (scheduled_at);
create index if not exists posts_queue_status_idx       on public.posts_queue (status);

-- Auto-bump updated_at on every row update.
create or replace function public.set_updated_at() returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_queue_set_updated_at on public.posts_queue;
create trigger posts_queue_set_updated_at
  before update on public.posts_queue
  for each row
  execute function public.set_updated_at();

-- =============================================================
-- audit_log — optional, captures who did what
-- =============================================================
create table if not exists public.audit_log (
  id          uuid          primary key default gen_random_uuid(),
  user_id     uuid          references auth.users (id) on delete set null,
  action      text          not null,
  post_id     text,
  metadata    jsonb         not null default '{}'::jsonb,
  created_at  timestamptz   not null default now()
);

create index if not exists audit_log_post_id_idx    on public.audit_log (post_id);
create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);

-- =============================================================
-- Row-level security
-- =============================================================
alter table public.posts_queue enable row level security;
alter table public.audit_log   enable row level security;

-- Authenticated users can read; only the service role can write.
drop policy if exists "queue read for authed users" on public.posts_queue;
create policy "queue read for authed users"
  on public.posts_queue for select
  to authenticated
  using (true);

drop policy if exists "audit read for authed users" on public.audit_log;
create policy "audit read for authed users"
  on public.audit_log for select
  to authenticated
  using (true);
