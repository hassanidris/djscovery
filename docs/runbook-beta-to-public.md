# Runbook: Beta → Public Transition

## Overview

This runbook outlines the steps to transition the Djscovery platform from Beta phase to Public launch.

## Prerequisites

- Beta phase is stable with acceptable metrics
- Critical bugs from beta have been resolved
- Infrastructure is scaled for public traffic
- Legal and compliance requirements are met
- Support team is trained and ready

## Pre-Launch Checklist

### 1. Data Preparation

- [ ] Clean up test/beta data from database
- [ ] Archive beta user feedback
- [ ] Verify all user data is accurate
- [ ] Check for and remove any placeholder content

### 2. Infrastructure Scaling

- [ ] Verify database can handle projected load
- [ ] Check Redis cache capacity
- [ ] Verify CDN configuration
- [ ] Test auto-scaling rules
- [ ] Verify backup systems are operational

### 3. Security Review

- [ ] Complete security audit (see phase-9-security-review.md)
- [ ] Verify all RLS policies are active
- [ ] Test rate limiting under load
- [ ] Verify admin authorization checks
- [ ] Review and update security headers

### 4. Performance Optimization

- [ ] Complete performance review (see phase-9-performance-review.md)
- [ ] Add database indexes for critical queries
- [ ] Implement pagination for list views
- [ ] Optimize bundle size
- [ ] Enable compression

### 5. Legal & Compliance

- [ ] Review Terms of Service
- [ ] Review Privacy Policy
- [ ] Verify GDPR compliance (if applicable)
- [ ] Set up cookie consent
- [ ] Review data retention policies

### 6. Support Readiness

- [ ] Train support team on common issues
- [ ] Set up support ticket system
- [ ] Create FAQ documentation
- [ ] Set up escalation procedures
- [ ] Prepare incident response plan

### 7. Marketing & Communications

- [ ] Prepare press release
- [ ] Update landing page for public launch
- [ ] Prepare social media campaign
- [ ] Set up email marketing campaigns
- [ ] Create onboarding emails for new users

## Launch Steps

### Step 1: Final Testing

#### 1.1 Load Testing

```bash
# Run load tests
npm run load-test

# Monitor system metrics
# - Database connections
# - Redis memory usage
# - API response times
# - Error rates
```

#### 1.2 End-to-End Testing

```bash
# Run full e2e test suite
npm run e2e

# Test critical user journeys:
# - User registration
# - DJ profile creation
# - Event creation
# - Booking flow
# - Review submission
```

#### 1.3 Security Testing

- Run penetration testing
- Test rate limiting effectiveness
- Verify authentication flow
- Test authorization checks
- Review audit logs

### Step 2: Database Preparation

#### 2.1 Clean Beta Data

```sql
-- Preview test accounts before deletion
SELECT id, email, "createdAt" FROM "User" WHERE email LIKE '%@test.example.com' OR email LIKE '%test%@%';

-- Remove test accounts (targeting known test email patterns only)
DELETE FROM "User" WHERE email LIKE '%@test.example.com' OR email LIKE '%test%@%';

-- Preview placeholder content before deletion
SELECT id, "stageName", "userId" FROM "DjProfile" WHERE "stageName" LIKE '%Test DJ%' OR "stageName" LIKE '%TestUser%';

-- Remove placeholder content (targeting known test stage names only)
DELETE FROM "DjProfile" WHERE "stageName" LIKE '%Test DJ%' OR "stageName" LIKE '%TestUser%';

-- Update beta user status if needed
UPDATE "UserRole" SET role = 'USER' WHERE role = 'BETA_USER';
```

**Note**: Replace the email and stage name patterns with your actual test data patterns. Always run the SELECT statements first to verify the rows that will be deleted before executing the DELETE statements.

#### 2.2 Update System Configuration

```sql
-- Update phase to public
UPDATE "SystemConfig" SET value = 'PUBLIC' WHERE key = 'PHASE';

-- Set site mode to live
INSERT INTO "SystemConfig" (key, value)
VALUES ('SITE_MODE', 'LIVE')
ON CONFLICT (key) DO UPDATE SET value = 'LIVE';

-- Remove beta limits
DELETE FROM "SystemConfig" WHERE key = 'BETA_USER_LIMIT';
DELETE FROM "SystemConfig" WHERE key = 'BETA_INVITATION_ENABLED';
```

#### 2.3 Create Database Backups

```bash
# Create final pre-launch backup
pg_dump $DATABASE_URL > pre-launch-backup.sql

# Verify backup integrity
pg_restore --list pre-launch-backup.sql
```

