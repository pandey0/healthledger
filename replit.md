# HealthLedger

A Next.js 16 health data management app that lets users upload medical reports, extract biomarker data using Google Gemini AI, and visualize health trends over time.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Auth**: NextAuth v5 (beta) with Google OAuth + Prisma adapter
- **Database**: PostgreSQL via Prisma ORM
- **File Uploads**: UploadThing
- **AI**: Google Generative AI (Gemini)
- **UI**: Tailwind CSS v4, Radix UI, shadcn/ui, Recharts

## Project Structure

- `app/` — Next.js App Router pages and API routes
  - `app/(app)/` — Authenticated app pages (vault, upload, chat)
  - `app/(marketing)/` — Public marketing pages
  - `app/api/auth/` — NextAuth route handler
  - `app/api/uploadthing/` — UploadThing route handler
- `lib/` — Shared utilities, Prisma client, server actions, DAL
- `components/` — Reusable UI components
- `prisma/` — Prisma schema and migrations
- `middleware.ts` — Auth-based route protection

## Required Environment Variables (Secrets)

- `DATABASE_URL` — PostgreSQL connection string (auto-provided by Replit DB)
- `AUTH_SECRET` — Random secret for NextAuth session encryption
- `AUTH_GOOGLE_ID` — Google OAuth Client ID
- `AUTH_GOOGLE_SECRET` — Google OAuth Client Secret
- `UPLOADTHING_TOKEN` — UploadThing API token
- `GEMINI_API_KEY` — Google AI Studio API key

## Running the App

The app runs on port 5000 via the "Start application" workflow:

```bash
npm run dev   # next dev -p 5000 -H 0.0.0.0
npm run build # next build
npm run start # next start -p 5000 -H 0.0.0.0
```

## Database

Prisma migrations are in `prisma/migrations/`. After cloning or updating the schema:

```bash
npx prisma generate       # regenerate the Prisma client
npx prisma migrate deploy # apply pending migrations
```

## Design System

- **Primary brand color**: `#1A365D` (dark navy) — used directly as Tailwind arbitrary value AND as the `--primary` CSS variable (`oklch(0.295 0.079 245)`)
- **Background**: `#F4F3F0` warm off-white
- **Card radius**: `rounded-[20px]` (20px) — set as default in `components/ui/card.tsx`
- **Button radius**: `rounded-[14px]` (14px) — set as default in `components/ui/button.tsx`
- **Base radius**: `--radius: 0.875rem` (14px) — drives all `rounded-sm/md/lg/xl` tokens
- **Status colors**: emerald = normal, amber = borderline/high, red = low/abnormal
- **Reference ranges**: `lib/referenceRanges.ts` — 60+ biomarkers, used in vault detail, marker pages, and upload review

## Component Architecture

- `components/layout/MobileNav.tsx` — Mobile bottom nav (client, hides on `/chat`)
- `components/layout/NavLinks.tsx` — Sidebar nav with active state (client, uses `usePathname`)
- `components/vault/TrendGraph.tsx` — Recharts line graph with reference band and color-coded dots
- `components/ui/` — shadcn primitives customized to HealthLedger design system

## Auth Notes

- Auth bypass active for development: `process.env.NODE_ENV !== "development"` check in `app/(app)/layout.tsx` AND `middleware.ts`
- Remove both checks before deploying to production

## Replit Notes

- Port 5000 with `0.0.0.0` host binding is required for Replit's preview pane
- `allowedDevOrigins` in `next.config.ts` is set to allow `*.replit.dev` cross-origin requests
- Prisma client must be generated (`npx prisma generate`) before the app can start
