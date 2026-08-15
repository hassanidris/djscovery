# Event-Anchored Reviews - Monitoring & Analytics Guide

## Overview

This guide covers monitoring and analytics for the event-anchored DJ reviews feature, including key metrics, alerts, and troubleshooting.

## Key Performance Metrics

### API Performance Metrics

#### POST /api/djs/[slug]/ratings
- **Target response time**: < 500ms (p95)
- **Target success rate**: > 99%
- **Key timing breakdown**:
  - `validate_fields`: < 50ms
  - `validate_rules`: < 200ms (DB queries)
  - `upsert`: < 100ms (DB write)
  - `post_effects`: < 150ms (side effects)

#### GET /api/djs/[slug]/ratings
- **Target response time**: < 300ms (p95)
- **Cache hit rate**: > 80%
- **Key timing breakdown**:
  - `cache_check`: < 10ms
  - `fetch_profile`: < 50ms
  - `fetch_ratings`: < 100ms (with indexes)
  - `cache_set`: < 20ms

### Database Performance Metrics

#### Query Performance
- **DjRating lookups**: < 50ms (with indexes)
- **Event attendance checks**: < 30ms
- **Event status checks**: < 30ms
- **DJ performance verification**: < 50ms

#### Index Usage
- `DjRating_userId_djProfileId_direct_unique`: High usage for direct reviews
- `DjRating_userId_djProfileId_eventId_event_unique`: High usage for event reviews
- `DjRating_eventId_idx`: Medium usage for event filtering
- `DjRating_reviewType_idx`: Medium usage for type filtering

### Cache Performance Metrics

#### Redis Cache
- **Hit rate**: > 80% overall
- **Hit rate by filter**:
  - `all`: > 85%
  - `direct`: > 90%
  - `event`: > 75%
  - `event:{id}`: > 70%
  - `gig`: > 80%
- **Cache size**: Monitor memory usage
- **Eviction rate**: Should be minimal

### Business Metrics

#### Review Submission Metrics
- **Total reviews per day**: Track volume
- **Review type distribution**:
  - Direct: ~60%
  - Event Attendee: ~30%
  - Event Organizer: ~10%
- **Success rate**: > 95%
- **Error rate breakdown**:
  - 401 (unauthorized): < 5%
  - 400 (validation): < 3%
  - 403 (business rules): < 2%
  - 500 (server errors): < 0.5%

#### Review Quality Metrics
- **Average review length**: 100-500 characters
- **Rating distribution**: Should be roughly normal
- **Review completion rate**: > 80% (started vs submitted)
- **Event review window compliance**: > 95% within 30 days

## Monitoring Setup

### Application Performance Monitoring (APM)

#### Vercel Analytics
- Enable for all API routes
- Monitor response times and error rates
- Set up custom dashboards for review endpoints

#### Custom Performance Tracking
The API routes already use `createTimer()` for performance tracking:

```typescript
const timer = createTimer("ratings_post");
timer.start("validate_fields");
// ... validation logic
timer.end("validate_fields");
timer.flush(); // Logs timing data
```

### Database Monitoring

#### Query Performance
- Enable slow query logging
- Monitor index usage with `pg_stat_user_indexes`
- Track query execution times

#### Connection Pool
- Monitor connection pool usage
- Set up alerts for high connection usage
- Ensure adequate pool size for concurrent requests

### Cache Monitoring

#### Redis Metrics
- Memory usage
- Hit/miss ratios
- Connection count
- Eviction rate
- Latency

#### Cache Key Patterns
- `dj_ratings:{slug}:{page}:{limit}:{filterKey}`
- Monitor key count and memory usage

## Alerting

### Critical Alerts

#### API Performance
- **POST response time p95 > 2000ms**: Immediate investigation
- **GET response time p95 > 1000ms**: Investigate within 1 hour
- **Error rate > 5%**: Immediate investigation
- **500 error rate > 1%**: Critical - investigate immediately

