# DJcovery Product Roadmap

**Version:** 1.0  
**Last Updated:** July 7, 2026  
**Status:** Active  
**Maintained By:** Product Team

---

## Executive Summary

DJcovery is a professional DJ marketplace connecting DJs with event organizers, fans, and venues. The platform enables DJs to showcase their portfolios, organizers to post gig opportunities, and fans to discover and follow their favorite artists.

**Current Phase:** MVP Development  
**Target Launch:** Q3 2026  
**Primary Markets:** Sweden (initial), expanding to Europe

---

## MVP Core Features (Current Status)

### ✅ Completed Features

#### User Authentication & Onboarding
- **Status:** ✅ Complete
- **Details:**
  - Supabase Auth integration (email, Google, magic links)
  - Role-based access (DJ, Organizer, Fan, Admin)
  - Email verification flow
  - Password reset functionality
  - Minimum age enforcement (18+)

#### DJ Profiles
- **Status:** ✅ Complete
- **Details:**
  - Public DJ profiles with slug-based URLs
  - Profile approval workflow (admin review)
  - Stage name, bio, experience level
  - Country/city location
  - Genre selection (admin-managed)
  - DJ type selection (Club, Festival, Wedding, etc.)
  - Social media links (Instagram, TikTok, YouTube, Spotify, SoundCloud, Mixcloud, Website)
  - Avatar and cover image uploads
  - Fee range and currency
  - Search and filtering

#### DJ Premium Features
- **Status:** ✅ Complete
- **Details:**
  - Team contacts (manager, agent)
  - Availability calendar
  - Featured mix/video spotlight
  - Career highlights timeline
  - Endorsements section
  - Press/media coverage
  - "Where I've Played" venues section
  - Profile analytics (monthly views)
  - Reputation scoring system

#### Organizer Profiles
- **Status:** ✅ Complete
- **Details:**
  - Public organizer profiles with slug-based URLs
  - Organizer type (Individual, Company, Venue, Agency, Festival)
  - Logo and cover image uploads
  - Website and contact information
  - Social media links
  - Country/city location
  - Active/suspended status

#### Fan Profiles
- **Status:** ✅ Complete
- **Details:**
  - Fan onboarding flow
  - Profile creation with avatar
  - Country/city location
  - Follow DJs functionality
  - Save events functionality

#### Media Management
- **Status:** ✅ Complete
- **Details:**
  - Image uploads to Supabase Storage
  - Gallery management for DJs
  - Video embed support (YouTube, Vimeo, TikTok, Instagram)
  - Media limits based on plan (free vs premium)

#### Events System
- **Status:** ✅ Complete
- **Details:**
  - DJs can create and manage events
  - Event types (Public, Private)
  - Event categories
  - Poster uploads
  - Date/time and timezone support
  - Venue information
  - Ticket URL integration
  - Co-performer support (multiple DJs per event)
  - Event gallery (post-event photos)
  - Event reviews
  - Featured events (max 3)
  - Draft/Published/Completed status

#### Community & Social
- **Status:** ✅ Complete
- **Details:**
  - DJ ratings and reviews (1-5 stars)
  - DJ profile comments with replies
  - Community feed (DJs can post)
  - Post likes and comments
  - Follow system (DJ following)
  - Save events functionality

#### Notifications
- **Status:** ✅ Complete
- **Details:**
  - Real-time notification system
  - Notification types for various actions
  - Email notifications (via Resend)
  - Notification preferences

#### Admin Dashboard
- **Status:** ✅ Complete
- **Details:**
  - DJ profile approval/rejection
  - User management
  - Report moderation
  - Action audit logs
  - Admin-only routes

#### Booking Inquiries
- **Status:** ✅ Complete
- **Details:**
  - Organizers can send booking inquiries to DJs
  - Structured booking form (event details, budget, crowd size)
  - Masked messaging between DJ and organizer
  - Inquiry status tracking (Pending, Accepted, Declined, Cancelled)
  - Contact info revealed after acceptance
  - Analytics for acceptance tracking

#### Search & Discovery
- **Status:** ✅ Complete
- **Details:**
  - DJ directory with filters
  - Genre-based search
  - Location-based search
  - Experience level filtering
  - Search scoring algorithm

