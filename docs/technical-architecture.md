# DJcovery Technical Architecture Document

**Version:** 1.0  
**Last Updated:** July 7, 2026  
**Status:** Active  
**Maintained By:** Engineering Team

---

## Executive Summary

DJcovery is a full-stack web application built on modern web technologies, designed for scalability, security, and maintainability. The platform follows a serverless architecture pattern with managed services for core infrastructure, allowing the team to focus on business logic rather than infrastructure management.

**Architecture Type:** JAMstack (JavaScript, APIs, Markup)  
**Deployment Model:** Serverless (Vercel)  
**Database:** PostgreSQL (Supabase)  
**Authentication:** Supabase Auth  
**Storage:** Supabase Storage  

---

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  (Next.js 16.2.10 + React 19 + TypeScript + TailwindCSS)   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/HTTPS
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    API Layer (Serverless)                    │
│         (Next.js API Routes + Server Actions)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   Service Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Supabase Auth│  │ Supabase DB  │  │Supabase Store│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │    Resend    │  │   Vercel     │                         │
│  │   (Email)    │  │  (Deployment)│                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **Client Request:** User interacts with Next.js application
2. **Server Action/API Call:** Client invokes server action or API route
3. **Authentication:** Supabase Auth validates session
4. **Business Logic:** Server action processes request
5. **Database Operations:** Prisma ORM queries PostgreSQL
6. **Response:** Data returned to client
7. **UI Update:** React updates interface

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.2.10 | React framework with App Router |
| React | 19 | UI library |
| TypeScript | Latest | Type safety |
| TailwindCSS | Latest | Styling |
| shadcn/ui | Latest | UI component library |
| Lucide React | Latest | Icon library |
| Sonner | Latest | Toast notifications |
| Zod | Latest | Schema validation |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js Server Actions | Latest | Server-side logic |
| Prisma | v7 | ORM |
| PostgreSQL | Latest | Database (via Supabase) |
| Supabase Auth | Latest | Authentication |
| Supabase Storage | Latest | File storage |
| Resend | Latest | Email service |

### Development Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| ESLint | Latest | Linting |
| Prettier | Latest | Code formatting |
| TypeScript | Latest | Type checking |
| Git | Latest | Version control |
| Vercel CLI | Latest | Deployment |

---

## Database Architecture

### Database: PostgreSQL (Supabase)

**Connection:** Managed by Supabase  
**RLS:** Row-Level Security enabled  
**Backups:** Automated by Supabase  
**Replication:** Not configured (MVP)

### Schema Organization

The schema is organized into logical sections:

1. **Enums** - Status and type definitions
2. **Geography** - Countries and cities
3. **User System** - Users, roles, profiles
4. **DJ Features** - DJ profiles, media, ratings, comments
5. **Organizer Features** - Organizer profiles, gigs
6. **Event System** - Events, participants, media
7. **Booking System** - Booking inquiries, messages
8. **Community** - Posts, comments, likes
9. **Notifications** - Notification system
10. **Admin** - Reports, audit logs

### Key Models

#### User System
- **User** - Core user account
- **UserRole** - Role assignments (DJ, ORGANIZER, FAN, ADMIN)
- **DjProfile** - DJ profile data
- **OrganizerProfile** - Organizer profile data
- **FanProfile** - Fan profile data

#### DJ Features
- **DjGenre** - Genre assignments
- **DjProfileType** - DJ type assignments
- **SocialLink** - Social media links
- **Media** - Media files (images, videos, audio)
- **DjRating** - User ratings
- **DjComment** - Profile comments
- **DjPackage** - Premium packages
- **DjCareerHighlight** - Career highlights
- **DjEndorsement** - Endorsements
- **DjPress** - Press coverage
- **DjVenue** - Venues played
- **ProfileView** - Analytics tracking

#### Organizer Features
- **Gig** - Gig postings
- **GigApplication** - DJ applications
- **GigReview** - Gig reviews
- **OrganizerSocialLink** - Social media links

#### Event System
- **Event** - DJ events
- **EventDj** - Event participants
- **EventMedia** - Event gallery
- **EventReview** - Event reviews

#### Booking System
- **BookingInquiry** - Booking requests
- **BookingInquiryMessage** - Inquiry messages

