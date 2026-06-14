# DJscovery — Gigs Feature: Complete Implementation Plan

## Codebase Audit Summary

### What Exists (Relevant to Gigs)

- **`Job` + `JobApplication` models** exist in `prisma/schema.prisma` — minimal placeholders with `OPEN/CLOSED/CANCELLED` status and `PENDING/ACCEPTED/REJECTED/WITHDRAWN` application status. No pages or server actions built for them. These will be replaced entirely.
- **`OrganizerProfile`** is fully wired: creation, settings, uploads, slug, navigation — at `src/lib/actions/profile.ts` and `src/components/organizer/OrganizerSettingsTabs.tsx`.
- **`DjProfile`** is fully wired: approval, genres, types, social links, settings.
- **`getNavUser()`** at `src/lib/auth/getNavUser.ts` provides `navRole`, `isOrganizer`, `djSlug`, `organizerSlug` — ready to gate routes.
- **Navigation config** at `src/config/navigation.ts` has `gigs` item already present, `comingSoon: true`, `href: null` — ready to activate.
- **Middleware** at `src/middleware.ts` protects `/organizer` and `/dashboard` paths via array check.
- **`NotificationType` enum** has `NEW_JOB`, `JOB_APPLICATION`, `APPLICATION_ACCEPTED`, `APPLICATION_REJECTED` — will be extended for gigs.
- **`Notification.data`** is `Json?` — flexible payload, no schema changes needed for notification content.
- **`UserRole` / `Role` enum** — `ADMIN`, `DJ`, `ORGANIZER` — all three role checks are solid.
- **Supabase Auth pattern** is consistent across all server actions.
- **Sonner + shadcn/ui** already installed and in use throughout.

---

## Architecture Decisions

### 1. Replace `Job` → `Gig`, `JobApplication` → `GigApplication`

The existing `Job` model is a stub with no UI built. A clean replacement avoids carrying forward wrong field names, wrong status enums, and wrong relation naming. The `User.jobsPosted` and `User.jobApplications` relations must also be updated.

### 2. Equipment as `String[]` (Postgres Text Arrays)

Equipment items are a bounded multi-select. Store as `String[]` columns (`venueProvides String[]` and `djMustBring String[]`) using Prisma's native PostgreSQL array support. This avoids a junction table for a bounded enum-like list while remaining queryable. The allowed values are enforced by Zod and the UI — not by a DB enum — so new items can be added without a migration.

### 3. Genres as `String[]` (Direct Array, not Junction)

`requiredGenres String[]` on `Gig`. For gig creation this is far simpler than a junction table. The genre names are strings (matching `Genre.name`). An organizer types or selects genres. No FK needed — gig genre requirements are freeform intent, not a hard relation.

### 4. Dynamic Fields — UI Config Only

All fields exist on the `Gig` model as nullable. A `gig-type-fields.ts` config file maps each `GigType` to its visible/required fields. The form renders conditionally based on this config. Zero DB changes needed when new gig types are added — only the config file changes.

### 5. Conditional Venue Visibility — Server-Side Query Splitting

Two query shapes:

- **Public shape** (DJ browsing, pre-application): excludes `venueAddress`, `venuePostalCode`, `venueName` (if `hideVenueName: true`)
- **Accepted shape** (DJ whose application is `ACCEPTED`): includes full address + organizer contact fields

This split happens in a server component / server action. Never rely on client-side filtering.

### 6. Multi-Step Form — Client Component with Local State

A single `GigForm` client component with `step: 1–5` local state managed by `useReducer`. Form data accumulates in state. Only submitted on final step. Uses `zod.parse` on each step's fields for inline validation before advancing. Final submission calls `createGig` server action.

### 7. Dashboard Route Structure

Routes live under `/dashboard` (already in middleware protected paths). Role segmentation:

- Organizer: `/dashboard/organizer/gigs/...`
- DJ: `/dashboard/dj/gigs/...`

A `/dashboard` root page redirects based on `navRole`.

---

## Database Model Plan

### Enums to Add / Change

