# DJscovery — Safe Environment Workflow

> Complete guide for development, staging, and production setup.
> Solo-founder MVP. Keep it simple, keep it safe.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Supabase Projects](#2-supabase-projects)
3. [GitHub Branch Strategy](#3-github-branch-strategy)
4. [Environment Variables](#4-environment-variables)
5. [Vercel Environments](#5-vercel-environments)
6. [Demo Content Architecture](#6-demo-content-architecture)
7. [Database Migrations](#7-database-migrations)
8. [Seed Script Rules](#8-seed-script-rules)
9. [Row Level Security (RLS)](#9-row-level-security-rls)
10. [Collaboration Rules](#10-collaboration-rules)
11. [Production Release Workflow](#11-production-release-workflow)
12. [Security Rules — Never Break These](#12-security-rules--never-break-these)

---

## 1. Architecture Overview

```
Local machine  ──────────────────────────── djscovery-staging Supabase
                                             (jarmybsjvztwrmsdcnje)
Vercel Preview (feature branches)  ──────── djscovery-staging Supabase
Vercel Staging (dev branch)  ────────────── djscovery-staging Supabase

Vercel Production (main branch)  ────────── djscovery-prod Supabase
                                             (unrqebwfdfumpjgvavbk)
```

**Rule: staging never touches prod. Prod never receives demo content.**

---

## 2. Supabase Projects

| Project | ID | Purpose |
|---|---|---|
| `djscovery-staging` | `jarmybsjvztwrmsdcnje` | Dev, testing, demo content |
| `djscovery-prod` | `unrqebwfdfumpjgvavbk` | Real users, production only |

### What must match between both projects
- Database schema (run Prisma migrations on both)
- RLS policies (apply `docs/rls-policies.sql` to both)
- Auth settings (email templates, redirect URLs, providers)
- Storage bucket structure (`djscovery-media`)
- Webhook configuration (different secrets, same endpoint pattern)

### What is different between projects
- Data (staging has test/fake users, prod has real users)
- Webhook secret (each project has its own)
- Database password (rotated independently)

---

## 3. GitHub Branch Strategy

```
main          Production — only receives merges from dev (or hotfix/*)
dev           Staging — active development branch
feature/*     New features — branch from dev, PR back to dev
fix/*         Bug fixes — branch from dev, PR back to dev
hotfix/*      Urgent production fix — branch from main, PR to main + dev
```

### Day-to-day flow

```bash
# Start new feature
git checkout dev
git pull origin dev
git checkout -b feature/my-feature

# Work, commit, push
git push origin feature/my-feature

# Open PR → dev (not main)
# After review → merge to dev → auto-deploys to Vercel staging
```

### Urgent production fix

```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# Fix the issue
git push origin hotfix/critical-bug-fix

# PR → main (deploy to prod immediately)
# Then also PR → dev (keep branches in sync)
```

---

## 4. Environment Variables

### Local development — `.env.local`

Always points to staging. Never modify to use prod credentials locally.

```bash
NEXT_PUBLIC_APP_ENV=staging
DATABASE_URL=                         # staging Supabase pooled connection
NEXT_PUBLIC_SUPABASE_URL=             # https://jarmybsjvztwrmsdcnje.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY= # staging anon/public key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
SUPABASE_WEBHOOK_SECRET=              # staging webhook secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Reference — `.env.example`

Always keep `.env.example` up to date. New developers copy it to `.env.local` and fill in staging credentials.

### Running migrations against prod locally

Use inline DATABASE_URL — never change `.env.local`:

```bash
DATABASE_URL='prod-direct-url' npx prisma migrate deploy
```

The prod direct URL is found in:
`djscovery-prod → Project Settings → Database → Connection string → Direct connection`

---

## 5. Vercel Environments

### Production (main branch)

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_APP_ENV` | `production` |
| `DATABASE_URL` | prod transaction pooler URL |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://unrqebwfdfumpjgvavbk.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | prod anon key |
| `NEXT_PUBLIC_BASE_URL` | `https://djscovery.vercel.app` |
| `SUPABASE_WEBHOOK_SECRET` | prod webhook secret |

### Preview + Development (all other branches)

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_APP_ENV` | `staging` |
| `DATABASE_URL` | staging transaction pooler URL |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jarmybsjvztwrmsdcnje.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | staging anon key |
| `NEXT_PUBLIC_BASE_URL` | `https://djscovery.vercel.app` |
| `SUPABASE_WEBHOOK_SECRET` | staging webhook secret |

### Cloudinary (all environments — same account)

| Variable | Scope |
|---|---|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | All Environments |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | All Environments |
| `CLOUDINARY_API_SECRET` | Production+Preview (Sensitive) + Development (separate) |

---

## 6. Demo Content Architecture

### How it works

Demo DJs live in JSON files — they are **never inserted into any database**.

```
src/data/djscovery_seed_1.json   (15 demo DJs)
src/data/djscovery_seed_2.json   (15 demo DJs)
src/data/djs.ts                  (combines both files)
```

### Directory page merge logic

Controlled by `NEXT_PUBLIC_APP_ENV` in `src/app/directory/page.tsx`:

```ts
const isStaging = process.env.NEXT_PUBLIC_APP_ENV !== 'production';

// Staging: DB DJs + demo DJs merged, deduped by ID
// Production: real DB DJs only
```

| Environment | Directory shows |
|---|---|
| Local dev / Vercel Preview | Demo DJs + staging DB DJs together |
| Vercel Production | Real DB DJs only — no demo content |

### To disable demo content in staging

Set `NEXT_PUBLIC_APP_ENV=production` in your local `.env.local` temporarily.

---

## 7. Database Migrations

### Normal migration workflow (staging)

```bash
# Create a new migration after editing schema.prisma
npx prisma migrate dev --name describe-the-change

# Migrations auto-apply to staging DB via DATABASE_URL in .env.local
```

### Deploying migrations to production

```bash
# Use the prod direct connection (not pooler) for migrations
DATABASE_URL='postgresql://postgres:PASSWORD@db.unrqebwfdfumpjgvavbk.supabase.co:5432/postgres' \
  npx prisma migrate deploy
```

**The direct URL is found in:** `djscovery-prod → Project Settings → Database → Connection string → Direct connection`

### Baselining a fresh prod database

If you ever need to reset prod schema (should be rare):

```bash
# 1. Push current schema directly
DATABASE_URL='...' npx prisma db push --force-reset --accept-data-loss

# 2. Mark all migrations as applied
DATABASE_URL='...' npx prisma migrate resolve --applied MIGRATION_NAME
```

---

## 8. Seed Script Rules

The seed script (`prisma/seed.ts`) seeds **reference data only**: genres, countries, cities.

### Normal seed (staging)

```bash
npm run seed
# Uses DATABASE_URL from .env.local (staging) — safe
```

### Production seed (reference data only)

```bash
DATABASE_URL='prod-transaction-pooler-url' \
  NEXT_PUBLIC_APP_ENV=production \
  FORCE_SEED=true \
  npm run seed
```

### Rules

- `npm run seed` is blocked if `NEXT_PUBLIC_APP_ENV=production` without `FORCE_SEED=true`
- Demo DJs are **never** in the seed script — JSON files only
- Never add fake users, fake posts, or fake bookings to the seed script

---

## 9. Row Level Security (RLS)

Apply `docs/rls-policies.sql` to both Supabase projects via SQL Editor.

### Key principle

Prisma uses the postgres/service role and **bypasses RLS entirely**. The app continues to work regardless of RLS policies. RLS only protects against direct REST API abuse using the public anon key.

### Policy summary

| Tables | Access |
|---|---|
| `Country`, `City`, `Genre` | Public read |
| `DjProfile` (APPROVED) | Public read, owner write |
| `Post`, `PostComment`, `DjRating` | Public read, authenticated write |
| `User`, `UserRole`, `Notification` | Owner only |
| `JobApplication`, `Conversation`, `Message` | Participants only |
| `Hire` | No API access — Prisma only |

---

## 10. Collaboration Rules

### Regular collaborators (long-term)

1. Create a GitHub account invite to the repo
2. They branch from `dev`, open PRs back to `dev`
3. Share staging credentials only (`.env.local` with staging values)
4. Never share production credentials with collaborators
5. They never push directly to `main` or `dev`

### One-time helpers (short-term)

1. Create a temporary Supabase staging account if needed
2. Share `.env.local` with staging credentials only
3. Revoke access when work is done
4. Rotate staging webhook secret after they finish

### What to share

| Item | Share with collaborators? |
|---|---|
| Staging `DATABASE_URL` | ✅ Yes |
| Staging `NEXT_PUBLIC_SUPABASE_*` | ✅ Yes |
| Staging `SUPABASE_WEBHOOK_SECRET` | ✅ Yes |
| `CLOUDINARY_API_SECRET` | ✅ Yes (same account) |
| Production credentials of any kind | ❌ Never |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ Never (not even staging) |

---

## 11. Production Release Workflow

### Standard release (feature → staging → production)

```
1. Feature branches merged into dev
2. Test on Vercel staging preview
3. When ready: open PR from dev → main
4. Review the PR diff carefully
5. Merge → Vercel auto-deploys to production
6. Verify production deployment
7. Run any pending migrations against prod DB if schema changed
```

### Pre-release checklist

Before merging `dev` → `main`:

- [ ] All features tested on Vercel staging
- [ ] No console errors in staging preview
- [ ] Auth flow works (sign up, sign in, sign out)
- [ ] Directory page shows real DJs only (set `NEXT_PUBLIC_APP_ENV=production` locally to test)
- [ ] Schema migrations written and tested on staging
- [ ] `.env.example` is up to date
- [ ] No staging credentials in code or commits

### Post-release checklist

After merging to main and deploying:

- [ ] Verify `https://djscovery.vercel.app` loads correctly
- [ ] Run pending Prisma migrations against prod if schema changed
- [ ] Check Vercel function logs for errors
- [ ] Verify auth webhook is firing correctly in Supabase prod logs

### Rollback

If production breaks after a merge:

```bash
# Option 1: Revert the merge commit
git revert -m 1 <merge-commit-hash>
git push origin main

# Option 2: Redeploy a previous Vercel deployment
# Vercel Dashboard → Deployments → find last good deploy → Redeploy
```

---

## 12. Security Rules — Never Break These

1. **Never commit `.env.local`** — it is gitignored, keep it that way
2. **Never share production credentials** — not in Slack, not in chat, not in email
3. **Never use production DATABASE_URL in `.env.local`** — local always = staging
4. **Never expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend** — server-only, always
5. **Never push directly to `main`** — always PR, even as a solo founder
6. **Rotate credentials if accidentally shared** — even in a private chat
7. **Never seed fake/demo data into production** — JSON files only for demo content
8. **Never run `prisma db push --force-reset` against prod** — destroys all data
9. **Apply RLS policies to both projects** — re-apply after adding new tables
10. **Update `.env.example`** when adding new environment variables

---

*Last updated: June 2026*
*Setup completed with: Next.js 15, Supabase Auth, Prisma v7, Vercel, Cloudinary*
