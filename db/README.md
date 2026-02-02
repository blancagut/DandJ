# Supabase Database Setup

## 1. Prerequisites
- Create a Supabase project at https://supabase.com
- Get your project credentials from Project Settings → API

## 2. Environment Variables
Create `.env.local` and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Also add Resend and Vercel Blob credentials
RESEND_API_KEY=
RESEND_FROM_EMAIL=
LEADS_TO_EMAIL=
BLOB_READ_WRITE_TOKEN=
```

## 3. Enable SQL Execution Function
In Supabase Dashboard → SQL Editor, run:

```sql
create or replace function exec_sql(sql text)
returns void
language plpgsql
security definer
as $$
begin
  execute sql;
end;
$$;
```

Or simply run: `db/setup-exec-function.sql` in the SQL Editor.

## 4. Run Migrations
```bash
pnpm db:migrate
```

This will create the `leads` and `lead_files` tables.

## 5. (Optional) Seed Test Data
```bash
pnpm db:seed
```

## Tables Created

### `leads`
Stores all form submissions (contact, consultation, h2b).

| Column       | Type        | Description                          |
|--------------|-------------|--------------------------------------|
| id           | uuid        | Primary key                          |
| lead_type    | text        | 'contact', 'consultation', or 'h2b'  |
| first_name   | text        | User's first name                    |
| last_name    | text        | User's last name                     |
| email        | text        | Contact email                        |
| phone        | text        | Phone number                         |
| language     | text        | 'en' or 'es'                         |
| case_type    | text        | Type of legal case                   |
| message      | text        | User's message/description           |
| raw          | jsonb       | Full form payload                    |
| ip           | text        | User IP (for spam detection)         |
| user_agent   | text        | Browser user agent                   |
| created_at   | timestamptz | Submission timestamp                 |

### `lead_files`
Stores uploaded file metadata (files are stored in Vercel Blob).

| Column       | Type        | Description                          |
|--------------|-------------|--------------------------------------|
| id           | bigserial   | Primary key                          |
| lead_id      | uuid        | Foreign key → leads(id)              |
| file_name    | text        | Original filename                    |
| content_type | text        | MIME type                            |
| size_bytes   | integer     | File size                            |
| blob_url     | text        | Public URL from Vercel Blob          |
| created_at   | timestamptz | Upload timestamp                     |

## Row Level Security (Optional)
You may want to enable RLS and create policies if you plan to query leads from the client side in the future. For now, all queries go through API routes using the service role key, so RLS is not strictly required.
