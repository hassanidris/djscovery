# SITE_MODE Migration Plan

This document audits current `PRE_LAUNCH_MODE` and `INDEXING_ENABLED` usage and provides a safe cutover plan to `SITE_MODE`.

## Current State

### PRE_LAUNCH_MODE Usage

**Purpose**: Controls pre-launch gate - masks platform behind /coming-soon in production

**Locations**:
1. `src/proxy.ts` (lines 5, 68)
   - Line 5: `const PRE_LAUNCH_MODE = process.env.PRE_LAUNCH_MODE === "true";`
   - Line 68: Used in pre-launch gate condition

2. `.github/workflows/ci.yml` (lines 151, 223, 330)
   - Set to `false` in all CI environments (test, e2e, visual-regression)

3. `.github/workflows/lighthouse-ci.yml` (line 33)
   - Set to `false` for Lighthouse CI

4. `docs/founding-djs-program-tdd.md`
   - Documents that PRE_LAUNCH_MODE will be replaced by SITE_MODE

### INDEXING_ENABLED Usage

**Purpose**: Controls SEO indexing - sets X-Robots-Tag header when disabled

**Locations**:
1. `src/lib/seo/indexing.ts` (line 1)
   - `export const indexingEnabled = process.env.INDEXING_ENABLED === "true";`

2. `src/proxy.ts` (line 136)
   - Used to set X-Robots-Tag header: `if (!indexingEnabled)`

3. `.github/workflows/ci.yml` (lines 150, 222, 329)
   - Set to `false` in all CI environments

4. `.github/workflows/lighthouse-ci.yml` (line 32)
   - Set to `true` for SEO audit validation

5. `docs/founding-djs-decisions.md`
   - Documents that INDEXING_ENABLED will be subsumed by SITE_MODE

## Proposed SITE_MODE Design

Based on `docs/founding-djs-decisions.md`, SITE_MODE should support:

**Values**:
- `"founding"` - Pre-launch, only founding members can access
- `"public"` - Full public access, SEO enabled
- `"maintenance"` - Site down for maintenance

**Derived Behavior**:
- Access control: derived from SITE_MODE
- SEO indexing: derived from SITE_MODE (only `"public"` enables indexing)

## Migration Plan

### Phase 1: Introduce SITE_MODE (Non-Breaking)

**Goal**: Add SITE_MODE alongside existing flags, make it authoritative but keep fallbacks

**Changes**:

1. **Update `src/lib/seo/indexing.ts`**:
```typescript
// New: SITE_MODE-based indexing
const siteMode = process.env.SITE_MODE as "founding" | "public" | "maintenance" | undefined;
export const indexingEnabled = siteMode === "public";

// Fallback to INDEXING_ENABLED for backward compatibility
if (process.env.INDEXING_ENABLED !== undefined) {
  export const indexingEnabled = process.env.INDEXING_ENABLED === "true";
}
```

2. **Update `src/proxy.ts`**:
```typescript
// New: SITE_MODE-based access control
const siteMode = process.env.SITE_MODE as "founding" | "public" | "maintenance" | undefined;

// Fallback to PRE_LAUNCH_MODE for backward compatibility
const isPreLaunch = siteMode === "founding" ||
  (siteMode === undefined && process.env.PRE_LAUNCH_MODE === "true");

// Update pre-launch gate condition
if (isPreLaunch && isProduction && !isAlwaysPublic(request.nextUrl.pathname)) {
  // ... existing logic
}
```

3. **Update CI workflows**:
   - Add `SITE_MODE: "public"` to all CI environments
   - Keep existing `PRE_LAUNCH_MODE: false` and `INDEXING_ENABLED: false` as fallbacks

**Verification**:
- Run CI to ensure no breaking changes
- Test locally with SITE_MODE set
- Test locally with SITE_MODE unset (fallback path)

### Phase 2: Update CI to Use SITE_MODE

**Goal**: Migrate CI workflows to use SITE_MODE exclusively

**Changes**:

1. **`.github/workflows/ci.yml`**:
   - Replace `PRE_LAUNCH_MODE: false` with `SITE_MODE: "public"`
   - Replace `INDEXING_ENABLED: false` with `SITE_MODE: "public"`
   - Remove old env vars after verification

2. **`.github/workflows/lighthouse-ci.yml`**:
   - Replace `INDEXING_ENABLED: true` with `SITE_MODE: "public"`
   - Remove `PRE_LAUNCH_MODE: false` after verification

**Verification**:
- Run CI to ensure SEO audit passes with SITE_MODE
- Confirm X-Robots-Tag header is set correctly

### Phase 3: Remove Legacy Flags

**Goal**: Remove PRE_LAUNCH_MODE and INDEXING_ENABLED entirely

**Changes**:

1. **Update `src/lib/seo/indexing.ts`**:
```typescript
const siteMode = process.env.SITE_MODE as "founding" | "public" | "maintenance" | undefined;
export const indexingEnabled = siteMode === "public";
```

2. **Update `src/proxy.ts`**:
```typescript
const siteMode = process.env.SITE_MODE as "founding" | "public" | "maintenance" | undefined;
const isPreLaunch = siteMode === "founding";
```

3. **Remove from CI workflows**:
   - Delete all `PRE_LAUNCH_MODE` references
   - Delete all `INDEXING_ENABLED` references

4. **Update documentation**:
   - Remove references from `docs/founding-djs-program-tdd.md`
   - Update `docs/founding-djs-decisions.md` to reflect completed migration

**Verification**:
- Run full CI suite
- Test production deployment with SITE_MODE
- Verify pre-launch gate works with `SITE_MODE=founding`
- Verify SEO indexing works with `SITE_MODE=public`

## Rollback Plan

If issues arise during migration:

1. **Phase 1 rollback**: Remove SITE_MODE, keep existing flags
2. **Phase 2 rollback**: Revert CI to use PRE_LAUNCH_MODE/INDEXING_ENABLED
3. **Phase 3 rollback**: Re-add fallback logic to code, restore old env vars

## Testing Checklist

- [ ] Local test with SITE_MODE="founding" - verify pre-launch gate
- [ ] Local test with SITE_MODE="public" - verify full access
- [ ] Local test with SITE_MODE unset - verify fallback to old flags
- [ ] CI test with SITE_MODE="public" - verify all jobs pass
- [ ] Lighthouse CI with SITE_MODE="public" - verify SEO audit passes
- [ ] Production deployment test with SITE_MODE="founding"
- [ ] Production deployment test with SITE_MODE="public"
- [ ] Verify X-Robots-Tag header in production
- [ ] Verify /coming-soon redirect in founding mode

## Environment Variable Reference

**Before Migration**:
```bash
PRE_LAUNCH_MODE=true|false
INDEXING_ENABLED=true|false
```

**After Migration**:
```bash
SITE_MODE=founding|public|maintenance
```

**Mapping**:
- `PRE_LAUNCH_MODE=true` → `SITE_MODE=founding`
- `PRE_LAUNCH_MODE=false` + `INDEXING_ENABLED=true` → `SITE_MODE=public`
- `PRE_LAUNCH_MODE=false` + `INDEXING_ENABLED=false` → `SITE_MODE=maintenance` (or use founding for safety)
