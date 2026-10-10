# Runbook: Rollback Procedures

## Overview

This runbook outlines the procedures for rolling back the Djscovery platform to a previous stable state in case of critical issues.

## When to Rollback

Rollback should be considered when:

1. **Critical Security Issues**: Data breach, unauthorized access, security vulnerability
2. **Data Corruption**: Database corruption, data loss, integrity issues
3. **System Failure**: Complete outage, critical functionality broken
4. **Performance Degradation**: Severe performance issues affecting all users
5. **Data Privacy Issues**: PII exposure, compliance violations

## Pre-Rollback Checklist

- [ ] Identify the issue and its impact
- [ ] Determine the rollback target (previous commit/version)
- [ ] Notify stakeholders of planned rollback
- [ ] Create a backup of current state (if possible)
- [ ] Estimate rollback time
- [ ] Prepare communication for users

## Rollback Procedures

### Type 1: Code Rollback (Application Issues)

#### When to Use

- Broken deployment
- Critical bugs in new release
- Performance regression
- Feature regression

#### Steps

1. **Identify Target Version**

```bash
# View recent commits
git log --oneline -20

# Identify the last known good commit
# Example: abc1234 - Last stable commit
```

2. **Stop Current Deployment**

```bash
# Stop the application
pm2 stop djscovery
# or
systemctl stop djscovery
```

3. **Rollback Code**

```bash
# Checkout the stable commit
git checkout abc1234

# Or revert the bad commit
git revert <bad-commit-hash>

# Rebuild the application
npm ci
npm run build
```

4. **Restart Application**

```bash
# Start the application
pm2 start djscovery
# or
systemctl start djscovery

# Verify it's running
pm2 status
# or
systemctl status djscovery
```

5. **Verify Rollback**

- Check application health endpoint
- Test critical user flows
- Verify database connectivity
- Check error logs

6. **Communicate**

- Notify stakeholders of successful rollback
- Send communication to affected users
- Update status page (if applicable)

### Type 2: Database Rollback (Data Issues)

#### When to Use

- Data corruption
- Accidental data deletion
- Incorrect data migration
- Schema issues

#### Steps

1. **Assess Data Damage**

```sql
-- Identify affected tables
SELECT table_name, table_rows
FROM information_schema.tables
WHERE table_schema = 'public';

-- Check for data integrity issues
-- (Custom queries based on issue)
```

2. **Stop Application Writes**

```bash
# Stop the application to prevent writes during database restore
pm2 stop djscovery
# or if using systemd:
systemctl stop djscovery

# For Vercel deployments, use Vercel's maintenance mode:
# vercel domains add <maintenance-domain> --yes
# Then update DNS to point to maintenance page
```

3. **Restore from Backup**

```bash
# Identify the appropriate backup
# Backups should be named with timestamps
# Example: backup-2024-01-15-10-00.sql

# Create a new empty database for restore
createdb $DATABASE_URL_RESTORE

# Restore the backup to the new database
pg_restore -d $DATABASE_URL_RESTORE backup-2024-01-15-10-00.sql

# Or use psql for plain SQL backups
psql $DATABASE_URL_RESTORE < backup-2024-01-15-10-00.sql
```

4. **Verify Restored Database**

```sql
-- Connect to the restored database
psql $DATABASE_URL_RESTORE

-- Check row counts
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "DjProfile";
SELECT COUNT(*) FROM "Event";

-- Verify critical data
-- (Custom queries based on issue)

-- Verify schema integrity
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

5. **Switch Application to Restored Database**

```bash
# Only after validation succeeds, update the application to use the restored database
# Update environment variable to point to restored database
export DATABASE_URL=$DATABASE_URL_RESTORE

# Or update the application configuration file
# (e.g., .env.production, Vercel environment variables)
```

6. **Restart Application**

```bash
# Start the application
pm2 start djscovery
# or if using systemd:
systemctl start djscovery

# For Vercel deployments, disable maintenance mode:
# vercel domains remove <maintenance-domain> --yes
# Then restore DNS to point to production
```

7. **Verify Functionality**

- Test authentication
- Test data retrieval
- Test data creation
- Check error logs

### Type 3: Configuration Rollback (Config Issues)

#### When to Use

- Incorrect environment variables
- Misconfigured services
- API key issues
- Third-party service issues

#### Steps

1. **Identify Problematic Configuration**

```bash
# Review recent changes to .env files
git diff .env.production

