-- ============================================================
-- DJscovery — Row Level Security (RLS) Policies
-- Run this in Supabase SQL Editor for BOTH projects:
--   djscovery-staging and djscovery-prod
--
-- IMPORTANT: Prisma uses the postgres/service role and bypasses
-- RLS entirely. These policies only protect against direct
-- REST API access using the public anon key.
-- ============================================================


-- ============================================================
-- STEP 1: Enable RLS on every table
-- ============================================================

ALTER TABLE "User"                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserRole"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DjProfile"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrganizerProfile"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Genre"                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DjGenre"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DjProfileType"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SocialLink"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Media"                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DjRating"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DjComment"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DjCommentLike"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Post"                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PostComment"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PostLike"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PostCommentLike"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Event"                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EventDj"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Job"                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JobApplication"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Follower"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Country"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE "City"                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Conversation"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConversationParticipant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EventAttendance"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Hire"                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrganizerSocialLink"     ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- STEP 2: Public read — safe reference data (no auth needed)
-- ============================================================

CREATE POLICY "Public read countries"
  ON "Country" FOR SELECT USING (true);

CREATE POLICY "Public read cities"
  ON "City" FOR SELECT USING (true);

CREATE POLICY "Public read genres"
  ON "Genre" FOR SELECT USING (true);


-- ============================================================
-- STEP 3: DJ Profiles — public read for approved profiles only
-- ============================================================

CREATE POLICY "Public read approved DJ profiles"
  ON "DjProfile" FOR SELECT
  USING (status = 'APPROVED' AND "deletedAt" IS NULL);

CREATE POLICY "DJ can update own profile"
  ON "DjProfile" FOR UPDATE
  USING (auth.uid()::text = "userId");

CREATE POLICY "Public read DJ genres"
  ON "DjGenre" FOR SELECT
  USING (
    "djProfileId" IN (
      SELECT id FROM "DjProfile"
      WHERE status = 'APPROVED' AND "deletedAt" IS NULL
    )
  );

CREATE POLICY "Public read DJ types"
  ON "DjProfileType" FOR SELECT
  USING (
    "djProfileId" IN (
      SELECT id FROM "DjProfile"
      WHERE status = 'APPROVED' AND "deletedAt" IS NULL
    )
  );

CREATE POLICY "Public read social links"
  ON "SocialLink" FOR SELECT
  USING (
    "djProfileId" IN (
      SELECT id FROM "DjProfile"
      WHERE status = 'APPROVED' AND "deletedAt" IS NULL
    )
  );

CREATE POLICY "Public read media"
  ON "Media" FOR SELECT
  USING (
    "djProfileId" IS NULL
    OR "djProfileId" IN (
      SELECT id FROM "DjProfile"
      WHERE status = 'APPROVED' AND "deletedAt" IS NULL
    )
  );


-- ============================================================
-- STEP 4: Community feed — public read, authenticated write
-- ============================================================

CREATE POLICY "Public read posts"
  ON "Post" FOR SELECT
  USING ("deletedAt" IS NULL);

CREATE POLICY "Authenticated users can create posts"
  ON "Post" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Owner can update own post"
  ON "Post" FOR UPDATE
  USING (auth.uid()::text = "userId");

CREATE POLICY "Public read post comments"
  ON "PostComment" FOR SELECT
  USING ("deletedAt" IS NULL);

CREATE POLICY "Authenticated users can comment"
  ON "PostComment" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Owner can update own comment"
  ON "PostComment" FOR UPDATE
  USING (auth.uid()::text = "userId");

CREATE POLICY "Authenticated users can like posts"
  ON "PostLike" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "User can unlike own post like"
  ON "PostLike" FOR DELETE
  USING (auth.uid()::text = "userId");

CREATE POLICY "Public read post likes"
  ON "PostLike" FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like comments"
  ON "PostCommentLike" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "User can unlike own comment like"
  ON "PostCommentLike" FOR DELETE
  USING (auth.uid()::text = "userId");

CREATE POLICY "Public read comment likes"
  ON "PostCommentLike" FOR SELECT USING (true);


-- ============================================================
-- STEP 5: DJ Comments and Ratings — public read, auth write
-- ============================================================

CREATE POLICY "Public read DJ comments"
  ON "DjComment" FOR SELECT
  USING ("deletedAt" IS NULL);

CREATE POLICY "Authenticated users can comment on DJ profiles"
  ON "DjComment" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Owner can update own DJ comment"
  ON "DjComment" FOR UPDATE
  USING (auth.uid()::text = "userId");