```prisma
// REPLACE JobStatus with:
enum GigStatus {
  DRAFT
  PUBLISHED
  UNDER_REVIEW
  FILLED
  CANCELLED
  EXPIRED
}

// REPLACE ApplicationStatus with:
enum GigApplicationStatus {
  APPLIED
  SHORTLISTED
  ACCEPTED
  REJECTED
  WITHDRAWN
}

// NEW
enum GigType {
  CLUB
  FESTIVAL
  WEDDING
  CORPORATE_EVENT
  PRIVATE_PARTY
  BIRTHDAY_PARTY
  LOUNGE
  RESTAURANT
  HOTEL
  BAR
  OTHER
}

// NEW
enum BudgetType {
  FIXED
  RANGE
  NEGOTIABLE
  TBA
}

// NEW
enum ExperienceLevel {
  OPEN
  BEGINNER
  INTERMEDIATE
  PROFESSIONAL
  EXPERT
}

// Extend NotificationType — add:
  GIG_PUBLISHED
  GIG_APPLICATION_RECEIVED
  GIG_APPLICATION_SHORTLISTED
  GIG_APPLICATION_ACCEPTED
  GIG_APPLICATION_REJECTED
  GIG_APPLICATION_WITHDRAWN
```

> **Note:** `ApplicationStatus` is currently used on `JobApplication` which has no UI. It will be removed along with `Job`/`JobApplication` and replaced with `GigApplicationStatus`.

---

### `Gig` Model

```prisma
model Gig {
  id   Int    @id @default(autoincrement())
  slug String @unique

  organizerProfileId Int
  organizerProfile   OrganizerProfile @relation(fields: [organizerProfileId], references: [id], onDelete: Cascade)

  title               String
  gigType             GigType
  description         String?
  status              GigStatus @default(DRAFT)
  eventDate           DateTime
  applicationDeadline DateTime?

  // Location (always stored, partially revealed pre-acceptance)
  countryId       Int?
  country         Country? @relation(fields: [countryId], references: [id])
  cityId          Int?
  city            City?    @relation(fields: [cityId], references: [id])
  venueName       String?
  hideVenueName   Boolean  @default(false)  // organizer toggle
  venueAddress    String?                   // PRIVATE until accepted
  venuePostalCode String?                   // PRIVATE until accepted

  // Budget
  budgetType BudgetType @default(TBA)
  budgetMin  Int?
  budgetMax  Int?
  currency   String     @default("SEK")

  // Requirements
  requiredGenres          String[]
  requiredExperienceLevel ExperienceLevel @default(OPEN)
  setDurationMinutes      Int?
  guestCount              Int?
  dressCode               String?
  mcRequired              Boolean  @default(false)
  micRequired             Boolean  @default(false)
  languagesSpoken         String[]

  // Equipment
  venueProvides String[] // bounded list — see EQUIPMENT_ITEMS in app config
  djMustBring   String[]

  // Logistic fields (PRIVATE — visible to accepted DJ only)
  arrivalInstructions   String?
  setupNotes            String?
  organizerContactName  String?
  organizerContactPhone String?
  organizerContactEmail String?

  // Internal
  viewCount Int       @default(0)
  deletedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  applications GigApplication[]

  @@index([status])
  @@index([gigType])
  @@index([organizerProfileId])
  @@index([eventDate])
  @@index([cityId])
  @@index([countryId])
  @@index([applicationDeadline])
  @@index([slug])
}
```

> **Relation note:** `OrganizerProfile` gains a `gigs Gig[]` relation field. `Country` and `City` gain `gigs Gig[]` relation fields. `User.jobsPosted` → removed (organizer ownership goes through `OrganizerProfile`, not `User` directly).

---

### `GigApplication` Model

```prisma
model GigApplication {
  id      Int                  @id @default(autoincrement())
  status  GigApplicationStatus @default(APPLIED)
  message String?

  gigId Int
  gig   Gig    @relation(fields: [gigId], references: [id], onDelete: Cascade)

  djProfileId Int
  djProfile   DjProfile @relation(fields: [djProfileId], references: [id], onDelete: Cascade)

  shortlistedAt DateTime?
  acceptedAt    DateTime?
  rejectedAt    DateTime?
  withdrawnAt   DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([gigId, djProfileId]) // one application per DJ per gig
  @@index([gigId])
  @@index([djProfileId])
  @@index([status])
}
```

> `DjProfile` gains a `gigApplications GigApplication[]` relation field.

