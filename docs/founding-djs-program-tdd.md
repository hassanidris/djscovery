# DJcovery Founding DJs Program – Technical Design Document

**Version:** 1.5  
**Date:** August 30, 2026  
**Status:** Draft  
**Author:** Lead Software Architect

**Changelog (v1.5):**

- Promoted `AdminActionLog` from "Future" to MVP (§19.14). Resolves the contradiction between §13.7 (bulk actions in MVP), §19.3/§19.4/§29 (audit logging listed as a security control / compromise mitigation), and the prior "Future" tag on the audit table. Rationale: bulk actions without a persistent, append-only record are the riskiest untracked mutations in the system, and the table is ~30 lines of schema + a one-line `logAdminAction()` call per server action — the cheapest insurance in the TDD. Schema enriched with `batchId`, `status`, `before`/`after` for destructive-action reconstruction. Append-only enforcement via RLS (admin cannot mutate own log rows). The audit-log _viewer_ UI remains deferred (query via Prisma Studio / `psql` until a second admin or compliance ask justifies a UI).
- Clarified §13.7: bulk actions write one log row per affected record, all sharing a `batchId`, so a bulk operation can be reversed in a single query.
- Clarified §29 (admin account compromise): 2FA is on for the admin account regardless of the audit-log decision (orthogonal — 2FA is prevention, audit log is detection + recovery); audit logging is now in MVP, not deferred.

**Changelog (v1.4):**

- Redesigned premium expiry mechanics (§15.2, §15.3, §15.4, §15.6): replaced the `premiumMonthsGranted` / `premiumMonthsUsed` counter model on `FoundingMember` with a `premiumUntil` timestamp on `DjProfile` as the source of truth for active-premium expiry. `DjProfile.plan` is now the cached/enumerated state reconciled against `premiumUntil` by the daily cron sweep.
- Extended `DjPlan` enum from `FREE | PREMIUM` to `FREE | FOUNDING | PREMIUM` (§15.2). `FOUNDING` is the permanent baseline for founding DJs; `FREE` is the baseline for non-founding DJs. Both can be elevated to `PREMIUM` (complimentary or paid); both return to their own baseline on expiry.
- Added the "founding DJ returns to FOUNDING, not FREE, after any premium expiry" guarantee as an explicit design invariant (new §15.6). This covers the future-paid-premium scenario: a founding DJ who later pays for premium and then downgrades returns to `FOUNDING`, not `FREE`, with no special-case code — the expiry sweep joins `FoundingMember` to pick the correct downgrade target.
- Removed `premiumMonthsGranted` / `premiumMonthsUsed` from `FoundingMember` (§8.1). Added `premiumDaysRemainingAtSuspend` (Int?) to `FoundingMember` for the suspend/reinstate case. Added `premiumUntil` (DateTime?) to `DjProfile` (§15.2).
- Updated §23.2 launch data changes to set `premiumUntil = now() + 3 months` alongside `plan = PREMIUM`.

**Changelog (v1.3):**

