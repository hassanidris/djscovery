-- One-time RLS policy setup for the DJcovery staging database.
-- Run with: DATABASE_URL="..." npx prisma db execute --file=prisma/rls-policies.sql
-- Policies are idempotent (DROP IF EXISTS before CREATE).

-- EventReview: public read, owner can write
ALTER TABLE "EventReview" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read event reviews" ON "EventReview";
CREATE POLICY "Public read event reviews" ON "EventReview" FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "User can create own event review" ON "EventReview";
CREATE POLICY "User can create own event review" ON "EventReview" FOR INSERT TO public WITH CHECK ((auth.uid())::text = "userId");
DROP POLICY IF EXISTS "User can update own event review" ON "EventReview";
CREATE POLICY "User can update own event review" ON "EventReview" FOR UPDATE TO public USING ((auth.uid())::text = "userId");
DROP POLICY IF EXISTS "User can delete own event review" ON "EventReview";
CREATE POLICY "User can delete own event review" ON "EventReview" FOR DELETE TO public USING ((auth.uid())::text = "userId");

-- GigReview: public read, organizer can write
ALTER TABLE "GigReview" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read gig reviews" ON "GigReview";
CREATE POLICY "Public read gig reviews" ON "GigReview" FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Organizer can create own gig review" ON "GigReview";
CREATE POLICY "Organizer can create own gig review" ON "GigReview" FOR INSERT TO public WITH CHECK ((auth.uid())::text = "organizerId");
DROP POLICY IF EXISTS "Organizer can update own gig review" ON "GigReview";
CREATE POLICY "Organizer can update own gig review" ON "GigReview" FOR UPDATE TO public USING ((auth.uid())::text = "organizerId");
DROP POLICY IF EXISTS "Organizer can delete own gig review" ON "GigReview";
CREATE POLICY "Organizer can delete own gig review" ON "GigReview" FOR DELETE TO public USING ((auth.uid())::text = "organizerId");

-- OrganizerReview: server-side only via Prisma (bypasses RLS). Deny all client access to protect audit fields (ipAddress, userAgent).
ALTER TABLE "OrganizerReview" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No client access to organizer reviews" ON "OrganizerReview";
CREATE POLICY "No client access to organizer reviews" ON "OrganizerReview" FOR ALL TO public USING (false) WITH CHECK (false);

-- OrganizerReputationScore: public read, server-only writes via Prisma
ALTER TABLE "OrganizerReputationScore" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read organizer reputation scores" ON "OrganizerReputationScore";
CREATE POLICY "Public read organizer reputation scores" ON "OrganizerReputationScore" FOR SELECT TO public USING (true);
ALTER TABLE "OrganizerReputationHistory" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read organizer reputation history" ON "OrganizerReputationHistory";
CREATE POLICY "Public read organizer reputation history" ON "OrganizerReputationHistory" FOR SELECT TO public USING (true);

-- Report: reporter can read/insert own reports. Admin updates are done server-side via Prisma.
ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reporter can read own reports" ON "Report";
CREATE POLICY "Reporter can read own reports" ON "Report" FOR SELECT TO public USING ((auth.uid())::text = "reporterId");
DROP POLICY IF EXISTS "Reporter can create own report" ON "Report";
CREATE POLICY "Reporter can create own report" ON "Report" FOR INSERT TO public WITH CHECK ((auth.uid())::text = "reporterId");

-- Reputation tables: public read, server-only writes via Prisma
ALTER TABLE "ReputationScore" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read reputation scores" ON "ReputationScore";
CREATE POLICY "Public read reputation scores" ON "ReputationScore" FOR SELECT TO public USING (true);
ALTER TABLE "ReputationHistory" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read reputation history" ON "ReputationHistory";
CREATE POLICY "Public read reputation history" ON "ReputationHistory" FOR SELECT TO public USING (true);

-- AdminActionLog: server-only audit trail; deny all user access via Supabase client
ALTER TABLE "AdminActionLog" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No user access to admin action logs" ON "AdminActionLog";
CREATE POLICY "No user access to admin action logs" ON "AdminActionLog" FOR ALL TO public USING (false) WITH CHECK (false);