#### Infrastructure
- **Status:** ✅ Complete
- **Details:**
  - Next.js 16.2.10 with App Router
  - React 19
  - Prisma v7 with PostgreSQL
  - Supabase Auth
  - RLS policies for data security
  - Vercel deployment
  - Staging and production environments

---

### 🚧 In Progress Features

#### Gigs Marketplace
- **Status:** 🚧 In Development
- **Details:**
  - Organizer gig posting
  - Gig types (Club, Festival, Wedding, Corporate, Private Party, etc.)
  - Multi-step gig creation form
  - Budget specification (Fixed, Range, Negotiable, TBA)
  - Requirements (genres, experience level, equipment)
  - Application deadline
  - DJ application system
  - Application status tracking (Applied, Shortlisted, Accepted, Rejected, Withdrawn)
  - Venue information (partial reveal before acceptance)
  - Gig status management (Draft, Published, Filled, Cancelled, Expired)
  - Organizer applicant management
  - DJ gig marketplace with filters
  - Gig reviews
- **Progress:** Schema complete, server actions in progress
- **ETA:** Q3 2026

#### Founding DJs Program
- **Status:** 🚧 Planned
- **Details:**
  - Pre-launch DJ application system
  - Vetting and approval workflow
  - Invitation-based onboarding
  - Founding member badges
  - Exclusive rewards program
  - Seamless transition to public launch
- **Progress:** Technical design complete
- **ETA:** Q3 2026

---

### 📋 Planned MVP Features

#### Profile Views Analytics
- **Status:** 📋 Planned
- **Details:**
  - Track profile views by DJs
  - View source tracking (direct, search, social, referral)
  - Geographic distribution of viewers
  - Time-based analytics
- **ETA:** Q3 2026

#### Enhanced Search
- **Status:** 📋 Planned
- **Details:**
  - Full-text search
  - Advanced filtering
  - Search history
  - Saved searches
- **ETA:** Q3 2026

#### Mobile Optimization
- **Status:** 📋 Planned
- **Details:**
  - Responsive design improvements
  - Mobile-specific UI patterns
  - Touch-optimized interactions
- **ETA:** Q3 2026

---

## Post-MVP Features (Future Phases)

### Phase 1: Revenue & Monetization (Q4 2026)

#### Premium Subscriptions
- **DJ Premium Plans**
  - Tiered pricing (Free, Pro, Elite)
  - Feature gating based on plan
  - Subscription management
  - Payment processing (Stripe)
  - Usage analytics

- **Organizer Subscriptions**
  - Gig posting limits
  - Featured gig placements
  - Priority in search results
  - Advanced analytics

#### Paid Gig Postings
- Pay-per-post model for organizers
- Featured gig placements
- Urgent gig highlighting
- Boosted visibility options

#### Booking Commissions
- Commission on successful bookings
- Transparent fee structure
- Payment processing
- Payout system for DJs

### Phase 2: Enhanced Experience (Q1 2027)

#### Messaging System
- Real-time chat between DJs and organizers
- Group messaging for events
- File sharing
- Read receipts
- Message templates

#### Calendar Integration
- DJ availability calendar
- Google Calendar sync
- Conflict detection
- Recurring availability

#### Contracts & Payments
- Digital contract generation
- E-signature integration
- Escrow payments
- Milestone-based payments
- Invoice generation

#### AI Matching
- Smart DJ-gig matching
- Recommendation engine
- Compatibility scoring
- Automated suggestions

### Phase 3: Platform Expansion (Q2 2027)

#### Venue Partnerships
- Venue profiles
- Venue booking system
- Venue-DJ matching
- Equipment inventory

#### Agency Support
- Agency profiles
- Roster management
- Bulk gig posting
- Commission tracking

#### Fan Engagement
- Fan clubs
- Exclusive content
- Live streaming integration
- Ticket sales
- Merchandise integration

### Phase 4: Advanced Features (Q3 2027)

#### Video Auditions
- Video submission for gigs
- Video review tools
- Video portfolio enhancement
- Live audition scheduling

#### Reputation System Enhancement
- Detailed reputation scoring
- Verification badges
- Endorsement system
- Professional certifications

#### Analytics Dashboard
- Comprehensive analytics for DJs
- Performance insights
- Market trends
- Competitive analysis

#### Mobile Apps
- Native iOS app
- Native Android app
- Push notifications
- Offline functionality

---

## Technical Debt & Improvements

