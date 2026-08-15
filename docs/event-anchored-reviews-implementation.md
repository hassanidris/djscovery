# Event-Anchored DJ Reviews - Implementation Summary

## Overview

This document summarizes the implementation of event-anchored DJ reviews, a feature that allows users to review DJs in the context of specific events they attended, as well as traditional direct reviews.

## Implementation Status: ✅ Complete

### Phase 1: Foundation ✅
- Database schema changes (eventId, reviewType fields)
- Partial unique indexes for constraint enforcement
- Validation updates (attendance verification, review window)
- Server action updates
- API endpoint updates
- Data migration scripts

### Phase 2: UI Components ✅
- DjRatingForm with event context support
- ReviewModal with event context handling
- ProfileReviews with review type tabs
- EventDjReviews for event-specific reviews
- EventViewerContext integration
- ReviewModalContext global provider
- useReviewTypeCounts hook

### Phase 3: Integration & Testing ✅
- Comprehensive integration tests (23 tests in ratings-full-cycle.test.ts)
- Type checking and linting
- Performance monitoring hooks
- Documentation updates

## Technical Architecture

### Database Schema

```prisma
model DjRating {
  id         Int     @id @default(autoincrement())
  rating     Int     // 1-5
  review     String?
  
  userId      String
  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  djProfileId Int
  djProfile   DjProfile @relation(fields: [djProfileId], references: [id], onDelete: Cascade)
  
  // Event-anchored review support
  eventId    Int?
  event      Event?   @relation(fields: [eventId], references: [id], onDelete: Cascade)
  reviewType DjRatingType? // DIRECT, EVENT_ATTENDEE, EVENT_ORGANIZER
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([djProfileId])
  @@index([djProfileId, createdAt])
  @@index([eventId])
  @@index([reviewType])
}
```

### Review Types

1. **DIRECT** - Traditional DJ reviews without event context
2. **EVENT_ATTENDEE** - Reviews from event attendees
3. **EVENT_ORGANIZER** - Reviews from event organizers (auto-detected)

### Validation Rules

#### Field Validation
- Rating: integer between 1-5
- Review text: 30-2000 characters
- EventId: positive integer (for event reviews)
- ReviewType: DIRECT or EVENT_ATTENDEE (EVENT_ORGANIZER is auto-detected)

#### Business Rules
- DJ profile must exist and not be REJECTED
- User cannot review their own DJ profile
- For event reviews:
  - Event must exist and be COMPLETED
  - User must have attended the event
  - DJ must have performed at the event
  - Review window: 30 days from event start date
  - Review type auto-detection (organizer vs attendee)

### API Endpoints

#### GET /api/djs/[slug]/ratings
Query parameters:
- `page` - page number (default 1)
- `limit` - items per page (default 10, max 50)
- `eventId` - optional filter:
  - numeric → only event-anchored reviews for that event
  - "direct" → only direct reviews (eventId IS NULL)
  - "event" → all event-anchored reviews
  - "gig" → all gig reviews (from DjGigReview)
  - omitted → all reviews (direct + event + gig)

#### POST /api/djs/[slug]/ratings
Request body:
```json
{
  "djProfileId": 1,
  "rating": 5,
  "review": "Great performance!",
  "eventId": 10,  // optional - for event-anchored reviews
  "reviewType": "EVENT_ATTENDEE"  // optional - auto-detected if omitted
}
```

### Server Actions

#### createDjRating
```typescript
export interface CreateDjRatingInput {
  djProfileId: number;
  rating: number;
  review: string;
  eventId?: number | null;
  reviewType?: ReviewType;
}
```

### UI Components

#### DjRatingForm
- Props: `eventId`, `eventTitle`, `eventSlug`, `eventStartDate`, `eventCity`, `isOrganizer`
- Shows event context with calendar icon
- Different placeholder text for organizers vs attendees
- Displays "Direct review" label for non-event reviews

#### ReviewModal
- Handles both direct and event-anchored reviews
- Dynamic titles and descriptions
- Success state with auto-close
- Event context propagation

#### ProfileReviews
- Review type tabs (All, Direct, Events, Gigs)
- Color-coded review type badges
- Event context badges with links
- Server-side filtering with client-side fallback
- Rating distribution chart

#### EventDjReviews
- Displays event-anchored reviews for specific events
- Aggregates reviews from all performing DJs
- Shows review type badges and user information

#### EventViewerContext
- EventReviewSlot for DJ review buttons on event pages
- "Reviewed" badge for already-reviewed DJs
- Different messaging for organizers vs attendees
- Only shows for COMPLETED events

### Hooks

#### useReviewTypeCounts
- Fetches persistent counts for all review types
- Stable tab badges across page switches
- Used by ProfileReviews for accurate counts

## Data Migration

### Migration Scripts

1. **migrate-dj-rating-direct-type.ts**
   - Sets existing DjRating records to `reviewType: "DIRECT"`
   - Ensures `eventId: NULL` for all existing records
   - Idempotent - safe to run multiple times

2. **rollback-dj-rating-direct-type.ts**
   - Resets reviewType to NULL for DIRECT records
   - Preserves event-anchored reviews

3. **migrate-event-reviews-to-dj-ratings.ts**
   - Migrates EventReview records to DjRating
   - Maps review types: ATTENDEE → EVENT_ATTENDEE, GIG_OWNER → EVENT_ORGANIZER

