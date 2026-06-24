# Inspire X Planner

An RPM (Result, Purpose, Massive Action Plan) life planning tool for Rob Nickester / Inspire X, based on Tony Robbins' methodology.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Supabase** (PostgreSQL, Auth, Storage, RLS)
- **shadcn/ui** with `@base-ui/react`
- **Tailwind CSS** — dark navy theme
- **@dnd-kit/core** — drag-and-drop for Weekly Plan
- **date-fns** — date utilities

## Features

- **Categories** — life areas with Big Picture (vision, purpose, roles, horizons, micro-goals)
- **Projects** — organized under categories with key results and inspiration board
- **Actions & RPM Blocks** — tasks with duration, starring, recurrence, and RPM grouping
- **Weekly Capture** — capture all actions by category for a week
- **Weekly Plan** — drag actions onto Mon–Sun day columns
- **Weekly Reflection** — wins, reflection, and category breakdown
- **My Day** — daily action view
- **Monthly Calendar** — see planned actions across the month
- **Category Spotlight** — full-screen immersive category mode with prev/next navigation
- **People CRM** — contact notes by type (birthday, discussion points, things to remember, etc.)
- **Cover Image Picker** — choose from curated defaults or upload custom images

## Local Development

```bash
cp .env.local.example .env.local
# Fill in Supabase credentials

npm install
npm run dev
```

Apply the database schema:
```bash
# Run supabase/migrations/001_initial_schema.sql in your Supabase SQL editor
```

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Import in [vercel.com/new](https://vercel.com/new)
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# Optional: for Google/Outlook calendar OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
```

## Database

The full schema is in `supabase/migrations/001_initial_schema.sql`. It includes:

- 12 tables with Row Level Security
- Automatic profile + CAPTURE category creation on signup
- All user data isolated by `user_id`