---

### Models to Remove

| Remove | Replaced by |
|---|---|
| `Job` | `Gig` |
| `JobApplication` | `GigApplication` |
| `JobStatus` enum | `GigStatus` enum |
| `ApplicationStatus` enum | `GigApplicationStatus` enum |
| `User.jobApplications` relation | `DjProfile.gigApplications` |
| `User.jobsPosted` relation | `OrganizerProfile.gigs` |
| `OrganizerProfile.jobs` relation | `OrganizerProfile.gigs` |
| `Hire` model | Moved to Phase 2 |
| `NotificationType.NEW_JOB` etc. | New gig-specific notification types |

---

## Zod Schema Plan

**File:** `src/lib/validations/gig.ts`

### `createGigSchema`

Step-aware with `.superRefine` for cross-field rules:

- `title` — string, 5–120 chars
- `gigType` — `GigType` enum
- `eventDate` — future date only
- `applicationDeadline` — optional, must be before `eventDate`
- `countryId` / `cityId` — required integers
- `description` — optional, max 2000 chars
- `budgetType` — `BudgetType` enum
- `budgetMin` / `budgetMax` — both required when `budgetType === RANGE`, `budgetMin < budgetMax`
- `currency` — 3-char uppercase string, default `"SEK"`
- `requiredGenres` — `string[]`, max 10 items
- `requiredExperienceLevel` — `ExperienceLevel` enum
- `venueProvides` / `djMustBring` — `string[]`, each item must be in `EQUIPMENT_ITEMS` constant
- `setDurationMinutes`, `guestCount` — optional positive integers
- `venueName`, `venueAddress`, `venuePostalCode` — optional strings
- `hideVenueName` — boolean

### `updateGigSchema`

`createGigSchema.partial()` — all fields optional. Status is not settable here (use dedicated transition actions).

### `publishGigSchema`

A refinement of `updateGigSchema` — stricter: `title`, `gigType`, `eventDate`, `countryId` are **required** before publish is allowed. Used server-side before calling `publishGig`.

### `applyToGigSchema`

- `gigId` — positive integer
- `message` — optional string, max 1000 chars

---

## File & Folder Structure

```
src/
├── app/
│   └── dashboard/
│       ├── layout.tsx                             ← auth guard + role redirect shell
│       ├── page.tsx                               ← redirect by navRole
│       ├── organizer/
│       │   └── gigs/
│       │       ├── page.tsx                       ← OrganizerGigListPage (Server)
│       │       ├── new/
│       │       │   └── page.tsx                   ← GigCreatePage (Server shell)
│       │       └── [gigId]/
│       │           ├── page.tsx                   ← OrganizerGigDetailPage (Server)
│       │           ├── edit/
│       │           │   └── page.tsx               ← GigEditPage (Server shell)
│       │           └── applications/
│       │               └── page.tsx               ← GigApplicantsPage (Server)
│       └── dj/
│           ├── gigs/
│           │   ├── page.tsx                       ← DjGigMarketplacePage (Server)
│           │   └── [gigId]/
│           │       └── page.tsx                   ← DjGigDetailPage (Server)
│           └── applications/
│               └── page.tsx                       ← DjMyApplicationsPage (Server)
│
├── components/
│   └── gigs/
│       ├── GigCard.tsx                            ← Card for marketplace + organizer list
│       ├── GigForm.tsx                            ← Multi-step create/edit (Client)
│       ├── GigFormStep1Basics.tsx                 ← Step 1 sub-form
│       ├── GigFormStep2Requirements.tsx           ← Step 2 sub-form
│       ├── GigFormStep3Equipment.tsx              ← Step 3 sub-form
│       ├── GigFormStep4Budget.tsx                 ← Step 4 sub-form
│       ├── GigFormStep5Review.tsx                 ← Step 5 review + publish
│       ├── GigDetailsHeader.tsx                   ← Title, type badge, date, location
│       ├── GigStatusBadge.tsx                     ← Colored status pill
│       ├── GigFilters.tsx                         ← Type, date, budget, location filters (Client)
│       ├── GigApplicationButton.tsx               ← Apply / Withdraw (Client, DJ-only)
│       ├── GigApplicantsTable.tsx                 ← Organizer applicant management (Client)
│       ├── VenueInfoCard.tsx                      ← Conditional: locked vs revealed
│       └── EmptyGigsState.tsx                     ← Reusable empty state
│
├── lib/
│   ├── actions/
│   │   └── gigs.ts                                ← All gig server actions
│   ├── queries/
│   │   └── gigs.ts                                ← Read-only Prisma query helpers
│   └── validations/
│       └── gig.ts                                 ← Zod schemas
│
└── config/
    └── gig-type-fields.ts                         ← Dynamic field config per GigType
```

