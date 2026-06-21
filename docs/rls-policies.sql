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
ALTER TABLE "FanProfile"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmailPreference"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmailLog"                ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE "EventMedia"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Gig"                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GigApplication"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SavedDj"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SavedEvent"              ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- DROP ALL EXISTING POLICIES (idempotent re-run on any PG version)
-- ============================================================

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'Country','City','Genre',
        'DjProfile','DjGenre','DjProfileType','SocialLink','Media',
        'Post','PostComment','PostLike','PostCommentLike',
        'DjComment','DjCommentLike','DjRating',
        'Event','EventDj','EventMedia',
        'FanProfile','EmailPreference',
        'User','UserRole',
        'OrganizerProfile','OrganizerSocialLink',
        'Gig','GigApplication',
        'Notification','Follower',
        'Conversation','ConversationParticipant','Message',
        'EventAttendance','Hire',
        'SavedDj','SavedEvent'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END;
$$;

DROP POLICY IF EXISTS "DJ can upload own media"             ON storage.objects;
DROP POLICY IF EXISTS "DJ can update own media"             ON storage.objects;
DROP POLICY IF EXISTS "DJ can delete own media"             ON storage.objects;
DROP POLICY IF EXISTS "Organizer can upload own media"      ON storage.objects;
DROP POLICY IF EXISTS "Organizer can update own media"      ON storage.objects;
DROP POLICY IF EXISTS "Organizer can delete own media"      ON storage.objects;
DROP POLICY IF EXISTS "Event owner can upload poster"       ON storage.objects;
DROP POLICY IF EXISTS "Event owner can update poster"       ON storage.objects;
DROP POLICY IF EXISTS "Event owner can delete poster"       ON storage.objects;
DROP POLICY IF EXISTS "Event owner can upload gallery image" ON storage.objects;
DROP POLICY IF EXISTS "Event owner can update gallery image" ON storage.objects;
DROP POLICY IF EXISTS "Event owner can delete gallery image" ON storage.objects;
DROP POLICY IF EXISTS "User can upload own avatar"          ON storage.objects;
DROP POLICY IF EXISTS "User can update own avatar"          ON storage.objects;
DROP POLICY IF EXISTS "User can delete own avatar"          ON storage.objects;


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
-- STEP 7: FanProfile — public read
-- ============================================================

CREATE POLICY "Public read fan profiles"
  ON "FanProfile" FOR SELECT
  USING ("deletedAt" IS NULL);

CREATE POLICY "Fan can update own profile"
  ON "FanProfile" FOR UPDATE
  USING (auth.uid()::text = "userId");

-- EmailPreference: owner only
CREATE POLICY "User can read own email preferences"
  ON "EmailPreference" FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "User can update own email preferences"
  ON "EmailPreference" FOR UPDATE
  USING (auth.uid()::text = "userId");

-- EmailLog: no direct access (server only — deny all by default) ✅


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

-- ============================================================
-- STEP 9 (cont): Gig & GigApplication RLS
-- ============================================================

CREATE POLICY "Public read published gigs"
  ON "Gig" FOR SELECT
  USING (status = 'PUBLISHED' AND "deletedAt" IS NULL);

CREATE POLICY "Organizer can read own gigs"
  ON "Gig" FOR SELECT
  USING (
    "organizerProfileId" IN (
      SELECT id FROM "OrganizerProfile" WHERE "userId" = auth.uid()::text
    )
  );

CREATE POLICY "Public read event media for published events"
  ON "EventMedia" FOR SELECT
  USING (
    "eventId" IN (
      SELECT id FROM "Event"
      WHERE status = 'PUBLISHED' AND "deletedAt" IS NULL
    )
  );

CREATE POLICY "DJ can read own gig applications"
  ON "GigApplication" FOR SELECT
  USING (
    "djProfileId" IN (
      SELECT id FROM "DjProfile" WHERE "userId" = auth.uid()::text
    )
  );

