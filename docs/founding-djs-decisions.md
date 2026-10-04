# Founding DJs Program — Decisions Log

**Created:** 2026-10-04
**Status:** All decisions locked
**Supersedes conflicting sections of:** `docs/founding-djs-program-tdd.md`

---

## Part A — Architecture Decisions (10 questions)

| #   | Question                                     | Decision                                                                                                                                                                                             | TDD section affected                                                                                |
| --- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| A1  | Token storage                                | **Hashed** — SHA-256 hash in DB (`tokenHash` field), raw token shown once at creation, hash-then-lookup.                                                                                             | Fix §8.1 schema: replace `token String` with `tokenHash String`. Same for `emailVerificationToken`. |
| A2  | Account-linking scope                        | **Mismatch warning only** — require applicant to sign in with the same email they applied with. Show clear mismatch warning + sign-out/retry option. Defer full secondary-email linking to post-MVP. | Simplifies §10.2; remove secondary-email recommendation from MVP.                                   |
| A3  | Private beta access                          | **FoundingMember middleware exemption** — keep `SITE_MODE=founding`; middleware checks `FoundingMember.status=ACTIVE` to grant access to dashboards/discovery for founding members only.             | Fills gap in §4.3 / §23.1; middleware needs FoundingMember check.                                   |
| A4  | Reward activation                            | **Cron** — extend existing Vercel Cron infra (already has `/api/cron/complete-events` in `vercel.json`).                                                                                             | Confirms §15.4; add cron entries to `vercel.json`.                                                  |
| A5  | Founding-number on rejection/revocation      | **Retire forever** — gaps allowed, no reuse. Numbers stay unique and permanent.                                                                                                                      | Fills gap in §15.1 / §8.1; no reassignment logic needed.                                            |
| A6  | Dead referral fields                         | **Keep** `referralCode` + `totalReferrals` on `FoundingMember`, nullable/zeroed, for forward-compat with post-MVP referral system.                                                                   | Confirms §8.1 / §16.1.                                                                              |
| A7  | Email verification of account-less applicant | **Custom token on `FoundingApplication`** — applicant has no Supabase account yet; this is not a Supabase auth flow.                                                                                 | Confirms §2.1 / §8.1.                                                                               |
| A8  | Existing-user applying                       | **Reject with message** — if email already has a DjProfile, reject the application with "You're already on the platform." No dual-status.                                                            | Fills gap in §10.3; add check in application submission.                                            |
| A9  | Premium expiry mechanics                     | **Timestamp on `DjProfile`** — add `premiumUntil DateTime?` to `DjProfile`. Cron checks `plan=PREMIUM && premiumUntil < now` → flip to FREE. `FoundingMember` counters become audit-only.            | Replaces §15.4 counter approach; add field to §8.1 DjProfile.                                       |
| A10 | `AdminActionLog` in MVP                      | **Defer** — TDD marks it "Future." Use `FoundingApplicationStatusLog` (B3) for founding-specific audit.                                                                                              | Confirms §19.14.                                                                                    |

---

## Part B — Cross-Cutting Decisions (25 items)

### Best Practice

| #   | Item                        | Decision                                                                                                     | Action                                                                                                                                       |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | GDPR / right-to-erasure     | **EU applicants in scope** — add `deletedAt` soft-delete to `FoundingApplication` + define retention policy. | Add `deletedAt DateTime?` to FoundingApplication model. Define retention: applications retained 2 years after completion, then soft-deleted. |
| B2  | Bot protection              | **Add Cloudflare Turnstile** to application form + server-side URL validation on portfolio links.            | Add Turnstile widget to ApplicationForm component; validate token server-side; validate portfolio URLs for SSRF.                             |
| B3  | Status-transition audit log | **Add `FoundingApplicationStatusLog`** (status, changedBy, note, timestamp). Lightweight, founding-specific. | New model in Prisma schema. Created on every status change.                                                                                  |
| B4  | Partial unique index        | **Auto-folded** — raw SQL migration for "email unique within PENDING/APPROVED" per existing pattern.         | Follow pattern in `prisma/migrations/manual_add_dj_rating_event_support.sql`.                                                                |

