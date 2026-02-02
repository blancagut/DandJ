# Diaz & Johnson - Law Firm Website

## 📋 Project Structure

```
diaz-and-johnson-dashboard/
├── app/                      # Next.js 15 App Router
│   ├── (routes)/            # Public routes
│   │   ├── about/           # About page
│   │   ├── areas/           # Practice areas
│   │   ├── consult/         # Consultation form
│   │   ├── legal/           # Legal pages
│   │   ├── resources/       # Resources
│   │   └── team/            # Team page
│   ├── admin/               # Admin panel (auth protected)
│   ├── api/                 # API routes
│   │   ├── contact/         # Contact form API
│   │   ├── consultation/    # Consultation form API
│   │   ├── h2b/             # H2B visa wizard API
│   │   └── admin/health/    # Health check endpoint
│   ├── login/               # Admin login
│   └── [...layout/global files]
│
├── components/              # React components
│   ├── admin/              # Admin-specific components
│   ├── ui/                 # Shadcn UI components
│   └── [...feature components]
│
├── lib/                     # Utilities and services
│   ├── api/                # API utilities
│   ├── server/             # Server-side utilities
│   │   ├── admin-auth.ts   # Admin authorization
│   │   ├── blob.ts         # File upload (Vercel Blob)
│   │   ├── email.ts        # Email (Resend)
│   │   ├── leads.ts        # Lead management
│   │   └── work-items.ts   # Admin work items
│   ├── supabase/           # Supabase clients
│   │   ├── client.ts       # Browser client
│   │   └── server.ts       # Server client
│   └── [...other utilities]
│
├── db/                      # Database schema and migrations
│   ├── schema.sql          # Main schema (leads, work_items)
│   ├── seed.sql            # Test data
│   └── setup-exec-function.sql  # Supabase helper function
│
├── scripts/                 # Build/migration scripts
│   ├── db-migrate.mjs      # Run schema migrations
│   └── db-seed.mjs         # Seed database
│
├── public/                  # Static assets
│   ├── clients/            # Client photos
│   └── [...images, icons]
│
├── docs/                    # Documentation
│   ├── README.md           # This file
│   └── SETUP.md            # Setup instructions
│
└── [...config files]
```

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Email**: Resend
- **File Storage**: Vercel Blob
- **Hosting**: Vercel

## 📦 Environment Variables

Required for production (set in Vercel):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Admin Access (comma-separated emails)
ADMIN_EMAILS=admin@diazandjohnson.com

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@diazandjohnson.com
LEADS_TO_EMAIL=consulting@diazandjohnson.com

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build for production
pnpm build

# Run migrations
pnpm db:migrate

# Seed test data
pnpm db:seed
```

## 📖 Key Features

1. **Public Website**
   - Bilingual (English/Spanish)
   - Practice area pages
   - Attorney profiles
   - Success stories carousel
   - Contact forms (contact, consultation, H2B visa wizard)

2. **Admin Panel** (`/admin`)
   - Protected by Supabase Auth + email allowlist
   - Manage internal work items (todo, in_progress, done)
   - View form submissions (future: from leads table)

3. **API Routes**
   - `/api/contact` - General contact form
   - `/api/consultation` - Free consultation booking
   - `/api/h2b` - H2B visa wizard (with file upload)
   - `/api/admin/health` - Health check for debugging

## 🔐 Admin Access

1. Create admin user in Supabase Auth (auto-confirm)
2. Add email to `ADMIN_EMAILS` env var
3. Login at `/login`
4. Access panel at `/admin`

## 📝 Database Schema

### `leads` table
Stores all form submissions (contact, consultation, H2B).

### `work_items` table
Admin internal work tracking (todo list).

### `lead_files` table
File uploads from H2B wizard (linked to leads).

## 🚢 Deployment

- **Platform**: Vercel
- **Domain**: diazandjohnson.online
- **Project**: `dand-j-u43e` (keep this one, delete duplicates)

### Deploy Checklist
1. Set all env vars in Vercel (Production + Preview)
2. Run migration SQL in Supabase SQL Editor
3. Create admin user in Supabase Auth
4. Deploy from `main` branch
5. Test `/admin` and forms

## 🐛 Debugging

- **Health Check**: `/api/admin/health` (returns JSON with env/auth/db status)
- **Logs**: Vercel Dashboard → Functions → Filter by route
- **Local Testing**: Always use `.env.local` with real credentials

## 📞 Support

For questions or issues, contact the development team or refer to `/docs/SETUP.md`.