-- DjFollow: owner can read/write own follows (mirrors SavedEvent policy)
ALTER TABLE "DjFollow" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User can read own DJ follows" ON "DjFollow";
CREATE POLICY "User can read own DJ follows" ON "DjFollow" FOR SELECT TO public USING ((auth.uid())::text = "userId");
DROP POLICY IF EXISTS "User can follow DJ" ON "DjFollow";
CREATE POLICY "User can follow DJ" ON "DjFollow" FOR INSERT TO public WITH CHECK ((auth.uid())::text = "userId");
DROP POLICY IF EXISTS "User can unfollow DJ" ON "DjFollow";
CREATE POLICY "User can unfollow DJ" ON "DjFollow" FOR DELETE TO public USING ((auth.uid())::text = "userId");

-- EmailLog: user can read own email logs; server-only writes
ALTER TABLE "EmailLog" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User can read own email logs" ON "EmailLog";
CREATE POLICY "User can read own email logs" ON "EmailLog" FOR SELECT TO public USING ("userId" IS NOT NULL AND (auth.uid())::text = "userId");

-- Hire: involved organizer/DJ can read; admin can read all; server-only writes
ALTER TABLE "Hire" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Involved users can read hire" ON "Hire";
CREATE POLICY "Involved users can read hire" ON "Hire" FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM "GigApplication" ga
    JOIN "Gig" g ON g.id = ga."gigId"
    JOIN "OrganizerProfile" op ON op.id = g."organizerProfileId"
    JOIN "DjProfile" dj ON dj.id = ga."djProfileId"
    WHERE ga.id = "Hire"."applicationId"
      AND (op."userId" = (auth.uid())::text OR dj."userId" = (auth.uid())::text)
  )
);
DROP POLICY IF EXISTS "Admin can read all hires" ON "Hire";
CREATE POLICY "Admin can read all hires" ON "Hire" FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM "UserRole" ur
    JOIN "User" u ON u.id = ur."userId"
    WHERE ur."userId" = (auth.uid())::text
      AND ur.role = 'ADMIN'
      AND u.status = 'ACTIVE'
      AND u."deletedAt" IS NULL
  )
);
DROP POLICY IF EXISTS "Admin can update hires" ON "Hire";
CREATE POLICY "Admin can update hires" ON "Hire" FOR UPDATE TO public USING (
  EXISTS (
    SELECT 1 FROM "UserRole" ur
    JOIN "User" u ON u.id = ur."userId"
    WHERE ur."userId" = (auth.uid())::text
      AND ur.role = 'ADMIN'
      AND u.status = 'ACTIVE'
      AND u."deletedAt" IS NULL
  )
);

-- BookingInquiry: organizer and invited DJ can read; admin can read all
ALTER TABLE "BookingInquiry" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participants can read booking inquiry" ON "BookingInquiry";
CREATE POLICY "Participants can read booking inquiry" ON "BookingInquiry" FOR SELECT TO public USING (
  (auth.uid())::text = "organizerId"
  OR EXISTS (
    SELECT 1 FROM "DjProfile" dj
    WHERE dj.id = "BookingInquiry"."djProfileId"
      AND dj."userId" = (auth.uid())::text
  )
);
DROP POLICY IF EXISTS "Admin can read booking inquiries" ON "BookingInquiry";
CREATE POLICY "Admin can read booking inquiries" ON "BookingInquiry" FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM "UserRole" ur
    JOIN "User" u ON u.id = ur."userId"
    WHERE ur."userId" = (auth.uid())::text
      AND ur.role = 'ADMIN'
      AND u.status = 'ACTIVE'
      AND u."deletedAt" IS NULL
  )
);

-- BookingInquiryMessage: participants can read; admin can read all
ALTER TABLE "BookingInquiryMessage" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participants can read booking inquiry messages" ON "BookingInquiryMessage";
CREATE POLICY "Participants can read booking inquiry messages" ON "BookingInquiryMessage" FOR SELECT TO public USING (
  EXISTS (
    SELECT 1
    FROM "BookingInquiry" bi
    JOIN "DjProfile" dj ON dj.id = bi."djProfileId"
    WHERE bi.id = "BookingInquiryMessage"."inquiryId"
      AND (
        bi."organizerId" = (auth.uid())::text
        OR dj."userId" = (auth.uid())::text
      )
  )
);
DROP POLICY IF EXISTS "Admin can read booking inquiry messages" ON "BookingInquiryMessage";
CREATE POLICY "Admin can read booking inquiry messages" ON "BookingInquiryMessage" FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM "UserRole" ur
    JOIN "User" u ON u.id = ur."userId"
    WHERE ur."userId" = (auth.uid())::text
      AND ur.role = 'ADMIN'
      AND u.status = 'ACTIVE'
      AND u."deletedAt" IS NULL
  )
);

