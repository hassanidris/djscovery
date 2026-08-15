# Event-Anchored Reviews Phase 5: Notification Flow

## Overview
Phase 5 implements notification triggers for completed events and gigs, with deep links to dedicated review pages and spam prevention through notification tracking.

## Implementation Summary

### 5.1 Event Review Notifications
**Status**: ✅ Complete

- **Created dedicated review page**: `/events/[slug]/dj-review/page.tsx`
  - Shows all DJs from the event (owner + participants)
  - Displays review window status and remaining days
  - Shows existing reviews and allows reviewing remaining DJs
  - Includes loading state for better UX

- **Updated event completion logic**: `src/app/api/cron/complete-events/route.ts`
  - Enhanced to fetch DJ names for personalized notifications
  - Integrated notification tracking to prevent spam
  - Filters out users who have dismissed notifications
  - Includes DJ names in notification data for better messaging

- **Updated notification format**: `src/lib/notifications/format.ts`
  - Changed message to: "You attended [Event Name]. Leave a review for [DJ Names]."
  - Updated deep link to point to `/events/[slug]/dj-review`
  - Added DJ names to notification data for personalization

### 5.2 Gig Review Notifications
**Status**: ✅ Complete

- **Updated gig completion logic**: `src/lib/actions/gigs.ts`
  - Integrated notification tracking to prevent spam
  - Filters out organizers who have dismissed notifications
  - Only creates notification if not previously dismissed

- **Updated notification format**: `src/lib/notifications/format.ts`
  - Changed message to: "Your gig [Gig Name] is complete. Leave a review for [DJ Name]."
  - Updated deep link to point to `/gigs/[slug]/dj-review` (existing page)

### 5.3 Notification Tracking
**Status**: ✅ Complete

- **Database schema**: Added `ReviewNotificationTracking` model
  - Tracks which users have been notified about review opportunities
  - Supports "remind me later" functionality
  - Prevents spam by respecting dismissed notifications
  - Fields: `userId`, `targetType` (EVENT/GIG), `targetId`, `notifiedAt`, `remindedAt`, `dismissedAt`

- **Server actions**: `src/lib/actions/review-notification-tracking.ts`
  - `trackReviewNotification()` - Record that a user was notified
  - `hasBeenNotified()` - Check if user was already notified
  - `dismissReviewNotification()` - User dismisses notification
  - `remindReviewNotification()` - User requests reminder
  - `getUsersForReviewReminders()` - Get users eligible for reminders

- **UI component**: `src/components/notifications/ReviewNotificationActions.tsx`
  - "Remind me later" button
  - "Dismiss" button
  - Integrated into notification items for review notifications

- **Updated notification item**: `src/components/notifications/NotificationItem.tsx`
  - Detects review notifications (EVENT_COMPLETED, GIG_COMPLETED)
  - Shows action buttons for review notifications
  - Extracts target type and ID from notification data

## Files Created/Modified

### New Files
- `src/app/events/[slug]/dj-review/page.tsx` - Event DJ review page
- `src/app/events/[slug]/dj-review/loading.tsx` - Loading state
- `src/lib/actions/review-notification-tracking.ts` - Notification tracking actions
- `src/components/notifications/ReviewNotificationActions.tsx` - Action buttons
- `prisma/migrations/manual_add_review_notification_tracking.sql` - DB migration

### Modified Files
- `prisma/schema.prisma` - Added ReviewNotificationTracking model
- `src/app/api/cron/complete-events/route.ts` - Event completion with tracking
- `src/lib/actions/gigs.ts` - Gig completion with tracking
- `src/lib/notifications/format.ts` - Updated notification messages and links
- `src/lib/notifications/meta.ts` - Updated notification titles
- `src/components/notifications/NotificationItem.tsx` - Added action buttons

## Database Changes

### New Table: ReviewNotificationTracking
```sql
CREATE TABLE "ReviewNotificationTracking" (
    "id" SERIAL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" INTEGER NOT NULL,
    "notifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remindedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    CONSTRAINT "ReviewNotificationTracking_userId_targetType_targetId_key" UNIQUE ("userId", "targetType", "targetId"),
    CONSTRAINT "ReviewNotificationTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
```

### Indexes
- `ReviewNotificationTracking_userId_idx` on `userId`
- `ReviewNotificationTracking_targetType_targetId_idx` on `targetType, targetId`

## Notification Flow

### Event Completion Flow
1. Cron job marks event as COMPLETED
2. Auto-transitions GOING → ATTENDED for attendees
3. For each ATTENDED attendee:
   - Check if previously dismissed (skip if dismissed)
   - Create/update ReviewNotificationTracking record
   - Create EVENT_COMPLETED notification
4. Notification includes deep link to `/events/[slug]/dj-review`
5. User can:
   - Click link to go to review page
   - Click "Remind me later" to set reminder
   - Click "Dismiss" to prevent future notifications

### Gig Completion Flow
1. Organizer marks gig as COMPLETED
2. Check if organizer previously dismissed (skip if dismissed)
3. Create/update ReviewNotificationTracking record
4. Create GIG_COMPLETED notification
5. Notification includes deep link to `/gigs/[slug]/dj-review`
6. User can:
   - Click link to go to review page
   - Click "Remind me later" to set reminder
   - Click "Dismiss" to prevent future notifications

## Testing Recommendations

### Manual Testing
1. **Event Review Notifications**
   - Create an event with attendees
   - Wait for event to complete (or manually set status)
   - Verify attendees receive EVENT_COMPLETED notification
   - Click notification link - should go to `/events/[slug]/dj-review`
   - Test "Remind me later" and "Dismiss" buttons
   - Verify dismissed users don't receive new notifications

2. **Gig Review Notifications**
   - Create a gig with accepted DJ application
   - Mark gig as COMPLETED
   - Verify organizer receives GIG_COMPLETED notification
   - Click notification link - should go to `/gigs/[slug]/dj-review`
   - Test "Remind me later" and "Dismiss" buttons
   - Verify dismissed organizers don't receive new notifications

### Automated Testing
- Add tests for notification tracking actions
- Add tests for notification filtering logic
- Add tests for review page authentication and authorization
- Add E2E tests for complete notification flow

## Deployment Notes

### Pre-deployment Checklist
- [x] Database schema updated
- [x] Prisma client regenerated
- [x] Type checking passes
- [ ] Run manual migration SQL (if needed)
- [ ] Test notification flow in staging
- [ ] Verify cron job configuration

### Migration Steps
1. Run `npx prisma db push` to sync schema
2. Run manual migration SQL if needed:
   ```bash
   psql "$DATABASE_URL" -f prisma/migrations/manual_add_review_notification_tracking.sql
   ```
3. Regenerate Prisma client: `npx prisma generate`
4. Deploy code changes
5. Monitor notification delivery

### Rollback Plan
If issues arise:
1. Revert code changes
2. Remove ReviewNotificationTracking table (cascade deletes to User)
3. Remove notification tracking logic from completion flows
4. Restore previous notification format

## Next Steps

### Phase 6 Potential Enhancements
- Email notifications for review reminders
- Scheduled reminder cron jobs (e.g., 7 days before deadline)
- Analytics on notification conversion rates
- A/B testing notification messaging
- Bulk dismissal for multiple notifications

### Monitoring
- Track notification delivery rates
- Monitor review page conversion from notifications
- Track "remind me later" vs "dismiss" ratios
- Alert on notification delivery failures

---

**Phase 5 Status**: ✅ Complete
**Branch**: `feature/event-anchored-dj-reviews-phase-5`
**Last Updated**: 2026-08-15
**Next Steps**: Testing and deployment preparation
