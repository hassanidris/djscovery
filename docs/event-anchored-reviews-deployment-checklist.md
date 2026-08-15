# Event-Anchored Reviews - Deployment Checklist

## Pre-Deployment Checklist

### 1. Code Quality ✅
- [ ] All tests pass: `npm run test:ci`
- [ ] TypeScript compilation succeeds: `npx tsc --noEmit`
- [ ] ESLint passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors or warnings in build output

### 2. Database Preparation ✅
- [ ] Database backup created
- [ ] Schema changes tested in staging
- [ ] Migration scripts tested
- [ ] Rollback scripts tested
- [ ] Database indexes verified
- [ ] RLS policies updated

### 3. Performance Testing ✅
- [ ] API response times within targets
- [ ] Database query performance acceptable
- [ ] Cache hit rates > 80%
- [ ] Load testing completed
- [ ] Memory usage acceptable
- [ ] No memory leaks detected

### 4. Security Review ✅
- [ ] Authentication working correctly
- [ ] Authorization rules enforced
- [ ] Input validation comprehensive
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] CSRF protection enabled

### 5. Documentation ✅
- [ ] Technical documentation updated
- [ ] User guide created
- [ ] Monitoring guide created
- [ ] Deployment guide updated
- [ ] Runbooks created
- [ ] API documentation updated

### 6. Monitoring Setup ✅
- [ ] Performance monitoring configured
- [ ] Error tracking configured
- [ ] Alerts configured
- [ ] Dashboards created
- [ ] Log aggregation setup
- [ ] Metrics collection enabled

## Deployment Steps

### Phase 1: Database Migration

#### 1.1 Create Database Backup
```bash
# Create backup before any changes
pg_dump $DATABASE_URL > backup_before_event_reviews_$(date +%Y%m%d_%H%M%S).sql
```

#### 1.2 Apply Schema Changes
```bash
# Sync schema (adds eventId, reviewType, indexes)
npx prisma db push --accept-data-loss
```

#### 1.3 Check for Duplicates
```bash
# Check for direct review duplicates
DATABASE_URL="your_db_url" psql -c "
  SELECT 'DIRECT' as review_type, \"userId\", \"djProfileId\", COUNT(*) as count
  FROM \"DjRating\"
  WHERE \"eventId\" IS NULL
  GROUP BY \"userId\", \"djProfileId\"
  HAVING COUNT(*) > 1;
"

# Check for event-anchored review duplicates
DATABASE_URL="your_db_url" psql -c "
  SELECT 'EVENT' as review_type, \"userId\", \"djProfileId\", \"eventId\", COUNT(*) as count
  FROM \"DjRating\"
  WHERE \"eventId\" IS NOT NULL
  GROUP BY \"userId\", \"djProfileId\", \"eventId\"
  HAVING COUNT(*) > 1;
"
```

#### 1.4 Apply Partial Unique Indexes
```bash
# Apply partial unique indexes (must be done immediately after step 1.2)
DATABASE_URL="your_db_url" npx prisma db execute --file=prisma/migrations/manual_add_dj_rating_event_support.sql
```

#### 1.5 Regenerate Prisma Client
```bash
npx prisma generate
```

#### 1.6 Apply RLS Policies
```bash
DATABASE_URL="your_db_url" npx prisma db execute --file=prisma/rls-policies.sql
```

#### 1.7 Verify Schema Changes
```sql
-- Check enum exists
SELECT 1 FROM pg_type WHERE typname = 'DjRatingType';

-- Check partial unique indexes exist
SELECT indexname FROM pg_indexes WHERE tablename = 'DjRating' AND indexname LIKE '%unique%';

-- Check columns exist
SELECT column_name FROM information_schema.columns WHERE table_name = 'DjRating' AND column_name IN ('eventId', 'reviewType');
```

### Phase 2: Data Migration

#### 2.1 Dry Run Data Migration
```bash
npm run migrate:dj-rating-direct-type
```

#### 2.2 Apply Data Migration
```bash
npm run migrate:dj-rating-direct-type:apply
```