-- ============================================================
-- RLS POLICIES FOR PUBLIC/LISTING TABLES (added in cleanup)
-- ============================================================

-- User: private table; server-side writes preferred. User can read/update own row.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User can read own row" ON "User";
CREATE POLICY "User can read own row" ON "User" FOR SELECT TO public USING (id = (auth.uid())::text);
DROP POLICY IF EXISTS "User can update own row" ON "User";
CREATE POLICY "User can update own row" ON "User" FOR UPDATE TO public USING (id = (auth.uid())::text);

-- DjProfile: public read for approved, non-hidden, active profiles; owner can manage own.
ALTER TABLE "DjProfile" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read approved DJ profiles" ON "DjProfile";
CREATE POLICY "Public read approved DJ profiles" ON "DjProfile" FOR SELECT TO public USING (
  status = 'APPROVED' AND hidden = false AND "deletedAt" IS NULL
);
DROP POLICY IF EXISTS "Owner can read own DJ profile" ON "DjProfile";
CREATE POLICY "Owner can read own DJ profile" ON "DjProfile" FOR SELECT TO public USING ("userId" = (auth.uid())::text);
DROP POLICY IF EXISTS "Owner can update own DJ profile" ON "DjProfile";
CREATE POLICY "Owner can update own DJ profile" ON "DjProfile" FOR UPDATE TO public
  USING ("userId" = (auth.uid())::text)
  WITH CHECK ("userId" = (auth.uid())::text AND status = (SELECT status FROM "DjProfile" WHERE id = "DjProfile".id) AND hidden = (SELECT hidden FROM "DjProfile" WHERE id = "DjProfile".id));

-- OrganizerProfile: public read for active, non-hidden, active organizers; owner can manage own.
ALTER TABLE "OrganizerProfile" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active organizer profiles" ON "OrganizerProfile";
CREATE POLICY "Public read active organizer profiles" ON "OrganizerProfile" FOR SELECT TO public USING (
  status = 'ACTIVE' AND hidden = false AND "deletedAt" IS NULL
);
DROP POLICY IF EXISTS "Owner can read own organizer profile" ON "OrganizerProfile";
CREATE POLICY "Owner can read own organizer profile" ON "OrganizerProfile" FOR SELECT TO public USING ("userId" = (auth.uid())::text);
DROP POLICY IF EXISTS "Owner can update own organizer profile" ON "OrganizerProfile";
CREATE POLICY "Owner can update own organizer profile" ON "OrganizerProfile" FOR UPDATE TO public
  USING ("userId" = (auth.uid())::text)
  WITH CHECK ("userId" = (auth.uid())::text AND status = (SELECT status FROM "OrganizerProfile" WHERE id = "OrganizerProfile".id) AND hidden = (SELECT hidden FROM "OrganizerProfile" WHERE id = "OrganizerProfile".id));

-- FanProfile: owner only
ALTER TABLE "FanProfile" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner can read own fan profile" ON "FanProfile";
CREATE POLICY "Owner can read own fan profile" ON "FanProfile" FOR SELECT TO public USING ("userId" = (auth.uid())::text);
DROP POLICY IF EXISTS "Owner can update own fan profile" ON "FanProfile";
CREATE POLICY "Owner can update own fan profile" ON "FanProfile" FOR UPDATE TO public USING ("userId" = (auth.uid())::text);

-- Gig: public read for published, non-hidden, active gigs; organizer owner can manage; applied DJs can read.
ALTER TABLE "Gig" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read published gigs" ON "Gig";
CREATE POLICY "Public read published gigs" ON "Gig" FOR SELECT TO public USING (
  status = 'PUBLISHED' AND hidden = false AND "deletedAt" IS NULL
);
DROP POLICY IF EXISTS "Organizer can read own gigs" ON "Gig";
CREATE POLICY "Organizer can read own gigs" ON "Gig" FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM "OrganizerProfile" op
    WHERE op.id = "Gig"."organizerProfileId" AND op."userId" = (auth.uid())::text
  )
);
DROP POLICY IF EXISTS "Applied DJ can read gig" ON "Gig";
CREATE POLICY "Applied DJ can read gig" ON "Gig" FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM "GigApplication" ga
    JOIN "DjProfile" dj ON dj.id = ga."djProfileId"
    WHERE ga."gigId" = "Gig".id AND dj."userId" = (auth.uid())::text
  )
);
DROP POLICY IF EXISTS "Organizer can update own gigs" ON "Gig";
CREATE POLICY "Organizer can update own gigs" ON "Gig" FOR UPDATE TO public USING (
  EXISTS (
    SELECT 1 FROM "OrganizerProfile" op
    WHERE op.id = "Gig"."organizerProfileId" AND op."userId" = (auth.uid())::text
  )
);