#### Community
- **Post** - Community posts
- **PostComment** - Post comments
- **PostLike** - Post likes
- **PostCommentLike** - Comment likes

#### Notifications
- **Notification** - Notification records
- **EmailPreference** - Email settings
- **EmailLog** - Email tracking

#### Admin
- **Report** - User reports
- **AdminActionLog** - Audit trail

### Indexes

Strategic indexes are placed on:
- Foreign keys (all relations)
- Status fields (for filtering)
- Date fields (for time-based queries)
- Slug fields (for URL lookups)
- Search-relevant fields (country, city, genres)

### Relationships

- **One-to-One:** User ↔ DjProfile, User ↔ OrganizerProfile, User ↔ FanProfile
- **One-to-Many:** User → Notifications, DjProfile → Media, OrganizerProfile → Gigs
- **Many-to-Many:** DjProfile ↔ Genre (via DjGenre), Event ↔ DjProfile (via EventDj)

---

## API Architecture

### Server Actions Pattern

DJcovery uses Next.js Server Actions for all server-side logic:

**Benefits:**
- Type-safe client-server communication
- Automatic form handling
- Built-in revalidation
- No separate API route files needed

**Structure:**
```
src/lib/actions/
├── auth.ts           # Authentication actions
├── profile.ts        # Profile management
├── gigs.ts           # Gig marketplace
├── events.ts         # Event management
├── media.ts          # Media uploads
├── notifications.ts  # Notification system
├── saves.ts          # Follow/save actions
└── admin.ts          # Admin actions
```

### Authentication Pattern

All server actions follow this authentication pattern:

```typescript
export async function someAction(params: Params) {
  // 1. Get user session
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { error: "Unauthorized" };
  }
  
  // 2. Check user role
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { roles: true }
  });
  
  const hasRole = dbUser?.roles.some(r => r.role === requiredRole);
  if (!hasRole) {
    return { error: "Forbidden" };
  }
  
  // 3. Execute business logic
  // ...
  
  // 4. Return result
  return { success: true, data };
}
```

### Validation Pattern

All inputs are validated using Zod schemas:

```typescript
import { z } from "zod";

const createGigSchema = z.object({
  title: z.string().min(5).max(120),
  gigType: z.enum(gigTypes),
  eventDate: z.date().min(new Date()),
  // ...
});

export async function createGig(formData: FormData) {
  const data = createGigSchema.parse(Object.fromEntries(formData));
  // ...
}
```

---

## File Structure

### Project Structure

```
djscovery/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Seed data
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Auth routes
│   │   ├── account/          # Account settings
│   │   ├── admin/            # Admin dashboard
│   │   ├── api/              # API routes
│   │   ├── become-dj/        # DJ onboarding
│   │   ├── become-fan/       # Fan onboarding
│   │   ├── become-organizer/ # Organizer onboarding
│   │   ├── dashboard/       # User dashboards
│   │   ├── djs/              # DJ profiles
│   │   ├── events/           # Events
│   │   ├── organizers/       # Organizer profiles
│   │   ├── sign-in/          # Sign in
│   │   ├── sign-up/          # Sign up
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles
│   ├── components/           # React components
│   │   ├── account/         # Account components
│   │   ├── admin/           # Admin components
│   │   ├── booking/         # Booking components
│   │   ├── dj-profile/      # DJ profile components
│   │   ├── events/          # Event components
│   │   ├── gigs/            # Gig components
│   │   ├── organizer/       # Organizer components
│   │   ├── ui/              # shadcn/ui components
│   │   └── ...              # Other components
│   ├── config/              # Configuration files
│   │   ├── dj-types.ts      # DJ type config
│   │   ├── gig-type-fields.ts # Gig field config
│   │   └── navigation.ts    # Navigation config
│   ├── data/                # Static data
│   │   ├── dj-demo.json     # Demo DJ data
│   │   └── gigs-demo.ts     # Demo gig data
│   ├── lib/                 # Library code
│   │   ├── actions/         # Server actions
│   │   ├── auth/            # Auth utilities
│   │   ├── plan-features.ts # Plan feature gates
│   │   ├── validations/     # Zod schemas
│   │   └── ...              # Other utilities
│   ├── middleware.ts        # Next.js middleware
│   ├── proxy.ts             # API proxy
│   └── types/               # TypeScript types
├── docs/                    # Documentation
├── .env.local               # Local environment
├── .env.example             # Environment template
├── next.config.mjs          # Next.js config
├── package.json             # Dependencies
├── prisma.config.ts         # Prisma config
├── tsconfig.json            # TypeScript config
└── vercel.json              # Vercel config
```