#### 2.3 Verify Data Migration
```bash
npm run migrate:dj-rating-direct-type
```

#### 2.4 Check Data Integrity
```sql
-- Check for inconsistent reviewType/eventId
SELECT COUNT(*) FROM "DjRating"
WHERE "reviewType" = 'DIRECT' AND "eventId" IS NOT NULL;

SELECT COUNT(*) FROM "DjRating"
WHERE "reviewType" IN ('EVENT_ATTENDEE', 'EVENT_ORGANIZER') AND "eventId" IS NULL;

-- Both should return 0
```

### Phase 3: Application Deployment

#### 3.1 Deploy Code Changes
```bash
# Commit changes
git add .
git commit -m "feat: implement event-anchored DJ reviews

- Add eventId and reviewType to DjRating model
- Implement event-anchored review validation
- Add UI components for event context
- Create migration scripts
- Add comprehensive tests
- Update documentation"

# Push to main branch
git push origin feature/event-anchored-dj-reviews-phase-3

# Create pull request and merge to main
# Or merge directly if approved
```

#### 3.2 Vercel Deployment
- [ ] Deploy to preview environment first
- [ ] Test in preview environment
- [ ] Deploy to production
- [ ] Verify production deployment

#### 3.3 Verify Deployment
```bash
# Test API endpoints
curl -X GET https://your-domain.com/api/djs/test-dj/ratings
curl -X POST https://your-domain.com/api/djs/test-dj/ratings \
  -H "Content-Type: application/json" \
  -d '{"djProfileId":1,"rating":5,"review":"Test review"}'

# Check application logs
# Verify no errors in logs
# Check performance metrics
```

### Phase 4: Post-Deployment Verification

#### 4.1 Smoke Tests
- [ ] DJ profile pages load correctly
- [ ] Review modal opens and closes
- [ ] Direct review submission works
- [ ] Event review submission works
- [ ] Review type tabs display correctly
- [ ] Event context shows properly

#### 4.2 Integration Tests
- [ ] Run integration tests in production-like environment
- [ ] Test authentication flows
- [ ] Test validation rules
- [ ] Test business rules
- [ ] Test error handling

#### 4.3 Performance Verification
- [ ] API response times within targets
- [ ] Database query performance acceptable
- [ ] Cache hit rates > 80%
- [ ] No memory leaks
- [ ] No performance degradation

#### 4.4 Monitoring Verification
- [ ] Metrics collection working
- [ ] Alerts firing correctly
- [ ] Dashboards displaying data
- [ ] Logs being collected
- [ ] Error tracking working

## Rollback Procedures

### Option 1: Code Rollback (Keeps DB Changes)

#### When to Use
- UI/API has issues but DB schema is fine
- Quick rollback needed
- DB changes are backward compatible

#### Steps
```bash
# Revert to previous commit
git revert <commit-hash>
git push origin main

# Vercel will auto-deploy
# Verify deployment
# Test critical functionality
```

### Option 2: Full Rollback (Reverts DB Changes)

#### When to Use
- DB schema causes issues
- Data migration problems
- Critical database errors

#### Steps
```bash
# 1. Revert code
git revert <commit-hash>
git push origin main

# 2. Rollback data migration
npm run migrate:dj-rating-direct-type:rollback

# 3. Drop new indexes (optional, they're harmless)
DATABASE_URL="your_db_url" psql -c "
  DROP INDEX IF EXISTS \"DjRating_userId_djProfileId_direct_unique\";
  DROP INDEX IF EXISTS \"DjRating_userId_djProfileId_eventId_event_unique\";
  DROP INDEX IF EXISTS \"DjRating_eventId_idx\";
  DROP INDEX IF EXISTS \"DjRating_reviewType_idx\";
"

# 4. Verify rollback
# Test application functionality
# Monitor for issues
```

## Post-Deployment Tasks

### 1. Monitoring (24-48 Hours)
- [ ] Monitor API error rates
- [ ] Monitor response times
- [ ] Monitor cache hit rates
- [ ] Monitor database performance
- [ ] Review error logs
- [ ] Check for unusual patterns