-- Event: public read for published, non-hidden, active events; owner DJ can manage.
ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read published events" ON "Event";
CREATE POLICY "Public read published events" ON "Event" FOR SELECT TO public USING (
  status = 'PUBLISHED' AND "deletedAt" IS NULL
);
DROP POLICY IF EXISTS "Owner DJ can read own events" ON "Event";
CREATE POLICY "Owner DJ can read own events" ON "Event" FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM "DjProfile" dj
    WHERE dj.id = "Event"."ownerDjId" AND dj."userId" = (auth.uid())::text
  )
);
DROP POLICY IF EXISTS "Owner DJ can update own events" ON "Event";
CREATE POLICY "Owner DJ can update own events" ON "Event" FOR UPDATE TO public USING (
  EXISTS (
    SELECT 1 FROM "DjProfile" dj
    WHERE dj.id = "Event"."ownerDjId" AND dj."userId" = (auth.uid())::text
  )
);

-- Post: public read for non-deleted posts; owner can manage own.
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read non-deleted posts" ON "Post";
CREATE POLICY "Public read non-deleted posts" ON "Post" FOR SELECT TO public USING ("deletedAt" IS NULL);
DROP POLICY IF EXISTS "Owner can read own posts" ON "Post";
CREATE POLICY "Owner can read own posts" ON "Post" FOR SELECT TO public USING ("userId" = (auth.uid())::text);
DROP POLICY IF EXISTS "Owner can update own posts" ON "Post";
CREATE POLICY "Owner can update own posts" ON "Post" FOR UPDATE TO public USING ("userId" = (auth.uid())::text);
DROP POLICY IF EXISTS "Owner can delete own posts" ON "Post";
CREATE POLICY "Owner can delete own posts" ON "Post" FOR DELETE TO public USING ("userId" = (auth.uid())::text);

-- Media: public read for media linked to public posts or public DJ profiles; owner can manage own.
ALTER TABLE "Media" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read media for public posts" ON "Media";
CREATE POLICY "Public read media for public posts" ON "Media" FOR SELECT TO public USING (
  "postId" IS NOT NULL AND EXISTS (
    SELECT 1 FROM "Post" p WHERE p.id = "Media"."postId" AND p."deletedAt" IS NULL
  )
);
DROP POLICY IF EXISTS "Public read media for public DJ profiles" ON "Media";
CREATE POLICY "Public read media for public DJ profiles" ON "Media" FOR SELECT TO public USING (
  "djProfileId" IS NOT NULL AND EXISTS (
    SELECT 1 FROM "DjProfile" dj
    WHERE dj.id = "Media"."djProfileId"
      AND dj.status = 'APPROVED' AND dj.hidden = false AND dj."deletedAt" IS NULL
  )
);
DROP POLICY IF EXISTS "Owner can manage media via profile" ON "Media";
CREATE POLICY "Owner can manage media via profile" ON "Media" FOR ALL TO public USING (
  ("djProfileId" IS NOT NULL AND EXISTS (
    SELECT 1 FROM "DjProfile" dj WHERE dj.id = "Media"."djProfileId" AND dj."userId" = (auth.uid())::text
  ))
  OR
  ("postId" IS NOT NULL AND EXISTS (
    SELECT 1 FROM "Post" p WHERE p.id = "Media"."postId" AND p."userId" = (auth.uid())::text
  ))
);

-- Notification: recipient only
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Recipient can read own notifications" ON "Notification";
CREATE POLICY "Recipient can read own notifications" ON "Notification" FOR SELECT TO public USING ("recipientId" = (auth.uid())::text);
DROP POLICY IF EXISTS "Recipient can update own notifications" ON "Notification";
CREATE POLICY "Recipient can update own notifications" ON "Notification" FOR UPDATE TO public USING ("recipientId" = (auth.uid())::text);

-- DjRating: public read; owner can manage own rating
ALTER TABLE "DjRating" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read DJ ratings" ON "DjRating";
CREATE POLICY "Public read DJ ratings" ON "DjRating" FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "User can manage own DJ rating" ON "DjRating";
CREATE POLICY "User can manage own DJ rating" ON "DjRating" FOR ALL TO public USING ("userId" = (auth.uid())::text);

