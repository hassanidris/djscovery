# DjRating Event-Anchored Reviews — Deployment Guide

## Overview

This feature unifies the DjRating system to support both **direct reviews** (eventId=null) and **event-anchored reviews** (eventId set), with a `reviewType` enum (`DIRECT`, `EVENT_ATTENDEE`, `EVENT_ORGANIZER`), plus a review modal UI accessible from DJ profiles and event pages.

## Pre-Deployment Checklist

### 1. Database Changes

The schema changes are already applied via `prisma db push` and the manual SQL migration. On a fresh deployment or production, run:

**IMPORTANT:** Steps 1 and 3 must be executed back-to-back during a maintenance window or with user-facing traffic disabled. The old unique constraint is dropped in step 1 and replaced with partial unique indexes in step 3 — between these steps, the constraint is unprotected and duplicate entries could be created if traffic is active.

```bash
# 1. Sync schema (adds eventId, reviewType, indexes, drops old unique constraint)
npx prisma db push --accept-data-loss

# 2. Check for existing duplicates in DjRating before creating replacement indexes
# Run this immediately after step 1, before step 3
# If duplicates exist, resolve them manually before proceeding
DATABASE_URL="your_db_url" psql -c "
  SELECT \"userId\", \"djProfileId\", COUNT(*) as count
  FROM \"DjRating\"
  GROUP BY \"userId\", \"djProfileId\"
  HAVING COUNT(*) > 1;
"

# 3. Apply partial unique indexes (cannot be done via Prisma schema)
# Run this immediately after step 2, without delay
DATABASE_URL="your_db_url" npx prisma db execute --file=prisma/migrations/manual_add_dj_rating_event_support.sql

# 4. Regenerate Prisma client
npx prisma generate

# 5. Apply RLS policies (updated with clarifying comments)
DATABASE_URL="your_db_url" npx prisma db execute --file=prisma/rls-policies.sql
```

**Verify:**

```sql
-- Check enum exists
SELECT 1 FROM pg_type WHERE typname = 'DjRatingType';

-- Check partial unique indexes exist
SELECT indexname FROM pg_indexes WHERE tablename = 'DjRating' AND indexname LIKE '%unique%';

-- Check columns exist
SELECT column_name FROM information_schema.columns WHERE table_name = 'DjRating' AND column_name IN ('eventId', 'reviewType');
```

### 2. Data Migration (if upgrading from EventReview system)

If the database has existing `EventReview` records, migrate them to `DjRating`:

```bash
# Dry run first (safe, no changes)
npm run migrate:event-reviews:check

# Apply migration
npm run migrate:event-reviews:apply

# Verify
npm run migrate:event-reviews:check  # should show 0 EventReview records remaining
```

The migration is **idempotent** — running it multiple times is safe.

### 3. Build Verification

```bash
# Typecheck
npx tsc --noEmit

# Lint
npm run lint

# Unit tests
npm run test:ci

# Build
npm run build
```

### 4. Manual Testing

- [ ] DJ profile page: "Write Review" button opens modal
- [ ] Modal: star rating selection works
- [ ] Modal: review text validation (30-2000 chars)
- [ ] Modal: direct review submission succeeds
- [ ] Modal: event-anchored review submission (from event page) succeeds
- [ ] DJ profile: review type tabs appear when both types exist
- [ ] DJ profile: event context badge links to event page
- [ ] Event page: "Review DJ" buttons appear for attended events
- [ ] Event page: event-anchored reviews display publicly
- [ ] Already-reviewed DJs show "Reviewed" badge
- [ ] Self-review prevention works
- [ ] Review window (30 days) enforcement works

## Environment Variables

No new environment variables required. The feature uses existing:

- `DATABASE_URL` — PostgreSQL connection
- `NEXT_PUBLIC_SITE_URL` — For email links
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — For caching

## Monitoring

### Key Metrics to Monitor

1. **POST /api/djs/[slug]/ratings Performance**
   - The POST handler now has performance timing via `createTimer("ratings_post")`
   - Watch for slow `validate_rules` (>500ms) — indicates DB query issues
   - Watch for slow `upsert` — indicates contention on partial indexes
   - Watch for slow `post_effects` — email/notification/reputation overhead

2. **GET /api/djs/[slug]/ratings Performance**
   - Existing timing via `createTimer("ratings")`
   - Monitor `fetch_ratings` with event filter — should use `DjRating_eventId_idx`
   - Cache hit rate should remain high (>80%)

3. **Review Submission Error Rate**
   - 401 errors — expected for unauthenticated users
   - 400 errors — malformed input (should be rare)
   - 403 errors — business rule violations (self-review, not attended, expired window)
   - 500 errors — unexpected, investigate immediately

4. **Cache Effectiveness**
   - Cache keys now include `eventId` filter: `dj_ratings:{slug}:{page}:{limit}:{filterKey}`
   - Monitor cache hit rate for event-filtered queries
   - Cache is invalidated on POST for `all`, `direct`, and `event:{id}` keys

### Logging

The following events are already logged via `console.error`:

- Reputation update failures
- Notification creation failures
- Email sending failures

These are non-fatal — the review is still created even if side effects fail. Monitor logs for:

