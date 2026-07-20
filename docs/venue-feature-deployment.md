# Venue Map and Autocomplete Feature - Deployment Guide

## Environment Variables

Add the following to your `.env.local` and Vercel environment variables:

```bash
# Mapbox API Token (required for geocoding and autocomplete)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

### Getting a Mapbox Token

1. Go to [Mapbox Account](https://account.mapbox.com/)
2. Sign up or log in
3. Create a new access token
4. Add the token to your environment variables

**Note:** Mapbox free tier includes 100,000 API calls/month, which should be sufficient for initial usage.

## Deployment Checklist

### 1. Database Changes
- ✅ Prisma schema updated with Venue model
- ✅ DjVenue model updated with latitude/longitude fields
- ✅ City model updated with venues relation
- ✅ Run: `npx prisma db push`
- ✅ Run: `npx prisma generate`
- ✅ Run RLS policies: `DATABASE_URL="..." npx prisma db execute --file=prisma/rls-policies.sql`

### 2. Seed Venues (Optional)
- Run: `npx tsx prisma/seed-venues.ts`
- This seeds 30+ popular venues from major music cities

### 3. Build Verification
- Run: `npm run build`
- Verify no build errors
- Check for TypeScript errors

### 4. Testing
- Run unit tests: `npm run test`
- Run integration tests: `npm run test:integration`
- Test autocomplete manually on DJ profile page
- Test map toggle on public DJ profile

### 5. Vercel Deployment
- Push changes to `dev` branch (staging)
- Verify staging deployment
- Test autocomplete and map features on staging
- Merge to `main` branch (production)
- Verify production deployment

## Monitoring

### Key Metrics to Monitor

1. **Mapbox API Usage**
   - Monitor API call count in Mapbox dashboard
   - Set up alerts for approaching limits
   - Free tier: 100,000 calls/month

2. **Autocomplete API Performance**
   - Response time (should be < 500ms)
   - Error rate (should be < 1%)
   - Rate limit hits (indicates abuse or high usage)

3. **Geocoding Cache Hit Rate**
   - Monitor cache effectiveness
   - High cache hit rate = good performance
   - Low cache hit rate = may need to optimize

4. **Venue Database Growth**
   - Monitor Venue table size
   - Track popularity metrics
   - Identify most-used venues

### Logging

The following events should be logged:

- Autocomplete API errors
- Geocoding failures
- Rate limit violations
- Venue creation events

### Alerts

Set up alerts for:

- Mapbox API usage > 80% of limit
- Autocomplete API error rate > 5%
- Geocoding failure rate > 10%

## Post-Deployment Tasks

1. **Monitor for 24-48 hours**
   - Watch for errors in logs
   - Check Mapbox API usage
   - Monitor performance metrics

2. **Gather User Feedback**
   - Ask DJs about autocomplete experience
   - Check if map displays correctly
   - Identify any UX issues

3. **Optimize if Needed**
   - Adjust rate limits if needed
   - Add more popular venues to seed
   - Tune cache TTL values

## Rollback Plan

If issues arise after deployment:

1. **Revert database changes**
   - Remove Venue model from schema
   - Remove latitude/longitude from DjVenue
   - Run: `npx prisma db push`

2. **Revert code changes**
   - Rollback to previous commit
   - Redeploy to Vercel

3. **Disable Mapbox**
   - Remove NEXT_PUBLIC_MAPBOX_TOKEN
   - Autocomplete will fall back to local DB only

## Troubleshooting

### Autocomplete Not Working
- Check Mapbox token is set
- Verify token has correct permissions
- Check browser console for errors
- Verify API route is accessible

### Map Not Displaying
- Check Leaflet CSS is loaded
- Verify venue coordinates exist
- Check browser console for errors
- Ensure map container has height

### Geocoding Failing
- Check Mapbox API status
- Verify token is valid
- Check rate limits
- Review error logs

### Performance Issues
- Check cache hit rate
- Verify rate limiting is working
- Monitor API response times
- Consider adding more cached venues
