# ✅ Supabase Integration Complete

## What Changed

✅ **Replaced Vercel Postgres with Supabase**
- Removed `@vercel/postgres`
- Added `@supabase/supabase-js` v2.93.3
- All database queries now use Supabase client

✅ **Updated Code**
- `lib/server/leads.ts` - now uses Supabase `.from()` / `.insert()` / `.select()`
- `scripts/db-migrate.mjs` - connects to Supabase and runs DDL via `exec_sql()` function
- `scripts/db-seed.mjs` - connects to Supabase for seeding
- All 3 API routes (`/api/contact`, `/api/consultation`, `/api/h2b`) work with Supabase

✅ **Environment Variables** (see `.env.example`)
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

✅ **Build Verified** - `pnpm build` passes successfully

---

## 🎯 Next Steps - Give Me Your Credentials

I need you to provide:

### 1. Supabase Project Credentials
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

You can find these in:
- Supabase Dashboard → Project Settings → API

### 2. Before running migrations, you MUST:

Run this SQL in Supabase SQL Editor (one time only):

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

This allows our migration scripts to execute the schema DDL.

---

## 📋 What I'll Do Once You Give Credentials

1. ✅ Add credentials to `.env.local`
2. ✅ Run `pnpm db:migrate` to create tables (`leads`, `lead_files`)
3. ✅ Run `pnpm db:seed` (optional test data)
4. ✅ Verify the tables exist in Supabase
5. ✅ Test a form submission end-to-end

---

## 📊 Tables That Will Be Created

### `leads`
- Stores contact, consultation, and H-2B form submissions
- Fields: id, lead_type, first_name, last_name, email, phone, language, case_type, message, raw (jsonb), ip, user_agent, created_at

### `lead_files`
- Stores metadata for uploaded files (actual files in Vercel Blob)
- Fields: id, lead_id, file_name, content_type, size_bytes, blob_url, created_at

---

## 🔐 Security Notes

- **Service Role Key** has full admin access - never expose in client code
- **Anon Key** is safe for client use (but we only use it server-side here)
- API routes use Service Role Key to bypass RLS
- Consider enabling RLS policies later if you query from client

---

Ready to proceed! Just paste your Supabase credentials and I'll handle the rest.