-- GigApplication: applicant DJ or gig organizer can read; applicant can create/update.
ALTER TABLE "GigApplication" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Applicant DJ or organizer can read application" ON "GigApplication";
CREATE POLICY "Applicant DJ or organizer can read application" ON "GigApplication" FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM "DjProfile" dj WHERE dj.id = "GigApplication"."djProfileId" AND dj."userId" = (auth.uid())::text
  )
  OR
  EXISTS (
    SELECT 1 FROM "Gig" g
    JOIN "OrganizerProfile" op ON op.id = g."organizerProfileId"
    WHERE g.id = "GigApplication"."gigId" AND op."userId" = (auth.uid())::text
  )
);
DROP POLICY IF EXISTS "Applicant DJ can create application" ON "GigApplication";
CREATE POLICY "Applicant DJ can create application" ON "GigApplication" FOR INSERT TO public WITH CHECK (
  EXISTS (
    SELECT 1 FROM "DjProfile" dj WHERE dj.id = "GigApplication"."djProfileId" AND dj."userId" = (auth.uid())::text
  )
);
DROP POLICY IF EXISTS "Applicant DJ or organizer can update application" ON "GigApplication";
CREATE POLICY "Applicant DJ or organizer can update application" ON "GigApplication" FOR UPDATE TO public USING (
  EXISTS (
    SELECT 1 FROM "DjProfile" dj WHERE dj.id = "GigApplication"."djProfileId" AND dj."userId" = (auth.uid())::text
  )
  OR
  EXISTS (
    SELECT 1 FROM "Gig" g
    JOIN "OrganizerProfile" op ON op.id = g."organizerProfileId"
    WHERE g.id = "GigApplication"."gigId" AND op."userId" = (auth.uid())::text
  )
);

-- EventAttendance: user can manage own attendance
ALTER TABLE "EventAttendance" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User can manage own event attendance" ON "EventAttendance";
CREATE POLICY "User can manage own event attendance" ON "EventAttendance" FOR ALL TO public USING ("userId" = (auth.uid())::text);

-- PostComment: public read non-deleted; owner can manage own
ALTER TABLE "PostComment" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read non-deleted comments" ON "PostComment";
CREATE POLICY "Public read non-deleted comments" ON "PostComment" FOR SELECT TO public USING ("deletedAt" IS NULL);
DROP POLICY IF EXISTS "Owner can manage own post comments" ON "PostComment";
CREATE POLICY "Owner can manage own post comments" ON "PostComment" FOR ALL TO public USING ("userId" = (auth.uid())::text);

-- PostLike: public read; owner can manage own
ALTER TABLE "PostLike" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read post likes" ON "PostLike";
CREATE POLICY "Public read post likes" ON "PostLike" FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "User can manage own post likes" ON "PostLike";
CREATE POLICY "User can manage own post likes" ON "PostLike" FOR ALL TO public USING ("userId" = (auth.uid())::text);

-- DjComment: public read non-deleted; owner can manage own
ALTER TABLE "DjComment" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read non-deleted DJ comments" ON "DjComment";
CREATE POLICY "Public read non-deleted DJ comments" ON "DjComment" FOR SELECT TO public USING ("deletedAt" IS NULL);
DROP POLICY IF EXISTS "Owner can manage own DJ comments" ON "DjComment";
CREATE POLICY "Owner can manage own DJ comments" ON "DjComment" FOR ALL TO public USING ("userId" = (auth.uid())::text);

-- DjCommentLike: public read; owner can manage own
ALTER TABLE "DjCommentLike" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read DJ comment likes" ON "DjCommentLike";
CREATE POLICY "Public read DJ comment likes" ON "DjCommentLike" FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "User can manage own DJ comment likes" ON "DjCommentLike";
CREATE POLICY "User can manage own DJ comment likes" ON "DjCommentLike" FOR ALL TO public USING ("userId" = (auth.uid())::text);

-- SavedEvent: owner only
ALTER TABLE "SavedEvent" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User can manage own saved events" ON "SavedEvent";
CREATE POLICY "User can manage own saved events" ON "SavedEvent" FOR ALL TO public USING ("userId" = (auth.uid())::text);