4. **rollback-dj-rating-event-migration.ts**
   - Removes event-anchored DjRating records
   - Preserves direct DjRating records

### NPM Scripts

```bash
npm run migrate:dj-rating-direct-type              # dry-run
npm run migrate:dj-rating-direct-type:apply        # execute
npm run migrate:dj-rating-direct-type:rollback      # rollback

npm run migrate:event-reviews:check                 # check EventReview data
npm run migrate:event-reviews:apply                 # migrate EventReview → DjRating
npm run migrate:event-reviews:rollback              # rollback migration
```

## Testing

### Integration Tests
- **File**: `__tests__/integration/api/djs/ratings-full-cycle.test.ts`
- **Coverage**: 23 tests covering:
  - GET endpoint with various filters
  - POST endpoint for direct and event-anchored reviews
  - Review type auto-detection
  - Cache invalidation
  - Error handling

### Unit Tests
- **File**: `__tests__/unit/lib/dj-rating-validation.test.ts`
- **Coverage**: 30 tests covering:
  - Field validation
  - Business rule validation
  - Review type logic
  - Edge cases

### Component Tests
- **File**: `__tests__/unit/components/DjRatingForm.test.tsx`
- **Coverage**: 16 tests covering:
  - Rating selection
  - Review text validation
  - Event context display
  - Form submission

## Performance Considerations

### Database Indexes
- `DjRating_userId_djProfileId_direct_unique` - Partial index for direct reviews
- `DjRating_userId_djProfileId_eventId_event_unique` - Partial index for event reviews
- `DjRating_eventId_idx` - For event-filtered queries
- `DjRating_reviewType_idx` - For review type filtering

### Caching
- Cache keys include filter: `dj_ratings:{slug}:{page}:{limit}:{filterKey}`
- Filter key patterns: `all`, `direct`, `event`, `event:{id}`, `gig`
- Cache invalidated on POST for relevant keys

### Performance Monitoring
- API routes use `createTimer()` for performance tracking
- Monitor for slow validation, upsert, or post-submit effects
- Track cache hit rates (target >80%)

## Security

### Authentication
- All review submissions require authentication
- Unauthenticated users receive 401 error

### Authorization
- Self-review prevention
- Attendance verification for event reviews
- Review window enforcement (30 days)
- Event status validation (must be COMPLETED)

### Input Validation
- Field-level validation (rating range, review length)
- Business-rule validation (DB-backed checks)
- SQL injection prevention via Prisma ORM

## Deployment

### Pre-Deployment Checklist
1. Run database migrations
2. Apply data migration scripts
3. Run tests: `npm run test:ci`
4. Type check: `npx tsc --noEmit`
5. Lint: `npm run lint`
6. Build: `npm run build`

### Migration Execution
```bash
# 1. Sync schema
npx prisma db push --accept-data-loss

# 2. Check for duplicates
DATABASE_URL="your_db_url" psql -c "
  SELECT 'DIRECT' as review_type, \"userId\", \"djProfileId\", COUNT(*) as count
  FROM \"DjRating\"
  WHERE \"eventId\" IS NULL
  GROUP BY \"userId\", \"djProfileId\"
  HAVING COUNT(*) > 1;
"

# 3. Apply partial unique indexes
DATABASE_URL="your_db_url" npx prisma db execute --file=prisma/migrations/manual_add_dj_rating_event_support.sql

# 4. Regenerate Prisma client
npx prisma generate

# 5. Apply RLS policies
DATABASE_URL="your_db_url" npx prisma db execute --file=prisma/rls-policies.sql

# 6. Migrate existing data (if needed)
npm run migrate:dj-rating-direct-type:apply
```

### Monitoring
- POST /api/djs/[slug]/ratings performance
- GET /api/djs/[slug]/ratings cache hit rate
- Review submission error rates
- Review type distribution

### Rollback Plan
1. Code rollback: `git revert <commit-hash>`
2. Data rollback: `npm run migrate:dj-rating-direct-type:rollback`
3. Optional: Drop new indexes (harmless if kept)

## User Guide

### For Fans/Attendees
1. **Direct Reviews**: Visit DJ profile → Click "Write Review" → Submit review
2. **Event Reviews**: Attend event → Visit event page → Click "Review DJ" → Submit review with event context

### For Organizers
1. **Direct Reviews**: Same as fans
2. **Event Reviews**: Attend event → Review as organizer (auto-detected)
3. **Gig Reviews**: Complete gig → Visit gig page → Submit gig review

### Review Guidelines
- Reviews must be 30-2000 characters
- Event reviews must be submitted within 30 days of event
- You can only review DJs you've actually seen perform
- One review per DJ per event, one direct review per DJ

## Future Enhancements

### Potential Improvements
- Review editing/updating functionality
- Review reply system for DJs
- Review helpfulness voting
- Review photo attachments
- Advanced filtering (by genre, location, etc.)
- Review analytics dashboard for DJs

### Known Limitations
- Review editing not supported (must delete and resubmit)
- No review threading or replies
- Limited to 30-day review window for event reviews
- No photo/video attachments in reviews

## Support

For issues or questions:
- Check deployment guide: `docs/dj-rating-event-reviews-deployment.md`
- Review technical architecture: `docs/technical-architecture.md`
- Run tests: `npm run test:ci`
- Check logs for performance issues or errors