---

## Security Architecture

### Authentication

**Provider:** Supabase Auth  
**Methods:** Email/password, Google OAuth, Magic links  
**Session Management:** JWT tokens stored in cookies  
**Session Duration:** Configurable (default: 1 week)

### Authorization

**Role-Based Access Control (RBAC):**
- Roles: ADMIN, DJ, ORGANIZER, FAN
- Role checks in all server actions
- Middleware protection for protected routes

**Row-Level Security (RLS):**
- Database-level access control
- Policies for each table
- User-based row ownership
- Admin bypass for full access

### Data Protection

**Sensitive Data:**
- Organizer contact info (revealed after gig acceptance)
- Venue addresses (revealed after gig acceptance)
- User emails (never exposed publicly)
- Personal identifiers (protected by RLS)

**Encryption:**
- TLS/SSL for all connections
- Supabase manages encryption at rest
- Passwords hashed by Supabase Auth

### Security Measures

1. **Input Validation:** All inputs validated via Zod schemas
2. **SQL Injection Prevention:** Prisma ORM prevents SQL injection
3. **XSS Prevention:** React auto-escapes content
4. **CSRF Protection:** Next.js built-in CSRF protection
5. **Rate Limiting:** To be implemented (Vercel Edge Config)
6. **Audit Logging:** AdminActionLog tracks sensitive operations

---

## Performance Architecture

### Frontend Performance

**Optimizations:**
- Server Components for static content
- Client Components for interactive features
- Code splitting via dynamic imports
- Image optimization via Next.js Image
- Font optimization via next/font
- Lazy loading for heavy components

**Monitoring:**
- Vercel Analytics
- Web Vitals tracking
- Performance budgeting

### Backend Performance

**Database Optimizations:**
- Strategic indexes on frequently queried fields
- Query optimization via Prisma
- Connection pooling (Supabase managed)
- Read replicas (future)

**Caching Strategy:**
- Next.js built-in caching (fetch, revalidate)
- Static generation where possible
- CDN caching via Vercel Edge Network
- Future: Redis for session caching

### Performance Targets

- **First Contentful Paint (FCP):** < 1.8s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **API Response Time:** < 500ms (p95)

---

## Deployment Architecture

### Deployment: Vercel

**Environment:**
- **Staging:** `NEXT_PUBLIC_APP_ENV=staging`
- **Production:** `NEXT_PUBLIC_APP_ENV=production`

**Deployment Process:**
1. Code pushed to GitHub
2. Vercel triggers build
3. Next.js builds application
4. Prisma generates client
5. Assets deployed to Edge Network
6. Serverless functions deployed

**Infrastructure:**
- **Edge Network:** Global CDN
- **Serverless Functions:** Auto-scaling
- **Database:** Supabase (separate instances for staging/production)
- **Storage:** Supabase Storage (separate buckets)
- **Email:** Resend (API-based)

### Environment Variables

**Required Variables:**
```
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_ENV
DATABASE_URL
RESEND_API_KEY
```

**Staging vs Production:**
- Separate Supabase projects
- Separate Resend API keys
- Separate environment-specific configs

---

## Scalability Architecture

### Current Scalability (MVP)

**Horizontal Scaling:**
- Vercel auto-scales serverless functions
- Edge Network handles static assets
- Database scaling via Supabase

**Vertical Scaling:**
- Supabase managed PostgreSQL
- Automatic resource allocation
- Connection pooling

### Future Scalability Plans

**Database:**
- Read replicas for read-heavy workloads
- Connection pooling optimization
- Query optimization and indexing
- Data archiving for old records

**Application:**
- Dedicated worker queues for background jobs
- Redis for caching and session storage
- Microservices for specific features (if needed)

**Infrastructure:**
- Load balancing (if moving off Vercel)
- CDN optimization
- Edge computing for heavy computations

---

## Monitoring & Observability

### Current Monitoring

**Vercel Analytics:**
- Page views
- Web Vitals
- Geographic distribution
- Device breakdown

