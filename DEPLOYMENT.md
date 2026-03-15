# HealthLedger — Deployment & Cost Guide

## Stack recap

| Layer | Technology |
|-------|-----------|
| Frontend + API routes | Next.js 16 (App Router) |
| AI engine | Python / FastAPI (`/api/extract`, `/api/chat`) |
| Database | PostgreSQL via Prisma |
| File storage | UploadThing |
| Auth | Auth.js (Google / GitHub OAuth) |

---

## 1. Deploy the Next.js app

### Recommended: Vercel (zero-config, made for Next.js)

1. Push your repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → Import project → select your repo.
3. Set all environment variables (see §5 below).
4. Deploy. Done. Vercel auto-detects Next.js and handles everything.

**Why Vercel:**
- Free tier covers ~100 GB bandwidth/month and 100k function invocations.
- Automatic SSL, CDN edge caching, preview URLs per branch.
- No server to manage.

**Alternatives if you outgrow Vercel free tier:**

| Platform | Notes |
|----------|-------|
| **Railway** | $5/mo hobby plan, simple Docker deploys, good for monorepos |
| **Render** | Free tier (cold starts), $7/mo for always-on |
| **Fly.io** | $0 for small apps, great global edge distribution |

> For a production app with real users, Vercel Pro at **$20/mo** is the cleanest path — no cold starts, better analytics, team collaboration.

---

## 2. PostgreSQL database

### Recommended: Neon (serverless Postgres)

