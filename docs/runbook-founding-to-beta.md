# Runbook: Founding → Beta Transition

## Overview

This runbook outlines the steps to transition the Djscovery platform from Founding Member phase to Beta phase.

## Prerequisites

- All founding members have been onboarded
- Founding member rewards system is active
- Beta invitation system is ready
- Database backups are current
- Staging environment is tested and stable

## Pre-Transition Checklist

### 1. Data Verification

- [ ] Verify all founding members have completed onboarding
- [ ] Check founding member status in database
- [ ] Verify reward points are correctly calculated
- [ ] Review founding member feedback/surveys

### 2. System Health

- [ ] Run full test suite: `npm run test:ci`
- [ ] Run e2e tests: `npm run e2e`
- [ ] Check database performance metrics
- [ ] Verify Redis cache is operational
- [ ] Check Supabase Auth is functioning

### 3. Configuration

- [ ] Update environment variables for beta phase
- [ ] Configure beta invitation limits
- [ ] Set up beta user onboarding flow
- [ ] Configure beta-specific features (if any)

### 4. Communications

- [ ] Prepare announcement email for founding members
- [ ] Prepare beta invitation email templates
- [ ] Update landing page messaging
- [ ] Prepare social media announcements

## Transition Steps

### Step 1: Database Changes

#### 1.1 Update Application Status

```sql
-- Mark founding phase as complete
UPDATE "SystemConfig" SET value = 'BETA' WHERE key = 'PHASE';

-- Set site mode to beta
INSERT INTO "SystemConfig" (key, value)
VALUES ('SITE_MODE', 'BETA')
ON CONFLICT (key) DO UPDATE SET value = 'BETA';

-- Archive founding member data if needed
-- (Consider creating a backup table for founding applications)
```

#### 1.2 Update User Roles

```sql
-- Ensure all founding members have FOUNDING_MEMBER role
-- This should already be set, but verify:
SELECT u.id, u.email, ur.role
FROM "User" u
JOIN "UserRole" ur ON ur."userId" = u.id
WHERE ur.role = 'FOUNDING_MEMBER';
```

#### 1.3 Configure Beta Limits

```sql
-- Set beta user limit (e.g., 500 users)
INSERT INTO "SystemConfig" (key, value)
VALUES ('BETA_USER_LIMIT', '500')
ON CONFLICT (key) DO UPDATE SET value = '500';
```

### Step 2: Application Configuration

#### 2.1 Update Environment Variables

```bash
# .env.production
NEXT_PUBLIC_APP_ENV=beta
NEXT_PUBLIC_PHASE=BETA
NEXT_PUBLIC_SITE_MODE=BETA
BETA_INVITATION_ENABLED=true
BETA_MAX_USERS=500
```

#### 2.2 Deploy Configuration

```bash
# Deploy to production
git checkout main
git pull
npm ci
npm run build
npm run start
```

### Step 3: Enable Beta Features

#### 3.1 Enable Beta Registration

- Update registration flow to accept beta invitations
- Enable beta invitation validation
- Configure beta user onboarding emails

#### 3.2 Update Homepage

- Update hero messaging for beta phase
- Highlight founding members (if desired)
- Add "Join Beta" CTA

#### 3.3 Configure Admin Dashboard

- Add beta user management section
- Set up beta analytics tracking
- Configure beta user onboarding monitoring

### Step 4: Send Communications

#### 4.1 Founding Member Announcement

```bash
# Use email service to send announcement
# Template: docs/email-templates/founding-to-beta-announcement.md
```

#### 4.2 Beta Invitations

- Send initial batch of beta invitations
- Monitor invitation acceptance rate
- Adjust invitation strategy as needed

### Step 5: Monitoring

#### 5.1 Set Up Alerts

- Monitor new user registrations
- Track beta invitation acceptance
- Monitor system performance
- Set up error rate alerts

#### 5.2 Daily Checks

- Check beta user count vs limit
- Review system logs for errors
- Monitor database performance
- Check cache hit rates

## Post-Transition Verification

### 1. Functional Testing

- [ ] Test new user registration with beta invitation
- [ ] Test beta invitation redemption flow
- [ ] Verify founding member features still work
- [ ] Test admin beta user management

### 2. Data Integrity

- [ ] Verify founding member data is intact
- [ ] Check beta user data is being stored correctly
- [ ] Verify reward points are still accurate
- [ ] Review database performance

### 3. Performance

- [ ] Check page load times
- [ ] Monitor API response times
- [ ] Review database query performance
- [ ] Check cache effectiveness

## Rollback Procedure

If critical issues arise, rollback to founding phase:

### 1. Immediate Rollback

```bash
# Revert environment variables
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_ENV=founding
BETA_INVITATION_ENABLED=false

# Redeploy previous version
git revert <commit-hash>
npm run build
npm run start
```

### 2. Data Rollback

```sql
-- Update phase back to founding
UPDATE "SystemConfig" SET value = 'FOUNDING' WHERE key = 'PHASE';

-- Revert site mode to founding
UPDATE "SystemConfig" SET value = 'FOUNDING' WHERE key = 'SITE_MODE';

-- Disable beta registrations
UPDATE "SystemConfig" SET value = 'false' WHERE key = 'BETA_INVITATION_ENABLED';
```

### 3. Communication

- Send apology email to beta users
- Explain the issue and timeline for fix
- Provide timeline for beta relaunch

## Success Criteria

- [ ] Beta registration flow is working
- [ ] Founding member features are intact
- [ ] System performance is acceptable
- [ ] Error rates are within normal range
- [ ] Beta user acceptance rate is > 50%

## Timeline

- **Preparation**: 1 week
- **Transition**: 1 day
- **Monitoring**: 1 week
- **Stabilization**: 2 weeks

## Contacts

- **Technical Lead**: [Contact]
- **Product Manager**: [Contact]
- **DevOps Engineer**: [Contact]
- **Support Lead**: [Contact]

## Notes

- Document any issues encountered during transition
- Update this runbook based on lessons learned
- Schedule post-transition review meeting