### Step 3: Application Configuration

#### 3.1 Update Environment Variables

```bash
# .env.production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_PHASE=PUBLIC
NEXT_PUBLIC_SITE_MODE=LIVE
BETA_INVITATION_ENABLED=false
PUBLIC_REGISTRATION_ENABLED=true
```

#### 3.2 Deploy to Production

```bash
# Merge main branch
git checkout main
git pull

# Run final build
npm ci
npm run build

# Deploy
npm run start
```

#### 3.3 Verify Deployment

- Check application health endpoint
- Verify database connections
- Test authentication flow
- Check cache connectivity
- Verify email sending

### Step 4: Enable Public Features

#### 4.1 Open Registration

- Remove invitation requirement
- Enable public sign-up
- Configure email verification
- Set up welcome emails

#### 4.2 Update Homepage

- Update hero messaging for public launch
- Add social proof (testimonials, stats)
- Highlight key features
- Add clear CTAs

#### 4.3 Configure SEO

- Update meta tags
- Submit sitemap to search engines
- Set up analytics tracking
- Configure social sharing

### Step 5: Launch Communications

#### 5.1 Public Announcement

- Send press release
- Publish blog post
- Update social media
- Send email to waitlist

#### 5.2 User Communications

- Send launch announcement to existing users
- Send onboarding emails to new users
- Provide in-app notifications
- Update help documentation

### Step 6: Monitoring

#### 6.1 Real-Time Monitoring

- Monitor user registrations
- Track error rates
- Monitor API response times
- Check database performance
- Monitor cache hit rates

#### 6.2 Alert Configuration

- Set up error rate alerts
- Configure performance alerts
- Set up database connection alerts
- Configure security alerts
- Set up uptime monitoring

#### 6.3 Hourly Checks (First 24 Hours)

- Check system logs
- Review error reports
- Monitor user feedback
- Check support tickets
- Review performance metrics

## Post-Launch Verification

### 1. Functional Testing

- [ ] Test new user registration
- [ ] Test DJ profile creation
- [ ] Test event creation
- [ ] Test booking flow
- [ ] Test review submission
- [ ] Test all admin functions

### 2. Performance Verification

- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Database query times < 100ms
- [ ] Cache hit rate > 80%
- [ ] Error rate < 1%

### 3. Security Verification

- [ ] No unauthorized access attempts
- [ ] Rate limiting is working
- [ ] Authentication is secure
- [ ] No data leaks detected
- [ ] Audit logs are complete

### 4. Data Integrity

- [ ] User data is accurate
- [ ] No data corruption
- [ ] Backups are successful
- [ ] Database performance is stable
- [ ] Cache is consistent

## Incident Response

### If Critical Issues Arise

#### 1. Immediate Actions

- Assess severity and impact
- Determine if rollback is needed
- Communicate with stakeholders
- Begin incident response

#### 2. Rollback Decision

If issues are critical and cannot be quickly resolved:

- Execute rollback procedure (see runbook-rollback.md)
- Communicate with users
- Investigate root cause
- Plan fix and relaunch

#### 3. Continued Operation

If issues are non-critical:

- Document the issue
- Create fix in staging
- Test thoroughly
- Deploy fix to production
- Monitor for resolution

## Success Criteria

- [ ] Registration flow is working smoothly
- [ ] System performance is acceptable
- [ ] Error rates are within acceptable range
- [ ] User feedback is positive
- [ ] Support ticket volume is manageable
- [ ] No critical security issues
- [ ] Marketing metrics are on track

## Timeline

- **Pre-Launch Preparation**: 2 weeks
- **Final Testing**: 3 days
- **Launch Day**: 1 day
- **Post-Launch Monitoring**: 1 week
- **Stabilization Period**: 1 month

## Contacts

- **Technical Lead**: [Contact]
- **Product Manager**: [Contact]
- **DevOps Engineer**: [Contact]
- **Support Lead**: [Contact]
- **Marketing Lead**: [Contact]
- **Legal Counsel**: [Contact]

## Metrics to Track

### User Metrics

- New user registrations
- Active users (DAU/MAU)
- User retention rate
- Time to first value

### Performance Metrics

- Page load times
- API response times
- Database query times
- Cache hit rates
- Error rates

### Business Metrics

- DJ profile creations
- Event creations
- Booking inquiries
- Review submissions
- Premium subscriptions

## Notes

- Document all issues encountered during launch
- Update this runbook based on lessons learned
- Schedule post-launch review meeting
- Plan for iterative improvements