-- EventDj: public read only; writes via server
ALTER TABLE "EventDj" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read event DJs" ON "EventDj";
CREATE POLICY "Public read event DJs" ON "EventDj" FOR SELECT TO public USING (true);

-- EventMedia: public read; owner DJ of event can manage
ALTER TABLE "EventMedia" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read event media" ON "EventMedia";
CREATE POLICY "Public read event media" ON "EventMedia" FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Owner DJ can manage event media" ON "EventMedia";
CREATE POLICY "Owner DJ can manage event media" ON "EventMedia" FOR ALL TO public USING (
  EXISTS (
    SELECT 1 FROM "Event" e
    JOIN "DjProfile" dj ON dj.id = e."ownerDjId"
    WHERE e.id = "EventMedia"."eventId" AND dj."userId" = (auth.uid())::text
  )
);

-- SocialLink: public read for public profiles; owner can manage
ALTER TABLE "SocialLink" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read social links for public DJ profiles" ON "SocialLink";
CREATE POLICY "Public read social links for public DJ profiles" ON "SocialLink" FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM "DjProfile" dj
    WHERE dj.id = "SocialLink"."djProfileId"
      AND dj.status = 'APPROVED' AND dj.hidden = false AND dj."deletedAt" IS NULL
  )
);
DROP POLICY IF EXISTS "Owner can manage own social links" ON "SocialLink";
CREATE POLICY "Owner can manage own social links" ON "SocialLink" FOR ALL TO public USING (
  EXISTS (
    SELECT 1 FROM "DjProfile" dj WHERE dj.id = "SocialLink"."djProfileId" AND dj."userId" = (auth.uid())::text
  )
);

-- OrganizerSocialLink: public read for public profiles; owner can manage
ALTER TABLE "OrganizerSocialLink" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read social links for public organizer profiles" ON "OrganizerSocialLink";
CREATE POLICY "Public read social links for public organizer profiles" ON "OrganizerSocialLink" FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM "OrganizerProfile" op
    WHERE op.id = "OrganizerSocialLink"."organizerProfileId"
      AND op.status = 'ACTIVE' AND op.hidden = false AND op."deletedAt" IS NULL
  )
);
DROP POLICY IF EXISTS "Owner can manage own organizer social links" ON "OrganizerSocialLink";
CREATE POLICY "Owner can manage own organizer social links" ON "OrganizerSocialLink" FOR ALL TO public USING (
  EXISTS (
    SELECT 1 FROM "OrganizerProfile" op
    WHERE op.id = "OrganizerSocialLink"."organizerProfileId" AND op."userId" = (auth.uid())::text
  )
);

-- DjPackage: public read for public DJ profiles; owner can manage
ALTER TABLE "DjPackage" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read packages for public DJ profiles" ON "DjPackage";
CREATE POLICY "Public read packages for public DJ profiles" ON "DjPackage" FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM "DjProfile" dj
    WHERE dj.id = "DjPackage"."djProfileId"
      AND dj.status = 'APPROVED' AND dj.hidden = false AND dj."deletedAt" IS NULL
  )
);
DROP POLICY IF EXISTS "Owner can manage own DJ packages" ON "DjPackage";
CREATE POLICY "Owner can manage own DJ packages" ON "DjPackage" FOR ALL TO public USING (
  EXISTS (
    SELECT 1 FROM "DjProfile" dj WHERE dj.id = "DjPackage"."djProfileId" AND dj."userId" = (auth.uid())::text
  )
);

-- DjCareerHighlight: public read for public DJ profiles; owner can manage
ALTER TABLE "DjCareerHighlight" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read career highlights for public DJ profiles" ON "DjCareerHighlight";
CREATE POLICY "Public read career highlights for public DJ profiles" ON "DjCareerHighlight" FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM "DjProfile" dj
    WHERE dj.id = "DjCareerHighlight"."djProfileId"
      AND dj.status = 'APPROVED' AND dj.hidden = false AND dj."deletedAt" IS NULL
  )
);
DROP POLICY IF EXISTS "Owner can manage own career highlights" ON "DjCareerHighlight";
CREATE POLICY "Owner can manage own career highlights" ON "DjCareerHighlight" FOR ALL TO public USING (
  EXISTS (
    SELECT 1 FROM "DjProfile" dj WHERE dj.id = "DjCareerHighlight"."djProfileId" AND dj."userId" = (auth.uid())::text
  )
);

