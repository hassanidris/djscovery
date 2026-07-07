# DJ Profile — Product Specification

**Status:** ✅ Implemented (Complete)
**Created:** July 7, 2026
**Last Updated:** July 7, 2026

---

## Implementation Status

The DJ Profile feature has been fully implemented and is live in production. This document serves as comprehensive reference for the design decisions, schema, and implementation details.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Database Schema](#2-database-schema)
3. [Profile Status Lifecycle](#3-profile-status-lifecycle)
4. [Plan Tiers: Free vs Premium](#4-plan-tiers-free-vs-premium)
5. [DJ Onboarding Flow](#5-dj-onboarding-flow)
6. [Profile Management](#6-profile-management)
7. [Public Profile Display](#7-public-profile-display)
8. [Premium Features](#8-premium-features)
9. [Media Management](#9-media-management)
10. [Social Links](#10-social-links)
11. [Genres & DJ Types](#11-genres--dj-types)
12. [Reputation System](#12-reputation-system)
13. [Follow System](#13-follow-system)
14. [Booking Integration](#14-booking-integration)
15. [Events Integration](#15-events-integration)
16. [Analytics & Tracking](#16-analytics--tracking)
17. [Security & Permissions](#17-security--permissions)
18. [API Endpoints](#18-api-endpoints)
19. [Component Architecture](#19-component-architecture)
20. [Technical Notes](#20-technical-notes)

---

## 1. Overview

DJ profiles are the core entity of DJcovery. They enable DJs to showcase their work, get discovered by organizers, and build their professional reputation in the electronic music industry.

### Core Purpose

- **Discovery:** Organizers find and evaluate DJs for bookings
- **Portfolio:** DJs showcase their experience, media, and events
- **Trust:** Ratings, reviews, and reputation scores build credibility
- **Engagement:** Fans can follow DJs and track their activity

### Key Principles

- **Minimum viable profile:** DJs can publish with basic info, premium features are optional
- **Approval workflow:** Admin approval required for public visibility (prevents spam/fake profiles)
- **Plan-based access:** Free tier provides essential features, Premium unlocks advanced tools
- **Privacy control:** DJs control what contact info is visible and when

---

## 2. Database Schema

### Core DjProfile Model

```prisma
model DjProfile {
  id     Int    @id @default(autoincrement())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Basic Identity
  stageName       String           // Display name (2-50 chars)
  slug            String           @unique // URL-friendly: /djs/[slug]
  avatar          String?          // Supabase Storage public URL
  avatarPath      String?          // Supabase Storage path (for deletion)
  coverImage      String?          // Supabase Storage public URL
  coverImagePath  String?          // Supabase Storage path (for deletion)
  bio             String?          // Short bio (max 500 chars)

  // Experience
  experienceYears Int?
  experienceLevel ExperienceLevel? // Auto-calculated from years

  // Status & Visibility
  status          DjProfileStatus  @default(PENDING_APPROVAL)
  plan            DjPlan           @default(FREE)
  featured        Boolean          @default(false)
  hidden          Boolean          @default(false) // Admin can hide without approval change
  searchScore     Float            @default(0) // Denormalized for search ranking

  // Location
  countryId Int
  country   Country @relation(fields: [countryId], references: [id])
  cityId    Int
  city      City    @relation(fields: [cityId], references: [id])

  // Booking & Pricing
  bookingEmail String?
  bookingPhone String?
  feeMin       Int?
  feeMax       Int?
  feeCurrency  String?

  // Reputation
  reputationScore Int @default(0) // 0-1000, denormalized for fast search

  // Premium: Team Contacts
  managerName  String?
  managerEmail String?
  managerPhone String?
  agentName    String?
  agentAgency  String?
  agentEmail   String?

  // Premium: Availability Calendar
  availabilityTimezone String?
  availabilityMonth    String? // e.g. "2025-09"
  availabilityDays     Json?   // [{day: 1, status: "available"}, ...]

  // Premium: Spotlight (Featured Mix/Video)
  featuredMixTitle       String?
  featuredMixAudioUrl    String?
  featuredMixDuration    String?
  featuredMixPlays       Int     @default(0)
  featuredVideoTitle     String?
  featuredVideoUrl       String?
  featuredVideoThumbnail String?
  featuredVideoDuration  String?
  featuredVideoViews     Int     @default(0)

  // Premium: Analytics (denormalized)
  monthlyViews Int @default(0)

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  // Relations
  genres           DjGenre[]
  djTypes          DjProfileType[]
  socialLinks      SocialLink[]
  ratings          DjRating[]
  comments         DjComment[]
  media            Media[]
  events           EventDj[]
  eventsOwned      Event[]             @relation("EventOwner")
  gigApplications  GigApplication[]
  followers        DjFollow[]
  gigReviews       GigReview[]
  eventReviews     EventReview[]
  reputationDetail ReputationScore?
  bookingInquiries BookingInquiry[]    @relation("DjProfileBookingInquiries")
  packages         DjPackage[]
  highlights       DjCareerHighlight[]
  endorsements     DjEndorsement[]
  pressItems       DjPress[]
  profileViews     ProfileView[]
  venues           DjVenue[]

  @@index([slug])
  @@index([status])
  @@index([hidden])
  @@index([plan])
  @@index([featured])
  @@index([searchScore])
  @@index([countryId])
  @@index([cityId])
}
```

### Related Models

#### DjProfileType (DJ Types Junction)

```prisma
model DjProfileType {
  djProfileId Int
  djProfile   DjProfile @relation(fields: [djProfileId], references: [id], onDelete: Cascade)
  type        DjType    // CLUB, WEDDING, FESTIVAL, CORPORATE, etc.

  @@id([djProfileId, type])
}
```

#### SocialLink

```prisma
model SocialLink {
  id          Int       @id @default(autoincrement())
  djProfileId Int
  djProfile   DjProfile @relation(fields: [djProfileId], references: [id], onDelete: Cascade)
  platform    String    // instagram, tiktok, youtube, spotify, soundcloud, mixcloud, website
  url         String

  @@unique([djProfileId, platform])
  @@index([djProfileId])
}
```

#### DjRating

```prisma
model DjRating {
  id     Int     @id @default(autoincrement())
  rating Int     // 1-5
  review String?

  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  djProfileId Int
  djProfile   DjProfile @relation(fields: [djProfileId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, djProfileId])
  @@index([djProfileId])
}
```

#### DjFollow (Follow System)

```prisma
model DjFollow {
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  djProfileId Int
  djProfile   DjProfile @relation(fields: [djProfileId], references: [id], onDelete: Cascade)
  followedAt  DateTime @default(now())

  @@id([userId, djProfileId])
  @@index([djProfileId])
  @@index([userId])
}
```

### Premium-Only Models

#### DjPackage (Pricing Packages)

```prisma
model DjPackage {
  id        Int      @id @default(autoincrement())
  name      String
  priceFrom Int
  priceTo   Int?
  currency  String   @default("USD")
  duration  String?
  features  String[]
  popular   Boolean  @default(false)
  sortOrder Int      @default(0)

  djProfileId Int
  djProfile   DjProfile @relation(fields: [djProfileId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([djProfileId])
}
```

**Note:** Duration is stored as a single string field (e.g., "3-4 hours", "2 hours"). Display format preserves the input, with hyphens replaced by en-dashes for consistency.

#### DjCareerHighlight

```prisma
model DjCareerHighlight {
  id          Int     @id @default(autoincrement())
  year        String
  title       String
  description String?

  djProfileId Int
  djProfile   DjProfile @relation(fields: [djProfileId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([djProfileId])
}
```

#### DjEndorsement

```prisma
model DjEndorsement {
  id      Int     @id @default(autoincrement())
  name    String
  role    String
  company String?
  quote   String
  avatar  String?

  djProfileId Int
  djProfile   DjProfile @relation(fields: [djProfileId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([djProfileId])
}
```

#### DjPress

```prisma
model DjPress {
  id     Int     @id @default(autoincrement())
  source String
  type   String  // Feature, Interview, Podcast
  title  String
  date   String?
  url    String?

  djProfileId Int
  djProfile   DjProfile @relation(fields: [djProfileId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([djProfileId])
}
```

#### DjVenue (Where I've Played)

```prisma
model DjVenue {
  id          Int     @id @default(autoincrement())
  venueName   String
  eventDate   String? // YYYY-MM format or full date
  description String?

  countryId Int
  country   Country @relation(fields: [countryId], references: [id])
  cityId    Int
  city      City    @relation(fields: [cityId, countryId], references: [id, countryId])

  djProfileId Int
  djProfile   DjProfile @relation(fields: [djProfileId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([djProfileId])
  @@index([countryId])
  @@index([cityId])
}
```

#### ProfileView (Analytics)

```prisma
model ProfileView {
  id       Int     @id @default(autoincrement())
  viewerId String? // user id if logged in
  viewerIp String?
  source   String? // direct, search, social, referral
  city     String?
  country  String?

  djProfileId Int
  djProfile   DjProfile @relation(fields: [djProfileId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([djProfileId])
  @@index([createdAt])
  @@index([viewerId])
}
```

---

## 3. Profile Status Lifecycle

### Status Enum

```prisma
enum DjProfileStatus {
  PENDING_APPROVAL
  APPROVED
  REJECTED
}
```

### Status Transitions

```
PENDING_APPROVAL → APPROVED    (Admin approval)
PENDING_APPROVAL → REJECTED    (Admin rejection)
APPROVED         → HIDDEN      (Admin hides without changing status)
REJECTED         → PENDING_APPROVAL (DJ resubmits after fixes)
```

### Status Behavior

| Status           | Public Visibility | Can Edit | Can Apply to Gigs | Can Create Events |
| ---------------- | ----------------- | -------- | ----------------- | ----------------- |
| PENDING_APPROVAL | No (owner only)   | Yes      | No                | No                |
| APPROVED         | Yes               | Yes      | Yes               | Yes               |
| REJECTED         | No (owner only)   | Yes      | No                | No                |
| HIDDEN\*         | No (owner only)   | Yes      | No                | No                |

\*HIDDEN is a boolean flag, not a status. Admin can hide APPROVED profiles without changing their approval status.

### Admin Approval Workflow

1. DJ submits profile via `/become-dj` → status = `PENDING_APPROVAL`
2. Admin receives `DJ_REGISTRATION` notification
3. Admin reviews profile in `/admin/djs/[djId]`
4. Admin approves → status = `APPROVED`, sends `PROFILE_APPROVED` email + notification
5. Admin rejects → status = `REJECTED`, sends `PROFILE_REJECTED` email + notification
6. DJ can edit and resubmit rejected profiles

---

## 4. Plan Tiers: Free vs Premium

### Plan Enum

```prisma
enum DjPlan {
  FREE
  PREMIUM
}
```

### Feature Comparison

| Feature                       | Free | Premium                        |
| ----------------------------- | ---- | ------------------------------ |
| **Media Limits**              |      |                                |
| Max photos                    | 6    | Unlimited                      |
| Max videos                    | 1    | Unlimited                      |
| Max audio mixes               | 1    | Unlimited                      |
| **Discovery**                 |      |                                |
| Featured placement            | ❌   | ✅ (homepage rotation)         |
| Priority search ranking       | ❌   | ✅ (boosted score)             |
| Verified badge                | ❌   | ✅ (blue checkmark)            |
| **Profile Sections**          |      |                                |
| Basic info (bio, location)    | ✅   | ✅                             |
| Genres & DJ types             | ✅   | ✅                             |
| Social links                  | ✅   | ✅                             |
| Media gallery                 | ✅   | ✅                             |
| Events (upcoming/past)        | ✅   | ✅                             |
| Pricing packages              | ❌   | ✅                             |
| Career highlights             | ❌   | ✅                             |
| Endorsements                  | ❌   | ✅                             |
| Press & media coverage        | ❌   | ✅                             |
| Where I've played (venues)    | ❌   | ✅                             |
| **Analytics**                 |      |                                |
| Profile views                 | ❌   | ✅ (monthly views + breakdown) |
| Response rate stats           | ❌   | ✅                             |
| Booking success rate          | ❌   | ✅                             |
| **Booking Tools**             |      |                                |
| Receive booking inquiries     | ✅   | ✅                             |
| Availability calendar         | ❌   | ✅                             |
| Team contacts (manager/agent) | ❌   | ✅                             |
| Featured mix/video spotlight  | ❌   | ✅                             |

### Plan Feature Gates

Implementation in `src/lib/plan-features.ts`:

```typescript
export const PLAN_FEATURES: Record<DjPlanTier, PlanFeatures> = {
  FREE: {
    maxPhotos: 6,
    maxVideos: 1,
    maxMixes: 1,
    featuredPlacement: false,
    prioritySearchRanking: false,
    verifiedBadge: false,
    advancedProfileSections: false,
    analyticsAccess: false,
    responseRateStats: false,
    bookingInquiries: true,
    availabilityCalendar: false,
    advancedBookingTools: false,
  },
  PREMIUM: {
    maxPhotos: Infinity,
    maxVideos: Infinity,
    maxMixes: Infinity,
    featuredPlacement: true,
    prioritySearchRanking: true,
    verifiedBadge: true,
    advancedProfileSections: true,
    analyticsAccess: true,
    responseRateStats: true,
    bookingInquiries: true,
    availabilityCalendar: true,
    advancedBookingTools: true,
  },
};
```

---

## 5. DJ Onboarding Flow

### Route: `/become-dj`

### Required Fields for Profile Creation

| Field         | Validation                                | Notes                                     |
| ------------- | ----------------------------------------- | ----------------------------------------- |
| `stageName`   | 2-50 chars, alphanumeric + spaces/hyphens | URL-friendly slug auto-generated          |
| `countryId`   | Required                                  | Must select from Country dropdown         |
| `cityId`      | Required                                  | Dynamically loaded based on country       |
| `djTypes`     | 1-5 selections                            | Multi-select from DJ_TYPES config         |
| `genreNames`  | 1-5 selections                            | Multi-select, creates Genre if not exists |
| `socialLinks` | 1-7 links                                 | At least one required                     |

### Optional Fields

| Field               | Validation                       |
| ------------------- | -------------------------------- |
| `bio`               | Max 500 chars                    |
| `experienceYears`   | 0-50, integer                    |
| `feeMin` / `feeMax` | Integer, min ≤ max validation    |
| `feeCurrency`       | 3-char ISO code (auto-suggested) |
| `bookingEmail`      | Valid email                      |
| `bookingPhone`      | Phone string                     |
| `avatar`            | Image upload (max 5MB)           |
| `coverImage`        | Image upload (max 5MB)           |
| `media`             | Array of uploaded media items    |

### Onboarding Steps

1. **Auth Check:** User must be authenticated, redirected to `/sign-in` if not
2. **Role Check:** User must not already have a DJ profile
3. **Form Submission:**
   - Client-side validation via Zod schema (`CreateDjProfileSchema`)
   - Media uploads to Supabase Storage (temp bucket)
   - Server action `createDjProfile()` creates profile
4. **Slug Generation:** Auto-generated from stageName, made unique if collision
5. **Experience Level:** Auto-calculated from `experienceYears`:
   - 0-1 years: `BEGINNER`
   - 2-4 years: `INTERMEDIATE`
   - 5-9 years: `PROFESSIONAL`
   - 10+ years: `EXPERT`
6. **Status Set:** `PENDING_APPROVAL`
7. **Admin Notification:** `DJ_REGISTRATION` notification sent to admins
8. **Redirect:** To `/dashboard/dj` with "Profile submitted for approval" message

### DJ Types Configuration

Defined in `src/config/dj-types.ts`:

```typescript
export const DJ_TYPES = [
  { value: "WEDDING", label: "Wedding", icon: "💍" },
  { value: "CLUB", label: "Club", icon: "🎛️" },
  { value: "CORPORATE", label: "Corporate", icon: "🏢" },
  { value: "FESTIVAL", label: "Festival", icon: "🎪" },
  { value: "PRIVATE_PARTY", label: "Private Party", icon: "🎉" },
  { value: "BAR_LOUNGE", label: "Lounge / Bar", icon: "🍸" },
  { value: "BIRTHDAY", label: "Birthday", icon: "🎂" },
  { value: "CULTURAL_EVENT", label: "Cultural Event", icon: "🌍" },
] as const;
```

### Social Platforms

Supported platforms with icon mapping:

```typescript
const SOCIAL_PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "spotify", label: "Spotify" },
  { value: "soundcloud", label: "SoundCloud" },
  { value: "mixcloud", label: "Mixcloud" },
  { value: "website", label: "Website" },
];
```

---

## 6. Profile Management

### Edit Route: `/djs/[slug]/edit`

### Edit Permissions

- Only profile owner can edit
- Admin can edit any profile via `/admin/djs/[djId]`
- Status `PENDING_APPROVAL` and `APPROVED` both allow editing
- `REJECTED` profiles can be edited and resubmitted

### Edit Sections

#### Basic Info (All Plans)

- Stage name (slug auto-updated if changed)
- Bio
- Experience years
- Location (country/city)
- Avatar upload
- Cover image upload

#### Pricing & Contact (All Plans)

- Fee range (min/max)
- Currency
- Booking email
- Booking phone

#### Genres & DJ Types (All Plans)

- Add/remove genres (max 5)
- Add/remove DJ types (max 5)

#### Social Links (All Plans)

- Add/remove social links (max 7)
- Update URLs

#### Media Gallery (Plan Limits Apply)

- Upload photos/videos/audio
- Delete media items
- Reorder (via sortOrder)

#### Premium-Only Sections

- **Booking Packages** - Pricing packages with duration strings (e.g., "3-4 hours"), managed via PackageModal in profile view
- Career highlights
- Endorsements
- Press & media coverage
- Where I've played (venues)
- Team contacts (manager/agent)
- Availability calendar
- Featured mix/video spotlight

**Note:** Booking Packages are managed via a modal in the owner's profile view (similar to Where I've Played), not in the edit form. The modal allows DJs to add/edit/delete packages with duration strings (e.g., "3-4 hours"), price ranges, features, and popularity flags.

### Validation

Server-side validation via `UpdateDjProfileSchema` in `src/lib/validations/dj-profile.ts`.

### Slug Changes

If stage name changes, slug is regenerated:

- Base slug from new stage name
- Collision detection with existing slugs
- Appends `-2`, `-3`, etc. if needed
- Old slug redirects to new slug (future: implement redirect table)

---

## 7. Public Profile Display

### Route: `/djs/[slug]`

### View Modes

The profile page supports different view modes based on visitor:

| View Mode   | Visitor Type        | Capabilities                                  |
| ----------- | ------------------- | --------------------------------------------- |
| `dj-owner`  | Profile owner (DJ)  | Edit button, full analytics, owner-only CTAs  |
| `fan`       | Logged-in fan       | Follow button, save events, view full content |
| `organizer` | Logged-in organizer | Book DJ CTA, view contact info (if released)  |
| `guest`     | Not logged in       | Limited view, CTAs gated behind auth          |

### Profile Sections (Free Plan)

1. **Hero Section**
   - Cover image (gradient fallback if none)
   - Avatar (circle, overlaid on cover)
   - Stage name
   - Location (city, country)
   - Status badges (Verified if APPROVED)
   - Follow button (for non-owners)
   - Share button
   - Reputation badge
   - Action buttons (Edit for owner, Book for organizers)

2. **About Section**
   - Bio
   - Experience years
   - Experience level badge
   - DJ types (as badges)
   - Genres (as badges)

3. **Stats Bar**
   - Followers count
   - Events count
   - Average rating (with star display)
   - Review count

4. **Media Gallery**
   - Photos (grid layout)
   - Videos (with play overlay)
   - Audio mixes (with player)
   - Lightbox for photos
   - Video modal for embeds

5. **Events Section**
   - Featured performances (pinned, max 3)
   - Upcoming events (date-ascending)
   - Past events (date-descending)
   - Empty state for owner if no events

6. **Reviews Section**
   - Star rating summary
   - Recent reviews (avatar, name, rating, review text, date)
   - "Write a review" CTA (for logged-in users who hired the DJ)

### Profile Sections (Premium Plan)

All Free sections plus:

7. **Pricing Packages**
   - Package cards (name, price range, duration, features)
   - "Popular" badge on highlighted package
   - "Book this package" CTA

8. **Career Highlights**
   - Timeline view by year
   - Title and description for each highlight

9. **Endorsements**
   - Quote cards with endorser info
   - Avatar, name, role, company
   - Quote text

10. **Press & Media**
    - List of press features
    - Source, type, title, date
    - External link to article

11. **Where I've Played (Venues)**
    - List of venues with event dates
    - Location (city, country)
    - Description optional

12. **Team Contacts**
    - Manager info (name, email, phone)
    - Agent info (name, agency, email)
    - Visible only to organizers who have accepted booking inquiry

13. **Availability Calendar**
    - Monthly calendar view
    - Available/unavailable day indicators
    - Timezone selector

14. **Featured Spotlight**
    - Featured mix (audio player with play count)
    - Featured video (embed with view count)
    - Prominent placement in hero or dedicated section

15. **Analytics Dashboard** (Owner Only)
    - Profile views (monthly chart)
    - Geographic breakdown
    - Source breakdown (direct, search, social, referral)
    - Response rate
    - Booking success rate

### Responsive Design

- **Mobile:** Single column, stacked sections, bottom navigation
- **Tablet:** Two-column layout for media gallery
- **Desktop:** Multi-column layout, hero with overlay text, grid for media

### Demo Profiles

For development/staging, demo profiles are available:

- `/djs/demo-free` — Free plan example
- `/djs/demo-premium` — Premium plan example

Demo data defined in `src/data/djscovery_seed_1.json` and loaded via `src/data/djs.ts`.

---

## 8. Premium Features

### Pricing Packages

**Purpose:** Let DJs define service packages with clear pricing.

**Fields:**

- Name (e.g., "Wedding Package", "Club Set")
- Price range (from/to, optional)
- Currency
- Duration string (e.g., "2 hours", "3-4 hours")
- Features list (e.g., ["MC included", "Sound system provided"])
- Popular badge (highlight one package)

**Display:** Cards on profile, "Book this package" button opens booking inquiry pre-filled.

**Management:** CRUD via PremiumProfileManager component.

### Career Highlights

**Purpose:** Showcase key career milestones.

**Fields:**

- Year (e.g., "2024")
- Title (e.g., "Residency at Pacha Ibiza")
- Description (optional)

**Display:** Timeline view, sorted by year descending.

**Management:** Add/edit/delete via PremiumProfileManager.

### Endorsements

**Purpose:** Social proof from industry figures.

**Fields:**

- Name
- Role (e.g., "Club Manager", "Festival Director")
- Company (optional)
- Quote
- Avatar (optional)

**Display:** Quote cards with endorser info.

**Management:** Add/edit/delete via PremiumProfileManager.

### Press & Media

**Purpose:** Showcase media coverage and features.

**Fields:**

- Source (e.g., "Mixmag", "Resident Advisor")
- Type (Feature, Interview, Podcast)
- Title
- Date (optional)
- URL (optional)

**Display:** List with external links.

**Management:** Add/edit/delete via PremiumProfileManager.

### Where I've Played (Venues)

**Purpose:** Build credibility through venue history.

**Fields:**

- Venue name
- Event date (YYYY-MM or full date)
- Description (optional)
- Location (country/city)

**Display:** List of venues with dates and locations.

**Management:** Add/edit/delete via VenueModal component.

### Team Contacts

**Purpose:** Provide alternative contacts for bookings.

**Fields:**

- Manager (name, email, phone)
- Agent (name, agency, email)

**Visibility:** Only shown to organizers after booking inquiry acceptance (contactReleasedAt set).

**Management:** Edit via PremiumProfileManager.

### Availability Calendar

**Purpose:** Let organizers know when DJ is available.

**Fields:**

- Timezone
- Month (e.g., "2025-09")
- Days array (JSON: [{day: 1, status: "available"}, ...])

**Display:** Monthly calendar grid with green/red indicators.

**Management:** Edit via PremiumProfileManager.

### Featured Spotlight

**Purpose:** Highlight best mix or video.

**Fields:**

- Mix: title, audio URL, duration, play count
- Video: title, URL, thumbnail, duration, view count

**Display:** Prominent player in hero or dedicated section.

**Management:** Edit via PremiumProfileManager.

---

## 9. Media Management

### Media Types

```prisma
enum MediaType {
  IMAGE
  VIDEO
  AUDIO
}
```

### Storage Architecture

**Bucket:** `djscovery-media` (single public bucket)

**Path Pattern:**

```
djs/{djProfileId}/avatar/avatar-{uuid}.{ext}
djs/{djProfileId}/cover/cover-{uuid}.{ext}
djs/{djProfileId}/gallery/gallery-{uuid}.{ext}
```

### Upload Limits

| Plan    | Photos | Videos | Audio |
| ------- | ------ | ------ | ----- |
| Free    | 6      | 1      | 1     |
| Premium | ∞      | ∞      | ∞     |

### File Size Limits

- All files: Max 5MB per file
- Validated server-side before upload

### Supported Formats

- **Images:** JPG, PNG, WebP
- **Videos:** MP4, WebM (external links for YouTube/Vimeo/TikTok/Instagram)
- **Audio:** MP3, WAV (external links for SoundCloud/Mixcloud)

### Upload Flow

1. User selects file(s) in EditDjProfileForm
2. Client validates file size and type
3. Upload to Supabase Storage via `uploadDjAvatar()`, `uploadDjCover()`, `uploadDjGalleryImage()`
4. Server returns public URL and storage path
5. Create Media record in database
6. Update DjProfile with new avatar/cover URL/path
7. On re-upload, delete old file from Storage using stored path

### Video Embeds

For external video links (YouTube, Vimeo, TikTok, Instagram), MediaVideoModal builds provider-specific embeds. Fallback to direct link if embedding fails.

### Audio Player

MediaAudioPlayer component for audio files with play/pause, progress, and volume controls.

### Gallery Lightbox

MediaGalleryLightbox component for viewing photos in full-screen overlay with navigation.

---

## 10. Social Links

### Supported Platforms

| Platform   | Icon | URL Pattern Example                |
| ---------- | ---- | ---------------------------------- |
| Instagram  | 📷   | https://instagram.com/username     |
| TikTok     | 🎵   | https://tiktok.com/@username       |
| YouTube    | ▶️   | https://youtube.com/@username      |
| Spotify    | 🎧   | https://open.spotify.com/artist/id |
| SoundCloud | ☁️   | https://soundcloud.com/username    |
| Mixcloud   | 🎚️   | https://mixcloud.com/username      |
| Website    | 🔗   | https://example.com                |

### Validation

- URL must start with `http://` or `https://`
- Platform must be one of the supported values
- Max 7 social links per profile
- One link per platform (unique constraint)

### Display

- Icons rendered based on platform string
- Links open in new tab
- Hover effects with platform-specific colors

### Management

Add/remove/edit via EditDjProfileForm social links section.

---

## 11. Genres & DJ Types

### Genres

**Model:**

```prisma
model Genre {
  id       Int       @id @default(autoincrement())
  name     String    @unique // e.g. "Afrobeat", "House", "Amapiano"
  djGenres DjGenre[]
}
```

**Junction:**

```prisma
model DjGenre {
  djProfileId Int
  djProfile   DjProfile @relation(fields: [djProfileId], references: [id], onDelete: Cascade)
  genreId     Int
  genre       Genre     @relation(fields: [genreId], references: [id], onDelete: Cascade)

  @@id([djProfileId, genreId])
}
```

**Creation:**

- If genre doesn't exist, `getOrCreateGenre()` creates it
- Case-insensitive matching prevents duplicates
- Admin-managed list (future: admin UI for genre management)

**Limits:**

- Min 1 genre required
- Max 5 genres per profile

### DJ Types

**Enum:**

```prisma
enum DjType {
  CLUB
  WEDDING
  FESTIVAL
  CORPORATE
  BAR_LOUNGE
  PRIVATE_PARTY
  BIRTHDAY
  CULTURAL_EVENT
}
```

**Junction:**

```prisma
model DjProfileType {
  djProfileId Int
  djProfile   DjProfile @relation(fields: [djProfileId], references: [id], onDelete: Cascade)
  type        DjType

  @@id([djProfileId, type])
}
```

**Limits:**

- Min 1 DJ type required
- Max 5 DJ types per profile

**Display:**

- Badges with icons on profile
- Used for filtering in directory

---

## 12. Reputation System

### Reputation Score

**Range:** 0-1000

**Components:**

- Profile Quality Score (0-150)
- Verification Score (0-50)
- Review Score (based on ratings)
- Reliability Score (based on gig completion)
- Activity Score (based on events, media updates)
- New Talent Boost (for new DJs)

**Calculation:**
Implemented in `src/lib/reputation/update.ts`.

**Display:**

- ReputationBadge component shows tier (Bronze, Silver, Gold, Platinum)
- ScoreBreakdown component shows detailed breakdown (owner only)

### Search Score

**Purpose:** Denormalized score for search ranking.

**Factors:**

- Reputation total score (60%)
- Recency boost (20%)
- Verified boost (10%)
- Featured boost (10%)

**Update:**
Triggered on profile changes, new reviews, events.

### Ratings

**Model:**

```prisma
model DjRating {
  id     Int     @id @default(autoincrement())
  rating Int     // 1-5
  review String?

  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  djProfileId Int
  djProfile   DjProfile @relation(fields: [djProfileId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, djProfileId])
  @@index([djProfileId])
}
```

**Rules:**

- One rating per user per DJ
- User can update their rating
- Rating deletion not allowed (update instead)
- Only users who have hired the DJ can rate (future: enforce via Hire model)

**Display:**

- Star rating summary (average, count)
- Individual reviews with avatar, name, rating, review text, date

---

## 13. Follow System

### Model

```prisma
model DjFollow {
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  djProfileId Int
  djProfile   DjProfile @relation(fields: [djProfileId], references: [id], onDelete: Cascade)
  followedAt  DateTime @default(now())

  @@id([userId, djProfileId])
  @@index([djProfileId])
  @@index([userId])
}
```

### Actions

Implemented in `src/lib/actions/follows.ts`:

- `toggleFollowDj()` — Follow/unfollow, returns `{ following: boolean }`
- `isFollowingDj()` — Check if user follows DJ
- `getFollowedDjIds()` — Get list of followed DJ IDs
- `getFollowedDjs()` — Get full DJ profiles with follow metadata
- `unfollowDj()` — Remove follow

### Limits

- Fans: FOLLOWS_LIMIT = 200 DJs
- DJs: No limit on followers

### Display

- Follow button on DJ profile (Follow/Following state)
- Follower count in stats bar
- Followed DJs list in organizer hub (`/organizer/followed-djs`)

### Notifications

- `DJ_NEW_MEDIA` — When followed DJ adds media
- `DJ_PROFILE_UPDATED` — When followed DJ updates profile (future)

---

## 14. Booking Integration

### Booking Inquiries

**Model:**

```prisma
model BookingInquiry {
  id                Int                  @id @default(autoincrement())
  status            BookingInquiryStatus @default(PENDING)
  eventName         String
  eventDate         DateTime?
  venue             String?
  countryName       String?
  cityName          String?
  crowdSize         Int?
  budgetType        BudgetType           @default(NEGOTIABLE)
  budgetMin         Int?
  budgetMax         Int?
  budgetCurrency    String?              @db.VarChar(10)
  message           String
  contactReleasedAt DateTime?
  lastRespondedAt   DateTime?

  djProfileId Int
  djProfile   DjProfile @relation("DjProfileBookingInquiries", fields: [djProfileId], references: [id], onDelete: Cascade)

  organizerId String
  organizer   User   @relation("OrganizerBookingInquiries", fields: [organizerId], references: [id], onDelete: Cascade)

  messages BookingInquiryMessage[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Status:**

- `PENDING` — Initial state
- `ACCEPTED` — DJ accepted, contact info released
- `DECLINED` — DJ declined
- `CANCELLED` — Cancelled by either party

**Flow:**

1. Organizer clicks "Book DJ" on profile
2. Opens booking modal (auth/role gated)
3. Fills booking form (event details, budget, message)
4. Creates BookingInquiry record
5. DJ receives `BOOKING_INQUIRY` notification
6. DJ responds via messaging system
7. On acceptance, `contactReleasedAt` set, DJ's contact info visible to organizer

**Permissions:**

- Only organizer and related DJ can read their booking threads
- RLS policies enforce this

### Booking CTA

**Component:** BookCTA

**Behavior:**

- Opens modal instead of mailto
- Auth gating: redirects to sign-in if not logged in
- Role gating: only organizers can book
- Pre-fills DJ info from profile

---

## 15. Events Integration

### Event Ownership

**Relation:**

```prisma
model DjProfile {
  eventsOwned Event[] @relation("EventOwner")
}

model Event {
  ownerDjId Int
  ownerDj   DjProfile @relation("EventOwner", fields: [ownerDjId], references: [id])
}
```

### Event Participation

**Relation:**

```prisma
model DjProfile {
  events EventDj[]
}

model EventDj {
  eventId     Int
  event       Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  djProfileId Int
  djProfile   DjProfile @relation(fields: [djProfileId], references: [id], onDelete: Cascade)
  role        String? // e.g. "Headliner", "Support", "B2B"

  @@id([eventId, djProfileId])
}
```

### Display on Profile

- **Featured Performances:** Pinned events (max 3)
- **Upcoming Events:** Date-ascending, status = PUBLISHED, startDate > now()
- **Past Events:** Date-descending, status = COMPLETED or PUBLISHED with startDate < now()

### Event Reviews

**Relation:**

```prisma
model DjProfile {
  eventReviews EventReview[]
}

model EventReview {
  id     Int     @id @default(autoincrement())
  rating Int // 1-5
  review String?

  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  eventId     Int
  event       Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  djProfileId Int
  djProfile   DjProfile @relation(fields: [djProfileId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, eventId, djProfileId])
  @@index([eventId])
  @@index([djProfileId])
  @@index([userId])
}
```

**Rules:**

- One review per user per event per DJ
- Contributes to DJ's overall rating and reputation

---

## 16. Analytics & Tracking

### Profile Views

**Model:**

```prisma
model ProfileView {
  id       Int     @id @default(autoincrement())
  viewerId String? // user id if logged in
  viewerIp String?
  source   String? // direct, search, social, referral
  city     String?
  country  String?

  djProfileId Int
  djProfile   DjProfile @relation(fields: [djProfileId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([djProfileId])
  @@index([createdAt])
  @@index([viewerId])
}
```

**Tracking:**

- ProfileViewTracker component tracks views on mount
- Only tracks for APPROVED, non-hidden profiles
- Uses `sendBeacon` for reliable tracking
- API endpoint: `/api/track-profile-view`

**Display:**

- Premium plan: monthly views chart
- Premium plan: geographic breakdown
- Premium plan: source breakdown

### Monthly Views

**Denormalized Field:**

```prisma
model DjProfile {
  monthlyViews Int @default(0)
}
```

**Update:**

- Cron job or on-demand calculation from ProfileView records
- Resets monthly (future: implement reset logic)

### Response Rate

**Calculation:**

- Based on booking inquiry response time
- Percentage of inquiries responded to within 24h

**Display:**

- Premium plan only
- Stats bar on profile

### Booking Success Rate

**Calculation:**

- Based on gig applications accepted vs total applications

**Display:**

- Premium plan only
- Stats bar on profile

---

## 17. Security & Permissions

### Ownership Validation

- All profile mutations validate `userId` matches authenticated user
- Server actions only — no client-side Supabase calls for mutations
- Pattern: same as other profile types (organizer, fan)

### Edit Permissions

| User Type | Can Edit Own Profile | Can Edit Others | Can Change Status |
| --------- | -------------------- | --------------- | ----------------- |
| DJ Owner  | ✅                   | ❌              | ❌                |
| Admin     | ✅                   | ✅              | ✅                |
| Fan       | ❌                   | ❌              | ❌                |
| Organizer | ❌                   | ❌              | ❌                |

### Public Access Rules

| Status   | Public Visibility | Searchable | Directory |
| -------- | ----------------- | ---------- | --------- |
| APPROVED | ✅                | ✅         | ✅        |
| PENDING  | ❌ (owner only)   | ❌         | ❌        |
| REJECTED | ❌ (owner only)   | ❌         | ❌        |
| HIDDEN\* | ❌ (owner only)   | ❌         | ❌        |

\*HIDDEN is a boolean flag on APPROVED profiles

### Media Upload Permissions

- `djs/{djProfileId}/...` — upload permitted only to profile owner
- Supabase RLS: check `auth.uid()` against `DjProfile.userId`

### Delete Permissions

- Soft delete (`deletedAt = now()`) from UI
- Hard delete available to Admin only
- Deleting profile cascades to:
  - Media records (but not Storage files — cleanup job needed)
  - Social links
  - Genres
  - DJ types
  - Ratings (preserve for historical accuracy? Future decision)
  - Comments
  - Events (owner set to null or cascade? Future decision)

### RLS Policies

Policies defined in `prisma/rls-policies.sql`:

- `DjProfile` — SELECT: APPROVED and not hidden; INSERT: authenticated; UPDATE: owner or admin; DELETE: admin only
- `SocialLink` — All operations via profile owner
- `DjRating` — SELECT: all; INSERT: authenticated; UPDATE: owner; DELETE: none (update instead)
- `DjFollow` — SELECT: all; INSERT: authenticated; DELETE: owner
- `BookingInquiry` — SELECT: organizer or related DJ; INSERT: authenticated organizer; UPDATE: DJ or organizer

---

## 18. API Endpoints

### Server Actions

**Profile Management:**

- `createDjProfile(input)` — Create new profile
- `updateDjProfile(input)` — Update existing profile
- `getDjProfile(slug)` — Get public profile data
- `getDjProfileForEdit(userId)` — Get profile for editing

**Media Upload:**

- `uploadDjAvatar(file, djProfileId)` — Upload avatar
- `uploadDjCover(file, djProfileId)` — Upload cover
- `uploadDjGalleryImage(file, djProfileId)` — Upload gallery image
- `deleteGalleryImage(mediaId)` — Delete gallery image

**Follow System:**

- `toggleFollowDj(djProfileId)` — Follow/unfollow
- `isFollowingDj(djProfileId)` — Check follow status
- `getFollowedDjs()` — Get followed DJs

**Premium Features:**

- `createDjPackage(data)` — Create pricing package
- `updateDjPackage(id, data)` — Update package
- `deleteDjPackage(id)` — Delete package
- `createDjCareerHighlight(data)` — Create highlight
- `createDjEndorsement(data)` — Create endorsement
- `createDjPress(data)` — Create press item
- `createDjVenue(data)` — Create venue

### API Routes

**Tracking:**

- `POST /api/track-profile-view` — Track profile view (authenticated or anonymous)

**Search:**

- `GET /api/search/djs` — Search DJs (filters: country, city, genre, djType, plan)

### Admin Endpoints

**Profile Management:**

- `GET /admin/djs` — List all profiles with filters
- `GET /admin/djs/[djId]` — View profile details
- `POST /admin/djs/[djId]/approve` — Approve profile
- `POST /admin/djs/[djId]/reject` — Reject profile
- `POST /admin/djs/[djId]/hide` — Hide profile
- `POST /admin/djs/[djId]/feature` — Feature profile

---

## 19. Component Architecture

### Profile Components

**Core Components:**

- `DjProfileHero` — Hero section with cover, avatar, stats, CTAs
- `ProfileAbout` — About section with bio, experience, genres, DJ types
- `ProfileReviews` — Reviews section with rating summary and list
- `ProfileEventsSidebar` — Events sidebar (upcoming/past)
- `ProfileVenues` — Where I've played section (Premium)
- `WhereIvePlayed` — Venue list component
- `ProfileViewTracker` — Analytics tracking component

**Free Profile:**

- `DjProfileFree` — Complete Free plan profile layout

**Premium Profile:**

- `DjProfilePremium` — Complete Premium plan profile layout
- `PremiumProfileManager` — Premium sections manager (owner only)

**Edit Components:**

- `EditDjProfileForm` — Full profile edit form
- `VenueModal` — Add/edit venue modal
- `MediaVideoModal` — Video embed modal
- `MediaAudioPlayer` — Audio player component
- `MediaGalleryLightbox` — Photo lightbox

**Action Components:**

- `FollowDjButton` — Follow/unfollow button
- `BookCTA` — Book DJ CTA with modal
- `ShareButton` — Share profile button
- `ReputationBadge` — Reputation tier badge
- `ScoreBreakdown` — Reputation score breakdown

**Shared:**

- `dj-profile-shared.tsx` — Shared utilities and constants (SOCIAL_ICONS, etc.)

### Page Structure

**Public Profile:**

```
/app/djs/[slug]/page.tsx
├── Demo profile handling (demo-free, demo-premium)
├── DB profile lookup
├── View mode detection (dj-owner, fan, organizer, guest)
├── ProfileViewTracker
├── DjProfileFree or DjProfilePremium
└── JsonLd for SEO
```

**Edit Profile:**

```
/app/djs/[slug]/edit/page.tsx
├── Auth check
├── Ownership check
├── EditDjProfileForm
└── Redirect on success
```

**DJ Dashboard:**

```
/app/dashboard/dj/layout.tsx
├── Sidebar navigation
├── Overview
├── Events
├── Applications
├── Bookings
└── Analytics (Premium)
```

### Component Props Patterns

**Hero Component:**

```typescript
type Props = {
  djData: DjDemoData;
  viewMode: ViewMode;
  isFollowed?: boolean;
  reputationScore?: number;
  reputationDetail?: ReputationDetail | null;
  status?: string;
  variant?: "free" | "premium";
};
```

**View Modes:**

```typescript
type ViewMode = "dj-owner" | "fan" | "organizer" | "guest";
```

**BookingPackages Component:**

```typescript
type Package = {
  id: number;
  name: string;
  priceFrom: number;
  priceTo?: number | null;
  currency: string;
  duration?: string | null;
  features: string[];
  popular: boolean;
  icon?: LucideIcon;
};

type Props = {
  packages: Package[];
  onEnquire?: (packageName: string, priceFrom: number) => void;
  openBookingModal?: (packageName?: string, packagePrice?: number) => void;
};
```

**Helper Functions:**

- `formatPrice(priceFrom, currency, priceTo?)` — Formats price range with currency symbol
- `formatDuration(duration?)` — Replaces hyphens with en-dashes for consistency

---

## 20. Technical Notes

### Slug Generation

**Function:** `makeUniqueSlug(stageName, excludeUserId?)`

**Process:**

1. Convert to lowercase
2. Remove special characters (except hyphens, spaces)
3. Trim and replace spaces with hyphens
4. Slice to 60 chars
5. Check for collisions
6. Append `-2`, `-3`, etc. if needed

**Example:**

- Input: "Carl Cox"
- Base: "carl-cox"
- If exists: "carl-cox-2"
- If exists: "carl-cox-3"

### Experience Level Auto-Calculation

**Mapping:**

```typescript
0-1 years   → BEGINNER
2-4 years   → INTERMEDIATE
5-9 years   → PROFESSIONAL
10+ years   → EXPERT
```

**Implementation:** In `createDjProfile` and `updateDjProfile` server actions.

### Currency Auto-Suggestion

**Mapping:** Country → Currency in `COUNTRY_CURRENCIES` constant.

**Example:**

- Sweden → SEK
- United States → USD
- Germany → EUR

**Implementation:** In BecomeDjForm and EditDjProfileForm.

### Storage Path Management

**Pattern:**

- Store both public URL and storage path
- Path used for deletion on re-upload
- Prevents orphaned files in Storage

**Example:**

```
avatar: "https://.../djs/123/avatar/avatar-abc123.jpg"
avatarPath: "djs/123/avatar/avatar-abc123.jpg"
```

### Demo Data

**Files:**

- `src/data/djscovery_seed_1.json` — DJ profiles seed
- `src/data/djs.ts` — Demo data loader (`getDemodjBySlug`)

**Environment:**

- Staging: Demo profiles available via `/djs/demo-free`, `/djs/demo-premium`
- Production: Demo profiles disabled (404)

**Merge Logic:**

- DB profiles take precedence
- Demo profiles only shown if slug not found in DB
- Demo data never inserted into DB

### Email Notifications

**Templates:**

- `adminDjRegistration` — Admin notification of new DJ registration
- `profileApproved` — DJ approval notification
- `profileRejected` — DJ rejection notification

**Triggers:**

- `DJ_REGISTRATION` → Admin on profile creation
- `PROFILE_APPROVED` → DJ on admin approval
- `PROFILE_REJECTED` → DJ on admin rejection

### Search Ranking

**Composite Score Calculation:**

```typescript
searchScore =
  reputationScore * 0.6 +
  recencyBoost * 0.2 +
  verifiedBoost * 0.1 +
  featuredBoost * 0.1;
```

**Verified Boost:** +30 if status = APPROVED
**Featured Boost:** +100 if featured = true
**Recency Boost:** Based on recent activity (events, media updates)

**Implementation:** `src/lib/search/composite-score.ts`

### Follow Limits

**Fans:** Max 200 DJ follows
**DJs:** No limit on followers

**Enforcement:** In `toggleFollowDj` server action.

### Media Limits Enforcement

**Function:** `getMediaLimit(plan, type)`

**Usage:**

- Before upload: check current count vs limit
- Show upgrade CTA if limit reached
- Premium: Infinity (no limit)

### Plan Normalization

**Function:** `normalisePlan(raw)`

**Accepts:** "free"/"FREE", "premium"/"PREMIUM"
**Fallback:** "FREE" for unknown values

**Purpose:** Handle case variations and null values safely.

### Supabase Auth Integration

**User ID Mapping:**

- `DjProfile.userId` matches `User.id` from Supabase Auth
- Ensures profile ownership is tied to auth user

**Auth Checks:**

- All server actions verify `auth.getUser()` before mutations
- Client-side checks redirect unauthenticated users

### Minimum Age Enforcement

**Platform Rule:** 18+ (Swedish law)

**Implementation:**

- Enforced in user registration (Supabase Auth)
- Not explicitly checked in DJ profile creation (assumed already enforced)

### Environment-Specific Behavior

**Staging:**

- Demo profiles available
- Test data visible
- Debug logging enabled

**Production:**

- Demo profiles disabled
- Real data only
- Minimal logging

**Environment Variable:** `NEXT_PUBLIC_APP_ENV` (staging | production)

### Performance Optimizations

**Denormalized Fields:**

- `reputationScore` — Avoid real-time calculation
- `monthlyViews` — Avoid counting ProfileView records
- `searchScore` — Avoid composite score calculation on search

**Indexes:**

- All foreign keys indexed
- Slug indexed for URL lookup
- Status indexed for filtering
- Plan indexed for plan-based queries
- Country/city indexed for location filtering

**Query Optimization:**

- Select only needed fields in public queries
- Use `include` for relations instead of separate queries
- Pagination for large lists (events, reviews)

### Future Enhancements

**Deferred:**

- Profile slug redirects (history table)
- Hard delete cleanup job for Storage files
- Rating preservation on profile deletion
- Event ownership transfer on profile deletion
- Monthly views reset cron job
- Admin UI for genre management
- Profile export/import
- Profile duplication for templates
- Multi-language support
- Advanced search filters
- Profile comparison tool
- Verified badge application flow (manual verification)

**Considered but Not Implemented:**

- Real-time availability (too complex for MVP)
- Video direct uploads (external links sufficient)
- Setlist management (future feature)
- Equipment list (future feature)
- Rider requirements (future feature)
- Integration with external platforms (SoundCloud, Mixcloud API)

---

## Appendix: Quick Reference

### Status Quick Reference

| Status           | Meaning                    | Next Action             |
| ---------------- | -------------------------- | ----------------------- |
| PENDING_APPROVAL | Submitted, awaiting review | Admin approves/rejects  |
| APPROVED         | Live, publicly visible     | DJ can use all features |
| REJECTED         | Needs fixes                | DJ edits and resubmits  |
| HIDDEN           | Admin-hidden (soft)        | Admin unhides           |

### Plan Quick Reference

| Feature          | Free | Premium |
| ---------------- | ---- | ------- |
| Max photos       | 6    | ∞       |
| Max videos       | 1    | ∞       |
| Max mixes        | 1    | ∞       |
| Verified badge   | ❌   | ✅      |
| Analytics        | ❌   | ✅      |
| Premium sections | ❌   | ✅      |
| Availability cal | ❌   | ✅      |
| Team contacts    | ❌   | ✅      |

### URL Routes

| Route                        | Purpose             | Access        |
| ---------------------------- | ------------------- | ------------- |
| `/become-dj`                 | DJ onboarding       | Authenticated |
| `/djs/[slug]`                | Public profile      | Public        |
| `/djs/[slug]/edit`           | Edit profile        | Owner only    |
| `/dashboard/dj`              | DJ dashboard        | DJ only       |
| `/dashboard/dj/events`       | Manage events       | DJ only       |
| `/dashboard/dj/applications` | Gig applications    | DJ only       |
| `/dashboard/dj/bookings`     | Booking inquiries   | DJ only       |
| `/dashboard/dj/analytics`    | Profile analytics   | DJ, Premium   |
| `/admin/djs`                 | Admin DJ management | Admin only    |
| `/admin/djs/[djId]`          | Admin DJ detail     | Admin only    |

### Server Action Quick Reference

| Action                    | File                                 | Purpose                 |
| ------------------------- | ------------------------------------ | ----------------------- |
| `createDjProfile`         | `src/lib/actions/profile.ts`         | Create new DJ profile   |
| `updateDjProfile`         | `src/lib/actions/profile.ts`         | Update existing profile |
| `toggleFollowDj`          | `src/lib/actions/follows.ts`         | Follow/unfollow DJ      |
| `uploadDjAvatar`          | `src/lib/actions/dj-upload.ts`       | Upload avatar           |
| `uploadDjCover`           | `src/lib/actions/dj-upload.ts`       | Upload cover image      |
| `uploadDjGalleryImage`    | `src/lib/actions/dj-upload.ts`       | Upload gallery image    |
| `createDjPackage`         | `src/lib/actions/dj-packages.ts`     | Create pricing package  |
| `createDjCareerHighlight` | `src/lib/actions/dj-highlights.ts`   | Create career highlight |
| `createDjEndorsement`     | `src/lib/actions/dj-endorsements.ts` | Create endorsement      |
| `createDjPress`           | `src/lib/actions/dj-press.ts`        | Create press item       |
| `createDjVenue`           | Inline in venue actions              | Create venue            |

---

**Document End**
