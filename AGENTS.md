# AGENTS.md — Djscovery Project Guide

## Project Overview

Djscovery is a Next.js 15 platform connecting DJs, organizers, and fans. Features include DJ profiles, event management, venue reviews, and a reputation system.

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19, Server Components)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Auth**: Supabase Auth
- **Cache**: Upstash Redis
- **Email**: Custom email service (`src/lib/email/`)
- **UI**: Tailwind CSS, shadcn/ui components
- **Testing**: Vitest + Testing Library (unit/integration), Playwright (e2e)
- **Linting**: ESLint + Prettier

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server

# Code Quality
npx tsc --noEmit         # Typecheck
npm run lint             # ESLint

# Testing
npm run test             # Vitest (watch mode)
npm run test:ci          # Vitest (single run, for CI)
npm run test:coverage    # Vitest with coverage
npm run e2e              # Playwright e2e tests

# Database
npx prisma db push       # Sync schema to DB
npx prisma generate      # Regenerate Prisma client
npx prisma studio        # DB GUI

# Data Migration Scripts
npm run migrate:event-reviews:check    # Check EventReview data (dry run)
npm run migrate:event-reviews:apply    # Migrate EventReview → DjRating
npm run migrate:event-reviews:rollback # Roll back migration
```

## Code Conventions

- **Server Components** by default; `"use client"` only when needed (hooks, event handlers)
- **Server Actions** in `src/lib/actions/` for mutations
- **API Routes** in `src/app/api/` for REST endpoints
- **Validation** centralized in `src/lib/validation/` — shared between server actions and API routes
- **Error handling**: Use `ActionResult<T>` pattern (`{ success, data, error }`) for server actions
- **Caching**: Use `cacheGet`/`cacheSet`/`cacheDelete` from `src/lib/cache/` with key pattern `entity:identifier:page:limit:filter`
- **Performance**: Use `createTimer()` from `src/lib/utils/performance.ts` in API routes
- **No emojis** in code or comments unless explicitly requested
- **Comments**: Don't add/remove comments unless asked; preserve existing comments during edits

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   ├── djs/[slug]/         # DJ profile pages
│   ├── events/[slug]/      # Event pages
│   └── layout.tsx          # Root layout (includes ReviewModalProvider)
├── components/
│   ├── dj-profile/         # DJ profile components
│   ├── events/             # Event components
│   ├── reputation/         # Review modal system
│   └── ui/                 # shadcn/ui primitives
├── hooks/                  # React hooks
├── lib/
│   ├── actions/            # Server actions
│   ├── validation/         # Shared validation logic
│   ├── cache/              # Redis caching
│   ├── client.ts           # Prisma client
│   └── supabase/           # Supabase clients
└── hooks/                  # Custom React hooks

__tests__/
├── unit/                   # Unit tests (Vitest)
├── integration/            # Integration tests (Vitest)
└── setup.ts                # Test setup

e2e/                        # Playwright e2e tests
docs/                       # Documentation
prisma/                     # Schema, migrations, seeds
scripts/                    # Utility scripts
```

## Key Patterns

### Validation (DjRating example)

Validation is split into two phases to avoid DB access on invalid input:
1. `validateFields()` — pure field validation (rating range, review length, type consistency)
2. `validateBusinessRules()` — DB-backed checks (auth, attendance, event status, review window)

Both are in `src/lib/validation/dj-rating-validation.ts` and used by both the API route and server action.

### Upsert with Race Condition Protection

`upsertDjRating()` in the validation module handles concurrent submissions by catching P2002 (unique constraint violation) and retrying as an update.

### Review Modal System

- `ReviewModalContext.tsx` — Context provider (in root layout)
- `ReviewModal.tsx` — Dialog wrapper
- `DjRatingForm.tsx` — Form content
- `useReviewModal()` hook — Opens modal from any component

## Database Notes

- Partial unique indexes (e.g., `WHERE "eventId" IS NULL`) are created via raw SQL, not Prisma schema
- Prisma doesn't expose compound unique names for partial indexes — use `findFirst()` instead of `findUnique()`
- RLS policies are in `prisma/rls-policies.sql` — run after schema changes

## Deployment

See `docs/dj-rating-event-reviews-deployment.md` for the full deployment guide including:
- Pre-deployment checklist
- Migration execution plan
- Monitoring setup
- Rollback procedures
