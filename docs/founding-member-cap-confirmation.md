# Founding Member Cap Confirmation

**Status**: Confirmed
**Decision Date**: 2026-10-04
**Source**: `docs/founding-djs-decisions.md` (Item M2)

---

## Decision

**Founding Member Cap: 100**

The founding DJ program is capped at 100 members to create scarcity and badge value. Once the cap is reached, new applicants will be placed on a waitlist or considered for "cohort 2" (future founding member wave).

---

## Rationale

1. **Scarcity**: A limited cap creates exclusivity and makes the founding badge more valuable
2. **Badge Value**: With only 100 founding DJs, the badge becomes a meaningful differentiator
3. **Community Quality**: A manageable cohort allows for closer engagement and feedback
4. **Future Cohorts**: Cap creates natural segmentation for future founding member waves

---

## Implementation Requirements

### 1. Config Value

Add a config constant for the cap:

**Location**: `src/config/founding.ts` (new file)

```typescript
export const FOUNDING_MEMBER_CAP = 100;
```

### 2. Cap Enforcement

**Application Submission**:
- Check current count of `ACTIVE` founding members before accepting new applications
- If cap reached, reject with waitlist message
- Consider adding `FoundingApplication.status = "WAITLISTED"` for cap-exceeded applications

**Admin Approval**:
- Before approving an application, check if cap would be exceeded
- If cap would be exceeded, show warning to admin
- Allow admin to override (in case of revocations creating space)

### 3. Display on Landing Page

**Counter Component**:
- Show "X/100 spots filled" on founding landing page
- Update in real-time or periodically (cached)
- When cap reached, change CTA to "Join Waitlist"

**Copy Update**:
- Landing page FAQ already mentions cap of 100
- Consider adding urgency messaging when approaching cap (e.g., "Only 15 spots remaining")

### 4. Waitlist Handling

**Waitlist Status**:
- Add `WAITLISTED` status to `FoundingApplication` enum
- When cap reached, new applications default to `WAITLISTED`
- Notify waitlisted applicants when space opens (revocation/expiration)

**Cohort 2**:
- Future consideration for second founding member wave
- Would require new cap and potentially different rewards
- Not in MVP scope

---

## Database Considerations

### Query for Current Count

```typescript
const activeCount = await prisma.foundingMember.count({
  where: { status: "ACTIVE" }
});
```

### Cap Check on Approval

```typescript
const activeCount = await prisma.foundingMember.count({
  where: { status: "ACTIVE" }
});

if (activeCount >= FOUNDING_MEMBER_CAP) {
  return { error: "Founding member cap reached. Application placed on waitlist." };
}
```

### Revocation Creates Space

When a founding member is revoked or expires, their slot becomes available:
- Update cap check to account for pending revocations
- Consider notifying next waitlisted applicant

---

## Monitoring

### Metrics to Track

- Current active founding members
- Pending applications (under review)
- Waitlisted applications
- Revocations (to understand churn)

### Alerts

- Alert when approaching cap (e.g., 90% full)
- Alert when cap reached
- Alert when space opens (revocation)

---

## Open Questions

1. **Cap Increase**: Should cap be increaseable via config, or hard-coded at 100?
   - Recommendation: Hard-coded for MVP, make configurable post-MVP

2. **Waitlist Priority**: How to prioritize waitlisted applicants when space opens?
   - Recommendation: First-come, first-served based on application timestamp

3. **Revocation Handling**: Should revocations immediately notify waitlisted applicants?
   - Recommendation: Yes, automated email notification

4. **Cohort 2 Timing**: When to consider second founding member wave?
   - Recommendation: After public launch + 6 months of stable operation

---

## Related Documentation

- `docs/founding-djs-decisions.md` - Item M2
- `docs/founding-djs-landing-copy.md` - FAQ section mentions cap
- `docs/founding-djs-program-tdd.md` - Schema and implementation details
