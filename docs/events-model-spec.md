# DJscovery — Events Model Specification

**Status:** ✅ Implemented (Complete)
**Created:** June 17, 2026
**Last Updated:** July 7, 2026
**Author:** Planning session

---

## Implementation Status

This feature has been fully implemented and is live in production. This document serves as historical reference for the design decisions made during implementation.

---

## Table of Contents

1. [Business Purpose](#1-business-purpose)
2. [Event Lifecycle](#2-event-lifecycle)
3. [Event Types](#3-event-types)
4. [Event Categories](#4-event-categories)
5. [Visibility Rules](#5-visibility-rules)
6. [Event Creation Form](#6-event-creation-form)
7. [Dynamic Fields](#7-dynamic-fields)
8. [Upcoming Events Experience](#8-upcoming-events-experience)
9. [Past Events Experience](#9-past-events-experience)
10. [Event Media Strategy](#10-event-media-strategy)
11. [Featured Performances](#11-featured-performances)
12. [Homepage Integration](#12-homepage-integration)
13. [DJ Profile Integration](#13-dj-profile-integration)
14. [Events Listing Page](#14-events-listing-page)
15. [Event Detail Page](#15-event-detail-page)
16. [Database Planning](#16-database-planning)
17. [Security Planning](#17-security-planning)
18. [Monetization Roadmap](#18-monetization-roadmap)
19. [Risks & Recommendations](#19-risks--recommendations)
20. [Demo Data Seed Strategy](#20-demo-data-seed-strategy)
21. [MVP Scope Summary](#21-mvp-scope-summary)

---

## Important Distinction: Events vs Gigs

| Concept   | Owner     | Represents                                      |
| --------- | --------- | ----------------------------------------------- |
| **Event** | DJ        | A performance the DJ is doing or has done       |
| **Gig**   | Organizer | A hiring opportunity posted for DJs to apply to |

Examples of **Events**: Afro House Night, Summer Festival, Wedding Performance
Examples of **Gigs**: Looking for Wedding DJ, Looking for Club DJ

Treat them as completely separate models.

---

## 1. Business Purpose

Events are the primary trust signal for DJs. A profile with 0 events reads as a beginner regardless of other credentials. Events transform a static profile into a living portfolio.

| Purpose                       | Impact                                              |
| ----------------------------- | --------------------------------------------------- |
| Showcase activity             | DJ appears active and in-demand                     |
| Build credibility             | Past events = social proof                          |
| Improve discoverability       | More indexed content → better search ranking        |
| Drive bookings                | Organizers scroll events before deciding to contact |
| Increase profile completeness | DJs with events score higher                        |
| Enable monetization           | Featured events, premium galleries, analytics       |

**Core principle:** Every event a DJ adds is free advertising. The platform benefits from richness of content, the DJ benefits from visibility.

---

## 2. Event Lifecycle

### Status Enum

The existing schema defines `EventStatus` as: `DRAFT`, `PUBLISHED`, `CANCELLED`, `COMPLETED`.

**Recommendation: keep this exact enum, add only `ARCHIVED`.**

| Status      | Meaning                                              | Who can set         |
| ----------- | ---------------------------------------------------- | ------------------- |
| `DRAFT`     | Saved, not visible to anyone except owner            | DJ                  |
| `PUBLISHED` | Visible, date in future → shows as Upcoming          | DJ                  |
| `PUBLISHED` | Visible, date passed → auto-shows as Past            | System (date-based) |
| `CANCELLED` | Visible with cancelled badge, kept in portfolio      | DJ                  |
| `COMPLETED` | Manually confirmed as done, unlocks post-event media | DJ                  |
| `ARCHIVED`  | Hidden from profile, soft-preserved in DB            | DJ                  |

> **Challenge on "UPCOMING" as a status:** Do not add it. Upcoming vs Past is a **computed display state** derived from `startDate` vs `now()`. Using a status enum for it creates a sync problem (cron jobs to auto-transition). Keep it as a query-time filter only.

### Transition Rules

```
DRAFT       → PUBLISHED   (manual, DJ publishes)
PUBLISHED   → CANCELLED   (manual, DJ cancels)
PUBLISHED   → COMPLETED   (manual OR auto after 48h past startDate)
PUBLISHED   → DRAFT       (manual, DJ unpublishes)
COMPLETED   → ARCHIVED    (manual, DJ archives)
CANCELLED   → ARCHIVED    (manual, DJ archives)
ARCHIVED    → DRAFT       (manual, DJ restores — gives chance to republish)
```

### Auto-Transition Recommendation

48 hours after `startDate`, if status is still `PUBLISHED`, silently transition to `COMPLETED`. This unlocks the post-event media section without requiring DJ action. Implement via a lightweight Vercel Cron route — single DB update, no complexity.

---

## 3. Event Types

**Current seed uses:** `PUBLIC`, `PRIVATE`

**Recommendation: keep exactly `PUBLIC` and `PRIVATE`. Do not add more.**

| Type      | Meaning                      | Ticket URL    | Venue visible            |
| --------- | ---------------------------- | ------------- | ------------------------ |
| `PUBLIC`  | Open to anyone               | Yes, optional | Yes                      |
| `PRIVATE` | Invite-only, portfolio proof | No            | Shows as "Private Venue" |

**Why not `COMMERCIAL`, `CORPORATE`, etc.?**

- That information is captured by **Category** (see §4)
- Event type answers "who can attend," not "what kind of event it is"
- Two clear options = zero decision fatigue for the DJ
- The seed data confirms this works (40 events, all cleanly PUBLIC/PRIVATE)

---

## 4. Event Categories

Categories answer "what kind of event." **MVP controlled list — not free-text.**

### MVP Categories (v1)

```
CLUB_NIGHT
FESTIVAL
WEDDING
BIRTHDAY
CORPORATE
BEACH_PARTY
LOUNGE
RESTAURANT_SET
PRIVATE_PARTY
OPEN_AIR
LUXURY_EVENT
OTHER
```

These map directly to the seed JSON categories: `Club`, `Festival`, `Wedding`, `Beach Party`, `Luxury Event`, `Private Event`, `Open Air`.

### Future Categories (post-MVP)

```
HOTEL_RESIDENCY
CULTURAL_EVENT
BOAT_PARTY
ROOFTOP
POOL_PARTY
CHARITY_EVENT
```

**Implementation note:** Store as `String` in DB (not enum). Use a `VALID_EVENT_CATEGORIES` constant in the app layer for validation. This avoids Prisma migrations every time a category is added.

---

## 5. Visibility Rules

### Guest (not logged in)

**Can see:**

- Event title, category, city, country, date, poster
- DJ name (links to DJ profile)
- Venue name (PUBLIC events only)
- Gallery photos (post-event, PUBLIC only)
- Event description

**Cannot see:**

- Ticket URL (replaced with "Sign up to see tickets")
- PRIVATE event venue or location details
- Recap text (blurred with CTA: "Log in to read the full recap")

---

### Fan / Logged-in non-DJ user

**Can see:**

- Everything Guest can see
- Ticket URL (PUBLIC events)
- Recap text (full)
- Event gallery

**Cannot see:**

- PRIVATE event venue details (same as guest)

---

### DJ (non-owner)

Same as Fan. No special access to other DJs' events.

---

### DJ Owner

**Can see and edit:**

- All fields including DRAFT events
- PRIVATE event details
- Analytics (view count — future)
- Post-event media upload section after `COMPLETED`

---

### Admin

**Can see:** All events in all statuses including ARCHIVED and soft-deleted
**Can do:** Force status change, delete, feature/unfeature

---

## 6. Event Creation Form

**Design principle:** Minimum required fields to publish, everything else optional.

### Required Fields (5 fields to publish)

| Field              | Reason                                                              |
| ------------------ | ------------------------------------------------------------------- |
| `title`            | Event name (2–100 chars)                                            |
| `eventType`        | PUBLIC or PRIVATE — two buttons, not a dropdown                     |
| `category`         | Controlled list select                                              |
| `startDate`        | Required for timeline placement (date picker, no past dates forced) |
| `country` + `city` | Required for location display and filtering                         |

> **Challenge:** Do NOT require a poster to publish. Many DJs won't have one. A grey gradient fallback with the DJ avatar is enough. Requiring a poster blocks entries.

### Optional Fields

| Field                    | Why it exists                                           |
| ------------------------ | ------------------------------------------------------- |
| `venue`                  | Increases credibility (DC-10, Ushuaïa are social proof) |
| `description`            | SEO + storytelling                                      |
| `startTime` / `endTime`  | Adds professionalism                                    |
| `ticketUrl`              | PUBLIC only — drives fans to buy tickets                |
| `poster`                 | Primary visual — upload encouraged but not required     |
| `endDate`                | For multi-day festivals                                 |
| `coPerformers` (djSlugs) | Tag other DJs on the platform — cross-promotion         |
| `genres[]`               | Filters and search                                      |
| `featured`               | DJ can pin as featured (max 3 — see §11)                |

### Fields Deliberately Excluded from MVP

- Attendance count (no real-time data until ticketing is integrated)
- Set time / slot (over-engineering for v1)
- External event ID links (future integration)
- Streaming links (future — Premium feature)

---

## 7. Dynamic Fields

### If `eventType = PUBLIC`

- Show: `ticketUrl` (optional text input with URL validation)
- Show: `venue` field with full label "Venue Name"
- Show: Full city/country on public page

### If `eventType = PRIVATE`

- Hide: `ticketUrl` (remove from form entirely)
- Show: `venue` field with label "Venue (shown as 'Private Venue' publicly)"
- Show: City only, no venue name on public page

### If `status = COMPLETED` or `startDate < now()`

- Show: Post-event media upload section (gallery photos, recap text)
- Lock: `startDate`, `eventType`, `country`, `city` (event already happened — do not let DJs rewrite history)
- Allow: Editing `description`, `title`, `poster`, `ticketUrl` (corrections)

### If `startDate < now()` and `status = DRAFT`

- Show warning: "This event date has passed. You can still publish it as a past event."

---

## 8. Upcoming Events Experience

### Event Card (Upcoming)

**Visible:**

- Poster (fallback: gradient + DJ initials)
- Title
- Category badge (e.g. "Festival", "Club Night")
- Date (formatted: "Sat, Aug 7")
- City, Country
- Venue name (PUBLIC only)

**Hidden:**

- Ticket URL (shown on detail page, not card)
- Description (shown on detail page)
- Time details on card

**Mobile-first UX:**

- Card is portrait-oriented (poster-dominant)
- 2-column grid on mobile, 3-column on desktop
- Tap anywhere opens detail page
- "Tickets" CTA button on card (PUBLIC events only — opens `ticketUrl` in new tab)

---

## 9. Past Events Experience

### Past Event Card

**Visible:**

- Original poster
- Title with "Past Event" muted label
- Date
- City
- Category
- Gallery photo count badge (if any): "12 photos"

**DJ can add post-event:**

- Gallery photos (up to 12 on Free, 40 on Premium)
- Recap text (short-form write-up, max 500 chars Free / 2000 chars Premium)
- Setlist (future)

**Locked after completion:**

- `startDate` (immutable after event passes)
- `eventType`
- `country`, `city`

**Editable after completion:**

- Title (corrections)
- Poster (replacement)
- Description
- Recap
- Gallery

---

## 10. Event Media Strategy

### Before Event

| Asset  | Type                 | Free Limit | Premium Limit |
| ------ | -------------------- | ---------- | ------------- |
| Poster | Image (JPG/PNG/WebP) | 1, max 5MB | 1, max 10MB   |

> **Recommendation:** Only allow a single poster before the event. Pre-event gallery = clutter. Keep pre-event media minimal.

### After Event (status = COMPLETED)

| Asset          | Type                        | Free Limit       | Premium Limit     |
| -------------- | --------------------------- | ---------------- | ----------------- |
| Gallery photos | Image (JPG/PNG/WebP)        | 12, max 5MB each | 40, max 10MB each |
| Recap text     | String                      | 500 chars        | 2000 chars        |
| Audio link     | URL (SoundCloud / Mixcloud) | 1 external link  | 3 external links  |
| Video link     | URL (YouTube / Vimeo)       | —                | 1 external link   |

> **Decision: No direct audio/video uploads for events in MVP.** Use external link URLs only. Rationale: storage costs, encoding complexity, and most DJs already have SoundCloud/Mixcloud sets. Store as `String?` field.

### Storage Strategy

Aligns with existing architecture in `src/lib/storage/index.ts`:

```
events/{eventId}/poster/poster-{uuid}.{ext}
events/{eventId}/gallery/gallery-{uuid}.{ext}
```

`eventId` is the integer DB id. This is safe because the event is always created before media is uploaded — no chicken-and-egg problem.

---

## 11. Featured Performances

**Recommendation: Include in MVP.**

**Why:** Featured Performances are the highest-value section of a DJ profile. Three pinned events represent the DJ's best work. Organizers look at this before anything else.

### Business Rules

- Maximum 3 featured events per DJ at any time
- Only `PUBLISHED` or `COMPLETED` events can be featured
- DJ sets `featured = true` via a toggle on the event edit page
- If DJ tries to feature a 4th event, UI prompts them to unfeature one first
- Featured events appear in a dedicated section at the top of the DJ profile

### Display

- Larger card format (landscape, not portrait)
- Shows: poster, title, date, city, category
- Premium plan: visible across platform (homepage, search results)
- Free plan: visible on DJ profile only

---

## 12. Homepage Integration

### Featured Events Section

- **Qualification:** `status = PUBLISHED`, `startDate > now()`, `featured = true`, DJ is `APPROVED` and `PREMIUM`
- **Sorting:** Nearest date first
- **Visibility:** All users including guests
- **Display:** 4 cards in horizontal scroll (mobile), grid on desktop

### Upcoming Events Section

- **Qualification:** `status = PUBLISHED`, `startDate > now()`, DJ is `APPROVED`
- **Sorting:** Nearest date first
- **Visibility:** All users (guests see cards; ticket URL behind login prompt)
- **Display:** 6 cards, "View All Events" link to `/events`

### Environment Rules

- **Staging:** Homepage shows demo events from JSON (same `isStaging` pattern as gigs)
- **Production:** Real DB events only, never demo data

---

## 13. DJ Profile Integration

### Section Order on DJ Profile

1. **Featured Performances** (pinned, max 3) — top of events section, prominent placement
2. **Upcoming Events** — date-ascending, capped at 6 on Free, all on Premium
3. **Past Events** — date-descending, paginated (6 per load)

### Display Rules

- Featured and Upcoming sections empty → hide section silently (no empty states on public profiles)
- Past Events empty → show "No past events yet" only to DJ owner, not to visitors
- PRIVATE events appear in DJ profile with a "Private Event" label (no venue, no ticket URL)

---

## 14. Events Listing Page (`/events`)

### MVP Filters (v1)

| Filter     | Type                           |
| ---------- | ------------------------------ |
| Country    | Select (from DB Country table) |
| City       | Dependent select               |
| Category   | Multi-select (controlled list) |
| Event Type | Toggle: All / Public only      |
| Date range | From / To date pickers         |

### MVP Search

- Full-text on `title` + `venue` + `city`
- Debounced, URL-param driven (SSR-compatible)

### Sorting

- Default: `startDate ASC` (nearest first for upcoming)
- Option: Most recent (for past events browsing)

### Deferred to Future

- Genre filter
- Map view
- "Near me" location-based filter
- Save / bookmark events

---

## 15. Event Detail Page (`/events/[slug]`)

### URL Strategy

Every event needs a `slug`. Format: `{dj-slug}-{event-title-kebab}-{shortid}`

Example: `carl-cox-factory-93-closing-night-ab12`

### Hero Section

- Full-width poster (or gradient fallback)
- Title overlay
- Date, time, city, country
- Category badge + event type badge (PRIVATE shows pill)
- "Get Tickets" CTA (PUBLIC events with `ticketUrl`)
- DJ avatar + name linking to DJ profile

### Event Details Section

- Full description
- Venue name (PUBLIC) or "Private Venue" (PRIVATE)
- Co-performers (tagged DJs with avatars)
- Genres list

### Post-Event Section (status = COMPLETED)

- Recap text
- Photo gallery (masonry grid, lightbox on click)
- External audio/video link (rendered as styled embed link)

### Related Events Section

- 3 upcoming events from the same DJ
- 3 upcoming events in same city + category (future)

### MVP vs Future

| Feature                          | MVP | Future           |
| -------------------------------- | --- | ---------------- |
| Hero, poster, details            | ✅  | —                |
| Gallery with lightbox            | ✅  | —                |
| Recap text                       | ✅  | —                |
| Co-performers                    | ✅  | —                |
| Related events (same DJ)         | ✅  | —                |
| Related events (same city/genre) | ❌  | ✅               |
| Comments section                 | ❌  | ✅               |
| RSVP / Attendance                | ❌  | ✅               |
| Share to social                  | ❌  | ✅               |
| Setlist embed                    | ❌  | ✅               |
| SEO metadata (ISR 60s)           | ✅  | Enhanced OG tags |

---

## 16. Database Planning

> Architecture recommendations only. No schema code.

### Recommended Event Model Changes

The existing `Event` model is a valid skeleton but missing critical fields.

**Fields to add:**

| Field        | Type                      | Notes                                          |
| ------------ | ------------------------- | ---------------------------------------------- |
| `slug`       | String unique             | URL-safe, required for `/events/[slug]`        |
| `eventType`  | Enum: `PUBLIC \| PRIVATE` | New enum                                       |
| `category`   | String                    | App-layer validated, not DB enum               |
| `startTime`  | String?                   | e.g. "22:00" — avoids TZ complexity            |
| `endTime`    | String?                   | e.g. "05:00"                                   |
| `posterUrl`  | String?                   | Rename from current `image`                    |
| `posterPath` | String?                   | For deletion on re-upload (mirrors DJ pattern) |
| `ticketUrl`  | String?                   | Null for PRIVATE events                        |
| `recap`      | String?                   | Post-event text                                |
| `audioLink`  | String?                   | SoundCloud / Mixcloud external URL             |
| `videoLink`  | String?                   | YouTube / Vimeo — Premium only                 |
| `featured`   | Boolean                   | Default false                                  |
| `viewCount`  | Int                       | Default 0                                      |
| `genres`     | String[]                  | Matches Gig pattern — no join table in MVP     |

**Fields to rename:**

- `image` → `posterUrl` (clearer intent)

**Relationships to preserve (already exist ✅):**

- `ownerDjId → DjProfile`
- `participants → EventDj[]`
- `countryId`, `cityId`

### EventMedia Model (new)

Do NOT reuse the generic `Media` model for event gallery. The existing `Media` model is DJ-scoped (`djProfileId`). Event gallery is a different ownership domain.

**Fields:**

| Field       | Type              | Notes                                |
| ----------- | ----------------- | ------------------------------------ |
| `id`        | Int autoincrement | PK                                   |
| `eventId`   | Int               | FK to Event                          |
| `url`       | String            | Supabase Storage public URL          |
| `path`      | String            | Supabase Storage path (for deletion) |
| `caption`   | String?           | Optional                             |
| `sortOrder` | Int               | Default 0, for gallery ordering      |
| `createdAt` | DateTime          |                                      |

### EventDj (existing — minor additions)

| Field          | Addition                                |
| -------------- | --------------------------------------- |
| `role`         | String? — "Headliner", "Support", "B2B" |
| `setStartTime` | String? — future use                    |
| `setEndTime`   | String? — future use                    |

### Recommended Indexes

| Index                      | Purpose                    |
| -------------------------- | -------------------------- |
| `Event.slug`               | URL lookup                 |
| `Event.status + startDate` | Homepage / listing queries |
| `Event.ownerDjId + status` | DJ profile queries         |
| `Event.featured`           | Homepage featured section  |
| `Event.cityId + status`    | Location-based browsing    |
| `EventMedia.eventId`       | Gallery queries            |

---

## 17. Security Planning

### Ownership Validation

- All event mutations (create, update, delete, media upload) validate `ownerDjId` matches authenticated user's `DjProfile.id`
- Server actions only — no client-side Supabase calls
- Pattern: same as `uploadDjAvatar` / `updateOrganizerProfile`

### Edit Permissions

- Only `ownerDj` can edit their events
- Admin can update `status` and `featured` fields only
- Co-performers (`EventDj`) cannot edit — read-only access

### Media Upload Permissions

- `events/{eventId}/poster/...` — upload permitted only to `ownerDj`
- `events/{eventId}/gallery/...` — same
- Supabase RLS: check `auth.uid()` against `Event.ownerDj.userId` via policy join

### Delete Permissions

- Soft delete (`deletedAt = now()`) only from UI
- Hard delete available to Admin only
- Deleting an event cascades to `EventMedia` records + deletes Supabase Storage files

### Public Access Rules

- `DRAFT` events: owner only — never returned from public queries
- `PUBLISHED` events: all users including guests — RLS SELECT: `status IN ('PUBLISHED', 'COMPLETED', 'CANCELLED')`
- `CANCELLED` events: visible with badge
- `ARCHIVED` events: owner + admin only

---

## 18. Monetization Roadmap

### MVP — Free Tier (all DJs)

- Up to **10 events** total
- 1 poster per event (5MB max)
- Up to **12 gallery photos** per past event
- **500 char** recap
- **1 external audio link** per event
- Featured Performances: pinned on own profile only (not homepage)

### Growth — Premium Plan

- **Unlimited events**
- **40 gallery photos** per past event
- **2000 char** recap
- **3 external audio/video links**
- **3 Featured Performances** pinned on profile AND eligible for homepage rotation
- **Homepage Event Carousel** inclusion (upcoming events shown on homepage)
- **Basic analytics**: view count, ticket URL clicks

### Scale — Future Tiers

- **Boosted Events** — pay-per-placement on `/events` top position
- **Sponsored Event slots** — homepage fixed weekly/monthly fee
- **Advanced analytics** — geographic breakdown, referral sources
- **Ticket integration** — Ticketmaster, Dice, Resident Advisor partnerships
- **Event Promotion** — DJscovery email to fans in event's city

---

## 19. Risks & Recommendations

### Over-engineering Risks

- **Do not build a ticketing system** — link out to external ticket URLs only
- **Do not build RSVP in MVP** — `EventAttendance` model exists in schema but defer it
- **Do not add setlist management** — external Mixcloud/SoundCloud links are sufficient for v1
- **Do not add co-performer invitations** — let DJs tag other DJs by slug, no acceptance flow in v1

### UX Risks

- **Blank profiles discourage entry** — surface "Add your first event" CTA immediately after DJ approval with a progress tracker
- **Date confusion** — always store `startDate` as UTC. In MVP, display without timezone indicator — acceptable tradeoff
- **PRIVATE events need minimum context** — don't hide too much. City + category + date is enough to show credibility without leaking client privacy

### Storage Risks

- **Gallery photos are the biggest cost driver** — enforce server-side size limits (5MB per file, validated in server action before upload)
- **Orphaned storage files** — implement deletion on `EventMedia` record removal and on event hard-delete
- **Event ID in storage path** — the existing storage spec already accounts for `events/{eventId}/...` — consistent and safe

### Moderation Risks

- **DJs adding unverifiable high-profile events** (claiming to have played Berghain)
  - MVP mitigation: No automatic verification. Trust the market. Organizers will flag fakes.
  - Future: Verification badge when the organizer is also on DJscovery and confirms the booking
- **Inappropriate gallery photos** — add a report mechanism on gallery images (Future)

---

## 20. Demo Data Seed Strategy

### Pattern (mirrors gigs exactly)

The `djscovery_events_seed.json` file (40 events) follows the same strategy as `getDemoGigs()`.

**File structure:**

```
src/data/djscovery_events_seed.json   ← static JSON (existing seed file)
src/types/event-demo.ts               ← DemoEvent interface + EventDemoCategory type
src/data/events-demo.ts               ← getDemoEvents() + getDemoEventsByDjSlug()
```

### Recommended JSON Structure Additions

The current seed is nearly complete. Add these fields:

| Field      | Value example                           | Reason                                              |
| ---------- | --------------------------------------- | --------------------------------------------------- |
| `id`       | `"demo-event-001"`                      | Deduplication (mirrors gigs pattern)                |
| `slug`     | `"mira-sol-sunset-grooves-lisbon-demo"` | URL routing                                         |
| `djSlug`   | `"mira-sol"`                            | Replace `djName` — must match demo DJ slugs exactly |
| `featured` | `false`                                 | Marks demo featured events                          |
| `status`   | `"PUBLISHED"`                           | Explicit status                                     |
| `genres`   | `["Melodic House", "Organic House"]`    | Filtering support                                   |

### Date Strategy

Use `daysFromNow(days)` helper from `gigs-demo.ts` for upcoming events.
Add `daysAgo(days)` mirror function for past events.

**Recommended split of 40 events:**

- ~25 upcoming (positive `daysFromNow`)
- ~15 past (negative offset via `daysAgo`)

This creates a realistic portfolio spread regardless of when the app loads.

### Staging Merge Logic (identical to gigs)

```
isStaging = process.env.NEXT_PUBLIC_APP_ENV === "staging"

Staging:    DB events + demo events, deduped by slug, slice N
Production: DB events only, never demo
```

### Production Safety

- Demo events must never be inserted into any database
- All demo data carries `isDemo: true` flag on merged items
- JSON files only — never seeded to DB

---

## 21. MVP Scope Summary

### Included in MVP v1

- Create / edit / delete events (5 required fields)
- PUBLIC / PRIVATE event types
- Category controlled list (12 categories)
- Poster upload
- Event lifecycle: DRAFT → PUBLISHED → COMPLETED / CANCELLED
- Auto-complete after 48h via Vercel Cron
- Post-event: gallery (12 photos Free / 40 Premium), recap (500 chars Free / 2000 Premium), 1 audio link
- Featured Performances (3 max, on own profile only for Free)
- DJ profile sections: Upcoming / Past / Featured
- Event detail page with ISR (60s revalidation)
- `/events` listing page with filters (country, city, category, type, date range)
- Homepage Upcoming Events section (DB events; staging shows demo)
- Demo data from JSON (staging only, never production)
- Supabase RLS ownership rules

### Deferred to v2+

- Comments on events
- RSVP / EventAttendance
- Co-performer invitations (accept/decline flow)
- Setlist management
- Video uploads (MVP = external link only)
- Event analytics
- Boosted / sponsored events
- Ticket platform integrations
- Organizer event confirmation / verification badge
- Recurring events
- Map view on `/events`
- "Near me" geolocation filter