### 2. User Feedback
- [ ] Monitor user support tickets
- [ ] Review user feedback
- [ ] Check for reported issues
- [ ] Gather usage statistics
- [ ] Review review quality

### 3. Performance Optimization
- [ ] Review performance metrics
- [ ] Optimize slow queries
- [ ] Adjust cache TTL if needed
- [ ] Scale resources if needed
- [ ] Implement additional monitoring

### 4. Documentation Updates
- [ ] Document any issues found
- [ ] Update troubleshooting guides
- [ ] Document any workarounds
- [ ] Update runbooks if needed
- [ ] Share lessons learned

## Success Criteria

### Functional Requirements
- [ ] Direct reviews work correctly
- [ ] Event-anchored reviews work correctly
- [ ] Review type auto-detection works
- [ ] Attendance verification works
- [ ] Review window enforcement works
- [ ] UI displays correctly

### Performance Requirements
- [ ] API response times < 500ms (p95)
- [ ] Cache hit rates > 80%
- [ ] Database queries < 200ms
- [ ] No memory leaks
- [ ] No performance degradation

### Security Requirements
- [ ] Authentication enforced
- [ ] Authorization rules enforced
- [ ] Input validation comprehensive
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities

### Reliability Requirements
- [ ] Error rate < 1%
- [ ] Uptime > 99.9%
- [ ] No data loss
- [ ] No corruption
- [ ] Consistent behavior

## Communication Plan

### Pre-Deployment
- [ ] Notify team of deployment
- [ ] Share deployment timeline
- [ ] Communicate potential impact
- [ ] Provide rollback plan

### During Deployment
- [ ] Update team on progress
- [ ] Communicate any issues
- [ ] Share timeline updates
- [ ] Coordinate with stakeholders

### Post-Deployment
- [ ] Notify team of completion
- [ ] Share deployment results
- [ ] Communicate any issues
- [ ] Provide next steps

## Emergency Contacts

### Primary Contacts
- **Tech Lead**: [Name, Contact]
- **Database Admin**: [Name, Contact]
- **DevOps Engineer**: [Name, Contact]
- **Product Manager**: [Name, Contact]

### Escalation Path
1. **Level 1**: On-call engineer
2. **Level 2**: Tech lead
3. **Level 3**: Engineering manager
4. **Level 4**: CTO

## Appendix

### Useful Commands

#### Database Commands
```bash
# Check database size
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size(current_database()));"

# Check table sizes
psql $DATABASE_URL -c "
  SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

# Check index usage
psql $DATABASE_URL -c "
  SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
  ORDER BY idx_scan DESC;
"
```

#### Application Commands
```bash
# Check application logs
vercel logs --follow

# Check deployment status
vercel ls

# Rollback deployment
vercel rollback [deployment-url]

# Check environment variables
vercel env ls
```

#### Monitoring Commands
```bash
# Check Redis stats
redis-cli INFO

# Check Redis memory usage
redis-cli INFO memory

# Check Redis keys
redis-cli KEYS "dj_ratings:*" | wc -l
```

### Troubleshooting Tips

#### Common Issues
1. **Migration fails**: Check database connection, permissions, and existing data
2. **Tests fail**: Check environment variables, database state, and mock configurations
3. **Performance issues**: Check indexes, query plans, and cache configuration
4. **Authentication issues**: Check Supabase configuration and token handling

#### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check Prisma queries
DEBUG=prisma:query npm run dev

# Check cache operations
DEBUG=cache npm run dev
```

## Sign-Off

### Pre-Deployment Sign-Off
- [ ] **Developer**: [Name, Date]
- [ ] **Tech Lead**: [Name, Date]
- [ ] **QA Engineer**: [Name, Date]
- [ ] **Product Manager**: [Name, Date]

### Post-Deployment Sign-Off
- [ ] **Developer**: [Name, Date]
- [ ] **Tech Lead**: [Name, Date]
- [ ] **DevOps Engineer**: [Name, Date]
- [ ] **Product Manager**: [Name, Date]

---

**Last Updated**: 2026-08-15
**Version**: 1.0
**Status**: Ready for Deployment