---

## Server Actions Plan

**File:** `src/lib/actions/gigs.ts`

Every action follows this guard sequence:

1. `supabase.auth.getUser()` → 401 if no session
2. `prisma.user.findUnique` with `roles` → check required role
3. Ownership check (where relevant)
4. Status transition validity check
5. Deadline check (where relevant)
6. Zod parse (server-side, always)
7. Prisma mutation

---

### `createGig(formData)`

- **Auth:** ORGANIZER role required
- **Check:** Active `OrganizerProfile` exists
- **Action:** Creates `Gig` with `status: DRAFT`, auto-generates `slug` from title (dedup like organizer/dj slug pattern)
- **Returns:** `{ gigId }` for redirect to edit or detail

### `updateGig(gigId, input)`

- **Auth:** ORGANIZER, owns this gig (`organizerProfileId` must match caller's profile)
- **Check:** Gig is not CANCELLED or EXPIRED (cannot edit terminal states)
- **Action:** Partial update, if `title` changes regenerate slug
- **Returns:** success / error

### `publishGig(gigId)`

- **Auth:** ORGANIZER, owns gig
- **Check:** Gig in DRAFT or UNDER_REVIEW; passes `publishGigSchema` validation (required fields present)
- **Action:** Sets `status: PUBLISHED`
- **Side-effect:** Notification fan-out deferred to Phase 2

### `closeGig(gigId)`

- **Auth:** ORGANIZER, owns gig
- **Check:** Gig in PUBLISHED or UNDER_REVIEW
- **Action:** Sets `status: FILLED`

### `cancelGig(gigId)`

- **Auth:** ORGANIZER, owns gig
- **Check:** Gig is not already CANCELLED or EXPIRED
- **Action:** Sets `status: CANCELLED`, sets all `APPLIED`/`SHORTLISTED` applications to `REJECTED`

### `applyToGig(gigId, message)`

- **Auth:** DJ role required + active `DjProfile` with status `APPROVED`
- **Checks (all server-side):**
  - Gig status is `PUBLISHED`
  - `eventDate` is in the future
  - `applicationDeadline` not passed (if set)
  - No existing non-WITHDRAWN application for this DJ + gig
- **Action:** Creates `GigApplication` with `status: APPLIED`
- **Side-effect:** `Notification` to organizer (type: `GIG_APPLICATION_RECEIVED`)

### `withdrawApplication(applicationId)`

- **Auth:** DJ, owns this application (`djProfile.userId === caller`)
- **Check:** Application is `APPLIED` or `SHORTLISTED` (cannot withdraw ACCEPTED/REJECTED)
- **Action:** Sets `status: WITHDRAWN`, records `withdrawnAt`

### `updateApplicationStatus(applicationId, newStatus)`

- **Auth:** ORGANIZER, owns the gig this application belongs to
- **Valid transitions:**
  - `APPLIED` → `SHORTLISTED`, `ACCEPTED`, `REJECTED`
  - `SHORTLISTED` → `ACCEPTED`, `REJECTED`
  - No other transitions allowed
- **Special on ACCEPTED:**
  - Check no other application for the same gig is already `ACCEPTED`
  - Set `acceptedAt`
  - Create `Notification` to DJ (type: `GIG_APPLICATION_ACCEPTED`)
- **Special on REJECTED:**
  - Set `rejectedAt`
  - Create `Notification` to DJ (type: `GIG_APPLICATION_REJECTED`)

---

## Query Helpers Plan

**File:** `src/lib/queries/gigs.ts`

### `getOrganizerGigs(organizerProfileId)`

Returns all gigs for this organizer's dashboard list. Includes `_count.applications`.

### `getOrganizerGigDetail(gigId, organizerProfileId)`

Full detail including private fields + applications with DJ profile info. Throws if `organizerProfileId` doesn't match.

### `getPublishedGigsForDj(filters)`

Returns published, non-expired gigs. **Excludes:** `venueAddress`, `venuePostalCode`, `organizerContactPhone`, `organizerContactEmail`, `arrivalInstructions`, `setupNotes`. Applies DJ-facing filters.

### `getDjGigDetail(gigId, djProfileId)`

1. Fetches gig (public shape, no private fields)
2. Checks if caller has an `ACCEPTED` application for this gig
3. If yes: re-fetches with private fields included and merges
4. Returns shape: `{ gig, application, venueRevealed: boolean }`

### `getDjApplications(djProfileId)`

All applications for this DJ with gig summary data.

### `getGigApplicants(gigId, organizerProfileId)`

All applications for a gig with DJ profile cards. Ownership-checked.

---

## Route-Level Auth Guards

**Dashboard layout** `src/app/dashboard/layout.tsx`:

- Calls `getNavUser()`
- Redirects to `/sign-in` if not logged in
- Passes `navRole` to child via layout context or props

**Organizer gig routes:** Each page calls `getNavUser()`, checks `navRole === 'organizer'`, throws `notFound()` or redirects otherwise.

**DJ gig routes:** Each page checks `navRole === 'dj'` and `DjProfile.status === 'APPROVED'`.

**Middleware update** (`src/middleware.ts`): Confirm `/dashboard` is in the `protectedPaths` array before the build step.

---

## Component Design Plan

### `GigCard`

Props: `gig` (public shape), `userRole`, `applicationStatus?`

- Shows: type badge, date, city/country, budget range, gig type icon, set duration
- DJ view: "Apply" CTA or application status chip
- Organizer view: edit link + application count badge
- States: loading skeleton variant, error boundary

### `GigForm` (Client Component, multi-step)

Uses `useReducer` for accumulated form state across 5 steps.

- Step 1 — Basics: title, type, date, deadline, country/city
- Step 2 — Requirements: description, genres, experience level, set duration, guest count, dress code, MC/mic flags, languages
- Step 3 — Equipment: two multi-select groups (`venueProvides`, `djMustBring`)
- Step 4 — Budget: budgetType selector, conditional min/max fields, currency
- Step 5 — Review: read-only summary + publish toggle + submit
- Per-step Zod validation before advancing
- `sonner.toast` on submission result

### `GigStatusBadge`

Maps `GigStatus` → color variant:

| Status | Color |
|---|---|
| DRAFT | gray |
| PUBLISHED | green |
| UNDER_REVIEW | yellow |
| FILLED | blue |
| CANCELLED | red |
| EXPIRED | orange |

### `VenueInfoCard`

- **Locked state** (pre-acceptance): shows city + country only. Lock icon. "Apply to reveal venue details."
- **Revealed state** (post-acceptance): full address, organizer contact, arrival instructions, setup notes.
- Organizer view: always full.

### `GigApplicantsTable`

Columns: DJ name + avatar, stage name, city, genres, application date, status badge, action buttons (Shortlist / Accept / Reject).
Inline status transitions with optimistic UI + `sonner` feedback.

### `GigFilters`

URL-state filters (query params, no client state) for: type, country, city, date range, budget range, experience level.
Renders as collapsible filter panel on mobile.

### `EmptyGigsState`

Variants:

- `no-gigs-organizer` — CTA: "Post your first gig"
- `no-gigs-dj` — "No gigs available right now. Check back soon."
- `no-applications` — "You haven't applied to any gigs yet."

---

## Dynamic Field Config

**File:** `src/config/gig-type-fields.ts`

```typescript
// Conceptual structure — not final code
type FieldConfig = {
  visible: GigFieldKey[]
  required: GigFieldKey[]
}

const gigTypeFields: Record<GigType, FieldConfig> = {
  CLUB:            { visible: ["genres", "experienceLevel", "setDuration"],           required: ["genres"] },
  WEDDING:         { visible: ["guestCount", "languages", "equipment", "mcRequired"], required: ["guestCount"] },
  PRIVATE_PARTY:   { visible: ["guestCount", "equipment", "setupNotes"],              required: [] },
  FESTIVAL:        { visible: ["setDuration", "equipment", "setupNotes"],             required: ["setDuration"] },
  CORPORATE_EVENT: { visible: ["dressCode", "mcRequired", "micRequired"],             required: [] },
  LOUNGE:          { visible: ["genres", "equipment", "description"],                 required: [] },
  RESTAURANT:      { visible: ["genres", "equipment", "description"],                 required: [] },
  BAR:             { visible: ["genres", "equipment"],                                required: [] },
  HOTEL:           { visible: ["genres", "guestCount", "equipment"],                  required: [] },
  BIRTHDAY_PARTY:  { visible: ["guestCount", "equipment", "genres"],                  required: [] },
  OTHER:           { visible: ["description"],                                        required: [] },
}
```

The `GigFormStep2Requirements` and `GigFormStep3Equipment` components consume this config to conditionally render fields and apply step-level Zod refinements.

---

## Navigation Update

In `src/config/navigation.ts`, the `gigs` nav item currently has `href: null` and `comingSoon: true`.

Split `gigs` into two nav items and update `desktopNavByRole` / `bottomNavByRole`:

```typescript
const gigsMarketplace: NavItem = {
  id: "gigs",
  label: "Gigs",
  href: "/dashboard/dj/gigs",   // DJ view — marketplace
  icon: Briefcase,
}

const gigsManage: NavItem = {
  id: "gigs",
  label: "Gigs",
  href: "/dashboard/organizer/gigs",  // Organizer view — own gigs
  icon: Briefcase,
}
```

Both remove `comingSoon: true`.

---

## RLS Policies Plan (addition to `docs/rls-policies.sql`)

```sql
-- Gig: public read for PUBLISHED non-expired (private fields handled in app layer)
-- DJ read: status = PUBLISHED AND eventDate > now()
-- Organizer read: own gigs only (organizerProfileId matches caller's profile)
-- Organizer insert/update: ownership + not-deleted check
-- Admin: full access

-- GigApplication:
-- DJ insert: own applications only (djProfile.userId = auth.uid())
-- DJ read: own applications only
-- Organizer read: applications on own gigs
-- Organizer update: applications on own gigs (status transitions)
-- Admin: full access
```

> The private-field visibility (`venueAddress` etc.) is **not** enforced at RLS level since Prisma queries run server-side. It is enforced by the `getDjGigDetail` query shape split. RLS is a defence-in-depth layer.

---

## Security Review

| Threat | Mitigation |
|---|---|
| DJ views private venue fields before acceptance | Server query split — private fields never included in public/pre-acceptance shape |
| Organizer edits another organizer's gig | `organizerProfileId` ownership check in every mutation action |
| DJ applies to draft/cancelled/expired gig | Status + date checked server-side in `applyToGig` |
| DJ applies twice to same gig | `@@unique([gigId, djProfileId])` + server-side check before insert |
| DJ applies after deadline | `applicationDeadline` checked server-side |
| Organizer accepts multiple DJs | `updateApplicationStatus` checks for existing `ACCEPTED` on same gig |
| Role bypass via direct POST to server action | Every action fetches fresh session from Supabase, checks `UserRole` from DB |
| Slug enumeration of private gig data | Gig detail routes check `navRole` before serving; organizer routes verify ownership |
| Fan/Guest accessing gig routes | Dashboard layout guard + per-page `navRole` check |

---

## Scalability Notes

- **Indexes** on `status`, `gigType`, `eventDate`, `applicationDeadline`, `cityId`, `countryId` cover all expected filter combinations for the DJ marketplace.
- **`viewCount`** on `Gig` uses a simple `increment` — acceptable for MVP; switch to Redis counter if throughput demands it later.
- **`searchScore`** pattern (already on `DjProfile`) can be added to `Gig` later for featured/boosted listings.
- **Application count** exposed via Prisma `_count` aggregation — no denormalized counter needed for MVP.
- **Notification fan-out** on `publishGig` is deferred to Phase 2 to avoid blocking the action.
- `String[]` arrays for equipment and genres are fine for MVP and are indexable via GIN in PostgreSQL if needed later.

---

## UX Review

- **Gig creation:** Multi-step wizard prevents overwhelming the organizer. Step 5 review shows a live preview of what DJs will see. Publish is an explicit action, not a default.
- **Gig detail (DJ view):** Rendered as a professional job posting — not a raw form dump. Natural language paragraphs for description, highlight cards for key facts, bulleted lists for requirements and equipment.
- **Venue card:** The locked/revealed pattern creates a clear trust signal and makes the privacy model tangible to the DJ.
- **Applicant table:** Inline status transitions with confirmation. No full page reload — optimistic UI with `useTransition`.
- **Empty states:** Each route has a dedicated empty state with a context-aware CTA.
- **Loading states:** Server components provide instant HTML; client-interactive parts use `useTransition` + skeleton placeholders.
- **Mobile-first:** Filter panel collapses. Gig cards stack vertically. Applicant table scrolls horizontally on small screens.

---

## Recommended Build Sequence

### Step 1 — Schema Migration

- Remove `Job`, `JobApplication`, `JobStatus`, `ApplicationStatus`
- Add `GigStatus`, `GigType`, `BudgetType`, `ExperienceLevel`, `GigApplicationStatus` enums
- Add `Gig` model (all fields)
- Add `GigApplication` model
- Update `OrganizerProfile`, `DjProfile`, `Country`, `City`, `User` relations
- Extend `NotificationType`
- Run: `npx prisma db push` → `npx prisma generate`

### Step 2 — Zod Schemas

- `src/lib/validations/gig.ts`
- `createGigSchema`, `updateGigSchema`, `publishGigSchema`, `applyToGigSchema`

### Step 3 — Gig Type Field Config

- `src/config/gig-type-fields.ts`
- Equipment constants (`EQUIPMENT_ITEMS`)

### Step 4 — Query Helpers

- `src/lib/queries/gigs.ts`
- All 6 query functions (organizer list, organizer detail, DJ marketplace, DJ gig detail, DJ applications, gig applicants)

### Step 5 — Server Actions

- `src/lib/actions/gigs.ts`
- `createGig`, `updateGig`, `publishGig`, `closeGig`, `cancelGig`, `applyToGig`, `withdrawApplication`, `updateApplicationStatus`

### Step 6 — Dashboard Layout + Routing Shell

- `src/app/dashboard/layout.tsx` (auth guard)
- `src/app/dashboard/page.tsx` (role redirect)
- Middleware update: confirm `/dashboard` is protected
- Navigation config update: activate gigs links per role

### Step 7 — Organizer Gig Management

- `OrganizerGigListPage` + `GigCard` (organizer variant)
- `GigCreatePage` + `GigForm` (all 5 steps)
- `OrganizerGigDetailPage` + `GigDetailsHeader`
- `GigEditPage` (pre-fills `GigForm`)
- `GigStatusBadge`, `EmptyGigsState`

### Step 8 — DJ Gig Marketplace

- `DjGigMarketplacePage` + `GigFilters`
- `GigCard` (DJ variant)
- `EmptyGigsState` (DJ variant)

### Step 9 — Gig Detail + Venue Card

- `DjGigDetailPage`
- `VenueInfoCard` (locked + revealed variants)
- `GigApplicationButton` (Apply / Withdraw)

### Step 10 — Application Flow (Organizer side)

- `GigApplicantsPage`
- `GigApplicantsTable` (Shortlist / Accept / Reject)

### Step 11 — DJ My Applications

- `DjMyApplicationsPage`
- Application status tracking cards

### Step 12 — Final Wiring + Polish

- Sonner notifications wired to all action outcomes
- Loading skeletons for all data-fetching components
- Error boundaries
- Confirm navigation config changes visible in Navbar/BottomNav

---

## Not Included in MVP

Do **not** implement:

- Paid gig posting
- Featured gigs
- Organizer subscriptions
- Booking commissions
- Payments
- Contracts
- Messaging / Chat
- Public gig pages
- Fan access to gigs
- AI matching
- Calendar integrations

---

## Future Scope (Plan Separately)

- Featured + urgent gigs
- Paid gig posting
- Organizer subscriptions
- Booking commissions
- Contracts + payments
- AI DJ matching
- Availability calendars
- Recurring gigs
- Automated hiring workflows
- Notification fan-out on publish (DJs who follow organizer)