### Marketing

| #   | Item                           | Decision                                                                                                                                                   | Action                                                                                             |
| --- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| M1  | Eligibility criteria           | **Loose criteria + subjective vetting** — publish "active DJ with a portfolio and social presence" on landing page; admin vets subjectively with a rubric. | Draft landing copy; create admin rubric doc.                                                       |
| M2  | Founding member cap            | **Cap at 100** — create scarcity and badge value. After cap → waitlist or "cohort 2."                                                                      | Add `foundingMemberCap` config (value: 100); implement waitlist status when cap reached.           |
| M3  | Non-DJ waitlist                | **Add waitlist capture** — simple email-capture on founding/coming-soon page for organizers and fans.                                                      | New `WaitlistEntry` model (email, role interest, createdAt); add capture form to coming-soon page. |
| M4  | Social share after application | **Add to MVP** — optional "I applied to be a founding DJ" share step post-submission.                                                                      | Add share component to ApplicationSuccess page.                                                    |
| M5  | UTM tracking                   | **Auto-folded** — add `utmSource`, `utmMedium`, `utmCampaign` (nullable strings) to `FoundingApplication`.                                                 | Add fields to model; capture from URL params on landing page.                                      |
| M6  | Nurture email sequence         | **Define cadence** — day 3 "we're reviewing," day 10 "founding DJ spotlight," day 21 "decision soon."                                                      | 3 nurture emails + cron triggers; add to email template list.                                      |

### Business Logic

| #   | Item                          | Decision                                                                                                | Action                                                                                                           |
| --- | ----------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| G1  | Reward start point            | **1 year from launch** — premium and priority ranking run for 12 months from `SITE_MODE=public` switch. | Update reward durations: 12 months premium, 12 months priority (was 3mo/6mo). Homepage feature: 1 month rotated. |
| G2  | Homepage feature collision    | **Rotated 1 month each** — weekly rotation among active founding members within their feature window.   | Implement rotation logic in homepage query; track `homepageFeaturedUntil` per member.                            |
| G3  | Reapplication after rejection | **Reapply after 30 days** — creates a new `FoundingApplication` row.                                    | Add 30-day cooldown check on application submission; query for rejected applications by email.                   |
| G4  | Invitation expiry             | **14 days** — instead of TDD's 7. Admin can still regenerate.                                           | Update `InvitationToken.expiresAt` to 14 days from generation.                                                   |
| G5  | Existing-user application     | **Reject with message** (same as A8).                                                                   | Check `DjProfile` existence by email before accepting application.                                               |
| G6  | Premium content on expiry     | **Soft-cap** — keep existing media visible, block new uploads beyond FREE limit.                        | Update `getMediaLimit` check: if existing count > FREE limit, allow viewing but block new uploads.               |

### UX

| #   | Item                        | Decision                                                                                                    | Action                                                                                             |
| --- | --------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| U1  | Save-and-resume             | **Email-based resume link** — persist partial application by email; send a resume link.                     | New `PartialApplication` model or status on `FoundingApplication`; resume via token link.          |
| U2  | Email verification order    | **Parallel with review** — admin can start vetting immediately; email confirms ownership before invitation. | Remove EMAIL_VERIFIED as a prerequisite for UNDER_REVIEW; admin sees both verified and unverified. |
| U3  | Applicant status page       | **Add `/founding-djs/status`** — applicants enter email to see their application stage.                     | New public page; query by email; show status timeline.                                             |
| U4  | Account-linking mismatch UX | **Simplified by A2** — mismatch warning + sign-out/retry only. No complex linking UI needed.                | Simple warning screen with "sign out and try again" CTA.                                           |
| U5  | "What happens next" SLA     | **Auto-folded** — state "decisions within 2 weeks" on success page.                                         | Add to ApplicationSuccess component copy.                                                          |

### UI

