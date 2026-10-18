# CINE – private-episode streaming site (Next.js + Supabase)
The 4-digit PIN is an access gate, not DRM.

## Setup
1. `npm install`
2. supabase.com → New project. SQL Editor → paste and run `supabase/schema.sql` (creates tables, a **private** `videos` bucket and a public `thumbnails` bucket).
3. Project Settings → API: copy URL and `service_role` key.
4. `cp .env.example .env.local`, fill it in. Generate the admin hash and secret with the commands shown in the file.
5. `npm run dev` → http://localhost:3000, admin at /login.
   Note: Supabase free tier caps files at 50 MB (Storage → Settings). Pro allows up to 50 GB. Upload limit in the app is 500 MB (edit `RULES` in `app/api/admin/sign/route.ts`).

## Deploy (Vercel)
Push to GitHub → import in Vercel → add the same env vars (set `NEXT_PUBLIC_SITE_URL` to your domain) → Deploy.
Rate limiting is in-memory; on Vercel swap `limited()` in `lib/session.ts` for Upstash Redis.

## Storage swap
All storage calls live in `lib/storage.ts` (4 functions). Reimplement them for S3/R2/Cloudinary.

## Daily checklist
1. /login → Add Episode  2. Upload video + thumbnail  3. Number, title, description  4. 4-digit password
5. Publish date (now, or a future time to schedule)  6. Publish. The newest published episode becomes the homepage hero.

## How to…
- Change password: Edit → type a new 4-digit password → Publish (empty keeps the old one).
- Replace video / thumbnail: Edit → choose a new file → Publish (the old file is deleted).
- Unpublish/delete: buttons in the Dashboard table.
