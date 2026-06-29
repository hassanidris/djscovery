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

-- Hire: involved organizer/DJ can read; server-only writes
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