-- DjEndorsement: public read for public DJ profiles; owner can manage
ALTER TABLE "DjEndorsement" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read endorsements for public DJ profiles" ON "DjEndorsement";
CREATE POLICY "Public read endorsements for public DJ profiles" ON "DjEndorsement" FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM "DjProfile" dj
    WHERE dj.id = "DjEndorsement"."djProfileId"
      AND dj.status = 'APPROVED' AND dj.hidden = false AND dj."deletedAt" IS NULL
  )
);
DROP POLICY IF EXISTS "Owner can manage own endorsements" ON "DjEndorsement";
CREATE POLICY "Owner can manage own endorsements" ON "DjEndorsement" FOR ALL TO public USING (
  EXISTS (
    SELECT 1 FROM "DjProfile" dj WHERE dj.id = "DjEndorsement"."djProfileId" AND dj."userId" = (auth.uid())::text
  )
);

-- DjPress: public read for public DJ profiles; owner can manage
ALTER TABLE "DjPress" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read press for public DJ profiles" ON "DjPress";
CREATE POLICY "Public read press for public DJ profiles" ON "DjPress" FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM "DjProfile" dj
    WHERE dj.id = "DjPress"."djProfileId"
      AND dj.status = 'APPROVED' AND dj.hidden = false AND dj."deletedAt" IS NULL
  )
);
DROP POLICY IF EXISTS "Owner can manage own press" ON "DjPress";
CREATE POLICY "Owner can manage own press" ON "DjPress" FOR ALL TO public USING (
  EXISTS (
    SELECT 1 FROM "DjProfile" dj WHERE dj.id = "DjPress"."djProfileId" AND dj."userId" = (auth.uid())::text
  )
);

-- DjVenue: public read for public DJ profiles; owner can manage
ALTER TABLE "DjVenue" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read venues for public DJ profiles" ON "DjVenue";
CREATE POLICY "Public read venues for public DJ profiles" ON "DjVenue" FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM "DjProfile" dj
    WHERE dj.id = "DjVenue"."djProfileId"
      AND dj.status = 'APPROVED' AND dj.hidden = false AND dj."deletedAt" IS NULL
  )
);
DROP POLICY IF EXISTS "Owner can manage own venues" ON "DjVenue";
CREATE POLICY "Owner can manage own venues" ON "DjVenue" FOR ALL TO public USING (
  EXISTS (
    SELECT 1 FROM "DjProfile" dj WHERE dj.id = "DjVenue"."djProfileId" AND dj."userId" = (auth.uid())::text
  )
);

-- ProfileView: analytics/PII data (viewerId, viewerIp, city, country). Reads and writes
-- happen exclusively server-side via Prisma's direct DB connection (see
-- src/app/api/track-profile-view/route.ts and src/lib/queries/dj-stats.ts), which bypasses
-- RLS entirely. Deny all Supabase client (anon/authenticated) access as defense-in-depth.
ALTER TABLE "ProfileView" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No user access to profile views" ON "ProfileView";
CREATE POLICY "No user access to profile views" ON "ProfileView" FOR ALL TO public USING (false) WITH CHECK (false);

-- ============================================================
-- MISSING RLS POLICIES (added during Supabase security audit)
-- ============================================================

-- Public reference tables
ALTER TABLE "Country" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read countries" ON "Country";
CREATE POLICY "Public read countries" ON "Country" FOR SELECT TO public USING (true);

ALTER TABLE "City" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read cities" ON "City";
CREATE POLICY "Public read cities" ON "City" FOR SELECT TO public USING (true);

ALTER TABLE "Genre" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read genres" ON "Genre";
CREATE POLICY "Public read genres" ON "Genre" FOR SELECT TO public USING (true);

-- Venue: public read for autocomplete; server-only writes via Prisma
ALTER TABLE "Venue" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read venues" ON "Venue";
CREATE POLICY "Public read venues" ON "Venue" FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "No user write to venues" ON "Venue";
CREATE POLICY "No user write to venues" ON "Venue" FOR ALL TO public USING (false) WITH CHECK (false);

-- Junction tables linked to public DJ profiles
ALTER TABLE "DjGenre" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read DJ genres" ON "DjGenre";
CREATE POLICY "Public read DJ genres" ON "DjGenre" FOR SELECT TO public USING (
  "djProfileId" IN (
    SELECT id FROM "DjProfile" WHERE status = 'APPROVED' AND hidden = false AND "deletedAt" IS NULL
  )
);

