# HealthLedger — Complete Deployment, Accounts & Production Guide

---

## Table of Contents

1. [Stack overview](#1-stack-overview)
2. [Accounts you need to create](#2-accounts-you-need-to-create)
3. [Domain name setup](#3-domain-name-setup)
4. [OAuth setup (Google & GitHub login)](#4-oauth-setup-google--github-login)
5. [Database — Neon Postgres](#5-database--neon-postgres)
6. [File storage — UploadThing](#6-file-storage--uploadthing)
7. [Python AI engine — where to run it](#7-python-ai-engine--where-to-run-it)
8. [Deploy the Next.js app — Vercel](#8-deploy-the-nextjs-app--vercel)
9. [All environment variables](#9-all-environment-variables)
10. [Handling multiple users & scalability](#10-handling-multiple-users--scalability)
11. [Production-grade checklist](#11-production-grade-checklist)
12. [Monitoring & error tracking](#12-monitoring--error-tracking)
13. [Cost estimates by scale](#13-cost-estimates-by-scale)
14. [Recommended launch stack](#14-recommended-launch-stack)

---

## 1. Stack overview

| Layer | Technology | Where it runs |
|-------|-----------|--------------|
| Frontend + API routes | Next.js 16 (App Router) | Vercel |
| AI engine | Python / FastAPI | Railway / Render / Modal |
| Database | PostgreSQL via Prisma | Neon |
| File storage | UploadThing | UploadThing CDN |
| Auth | Auth.js (Google / GitHub OAuth) | Your Next.js app |
| Domain | Custom domain | Namecheap / Cloudflare |

---

## 2. Accounts you need to create

Create accounts on each of these platforms before you start. All have free tiers to get going.

### 2.1 GitHub
**URL:** [github.com](https://github.com)

- Create an account (free).
- Create a new **private repository** and push your codebase to it.
- This is the source that Vercel, Railway, and Render all pull from.

```bash
# In your project folder
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/healthledger.git
git push -u origin main
```

### 2.2 Vercel (Next.js hosting)
**URL:** [vercel.com](https://vercel.com)

- Sign up with your GitHub account (one click).
- Hobby plan is free. Pro is $20/mo (needed for production SLAs).
- No credit card needed for free tier.

### 2.3 Neon (PostgreSQL)
**URL:** [neon.tech](https://neon.tech)

- Sign up with GitHub or email.
- Free plan: 512 MB, 1 project — enough to start.
- No credit card needed for free tier.

### 2.4 UploadThing (file storage)
**URL:** [uploadthing.com](https://uploadthing.com)

- Sign up with GitHub.
- Free plan: 2 GB storage, 2 GB bandwidth/month.
- No credit card needed for free tier.

### 2.5 Railway (Python backend)
**URL:** [railway.app](https://railway.app)

- Sign up with GitHub.
- $5/mo Hobby plan. Add a credit card to activate (won't charge unless you exceed free credits).
- Alternatively use **Render** (render.com) — free tier available with cold starts.

### 2.6 Google Cloud Console (for Google login)
**URL:** [console.cloud.google.com](https://console.cloud.google.com)

- Sign in with a Google account.
- Free — you're just creating OAuth credentials, not using paid services.
- Required to allow users to sign in with Google.

### 2.7 Sentry (error monitoring — optional but strongly recommended)
**URL:** [sentry.io](https://sentry.io)

- Sign up free. Free plan covers 5,000 errors/month.
- Tells you when users hit crashes, with full stack traces.

### 2.8 Domain registrar (if using a custom domain)
**Options:**
- [Namecheap](https://namecheap.com) — cheapest, good UI (~$10/yr for a `.com`)
- [Cloudflare Registrar](https://cloudflare.com/products/registrar/) — at-cost pricing (no markup), best for performance
- [Google Domains](https://domains.google) — simple, $12/yr

---

## 3. Domain name setup

### 3.1 Buy a domain

Go to Namecheap or Cloudflare, search for your domain (e.g. `healthledger.app`), and purchase it.

**Tips for choosing:**
- `.app` and `.health` domains signal legitimacy for a health product
- `.com` is always the safest bet for trust
- Keep it short and memorable — users will type it on mobile

### 3.2 Point DNS to Vercel

After deploying on Vercel:

1. Go to **Vercel dashboard → your project → Settings → Domains**
2. Click **Add Domain** → type your domain (e.g. `healthledger.app`)
3. Vercel gives you DNS records to add. Two options:

**Option A — Add Vercel nameservers (recommended, Vercel manages everything):**
- In your domain registrar, change the nameservers to:
  ```
  ns1.vercel-dns.com
  ns2.vercel-dns.com
  ```

**Option B — Add just the A/CNAME records (keep registrar DNS):**
- Add an `A` record: `@` → `76.76.21.21`
- Add a `CNAME` record: `www` → `cname.vercel-dns.com`

DNS propagates in 10 minutes to 48 hours. Vercel auto-provisions an SSL certificate (HTTPS) automatically — no setup needed.

### 3.3 Update environment variables after getting your domain

Once your domain is live, update:
```env
NEXTAUTH_URL="https://yourdomain.com"
```

And update the **Authorized redirect URIs** in Google Cloud Console (see §4.2).

### 3.4 Cloudflare (optional but recommended — free)

If you want extra performance and security, transfer DNS to Cloudflare (free):

1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Add your site → Cloudflare scans existing DNS records
3. Update your domain registrar's nameservers to Cloudflare's
4. Enable: **Always use HTTPS**, **Auto Minify**, **Brotli compression**

Benefits: DDoS protection, global CDN, free SSL, analytics, rate limiting rules.

---

## 4. OAuth setup (Google & GitHub login)

### 4.1 GitHub OAuth app

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name:** HealthLedger
   - **Homepage URL:** `https://yourdomain.com`
   - **Authorization callback URL:** `https://yourdomain.com/api/auth/callback/github`
4. Click **Register application**
5. Copy the **Client ID** → this is `GITHUB_CLIENT_ID`
6. Click **Generate a new client secret** → copy it → `GITHUB_CLIENT_SECRET`

> For local development, create a **separate** OAuth app with `http://localhost:5000` as homepage and `http://localhost:5000/api/auth/callback/github` as callback.

### 4.2 Google OAuth credentials

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (click the project dropdown at the top → **New Project**)
3. Name it "HealthLedger" → Create
4. In the left menu go to **APIs & Services → OAuth consent screen**
5. Choose **External** → Create
6. Fill in:
   - App name: `HealthLedger`
   - User support email: your email
   - Developer contact: your email
7. Click **Save and Continue** through the scopes page (no changes needed)
8. Add test users (your own email while in development)
9. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**
10. Application type: **Web application**
11. Name: `HealthLedger Web`
12. Under **Authorized redirect URIs** add:
    ```
    https://yourdomain.com/api/auth/callback/google
    http://localhost:5000/api/auth/callback/google
    ```
13. Click **Create** → copy **Client ID** and **Client Secret**

> To go live (remove the 100 test user limit): go to **OAuth consent screen → Publish App**. Google may review it if you use sensitive scopes — but for basic login (just email + name) it's instant.

### 4.3 Generate AUTH_SECRET

Run this in your terminal to generate a secure secret:
```bash
openssl rand -base64 32
```
This goes in `AUTH_SECRET` (or `NEXTAUTH_SECRET`).

---

## 5. Database — Neon Postgres

### 5.1 Create your Neon database

1. Sign in at [neon.tech](https://neon.tech)
2. Click **New Project**
3. Choose a region closest to your users (e.g. `AWS us-east-1` for US users)
4. Name it `healthledger`
5. Click **Create Project**

### 5.2 Get your connection strings

In your Neon project dashboard, click **Connection Details**. You need **two** strings:

- **Direct connection** (for migrations only):
  ```
  postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
  ```
- **Pooled connection** (for the running app):
  ```
  postgresql://user:pass@ep-xxx-pooler.neon.tech/neondb?pgbouncer=true&connection_limit=1
  ```

Use the **pooled** string as `DATABASE_URL` in production. Use the **direct** string only when running migrations.

### 5.3 Run migrations against production

```bash
# Set the DIRECT connection string temporarily
DATABASE_URL="postgresql://direct-connection-string" npx prisma migrate deploy
```

### 5.4 Enable automated backups

Neon automatically retains 7 days of backups on paid plans. On the free tier, enable **Point-in-time restore** in project settings if available. For extra safety, set up a weekly pg_dump via a cron job on Railway.

---

## 6. File storage — UploadThing

### 6.1 Create your UploadThing app

1. Sign in at [uploadthing.com](https://uploadthing.com)
2. Click **Create a new app** → name it `HealthLedger`
3. Go to **API Keys** → copy your token → this is `UPLOADTHING_TOKEN`

### 6.2 Pricing

| Plan | Storage | Bandwidth | Price |
|------|---------|-----------|-------|
| Free | 2 GB | 2 GB/mo | $0 |
| Standard | 100 GB | 100 GB/mo | $10/mo |
| Plus | 1 TB | 500 GB/mo | $40/mo |

**Estimating your storage use:**
- Each saved lab report image: ~0.5–2 MB
- 100 users × 3 reports/month × 1 MB = 300 MB/month → Free plan
- 1,000 users × 3 reports/month × 1 MB = 3 GB/month → Standard plan

The deferred-upload implementation means files only reach UploadThing when a user clicks **Save to Vault** — abandoned review sessions cost $0.

---

## 7. Python AI engine — where to run it

Your FastAPI backend (`main.py`) receives lab report images and returns extracted biomarkers. It calls an AI vision model (OpenAI GPT-4o / Google Gemini) and is separate from the Next.js app.

### Option A: Railway (recommended)

1. In Railway dashboard → **New Project → Deploy from GitHub repo**
2. Select your Python backend repo (or a sub-folder if it's a monorepo)
3. Railway auto-detects Python and runs it
4. If not detected, add a `Dockerfile`:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

5. Add environment variables (your AI API keys) in Railway's dashboard
6. Copy the generated Railway URL → set as `NEXT_PUBLIC_BACKEND_URL` in Vercel

**Cost:** ~$5–20/mo depending on compute usage.

### Option B: Render

1. [render.com](https://render.com) → **New Web Service → Connect GitHub**
2. Select your Python repo
3. Runtime: Python 3 | Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port 8000`
5. Free tier has 15-minute cold starts. $7/mo for always-on.

### Option C: Modal (best for pure AI workloads)

If your Python file just calls OpenAI/Gemini and does no local ML:

```python
import modal

app = modal.App("healthledger-extract")

@app.function()
@modal.web_endpoint(method="POST")
def extract(file: bytes):
    # your extraction logic
    ...
```

Cost: ~$0.0001/call. At 1,000 extractions/month → less than $1.

### Recommendation by user count

| Users | Run Python on |
|-------|--------------|
| 0–100 | Render free or Modal |
| 100–1,000 | Railway Starter ($5/mo) |
| 1,000–10,000 | Railway Pro or Google Cloud Run |
| 10,000+ | AWS ECS or Kubernetes with autoscaling |

---

## 8. Deploy the Next.js app — Vercel

### 8.1 First deploy

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Vercel auto-detects Next.js — no config needed
4. **Before clicking Deploy**, go to **Environment Variables** and add all variables from §9
5. Click **Deploy**

### 8.2 Add your custom domain

1. Vercel dashboard → your project → **Settings → Domains**
2. Type your domain → **Add**
3. Follow the DNS instructions (see §3.2)

### 8.3 Automatic deploys

Every `git push` to your `main` branch auto-deploys. Every pull request gets its own preview URL — useful for testing before merging.

### 8.4 Run database migrations on deploy

Add a build command in `package.json` so Prisma migrations run automatically:

```json
{
  "scripts": {
    "build": "prisma migrate deploy && next build"
  }
}
```

Make sure the **direct** (non-pooled) DATABASE_URL is available during build time for migrations, and the **pooled** URL is used at runtime.

---

## 9. All environment variables

Set all of these in **Vercel → Settings → Environment Variables** for Production, Preview, and Development environments.

```env
# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.neon.tech/neondb?pgbouncer=true&connection_limit=1"
# For migrations only (direct connection, not pooled):
DIRECT_DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"

# ── Auth.js ───────────────────────────────────────────────────────────────────
NEXTAUTH_URL="https://yourdomain.com"       # exact URL, no trailing slash
AUTH_SECRET="your-generated-secret"         # openssl rand -base64 32

GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"

GITHUB_ID="your-github-oauth-client-id"
GITHUB_SECRET="your-github-oauth-secret"

# ── UploadThing ───────────────────────────────────────────────────────────────
UPLOADTHING_TOKEN="sk_live_xxx"

# ── Python AI backend ─────────────────────────────────────────────────────────
NEXT_PUBLIC_BACKEND_URL="https://your-python-api.railway.app"

# ── Monitoring (optional but recommended) ─────────────────────────────────────
SENTRY_DSN="https://xxx@sentry.io/xxx"
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"
```

And in your **Python backend** (Railway or Render environment variables):
```env
OPENAI_API_KEY="sk-..."        # if using OpenAI
GOOGLE_AI_API_KEY="AIza..."    # if using Gemini
ALLOWED_ORIGIN="https://yourdomain.com"   # CORS whitelist
```

---

## 10. Handling multiple users & scalability

### 10.1 Database connection pooling (critical for serverless)

Next.js on Vercel runs as serverless functions — each request can spawn a new process. Without pooling, you'll exhaust Postgres's connection limit within seconds of real traffic.

**Solution:** Use Neon's pooled connection string (already covered in §5.2). This routes all connections through PgBouncer, which multiplexes thousands of app connections into a small pool of real Postgres connections.

Also ensure your `lib/prisma.ts` uses the global singleton pattern:
```typescript
// lib/prisma.ts — prevents new PrismaClient on every hot reload
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 10.2 Rate limiting the AI extraction endpoint

Each extraction call costs money (AI API fees). Without limits, one bad actor could drain your budget.

**In your Python FastAPI backend:**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/extract")
@limiter.limit("5/minute")       # max 5 extractions per minute per IP
@limiter.limit("20/day")         # max 20 per day per IP
async def extract(request: Request, file: UploadFile):
    ...
```

**In Next.js** (for authenticated limits per user):
```typescript
// Check how many extractions the user has done today
const todayCount = await prisma.document.count({
  where: { userId, createdAt: { gte: startOfDay } }
});
if (todayCount >= 10) return { error: "Daily limit reached" };
```

### 10.3 The app is already horizontally scalable

Your Next.js app is stateless — all state lives in Postgres and signed cookies. This means:
- Vercel auto-scales to handle any traffic spike
- No sticky sessions or shared memory needed
- Adding more users costs nothing until you hit database or AI API limits

### 10.4 Python backend concurrency

FastAPI is async, so it handles many concurrent requests. But AI extraction takes 3–10 seconds per call. For high concurrency:

**Phase 1 (< 100 concurrent users):** Run a single Railway instance — async FastAPI handles it fine.

**Phase 2 (100+ concurrent users):** Add a job queue so requests don't pile up:
```
User uploads → Next.js enqueues job (Redis/BullMQ) → Worker processes → User polls for result
```
Tools: **BullMQ** (Node.js queue) + **Redis** (Railway provides Redis) + a background worker process.

### 10.5 CDN and caching

Vercel caches static assets automatically on their global CDN. For server-rendered pages, you can add cache headers to routes that don't need real-time data:
```typescript
// In a server component or route handler
export const revalidate = 60; // cache for 60 seconds
```

---

## 11. Production-grade checklist

Work through this before going live. Items are ordered by priority.

### Critical (must have before launch)

- [ ] **Account deletion** — users must be able to delete their account and all health data (GDPR right to erasure). Add a "Delete Account" button in settings that wipes User + all related records.
- [ ] **Privacy Policy page** — required by Google OAuth, UploadThing, and any app store. Use a generator like [privacypolicygenerator.info](https://privacypolicygenerator.info) as a starting point; have a lawyer review it for HIPAA.
- [ ] **Terms of Service page** — required before any real users.
- [ ] **Business Associate Agreements (BAAs)** — for HIPAA compliance, sign BAAs with Neon, UploadThing, and your AI provider before storing real patient data. Neon and UploadThing both offer BAAs on paid plans.
- [ ] **Environment variable validation** — fail loudly at startup if required env vars are missing, not silently at request time.
- [ ] **Error boundaries** — wrap major UI sections in React error boundaries so one crash doesn't blank the whole page.
- [ ] **Rate limiting** — protect the extraction endpoint from abuse (see §10.2).

### High priority (within first week of launch)

- [ ] **Sentry error tracking** — you're blind without this. Set up in 15 minutes (see §12).
- [ ] **Uptime monitoring** — use [betteruptime.com](https://betteruptime.com) (free) to alert you if the app goes down.
- [ ] **Server-side input validation** — validate all server action inputs with Zod before they touch the database.
- [ ] **Data export** — let users download their entire health history as JSON or CSV.
- [ ] **Session expiry** — configure Auth.js to expire sessions after 30 days, not never.
- [ ] **CORS on Python backend** — restrict `Access-Control-Allow-Origin` to your domain only, not `*`.

### Important (before scaling to many users)

- [ ] **Pagination** — vault page currently loads all documents; add cursor-based pagination once users have 50+ reports.
- [ ] **Loading skeletons** — replace blank page flashes with skeleton placeholders while server components fetch data.
- [ ] **Push notifications** — medication reminders without push notifications rely on the user opening the app. Add web push (via `web-push` npm package) or a service like OneSignal.
- [ ] **Email notifications** — weekly health summary, abnormal result alerts. Use Resend (resend.com) — free tier is 3,000 emails/month, $20/mo after.
- [ ] **Audit logging** — log every access to health data (who, what, when). Required for HIPAA; also useful for debugging.
- [ ] **Soft deletes** — instead of hard-deleting records, mark them as deleted. Allows recovery from accidental deletes.

### Nice to have (polish)

- [ ] **Offline support / PWA** — add a `manifest.json` and service worker so the app installs on mobile home screens.
- [ ] **Accessibility audit** — run [wave.webaim.org](https://wave.webaim.org) on your live site. Add ARIA labels to icon-only buttons.
- [ ] **`npm audit`** — run this monthly to catch vulnerable dependencies.
- [ ] **Content Security Policy headers** — add in `next.config.js` to prevent XSS attacks.

---

## 12. Monitoring & error tracking

### 12.1 Sentry (errors)

1. Create account at [sentry.io](https://sentry.io)
2. Create a new project → choose **Next.js**
3. Install:
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```
   This auto-configures everything.
4. Add your `SENTRY_DSN` to Vercel environment variables.

Now every unhandled error in production shows up in Sentry with full stack trace, user context, and browser info.

### 12.2 Uptime monitoring (free)

1. Sign up at [betteruptime.com](https://betteruptime.com)
2. Add monitor → paste your app URL
3. Add your Python backend URL as a separate monitor
4. Set up SMS/email/Slack alerts for downtime

### 12.3 Vercel Analytics (built-in)

Enable in Vercel dashboard → **Analytics tab**. Shows real user page load times, geographic distribution, and web vitals. Free on all plans.

### 12.4 Logging (Python backend)

Add structured logging to your FastAPI app:
```python
import logging
import json

logging.basicConfig(
    level=logging.INFO,
    format='{"time": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}'
)
logger = logging.getLogger(__name__)

# In your endpoint:
logger.info(f"Extraction request received", extra={"request_id": request_id})
logger.error(f"Extraction failed", extra={"error": str(e), "request_id": request_id})
```
Railway and Render both show these logs in their dashboards.

---

## 13. Cost estimates by scale

### Tier 1: MVP / side project (< 100 users)

| Service | Plan | Monthly cost |
|---------|------|-------------|
| Vercel | Hobby (free) | $0 |
| Neon Postgres | Free (512 MB) | $0 |
| UploadThing | Free (2 GB) | $0 |
| Railway (Python) | Hobby | $5 |
| Google Gemini API | ~500 extractions @ $0.0004/img | ~$0.20 |
| Domain name | .com or .app | ~$1/mo |
| **Total** | | **~$6–10/mo** |

### Tier 2: Early product (100–1,000 users)

| Service | Plan | Monthly cost |
|---------|------|-------------|
| Vercel | Pro | $20 |
| Neon Postgres | Launch (10 GB) | $19 |
| UploadThing | Standard (100 GB) | $10 |
| Railway (Python) | Pro | $20 |
| AI API | ~5,000 extractions | ~$2–20 |
| Sentry | Team | $26 |
| **Total** | | **~$97–115/mo** |

### Tier 3: Growing product (1,000–10,000 users)

| Service | Plan | Monthly cost |
|---------|------|-------------|
| Vercel | Pro | $20 |
| Neon Postgres | Scale (50 GB) | $69 |
| UploadThing | Plus (1 TB) | $40 |
| Google Cloud Run (Python) | Auto-scale | ~$50–150 |
| AI API | ~50,000 extractions | ~$20–200 |
| Redis (job queue) | Railway | $10 |
| Sentry | Business | $80 |
| **Total** | | **~$289–569/mo** |

> **The AI API cost dominates at scale.** Mitigate it by:
> - Caching extraction results (hash the image → cache result in Redis for 24h)
> - Switching to Gemini Flash (cheapest vision model: ~$0.0004/image vs GPT-4o Vision at ~$0.01/image)
> - Self-hosting a vision model on a GPU server at $0.30–1/hr (Fly.io GPU instances)

---

## 14. Recommended launch stack

For a clean production launch with minimal DevOps:

```
Next.js        → Vercel Pro               ($20/mo)
PostgreSQL     → Neon Launch              ($19/mo)
File storage   → UploadThing Standard     ($10/mo)
Python AI      → Railway Starter          ($5/mo + compute)
AI model       → Google Gemini Flash      (~$0.0004/image)
Domain         → Namecheap .com           (~$12/yr)
Errors         → Sentry free              ($0)
Uptime         → BetterUptime free        ($0)
```

**Total: ~$55/mo** — fully managed, auto-scaling, zero servers to maintain.

### Step-by-step launch order

1. Create all accounts (§2) — 30 minutes
2. Set up Google OAuth (§4.2) — 20 minutes
3. Create Neon database, run migrations (§5) — 15 minutes
4. Set up UploadThing, copy token (§6) — 5 minutes
5. Deploy Python backend to Railway (§7) — 20 minutes
6. Deploy Next.js to Vercel, add all env vars (§8 + §9) — 20 minutes
7. Buy domain, point DNS to Vercel (§3) — 15 minutes + propagation time
8. Test the full flow end to end — 30 minutes
9. Set up Sentry and uptime monitoring (§12) — 20 minutes
10. Work through the critical checklist items (§11) — 2–4 hours

**Total time to launch: ~4–6 hours** from a working local app.
