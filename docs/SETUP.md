# 🛠️ Setup Instructions

## 1️⃣ Clone & Install

```bash
git clone https://github.com/blancagut/DandJ.git
cd DandJ
pnpm install
```

## 2️⃣ Supabase Setup

### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and keys

### Run SQL Setup
In Supabase SQL Editor, run this **ONCE**:

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

This enables the migration script to create tables.

## 3️⃣ Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Admin Access (comma-separated)
ADMIN_EMAILS=admin@diazandjohnson.com,support@diazandjohnson.com

# Resend (Email)
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@diazandjohnson.com
LEADS_TO_EMAIL=consulting@diazandjohnson.com

# Vercel Blob (File Storage)
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
```

### Where to Find Keys

**Supabase**:
- Dashboard → Project Settings → API
- Copy "Project URL" and "anon/public" key
- Copy "service_role" key (keep secret!)

**Resend**:
- [resend.com](https://resend.com/api-keys)
- Create API key

**Vercel Blob**:
- Vercel Dashboard → Storage → Create Blob Store
- Copy token

## 4️⃣ Run Migrations

```bash
pnpm db:migrate
```

Expected output: `✅ Migrated schema from db/schema.sql`

This creates:
- `leads` table (form submissions)
- `lead_files` table (H2B file uploads)
- `work_items` table (admin todo list)

## 5️⃣ Create Admin User

In Supabase Dashboard → Authentication → Users:
1. Click "Add user" → "Create new user"
2. Email: `admin@diazandjohnson.com`
3. Password: (your choice)
4. **Toggle "Auto Confirm User" ON**
5. Click "Create user"

## 6️⃣ Test Locally

```bash
pnpm dev
```

Visit:
- http://localhost:3000 - Public site
- http://localhost:3000/login - Admin login
- http://localhost:3000/admin - Admin panel (after login)
- http://localhost:3000/api/admin/health - Health check

## 7️⃣ Deploy to Vercel

### First Time Setup
```bash
vercel
```

Follow prompts to link project.

### Set Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
- Add all vars from `.env.local`
- Apply to **Production** and **Preview**

### Deploy
```bash
vercel --prod
```

Or push to `main` branch (auto-deploy).

## 8️⃣ Configure Custom Domain

In Vercel Dashboard → Settings → Domains:
1. Add `diazandjohnson.online`
2. Update DNS records as instructed
3. Wait for SSL certificate

## 🐛 Troubleshooting

### "Application error" on /admin
1. Check `/api/admin/health` - it shows what's missing
2. Verify env vars are set in Vercel (Production)
3. Redeploy after setting vars

### Migration fails
1. Ensure `exec_sql` function exists in Supabase
2. Check `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Run SQL Editor manually: copy/paste `db/schema.sql`

### Admin login fails
1. Verify user exists in Supabase Auth
2. Check user is confirmed (green checkmark)
3. Verify email is in `ADMIN_EMAILS` env var
4. Clear cookies and retry

### Forms don't send email
1. Verify `RESEND_API_KEY` is valid
2. Check domain is verified in Resend
3. Use verified domain in `RESEND_FROM_EMAIL`

## 📚 Next Steps

- Read [docs/README.md](./README.md) for project structure
- Review API routes in `app/api/`
- Customize content in `lib/practice-areas-data.ts`
- Update attorney bios in `app/team/page.tsx`

## 🆘 Need Help?

- Check health endpoint: `/api/admin/health`
- Review Vercel function logs
- Check Supabase logs (Dashboard → Logs)
- Verify all env vars are set correctly