ALTER TABLE "DjProfileType" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read DJ types" ON "DjProfileType";
CREATE POLICY "Public read DJ types" ON "DjProfileType" FOR SELECT TO public USING (
  "djProfileId" IN (
    SELECT id FROM "DjProfile" WHERE status = 'APPROVED' AND hidden = false AND "deletedAt" IS NULL
  )
);

-- User settings
ALTER TABLE "EmailPreference" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User can read own email preferences" ON "EmailPreference";
CREATE POLICY "User can read own email preferences" ON "EmailPreference" FOR SELECT TO public USING (auth.uid()::text = "userId");
DROP POLICY IF EXISTS "User can update own email preferences" ON "EmailPreference";
CREATE POLICY "User can update own email preferences" ON "EmailPreference" FOR UPDATE TO public USING (auth.uid()::text = "userId");

ALTER TABLE "UserRole" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User can read own roles" ON "UserRole";
CREATE POLICY "User can read own roles" ON "UserRole" FOR SELECT TO public USING (auth.uid()::text = "userId");

-- Social/follow features
ALTER TABLE "Follower" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read followers" ON "Follower";
CREATE POLICY "Public read followers" ON "Follower" FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "User can follow others" ON "Follower";
CREATE POLICY "User can follow others" ON "Follower" FOR INSERT TO public WITH CHECK (auth.uid()::text = "followerId");
DROP POLICY IF EXISTS "User can unfollow" ON "Follower";
CREATE POLICY "User can unfollow" ON "Follower" FOR DELETE TO public USING (auth.uid()::text = "followerId");

-- Community post comment likes
ALTER TABLE "PostCommentLike" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read post comment likes" ON "PostCommentLike";
CREATE POLICY "Public read post comment likes" ON "PostCommentLike" FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "User can like post comments" ON "PostCommentLike";
CREATE POLICY "User can like post comments" ON "PostCommentLike" FOR INSERT TO public WITH CHECK (auth.uid()::text = "userId");
DROP POLICY IF EXISTS "User can unlike post comment likes" ON "PostCommentLike";
CREATE POLICY "User can unlike post comment likes" ON "PostCommentLike" FOR DELETE TO public USING (auth.uid()::text = "userId");

-- Conversations/messaging
ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participant can read own conversations" ON "Conversation";
CREATE POLICY "Participant can read own conversations" ON "Conversation" FOR SELECT TO public USING (
  id IN (
    SELECT "conversationId" FROM "ConversationParticipant" WHERE "userId" = auth.uid()::text
  )
);

ALTER TABLE "ConversationParticipant" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participant can read own conversation participants" ON "ConversationParticipant";
CREATE POLICY "Participant can read own conversation participants" ON "ConversationParticipant" FOR SELECT TO public USING (
  "conversationId" IN (
    SELECT "conversationId" FROM "ConversationParticipant" WHERE "userId" = auth.uid()::text
  )
);

ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participant can read messages" ON "Message";
CREATE POLICY "Participant can read messages" ON "Message" FOR SELECT TO public USING (
  "conversationId" IN (
    SELECT "conversationId" FROM "ConversationParticipant" WHERE "userId" = auth.uid()::text
  )
);

-- Contact submissions: public insert, no public read
ALTER TABLE "ContactSubmission" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can submit contact form" ON "ContactSubmission";
CREATE POLICY "Public can submit contact form" ON "ContactSubmission" FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "No public read contact submissions" ON "ContactSubmission";
CREATE POLICY "No public read contact submissions" ON "ContactSubmission" FOR SELECT TO public USING (false);

-- EventModeration: event owner DJ and admin can read; server-only writes via Prisma
ALTER TABLE "EventModeration" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Event owner DJ can read event moderations" ON "EventModeration";
CREATE POLICY "Event owner DJ can read event moderations" ON "EventModeration" FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM "Event" e
    JOIN "DjProfile" dj ON dj.id = e."ownerDjId"
    WHERE e.id = "EventModeration"."eventId" AND dj."userId" = (auth.uid())::text
  )
);
DROP POLICY IF EXISTS "Admin can read event moderations" ON "EventModeration";
CREATE POLICY "Admin can read event moderations" ON "EventModeration" FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM "UserRole" ur
    WHERE ur."userId" = (auth.uid())::text AND ur.role = 'ADMIN'
  )
);
DROP POLICY IF EXISTS "No user write to event moderations" ON "EventModeration";
CREATE POLICY "No user write to event moderations" ON "EventModeration" FOR ALL TO public USING (false) WITH CHECK (false);