#### Database Performance
- **Slow query > 1s**: Investigate within 1 hour
- **Connection pool exhaustion**: Critical - investigate immediately
- **Index not being used**: Review query patterns

#### Cache Performance
- **Cache hit rate < 70%**: Investigate within 4 hours
- **Redis memory > 80%**: Scale or investigate
- **Cache eviction rate spike**: Investigate within 1 hour

### Warning Alerts

#### Business Metrics
- **Review submission rate drop > 50%**: Investigate within 4 hours
- **Error rate increase for specific validation**: Review validation rules
- **Review type distribution shift**: Monitor for abuse or bugs

#### System Health
- **Disk space > 80%**: Plan for expansion
- **CPU usage > 80%**: Monitor for scaling needs
- **Memory usage > 80%**: Monitor for memory leaks

## Logging

### Application Logs

#### Error Logging
Already implemented for key failure points:
- Reputation update failures
- Notification creation failures
- Email sending failures

#### Performance Logging
- API response times (via `createTimer`)
- Database query times
- Cache operation times

#### Business Logic Logging
- Review submission attempts
- Validation failures with reasons
- Review type auto-detection results

### Log Levels

#### ERROR
- Failed review submissions
- Database connection failures
- Cache failures
- Email/notification failures

#### WARN
- Slow queries (> 500ms)
- Cache misses
- Validation failures (non-critical)
- Business rule violations

#### INFO
- Successful review submissions
- Review type distribution
- Performance metrics
- Cache hit rates

#### DEBUG
- Detailed validation steps
- Query execution details
- Cache key patterns
- Business rule checks

## Troubleshooting

### Common Issues

#### Slow POST /api/djs/[slug]/ratings

**Symptoms**: Response time > 500ms

**Possible Causes**:
1. Slow database queries
2. Cache miss on profile lookup
3. Slow post-submit effects (email, notifications)
4. High database contention

**Troubleshooting Steps**:
1. Check `createTimer` breakdown
2. Review database query logs
3. Check cache hit rates
4. Monitor database connection pool
5. Review post-submit effects performance

**Solutions**:
- Add missing indexes
- Optimize slow queries
- Increase cache TTL
- Scale database resources
- Optimize post-submit effects

#### Low Cache Hit Rate

**Symptoms**: Cache hit rate < 70%

**Possible Causes**:
1. Cache keys not matching
2. Cache TTL too short
3. High cache eviction rate
4. Cache size too small

**Troubleshooting Steps**:
1. Review cache key patterns
2. Check cache TTL settings
3. Monitor cache eviction rate
4. Review cache memory usage

**Solutions**:
- Fix cache key generation
- Increase cache TTL
- Scale cache resources
- Review cache eviction policy

#### High Error Rate

**Symptoms**: Error rate > 5%

**Possible Causes**:
1. Validation rule changes
2. Database schema issues
3. Authentication problems
4. Business rule violations

**Troubleshooting Steps**:
1. Review error logs by type
2. Check recent deployments
3. Monitor validation failure patterns
4. Review authentication logs

**Solutions**:
- Fix validation rules
- Rollback problematic changes
- Fix authentication issues
- Update business rules

#### Database Connection Pool Exhaustion

**Symptoms**: Connection pool at capacity, slow queries

**Possible Causes**:
1. Too many concurrent requests
2. Connection leaks
3. Long-running queries
4. Insufficient pool size

**Troubleshooting Steps**:
1. Monitor connection pool usage
2. Check for connection leaks
3. Review long-running queries
4. Check pool configuration

**Solutions**:
- Increase pool size
- Fix connection leaks
- Optimize long-running queries
- Implement connection pooling best practices

## Analytics Dashboards

### Recommended Dashboards

#### API Performance Dashboard
- POST/GET response times (p50, p95, p99)
- Error rates by endpoint
- Request volume over time
- Status code distribution

#### Database Performance Dashboard
- Query execution times
- Index usage statistics
- Connection pool usage
- Slow query log