**Supabase Dashboard:**
- Database performance
- Storage usage
- Auth metrics
- API usage

### Future Monitoring

**Application Monitoring:**
- Error tracking (Sentry)
- Performance monitoring (APM)
- Log aggregation
- Real user monitoring (RUM)

**Business Metrics:**
- User acquisition funnels
- Feature usage analytics
- Conversion tracking
- Custom dashboards

---

## Development Workflow

### Git Workflow

**Branch Strategy:**
- `main` - Production
- `dev` - Staging
- `feature/*` - Feature branches
- `fix/*` - Bug fixes
- `hotfix/*` - Production hotfixes

**Commit Convention:**
```
feat: add new feature
fix: fix bug
docs: update documentation
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

### Code Review Process

1. Create feature branch
2. Implement changes
3. Run tests (when implemented)
4. Create pull request
5. Code review
6. Merge to dev (staging)
7. Test on staging
8. Merge to main (production)

### Testing Strategy

**Current State:** Manual testing  
**Future State:**
- Unit tests (Jest)
- Integration tests (Playwright)
- E2E tests (Playwright)
- Component tests (React Testing Library)

---

## Disaster Recovery

### Backup Strategy

**Database:**
- Automated daily backups (Supabase)
- Point-in-time recovery (7 days)
- Manual backup before major changes

**Storage:**
- Supabase Storage replication
- Version history for files
- Manual backup for critical assets

### Recovery Procedures

**Database Recovery:**
1. Identify issue
2. Determine recovery point
3. Restore from backup
4. Verify data integrity
5. Update application

**Application Recovery:**
1. Rollback to previous deployment
2. Investigate root cause
3. Fix issue
4. Redeploy

---

## API Documentation

### Server Actions Documentation

Server actions are self-documenting via TypeScript types. Each action:

1. Accepts typed parameters
2. Returns typed responses
3. Includes error handling
4. Has inline comments

**Example:**
```typescript
/**
 * Creates a new gig for an organizer
 * @param formData - Gig creation form data
 * @returns { success: true, gigId: number } | { error: string }
 */
export async function createGig(formData: FormData) {
  // Implementation
}
```

### Future API Documentation

**Planned:**
- OpenAPI/Swagger specification
- Interactive API explorer
- Postman collection
- API versioning strategy

---

## Third-Party Integrations

### Current Integrations

| Service | Purpose | Usage |
|---------|---------|-------|
| Supabase Auth | Authentication | User auth, sessions |
| Supabase DB | Database | Data persistence |
| Supabase Storage | File Storage | Media files |
| Resend | Email | Transactional emails |
| Vercel | Deployment | Hosting, CDN |

### Future Integrations

**Planned:**
- Stripe - Payments
- Google Calendar - Calendar sync
- Social Media APIs - Content integration
- Analytics Tools - Advanced tracking

---

## Compliance & Legal

### Data Protection

**GDPR Compliance:**
- User data stored in EU (Supabase EU region)
- Right to deletion implemented
- Data export functionality
- Cookie consent (to be implemented)

### Terms of Service

**Key Points:**
- User-generated content ownership
- Platform usage rights
- Content moderation policies
- Dispute resolution

### Privacy Policy

**Data Collected:**
- User profiles
- Usage analytics
- Contact information
- Payment data (future)

---

## Appendix

### Environment Setup

**Prerequisites:**
- Node.js 20+
- npm or yarn
- Git
- Supabase account
- Vercel account

**Setup Steps:**
1. Clone repository
2. Install dependencies: `npm install`
3. Set up Supabase project
4. Configure environment variables
5. Run database migrations: `npx prisma db push`
6. Generate Prisma client: `npx prisma generate`
7. Start development server: `npm run dev`

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Database
npx prisma db push      # Push schema changes
npx prisma generate     # Generate Prisma client
npx prisma studio       # Open Prisma Studio

# Linting
npm run lint            # Run ESLint
```

### Troubleshooting

**Common Issues:**
- **Database connection:** Check DATABASE_URL
- **Auth issues:** Verify Supabase keys
- **Build errors:** Check Node.js version
- **Deployment failures:** Check environment variables

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| July 7, 2026 | 1.0 | Initial technical architecture document | Engineering Team |

---

*This document is a living document and will be updated as the architecture evolves. All changes should be documented in the Change Log section.*