[neon.tech](https://neon.tech) — purpose-built serverless Postgres, integrates perfectly with Prisma.

| Plan | Storage | Price |
|------|---------|-------|
| Free | 512 MB, 1 project | $0 |
| Launch | 10 GB | $19/mo |
| Scale | 50 GB | $69/mo |

**Setup:**
```bash
# After creating a Neon project, copy the connection string
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require"

# Run migrations against production
npx prisma migrate deploy
```

**Key feature for scaling:** Neon has built-in connection pooling (PgBouncer) via a separate pooled connection string — critical once you have concurrent users. Use the pooled URL (`?pgbouncer=true`) in production.

### Alternative: Supabase
- Free: 500 MB database + built-in auth, storage, realtime
- Pro: $25/mo for 8 GB
- Good if you want a dashboard/admin UI out of the box

### Alternative: Railway Postgres
- $5/mo base + $0.000231/GB/hr storage
- Great if you're already running the Python backend on Railway (same bill)

---

## 3. UploadThing (file storage)

[uploadthing.com/pricing](https://uploadthing.com/pricing)

| Plan | Storage | Bandwidth | Price |
|------|---------|-----------|-------|
| Free | 2 GB | 2 GB/mo | $0 |
| Standard | 100 GB | 100 GB/mo | $10/mo |
| Plus | 1 TB | 500 GB/mo | $40/mo |

**Your usage context:**
- Each lab report after PDF-to-image conversion is roughly **0.5–2 MB**.
- At 100 uploads/month → ~200 MB/month storage used.
- At 1,000 uploads/month → ~2 GB/month → Standard plan needed.

**Important:** With the current deferred-upload fix, files only hit UploadThing when the user clicks "Save to Vault" — meaning abandoned extractions cost $0 in storage.

**Cost formula:**
```
Monthly storage cost ≈ (avg users × avg uploads/user/month × avg file size MB) / 1024 GB
```

For 500 users uploading 3 reports/month at 1 MB each:
→ 500 × 3 × 1 MB = 1.5 GB/month → Free plan covers this.

---

## 4. Python AI engine (the extraction & chat backend)

This is the most important decision. Your FastAPI server handles the heavy lifting — it receives images and returns extracted biomarkers using a vision AI model (Gemini / OpenAI GPT-4o / etc.).

### Option A: Railway (recommended for starting out)

[railway.app](https://railway.app)

- Deploy from GitHub or a `Dockerfile`.
- CPU-only instance, good for API calls that forward to OpenAI/Gemini.
- Costs: **$5/mo** hobby plan + usage-based compute.

```dockerfile
# Dockerfile for your Python backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Set `NEXT_PUBLIC_BACKEND_URL=https://your-python-app.railway.app` in your Next.js env.

### Option B: Render

- Free tier has cold starts (30s delay after inactivity).
- **$7/mo** for always-on (Starter).
- Good option if you want to keep costs minimal early on.

### Option C: Fly.io

- Deploy containers globally close to your users.
- Free tier: 3 shared CPU VMs.
- Better latency for a global user base.

### Option D: Modal (best for AI/GPU workloads)

[modal.com](https://modal.com) — serverless Python functions, scale to zero.

- Pay per millisecond of compute.
- GPU access if you run a local model instead of calling an API.
- Perfect if your AI engine is just calling OpenAI/Gemini (lightweight).
- **~$0.0001/invocation** for CPU functions at typical extraction times.
- At 1,000 extractions/month → **< $1/month**.

### Option E: AWS Lambda / Google Cloud Run

- Scale to zero, pay per request.
- More setup (Docker + CI/CD), but cheapest at scale.
- Google Cloud Run has a generous free tier (2M requests/month).

**Recommendation by stage:**

| Users | Where to run Python |
|-------|-------------------|
| 0–100 | Render free tier or Modal |
| 100–1,000 | Railway Starter ($5/mo) or Render Starter ($7/mo) |
| 1,000–10,000 | Google Cloud Run or Fly.io (auto-scale) |
| 10,000+ | Kubernetes (EKS/GKE) or AWS ECS with autoscaling |

---

## 5. Environment variables for production

Set all of these in your deployment platform (Vercel dashboard → Settings → Environment Variables):

```env
# Database
DATABASE_URL="postgresql://..."            # Neon pooled connection string

# Auth.js
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate with: openssl rand -base64 32"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# UploadThing
UPLOADTHING_TOKEN="..."

# Python backend
NEXT_PUBLIC_BACKEND_URL="https://your-python-api.railway.app"

# AI provider (used in Python backend, not Next.js)
OPENAI_API_KEY="..."   # or GOOGLE_AI_API_KEY for Gemini
```

---

## 6. Handling multiple users & scalability

### Database connection pooling (critical)

Next.js serverless functions open a new DB connection per request. Without pooling, Postgres will hit its connection limit quickly.

**Fix — use Neon's pooled connection string:**
```env
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.neon.tech/neondb?pgbouncer=true&connection_limit=1"
```

In `lib/prisma.ts`, use the singleton pattern already in place — this is correct for serverless.

### Rate limiting the AI extraction endpoint

Each extraction call hits your Python backend AND your AI API (OpenAI/Gemini). Without limits, one user could run up a huge bill.

Add rate limiting to your Python FastAPI backend:
```python
# Using slowapi (FastAPI rate limiter)
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/extract")
@limiter.limit("10/minute")  # 10 extractions per minute per IP
async def extract(request: Request, file: UploadFile):
    ...
```

Or add middleware in Next.js API routes to check authenticated user and cap daily usage.

### Stateless Next.js (already scalable)

Your Next.js app is already stateless — all state is in Postgres and session cookies. This means:
- Vercel/Railway can spin up multiple instances automatically.
- No sticky sessions needed.
- Works out of the box with any platform that auto-scales.

### Python backend scalability

The Python backend is the bottleneck because AI extraction is slow (2–10 seconds per call). To handle concurrent users:

1. **Use async FastAPI** — already handles concurrent requests without blocking.
2. **Queue heavy jobs** — for high load, use a task queue (Celery + Redis or Modal's job queue). Client polls for result instead of waiting.
3. **Cache repeated extractions** — hash the uploaded image; if the same file is uploaded again, return cached results.

### CDN for static assets

Vercel automatically serves static assets from their global CDN. If self-hosting, put Cloudflare in front (free plan) — it caches pages, compresses assets, and provides DDoS protection.

---

## 7. Full cost estimate by scale

### Tier 1: Side project / MVP (< 100 users)

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby (free) | $0 |
| Neon Postgres | Free (512 MB) | $0 |
| UploadThing | Free (2 GB) | $0 |
| Railway (Python) | Hobby | $5 |
| OpenAI/Gemini API | ~500 extractions | ~$2–5 |
| **Total** | | **~$7–10/mo** |

### Tier 2: Early product (100–1,000 users)

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Pro | $20 |
| Neon Postgres | Launch (10 GB) | $19 |
| UploadThing | Standard (100 GB) | $10 |
| Railway (Python) | Pro | $20 |
| OpenAI/Gemini API | ~5,000 extractions | ~$20–50 |
| **Total** | | **~$70–120/mo** |

### Tier 3: Growing product (1,000–10,000 users)

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Pro | $20 |
| Neon Postgres | Scale (50 GB) | $69 |
| UploadThing | Plus (1 TB) | $40 |
| Google Cloud Run (Python) | Auto-scale | ~$50–100 |
| OpenAI/Gemini API | ~50,000 extractions | ~$200–500 |
| **Total** | | **~$380–730/mo** |

> The AI API cost dominates at scale. To reduce it: cache results, batch requests, or switch to a self-hosted model (Llama 3 via Ollama on a GPU server).

---

## 8. Recommended launch stack

For a clean, low-friction launch:

```
Next.js → Vercel (Pro, $20/mo)
Postgres → Neon Launch ($19/mo)
Files → UploadThing Standard ($10/mo)
Python AI → Railway Starter ($5/mo + usage)
AI API → Google Gemini Flash (cheapest vision model, ~$0.0004/image)
```

**Total: ~$54/mo** — production-grade, auto-scaling, zero DevOps overhead.

Upgrade individual pieces as you grow. The bottleneck will almost always be AI API costs, not infrastructure.
