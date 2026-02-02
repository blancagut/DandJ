# 🚀 Supabase Setup Guide

## Step 1: Run this SQL in Supabase SQL Editor

Before running `pnpm db:migrate`, you **MUST** create the helper function in Supabase:

1. Go to your Supabase project → **SQL Editor**
2. Click **New Query**
3. Paste and run:

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

## Step 2: Add credentials to .env.local

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend (for email notifications)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
LEADS_TO_EMAIL=consulting@diazandjohnson.com

# Vercel Blob (for file uploads)
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

## Step 3: Run migrations

```bash
pnpm db:migrate
```

You should see: `✅ Migrated schema from db/schema.sql`

## Step 4: (Optional) Seed test data

```bash
pnpm db:seed
```

## Step 5: Test locally

```bash
pnpm dev
```

Visit http://localhost:3000 and test the contact form!

---

## 📊 What tables get created?

### `leads` table
- Stores all form submissions (contact, consultation, h2b)
- UUID primary key
- Includes: name, email, phone, case type, message, full raw JSON, IP, user agent

### `lead_files` table
- Stores metadata for uploaded files
- Files themselves live in Vercel Blob
- Links to parent lead via foreign key

---

## 🔐 Where to find your Supabase credentials

1. **NEXT_PUBLIC_SUPABASE_URL** and **NEXT_PUBLIC_SUPABASE_ANON_KEY**:
   - Go to Project Settings → API
   - Copy "Project URL" and "anon public" key

2. **SUPABASE_SERVICE_ROLE_KEY**:
   - Same page (Project Settings → API)
   - Copy "service_role" key (⚠️ keep this secret!)

---

## ✅ Quick verification

Once you paste the credentials, run:

```bash
# Check migration works
NEXT_PUBLIC_SUPABASE_URL=https://... SUPABASE_SERVICE_ROLE_KEY=... pnpm db:migrate

# If success, add them to .env.local permanently
```
