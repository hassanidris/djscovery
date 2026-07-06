# DJcovery Founding DJs Program – Technical Design Document

**Version:** 1.0  
**Date:** July 6, 2026  
**Status:** Draft  
**Author:** Lead Software Architect

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

- Next.js 15 App Router with React 19
- Supabase Auth (email, Google, magic links)
- Prisma v7 with PostgreSQL
- Resend for email
- RLS policies for data security
- Admin dashboard with DJ approval workflow

The Founding Program will extend—not replace—this architecture.

**Note:** The existing `PRE_LAUNCH_MODE` middleware flag will be replaced by `SITE_MODE` as part of this implementation.

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

**Confirmation → Email Verification**

- Verification email sent to applicant
- Token-based verification (24-hour expiry)
- Updates application status to EMAIL_VERIFIED

**Email Verification → Application Review**

- Admin dashboard displays pending applications
- Admin can view all data and add notes

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
- Require email verification of new address
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

**Migration Note:** When implementing this design, remove PRE_LAUNCH_MODE from middleware.ts and environment configuration. SITE_MODE provides the same pre-launch gating via the "founding" mode, plus additional modes for public launch and maintenance.

**Decision 4: Prefill Strategy**

- Application data stored separately from profile
- Onboarding reads from application when creating profile
- User can edit all fields
- Application retained for audit trail

**Decision 5: Founding Rewards as Data**

- Rewards stored in database, not hardcoded
- FoundingMember model tracks founding status
- Enables future reward modifications without code changes

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

**Blocked Routes:**

- DJ directory, profiles, organizer pages, events, gigs, community, dashboards

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
- Enable application submission
- Enable invitation-based registration
- Disable normal registration
- Block dashboards and discovery features

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

---

## 8. Database Design

### 8.1 New Models

#### FoundingApplication

**Purpose:** Store DJ applications during founding program

**Fields:**

- `id` (Int, @id, autoincrement)
- `applicationNumber` (String, unique) - Sequential: FDJ-0001
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
- `emailVerificationToken` (String?)
- `emailVerificationExpiresAt` (DateTime?)
- `invitationTokenId` (Int?)
- `userId` (String?)
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
- `token` (String, unique)
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
- `premiumMonthsGranted` (Int, default: 0)
- `premiumMonthsUsed` (Int, default: 0)
- `homepageFeaturedUntil` (DateTime?)
- `priorityRankingUntil` (DateTime?)
- `referralCode` (String, unique)
- `totalReferrals` (Int, default: 0)
- `badgeVisible` (Boolean, default: true)
- `launchedAt` (DateTime?)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Indexes:**

- userId, djProfileId, foundingNumber, status, referralCode

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
- Notification: Invitation email sent

**UNDER_REVIEW → REJECTED**

- Who: Admin
- Trigger: Admin clicks "Reject"
- Notification: Rejection email sent

**APPROVED → COMPLETED**

- Who: System (automatic)
- Trigger: DJ completes onboarding, profile approved
- Notification: Welcome email, founding badge assigned

### 9.3 Validations

- Email verification: Token must exist, not expired, not used
- Admin approval: Admin authenticated, application verified
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

- Detect mismatch on invitation acceptance
- Show account linking UI
- Options: Add email A to account, sign out and sign in with email A, create new account
- Recommended: Email verification (add secondary email)

### 10.3 Duplicate Account Prevention

- User.email is unique
- FoundingApplication.email is unique within PENDING/APPROVED status
- Detect existing account on application
- Detect existing account on invitation

### 10.4 Invitation Expiration

- Generated when application approved
- Expires in 7 days
- Single-use
- Cron job checks expiry daily
- Admin can regenerate

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

- Token exists in database
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

### 13.3 Invitations Page

- Table view with filters (status, date range)
- Search by email, token ID
- Row actions: View, Revoke, Resend, Extend Expiry

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

**Premium:** Use existing DjProfile.plan enum, track expiry in FoundingMember

**Priority Ranking:** Add priorityBoost to DjProfile, add to search score calculation

**Homepage Feature:** Add homepageFeatured and homepageFeaturedUntil to DjProfile

### 15.3 Activation