| #   | Item                       | Decision                                                                                                                                                                                     | Action                                                                                           |
| --- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| I1  | FoundingBadge visual       | **Hero chip + tooltip** — badge chip in profile hero next to stage name, tooltip "Founding DJ #FDJ-007", distinct gold/accent color, shows founding number. Independent from verified badge. | New `FoundingBadge` component; place in DjProfile hero; gold accent color.                       |
| I2  | Founding vs verified badge | **Independent of plan** — founding badge is permanent regardless of premium status. Verified badge still gated by plan. Two separate trust signals.                                          | Do NOT gate founding badge via `plan-features.ts`; render based on `isFoundingMember` flag only. |
| I3  | Landing page copy          | **I draft copy** — draft landing page copy and structure based on rewards + loose criteria. User reviews and edits.                                                                          | Content drafting step added to Phase 2.                                                          |
| I4  | Admin table reuse audit    | **Audit in Phase 0** — inspect existing admin table components before Phase 3 to confirm reuse feasibility.                                                                                  | Phase 0 task: read admin component code, document reusable patterns.                             |

### Code

| #   | Item                     | Decision                                                                                                                             | Action                                                                                           |
| --- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| C1  | Route structure          | **Keep flat** — add `/founding-djs/*` and `/admin/founding/*` as plain directories. No route-group refactor.                         | Override TDD §6.1; use `src/app/founding-djs/` and `src/app/admin/founding/`.                    |
| C2  | Code layers              | **Follow existing pattern** — `src/lib/validation/founding-*.ts` + `src/lib/actions/founding-*.ts`. No new schemas/services layers.  | Override TDD §20.1; do NOT create `src/lib/schemas/` or `src/lib/services/`.                     |
| C3  | Validation directory     | **Consolidate to `validation/`** (singular) — move 5 files from `validations/` into `validation/`.                                   | Phase 0 task: move files, update imports, verify build.                                          |
| C4  | SEO gating               | **SITE_MODE subsumes INDEXING_ENABLED** — one mechanism controls both access and SEO.                                                | Remove `INDEXING_ENABLED` usage; derive indexing from SITE_MODE in middleware.                   |
| C5  | Premium expiry model     | **Timestamp on DjProfile** (same as A9) — `premiumUntil DateTime?` field; cron checks and flips.                                     | Add field; cron job checks `plan=PREMIUM && premiumUntil < now`.                                 |
| C6  | BecomeDjForm integration | **Extend createDjProfile** — add optional `foundingApplicationId` param; prefill from application; create FoundingMember on success. | Modify `createDjProfile` in `src/lib/actions/profile.ts` to accept founding context.             |
| C7  | Vercel Cron auth         | **Auto-folded** — standardize a cron-auth helper; add CRON_SECRET env var.                                                           | Create `src/lib/cron-auth.ts`; verify existing complete-events endpoint; add to new cron routes. |

---

## Summary of TDD Overrides

The following TDD sections are **superseded** by decisions in this log:

| TDD Section                           | Override | Decision                                           |
| ------------------------------------- | -------- | -------------------------------------------------- |
| §8.1 `token String`                   | A1       | Use `tokenHash String` (hashed)                    |
| §8.1 `emailVerificationToken String?` | A1       | Use `emailVerificationTokenHash String?`           |
| §10.2 account linking                 | A2       | Mismatch warning only, no secondary-email          |
| §15.1 reward durations (3mo/6mo)      | G1       | 12 months premium + 12 months priority from launch |
| §15.4 counter-based expiry            | A9/C5    | Timestamp-based (`premiumUntil` on DjProfile)      |
| §11.1 7-day invitation expiry         | G4       | 14 days                                            |
| §6.1 route groups                     | C1       | Keep flat structure                                |
| §20.1 schemas/services folders        | C2       | Use existing validation/ + actions/ pattern        |
| §18.1 INDEXING_ENABLED                | C4       | Subsumed by SITE_MODE                              |
| §2.1 verify-before-review order       | U2       | Parallel verification and review                   |
| §10.3 existing-user behavior          | A8       | Reject with message                                |
| §19.14 AdminActionLog                 | A10/B3   | Defer; use FoundingApplicationStatusLog instead    |

---

## Open Items

None — all decisions locked.