CREATE POLICY "Public read DJ comment likes"
  ON "DjCommentLike" FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like DJ comments"
  ON "DjCommentLike" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "User can unlike own DJ comment like"
  ON "DjCommentLike" FOR DELETE
  USING (auth.uid()::text = "userId");

CREATE POLICY "Public read DJ ratings"
  ON "DjRating" FOR SELECT USING (true);

CREATE POLICY "Authenticated users can rate DJs"
  ON "DjRating" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "User can update own DJ rating"
  ON "DjRating" FOR UPDATE
  USING (auth.uid()::text = "userId");


-- ============================================================
-- STEP 6: Events — public read for published events
-- ============================================================

CREATE POLICY "Public read published events"
  ON "Event" FOR SELECT
  USING (status = 'PUBLISHED' AND "deletedAt" IS NULL);

CREATE POLICY "Public read event DJs"
  ON "EventDj" FOR SELECT
  USING (
    "eventId" IN (
      SELECT id FROM "Event"
      WHERE status = 'PUBLISHED' AND "deletedAt" IS NULL
    )
  );


-- ============================================================
-- STEP 7: Jobs — public read for open jobs
-- ============================================================

CREATE POLICY "Public read open jobs"
  ON "Job" FOR SELECT
  USING (status = 'OPEN' AND "deletedAt" IS NULL);


-- ============================================================
-- STEP 8: Private tables — authenticated + owner only
-- ============================================================

-- Users: each user can only read their own record
CREATE POLICY "User can read own profile"
  ON "User" FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "User can update own profile"
  ON "User" FOR UPDATE
  USING (auth.uid()::text = id);

-- UserRole: each user can only read their own roles
CREATE POLICY "User can read own roles"
  ON "UserRole" FOR SELECT
  USING (auth.uid()::text = "userId");

-- OrganizerProfile: public read for ACTIVE profiles; full CRUD for owner only
CREATE POLICY "Public can view active organizer profiles"
  ON "OrganizerProfile" FOR SELECT
  USING (status = 'ACTIVE' AND "deletedAt" IS NULL);

CREATE POLICY "Organizer can read own profile (any status)"
  ON "OrganizerProfile" FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Authenticated user can create own organizer profile"
  ON "OrganizerProfile" FOR INSERT
  WITH CHECK (
    auth.uid()::text = "userId"
    AND EXISTS (
      SELECT 1 FROM "UserRole"
      WHERE "userId" = auth.uid()::text AND role = 'ORGANIZER'
    )
  );

-- Note: status and deletedAt are server-controlled via Prisma (bypasses RLS); deletedAt IS NULL
-- guard below prevents direct-API updates to soft-deleted profiles and undo of soft-deletes.
CREATE POLICY "Organizer can update own profile"
  ON "OrganizerProfile" FOR UPDATE
  USING (
    auth.uid()::text = "userId"
    AND "deletedAt" IS NULL
  )
  WITH CHECK (
    auth.uid()::text = "userId"
    AND "deletedAt" IS NULL
    AND EXISTS (
      SELECT 1 FROM "UserRole"
      WHERE "userId" = auth.uid()::text AND role = 'ORGANIZER'
    )
  );

-- OrganizerSocialLink: public read if parent profile is ACTIVE; owner full CRUD
CREATE POLICY "Public can view active organizer social links"
  ON "OrganizerSocialLink" FOR SELECT
  USING (
    "organizerProfileId" IN (
      SELECT id FROM "OrganizerProfile"
      WHERE status = 'ACTIVE' AND "deletedAt" IS NULL
    )
  );

CREATE POLICY "Organizer can insert own social links"
  ON "OrganizerSocialLink" FOR INSERT
  WITH CHECK (
    "organizerProfileId" IN (
      SELECT id FROM "OrganizerProfile" WHERE "userId" = auth.uid()::text
    )
    AND EXISTS (
      SELECT 1 FROM "UserRole"
      WHERE "userId" = auth.uid()::text AND role = 'ORGANIZER'
    )
  );

CREATE POLICY "Organizer can update own social links"
  ON "OrganizerSocialLink" FOR UPDATE
  USING (
    "organizerProfileId" IN (
      SELECT id FROM "OrganizerProfile" WHERE "userId" = auth.uid()::text
    )
  )
  WITH CHECK (
    "organizerProfileId" IN (
      SELECT id FROM "OrganizerProfile" WHERE "userId" = auth.uid()::text
    )
    AND EXISTS (
      SELECT 1 FROM "UserRole"
      WHERE "userId" = auth.uid()::text AND role = 'ORGANIZER'
    )
  );