#### Cache Performance Dashboard
- Hit/miss ratios
- Memory usage
- Eviction rate
- Latency

#### Business Metrics Dashboard
- Review submission volume
- Review type distribution
- Success/error rates
- Average review length

### Custom Metrics

#### Review Quality Metrics
- Average review length by type
- Rating distribution by type
- Review completion rate
- Time to review after event

#### User Behavior Metrics
- Users who submit both direct and event reviews
- Repeat reviewers
- Review submission patterns by time of day
- Geographic distribution of reviewers

## Performance Optimization

### Database Optimization

#### Index Optimization
- Ensure all indexes are being used
- Remove unused indexes
- Consider composite indexes for common query patterns
- Monitor index bloat

#### Query Optimization
- Use `EXPLAIN ANALYZE` for slow queries
- Optimize JOIN operations
- Use appropriate data types
- Consider query caching

### Cache Optimization

#### Cache Strategy
- Use appropriate TTL values
- Implement cache warming for popular DJs
- Consider cache partitioning by review type
- Monitor cache eviction patterns

#### Cache Key Design
- Use consistent key patterns
- Include all relevant filter parameters
- Avoid key collisions
- Consider key hashing for long keys

### Application Optimization

#### Code Optimization
- Optimize validation logic
- Batch database operations where possible
- Use async operations effectively
- Implement request debouncing

#### Resource Optimization
- Implement rate limiting
- Use connection pooling
- Optimize memory usage
- Consider serverless scaling

## Capacity Planning

### Scaling Considerations

#### Database Scaling
- Monitor query performance
- Plan for read replicas
- Consider database sharding for large datasets
- Implement connection pooling

#### Cache Scaling
- Monitor memory usage
- Plan for cache clustering
- Consider cache partitioning
- Implement cache eviction policies

#### Application Scaling
- Monitor response times
- Plan for horizontal scaling
- Implement load balancing
- Consider CDN for static assets

### Load Testing

#### Test Scenarios
- Normal load: 100 requests/second
- Peak load: 500 requests/second
- Stress test: 1000 requests/second

#### Test Metrics
- Response times under load
- Error rates under load
- Database performance under load
- Cache performance under load

## Security Monitoring

### Security Metrics

#### Authentication
- Failed authentication attempts
- Unusual review submission patterns
- Rate limiting violations
- Suspicious user activity

#### Data Integrity
- Review manipulation attempts
- Duplicate submission attempts
- Invalid data patterns
- Schema violations

### Security Alerts

#### Critical Security Events
- Brute force authentication attempts
- SQL injection attempts
- Data exfiltration attempts
- Privilege escalation attempts

#### Security Warnings
- Unusual review patterns
- High error rates from specific users
- Rate limit violations
- Suspicious API usage patterns

## Reporting

### Regular Reports

#### Daily Reports
- API performance summary
- Error rate summary
- Review submission volume
- Cache performance summary

#### Weekly Reports
- Performance trends
- Error rate trends
- Business metric trends
- Capacity planning recommendations

#### Monthly Reports
- Performance analysis
- Capacity planning review
- Security review
- Optimization recommendations

### Ad-Hoc Reports

#### Incident Reports
- Timeline of events
- Root cause analysis
- Impact assessment
- Resolution steps
- Prevention measures

#### Performance Reports
- Performance analysis
- Bottleneck identification
- Optimization recommendations
- Implementation roadmap

## Support

### Escalation Procedures

#### Performance Issues
1. Monitor for 15 minutes
2. Check recent deployments
3. Review error logs
4. Escalate if unresolved

#### Critical Issues
1. Immediate investigation
2. Engage on-call engineer
3. Implement temporary fixes
4. Plan permanent resolution

### Documentation

#### Runbooks
- Performance troubleshooting runbook
- Database recovery runbook
- Cache recovery runbook
- Security incident runbook

#### Knowledge Base
- Common issues and solutions
- Performance optimization guide
- Monitoring best practices
- Alert configuration guide
