# Founding DJs Deployment Strategy

**Decision Date**: 2026-10-04
**Strategy**: Option 1 - Founding program only in production

---

## Environment Configuration

### Staging Environment
- **SITE_MODE**: `public`
- **Behavior**: Full public access, no founding program
- **Purpose**: Test all public-facing features (DJ profiles, events, directory, etc.)
- **Founding Program**: Disabled

### Production Environment
- **SITE_MODE**: `founding` (initially) → `public` (after launch)
- **Behavior**: 
  - Initially: Pre-launch gate with founding program active
  - After launch: Full public access with founding rewards activated
- **Purpose**: Real founding member applications and rewards
- **Founding Program**: Enabled (cap: 100)

---

## Rationale

1. **Exclusivity**: Founding numbers (FDJ-001 to FDJ-100) are truly exclusive to production
2. **No Slot Consumption**: Staging cannot accidentally consume founding member slots
3. **Clean Separation**: Staging tests public features; production tests founding-specific features
4. **Flexibility**: Can temporarily switch staging to founding mode for testing if needed

---

## Temporary Testing in Staging

If you need to test founding-specific features in staging:

1. **Switch staging to founding mode**:
   ```bash
   # Vercel environment variable
   SITE_MODE=founding
   ```

2. **Test the workflow**:
   - Application form submission
   - Admin review process
   - Founding badge display
   - Reward activation

3. **Switch back to public mode**:
   ```bash
   SITE_MODE=public
   ```

4. **Clean up test data**:
   - Delete test applications
   - Delete test founding members
   - Reset founding number counter if needed

**Note**: When testing in staging, use a separate database or ensure test data is clearly marked to avoid confusion with production data.

---

## Environment Variable Reference

| Environment | SITE_MODE | Founding Program | Cap |
|------------|-----------|------------------|-----|
| Staging | `public` | Disabled | N/A |
| Production | `founding` → `public` | Enabled | 100 |

---

## Implementation Notes

### SITE_MODE Behavior

**founding mode**:
- Pre-launch gate active (redirects to /coming-soon for non-founders)
- Founding application form accessible
- Admin can review and approve applications
- Founding badge displayed on approved profiles
- Rewards pending (activate on SITE_MODE=public switch)

**public mode**:
- Full public access (no pre-launch gate)
- Founding application form disabled (or shows "program closed")
- Founding badge displayed on founding member profiles
- Rewards active (12mo premium, 12mo priority, homepage feature)

### Cap Enforcement

The founding member cap (100) is enforced in production only:
- Staging with SITE_MODE=public: No cap enforcement (founding disabled)
- Production with SITE_MODE=founding: Cap enforced (100 max)
- Production with SITE_MODE=public: Cap still enforced (no new founding members)

### Database Considerations

**Staging database**:
- Can have test founding members if temporarily switched to founding mode
- Should be cleaned up before switching back to public mode
- Founding numbers in staging are not counted toward production cap

**Production database**:
- Real founding members (FDJ-001 to FDJ-100)
- Cap enforced at 100
- Founding numbers are permanent and never reused

---

## Rollback Considerations

If issues arise in production with the founding program:

1. **Switch to maintenance mode**:
   ```bash
   SITE_MODE=maintenance
   ```
   - Shows coming-soon page to all users
   - Disables new applications
   - Existing founding members retain access

2. **Switch to public mode early**:
   ```bash
   SITE_MODE=public
   ```
   - Opens platform to all users
   - Stops new founding applications
   - Existing founding members keep their badges and rewards

3. **Pause applications only**:
   - Keep SITE_MODE=founding
   - Disable application form via feature flag
   - Continue reviewing pending applications

---

## Monitoring

### Key Metrics

- **Production**: Active founding members count (should not exceed 100)
- **Production**: Pending applications count
- **Production**: Waitlisted applications count (when cap reached)
- **Staging**: SITE_MODE value (should be `public` unless testing)

### Alerts

- Alert when production founding members reach 90% of cap (90/100)
- Alert when production founding members reach cap (100/100)
- Alert if staging SITE_MODE is `founding` for more than 24 hours (forgot to switch back)

---

## Related Documentation

- `docs/site-mode-migration-plan.md` - SITE_MODE implementation
- `docs/founding-member-cap-confirmation.md` - Cap details
- `docs/founding-djs-decisions.md` - Program decisions