# Check environment variable history
# (If using a config management system)
```

2. **Restore Previous Configuration**

```bash
# Restore from git
git checkout HEAD~1 .env.production

# Or manually edit to previous values
nano .env.production
```

3. **Restart Application**

```bash
# Restart to apply new configuration
pm2 restart djscovery
```

4. **Verify Configuration**

- Check application logs
- Test affected features
- Verify third-party service connections

### Type 4: Full System Rollback (Complete Failure)

#### When to Use

- Complete system failure
- Multiple concurrent issues
- Cannot identify root cause quickly
- Time-critical situation

#### Steps

1. **Immediate Actions**

```bash
# Stop all services
pm2 stop all

# For Vercel deployments, enable maintenance mode:
# vercel domains add <maintenance-domain> --yes
# Then update DNS to point to maintenance page

# For other deployments, configure web server to show maintenance page
# (e.g., Nginx: update location block to return 503 with maintenance page)
```

2. **Assess Situation**

- Review logs for errors
- Check system metrics
- Identify affected components
- Determine rollback scope

3. **Execute Rollback**

- Follow Type 1 (Code) if code is the issue
- Follow Type 2 (Database) if data is the issue
- Follow Type 3 (Config) if config is the issue
- Execute multiple types if needed

4. **Verify System**

- Test all critical paths
- Check all integrations
- Verify data integrity
- Monitor system metrics

5. **Restore Service**

```bash
# For Vercel deployments, disable maintenance mode:
# vercel domains remove <maintenance-domain> --yes
# Then restore DNS to point to production

# For other deployments, disable maintenance page
# (e.g., Nginx: revert location block to normal configuration)

# Restart services
pm2 start all
```

## Post-Rollback Actions

### 1. Investigation

- Document the issue
- Identify root cause
- Review rollback process
- Document lessons learned

### 2. Fix Development

- Create fix in development
- Test thoroughly in staging
- Review with team
- Plan deployment

### 3. Communication

- Notify stakeholders of rollback
- Communicate with affected users
- Provide timeline for fix
- Update status page

### 4. Monitoring

- Increased monitoring for 24-48 hours
- Check for recurring issues
- Monitor system performance
- Review error logs

### 5. Prevention

- Update testing procedures
- Add regression tests
- Improve deployment process
- Update runbooks

## Rollback Testing

### Test Rollback Regularly

- Schedule quarterly rollback drills
- Test rollback procedures in staging
- Verify backup integrity
- Train team on rollback process

### Test Checklist

- [ ] Code rollback tested
- [ ] Database rollback tested
- [ ] Configuration rollback tested
- [ ] Full system rollback tested
- [ ] Team trained on procedures

## Rollback Decision Tree

```
Issue Detected
    |
    v
Is it critical?
    |
    +-- No --> Monitor and fix in next release
    |
    +-- Yes --> Can it be fixed quickly (< 30 min)?
                  |
                  +-- Yes --> Fix and deploy hotfix
                  |
                  +-- No --> Rollback
                            |
                            v
What type of issue?
    |
    +-- Code --> Type 1: Code Rollback
    |
    +-- Data --> Type 2: Database Rollback
    |
    +-- Config --> Type 3: Configuration Rollback
    |
    +-- Multiple/Unknown --> Type 4: Full System Rollback
```

## Emergency Contacts

- **Technical Lead**: [Contact] - [Phone]
- **DevOps Engineer**: [Contact] - [Phone]
- **Database Administrator**: [Contact] - [Phone]
- **Product Manager**: [Contact] - [Phone]
- **Support Lead**: [Contact] - [Phone]

## Rollback Time Estimates

- **Type 1 (Code)**: 10-15 minutes
- **Type 2 (Database)**: 30-60 minutes (depends on data size)
- **Type 3 (Config)**: 5-10 minutes
- **Type 4 (Full System)**: 60-120 minutes

## Notes

- Always create a backup before rollback
- Document every step during rollback
- Communicate frequently with stakeholders
- Test thoroughly after rollback
- Update runbooks based on lessons learned
- Schedule post-incident review