- Spike in "Reputation update failed" — indicates reputation calculation issue
- Spike in "Failed to create rating notification" — indicates notification table issue
- Spike in "Failed to send review email" — indicates email service issue

### Alerts to Set Up

- POST /api/djs/[slug]/ratings 500 error rate > 1%
- POST response time p95 > 2000ms
- GET with eventId filter response time p95 > 1000ms
- Cache hit rate < 70% for ratings queries

## Post-Deployment Tasks

1. **Monitor for 24-48 hours**
   - Watch for errors in Vercel logs
   - Check API response times
   - Monitor cache hit rates

2. **Verify data integrity**

   ```sql
   -- Check for reviews with inconsistent reviewType/eventId
   SELECT COUNT(*) FROM "DjRating"
   WHERE "reviewType" = 'DIRECT' AND "eventId" IS NOT NULL;

   SELECT COUNT(*) FROM "DjRating"
   WHERE "reviewType" IN ('EVENT_ATTENDEE', 'EVENT_ORGANIZER') AND "eventId" IS NULL;

   -- Both should return 0
   ```

3. **Gather user feedback**
   - Is the modal intuitive?
   - Do event-anchored reviews display correctly?
   - Are review type tabs useful?

## Rollback Plan

### Option 1: Code Rollback (keeps DB changes)

If the UI/API has issues but the DB schema is fine:

1. Revert to previous commit: `git revert <commit-hash>`
2. Redeploy to Vercel
3. The old code will still work — it ignores `eventId`/`reviewType` columns

### Option 2: Full Rollback (reverts DB changes)

If the DB schema causes issues:

1. **Revert code**: `git revert <commit-hash>` and redeploy
2. **Roll back migration data**: `npm run migrate:event-reviews:rollback -- --apply`
   - This deletes event-anchored DjRatings and preserves direct ones
3. **Drop new indexes** (optional, they're harmless):
   ```sql
   DROP INDEX IF EXISTS "DjRating_userId_djProfileId_direct_unique";
   DROP INDEX IF EXISTS "DjRating_userId_djProfileId_eventId_event_unique";
   DROP INDEX IF EXISTS "DjRating_eventId_idx";
   DROP INDEX IF EXISTS "DjRating_reviewType_idx";
   ```
4. **Re-add old unique constraint** (if needed by old code):
   ```sql
   ALTER TABLE "DjRating" ADD CONSTRAINT "DjRating_userId_djProfileId_key"
     UNIQUE ("userId", "djProfileId");
   ```

### Option 3: Disable event reviews only

If only event-anchored reviews have issues:

1. The UI already guards with `status === "COMPLETED"` and `hasAttended` checks
2. To fully disable, add a feature flag check in `validateBusinessRules`:
   ```typescript
   if (process.env.DISABLE_EVENT_REVIEWS === "true" && ctx.isEventReview) {
     return { ok: false, error: "Event reviews are temporarily disabled" };
   }
   ```

## Files Changed Summary

### Schema & Migration

- `prisma/schema.prisma` — DjRatingType enum, eventId, reviewType, indexes
- `prisma/migrations/manual_add_dj_rating_event_support.sql` — Partial unique indexes
- `prisma/rls-policies.sql` — Clarifying comments

### Scripts

- `scripts/migrate-event-reviews-to-dj-ratings.ts` — Data migration
- `scripts/rollback-dj-rating-event-migration.ts` — Rollback
- `scripts/check-event-review-data.ts` — Pre-migration analysis

### API & Validation

- `src/app/api/djs/[slug]/ratings/route.ts` — GET + POST with event filtering
- `src/app/api/events/[eventId]/viewer-context/route.ts` — Checks DjRating instead of EventReview
- `src/lib/validation/dj-rating-validation.ts` — Shared validation (NEW)
- `src/lib/actions/dj-ratings.ts` — Server action (NEW)

### UI Components

- `src/components/reputation/DjRatingForm.tsx` — Form (NEW)
- `src/components/reputation/ReviewModal.tsx` — Modal wrapper (NEW)
- `src/components/reputation/ReviewModalContext.tsx` — Context provider (NEW)
- `src/components/dj-profile/ProfileReviews.tsx` — Enhanced with tabs, badges, write button
- `src/components/dj-profile/dj-profile-shared.tsx` — ReviewItem type updated
- `src/components/dj-profile/DjProfilePremium.tsx` — Passes new props
- `src/components/dj-profile/DjProfileFree.tsx` — Passes new props
- `src/components/events/EventViewerContext.tsx` — Modal-based review buttons
- `src/components/events/EventDjReviews.tsx` — Event review display (NEW)
- `src/app/events/[slug]/page.tsx` — Passes event context, shows reviews
- `src/app/layout.tsx` — ReviewModalProvider wrapper

### Hooks

- `src/hooks/usePaginatedRatings.ts` — Event filter support

### Tests

- `__tests__/unit/lib/dj-rating-validation.test.ts` — 30 tests
- `__tests__/unit/hooks/usePaginatedRatings.test.ts` — 10 tests
- `__tests__/unit/components/DjRatingForm.test.tsx` — 16 tests

### Documentation

- `docs/dj-profile-spec.md` — Updated DjRating section
- `docs/dj-rating-event-reviews-deployment.md` — This file