- Resolved the under-specified "detect existing account on application" bullet (§10.3) by adding admin-mediated fast-track design for DJs who already have a profile when they apply to the founding program (new §10.5, §8.1 fields `existingAccountDetected` / `linkedDjProfileId` / `existingAccountResolution`, new `ExistingAccountResolution` enum, §9.2 fast-track approval trigger, §8.4 edge case #4)

**Changelog (v1.2):**

- Clarified that email verification uses a custom token on `FoundingApplication`, not a Supabase auth flow (§2.2, §3.2 Decision 6, §19.12)
- Added social-ownership verification design: admin manual review with checklist, impersonation clause, and engagement-only follow ask (§2.2, §3.2 Decision 7, §9.2, §13.2, §19.15, §27.2, §27.3, §29.4, §30.3 Trade-off 5)
- Added `socialVerifiedBy` field to `FoundingApplication` schema (§8.1)

---

## 1. Executive Summary

### 1.1 Purpose

This Technical Design Document (TDD) defines the architecture for implementing the DJcovery Founding DJs Program—a controlled pre-launch initiative to build a high-quality DJ community, validate demand, and populate the platform with real DJs before public launch.

### 1.2 Scope

The Founding DJs Program enables DJs to apply during pre-launch, undergo vetting, receive invitations, complete onboarding, and become founding members with exclusive rewards. The system must support seamless transition from founding mode to public launch without architectural refactoring.

### 1.3 Key Design Principles

- **Configuration-Driven Mode Switching:** Transition between founding/public modes via environment variables, not code changes
- **Minimal Technical Debt:** Avoid temporary workarounds; build production-quality features from day one
- **Scalable Foundation:** Design for future expansion to organizers, fans, venues, agencies
- **Solo-Founder Maintainability:** Keep complexity manageable; avoid over-engineering
- **Security-First:** Secure invitation tokens, proper authorization, audit trails
- **Clean Separation:** Isolate founding program logic to avoid scattering throughout the application

### 1.4 Current Architecture Context

DJcovery uses:

- Next.js 16.2.10 App Router with React 19
- Supabase Auth (email, Google, magic links)
- Prisma v7 with PostgreSQL
- Resend for email
- RLS policies for data security
- Admin dashboard with DJ approval workflow

The Founding Program will extend—not replace—this architecture.

**Note:** The existing `PRE_LAUNCH_MODE` flag in `src/proxy.ts` will be replaced by `SITE_MODE` as part of this implementation.

---

## 2. Business Flow

### 2.1 Complete User Journey

```
Visitor
  ↓
Landing Page (/founding-djs)
  ↓
Application Form
  ↓
Confirmation Page
  ↓
Email Verification (if email signup)
  ↓
Application Review (Admin)
  ↓
Approval Decision (Admin)
  ↓
Invitation Email Sent
  ↓
User Clicks Invitation Link
  ↓
Authentication (Sign In / Sign Up)
  ↓
Account Linking (if email mismatch)
  ↓
DJ Onboarding (Prefilled Data)
  ↓
Profile Submission
  ↓
Admin Profile Review
  ↓
Profile Approved
  ↓
Public DJ Profile (founding badge)
  ↓
Official Launch (rewards activated)
```

### 2.2 Stage Explanations

**Visitor → Landing Page**

- Public landing page explaining Founding Program benefits
- No authentication required
- Clear CTA to apply

**Landing Page → Application Form**

- Multi-step form collecting contact, experience, location, social media, portfolio
- Email validation for uniqueness
- Existing user detection

**Application Form → Confirmation Page**

- Success message with application ID
- Expected timeline communication
- Email verification request
- Engagement nudge: "Follow @djscovery on Instagram and TikTok to stay in the loop on your application and get launch updates." (framed as news/engagement, NOT verification — see §19.15)
- Impersonation clause acknowledgment (required checkbox at submission — see §19.15)

**Confirmation → Email Verification**

- Verification email sent to applicant
- Token-based verification (24-hour expiry)
- Uses a **custom email-ownership token** stored on `FoundingApplication` (`emailVerificationToken`, `emailVerificationExpiresAt`), NOT a Supabase auth flow — the applicant has no Supabase account at verify time (see §3.2 Decision 6)
- Updates application status to EMAIL_VERIFIED

**Email Verification → Application Review**

- Admin dashboard displays pending applications
- Admin can view all data and add notes
- Admin performs social-ownership verification via manual review checklist (see §19.15) — this is a separate concern from email verification, which only proves email ownership, not social-account ownership

**Application Review → Approval Decision**

- Admin approves or rejects application
- Approval triggers invitation generation

**Approval → Invitation Email Sent**

- Secure invitation token generated
- Email contains unique signup link
- Token expires in 7 days

**Invitation → Authentication**

- User clicks invitation link
- Sign-up or sign-in flow
- Token validated and consumed

**Authentication → Account Linking**

- If invitation email differs from account email, display mismatch warning
- Require email verification of new address (uses the same custom-token mechanism as application-time verification — independent of Supabase's built-in email confirmation; see §3.2 Decision 6)
- Prevents duplicate accounts

**Authentication → DJ Onboarding**

- Onboarding form prefilled with application data
- User can edit all fields
- Additional onboarding fields (avatar, cover image, detailed bio)

**Onboarding → Profile Submission**

- User submits complete profile
- Profile status: PENDING_APPROVAL
- Admin notification sent

**Profile Submission → Admin Profile Review**

- Admin reviews profile in existing approval workflow
- Uses existing DjProfileStatus enum

**Admin Review → Profile Approved**

- Profile becomes publicly visible
- Founding badge assigned
- Founding number assigned
- User receives approval email

**Profile Approved → Official Launch**

- Founding rewards activated (premium months, priority ranking, homepage feature)
- Founding badge becomes permanent

---

## 3. Technical Architecture

### 3.1 Architectural Overview

Layered architecture with clear separation:

- Presentation Layer (Next.js App Router, React Components)
- Application Layer (Server Actions, Route Handlers)
- Domain Layer (Business Logic, Services)
- Data Layer (Prisma ORM, PostgreSQL)

### 3.2 Key Architectural Decisions

**Decision 1: Separate FoundingApplication Model**

- New model stores application data
- Decoupled from User model (applications can exist without accounts)
- Enables anonymous applications during pre-launch

**Decision 2: Invitation Token Table**

- New InvitationToken model for secure token management
- Tokens stored in database for revocation, expiry tracking, audit trail
- Prevents replay attacks

**Decision 3: Site Mode Configuration**

- Single environment variable: SITE_MODE (founding | public | maintenance)
- SITE_MODE replaces the existing PRE_LAUNCH_MODE boolean flag
- Middleware enforces mode-based access control
- No code changes required for mode switching

**Migration Note:** When implementing this design, remove PRE_LAUNCH_MODE from src/proxy.ts and environment configuration. SITE_MODE provides the same pre-launch gating via the "founding" mode, plus additional modes for public launch and maintenance.

**Decision 4: Prefill Strategy**

- Application data stored separately from profile
- Onboarding reads from application when creating profile
- User can edit all fields
- Application retained for audit trail

**Decision 5: Founding Rewards as Data**

- Rewards stored in database, not hardcoded
- FoundingMember model tracks founding status
- Enables future reward modifications without code changes

**Decision 6: Custom Email-Ownership Token (Not Supabase Auth Flow)**

- Email verification at application time uses a **custom token** stored on `FoundingApplication` (`emailVerificationToken`, `emailVerificationExpiresAt`, `emailVerified`), NOT a Supabase auth flow
- The applicant has no Supabase account at verify time — the application is a vetting artifact, the Supabase account is an identity artifact, and they are deliberately decoupled (see Decision 1)
- The Supabase account is created only when an approved applicant accepts their invitation and signs up (§2.1, §11) — gated behind admin approval
- Rationale: most applications will never become accounts (rejections, abandonments, expired invitations — see §8.4 case #1). Creating a Supabase user upfront would pollute `auth.users` with orphaned identities for every rejected/spam/abandoned application
- The same custom-token mechanism is reused for account-linking email mismatch (§2.2, §10.2) — it proves ownership of an arbitrary email address, independent of Supabase's built-in email confirmation
- Token security: SHA-256 digest stored, raw token never persisted (see §19.8, §30.3 Trade-off 1)
- Upgradeable: if a future business decision requires applicants to self-serve before approval (e.g., edit their application after submission), that would be a new ADR — it merges the vetting artifact and the identity artifact and conflicts with Decision 1

**Decision 7: Social-Ownership Verification via Admin Manual Review**

- Social-account ownership (Instagram, TikTok, SoundCloud, etc.) is verified by **admin manual review with a structured checklist**, not by an automated flow
- This is a **separate concern** from email verification: email verification proves "you control this email address"; social verification proves "you control this social profile." The TDD solves the first with a custom token (Decision 6) and the second with admin review
- Rationale: social platforms do not expose "who owns this URL" to the public. Automated approaches (OAuth "Connect Instagram", Story-tag challenges, DM challenges) are either heavy (Meta app review, weeks of lead time) or add friction for the DJs being recruited (asking them to modify their bio or post a Story). For a curated ≤100 founding cohort with a human admin, manual review is the right cost/rigor tradeoff
- The follow ask ("Follow @djscovery on Instagram and TikTok") is **engagement only, never verification** — a follow is a one-way public action that proves nothing about account ownership (see §19.15)
- Backstops: impersonation clause in application terms (legal lever for revocation via `FoundingMember.status = REVOKED`, §9.2) + public reporting channel on profiles (post-launch) so the real DJ can flag a fake
- Post-MVP: revisit automated verification (OAuth for Instagram first, Story-tag fallback for platforms without OAuth) when public-mode volume outgrows admin-per-application capacity. Add `socialLinksVerified` schema at that point — not needed for MVP since verification is a single admin decision recorded in `adminNotes` + `socialVerifiedBy`

---

## 4. Environment Strategy

### 4.1 Development Environment

**Purpose:** Full platform access for testing and debugging

**Configuration:**

```env
NEXT_PUBLIC_APP_ENV=development
SITE_MODE=public
DATABASE_URL=local PostgreSQL
```

**Behavior:**

- All routes accessible
- Test data seeding enabled
- Debug logging enabled
- No rate limiting

### 4.2 Staging Environment

**Purpose:** Internal QA and feature testing

**Configuration:**

```env
NEXT_PUBLIC_APP_ENV=staging
SITE_MODE=founding
DATABASE_URL=staging Supabase
```

**Behavior:**

- Founding mode (matches production)
- All routes accessible for internal testing
- Real email sending to internal team
- Rate limiting enabled

### 4.3 Production (Founding Mode)

**Purpose:** Public access limited to founding program only

**Configuration:**

```env
NEXT_PUBLIC_APP_ENV=production
SITE_MODE=founding
DATABASE_URL=production Supabase
```

**Public Access:**

- Founding landing page, application, confirmation, legal pages
- Authentication routes
- Founding API endpoints (/api/founding/\*) for application submission and email verification only

**Internal Access (Authenticated):**

- Admin dashboard
- All routes for admin users
- Founding members (during private beta): DJ directory, profiles, dashboard, gigs, community, settings (see §7.3 for allowlist mechanism)

**Blocked Routes:**

- DJ directory, profiles, organizer pages, events, gigs, community, dashboards (for non-admin, non-founding-member users)

### 4.4 Production (Public Launch)

**Purpose:** Full platform access after launch

**Configuration:**

```env
NEXT_PUBLIC_APP_ENV=production
SITE_MODE=public
DATABASE_URL=production Supabase
```

**Behavior:**

- All routes accessible
- Founding program redirects or shows "closed" message
- Normal registration enabled
- Founding rewards active

### 4.5 Maintenance Mode

**Purpose:** Platform-wide maintenance

**Configuration:**

```env
NEXT_PUBLIC_APP_ENV=production
SITE_MODE=maintenance
```

**Behavior:**

- Single maintenance page
- Admin can bypass with authentication

---

## 5. Site Mode Strategy

### 5.1 Site Mode Enum

```typescript
enum SiteMode {
  FOUNDING = "founding",
  PUBLIC = "public",
  MAINTENANCE = "maintenance",
}
```

### 5.2 Mode Responsibilities

**FOUNDING Mode**

- Restrict public routes to founding program only
- Allow authenticated admin access to all routes
- Allow authenticated founding members access to dashboards and discovery routes during private beta (see §7.3)
- Enable application submission
- Enable invitation-based registration
- Disable normal registration
- Block dashboards and discovery features for all other users

**PUBLIC Mode**

- Full platform access
- Normal registration enabled
- Founding program redirects or shows "closed" message

**MAINTENANCE Mode**

- Single maintenance page
- Admin bypass available

### 5.3 Switching Strategy

**Configuration-Based Switching**

- Single environment variable: SITE_MODE
- Read by middleware on every request
- No code deployment required for mode changes

**Deployment Process**

```bash
# Update environment variable
SITE_MODE=public
vercel env pull .env.production
vercel --prod
```

**Rollback Process**

- Revert environment variable
- Deploy (no code changes)
- Instant rollback

---

## 6. Route Architecture

### 6.1 Route Structure

```
src/app/
├── (public)/                    # Public routes (all modes)
│   ├── page.tsx
│   ├── about/
│   ├── contact/
│   ├── faq/
│   ├── terms/
│   └── privacy/
│
├── (founding)/                  # Founding program routes
│   ├── founding-djs/
│   │   ├── page.tsx            # Landing page
│   │   ├── apply/page.tsx      # Application form
│   │   ├── success/page.tsx    # Confirmation
│   │   ├── verify-email/page.tsx
│   │   └── invitation/[token]/page.tsx
│
├── (auth)/                      # Authentication routes
│   ├── sign-in/
│   ├── sign-up/
│   ├── forgot-password/
│   ├── update-password/
│   └── auth/callback/
│
├── (protected)/                 # Protected routes (auth required)
│   ├── dashboard/
│   ├── select-role/
│   ├── become-dj/
│   ├── become-organizer/
│   ├── become-fan/
│   ├── settings/
│   └── profile/
│
├── (dj)/                        # DJ-specific routes
├── (organizer)/                 # Organizer-specific routes
├── (fan)/                       # Fan-specific routes
├── (community)/                 # Community routes
├── (gigs)/                      # Gigs marketplace
├── (admin)/                     # Admin routes
│   └── admin/
│       ├── founding/
│       │   ├── applications/
│       │   ├── invitations/
│       │   └── members/
│       └── ...
└── (api)/                       # API routes
    └── api/
        └── founding/
```

### 6.2 Route Groups Rationale

**(public)** - Routes accessible in all modes, no authentication required

**(founding)** - Founding program specific routes, only accessible in founding mode

**(auth)** - Authentication flows, accessible in all modes

**(protected)** - Require authentication, accessible in public mode only (except admin)

**(dj), (organizer), (fan)** - Role-specific dashboards, blocked in founding mode

**(community), (gigs)** - Discovery features, blocked in founding mode

**(admin)** - Admin dashboard, require authentication + admin role, accessible in all modes

**(api)** - Server actions and API routes, protected by server-side validation

---

## 7. Middleware Design

### 7.1 Middleware Responsibilities

**1. Site Mode Enforcement**

- Read SITE_MODE from environment
- Block routes based on mode
- Redirect to appropriate landing page

**2. Authentication**

- Verify Supabase session
- Redirect unauthenticated users
- Refresh session

**3. Role-Based Access**

- Check user roles for protected routes
- Redirect unauthorized users

**4. Admin Protection**

- Verify admin role for admin routes

**4b. Founding Member Beta Access**

- During founding mode, exempt active founding members from route blocks
- Check FoundingMember status via cached claim (see §7.3)
- Allow access to dashboards and discovery routes for beta testing

**5. SEO Headers**

- Add X-Robots-Tag based on mode

**6. Security Headers**

- CSP, X-Frame-Options

### 7.2 What Middleware Does NOT Handle

- Business logic (in server actions)
- Data validation (in schemas)
- Authorization beyond role checks (in server actions)
- Email sending (in services)
- Database operations (in repositories)
- Invitation token validation (in server actions)

### 7.3 Founding Member Beta Access (Private Beta)

**Purpose:** During private beta (SITE_MODE=founding), active founding members need access to dashboards and discovery routes that founding mode otherwise blocks. This resolves the contradiction between §22.2/§23.1 (beta members get platform access) and §4.3/§5.2 (founding mode blocks those routes).

**Allowlist Mechanism:**

Middleware checks founding member status as an additional condition after admin checks:

```
if (SITE_MODE === 'founding') {
  if (isAdmin(session))        → allow all routes
  if (isFoundingMember(session)) → allow beta routes (dashboards, discovery)
  else                         → block discovery/dashboard routes, allow founding + public + auth routes
}
```

**Beta Routes (routes exempted for founding members):**

- /dashboard and sub-routes
- /djs and DJ profile routes
- /gigs and gig routes
- /community and community routes
- /settings and /profile (own profile management)

**Performance — Avoiding Per-Request DB Lookups:**

Founding member status is resolved once at sign-in and cached, not queried on every request:

- **Approach:** At sign-in, query `FoundingMember` for the user. If found with `status=ACTIVE`, set a custom claim on the Supabase JWT (e.g., `founding_member: true`) or a short-TTL Redis entry keyed by `userId` (5-minute expiry, refreshed on session refresh).
- Middleware reads the cached claim — zero DB hits per request.
- Claim is invalidated/refreshed when FoundingMember.status changes (e.g., admin suspends a member).

**Activation Trigger:**

Private beta begins when admin enables beta access for founding members (see §22.2, §23.1). No SITE_MODE change required — the allowlist is active whenever SITE_MODE=founding and the user has an active FoundingMember record.

**Deactivation:**

When SITE_MODE flips to public (§23.2), the allowlist becomes a no-op — all routes are open to everyone. No code change or rollback needed.

---

## 8. Database Design

### 8.1 New Models

#### FoundingApplication

**Purpose:** Store DJ applications during founding program

**Fields:**

- `id` (Int, @id, autoincrement)
- `applicationNumber` (String, unique) - Sequential: APP-0001 (see §8.4 for the numbering and cap policy)
- `status` (FoundingApplicationStatus, default: PENDING)
- `email` (String, indexed)
- `name` (String)
- `phone` (String?)
- `countryId` (Int, indexed)
- `cityId` (Int, indexed)
- `experienceYears` (Int)
- `genres` (String[])
- `experienceLevel` (ExperienceLevel)
- `socialLinks` (Json)
- `portfolioLinks` (String[])
- `bio` (String?)
- `referralCode` (String?)
- `adminNotes` (String?)
- `rejectionReason` (String?)
- `emailVerified` (Boolean, default: false)
- `emailVerifiedAt` (DateTime?)
- `emailVerificationToken` (String?) - SHA-256 digest of the raw token; raw value is never persisted (see §19.8, §30.3). Custom email-ownership token, NOT a Supabase auth flow (see §3.2 Decision 6)
- `emailVerificationExpiresAt` (DateTime?)
- `socialVerifiedBy` (String?) - Admin user ID who performed social-ownership verification (manual review checklist, see §19.15). Pairs with `reviewedBy`. NULL means social links have not been reviewed yet
- `invitationTokenId` (Int?)
- `userId` (String?) - Set either on invitation acceptance (new-DJ path, §10.2) or on admin "Link & approve" (existing-DJ fast-track path, §10.5). The two paths are distinguishable via `existingAccountResolution`
- `existingAccountDetected` (Boolean, default: false) - Set at submission time when an existing `User` (by email) or `DjProfile` (by owner email) matches the application email. Flags the application for admin attention; does NOT block submission and does NOT auto-link (see §10.5)
- `linkedDjProfileId` (Int?) - The existing `DjProfile` ID, set when admin fast-tracks an existing DJ via "Link & approve" (§10.5). NULL for the normal new-DJ path
- `existingAccountResolution` (ExistingAccountResolution?) - Admin's resolution of an existing-account match. NULL when no match was detected or when a match is pending admin decision. See §10.5
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- `reviewedAt` (DateTime?)
- `reviewedBy` (String?)

**Indexes:**

- status, email, countryId, cityId, createdAt, applicationNumber

#### InvitationToken

**Purpose:** Secure invitation tokens for account creation

**Fields:**

- `id` (Int, @id, autoincrement)
- `token` (String, unique) - SHA-256 digest of the raw token; raw value is never persisted (see §19.8, §30.3)
- `type` (InvitationType)
- `status` (InvitationStatus, default: ACTIVE)
- `email` (String, indexed)
- `foundingApplicationId` (Int, unique, nullable)
- `expiresAt` (DateTime)
- `usedAt` (DateTime?)
- `usedBy` (String?)
- `createdAt` (DateTime)
- `revokedAt` (DateTime?)
- `revokedBy` (String?)
- `revocationReason` (String?)

**Indexes:**

- token, email, status, expiresAt, foundingApplicationId

#### FoundingMember

**Purpose:** Track founding members and their rewards

**Fields:**

- `id` (Int, @id, autoincrement)
- `userId` (String, unique)
- `djProfileId` (Int, unique)
- `foundingNumber` (Int, unique)
- `applicationId` (Int, unique)
- `invitationTokenId` (Int, unique)
- `status` (FoundingMemberStatus, default: ACTIVE)
- `premiumDaysRemainingAtSuspend` (Int?) - Days of premium remaining at the time of suspension, used to restore `DjProfile.premiumUntil` on reinstate. NULL when the member has never been suspended or has no active premium. See §15.4 suspend/reinstate. (Premium expiry itself is tracked via `DjProfile.premiumUntil`, NOT via counters on this model — see §15.2.)
- `homepageFeaturedUntil` (DateTime?)
- `priorityRankingUntil` (DateTime?)
- `badgeVisible` (Boolean, default: true)
- `launchedAt` (DateTime?)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Deferred to Post-MVP (see §16.3):** `referralCode` (String, unique) and `totalReferrals` (Int, default: 0) are **not** included in the MVP schema. They will be added in the same migration that introduces the `Referral` table (§16.2, §26.1), with a backfill that generates codes for the ≤100 existing members.

**Indexes:**

- userId, djProfileId, foundingNumber, status

### 8.2 New Enums

#### FoundingApplicationStatus

```typescript
enum FoundingApplicationStatus {
  PENDING = "PENDING",
  EMAIL_VERIFIED = "EMAIL_VERIFIED",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
  EXPIRED = "EXPIRED",
  COMPLETED = "COMPLETED",
}
```

#### ExistingAccountResolution

Records the admin's decision when `existingAccountDetected = true` (see §10.5). NULL means no match was detected or a detected match is still pending admin decision.

```typescript
enum ExistingAccountResolution {
  LINKED_AND_APPROVED = "LINKED_AND_APPROVED", // Fast-track: existing profile promoted to founding status, no invitation sent
  APPROVED_AS_NEW = "APPROVED_AS_NEW", // Admin confirmed the applicant is a different person; normal invitation flow proceeds
  REJECTED = "REJECTED", // Admin rejected (e.g., suspected perk abuse, impersonation)
}
```

#### InvitationType

```typescript
enum InvitationType {
  FOUNDING_DJ = "FOUNDING_DJ",
  FUTURE_USE = "FUTURE_USE",
}
```

#### InvitationStatus

```typescript
enum InvitationStatus {
  ACTIVE = "ACTIVE",
  USED = "USED",
  EXPIRED = "EXPIRED",
  REVOKED = "REVOKED",
}
```

#### FoundingMemberStatus

```typescript
enum FoundingMemberStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  REVOKED = "REVOKED",
}
```

### 8.3 Relationships

```
User (1) ────── (0..1) FoundingApplication
  │                     │
  │                     (1) ────── (1) InvitationToken
  │
  (1) ────── (1) FoundingMember
  │
  (1) ────── (1) DjProfile

FoundingApplication (1) ────── (1) Country
FoundingApplication (1) ────── (1) City
```

### 8.4 Numbering & Cap Policy

**Two independent sequences with distinct prefixes:**

| Property            | `applicationNumber` (FoundingApplication)                            | `foundingNumber` (FoundingMember)                            |
| ------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------ |
| Prefix / format     | `APP-0001` (zero-padded to 4 digits)                                 | `FDJ-001` (zero-padded to 3 digits)                          |
| Type                | String, unique                                                       | Int, unique                                                  |
| When assigned       | At application submission                                            | At profile approval (§14.4)                                  |
| Audience            | Internal / admin / applicant tracking                                | Public — profile, marketing, "permanent recognition" (§18.4) |
| Cap                 | None (open-ended)                                                    | Soft cap of 100 founding members (see below)                 |
| When issuance stops | When the program closes (FDJ cap reached)                            | When the 100-member cap is reached                           |
| Gaps                | Expected and acceptable (rejections, spam, withdrawals, expirations) | Only from revocation (rare)                                  |
| Reuse               | Never                                                                | Never                                                        |
| Shown to applicant  | Yes — as a tracking/reference ID                                     | No — only after the applicant is approved and onboarded      |

**Why two prefixes:** Reusing `FDJ-` for both sequences created ambiguity — a rejected applicant and an approved member could both legitimately claim "FDJ-007." Reserving `FDJ-` exclusively for founding members and using `APP-` for applications makes the two sequences unambiguous and keeps the founding number meaningful as a public, permanent identifier.

**Assignment logic (both sequences):**

- Monotonic counter: `next = MAX(number) + 1`.
- Unique constraint is the race-condition guard (catch P2002, retry — same pattern as `upsertDjRating` / `upsertDjGigReview` per `AGENTS.md`).
- No gap-filling, no free-list, no reuse logic. Rejected/withdrawn/expired/revoked rows are retained (§23.4: "Never delete data"), so their numbers are permanently consumed.

**Retire-don't-reuse rationale:**

1. **Permanence promise** — §15.1 lists "Founding Number (permanent)" as a reward; §18.4 markets "permanent recognition." Reassigning a number breaks that promise.
2. **Audit trail integrity** — Reviews, emails, admin logs, and `FoundingApplication`/`FoundingMember` rows all reference the number. Reuse makes historical references ambiguous.
3. **External references** — Members put "Founding DJ #7" on bios, social media, press kits. Those persist forever; reuse creates two people claiming the same number.
4. **Simpler logic** — `MAX + 1` with a unique constraint is trivially correct and race-safe. A reuse policy requires a free-list, gap-filling, and extra concurrency handling for no business value.
5. **No real cost to gaps** — Target is ~30–100 founding members; even with attrition the sequence stays small and gaps are cosmetic.

**Founding member cap (soft cap of 100):**

- The founding cohort is capped at 100 members. The cap is measured as `COUNT(FoundingMember WHERE status IN (ACTIVE, SUSPENDED))` — revoked members do not free a slot (their number is retired, not recycled).
- **Soft cap, not a hard wall:** Applications that were already submitted before the cap was hit continue to be processed. If approved and onboarded, they may push the final count slightly past 100 (e.g., `FDJ-103`). This avoids rejecting DJs who applied in good faith while the cap was being reached.
- **Automatic program closure:** When the cap is reached, the founding landing page (`/founding-djs`) flips from the application form to a "Founding Program Full" state. No new `APP-` numbers are issued. This is a UI/server-action gate, not a schema constraint.
- **Why stop accepting applications at the cap:** Collecting applications that can never be fulfilled is bad UX (a DJ applies, passes verification, then hears "sorry, we're full") and wastes admin review effort on outcomes that cannot result in a founding slot. Spam after the cap is prevented by closing the form.

**Waitlist (post-cap):**

- Once the cap is hit, the landing page offers a waitlist instead of a full application.
- Waitlist entries are **not** `FoundingApplication` records and do **not** receive an `APP-` number. They use a separate prefix (`WL-0001`) or no number — they are expressions of interest, not applications.
- Conversion: If a founding member is revoked (freeing a slot — note: the number is retired, but the slot count decreases) or a cohort 2 opens (§24, §26.3), waitlist entries are converted to real `FoundingApplication` records and receive the next `APP-` number at that time.

**Edge cases:**

1. **Approved applicant never onboards** — An approved applicant receives an invitation (7-day expiry) but never completes onboarding. Their `FoundingApplication` stays `APPROVED` but no `FoundingMember` is created, so **no `FDJ-` number is consumed**. The slot remains available for the next approved DJ. This is already how the schema works — `foundingNumber` is assigned at profile approval, not at application approval.
2. **Revocation after onboarding** — A founding member is revoked (`FoundingMember.status = REVOKED`). Their `foundingNumber` is retired (never reused), the row is retained (§23.4), and the slot count decreases by one — allowing one more approval from the pipeline or waitlist. The sequence will have a gap (e.g., `1,2,3,5,6` after #4 is revoked), which is acceptable and signals the number was once held.
3. **Suspension** — A suspended member (`status = SUSPENDED`) still counts toward the cap and still holds their `foundingNumber`. The number is not reassigned even temporarily, because the member may be reinstated.
4. **Existing-DJ fast-track (§10.5)** — A DJ who already has an approved public profile applies and the admin chooses "Link & approve." The founding number is assigned at the "Link & approve" action (the profile already exists and is already approved, so this is the equivalent of "profile approval" for the normal path). One slot is consumed, identical to an onboarded DJ. No invitation is generated, no onboarding occurs, and the application transitions APPROVED → COMPLETED in the same admin action. If the link is later found to be wrong, revocation (edge case #2) applies: the number is retired, the slot frees, and the existing `DjProfile` remains a normal public profile.
5. **Spam inflating `APP-`** — Bulk spam applications inflate `APP-` harmlessly (e.g., `APP-0500` with only `FDJ-020`). The magnitude of `APP-` is meaningless; only `FDJ-` reaching 100 triggers program closure. Spam is mitigated by: required social-media link at submission, email verification before admin review (§9.1), and rate limiting (§19.6).

**MVP vs. post-MVP:**

- **MVP:** Lock the policy now — "retire, don't reuse" with the two-prefix scheme is both the best practice and the cheaper implementation (`MAX + 1` vs. gap-filling). Retrofitting either the prefix split or the reuse policy after launch is painful because numbers will already be embedded in emails, profiles, and external bios.
- **Post-MVP:** The _display format_ is changeable (e.g., `FDJ-007` vs `#7` vs `Founding Member No. 7`) — that's a UI/format-string concern. The _reuse policy_ is effectively **not** changeable after launch without data-integrity risk, so it must be decided at MVP. This aligns with §1.3 ("Minimal Technical Debt — build production-quality features from day one").
- **Cohort 2 / organizer program (§24, §26.3):** The `APP-`/`FDJ-` scheme extends naturally — either continue the same sequence (if treating it as one ongoing program) or introduce a cohort suffix/prefix (e.g., `FDJ2-001`). `InvitationType.FUTURE_USE` (§8.2) already signals the invitation mechanism will be reused beyond the founding DJ cohort.

---

## 9. Status Lifecycle

### 9.1 FoundingApplication Lifecycle

```
PENDING → EMAIL_VERIFIED → UNDER_REVIEW → APPROVED → COMPLETED
  ↓              ↓               ↓            ↓
REJECTED      REJECTED       REJECTED    EXPIRED
```

### 9.2 Status Change Triggers

**PENDING → EMAIL_VERIFIED**

- Who: System (automatic)
- Trigger: User clicks email verification link
- Validation: Token valid, not expired

**EMAIL_VERIFIED → UNDER_REVIEW**

- Who: Admin
- Trigger: Admin opens application for review

**UNDER_REVIEW → APPROVED**

- Who: Admin
- Trigger: Admin clicks "Approve"
- Pre-condition: Admin has completed the social-ownership verification checklist (see §19.15) and set `socialVerifiedBy`. Approval without social verification is blocked in the UI
- Notification: Invitation email sent
- Existing-account variant: When `existingAccountDetected = true`, the admin chooses one of three resolutions (§10.5) instead of the standard Approve/Reject pair:
  - **Link & approve (fast-track):** `existingAccountResolution = LINKED_AND_APPROVED`. No invitation is generated; the existing profile is promoted directly. The application transitions APPROVED → COMPLETED in the same admin action (onboarding is bypassed). Founding number assigned at this point (§8.4 edge case #4).
  - **Approve as new:** `existingAccountResolution = APPROVED_AS_NEW`. Normal invitation flow proceeds.
  - **Reject:** transitions to REJECTED (see below).

**UNDER_REVIEW → REJECTED**

- Who: Admin
- Trigger: Admin clicks "Reject"
- Notification: Rejection email sent

**APPROVED → COMPLETED**

- Who: System (automatic)
- Trigger: DJ completes onboarding, profile approved — OR admin "Link & approve" fast-track (§10.5), in which case onboarding is bypassed and COMPLETED is reached in the same admin action
- Notification: Welcome email, founding badge assigned

### 9.3 Validations

- Email verification: Token must exist, not expired, not used
- Admin approval: Admin authenticated, application email-verified, social-ownership verification completed (`socialVerifiedBy` is set — see §19.15)
- Invitation acceptance: Token ACTIVE, not expired, not used
- Profile completion: User authenticated, DJ role, profile APPROVED

---

## 10. Authentication Design

### 10.1 Supported Methods

- Email/Password
- Google OAuth
- Magic Links
- Invitation Tokens

### 10.2 Account Linking Strategy

**Scenario: User applies with email A, later signs in with Google (email B)**

#### MVP Approach (Option A — Sign-in Match + Clear Warning)

- Detect mismatch on invitation acceptance
- Show a clear warning screen with the application email and the signed-in email
- Require the user to sign out and re-authenticate with the application email
- Do NOT auto-create a new account or silently link emails (prevents duplicates and security issues)
- Record `userId` on `FoundingApplication` only after the email match succeeds

**Rationale:**

- Supabase's secondary-email support is limited and fiddly (no first-class "link secondary email" API; requires custom identity mapping, manual OTP verification, and session merging)
- Founding program is a controlled, low-volume, vetted cohort — mismatch friction is acceptable
- Keeps a clean 1:1 mapping: application email == account email
- Option A is a strict subset of Option B — upgradeable without schema changes

**MVP Flow (on `/founding-djs/invitation/[token]`):**

1. Validate token → load `InvitationToken.email` (== `FoundingApplication.email`)
2. Not signed in → show sign-in/sign-up UI pre-filled with the invitation email, with a note: "Please sign in with **alice@example.com**. If you applied with a different email, sign out and use that one."
3. Signed in and `session.user.email === invitation.email` → proceed to onboarding
4. Signed in and emails mismatch → show warning screen:
   - "You applied with **alice@example.com** but you're signed in as **bob@gmail.com**."
   - Buttons: **Sign out & use alice@example.com** (primary) / **Contact support** (secondary)
5. Record resolved `userId` on `FoundingApplication` only after match succeeds

#### Post-MVP Approach (Option B — Full Secondary-Email Linking)

Deferred to post-launch. Add only if data shows a meaningful % of approved applicants abandon at the invitation step due to email mismatch AND the "sign out and retry" guidance isn't recovering them.

**Future Implementation:**

- Add a `LinkedEmail` table mapping secondary emails to Supabase user IDs
- Manual OTP verification flow for the secondary address
- Custom session/identity merging logic for OAuth providers
- Edge-case handling for existing duplicate Supabase accounts

**Upgrade Path:** Option A → Option B requires no schema changes to existing models; only additive `LinkedEmail` table and verification flow.

### 10.3 Duplicate Account Prevention

- User.email is unique
- FoundingApplication.email is unique within PENDING/APPROVED status
- Detect existing account on application — flags the application for admin-mediated fast-track handling (see §10.5); does NOT auto-link or block submission
- Detect existing account on invitation — handled by the email-mismatch warning flow in §10.2

### 10.4 Invitation Expiration

- Generated when application approved
- Expires in 7 days
- Single-use
- Cron job checks expiry daily
- Admin can regenerate

### 10.5 Existing-Account-on-Application Handling (Admin-Mediated Fast-Track)

**Problem:** §10.3 says "detect existing account on application" but did not specify the desired behavior. Djscovery is not greenfield — it already has live DJ profiles (§1.4). A realistic edge case is a DJ who already has an approved public profile applying to the founding program with the same email. The TDD's clean pipeline (stranger applies → admin vets → stranger becomes a founding member) does not model this case.

**Decision:** Admin-mediated fast-track (Option 3 of the three candidate behaviors). When an existing `User`/`DjProfile` matches the application email, the system flags the application and surfaces the match to the admin, who decides between three resolutions. The system never auto-links silently — a human confirms identity, mirroring the manual social-ownership review philosophy in Decision 7 (§3.2). "Same email = same person" is not a safe assumption (email reassignment, shared booking-agent emails, typosquatting), which is the same rationale behind Decision 6's custom email-ownership token.

**Detection (at application submission):**

1. After email-format validation, query for an existing `User` by `email` and an existing `DjProfile` by owner email.
2. If a match is found, set `existingAccountDetected = true` and store the matched `User.id` / `DjProfile.id` in memory for the admin review screen (the `DjProfile.id` is persisted to `linkedDjProfileId` only when the admin chooses "Link & approve").
3. Do NOT block submission. Do NOT auto-link. Do NOT skip email verification — the applicant still proves email ownership via the custom token (Decision 6), because the application is a vetting artifact independent of the existing identity artifact.
4. The application proceeds through the normal lifecycle: PENDING → EMAIL_VERIFIED → UNDER_REVIEW.

**Admin review UI (when `existingAccountDetected = true`):**

- Show a prominent banner at the top of the review screen: "⚠ This email matches an existing DJ profile: `dj-slug` — [View profile] [View user]"
- Display the existing profile's name, social links, and profile status alongside the application data so the admin can compare.
- Present three actions (replacing the standard Approve/Reject pair for this application):
  - **Link & approve (fast-track)** — Admin confirms the applicant is the same person who owns the existing profile.
  - **Approve as new** — Admin confirms the applicant is a different person who happens to share an email (rare; e.g., a shared booking-agent email). Normal invitation flow proceeds.
  - **Reject** — Admin rejects (e.g., suspected perk abuse, impersonation).

**Resolution flows:**

**Link & approve (fast-track) → `existingAccountResolution = LINKED_AND_APPROVED`:**

1. Set `userId` to the existing `User.id` and `linkedDjProfileId` to the existing `DjProfile.id`.
2. Skip invitation generation entirely (no `InvitationToken`, no invitation email). The existing user already has an identity.
3. Skip DJ onboarding — the profile already exists. The admin may optionally prompt the existing DJ to review/update their profile, but this is not required.
4. Directly create the `FoundingMember` record against the existing `userId` / `djProfileId`, assign the founding number, and apply founding rewards (badge, premium months, priority ranking).
5. Send a "You're now a Founding DJ" email (a new template variant, or reuse the Profile Approved / Founding Welcome email from §12.1 #7) instead of an invitation email.
6. Transition the application to APPROVED → COMPLETED in the same admin action (the onboarding step is bypassed because the profile already exists).
7. The social-ownership verification checklist (§19.15) still applies — the admin must complete it before "Link & approve" is enabled, same as the normal approval gate (§9.2). The existing profile's social links can be cross-referenced against the application's social links as part of the identity confirmation.

**Approve as new → `existingAccountResolution = APPROVED_AS_NEW`:**

1. Proceed with the normal invitation flow (§11): generate `InvitationToken`, send invitation email.
2. The existing account and the new founding member coexist as separate identities. Admin should add a note in `adminNotes` explaining why two accounts share an email (audit trail).
3. The email-mismatch handling in §10.2 does NOT apply here because the invitation email matches the application email by construction.

**Reject → `existingAccountResolution = REJECTED`:**

1. Transition to REJECTED. Rejection email sent. `rejectionReason` should record the existing-account context.

**Founding number assignment (consistency with §8.4):**

- Fast-track does NOT change when the founding number is consumed. Per §8.4, `foundingNumber` is assigned at profile approval, not at application approval. For fast-track, "profile approval" is the admin's "Link & approve" action (the profile already exists and is already approved, so the founding number is assigned at that moment). This keeps the cap accounting identical to the normal path: a fast-tracked DJ consumes one slot, same as an onboarded DJ.
- See §8.4 edge case #4 for the explicit fast-track case.

**Security & audit:**

- `reviewedBy` records the admin who made the link decision (existing field).
- `socialVerifiedBy` records the admin who completed social verification (existing field, §8.1).
- The fast-track action is audit-logged like any other admin action (§19.13).
- If an admin later discovers the link was wrong (different person, impersonation), the `FoundingMember` can be revoked via `status = REVOKED` (§9.2, §8.4 edge case #2), which retires the founding number and frees the slot. The existing `DjProfile` is unaffected (it remains a normal public profile).

**Policy configurability (MVP → post-launch):**

- The detection query and the three-resolution UI are reusable across `SITE_MODE` values — they are not founding-mode-specific.
- The _policy_ (which resolutions the admin is allowed to choose) may differ by mode:
  - `founding` (pre-launch): all three resolutions available. Fast-track is the expected outcome for the rare existing-profile case.
  - `public` (post-launch, if the founding program is reopened as a later cohort): the admin may want to restrict to "Reject" only if the cohort is defined as "new DJs only," or keep all three if existing DJs are eligible.
- Implementation: gate the available resolutions behind a configurable policy flag (e.g., `FOUNDING_EXISTING_DJ_POLICY = "all" | "fast_track_only" | "reject_only"`), defaulting to `"all"` for MVP. This aligns with the TDD's configuration-driven principle (§1.3, §5.3) and requires no code change to flip policy later.
- The schema additions (`existingAccountDetected`, `linkedDjProfileId`, `existingAccountResolution`) are additive and do not lock in any irreversible shape — unlike the founding-number scheme (§8.4), which is permanent. They survive unchanged into public mode.

**Why not the other two options:**

- **Reject (Option 1) as the sole behavior:** Hostile UX for existing DJs who want to support the program, and impossible in founding mode (no public profiles exist yet to match against). Reject remains available as one of the three admin resolutions, not the default.
- **Auto-link (Option 2):** Silently linking on email match contradicts Decision 6's core principle that email match is not identity proof. It is a security smell (email reassignment, shared booking-agent emails, typosquatting). The admin-mediated path provides the same UX benefit (no re-onboarding) with a human trust anchor.

---

## 11. Invitation System

### 11.1 Invitation Generation

- Trigger: Admin approves FoundingApplication
- Generate cryptographically secure random token (32 bytes)
- Encode as URL-safe base64
- Set expiry: 7 days
- Create InvitationToken record
- Send invitation email

### 11.2 Token Validation

- Hash the raw token from the URL (SHA-256), then look up the digest: `findUnique({ where: { token: digest } })`
- Record exists in database
- Status is ACTIVE
- Not expired
- Not already used
- Email matches (if user authenticated)

### 11.3 Security Considerations

- HTTPS required
- Token in URL (query parameter) - acceptable for one-time use
- 7-day expiry
- Single-use
- RLS policies on InvitationToken table
- Rate limit validation attempts

---

## 12. Email Architecture

### 12.1 Email Types

1. Application Received
2. Email Verification
3. Application Approved (Invitation)
4. Application Rejected
5. Invitation Reminder (24h before expiry)
6. Invitation Expired
7. Profile Approved (Founding Welcome)
8. Progress Updates
9. Beta Access
10. Launch Announcement

### 12.2 Email Service Organization

```
src/lib/email/
├── sendEmail.ts
├── templates/
│   ├── founding/
│   │   ├── application-received.ts
│   │   ├── email-verification.ts
│   │   ├── invitation.ts
│   │   ├── rejection.ts
│   │   ├── invitation-reminder.ts
│   │   ├── invitation-expired.ts
│   │   ├── founding-welcome.ts
│   │   ├── progress-update.ts
│   │   ├── beta-access.ts
│   │   └── launch-announcement.ts
│   └── ...
└── types.ts
```

### 12.3 Email Template Design

Common elements: DJcovery branding, personalized greeting, clear CTA, footer.

Each template has specific content relevant to its trigger.

---

## 13. Admin Dashboard Design

### 13.1 Navigation

```
Admin Dashboard
└── Founding Program
    ├── Applications
    ├── Invitations
    └── Members
```

### 13.2 Applications Page

- Table view with filters (status, country, city, experience level, genres)
- Search by name, email, application number
- Row actions: View, Approve, Reject, Send Reminder, Regenerate Invitation, Withdraw
- Application detail view with all data, admin notes, status history
- Social-ownership verification checklist panel (see §19.15): admin confirms each item before approval is enabled; completing the checklist sets `socialVerifiedBy` and records the outcome in `adminNotes`

### 13.3 Invitations Page

- Table view with filters (status, date range)
- Search by email, token ID (numeric `id`) — never by token string (raw token is not persisted; see §19.8)
- Row actions: View, Revoke, Resend, Extend Expiry
- "Resend" revokes the existing token and mints a new one (single-use guarantee preserved; raw token cannot be recovered)

### 13.4 Members Page

- Table view with filters (status, country, reward status)
- Search by name, email, founding number
- Row actions: View Profile, Edit Rewards, Suspend, Revoke Status

### 13.5 Analytics Dashboard

Metrics: Total Applications, by Status, by Country/City/Genre, Conversion Funnel, Invitation Acceptance Rate, Onboarding Completion Rate, Time to Approval/Onboarding.

Charts: Applications over time, by country (map), by genre (bar chart), conversion funnel.

### 13.6 CSV Export

Export applications, invitations, members with relevant fields.

### 13.7 Bulk Actions

Bulk approve, reject, send reminder, withdraw (applications). Bulk revoke, resend, extend (invitations). Bulk suspend, revoke (members).

**Auditing (see §19.14):** Every bulk action writes one `AdminActionLog` row per affected record, and all rows from a single bulk request share a `batchId` (UUID generated per request). This makes a bulk operation reversible in a single query (`WHERE "batchId" = ?`) and preserves per-record `before` state for destructive operations (suspend/revoke/reject/withdraw). Bulk actions without per-row logging are explicitly disallowed — a bulk action that skips audit logging is a bug, not a shortcut.

---

## 14. DJ Onboarding Integration

### 14.1 Data Transfer

Prefilled from FoundingApplication: name, email, phone, country, city, experience years, genres, experience level, social links, bio.

Additional onboarding fields: stage name, avatar, cover image, detailed bio, DJ types, portfolio, fee information, availability calendar.

### 14.2 Onboarding Resume

- Progress tracked in User.onboardingComplete
- Partial data saved in DjProfile
- User can resume later
- System prefills with existing data

### 14.3 Completion

- User submits complete onboarding
- DjProfile status: PENDING_APPROVAL
- FoundingApplication status: COMPLETED
- FoundingMember record created
- Admin notification sent

### 14.4 Profile Approval

- Uses existing approval workflow
- When approved, FoundingMember.status = ACTIVE
- Founding number assigned
- Badge enabled
- Welcome email sent

---

## 15. Reward System Design

### 15.1 MVP Rewards

1. Founding Badge (permanent)
2. Founding Number (permanent)
3. Premium Months (3 months)
4. Priority Search Ranking (6 months)
5. Homepage Feature (1 month)

### 15.2 Implementation

**Badge:** Add isFoundingMember and foundingNumber to DjProfile

**Premium:** Extend the existing `DjPlan` enum from `FREE | PREMIUM` to `FREE | FOUNDING | PREMIUM`, and add a `premiumUntil` (DateTime?) field to `DjProfile`. `premiumUntil` is the **source of truth** for active-premium expiry; `plan` is the cached/enumerated state that the daily cron reconciles against `premiumUntil`. Expiry is NOT tracked via counters on `FoundingMember` (the previous `premiumMonthsGranted` / `premiumMonthsUsed` design was removed in v1.4 — see changelog).

**Three-tier perk model.** `FOUNDING` is the permanent baseline for founding DJs; `FREE` is the baseline for non-founding DJs. Both can be elevated to `PREMIUM` (complimentary founding reward or future paid subscription); both return to their own baseline on expiry. The downgrade target is determined by whether an active `FoundingMember` row exists, NOT by how the DJ reached `PREMIUM`:

| Perk               | FREE  | FOUNDING                                           | PREMIUM                |
| ------------------ | ----- | -------------------------------------------------- | ---------------------- |
| Founding badge     | —     | yes (permanent, via `FoundingMember.badgeVisible`) | yes                    |
| `priorityBoost`    | 1.0   | 1.5 (founding baseline)                            | 2.0                    |
| `homepageFeatured` | false | false (unless `homepageFeaturedUntil` still valid) | true                   |
| `premiumUntil`     | null  | null                                               | set (expiry timestamp) |

**Priority Ranking:** Add priorityBoost to DjProfile, add to search score calculation

**Homepage Feature:** Add homepageFeatured and homepageFeaturedUntil to DjProfile

### 15.3 Activation

**Trigger: One-shot admin "Activate launch" button** (NOT a cron job).

Reward activation is a one-time, high-stakes, human-witnessed event tied to launch day. A cron job firing it silently would be a launch-day incident waiting to happen. The admin clicks a button in `/admin/founding/members`, verifies the pre-flight summary (founding member count, emails queued), then confirms.

**On launch (SITE_MODE=public):**

- Set DjProfile.plan to PREMIUM
- Set DjProfile.premiumUntil to `now() + 3 months` (source of truth for expiry; the cron sweep in §15.4 downgrades based on this, not on counters)
- Set DjProfile.priorityBoost to 2.0
- Set DjProfile.homepageFeatured to true
- Set FoundingMember.launchedAt
- Send launch announcement email

**Implementation (idempotent + auditable):**

- Pure function `activateFoundingRewards()` in `src/lib/founding/` (or `src/lib/actions/founding/`) — runs the mutation in a single transaction, returns a summary (`{ activatedCount, members: [...] }`).
- Admin server action wraps the function, records `reviewedBy`, renders a confirmation screen.
- A "Deactivate" button provides the rollback path (sets rewards back, clears `launchedAt`).
- Idempotent: re-running on already-launched members is a no-op (guard on `launchedAt IS NULL`).

**Why a button, not cron:** Launch timing is a human decision, not a scheduled time. You want a human to verify pre-conditions (right count, right members, SITE_MODE already flipped) before rewards fire.

### 15.4 Expiry

**Trigger: Vercel Cron endpoint** (recurring, daily), plus a manual "Run now" admin button as a recovery path.

The project already has cron infrastructure: `vercel.json` declares `/api/cron/complete-events` (daily 06:00), and `src/app/api/cron/complete-events/route.ts` establishes the auth pattern (`Bearer ${CRON_SECRET}` header check, idempotent Prisma transaction). The expiry sweeps extend this existing pattern — no new mechanism is introduced.

**Sweep operations (all idempotent, safe to re-run):**

1. **Premium-expiry sweep** — `DjProfile` rows where `plan = PREMIUM AND premiumUntil < now()`. The downgrade target depends on whether an active `FoundingMember` row exists for the profile, so the sweep runs two idempotent updates:
   - **Founding members** (active `FoundingMember` exists): downgrade `plan` to `FOUNDING`, set `priorityBoost` to 1.5, set `homepageFeatured` based on whether `homepageFeaturedUntil` is still in the future.
   - **Non-founding DJs**: downgrade `plan` to `FREE`, set `priorityBoost` to 1.0, clear `homepageFeatured`.
   - Both branches clear `premiumUntil` (set to NULL) after downgrading, since premium is no longer active.
   - Send "your premium expired" email (founding members get a "back to founding benefits" framing; non-founding get a "back to free" framing).
   - Reference SQL (the predicate `premiumUntil < now()` is the single source of truth — no counter comparison):

     ```sql
     -- Founding members: PREMIUM → FOUNDING
     UPDATE "DjProfile"
     SET "plan" = 'FOUNDING',
         "priorityBoost" = 1.5,
         "homepageFeatured" = CASE WHEN "homepageFeaturedUntil" > now() THEN true ELSE false END,
         "premiumUntil" = NULL
     WHERE "plan" = 'PREMIUM'
       AND "premiumUntil" < now()
       AND "id" IN (SELECT fm."djProfileId" FROM "FoundingMember" fm WHERE fm."status" = 'ACTIVE');

     -- Non-founding: PREMIUM → FREE
     UPDATE "DjProfile"
     SET "plan" = 'FREE',
         "priorityBoost" = 1.0,
         "homepageFeatured" = false,
         "premiumUntil" = NULL
     WHERE "plan" = 'PREMIUM'
       AND "premiumUntil" < now()
       AND "id" NOT IN (SELECT fm."djProfileId" FROM "FoundingMember" fm WHERE fm."status" = 'ACTIVE');
     ```

   **Suspend / reinstate (admin action, not the cron):**
   - **Suspend:** compute `premiumDaysRemainingAtSuspend = EXTRACT(EPOCH FROM (premiumUntil - now())) / 86400` (clamped to ≥ 0) and store on `FoundingMember`; set `plan = FOUNDING`, clear `premiumUntil`. The cron then ignores this profile (no longer `PREMIUM`).
   - **Reinstate:** if `premiumDaysRemainingAtSuspend > 0`, set `premiumUntil = now() + interval '<remaining> days'` and `plan = PREMIUM`; else leave at `FOUNDING`. Clear `premiumDaysRemainingAtSuspend`.

2. **Invitation-expiry sweep** — `InvitationToken` rows where `status = ACTIVE AND expiresAt < now()`:
   - Flip `status` to EXPIRED
3. **Pre-expiry warning** (same sweep, 7-day lookahead) — `DjProfile` rows where `plan = PREMIUM AND premiumUntil < now() + interval '7 days' AND premiumUntil > now()` and no warning sent yet:
   - Send "your premium expires in 7 days" email
   - Record warning-sent flag to avoid duplicate emails

**Implementation (logic decoupled from trigger):**

- Pure functions `sweepExpiredPremium()`, `sweepExpiredInvitations()` in `src/lib/founding/` — each returns a summary (`{ processedCount, items: [...] }`).
- Thin cron routes `/api/cron/sweep-premium-expiry` and `/api/cron/sweep-invitation-expiry` wrap the functions, authenticated via `CRON_SECRET`.
- `vercel.json` schedules both daily (e.g., 03:00 and 04:00).
- Admin dashboard (`/admin/founding/members`) exposes "Run sweep now" buttons calling the same functions, so a missed cron run can be recovered without SSH/curl.

**Schedule:** Daily is sufficient — neither sweep has a sub-day SLA, and Vercel Cron on the Hobby tier enforces a daily minimum frequency.

**Why cron for these (not the activation button):** Both sweeps are time-based, deterministic, and involve no human judgment. They should fire whether or not anyone is watching.

### 15.5 Trigger Strategy Rationale

**Separate logic from trigger.** All three operations are implemented as idempotent functions in `src/lib/founding/`. The trigger (cron route or admin button) is a thin caller. This lets the trigger be swapped later without rewriting business logic — e.g., move from Vercel Cron to Upstash QStash or a scheduled Supabase function by changing only the caller.

**Match the trigger to the operation's nature:**

| Operation                       | Type                                   | Trigger                           |
| ------------------------------- | -------------------------------------- | --------------------------------- |
| Reward activation (§15.3)       | One-time, high-stakes, human-witnessed | Admin button                      |
| Premium-expiry sweep (§15.4)    | Recurring, deterministic               | Vercel Cron + manual admin button |
| Invitation-expiry sweep (§15.4) | Recurring, deterministic               | Vercel Cron + manual admin button |

**Not MVP-only.** These are permanent infrastructure:

- Reward activation runs once at launch, but the button/function stays for future cohorts (founding cohort 2, organizer program per §1.2, re-activating a suspended member's rewards after appeal).
- Premium-expiry sweep runs for as long as any founding member has unexpired premium months (≥12 months post-launch, longer with referral bonuses per §16).
- Invitation-expiry sweep stays useful as long as any invitation tokens are issued — `InvitationType.FUTURE_USE` (§8.2) signals the mechanism will be reused beyond founding DJs.

**Changeability:** Because logic is decoupled from trigger, post-MVP changes are caller-only:

- Vercel Cron → Upstash QStash / scheduled Supabase function → change the caller, not the function.
- Add a "dry-run" mode to the functions later (return what _would_ change without committing) for safer ops.

### 15.6 Design Invariant: Founding DJs Return to FOUNDING, Not FREE

**Invariant.** A founding DJ's baseline plan is `FOUNDING` for the lifetime of their `FoundingMember` record (status `ACTIVE`). Whenever any premium period — complimentary (founding reward, referral bonus) or future paid subscription — expires, the DJ is downgraded to `FOUNDING`, never to `FREE`. A non-founding DJ's baseline is `FREE` and they downgrade to `FREE`.

**Why this is a data-level guarantee, not derived logic.** The expiry sweep (§15.4) picks the downgrade target by joining `FoundingMember`, not by inspecting how the DJ reached `PREMIUM`. The sweep does not care whether the premium was the complimentary 3-month founding reward, a referral-bonus extension, or a future paid subscription — it only checks "does an active `FoundingMember` row exist for this profile?" If yes → `FOUNDING`; if no → `FREE`. No flag, no special case, no "was this premium complimentary or paid" branching.

**Future paid-premium scenario (the case this invariant exists to protect).** Post-launch monetization introduces paid `PREMIUM` subscriptions. A founding DJ pays for premium; when the paid period ends, the same cron sweep runs the same query and downgrades them to `FOUNDING` (badge + founding baseline priority intact), not `FREE`. The DJ never loses their founding identity by virtue of having tried a paid subscription. This holds even if the founding complimentary premium expired long before they paid — the `FoundingMember` row is what matters, not the history of `premiumUntil`.

**Future paid-premium mapping.** When paid subscriptions are introduced (post-MVP), a payment provider's billing-cycle end (e.g., Stripe `current_period_end`) maps directly to `DjProfile.premiumUntil`. No schema change is required for the founding-baseline guarantee to keep working — the sweep already treats `premiumUntil` as the single expiry source of truth.

**Referral bonus extension.** When the referral system is added (§16), a successful referral extends `premiumUntil` by one month: `premiumUntil = COALESCE(premiumUntil, now()) + interval '1 month'`. The `COALESCE` protects against the expired-premium trap (awarding a bonus from a stale `premiumUntil` in the past would otherwise grant a free month to a DJ whose premium already expired). If the DJ's premium already expired and they are at `FOUNDING`, the referral bonus re-activates them: set `plan = PREMIUM` and `premiumUntil = now() + interval '1 month'`.

**What this invariant does NOT promise.** It does not promise that a founding DJ keeps `PREMIUM` perks (priority boost 2.0, homepage feature) after expiry — only that they keep the `FOUNDING` baseline (badge, priority boost 1.5). `PREMIUM`-only perks expire with `premiumUntil`, exactly as for non-founding DJs.

---

## 16. Referral System Design

### 16.1 Recommendation: Postpone to Post-MVP

Rationale: Founding program MVP is already complex. Referral system adds significant complexity. Can be added after launch without architectural changes.

### 16.2 Future Design

**Referral Code:** Each founding member gets unique 8-character code

**Referral Model:**

```typescript
model Referral {
  id: Int @id @default(autoincrement())
  code: String
  referrerId: String
  refereeId: String?
  status: ReferralStatus
  rewardGranted: Boolean @default(false)
  createdAt DateTime @default(now())
  usedAt DateTime?
}
```

**Flow:** Founding member shares code → Applicant enters code → System validates → If applicant becomes founding member, reward granted (1 extra premium month, cap at 12 months total).

**Fraud Prevention:** One referral per applicant, cannot refer yourself, rate limiting.

### 16.3 MVP Schema Decision: Drop Dead Referral Fields

**Question:** `FoundingMember` originally included `referralCode` (String, unique) and `totalReferrals` (Int, default: 0), but referrals are deferred to post-MVP (§16.1, §25.2). Keep the columns nullable/zeroed for forward-compat, or drop them now and re-add them in the post-MVP migration?

**Decision: Drop both fields from the MVP schema.** Re-add them in the same post-MVP migration that introduces the `Referral` table (§16.2, §26.1).

**Rationale — forward-compatible nullable columns are justified only when at least one of these holds:**

1. The table is large enough that a later `ALTER` is risky (lock time, backfill cost).
2. The final field shape is stable and known.
3. An external contract (API, integration, printed material) depends on the field existing at launch.

This case meets **none** of them:

- **Tiny table:** `FoundingMember` is capped at 100 rows (§8.4). A post-MVP `ALTER TABLE ... ADD COLUMN` + backfill is sub-second — no scaling risk to hedge.
- **Unsettled shape:** §16.2 is an explicit future sketch, and it introduces a separate `Referral` table that owns the source-of-truth rows. `totalReferrals` is therefore a denormalized counter with no source rows, and `referralCode @unique` would lock in a code format (8-char per §16.2) before the format is decided (e.g., per-cohort codes `FDJ2-AB12` per §8.4/§26.3).
- **No MVP consumer:** No MVP code reads or writes either field — they are genuinely dead, not forward-compatible. This is speculative schema, the opposite of §1.3 ("Minimal Technical Debt — avoid temporary workarounds").
- **§16.1's own rationale cuts both ways:** "can be added after launch without architectural changes" means pre-installing the columns now buys almost nothing.

**Risks of keeping the fields (the "harmless zeroed column" traps):**

- `totalReferrals` becomes a denormalized counter that every post-MVP referral event must keep in sync with the `Referral` table — a drift risk (failed tx, manual DB fix) on a field that was zero for the entire MVP.
- `referralCode @unique` commits to a code scheme before it's finalized; a later format change (per-cohort, different length, moved to `Referral` table) requires migrating existing codes and any external material that printed them.

**One exception — `referralCode` may be retained if marketing needs it visible pre-launch:** If launch collateral or the public profile is expected to display referral codes before the referral _system_ is live, `referralCode` flips into category (3) above (has a present-day consumer) and should be kept — generated at member creation, displayed on profile. `totalReferrals` is still dropped regardless. **Default assumption: no such pre-launch display requirement → drop both.** Confirm with marketing before implementation.

**Post-MVP re-introduction (§26.1):** Add the `Referral` table (§16.2) **and** `referralCode` (+ optional cached `totalReferrals`) to `FoundingMember` in the **same migration**, with a backfill that generates codes for the ≤100 existing members. The columns arrive _alive_ — built by code that actually uses them — instead of pre-installed and waiting. Because no shape was committed at MVP, the post-MVP design can evolve freely (code format, per-cohort codes, counter vs. live aggregate) without undoing an earlier commitment.

**Changeability:** The deferral is fully reversible and cheap. The only effectively irreversible decision in this area is the _numbering_ scheme (`APP-`/`FDJ-`, §8.4), which is why that one is locked at MVP — unlike referral fields, which are not.

---

## 17. Analytics Design

### 17.1 Essential MVP Metrics

1. Total Applications
2. Applications by Status
3. Applications by Country/City/Genre
4. Conversion Funnel (Application → Email Verified → Approved → Onboarding Complete)
5. Invitation Acceptance Rate
6. Onboarding Completion Rate
7. Time to Approval (average)
8. Time to Onboarding (average)

### 17.2 Important Post-MVP Metrics

9. Top Traffic Sources
10. Referral Performance
11. Application Quality
12. Retention Rate
13. Reward Usage

### 17.3 Implementation

- Use existing Prisma queries
- Add analytics endpoints to API
- Admin dashboard analytics page
- Charts using existing charting library
- Export to CSV
- Track UTM parameters on founding landing page

---

## 18. SEO Strategy

### 18.1 Founding Mode (Production)

**Index:**

- /founding-djs (landing page)
- /about
- /contact
- /faq
- /terms
- /privacy

**Noindex:**

- Everything else (application form, confirmation pages, admin, api)

**Implementation:**

- Middleware adds X-Robots-Tag based on route
- Founding landing page: normal indexing
- Application form: noindex (temporary content)
- Admin: noindex (always)

### 18.2 Public Mode (Production)

**Index:**

- All public pages (djs, organizers, events, gigs, community)
- Founding landing page (redirects to /djs or shows "closed")

**Noindex:**

- Admin, API, protected routes

### 18.3 Staging

**Noindex:**

- Everything (SITE_MODE=founding or public)
- X-Robots-Tag: noindex, nofollow on all routes

### 18.4 Metadata

**Founding Landing Page:**

- Title: "DJcovery Founding DJs Program - Join the Community"
- Description: "Apply to become a founding DJ on DJcovery. Exclusive rewards, early access, and permanent recognition."
- Canonical: https://djcovery.com/founding-djs
- Open Graph: Program branding, benefits overview

**Application Form:**

- Title: "Apply - DJcovery Founding Program"
- Noindex: true
- No canonical (temporary)

### 18.5 Sitemap

**Founding Mode:**

- Include: /, /about, /contact, /faq, /terms, /privacy, /founding-djs
- Exclude: Everything else

**Public Mode:**

- Include: All public pages
- Exclude: Admin, API, protected routes

### 18.6 Robots.txt

**Founding Mode:**

```
User-agent: *
Allow: /$
Allow: /about
Allow: /contact
Allow: /faq
Allow: /terms
Allow: /privacy
Allow: /founding-djs
Disallow: /admin
Disallow: /api
Disallow: /sign-in
Disallow: /sign-up
Disallow: /dashboard
Disallow: /djs
Disallow: /organizers
Disallow: /events
Disallow: /gigs
Disallow: /community
```

**Public Mode:**

```
User-agent: *
Disallow: /admin
Disallow: /api
Disallow: /sign-in
Disallow: /sign-up
Disallow: /dashboard
```

### 18.7 Structured Data

**Founding Landing Page:**

- Organization schema (DJcovery)
- Program schema (Founding DJs Program)
- FAQ schema (if FAQ section included)

### 18.8 Social Metadata

**Founding Landing Page:**

- Open Graph: Program image, title, description
- Twitter Card: Summary card with large image

### 18.9 Future Launch Strategy

**Transition:**

- Update sitemap to include all public pages
- Update robots.txt to allow discovery routes
- Remove noindex from public pages
- Add structured data for DJ profiles, events, gigs
- Submit new sitemap to Google Search Console

---

## 19. Security Design

### 19.1 Authentication

- Supabase Auth (email, Google, magic links)
- Session management via Supabase SSR
- Session refresh on every request
- Secure cookie handling (httpOnly, secure, sameSite)

### 19.2 Authorization

- Role-based access control (ADMIN, DJ, ORGANIZER, FAN)
- Server actions verify roles before operations
- Middleware protects routes based on role
- RLS policies on database tables

### 19.3 Server Actions

- All mutations via server actions (no client-side direct DB access)
- Input validation via Zod schemas
- Error handling with user-friendly messages
- Audit logging for sensitive operations

### 19.4 API Routes

- Protected by authentication
- Rate limiting (per user, per endpoint)
- Input validation
- CORS configuration
- API key authentication for external integrations (future)

### 19.5 CSRF Considerations

- Next.js handles CSRF for server actions automatically
- Additional CSRF tokens for API routes if needed
- SameSite cookie policy

### 19.6 Rate Limiting

- Application submission: 1 per email per 30 days
- Email verification: 5 attempts per email per hour
- Invitation validation: 10 attempts per IP per hour
- Admin actions: No rate limiting (trusted users)

### 19.7 Invitation Security

- Cryptographically secure random tokens (32 bytes)
- 7-day expiry
- Single-use
- HTTPS required
- Token validation in server action (not client)
- Database storage with RLS

### 19.8 Token Storage

- Tokens are bearer credentials and must be stored only as a SHA-256 digest (hash at rest); raw token is shown only once at creation (see §30.3, Trade-off 1)
- Hash-then-lookup on validation: `sha256(rawToken) → findUnique({ where: { token: digest } })` — never query by the raw token
- Use a fast hash (SHA-256), not a password hash (Argon2/bcrypt): the 32-byte (256-bit) token makes brute force infeasible, and slow hashes add unnecessary latency to every validation
- Optional pepper: HMAC-SHA-256 with a server-side key (env var / secrets manager) so a DB-only leak cannot produce usable tokens
- Invitation tokens stored in `InvitationToken.token` (digest)
- Email verification tokens stored in `FoundingApplication.emailVerificationToken` (digest)
- Raw token never logged, never re-displayed, never stored in a session
- Admin "Resend" = revoke + regenerate (raw token cannot be recovered)
- Expiry dates enforced

### 19.9 Input Validation

- All inputs validated via Zod schemas
- SQL injection prevention via Prisma ORM
- XSS prevention via React escaping
- File upload validation (type, size)

### 19.10 Role Checks

- Server actions verify user role
- Middleware verifies role for route access
- RLS policies enforce role at database level
- Admin actions require ADMIN role

### 19.11 Supabase RLS

**FoundingApplication:**

- Admin: full access
- Applicant: read own only (after account creation)
- Public: no access

**InvitationToken:**

- Admin: full access
- Public: no access

**FoundingMember:**

- Admin: full access
- Member: read own only
- Public: read founding number, badge status only

### 19.12 Email Verification

- Uses a **custom email-ownership token** on `FoundingApplication`, NOT a Supabase auth flow (see §3.2 Decision 6). The applicant has no Supabase account at verify time
- Required for application to proceed to admin review (status must be EMAIL_VERIFIED before UNDER_REVIEW)
- Required for account linking (email mismatch on invitation acceptance — same custom-token mechanism, independent of Supabase's built-in email confirmation)
- 24-hour expiry
- Single-use tokens
- Token invalidation after use
- Token stored as SHA-256 digest; raw token never persisted (see §19.8)
- Admin "Resend" = revoke + regenerate (raw token cannot be recovered)
- Rate limited: 5 attempts per email per hour (see §19.6)

### 19.13 Admin Protection

- ADMIN role required for admin routes
- Middleware enforces admin role
- Server actions verify admin role
- Audit logging for all admin actions

### 19.14 Admin Action Auditing (MVP)

**Status:** Promoted from "Future" to MVP in v1.5. Rationale: §13.7 ships bulk actions in MVP, §19.3/§19.4/§29 list audit logging as a security control and a compromise mitigation, and bulk actions without a persistent append-only record are the riskiest untracked mutations in the system. The table is minimal and the per-action logging call is one line — the cheapest insurance in the TDD. Only the _viewer UI_ is deferred (see §19.14.4).

**AdminActionLog Model:**

```typescript
model AdminActionLog {
  id          Int      @id @default(autoincrement())
  adminId     String
  action      String   // e.g. "application.approve", "invitation.revoke", "member.suspend"
  targetType  String   // e.g. "FoundingApplication", "InvitationToken", "FoundingMember"
  targetId    String?
  batchId     String?  // shared across all rows produced by one bulk action; null for single-record actions
  status      String   // "success" | "failure" — failed attempts are forensically more interesting than successes
  before      Json?    // snapshot of target state prior to destructive actions (suspend/revoke/reject); null for creates
  after       Json?    // snapshot of target state post-action (optional; omit if `before` + `action` fully describe the change)
  metadata    Json?    // free-form context (reason, checklist result, request params) — IDs + summary only, no full PII payloads
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([adminId, createdAt])
  @@index([targetType, targetId, createdAt])
  @@index([batchId])
}
```

**Actions to Log (every admin server action writes exactly one row per affected record):**

- Application approval / rejection / withdrawal
- Invitation generation / revocation / resend / extend
- Founding member suspension / reinstatement / revocation
- Reward modifications (premium grants, expiry changes)
- Bulk variants of any of the above — one row per affected record, all sharing a `batchId`

**19.14.1 Logging Discipline**

- **Log intent + outcome, not just outcome.** Write the row at action completion with `status` reflecting success/failure. A failed bulk revoke (e.g. token already consumed) is more forensically interesting than a successful one.
- **Append-only.** No `UPDATE` or `DELETE` on `AdminActionLog`, ever. Enforced via RLS (§19.14.3) so even a compromised admin cannot wipe their own trail.
- **Capture before-state for destructive actions** (suspend, revoke, reject, withdraw) in `before`, so the record can be reconstructed. Creates (invitation generation) leave `before` null.
- **Batch identity for bulk actions.** A 30-row bulk approve produces 30 log rows sharing one `batchId` (a UUID generated per bulk request), enabling single-query reversal of the whole batch.
- **No full PII in payloads.** Log IDs and a short summary in `metadata`; never the full application payload. The target record itself remains the source of truth for current state.

**19.14.2 Logging Helper**

A single helper centralizes row construction so server actions don't repeat boilerplate:

```typescript
// src/lib/audit/log-admin-action.ts
async function logAdminAction(params: {
  adminId: string;
  action: string;
  targetType: string;
  targetId?: string;
  batchId?: string;
  status: "success" | "failure";
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  request: Request; // for ipAddress / userAgent extraction
}): Promise<void>;
```

- Called from every admin server action in `src/lib/actions/` and every admin API route.
- Failures to write the log row must **not** silently succeed the action — for destructive actions, a log-write failure should fail the action (fail-closed). For non-destructive reads/exports, log-write failure is best-effort.
- `batchId` is generated once per bulk request and passed into each per-record action invocation.

**19.14.3 Append-Only RLS**

```sql
-- Admins can INSERT and SELECT; no UPDATE, no DELETE.
CREATE POLICY admin_action_log_insert ON "AdminActionLog"
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN')
  );
CREATE POLICY admin_action_log_select ON "AdminActionLog"
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN')
  );
-- No UPDATE / DELETE policy is created → those operations are denied by default RLS.
```

Add to `prisma/rls-policies.sql` alongside the existing policies.

**19.14.4 Deferred: Audit-Log Viewer UI**

The admin dashboard does **not** ship a filterable audit-log viewer in MVP. Until a second admin, a contractor, or a compliance/investor review justifies the UI cost, query the table via Prisma Studio or `psql`. The table and the logging calls are in MVP; only the viewer is deferred. This is forward-compatible — adding a viewer later requires no schema change.

### 19.15 Social-Ownership Verification

**Problem Statement:**

Email verification (§19.12) proves the applicant controls the email address they typed. It does **not** prove they own the social profiles (Instagram, TikTok, SoundCloud, etc.) they pasted into the application. An impersonator could apply using a real DJ's Instagram URL and a fresh email they just created. This section defines how social-account ownership is verified.

**Why This Is a Separate Concern from Email Verification:**

Social platforms deliberately do not expose "who owns this URL" to the public. There is no API to query "does user X own instagram.com/thereal.famousdj." The email-verification trick (send a token, click a link) does not work for social profiles because the applicant cannot place a token on someone else's profile — only the real owner can edit it. This asymmetry is what makes any workable approach possible, but it also means automated verification requires OAuth (heavy) or challenge-based flows (friction for the DJ).

**MVP Approach: Admin Manual Review with Structured Checklist**

For the founding program (curated ≤100 cohort, human admin), social-ownership verification is performed by admin during the `UNDER_REVIEW` phase. The admin review screen displays a structured checklist that must be completed before the "Approve" button is enabled (see §9.2, §13.2):

1. Claimed name matches the social profile's display name / bio
2. Claimed city/country appears in the profile's bio or content
3. Claimed genres/portfolio align with the profile's posts
4. Account age and follower count are plausible for the claimed experience level
5. Portfolio links (SoundCloud/Beatport/RA) are consistent with the IG identity
6. No obvious fan-account signals (bio says "fan page", "tribute", reposts only, no original mixes)

Completing the checklist sets `socialVerifiedBy` (admin user ID) on `FoundingApplication` and records the outcome in `adminNotes`.

**What This Catches and What It Doesn't:**

- **Catches:** Lazy impersonators (mismatched name, fan account, no portfolio, no original content)
- **Does not catch:** A careful impersonator who builds a convincing duplicate profile
- **Backstop:** The impersonation clause + revocation lever + public reporting channel (see below)

**Impersonation Clause (Application Terms):**

Required checkbox at application submission:

> "I confirm I own or control the social accounts I've listed. Misrepresentation results in immediate application rejection and, if already approved, revocation of founding membership."

This gives the legal lever to revoke (`FoundingMember.status = REVOKED`, §9.2) if a real DJ later reports impersonation. Cheap, important, no code beyond a required checkbox in the form.

**Public Reporting Channel (Post-Launch):**

A visible "Report this profile" link on every public DJ profile (post-launch). This is the safety net — the real DJ is the ultimate verifier, and this gives them a one-tap way to flag a fake. Cheap to build, high value.

**Follow Ask — Engagement Only, NOT Verification:**

After application submission, the confirmation page shows:

> "Follow @djscovery on Instagram and TikTok to stay in the loop on your application and get launch updates."

This is framed as **engagement/news**, never as verification. A follow is a one-way, public, free action — anyone can follow, and it proves nothing about account ownership. Calling it "verification" would create false confidence and undermine the founding program's trust value proposition (§1.1). The follow ask is a UI nudge only; it is not tracked in the database and does not gate approval.

**Why Not Automated Verification for MVP:**

| Approach                     | Proof Strength                    | DJ Friction                          | Eng Cost                       | MVP Fit                               |
| ---------------------------- | --------------------------------- | ------------------------------------ | ------------------------------ | ------------------------------------- |
| Admin manual review (chosen) | Medium (stops lazy impersonators) | None                                 | None                           | Yes                                   |
| Bio/code challenge           | Strong                            | High (modifies public bio)           | Low                            | No — DJs resist modifying their brand |
| Story-tag challenge          | Strong                            | Medium (ephemeral, but still an ask) | Low                            | No — unnecessary for ≤100 cohort      |
| DM challenge                 | Strong                            | Low                                  | Medium (Meta anti-spam limits) | No — operational overhead             |
| OAuth "Connect Instagram"    | Strongest                         | Lowest (one click)                   | High (Meta app review, weeks)  | No — post-MVP                         |

The founding program is explicitly a curated, low-volume, human-gated cohort (§1.1, §8.4 cap of 100). Spending engineering time on Meta app review and OAuth for ≤100 applications is a misallocation. Admin manual review + impersonation clause + revocation + public reporting gives ~95% of the safety at ~5% of the cost.

**Post-MVP (When Volume Outgrows Admin-Per-Application):**

Revisit in this order, only when the founding program closes and public signups begin:

1. **OAuth "Connect Instagram"** — one click for the DJ, cryptographic proof, automated. Worth the Meta app review cost once volume justifies it
2. **Story-tag fallback** for platforms without OAuth (SoundCloud, Beatport, TikTok, RA)
3. **`socialLinksVerified` schema** — at this point, add per-link verification state, because verification is now automated and per-link, not a single admin decision. The current `socialVerifiedBy` field is forward-compatible: it becomes the "who triggered the first verification" audit field, and the new per-link fields track ongoing automated state

**Schema for MVP:**

- `FoundingApplication.socialVerifiedBy` (String?) — admin user ID who completed the checklist (see §8.1)
- `FoundingApplication.adminNotes` (String?) — checklist outcome recorded here (existing field, no new field needed)
- No `socialLinksVerified` per-link state for MVP — not needed since verification is a single admin decision, not automated per-link

---

## 20. Folder Organization

### 20.1 New Folders

```
src/
├── app/
│   ├── (founding)/
│   │   └── founding-djs/
│   │       ├── page.tsx
│   │       ├── apply/
│   │       ├── success/
│   │       ├── verify-email/
│   │       └── invitation/[token]/
│   │
│   └── (admin)/
│       └── admin/
│           └── founding/
│               ├── applications/
│               ├── invitations/
│               └── members/
│
├── components/
│   ├── founding/
│   │   ├── ApplicationForm.tsx
│   │   ├── ApplicationSuccess.tsx
│   │   ├── EmailVerification.tsx
│   │   ├── InvitationLanding.tsx
│   │   └── FoundingBadge.tsx
│   │
│   └── admin/
│       └── founding/
│           ├── ApplicationList.tsx
│           ├── ApplicationDetail.tsx
│           ├── InvitationList.tsx
│           ├── MemberList.tsx
│           └── AnalyticsDashboard.tsx
│
├── lib/
│   ├── actions/
│   │   └── founding/
│   │       ├── applications.ts
│   │       ├── invitations.ts
│   │       ├── members.ts
│   │       └── analytics.ts
│   │
│   ├── schemas/
│   │   └── founding/
│   │       ├── application.ts
│   │       └── invitation.ts
│   │
│   ├── services/
│   │   └── founding/
│   │       ├── application-service.ts
│   │       ├── invitation-service.ts
│   │       └── member-service.ts
│   │
│   └── email/
│       └── templates/
│           └── founding/
│               ├── application-received.ts
│               ├── email-verification.ts
│               ├── invitation.ts
│               ├── rejection.ts
│               ├── invitation-reminder.ts
│               ├── invitation-expired.ts
│               ├── founding-welcome.ts
│               ├── progress-update.ts
│               ├── beta-access.ts
│               └── launch-announcement.ts
│
└── types/
    └── founding.ts
```

### 20.2 Organization Principles

- Group by feature (founding)
- Separate concerns (actions, schemas, services, components)
- Follow existing patterns (auth, admin)
- Keep components reusable
- Server actions in lib/actions
- Validation schemas in lib/schemas
- Business logic in lib/services

---

## 21. Reusable Components

### 21.1 Existing Components to Reuse

**Forms:**

- BecomeDjForm (adapt for founding onboarding)
- BecomeFanForm (country/city dropdowns)
- Existing form validation patterns

**UI Components:**

- shadcn/ui components (Button, Input, Select, Textarea, Card, Dialog)
- Existing layout components
- Navigation components
- Loading states

**Admin Components:**

- Existing admin table components
- Existing admin filters
- Existing admin detail views

### 21.2 New Components to Create

**Founding-Specific:**

- ApplicationForm (multi-step form)
- ApplicationSuccess (confirmation page)
- EmailVerification (verification UI)
- InvitationLanding (invitation acceptance)
- FoundingBadge (profile badge)

**Admin-Specific:**

- ApplicationList (table with filters)
- ApplicationDetail (full application view)
- InvitationList (invitation management)
- MemberList (founding member management)
- AnalyticsDashboard (charts and metrics)

### 21.3 Component Reusability

- Design ApplicationForm to be reusable for future programs
- Design FoundingBadge to be reusable for other badges
- Design analytics components to be reusable for other dashboards
- Use existing form patterns to avoid duplication

---

## 22. Deployment Strategy

### 22.1 Founding Mode Deployment

**Configuration:**

```env
SITE_MODE=founding
NEXT_PUBLIC_APP_ENV=production
```

**Process:**

1. Set SITE_MODE=founding in environment
2. Deploy to production
3. Verify middleware blocking non-founding routes
4. Test founding application flow
5. Test admin access

**Rollback:**

- Set SITE_MODE=public (or maintenance)
- Deploy
- Instant rollback

### 22.2 Private Beta Deployment

**Configuration:**

```env
SITE_MODE=founding
NEXT_PUBLIC_APP_ENV=production
```

**Process:**

- Same as founding mode
- Enable beta access for founding members: FoundingMember records with status=ACTIVE are automatically granted route access via the middleware allowlist (see §7.3). No additional flag or configuration required.
- Send beta access emails (email type 9 — Beta Access)
- Monitor beta usage

**How Beta Access Works:**

1. Founding members sign in normally
2. At sign-in, middleware checks FoundingMember status (cached as JWT claim or Redis entry)
3. Active founding members bypass the founding-mode route blocks for dashboards and discovery routes
4. Public visitors and non-founding users still see only the founding landing page and application flow
5. Normal registration remains disabled; only invitation-based signup works

### 22.3 Public Launch Deployment

**Configuration:**

```env
SITE_MODE=public
NEXT_PUBLIC_APP_ENV=production
```

**Process:**

1. Set SITE_MODE=public in environment
2. Deploy to production
3. Verify all routes accessible
4. Activate founding rewards via admin "Activate launch" button in `/admin/founding/members` (see §15.3 for rationale — one-shot, human-witnessed, NOT a cron job)
5. Send launch announcement emails
6. Update sitemap
7. Submit to Google Search Console

**Rollback:**

- Set SITE_MODE=founding
- Deploy
- Deactivate founding rewards (if needed)

### 22.4 Configuration Changes

**Environment Variables:**

- SITE_MODE: founding | public | maintenance
- No other configuration changes required

**Database:**

- No schema changes required for mode switching
- Data migrations not required

**Code:**

- No code changes required for mode switching
- Middleware reads SITE_MODE from environment

### 22.5 Rollback Strategy

**Instant Rollback:**

- Change SITE_MODE environment variable
- Deploy (no code changes)
- Effect: immediate (next request)

**Data Rollback:**

- Database backups before major changes
- Point-in-time recovery if needed
- Revert migrations if schema changes

---

## 23. Migration Strategy

### 23.1 Founding Mode → Private Beta

**Process:**

1. All founding applications processed
2. All invitations sent or expired
3. All invited DJs completed onboarding
4. Enable beta access for founding members — no code change or config change needed; FoundingMember records with status=ACTIVE automatically trigger the middleware allowlist (see §7.3)
5. Send beta access emails (email type 9 — Beta Access)
6. Monitor beta usage

**Data Changes:**

- None required
- FoundingMember records already created during onboarding completion (§14.3)

**Configuration:**

- SITE_MODE remains founding
- Beta access controlled via FoundingMember status (cached at sign-in as JWT claim or Redis entry)

### 23.2 Private Beta → Public Launch

**Process:**

1. Set SITE_MODE=public
2. Deploy
3. Activate founding rewards
4. Send launch announcement emails
5. Update sitemap
6. Submit to search engines

**Data Changes:**

- Update DjProfile.plan to PREMIUM for founding members
- Set DjProfile.premiumUntil to `now() + 3 months` for founding members (source of truth for expiry — see §15.2, §15.4)
- Update DjProfile.priorityBoost
- Update DjProfile.homepageFeatured
- Set FoundingMember.launchedAt

**Configuration:**

- SITE_MODE=public

### 23.3 Public Launch → Normal Registration

**Process:**

1. Founding program redirects to /djs or shows "closed"
2. Normal registration enabled
3. New users cannot apply to founding program
4. Existing founding members retain status

**Data Changes:**

- None required
- FoundingMember records remain

**Configuration:**

- SITE_MODE=public (unchanged)

### 23.4 Migration Without Breaking Users

**Principles:**

- Never delete data
- Never break existing user flows
- Additive changes only
- Backward compatibility

**Specific Migrations:**

- FoundingApplication: Retain permanently
- InvitationToken: Archive after 1 year
- FoundingMember: Retain permanently
- DjProfile: Add founding fields (non-breaking)

**Testing:**

- Test with real founding member accounts
- Test with new user accounts
- Test admin workflows
- Test email flows

---

## 24. Future Expansion

### 24.1 Organizers

**Founding Program for Organizers:**

- New FoundingApplication for organizers
- New InvitationType: ORGANIZER_FOUNDING
- New FoundingMember for organizers
- Similar workflow to DJs

**Implementation:**

- Reuse existing models (add type field)
- Reuse existing components (adapt for organizer fields)
- Reuse existing admin workflows

### 24.2 Fans

**Founding Program for Fans:**

- Simplified application (no portfolio)
- Early access to community features
- Different rewards (exclusive content, early event access)

**Implementation:**

- New FoundingApplication type
- Simplified onboarding
- Different reward structure

### 24.3 Venues

**Venue Partner Program:**

- Similar to founding program
- Focus on venue partnerships
- Different onboarding (venue details, equipment)

### 24.4 Agencies

**Agency Partner Program:**

- Multi-DJ applications
- Agency onboarding
- Different reward structure

### 24.5 Premium

**Premium Tiers:**

- Founding members get 3 months free
- Upgrade to paid premium after expiry
- Tiered pricing (Basic, Pro, Enterprise)

**Implementation:**

- Extend DjProfile.plan enum
- Add subscription management
- Add payment integration (Stripe)

### 24.6 Subscriptions

**Recurring Billing:**

- Monthly/yearly subscriptions
- Automatic renewal
- Payment failure handling

**Implementation:**

- Stripe integration
- Subscription model
- Webhook handling

### 24.7 Reputation System

**Enhanced Reputation:**

- Build on existing ReputationScore model
- Add founding member boost
- Add activity-based reputation
- Add community recognition

### 24.8 Messaging

**Direct Messaging:**

- Founding members get early access
- Messaging between DJs and organizers
- Group messaging for events

**Implementation:**

- New Message model
- Real-time via Supabase Realtime
- Message history

### 24.9 Notifications

**Enhanced Notifications:**

- Build on existing Notification model
- Add founding-specific notifications
- Add notification preferences
- Add push notifications (future)

### 24.10 AI Features

**AI-Powered Matching:**

- Match DJs with gigs based on profile
- Recommend events to fans
- Smart search

**Implementation:**

- Vector embeddings for profiles
- Similarity search
- Recommendation engine

**Architectural Considerations:**

- Add AI service layer
- Add vector database (pgvector)
- Add ML pipeline
- Keep AI optional (core features work without AI)

---

## 25. MVP Scope

### 25.1 In Scope (MVP)

**Core Features:**

- Founding landing page
- Application form (multi-step)
- Email verification
- Admin application management
- Admin approval/rejection
- Invitation generation
- Invitation email
- Invitation acceptance
- Email mismatch detection + sign-out/retry guidance (Option A; full secondary-email linking deferred to post-MVP — see section 10.2)
- DJ onboarding (prefilled)
- Profile approval (existing workflow)
- Founding badge
- Founding number
- Premium months (3)
- Priority ranking (6 months)
- Homepage feature (1 month)
- Admin analytics dashboard
- CSV export
- Site mode switching
- SEO for founding landing page
- Security (authentication, authorization, RLS)

**Email Templates:**

- Application received
- Email verification
- Invitation
- Rejection
- Invitation reminder
- Invitation expired
- Founding welcome

**Admin Features:**

- Application list, filters, search
- Application detail view
- Approve/reject workflow
- Invitation management
- Member management
- Basic analytics

### 25.2 Out of Scope (Post-MVP)

**Referral System**

- Postpone to post-launch
- Can be added without architectural changes

**Advanced Analytics**

- Basic analytics in MVP
- Advanced analytics (funnel analysis, cohort analysis) post-MVP

**Gamification**

- Leaderboards, badges beyond founding badge
- Post-MVP

**Community Features**

- Founding member community
- Forums, discussions
- Post-MVP

**Mobile App**

- Web-only in MVP
- Mobile app post-MVP

**AI Features**

- No AI in MVP
- Post-MVP

---

## 26. Post-MVP Scope

### 26.1 Phase 2 (Post-Launch)

**Referral System (re-introduces the fields dropped from MVP per §16.3):**

- `Referral` table (§16.2)
- Add `referralCode` (String, unique) and `totalReferrals` (Int, default: 0) to `FoundingMember` in the same migration
- Backfill: generate codes for the ≤100 existing founding members
- Referral code generation
- Referral tracking
- Reward calculation
- Referral dashboard

**Enhanced Analytics:**

- Funnel analysis
- Cohort analysis
- Traffic source tracking
- Referral performance

**Community Features:**

- Founding member community
- Forums, discussions
- Member spotlights

**Gamification:**

- Leaderboards
- Achievement badges
- Progress tracking

### 26.2 Phase 3

**Organizer Founding Program:**

- Similar workflow to DJs
- Organizer-specific rewards
- Organizer onboarding

**Fan Founding Program:**

- Simplified application
- Fan-specific rewards
- Early access to community

**Advanced Rewards:**

- Tiered rewards
- Customizable rewards
- Reward marketplace

### 26.3 Phase 4

**AI Features:**

- Profile matching
- Gig recommendations
- Smart search

**Mobile App:**

- iOS and Android apps
- Push notifications
- Offline support

**Premium Tiers:**

- Multiple premium tiers
- Subscription management
- Payment integration

---

## 27. Development Phases

### 27.1 Phase 1: Foundation (Week 1-2)

**Tasks:**

- Database schema design
- Prisma schema implementation
- Database migration
- Site mode configuration
- Middleware updates
- Route structure setup

**Deliverables:**

- Database schema
- Working site mode switching
- Route structure

### 27.2 Phase 2: Application Flow (Week 3-4)

**Tasks:**

- Application form component
- Application server actions
- Email verification flow (custom token on FoundingApplication, NOT Supabase auth — see §3.2 Decision 6, §19.12)
- Application confirmation page
- Engagement follow ask on confirmation page ("Follow @djscovery...") — engagement only, not verification (see §19.15)
- Impersonation clause as required checkbox in application form (see §19.15)
- Email templates (application received, email verification)

**Deliverables:**

- Working application form
- Email verification (custom token)
- Confirmation pages with engagement nudge
- Impersonation clause acknowledgment

### 27.3 Phase 3: Admin Application Management (Week 5-6)

**Tasks:**

- Admin application list
- Application detail view
- Approve/reject workflow
- Social-ownership verification checklist panel in application detail view (see §19.15) — approval blocked until checklist complete and `socialVerifiedBy` set
- Admin notes
- Email templates (invitation, rejection)
- Analytics dashboard (basic)

**Deliverables:**

- Admin application management
- Social-ownership verification checklist
- Invitation generation
- Basic analytics

### 27.4 Phase 4: Invitation System (Week 7)

**Tasks:**

- Invitation token generation
- Invitation validation
- Invitation landing page
- Email mismatch detection + sign-out/retry guidance (Option A)
- Email templates (invitation reminder, invitation expired)

**Deliverables:**

- Working invitation system
- Email mismatch detection and guidance (Option A; full secondary-email linking deferred to post-MVP)

### 27.5 Phase 5: Onboarding Integration (Week 8)

**Tasks:**

- Onboarding prefill from application
- Onboarding completion flow
- FoundingMember creation
- Profile approval integration
- Email template (founding welcome)

**Deliverables:**

- Onboarding integration
- Founding member creation

### 27.6 Phase 6: Rewards System (Week 9)

**Tasks:**

- Founding badge implementation
- Founding number assignment
- Premium months tracking
- Priority ranking implementation
- Homepage feature implementation
- Reward activation on launch

**Deliverables:**

- Working rewards system
- Reward activation

### 27.7 Phase 7: Admin Member Management (Week 10)

**Tasks:**

- Admin member list
- Member detail view
- Reward editing
- Suspension/revocation
- CSV export

**Deliverables:**

- Admin member management
- CSV export

### 27.8 Phase 8: SEO & Polish (Week 11)

**Tasks:**

- SEO metadata
- Sitemap generation
- Robots.txt
- Structured data
- Email templates (progress update, beta access, launch announcement)
- UI polish
- Testing

**Deliverables:**

- SEO optimization
- Polished UI
- Complete email suite

### 27.9 Phase 9: Testing & Launch (Week 12)

**Tasks:**

- End-to-end testing
- Security testing
- Performance testing
- Bug fixes
- Documentation
- Launch preparation

**Deliverables:**

- Tested application
- Documentation
- Launch readiness

---

## 28. Estimated Timeline

**Total Duration:** 12 weeks (3 months)

**Breakdown:**

- Phase 1 (Foundation): 2 weeks
- Phase 2 (Application Flow): 2 weeks
- Phase 3 (Admin Application Management): 2 weeks
- Phase 4 (Invitation System): 1 week
- Phase 5 (Onboarding Integration): 1 week
- Phase 6 (Rewards System): 1 week
- Phase 7 (Admin Member Management): 1 week
- Phase 8 (SEO & Polish): 1 week
- Phase 9 (Testing & Launch): 1 week

**Buffer:** 2 weeks included in timeline for unexpected issues

**Milestone Dates:**

- Week 2: Foundation complete
- Week 4: Application flow complete
- Week 6: Admin application management complete
- Week 7: Invitation system complete
- Week 8: Onboarding integration complete
- Week 9: Rewards system complete
- Week 10: Admin member management complete
- Week 11: SEO & polish complete
- Week 12: Launch ready

---

## 29. Risks & Mitigations

### 29.1 Technical Risks

**Risk: Database schema changes break existing functionality**

- **Mitigation:** Thorough testing in development/staging
- **Mitigation:** Database backups before migrations
- **Mitigation:** Rollback plan for each migration

**Risk: Middleware complexity leads to bugs**

- **Mitigation:** Keep middleware simple (mode checks only)
- **Mitigation:** Comprehensive testing of all routes
- **Mitigation:** Log middleware decisions for debugging

**Risk: Invitation token security vulnerability**

- **Mitigation:** Use cryptographically secure random generator
- **Mitigation:** Short expiry (7 days)
- **Mitigation:** Single-use tokens
- **Mitigation:** Security audit before launch

**Risk: Email delivery failures**

- **Mitigation:** Use reliable email service (Resend)
- **Mitigation:** Retry logic for failed sends
- **Mitigation:** Admin notification of persistent failures
- **Mitigation:** Email status tracking in database

**Risk: Account linking complexity**

- **Mitigation:** Simple UI with clear options
- **Mitigation:** Email verification for mismatch
- **Mitigation:** Comprehensive testing of scenarios
- **Mitigation:** Fallback to new account creation

### 29.2 Business Risks

**Risk: Low application volume**

- **Mitigation:** Marketing campaign for founding program
- **Mitigation:** Leverage existing DJ networks
- **Mitigation:** Incentivize referrals (post-MVP)
- **Mitigation:** Extend application period if needed

**Risk: Low conversion rate (application → onboarding)**

- **Mitigation:** Streamlined onboarding (prefilled data)
- **Mitigation:** Clear communication of benefits
- **Mitigation:** Reminder emails for pending invitations
- **Mitigation:** Admin outreach for stuck applications

**Risk: High rejection rate**

- **Mitigation:** Clear application criteria
- **Mitigation:** Helpful rejection feedback
- **Mitigation:** Encourage reapplication
- **Mitigation:** Adjust criteria if too strict

**Risk: Launch delay**

- **Mitigation:** Realistic timeline (12 weeks)
- **Mitigation:** Buffer time included
- **Mitigation:** MVP scope management
- **Mitigation:** Regular progress reviews

### 29.3 Operational Risks

**Risk: Admin overwhelmed by applications**

- **Mitigation:** Efficient admin dashboard
- **Mitigation:** Bulk actions
- **Mitigation:** Clear prioritization criteria
- **Mitigation:** Additional admin support if needed

**Risk: Support requests increase**

- **Mitigation:** Clear documentation
- **Mitigation:** FAQ page
- **Mitigation:** Automated email responses
- **Mitigation:** Support ticket system

**Risk: Database performance issues**

- **Mitigation:** Proper indexing
- **Mitigation:** Query optimization
- **Mitigation:** Monitoring and alerts
- **Mitigation:** Database scaling plan

### 29.4 Security Risks

**Risk: Invitation token brute force**

- **Mitigation:** Long tokens (32 bytes)
- **Mitigation:** Rate limiting
- **Mitigation:** Account lockout after failures
- **Mitigation:** Monitoring for suspicious activity

**Risk: Data breach**

- **Mitigation:** RLS policies on all tables
- **Mitigation:** Encryption at rest (Supabase)
- **Mitigation:** Regular security audits
- **Mitigation:** Incident response plan

**Risk: Admin account compromise**

- **Mitigation:** Strong password requirements
- **Mitigation:** 2FA for admin accounts — enabled for the solo-founder admin account from day one, independent of the audit-log decision (2FA is _prevention_; the audit log is _detection + recovery_; they do not substitute for each other)
- **Mitigation:** Limited admin accounts
- **Mitigation:** Audit logging (§19.14, in MVP as of v1.5) — append-only via RLS so a compromised admin cannot wipe their own trail; per-row + `batchId` logging on bulk actions (§13.7) so compromise-induced bulk mutations are reconstructable and reversible

**Risk: Social profile impersonation**

- **Description:** An applicant applies using a real DJ's social media URLs and a fresh email they control. Email verification passes (they own the email), but they do not own the social profiles. Admin manual review (§19.15) catches lazy impersonators but not a careful one who builds a convincing duplicate profile.
- **Mitigation:** Social-ownership verification checklist in admin review (§19.15) — approval blocked until checklist complete
- **Mitigation:** Impersonation clause in application terms (required checkbox) — provides legal lever for revocation
- **Mitigation:** Revocation path via `FoundingMember.status = REVOKED` (§9.2) if a real DJ reports impersonation
- **Mitigation:** Public reporting channel on profiles (post-launch) — the real DJ is the ultimate verifier
- **Residual risk:** A careful impersonator may pass admin review. Accepted for a curated ≤100 cohort with revocation as the backstop. Automated verification (OAuth) deferred to post-MVP (see §19.15, §30.3 Trade-off 5)

---

## 30. Final Architecture Recommendation

### 30.1 Recommended Architecture

**Overall Approach:**

- Configuration-driven mode switching (SITE_MODE)
- Clean separation of founding program logic
- Reuse existing patterns where possible
- Minimal technical debt
- Scalable for future expansion

**Key Decisions:**

1. **Site Mode Configuration:** Single environment variable controls platform mode
2. **Separate Models:** FoundingApplication, InvitationToken, FoundingMember
3. **Invitation System:** Database-backed tokens with expiry and revocation
4. **Prefill Strategy:** Application data prefills onboarding, user can edit
5. **Rewards as Data:** Stored in database, not hardcoded
6. **Referral Postponed:** Add post-MVP to reduce complexity

### 30.2 Architecture Strengths

**Simplicity:**

- Mode switching via environment variable
- No code changes for mode transitions
- Clear separation of concerns
- Solo-founder maintainable

**Scalability:**

- Database design supports future expansion
- Invitation system extensible to other programs
- Reward system supports new reward types
- Route structure supports new features

**Security:**

- Secure invitation tokens
- Proper authorization at all layers
- RLS policies on database
- Audit logging for sensitive operations

**Maintainability:**

- Clear folder organization
- Reusable components
- Consistent patterns
- Comprehensive documentation

### 30.3 Trade-offs

**Trade-off 1: Plaintext vs Hashed Tokens**

- Decision: Hashed tokens at rest (SHA-256 digest stored; raw shown only once at creation)
- Reason: Invitation tokens are bearer credentials and must be stored only as a digest for lookup and revocation; raw token shown only once at creation
- Lookup model: Hash-then-lookup — `sha256(rawToken) → findUnique({ where: { token: digest } })`; raw token is never queryable
- Admin "Resend" semantics: Revoke existing token + mint a new one; the raw value cannot be recovered or re-displayed (preserves single-use guarantee)
- Admin search: By numeric `id` / `email` / `applicationNumber`, never by token string
- Hash choice: SHA-256 (fast hash) — 256-bit entropy makes brute force infeasible; Argon2/bcrypt are inappropriate here (latency cost with no security benefit at this entropy)
- Future: Maintain hashing as security best practice for credential storage

**Trade-off 2: Referral System in MVP**

- Decision: Postpone to post-MVP; **drop `referralCode` and `totalReferrals` from the MVP `FoundingMember` schema** (see §16.3)
- Reason: MVP already complex, can add later without architectural changes. The two fields are dead in MVP (no code reads/writes them), the table is capped at 100 rows (so a later `ALTER` is trivial), and §16.2's future `Referral` table means the final shape is not yet settled — pre-installing them is speculative schema that contradicts §1.3. Forward-compat nullable columns are justified only when the table is large, the shape is stable, or an external contract depends on the field; none hold here.
- Exception: `referralCode` may be retained if marketing requires it displayed on launch materials before the referral system is live (then it has a present-day consumer). `totalReferrals` is dropped regardless.
- Future: Re-add both fields in the same Phase 2 migration that introduces the `Referral` table, with a backfill for the ≤100 existing members (§26.1)

**Trade-off 3: Advanced Analytics in MVP**

- Decision: Basic analytics only
- Reason: Focus on core functionality first
- Future: Add advanced analytics post-MVP

**Trade-off 4: AI Features**

- Decision: No AI in MVP
- Reason: Adds significant complexity, not required for founding program
- Future: Add AI for matching and recommendations post-MVP

**Trade-off 5: Social-Ownership Verification Approach**

- Decision: Admin manual review with structured checklist for MVP; no automated verification (OAuth, Story-tag, DM challenge) for founding program
- Reason: The founding program is a curated ≤100 cohort with a human admin making every approval decision. Automated verification (OAuth "Connect Instagram") requires Meta app review (weeks of lead time) and only covers Instagram/Facebook — a fallback is still needed for SoundCloud/Beatport/TikTok/RA. Challenge-based flows (bio code, Story tag, DM) add friction for the DJs being recruited, who are the prize — not the applicant. Admin manual review + impersonation clause + revocation lever + public reporting channel gives ~95% of the safety at ~5% of the cost for this cohort size
- What this accepts: admin review stops lazy impersonators (mismatched name, fan account, no portfolio) but not a careful one who builds a convincing duplicate profile. The backstop is the impersonation clause (legal lever for revocation) and the public reporting channel (the real DJ is the ultimate verifier)
- The follow ask ("Follow @djscovery") is engagement only, never verification — a follow proves nothing about account ownership (see §19.15)
- Schema: `FoundingApplication.socialVerifiedBy` (admin user ID) records who performed the review. No per-link `socialLinksVerified` state for MVP — not needed since verification is a single admin decision, not automated per-link
- Future: Revisit automated verification (OAuth for Instagram first, Story-tag fallback for platforms without OAuth) when public-mode volume outgrows admin-per-application capacity. Add `socialLinksVerified` per-link schema at that point — the current `socialVerifiedBy` field is forward-compatible (becomes the audit field for the first verification)

### 30.4 Implementation Priority

**Priority 1 (Critical):**

- Database schema
- Site mode configuration
- Application form
- Email verification
- Admin application management
- Invitation system
- Onboarding integration

**Priority 2 (Important):**

- Rewards system
- Admin member management
- SEO optimization
- Email templates

**Priority 3 (Nice to Have):**

- Advanced analytics
- CSV export
- Bulk actions
- Gamification

### 30.5 Success Criteria

**Technical Success:**

- All founding program features working
- Mode switching functional
- No breaking changes to existing features
- Security requirements met
- Performance acceptable

**Business Success:**

- 50+ founding applications
- 30+ founding members complete onboarding
- Positive feedback from founding members
- Smooth transition to public launch

**Operational Success:**

- Admin can manage applications efficiently
- Support requests manageable
- No critical bugs in production
- Documentation complete

---

## Appendix A: Glossary

- **Founding DJ:** DJ accepted into the Founding Program
- **Founding Member:** DJ who completed onboarding and has an active profile
- **Founding Number:** Sequential number assigned to founding members at profile approval (FDJ-001). Distinct from `applicationNumber` (APP-0001), which is assigned at application submission. See §8.4 for the full numbering and cap policy.
- **Invitation Token:** Secure token used for account creation
- **Site Mode:** Platform mode (founding, public, maintenance)
- **Onboarding:** Process of creating a DJ profile
- **Prefill:** Automatically filling form fields with existing data
- **RLS:** Row Level Security (Supabase)
- **Server Action:** Next.js server-side function for mutations
- **Email-Ownership Token:** Custom token stored on `FoundingApplication` (`emailVerificationToken`) proving the applicant controls the email they submitted. NOT a Supabase auth flow — the applicant has no Supabase account at verify time. See §3.2 Decision 6, §19.12.
- **Social-Ownership Verification:** Admin manual review confirming the applicant controls the social profiles (Instagram, TikTok, etc.) they pasted into the application. Separate from email verification — email proves email ownership, social verification proves social-account ownership. See §19.15.
- **Impersonation Clause:** Required acknowledgment in the application form confirming the applicant owns/control the social accounts listed. Provides the legal lever for revocation if a real DJ reports impersonation. See §19.15.
- **Follow Ask:** Engagement nudge on the confirmation page ("Follow @djscovery...") framed as news/engagement. NOT verification — a follow proves nothing about account ownership. See §19.15.

---

## Appendix B: References

- Next.js 15 Documentation: https://nextjs.org/docs
- Supabase Auth Documentation: https://supabase.com/docs/guides/auth
- Prisma Documentation: https://www.prisma.io/docs
- Resend Documentation: https://resend.com/docs
- shadcn/ui Documentation: https://ui.shadcn.com

---

**Document End**
