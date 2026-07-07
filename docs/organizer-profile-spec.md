# Organizer Profile — Product Specification & Architecture

**Version:** 1.0  
**Status:** ✅ Implemented (Complete)
**Author:** Cascade (Senior Product Architect)  
**Date:** June 2026
**Last Updated:** July 7, 2026

---

## Table of Contents

1. [Description](#description)
2. [Purpose](#purpose)
3. [Responsibilities](#responsibilities)
4. [User Flows](#user-flows)
5. [Organizer Profile Fields](#organizer-profile-fields)
6. [Public Organizer Profile Page](#public-organizer-profile-page)
7. [Security](#security)
8. [Validation Rules](#validation-rules)
9. [UX Requirements](#ux-requirements)
10. [Technical Architecture](#technical-architecture)
11. [MVP Scope](#mvp-scope)

---

## Description

The Organizer Profile is a secondary entity on DJscovery that enables users who book, hire, or manage DJs to establish a verified, trust-building identity on the platform. It is intentionally lightweight compared to a DJ Profile — organizers are enablers of DJ discovery, not the subject of discovery themselves.

An Organizer Profile is always owned by an existing `User` account. A user may simultaneously hold the `FAN`, `DJ`, and `ORGANIZER` roles — there is no need to create separate accounts.

---

## Purpose

The Organizer Profile exists to:

- **Establish trust** — DJs evaluating a job posting need to know who is behind it. A profile with history, logo, and location is significantly more trustworthy than an anonymous posting.
- **Build reputation** — Organizers who consistently hire and fairly review DJs accumulate a track record that benefits the ecosystem.
- **Reduce friction** — Organizers should be able to post gigs quickly with minimal setup, then enrich their profile over time.
- **Contribute to DJ reputation scores** — Reviews written by verified organizers carry higher weight than anonymous ratings.

---

## Responsibilities

| Responsibility                 | Scope              |
| ------------------------------ | ------------------ |
| Post gigs                      | Core MVP           |
| Hire DJs via gig applications  | Core MVP           |
| Write post-gig reviews for DJs | Phase 2            |
| View their own posted gigs     | Core MVP           |
| View their own hired DJs       | Phase 2            |
| Be discoverable via Gig pages  | Core MVP (passive) |
| Be discoverable via directory  | **Never**          |

---

## User Flows

### Fan becomes Organizer

```
1. Fan is authenticated (has User account, FAN role implied)
2. Fan navigates to Settings → "Become an Organizer"
   OR is redirected via CTA on a Gig listing (future)
3. Fan lands on /become-organizer
4. Fan fills in minimum required fields:
   - Business / Display Name
   - Organizer Type (Individual, Company, Venue, Agency, Festival)
5. Form submits → createOrganizerProfile server action
6. Transaction:
   a. OrganizerProfile upserted (userId unique constraint prevents duplicates)
   b. UserRole upserted with role: "ORGANIZER"
7. Redirect to /organizer/dashboard
8. Dashboard prompts optional profile enrichment (bio, logo, location, website)
```

### DJ becomes Organizer

```
1. DJ is authenticated (has User + DjProfile + DJ role)
2. Same path as Fan → /become-organizer
3. Guard: check if OrganizerProfile already exists → if yes, redirect to /organizer/dashboard
4. DJ fills in minimum required fields
5. Same transaction as above (existing DJ role is untouched)
6. User now has BOTH DJ and ORGANIZER roles
7. Navigation: getNavUser() role priority → DJ takes precedence in nav display
   (role priority order: ADMIN > DJ > ORGANIZER > FAN)
8. Organizer dashboard accessible via profile dropdown / settings
```

**Note on role priority in navigation:** The current `getNavUser()` resolves `navRole` as a single value (DJ wins over ORGANIZER). This is correct behaviour — a DJ-Organizer should primarily see the DJ nav. Organizer-specific features are accessible via a secondary dashboard route, not the primary nav.

### Organizer updates profile

```
1. Organizer navigates to /organizer/settings (or /settings with organizer tab)
2. Page server-fetches OrganizerProfile via Prisma (userId = auth user id)
3. Pre-populates form with existing values
4. Organizer edits any field and saves
5. updateOrganizerProfile server action validates via Zod
6. Prisma update() on OrganizerProfile where { userId: user.id }
7. On slug change (displayName change): makeUniqueOrganizerSlug() regenerates slug
8. Toast: "Profile updated"
9. If slug changed: redirect to new public URL
```

### Organizer views their public profile

```
1. Organizer is on any page with their slug
2. URL: /organizers/[slug]
3. Page fetches OrganizerProfile by slug
4. If profile status is ACTIVE → render public page
5. If profile status is PENDING or SUSPENDED → show 404 / "Profile not available"
6. Public profile shows: hero, about, active gigs, completed gigs, review placeholder
7. Sensitive fields (email, phone) are hidden from public view
8. "Contact" button → mailto: for MVP, BookingInquiry in Phase 3
```

**Important:** The URL `/organizers/[slug]` is NOT linked from any directory or search. It is only surfaced from:

- Gig detail pages (`/gigs/[id]` → Organizer Name → links to this page)
- Future: completed gig records
- Future: DJ review pages (showing which organizer left the review)

---

## Organizer Profile Fields

### MVP Required Fields

| Field Name      | Data Type              | Validation Rules                                           | Public | Editable      |
| --------------- | ---------------------- | ---------------------------------------------------------- | ------ | ------------- |
| `displayName`   | `String`               | min 2, max 80 chars                                        | ✅ Yes | ✅ Yes        |
| `organizerType` | `OrganizerType` enum   | must be valid enum value                                   | ✅ Yes | ✅ Yes        |
| `slug`          | `String`               | auto-generated from displayName, unique, URL-safe, max 100 | ✅ Yes | ❌ No (auto)  |
| `userId`        | `String`               | FK → User.id                                               | ❌ No  | ❌ No         |
| `status`        | `OrganizerStatus` enum | PENDING / ACTIVE / SUSPENDED                               | ❌ No  | ❌ No (admin) |
| `createdAt`     | `DateTime`             | auto                                                       | ❌ No  | ❌ No         |
| `updatedAt`     | `DateTime`             | auto                                                       | ❌ No  | ❌ No         |

### MVP Optional Fields

| Field Name      | Data Type               | Validation Rules                                         | Public    | Editable |
| --------------- | ----------------------- | -------------------------------------------------------- | --------- | -------- |
| `bio`           | `String?`               | max 600 chars                                            | ✅ Yes    | ✅ Yes   |
| `logoUrl`       | `String?`               | valid URL, Supabase Storage path, max 5MB, jpg/png/webp  | ✅ Yes    | ✅ Yes   |
| `coverImageUrl` | `String?`               | valid URL, Supabase Storage path, max 10MB, jpg/png/webp | ✅ Yes    | ✅ Yes   |
| `website`       | `String?`               | valid URL, must begin with https://, max 200 chars       | ✅ Yes    | ✅ Yes   |
| `countryId`     | `Int?`                  | FK → Country.id                                          | ✅ Yes    | ✅ Yes   |
| `cityId`        | `Int?`                  | FK → City.id, must belong to countryId                   | ✅ Yes    | ✅ Yes   |
| `contactEmail`  | `String?`               | valid email, max 100 chars                               | ❌ Hidden | ✅ Yes   |
| `phone`         | `String?`               | max 30 chars, digits/spaces/+()- only                    | ❌ Hidden | ✅ Yes   |
| `socialLinks`   | `OrganizerSocialLink[]` | platform enum, valid URL per entry, max 6 entries        | ✅ Yes    | ✅ Yes   |

**Note on `contactEmail`:** This is stored in the DB but never rendered in the public profile HTML. It is used server-side only for the future BookingInquiry feature. For MVP, organizers are contacted via their public `website` link.

**Note on `phone`:** Stored, never rendered publicly. Reserved for admin-moderation and future verified-contact flows.

### Future Premium Fields

| Field Name        | Data Type            | Purpose                            | Notes                              |
| ----------------- | -------------------- | ---------------------------------- | ---------------------------------- |
| `plan`            | `OrganizerPlan` enum | FREE / PREMIUM / AGENCY            | Already planned in schema comments |
| `verified`        | `Boolean`            | Admin-verified badge               | Same pattern as DjProfile.verified |
| `featured`        | `Boolean`            | Boost on gig listings              | Paid feature                       |
| `teamSize`        | `String?`            | "1-5", "6-20", "20+"               | Company organizers                 |
| `yearsActive`     | `Int?`               | Experience indicator               | Trust signal                       |
| `portfolioLinks`  | `Json?`              | Past event URLs / press            | Paid tier                          |
| `responseRate`    | `Float?`             | % of gig applications responded to | Computed field                     |
| `avgResponseTime` | `Int?`               | Hours to first response            | Computed field                     |
| `totalGigsPosted` | `Int`                | Denormalized count                 | Cache for perf                     |
| `totalDJsHired`   | `Int`                | Denormalized count                 | Cache for perf                     |

---

## Public Organizer Profile Page

**Route:** `/organizers/[slug]`  
**Accessibility:** Public (no auth required to view), but only reachable via linked surfaces — not indexed in a directory.  
**SEO:** Yes — unique slug, meta title, meta description from bio.

### Hero Section

```
┌─────────────────────────────────────────────────────┐
│ [Cover Image — full width, 320px tall]               │
│                                                     │
│   [Logo / Avatar — 96px circle, bottom-left offset] │
│                                                     │
│   [Display Name — H1]                               │
│   [Organizer Type badge — e.g. "Festival"]           │
│   [Location — Country · City]                        │
│   [Member since — "Organizer since Jan 2025"]        │
│   [Website button] [Social link icons]               │
└─────────────────────────────────────────────────────┘
```

**What is public:** displayName, organizerType, location (country + city), logoUrl, coverImageUrl, website, socialLinks, createdAt (formatted).  
**What is hidden:** contactEmail, phone, userId, status.

### About Section

```
┌─────────────────────────────────────────────┐
│ About                                        │
│ [Bio — max 600 chars, line breaks preserved] │
│                                             │
│ [Empty state if no bio: "No bio added yet"] │
└─────────────────────────────────────────────┘
```

Only shown if `bio` is set. Empty state is a subtle placeholder — not an error.

### Active Gigs Section

```
┌─────────────────────────────────────────────┐
│ Active Gigs  [count badge]                   │
│                                             │
│ [GigCard] [GigCard] [GigCard]               │
│                                             │
│ [Empty state: "No active gigs at this time"]│
└─────────────────────────────────────────────┘
```

Fetches `Job` records where `organizerProfileId = profile.id` AND `status = OPEN`.  
GigCard shows: title, location, budget range (if set), application count (private — count visible only to owner).

### Completed Gigs Section

```
┌─────────────────────────────────────────────┐
│ Past Gigs  [count badge]                     │
│                                             │
│ [Compact list: title, date, status=CLOSED]  │
│                                             │
│ [Empty state: "No completed gigs yet"]      │
└─────────────────────────────────────────────┘
```

Fetches `Job` records where `organizerProfileId = profile.id` AND `status = CLOSED`. Shows title, city, approximate date. No financial data shown publicly.

### Reviews Summary Placeholder

```
┌─────────────────────────────────────────────┐
│ DJ Reviews of This Organizer  [Coming Soon] │
│                                             │
│ ⭐ — ratings coming in a future update      │
└─────────────────────────────────────────────┘
```

This section is always rendered as a placeholder in MVP. The schema (`DjRating` pattern) will be mirrored as `OrganizerRating` in Phase 2. Renders as a muted "coming soon" card — never as a broken empty state.

### Contact Section

```
┌─────────────────────────────────────────────┐
│ Get in Touch                                │
│                                             │
│ [Website → external link button]            │
│ [Social links row]                          │
│                                             │
│ [No email shown — "Contact via website"]   │
└─────────────────────────────────────────────┘
```

**Critical:** `contactEmail` and `phone` are **never** rendered on this page. All contact in MVP happens via the public website link. This is intentional — spam prevention and data privacy.

---

## Security

### Supabase RLS Policies

The `organizer_profiles` table requires the following RLS policies (to be added to `docs/rls-policies.sql`):

#### SELECT (Read)

```sql
-- Anyone can read ACTIVE organizer profiles
CREATE POLICY "Public can view active organizer profiles"
  ON "OrganizerProfile" FOR SELECT
  USING (status = 'ACTIVE' AND "deletedAt" IS NULL);

-- Owner can always read their own profile (any status)
CREATE POLICY "Owner can read own organizer profile"
  ON "OrganizerProfile" FOR SELECT
  USING (auth.uid()::text = "userId");
```

#### INSERT

```sql
-- Only authenticated users can create their own organizer profile
CREATE POLICY "Authenticated user can create own organizer profile"
  ON "OrganizerProfile" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");
```

#### UPDATE

```sql
-- Owner can only update their own profile
CREATE POLICY "Owner can update own organizer profile"
  ON "OrganizerProfile" FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");
```

#### DELETE

```sql
-- Only service role / admin can delete (soft delete via status field)
-- No user-facing DELETE policy — use status = SUSPENDED instead
```

### RLS Policies for OrganizerSocialLink (future join table)

```sql
-- SELECT: public if parent profile is ACTIVE
-- INSERT/UPDATE/DELETE: only owner of parent profile
```

### Owner-Only Update Rules

The `updateOrganizerProfile` server action must:

1. Always call `supabase.auth.getUser()` — never trust client-passed userId
2. Fetch `OrganizerProfile.where({ userId: user.id })` — ownership enforced at DB query
3. Never expose `status`, `verified`, `featured`, `plan` as editable fields via the public action
4. Admin-only fields (`status`, `verified`, `featured`) must only be modified via a separate admin action behind `role === 'ADMIN'` guard

### Profile Visibility Rules

| Condition          | Visible Publicly    |
| ------------------ | ------------------- |
| status = ACTIVE    | ✅ Yes              |
| status = PENDING   | ❌ No — returns 404 |
| status = SUSPENDED | ❌ No — returns 404 |
| Profile not found  | ❌ 404              |

### Prevent Role Abuse

- The `ORGANIZER` role is **never** granted before `OrganizerProfile` is successfully created (same pattern as DJ — role granted inside the same Prisma transaction, after profile write).
- A user cannot grant themselves the `ORGANIZER` role via a direct API call — the role grant lives exclusively inside `createOrganizerProfile`.
- `assignRole()` in `actions/auth.ts` redirects to the form — it does not grant the role directly (current behaviour is already correct).

### Prevent Unauthorized Edits

- Every server action reads `supabase.auth.getUser()` fresh — no trust of form data for identity.
- Prisma queries always filter by `userId: user.id` — SQL-level ownership, not just application-level.
- `slug` is never editable by the user — it is always derived from `displayName` via `makeUniqueOrganizerSlug()`.
- `status` is never in the public Zod schema.

---

## Validation Rules

### Zod Schema — createOrganizerProfile

```
displayName:   z.string().min(2, "Name must be at least 2 characters").max(80, "Name too long")
organizerType: z.enum(["INDIVIDUAL", "COMPANY", "VENUE", "AGENCY", "FESTIVAL"])
```

### Zod Schema — updateOrganizerProfile

```
displayName:    z.string().min(2).max(80).optional()
organizerType:  z.enum([...]).optional()
bio:            z.string().max(600, "Bio must be under 600 characters").optional().nullable()
countryId:      z.number().int().positive().optional().nullable()
cityId:         z.number().int().positive().optional().nullable()
  → cross-field: if cityId set, countryId must also be set; city must belong to country
website:        z.string().url("Must be a valid URL").startsWith("https://", "Must use HTTPS").max(200).optional().nullable()
contactEmail:   z.string().email("Invalid email address").optional().nullable()
phone:          z.string().max(30).regex(/^[+\d\s()./-]*$/, "Invalid phone format").optional().nullable()

logoUrl:        z.string().url().optional().nullable()
  → validated on upload: max 5MB, mime in [image/jpeg, image/png, image/webp]
  → stored path: organizer-logos/{userId}/{filename}

coverImageUrl:  z.string().url().optional().nullable()
  → validated on upload: max 10MB, mime in [image/jpeg, image/png, image/webp]
  → stored path: organizer-covers/{userId}/{filename}

socialLinks:    z.array(
                  z.object({
                    platform: z.enum(["instagram","tiktok","youtube","linkedin","facebook","website"]),
                    url: z.string().url("Invalid social link URL")
                  })
                ).max(6, "Maximum 6 social links").optional()
```

### Cross-field Rules

- If `cityId` is provided, `countryId` must also be provided.
- City must belong to the selected country (DB validation in action, same pattern as `createDjProfile`).
- If `displayName` changes, `makeUniqueOrganizerSlug()` must regenerate the slug (check for collision, append `-2`, `-3` etc.).

---

## UX Requirements

### State Requirements (all forms and data surfaces)

| State       | Requirement                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------- |
| **Loading** | Skeleton screens on profile page. Button spinner + disabled state during form submission.    |
| **Empty**   | Contextual empty states with helpful copy (e.g. "No active gigs yet — post your first gig"). |
| **Error**   | Inline field errors (Zod), toast for server errors (Sonner). Never silent failures.          |
| **Success** | Toast "Profile updated" via Sonner. Redirect if slug changed.                                |

### Form UX Rules

1. **Validation fires on submit** for create flow. **Fires on blur** for update/settings flow.
2. **Error messages** are human-readable, not technical (e.g. "Name must be at least 2 characters", not "min_length").
3. **Toast notifications** use Sonner (already installed in the project) — success in green, error in red.
4. **Loading indicators** — form submit button shows spinner and becomes disabled during pending state. Use `isPending` (third return value of `useActionState`) or `pending` from `useFormStatus` — not both together.
5. **Image uploads** — show preview immediately after selection (before upload), replace with final URL on success.
6. **City field** — disabled until country is selected (same pattern as `FilterBottomSheet`).
7. **Social links** — dynamic add/remove rows (max 6), platform selector + URL input per row.
8. **Unsaved changes** — on settings page, track dirty state. Prompt "You have unsaved changes" on navigate away (use `beforeunload` or router guard).

### /become-organizer Page UX

- Single-screen form (not multi-step for MVP — only 2 required fields).
- `displayName` input pre-fills from `user.name` if available.
- `organizerType` is a select dropdown with descriptive labels (not raw enum values).
- On success: confetti or subtle celebration animation → redirect to `/organizer/dashboard`.

### /organizer/settings Page UX

- Tabbed settings: "Profile", "Contact", "Social Links", "Danger Zone".
- Each tab saves independently (no single giant save button for the whole page).
- Profile tab: displayName, organizerType, bio, logo, cover image, location.
- Contact tab: website, contactEmail (labelled "Private contact email — not shown publicly"), phone.
- Social Links tab: dynamic link manager.
- Danger Zone: "Delete organizer profile" (soft delete — removes ORGANIZER role, sets status=SUSPENDED).

---

## Technical Architecture

### New / Modified Prisma Models

#### New Enum: `OrganizerType`

```prisma
enum OrganizerType {
  INDIVIDUAL
  COMPANY
  VENUE
  AGENCY
  FESTIVAL
}
```

**Why not a separate `Venue` model for MVP?**  
A Venue is semantically an organizer subtype with extra attributes (capacity, address, technical specs). Creating a separate model now would require a separate creation flow, separate profile pages, separate RLS policies, and separate gig posting logic — all for a feature we won't build out in MVP. Using an enum value `VENUE` on `OrganizerType` correctly categorises the organizer without structural overhead. The transition to a `Venue` model in Phase 3 is clean: add `venueDetails` relation only for `organizerType = VENUE` records.

**Why is this scalable?**

- Adding new types (e.g. `TALENT_AGENCY`, `BROADCAST`) = one enum value addition + one `db push`.
- The application layer (UI labels, icons, filtering) is already parameterised off the enum.
- If a type grows complex enough to need its own fields (e.g. Venue needs `capacity`, `address`), it gets a separate one-to-one model `VenueDetails` keyed to `organizerProfileId` where `organizerType = VENUE`.

#### New Enum: `OrganizerStatus`

```prisma
enum OrganizerStatus {
  PENDING   // newly created, awaiting admin activation (or auto-activate for MVP)
  ACTIVE    // visible on platform
  SUSPENDED // hidden, profile locked
}
```

**MVP behaviour:** Auto-set to `ACTIVE` on creation (no admin approval step for organizers, unlike DJs). Can be revisited if spam becomes a problem.

#### Modified Model: `OrganizerProfile`

```prisma
model OrganizerProfile {
  id     Int    @id @default(autoincrement())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  displayName    String           // replaces "businessName"
  slug           String           @unique  // /organizers/[slug]
  organizerType  OrganizerType    @default(INDIVIDUAL)
  status         OrganizerStatus  @default(ACTIVE)
  bio            String?
  logoUrl        String?          // Supabase Storage URL
  coverImageUrl  String?          // Supabase Storage URL
  website        String?
  contactEmail   String?          // PRIVATE — never rendered publicly
  phone          String?          // PRIVATE — never rendered publicly

  countryId Int?
  country   Country? @relation(fields: [countryId], references: [id])
  cityId    Int?
  city      City?    @relation(fields: [cityId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  socialLinks OrganizerSocialLink[]
  jobs        Job[]

  @@index([slug])
  @@index([status])
  @@index([organizerType])
  @@index([countryId])
  @@index([cityId])
}
```

**Field rename: `businessName` → `displayName`**  
`businessName` is semantically wrong for `INDIVIDUAL` and `FESTIVAL` types. `displayName` is type-agnostic — a natural name for all organizer types.

**Migration note:** The existing `businessName` column has data from staging. The rename must be handled with: add `displayName` column, copy data from `businessName`, drop `businessName`. This is a breaking schema change — plan carefully before pushing.

#### New Model: `OrganizerSocialLink`

```prisma
model OrganizerSocialLink {
  id                 Int              @id @default(autoincrement())
  organizerProfileId Int
  organizerProfile   OrganizerProfile @relation(fields: [organizerProfileId], references: [id], onDelete: Cascade)
  platform           String           // "instagram" | "linkedin" | "facebook" | "tiktok" | "youtube" | "website"
  url                String

  @@unique([organizerProfileId, platform])
  @@index([organizerProfileId])
}
```

This mirrors `SocialLink` (used by DjProfile) exactly — same structure, separate table to avoid coupling.

#### Modified Model: `Job`

The current `Job` model has a `countryId` and `cityId` but they are not foreign-keyed. Also, `organizerId` (User.id) and `organizerProfileId` are both present — this creates a redundancy. Recommended cleanup:

```
- Keep organizerProfileId (primary FK for all gig-to-organizer lookups)
- Keep organizerId as a denormalized fast-path for auth checks (organizer can only manage their own jobs)
- Add Country/City FKs to Job (align with Event pattern)
- Add genre tags / djType tags to Job (for gig filtering) — Phase 2
```

### Relationships Diagram

```
User ──1:1──► OrganizerProfile ──1:N──► OrganizerSocialLink
  │                │
  │                └──────────────────► Job ──1:N──► JobApplication
  │
  └──1:1──► DjProfile
  │
  └──N:M──► UserRole (ADMIN | DJ | ORGANIZER)
```

### Slug Generation Strategy

Mirror `makeUniqueSlug()` used by DjProfile:

```
makeUniqueOrganizerSlug(displayName, userId):
  1. slugify(displayName) → lowercase, spaces→hyphens, strip special chars
  2. Check DB for existing slug
  3. If taken → append "-2", "-3", etc. until unique
  4. Max slug length: 100 chars (truncate base before appending suffix)
```

Slug is **never** editable by the user — it auto-regenerates when `displayName` changes. This prevents broken inbound links when organizer renames. Consider: on rename, return `newSlug` from action (same pattern as `updateDjProfile`).

### New Routes

| Route                  | Type           | Auth           | Purpose                         |
| ---------------------- | -------------- | -------------- | ------------------------------- |
| `/organizers/[slug]`   | Public page    | None required  | Public organizer profile        |
| `/organizer/dashboard` | Protected page | ORGANIZER role | Organizer home / gig management |
| `/organizer/settings`  | Protected page | ORGANIZER role | Edit organizer profile          |
| `/organizer/gigs`      | Protected page | ORGANIZER role | List own gigs                   |
| `/organizer/gigs/new`  | Protected page | ORGANIZER role | Create new gig                  |
| `/organizer/gigs/[id]` | Protected page | ORGANIZER role | View/edit single gig            |

**Middleware update required:** Add `/organizer` prefix to `protectedPaths` in `middleware.ts`.

### New Server Actions

| Action                   | Location             | Input                      | Auth Check             |
| ------------------------ | -------------------- | -------------------------- | ---------------------- |
| `createOrganizerProfile` | `actions/profile.ts` | displayName, organizerType | user.id from Supabase  |
| `updateOrganizerProfile` | `actions/profile.ts` | all optional fields        | user.id → where userId |
| `uploadOrganizerLogo`    | `actions/upload.ts`  | file (validated)           | user.id ownership      |
| `uploadOrganizerCover`   | `actions/upload.ts`  | file (validated)           | user.id ownership      |
| `deleteOrganizerProfile` | `actions/profile.ts` | none                       | user.id, soft delete   |

### Indexes

```prisma
@@index([slug])            // fast public profile lookup
@@index([status])          // filter ACTIVE profiles
@@index([organizerType])   // future: type-filtered gig browsing
@@index([countryId])       // geographic queries
@@index([cityId])          // geographic queries
```

### SEO Considerations

```typescript
// /organizers/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const profile = await getOrganizerProfileBySlug(params.slug);
  return {
    title: `${profile.displayName} — Organizer on DJscovery`,
    description:
      profile.bio?.slice(0, 155) ??
      `${profile.displayName} books DJs on DJscovery.`,
    openGraph: {
      images: profile.logoUrl ? [profile.logoUrl] : [],
    },
    // noIndex: organizer profiles ARE indexable — they build SEO backlinks for gig pages
  };
}

export async function generateStaticParams() {
  // NOT recommended for organizer profiles — they are secondary entities.
  // Use dynamic rendering with ISR (revalidate: 60) instead.
}
```

---

## MVP Scope

### Build Now

| Feature                                                                                                                 | Rationale                                                      |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Extend `OrganizerProfile` schema (slug, organizerType, status, bio, logoUrl, coverImageUrl, website, socialLinks table) | Foundation — nothing else works without this                   |
| `updateOrganizerProfile` server action with full Zod validation                                                         | Required for settings page                                     |
| `/organizer/settings` page (tabbed: Profile, Contact, Social)                                                           | Organizer needs to enrich their profile to build trust         |
| `/organizers/[slug]` public profile page                                                                                | Needed the moment a gig links to an organizer                  |
| Logo + cover image upload to Supabase Storage                                                                           | Visual trust signals — organizers without logos feel anonymous |
| `OrganizerSocialLink` model + CRUD in settings                                                                          | Professional organizers need to link their presence            |
| Middleware guard for `/organizer/*` routes                                                                              | Security                                                       |
| RLS policies for `OrganizerProfile`                                                                                     | Security                                                       |
| `OrganizerStatus` enum + auto-ACTIVE on creation                                                                        | Prevents broken profiles on gig pages                          |
| `OrganizerType` enum + selection in become-organizer flow                                                               | Enables type badge on public profile                           |
| Navigation: Organizer dashboard link in user dropdown                                                                   | Accessibility of organizer features                            |

### Build Later (Phase 2)

| Feature                                                      | Rationale                                                      |
| ------------------------------------------------------------ | -------------------------------------------------------------- |
| Organizer can leave reviews on DJs after a completed gig     | Requires completed gig tracking first                          |
| `OrganizerRating` model (DJs rate organizers back)           | Trust is bidirectional — but needs Phase 2 gig completion flow |
| Gig detail page links to organizer public profile            | Requires `/gigs/[id]` page, which is Phase 2                   |
| Organizer dashboard with gig analytics (views, applications) | Needs data volume first                                        |
| Invite DJ directly to a gig                                  | Already partially modelled (`isInvite` on `JobApplication`)    |
| Organizer notification system (new application received)     | Notification infra already exists — wire it up                 |
| Direct messages between Organizer and DJ                     | Conversation model already in schema Phase 2 section           |

### Do Not Build Yet

| Feature                                             | Rationale                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Organizer directory / search page                   | Violates core product rule — platform must stay DJ-focused                                 |
| Featured organizer slots                            | Premature monetization before trust is established                                         |
| Organizer rankings / leaderboards                   | No value without data volume; risks gaming                                                 |
| Separate Venue model                                | Venue = OrganizerType.VENUE for MVP; full model adds complexity without proportional value |
| `OrganizerPlan` subscription tiers                  | Needs payment infrastructure (Stripe); zero revenue risk to defer                          |
| Response rate / avg response time metrics           | Requires significant data and a background job to compute                                  |
| Team member management (multi-user organizer)       | Enterprise-level complexity; far beyond solo-founder MVP                                   |
| Organizer portfolio / past events gallery           | High content effort for organizers; better as a Phase 3 premium feature                    |
| Email notifications to DJs about organizer activity | Requires email provider setup (Resend/SendGrid); defer to Phase 2                          |

---

## Current Schema Gap Analysis

The following gaps exist between the current `OrganizerProfile` model and this spec. These must be addressed in the schema migration before implementation:

| Gap                                   | Action Required                                                 |
| ------------------------------------- | --------------------------------------------------------------- |
| `businessName` → `displayName` rename | DB migration: add column, copy data, drop old                   |
| Missing `slug` field                  | Add `slug String @unique` + generate for existing rows          |
| Missing `organizerType` field         | Add `OrganizerType` enum + field, default `INDIVIDUAL`          |
| Missing `status` field                | Add `OrganizerStatus` enum + field, default `ACTIVE`            |
| Missing `bio` field                   | Add `bio String?`                                               |
| Missing `logoUrl` field               | Add `logoUrl String?`                                           |
| Missing `coverImageUrl` field         | Add `coverImageUrl String?`                                     |
| Missing `website` field               | Add `website String?`                                           |
| Missing `contactEmail` field          | Add `contactEmail String?`                                      |
| Missing `deletedAt` field             | Add `deletedAt DateTime?` for soft-delete parity with DjProfile |
| Missing `OrganizerSocialLink` model   | New model required                                              |
| Missing indexes                       | Add slug, status, organizerType, cityId indexes                 |

**Migration approach (no `migrate dev` — use `db push`):**

1. Add all new nullable fields in one schema edit.
2. Run `npx prisma db push` on staging.
3. Run `npx prisma generate`.
4. Backfill `slug` values for any existing `OrganizerProfile` rows (one-time script).
5. Only after staging validation: push to production.

---

_End of specification. Ready for implementation review._