On launch (SITE_MODE=public):

- Set DjProfile.plan to PREMIUM
- Set DjProfile.priorityBoost to 2.0
- Set DjProfile.homepageFeatured to true
- Set FoundingMember.launchedAt
- Send launch announcement email

### 15.4 Expiry

Cron jobs reset rewards after expiry periods. Email notifications before expiry.

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

- Invitation tokens stored in database
- Optional: Hash tokens for additional security
- Email verification tokens stored in FoundingApplication
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

- Required for application submission
- Required for account linking
- 24-hour expiry
- Single-use tokens
- Token invalidation after use

### 19.13 Admin Protection

- ADMIN role required for admin routes
- Middleware enforces admin role
- Server actions verify admin role
- Audit logging for all admin actions

### 19.14 Future Auditing

**AdminActionLog Model (Future):**

```typescript
model AdminActionLog {
  id: Int @id @default(autoincrement())
  adminId: String
  action: String
  targetType: String
  targetId: String?
  metadata: Json?
  ipAddress: String?
  userAgent: String?
  createdAt DateTime @default(now())
}
```

**Actions to Log:**

- Application approval/rejection
- Invitation generation/revocation
- Founding member suspension/revocation
- Reward modifications

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
- Additional: Enable beta access for founding members
- Send beta access emails
- Monitor beta usage

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
4. Activate founding rewards (cron job or manual trigger)
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
4. Enable beta access for founding members
5. Send beta access emails
6. Monitor beta usage

**Data Changes:**

- None required
- FoundingMember records already created

**Configuration:**

- SITE_MODE remains founding
- Beta access controlled via FoundingMember status

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
- Account linking (email mismatch)
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

**Referral System:**

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
- Email verification flow
- Application confirmation page
- Email templates (application received, email verification)

**Deliverables:**

- Working application form
- Email verification
- Confirmation pages

### 27.3 Phase 3: Admin Application Management (Week 5-6)

**Tasks:**

- Admin application list
- Application detail view
- Approve/reject workflow
- Admin notes
- Email templates (invitation, rejection)
- Analytics dashboard (basic)

**Deliverables:**

- Admin application management
- Invitation generation
- Basic analytics

### 27.4 Phase 4: Invitation System (Week 7)

**Tasks:**

- Invitation token generation
- Invitation validation
- Invitation landing page
- Account linking (email mismatch)
- Email templates (invitation reminder, invitation expired)

**Deliverables:**

- Working invitation system
- Account linking

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
- **Mitigation:** 2FA for admin accounts
- **Mitigation:** Limited admin accounts
- **Mitigation:** Audit logging

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

- Decision: Hashed tokens at rest
- Reason: Invitation tokens are bearer credentials and must be stored only as a digest for lookup and revocation; raw token shown only once at creation
- Future: Maintain hashing as security best practice for credential storage

**Trade-off 2: Referral System in MVP**

- Decision: Postpone to post-MVP
- Reason: MVP already complex, can add later without architectural changes
- Future: Add in Phase 2 post-launch

**Trade-off 3: Advanced Analytics in MVP**

- Decision: Basic analytics only
- Reason: Focus on core functionality first
- Future: Add advanced analytics post-MVP

**Trade-off 4: AI Features**

- Decision: No AI in MVP
- Reason: Adds significant complexity, not required for founding program
- Future: Add AI for matching and recommendations post-MVP

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
- **Founding Number:** Sequential number assigned to founding members (FDJ-001)
- **Invitation Token:** Secure token used for account creation
- **Site Mode:** Platform mode (founding, public, maintenance)
- **Onboarding:** Process of creating a DJ profile
- **Prefill:** Automatically filling form fields with existing data
- **RLS:** Row Level Security (Supabase)
- **Server Action:** Next.js server-side function for mutations

---

## Appendix B: References

- Next.js 15 Documentation: https://nextjs.org/docs
- Supabase Auth Documentation: https://supabase.com/docs/guides/auth
- Prisma Documentation: https://www.prisma.io/docs
- Resend Documentation: https://resend.com/docs
- shadcn/ui Documentation: https://ui.shadcn.com

---

**Document End**
