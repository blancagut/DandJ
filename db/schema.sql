-- Vercel Postgres schema for Diaz & Johnson leads

create extension if not exists "pgcrypto";

-- =============================================
-- Consultation request form storage
-- (Used by /consult and /consulta)
-- =============================================

create table if not exists consultation_requests (
  id uuid primary key default gen_random_uuid(),

  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  date_of_birth date,
  nationality text not null,
  current_location text not null,

  case_type text not null,
  case_sub_type text,
  urgency text not null,
  case_description text not null,
  previous_attorney text,
  court_date date,

  preferred_contact_method text not null,
  preferred_consultation_time text,
  referral_source text,
  document_types jsonb default '[]'::jsonb,
  files jsonb default '[]'::jsonb,

  language text default 'en',
  status text default 'new' check (status in ('new', 'reviewing', 'contacted', 'scheduled', 'completed', 'archived')),
  notes text,
  assigned_to text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_consultation_requests_email on consultation_requests (email);
create index if not exists idx_consultation_requests_status on consultation_requests (status);
create index if not exists idx_consultation_requests_created on consultation_requests (created_at desc);
create index if not exists idx_consultation_requests_urgency on consultation_requests (urgency);

create or replace function update_consultation_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trigger_consultation_updated_at on consultation_requests;
create trigger trigger_consultation_updated_at
  before update on consultation_requests
  for each row
  execute function update_consultation_updated_at();

alter table consultation_requests enable row level security;

drop policy if exists "Allow public insert" on consultation_requests;
create policy "Allow public insert" on consultation_requests
  for insert
  with check (true);

drop policy if exists "Allow authenticated read" on consultation_requests;
create policy "Allow authenticated read" on consultation_requests
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "Allow authenticated update" on consultation_requests;
create policy "Allow authenticated update" on consultation_requests
  for update
  using (auth.role() = 'authenticated');

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

-- Admin: internal work tracking

create table if not exists work_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists work_items_updated_at_idx on work_items (updated_at desc);
create index if not exists work_items_status_updated_at_idx on work_items (status, updated_at desc);

-- =============================================
-- Support chat storage (Valeria / SupportChat)
-- =============================================

create table if not exists chat_conversations (
  id uuid default gen_random_uuid() primary key,
  visitor_id text not null,
  visitor_name text,
  visitor_email text,
  status text default 'active' check (status in ('active', 'closed')),
  last_message text,
  last_message_at timestamptz,
  unread_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists chat_messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid not null references chat_conversations(id) on delete cascade,
  content text not null,
  sender text not null check (sender in ('visitor', 'admin')),
  admin_email text,
  created_at timestamptz default now()
);

create index if not exists idx_chat_conversations_visitor on chat_conversations(visitor_id);
create index if not exists idx_chat_conversations_status on chat_conversations(status);
create index if not exists idx_chat_conversations_updated on chat_conversations(updated_at desc);
create index if not exists idx_chat_messages_conversation on chat_messages(conversation_id);
create index if not exists idx_chat_messages_created on chat_messages(created_at);

alter table chat_conversations enable row level security;
alter table chat_messages enable row level security;

drop policy if exists "Permitir crear conversaciones" on chat_conversations;
create policy "Permitir crear conversaciones" on chat_conversations
  for insert to anon, authenticated
  with check (true);

drop policy if exists "Visitantes leen sus conversaciones" on chat_conversations;
create policy "Visitantes leen sus conversaciones" on chat_conversations
  for select to anon
  using (true);

drop policy if exists "Admin lee todas las conversaciones" on chat_conversations;
create policy "Admin lee todas las conversaciones" on chat_conversations
  for select to authenticated
  using (true);

drop policy if exists "Admin actualiza conversaciones" on chat_conversations;
create policy "Admin actualiza conversaciones" on chat_conversations
  for update to authenticated
  using (true)
  with check (true);

drop policy if exists "Permitir crear mensajes" on chat_messages;
create policy "Permitir crear mensajes" on chat_messages
  for insert to anon, authenticated
  with check (true);

drop policy if exists "Leer mensajes" on chat_messages;
create policy "Leer mensajes" on chat_messages
  for select to anon, authenticated
  using (true);

do $$
begin
  begin
    alter publication supabase_realtime add table chat_conversations;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;

  begin
    alter publication supabase_realtime add table chat_messages;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;
end;
$$;