CREATE POLICY "Organizer can read applications for own gigs"
  ON "GigApplication" FOR SELECT
  USING (
    "gigId" IN (
      SELECT g.id FROM "Gig" g
      JOIN "OrganizerProfile" op ON g."organizerProfileId" = op.id
      WHERE op."userId" = auth.uid()::text
    )
  );

CREATE POLICY "DJ can apply to gigs"
  ON "GigApplication" FOR INSERT
  WITH CHECK (
    "djProfileId" IN (
      SELECT id FROM "DjProfile" WHERE "userId" = auth.uid()::text
    )
    AND EXISTS (
      SELECT 1 FROM "UserRole" WHERE "userId" = auth.uid()::text AND role = 'DJ'
    )
  );

CREATE POLICY "DJ can withdraw own application"
  ON "GigApplication" FOR DELETE
  USING (
    "djProfileId" IN (
      SELECT id FROM "DjProfile" WHERE "userId" = auth.uid()::text
    )
  );


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
-- STEP 9: Supabase Storage — djscovery-media bucket
-- ============================================================
-- Single public bucket: djscovery-media
--
-- Folder structure (all under djscovery-media):
--   djs/{userId}/avatar/
--   djs/{userId}/cover/
--   djs/{userId}/gallery/
--   djs/{userId}/audio/
--   djs/{userId}/video/
--   organizers/{userId}/logo/
--   organizers/{userId}/cover/
--   events/{eventId}/poster/
--   events/{eventId}/gallery/
--
-- userId = Supabase Auth UUID (used for both DJ and Organizer paths
-- because the integer DB id does not exist during initial profile creation).
--
-- Run these in the Supabase SQL Editor under Storage > Policies.
-- ============================================================

-- ── Public read ───────────────────────────────────────────────────────────────
-- NOTE: No SELECT policy needed. djscovery-media is a PUBLIC bucket, so
-- individual files are accessible via their direct URLs without any RLS policy.
-- A broad SELECT policy would additionally allow clients to LIST all files
-- (enumerate paths), which is unnecessary and exposes internal structure.
-- File URLs are constructed via getPublicMediaUrl(path) — no .list() calls.


