-- Vercel Postgres schema for Diaz & Johnson leads

create extension if not exists "pgcrypto";

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  lead_type text not null check (lead_type in ('contact', 'consultation', 'h2b')),

  first_name text,
  last_name text,
  email text,
  phone text,
  language text,

  case_type text,
  message text,

  raw jsonb,

  ip text,
  user_agent text,

  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on leads (created_at desc);
create index if not exists leads_type_created_at_idx on leads (lead_type, created_at desc);

create table if not exists lead_files (
  id bigserial primary key,
  lead_id uuid not null references leads(id) on delete cascade,
  file_name text not null,
  content_type text,
  size_bytes integer,
  blob_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists lead_files_lead_id_idx on lead_files (lead_id);