### High Priority
- [ ] Implement comprehensive error boundaries
- [ ] Add loading states for all async operations
- [ ] Optimize image loading (Next.js Image optimization)
- [ ] Implement proper SEO (meta tags, sitemap, robots.txt)
- [ ] Add automated testing (unit, integration, E2E)
- [ ] Performance optimization (bundle size, lazy loading)

### Medium Priority
- [ ] Improve accessibility (WCAG AA compliance)
- [ ] Add dark mode support
- [ ] Implement caching strategy
- [ ] Add monitoring and alerting
- [ ] Implement rate limiting
- [ ] Add API documentation

### Low Priority
- [ ] Refactor legacy code
- [ ] Improve code documentation
- [ ] Add storybook for components
- [ ] Implement design system
- [ ] Add internationalization (i18n)

---

## Business Metrics & KPIs

### User Acquisition
- DJ registration rate
- Organizer registration rate
- Fan registration rate
- Conversion rate from visitor to registered user
- Cost per acquisition (CPA)

### Engagement
- Active users (DAU, MAU)
- Profile views per DJ
- Gig applications per DJ
- Event creation rate
- Follow rate (fans to DJs)
- Session duration

### Marketplace Health
- Gig posting rate
- Gig fill rate
- Application rate per gig
- Time to fill gig
- Repeat bookings
- Booking completion rate

### Revenue
- Premium subscription revenue
- Gig posting revenue
- Booking commission revenue
- Average revenue per user (ARPU)
- Customer lifetime value (CLV)
- Churn rate

---

## Risk Management

### Technical Risks
- **Database Performance:** Monitor query performance, implement caching, optimize indexes
- **Scalability:** Design for horizontal scaling, implement load balancing
- **Security:** Regular security audits, keep dependencies updated, implement rate limiting
- **Data Loss:** Implement automated backups, disaster recovery plan

### Business Risks
- **Market Adoption:** Focus on user experience, implement referral programs, partner with industry
- **Competition:** Differentiate through quality, focus on niche markets, build community
- **Regulatory:** Ensure compliance with data protection laws (GDPR), terms of service
- **Payment Processing:** Use reliable payment providers, implement fraud detection

### Operational Risks
- **Support Load:** Implement self-service tools, create comprehensive documentation
- **Content Moderation:** Implement automated moderation, human review process
- **Vendor Dependencies:** Diversify vendors, have backup plans

---

## Launch Checklist

### Pre-Launch
- [ ] Complete all MVP features
- [ ] Security audit
- [ ] Performance testing
- [ ] User acceptance testing (UAT)
- [ ] Legal review (terms, privacy)
- [ ] Payment testing
- [ ] Email testing
- [ ] Backup and recovery testing
- [ ] Monitoring setup
- [ ] Documentation complete

### Launch Day
- [ ] Deploy to production
- [ ] Verify all systems operational
- [ ] Monitor error rates
- [ ] Monitor performance
- [ ] Support team ready
- [ ] Marketing campaign launch
- [ ] Social media announcements

### Post-Launch (Week 1)
- [ ] Daily health checks
- [ ] User feedback collection
- [ ] Bug triage and fixes
- [ ] Performance optimization
- [ ] Marketing analysis
- [ ] Iterate on user feedback

---

## Appendix

### Technology Stack
- **Frontend:** Next.js 16.2.10, React 19, TypeScript, TailwindCSS
- **Backend:** Next.js API Routes, Server Actions
- **Database:** PostgreSQL via Prisma v7
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Email:** Resend
- **Deployment:** Vercel
- **Monitoring:** (To be determined)

### Key Documents
- [Gigs Feature Plan](./gigs-feature-plan.md)
- [Founding DJs Program TDD](./founding-djs-program-tdd.md)
- [Events Model Spec](./events-model-spec.md)
- [Organizer Profile Spec](./organizer-profile-spec.md)
- [RLS Policies](./rls-policies.sql)

### Environment Configuration
- **Staging:** `NEXT_PUBLIC_APP_ENV=staging`
- **Production:** `NEXT_PUBLIC_APP_ENV=production`
- **Database:** Staging uses separate Supabase project

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| July 7, 2026 | 1.0 | Initial roadmap creation | Product Team |

---

*This document is a living document and will be updated as the project evolves. All changes should be documented in the Change Log section.*