-- ── DJ uploads — djs/{userId}/* ───────────────────────────────────────────────

CREATE POLICY "DJ can upload own media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'djscovery-media'
    AND (storage.foldername(name))[1] = 'djs'
    AND (storage.foldername(name))[2] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM "UserRole"
      WHERE "userId" = auth.uid()::text AND role = 'DJ'
    )
  );

CREATE POLICY "DJ can update own media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'djscovery-media'
    AND (storage.foldername(name))[1] = 'djs'
    AND (storage.foldername(name))[2] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM "UserRole"
      WHERE "userId" = auth.uid()::text AND role = 'DJ'
    )
  );

CREATE POLICY "DJ can delete own media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'djscovery-media'
    AND (storage.foldername(name))[1] = 'djs'
    AND (storage.foldername(name))[2] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM "UserRole"
      WHERE "userId" = auth.uid()::text AND role = 'DJ'
    )
  );


-- ── Organizer uploads — organizers/{userId}/* ─────────────────────────────────

CREATE POLICY "Organizer can upload own media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'djscovery-media'
    AND (storage.foldername(name))[1] = 'organizers'
    AND (storage.foldername(name))[2] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM "UserRole"
      WHERE "userId" = auth.uid()::text AND role = 'ORGANIZER'
    )
  );

CREATE POLICY "Organizer can update own media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'djscovery-media'
    AND (storage.foldername(name))[1] = 'organizers'
    AND (storage.foldername(name))[2] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM "UserRole"
      WHERE "userId" = auth.uid()::text AND role = 'ORGANIZER'
    )
  );

CREATE POLICY "Organizer can delete own media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'djscovery-media'
    AND (storage.foldername(name))[1] = 'organizers'
    AND (storage.foldername(name))[2] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM "UserRole"
      WHERE "userId" = auth.uid()::text AND role = 'ORGANIZER'
    )
  );


-- ── Event uploads — events/{eventId}/poster/ ──────────────────────────────────

CREATE POLICY "Event owner can upload poster"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'djscovery-media'
    AND (storage.foldername(name))[1] = 'events'
    AND (storage.foldername(name))[3] = 'poster'
    AND EXISTS (
      SELECT 1 FROM "Event" e
      JOIN "DjProfile" dp ON e."ownerDjId" = dp.id
      WHERE e.id::text = (storage.foldername(name))[2]
        AND dp."userId" = auth.uid()::text
    )
    AND EXISTS (
      SELECT 1 FROM "UserRole"
      WHERE "userId" = auth.uid()::text AND role = 'DJ'
    )
  );

CREATE POLICY "Event owner can update poster"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'djscovery-media'
    AND (storage.foldername(name))[1] = 'events'
    AND (storage.foldername(name))[3] = 'poster'
    AND EXISTS (
      SELECT 1 FROM "Event" e
      JOIN "DjProfile" dp ON e."ownerDjId" = dp.id
      WHERE e.id::text = (storage.foldername(name))[2]
        AND dp."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Event owner can delete poster"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'djscovery-media'
    AND (storage.foldername(name))[1] = 'events'
    AND (storage.foldername(name))[3] = 'poster'
    AND EXISTS (
      SELECT 1 FROM "Event" e
      JOIN "DjProfile" dp ON e."ownerDjId" = dp.id
      WHERE e.id::text = (storage.foldername(name))[2]
        AND dp."userId" = auth.uid()::text
    )
  );


-- ── Event uploads — events/{eventId}/gallery/ ─────────────────────────────────

CREATE POLICY "Event owner can upload gallery image"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'djscovery-media'
    AND (storage.foldername(name))[1] = 'events'
    AND (storage.foldername(name))[3] = 'gallery'
    AND EXISTS (
      SELECT 1 FROM "Event" e
      JOIN "DjProfile" dp ON e."ownerDjId" = dp.id
      WHERE e.id::text = (storage.foldername(name))[2]
        AND dp."userId" = auth.uid()::text
    )
    AND EXISTS (
      SELECT 1 FROM "UserRole"
      WHERE "userId" = auth.uid()::text AND role = 'DJ'
    )
  );

CREATE POLICY "Event owner can update gallery image"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'djscovery-media'
    AND (storage.foldername(name))[1] = 'events'
    AND (storage.foldername(name))[3] = 'gallery'
    AND EXISTS (
      SELECT 1 FROM "Event" e
      JOIN "DjProfile" dp ON e."ownerDjId" = dp.id
      WHERE e.id::text = (storage.foldername(name))[2]
        AND dp."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Event owner can delete gallery image"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'djscovery-media'
    AND (storage.foldername(name))[1] = 'events'
    AND (storage.foldername(name))[3] = 'gallery'
    AND EXISTS (
      SELECT 1 FROM "Event" e
      JOIN "DjProfile" dp ON e."ownerDjId" = dp.id
      WHERE e.id::text = (storage.foldername(name))[2]
        AND dp."userId" = auth.uid()::text
    )
  );


-- ── Fan avatar uploads — users/{userId}/avatar/ ───────────────────────────────

CREATE POLICY "User can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'djscovery-media'
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "User can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'djscovery-media'
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "User can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'djscovery-media'
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );


-- ============================================================
-- STEP 10: SavedDj + SavedEvent — owner only
-- ============================================================

CREATE POLICY "User can read own saved DJs"
  ON "SavedDj" FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "User can save a DJ"
  ON "SavedDj" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "User can unsave a DJ"
  ON "SavedDj" FOR DELETE
  USING (auth.uid()::text = "userId");

CREATE POLICY "User can read own saved events"
  ON "SavedEvent" FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "User can save an event"
  ON "SavedEvent" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "User can unsave an event"
  ON "SavedEvent" FOR DELETE
  USING (auth.uid()::text = "userId");