CREATE POLICY "Organizer can delete own social links"
  ON "OrganizerSocialLink" FOR DELETE
  USING (
    "organizerProfileId" IN (
      SELECT id FROM "OrganizerProfile" WHERE "userId" = auth.uid()::text
    )
    AND EXISTS (
      SELECT 1 FROM "UserRole"
      WHERE "userId" = auth.uid()::text AND role = 'ORGANIZER'
    )
  );

-- JobApplication: applicant reads own records.
-- Organizer access is enforced server-side via Prisma (bypasses RLS) — no policy needed here.
CREATE POLICY "Applicant can read own applications"
  ON "JobApplication" FOR SELECT
  USING (auth.uid()::text = "applicantId");

CREATE POLICY "Applicant can create application"
  ON "JobApplication" FOR INSERT
  WITH CHECK (auth.uid()::text = "applicantId");

-- Notifications: recipient only
CREATE POLICY "User can read own notifications"
  ON "Notification" FOR SELECT
  USING (auth.uid()::text = "recipientId");

CREATE POLICY "User can mark own notifications read"
  ON "Notification" FOR UPDATE
  USING (auth.uid()::text = "recipientId");

-- Followers: authenticated read, own writes only
CREATE POLICY "Public read followers"
  ON "Follower" FOR SELECT USING (true);

CREATE POLICY "User can follow others"
  ON "Follower" FOR INSERT
  WITH CHECK (auth.uid()::text = "followerId");

CREATE POLICY "User can unfollow"
  ON "Follower" FOR DELETE
  USING (auth.uid()::text = "followerId");

-- Conversations: participants only
CREATE POLICY "Participant can read own conversations"
  ON "Conversation" FOR SELECT
  USING (
    id IN (
      SELECT "conversationId"
      FROM "ConversationParticipant"
      WHERE "userId" = auth.uid()::text
    )
  );

CREATE POLICY "Participant can read conversation participants"
  ON "ConversationParticipant" FOR SELECT
  USING (
    "conversationId" IN (
      SELECT "conversationId"
      FROM "ConversationParticipant"
      WHERE "userId" = auth.uid()::text
    )
  );

CREATE POLICY "Participant can read messages"
  ON "Message" FOR SELECT
  USING (
    "conversationId" IN (
      SELECT "conversationId"
      FROM "ConversationParticipant"
      WHERE "userId" = auth.uid()::text
    )
  );

-- Hire records: no direct access (server/admin only)
-- No policies added = deny all by default ✅

-- EventAttendance: auth read/write
CREATE POLICY "Authenticated user can read event attendance"
  ON "EventAttendance" FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Authenticated user can set attendance"
  ON "EventAttendance" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Authenticated user can remove attendance"
  ON "EventAttendance" FOR DELETE
  USING (auth.uid()::text = "userId");


-- ============================================================
-- STEP 9: Supabase Storage — organizer images in djscovery-media
-- ============================================================
-- All organizer images go into the shared djscovery-media bucket
-- (same bucket as dj-avatars / dj-covers / dj-gallery).
-- Path convention: org-avatar/{userId}/{timestamp}.{ext}
--                  org-cover/{userId}/{timestamp}.{ext}
--
-- If djscovery-media already has broad SELECT/INSERT policies from
-- the DJ upload setup, these may already be covered. Run only if
-- organizer uploads are still being blocked.
-- ============================================================

-- Allow authenticated users to upload under org-avatar/{their uid}/
CREATE POLICY "Organizer can upload own logo"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'djscovery-media'
    AND (storage.foldername(name))[1] = 'org-avatar'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Organizer can update own logo"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'djscovery-media'
    AND (storage.foldername(name))[1] = 'org-avatar'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Organizer can delete own logo"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'djscovery-media'
    AND (storage.foldername(name))[1] = 'org-avatar'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Allow authenticated users to upload under org-cover/{their uid}/
CREATE POLICY "Organizer can upload own cover"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'djscovery-media'
    AND (storage.foldername(name))[1] = 'org-cover'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Organizer can update own cover"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'djscovery-media'
    AND (storage.foldername(name))[1] = 'org-cover'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Organizer can delete own cover"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'djscovery-media'
    AND (storage.foldername(name))[1] = 'org-cover'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Public SELECT is already covered by the broad djscovery-media policy.
-- Only add this if public reads are missing:
-- CREATE POLICY "Public can read organizer images"
--   ON storage.objects FOR SELECT TO public
--   USING (bucket_id = 'djscovery-media');
