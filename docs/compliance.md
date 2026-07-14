# Compliance Documentation

**⚠️ DRAFT STATUS** — This document is a draft and not yet finalized. The following must be implemented and linked before this can be considered final:

- Privacy policy page published at `/privacy` with footer link
- Data deletion API endpoint implemented (`DELETE /api/account/delete`)
- User rights access process implemented (data export, rectification, erasure)
- Data processing agreements executed with Supabase, Vercel, and Sentry
- Data Protection Officer or privacy contact route established

## GDPR Compliance

### Data Processing Principles

DJcovery processes personal data in accordance with GDPR Article 5:

1. **Lawfulness, fairness, and transparency**
   - Core account creation and authentication processed under contract performance (necessary to deliver the service), not consent
   - Optional features (e.g., marketing communications) processed only with explicit user consent, separate from account sign-up
   - Clear privacy policy explaining data usage
   - Transparent data collection practices

2. **Purpose limitation**
   - Data collected only for specified purposes:
     - User authentication and account management
     - DJ profile management and gig bookings
     - Event organization and booking inquiries
     - Analytics and service improvement

3. **Data minimization**
   - Only collect data necessary for service delivery
   - Avoid collecting unnecessary personal information

4. **Accuracy**
   - Users can update their profile information
   - Regular data validation checks
   - Error correction mechanisms

5. **Storage limitation**
   - Data retention periods defined below
   - Automatic deletion of expired data
   - User right to request deletion

6. **Integrity and confidentiality**
   - Encryption in transit (HTTPS/TLS)
   - Encryption at rest (Supabase managed)
   - Access controls and authentication
   - Regular security audits

### Legal Basis for Processing

- **User accounts / Authentication**: Contract performance (Article 6(1)(b))
- **Analytics**: Legitimate interest (Article 6(1)(f))
- **Marketing**: Consent (Article 6(1)(a))

### User Rights Under GDPR

**Status:** PENDING — Access process not yet implemented (data export, rectification, erasure requests)

Users have the right to:

1. **Access** (Article 15) - Request copy of personal data
2. **Rectification** (Article 16) - Correct inaccurate data
3. **Erasure** (Article 17) - Request data deletion ("right to be forgotten")
4. **Portability** (Article 20) - Receive data in machine-readable format
5. **Object** (Article 21) - Object to processing based on legitimate interest
6. **Restrict** (Article 18) - Limit processing in certain circumstances

## Data Retention Policy

### User Account Data

| Data Type                                      | Retention Period                 | Justification                                                                                 |
| ---------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------- |
| Account identifier + email (only)              | 2 years after account deletion   | Fraud prevention and defense of legal claims within the applicable limitation period (Sweden) |
| Remaining profile data (name, city, bio, etc.) | Deleted immediately, anonymized  | No further legal basis for retention once account is deleted                                  |
| Authentication logs                            | 1 year                           | Security auditing                                                                             |
| Session data                                   | 30 days                          | Security, session management                                                                  |
| Booking inquiries                              | 3 years after completion         | Legal compliance, dispute resolution                                                          |
| DJ profile data                                | 2 years after account deletion   | Legal compliance                                                                              |
| Media uploads                                  | Until account deletion + 30 days | Service delivery, user control                                                                |

### Analytics Data

| Data Type           | Retention Period | Justification       |
| ------------------- | ---------------- | ------------------- |
| Page views          | 13 months        | Service improvement |
| Error logs (Sentry) | 90 days          | Security, debugging |
| Performance metrics | 13 months        | Service improvement |

### Automatic Deletion

- Inactive accounts (no login for 2 years) are marked for deletion
- Users receive 30-day notice before deletion
- Users can reactivate account during notice period

## User Data Deletion Process

### User-Initiated Deletion

1. **Request Submission**
   - User submits deletion request via account settings
   - Confirmation email sent to user's registered email
   - Deletion processed without undue delay (GDPR Article 17)
   - 30-day optional cancellation window for user to reverse request

2. **Data Deletion Steps**
   - Mark user account as "deleted" in database
   - Remove user from all search results and directories
   - Delete user's media files from Supabase Storage
   - Anonymize booking inquiries (retain only for legal compliance)
   - Delete authentication tokens and sessions
   - Remove user from analytics (where possible)
   - Retain only legally required data (see "Right to be Forgotten" exceptions below)

3. **Verification**
   - Confirm deletion via email
   - Provide summary of deleted data
   - Information on data retained for legal compliance

### Right to be Forgotten (Article 17)

Exceptions where data may be retained:

- Legal obligations (tax records, transaction logs)
- Dispute resolution (booking inquiries, communications)
- Fraud prevention (suspicious activity logs)

### Data Deletion API Endpoint

**Status:** PENDING — Not yet implemented

**Planned Endpoint:** `DELETE /api/account/delete`

**Planned Requirements:**

- User must be authenticated
- Re-authentication required (password confirmation)
- Email confirmation sent before deletion
- 30-day optional cancellation window for user to reverse request

## Privacy Policy

### Required Sections

1. **Information We Collect**
   - Personal information (name, email, location)
   - Profile information (bio, genres, media)
   - Usage data (page views, interactions)
   - Device information (IP address, browser type)

2. **How We Use Your Information**
   - Provide and maintain the service
   - Process bookings and inquiries
   - Send notifications and updates
   - Improve and develop the service
   - Comply with legal obligations

3. **Data Sharing**
   - **Supabase** (data processor): Database hosting and authentication. Shared data categories: user profiles, authentication data, booking inquiries, media metadata. Legal basis: contract performance (Article 6(1)(b)) to deliver the service.
   - **Vercel** (data processor): Application deployment and hosting. Shared data categories: deployment logs, performance metrics, error reports. Legal basis: legitimate interest (Article 6(1)(f)) for service operation and security.
   - **Sentry** (data processor): Error tracking and performance monitoring. Shared data categories: error logs, stack traces, performance data. Legal basis: legitimate interest (Article 6(1)(f)) for service improvement and security.
   - Data is not sold to third parties
   - Data processing agreements: PENDING — to be executed with Supabase, Vercel, and Sentry (standard GDPR-compliant DPAs)

4. **Data Security**
   - Encryption in transit and at rest
   - Access controls and authentication
   - Regular security audits
   - Data breach notification procedures

5. **Your Rights**
   - Access, rectification, erasure
   - Portability, objection, restriction
   - Withdraw consent
   - Lodge complaint with supervisory authority

6. **Cookies and Tracking**
   - Essential cookies (authentication)
   - Analytics cookies (Vercel Analytics)
   - User can manage cookie preferences

7. **International Data Transfers**
   - **Supabase** (EU): Primary database and authentication data stored in EU region (Stockholm, Sweden). No international transfer required for core user data.
   - **Vercel** (US): Application deployment and hosting data transferred to US. Transfer mechanism: EU-US Data Privacy Framework (DPF) and Standard Contractual Clauses (SCCs). Processing regions: US (primary), EU (edge). Transfer impact assessment: Not required under DPF adequacy decision. Supplementary measures: Encryption in transit (TLS 1.3) and at rest.
   - **Sentry** (US): Error tracking and performance monitoring data transferred to US. Transfer mechanism: Standard Contractual Clauses (SCCs). Processing regions: US. Transfer impact assessment: Conducted; low-risk data (error logs, stack traces) with minimal personal information. Supplementary measures: Encryption in transit, data minimization (no personal identifiers in error reports where possible).

8. **Children's Privacy**
   - Minimum age: 18 years (adult-only product rule)
   - Policy basis: DJcovery is designed for adult users in the nightlife and entertainment industry; age restriction is a business decision to avoid complexities involving minors
   - No data collection from users under 18
   - Parental consent not applicable (service not available to minors)

9. **Changes to Privacy Policy**
   - Users notified of material changes
   - 30-day notice period for significant changes
   - Continued use constitutes acceptance

10. **Contact Information**
    - Email: support@djcovery.com (pending: verify inbox is monitored for privacy requests)
    - Data Protection Officer: [PENDING — to be appointed or designate privacy contact]
    - Supervisory Authority: IMY (Swedish authority) or local equivalent

### Privacy Policy Location

- **URL:** `/privacy` (PENDING — page to be created and published)
- **Link:** Footer of all pages (PENDING — to be added to footer component)
- **Last Updated:** [PENDING — date of publication]
- **Version:** 1.0 (draft)

## Data Breach Response

### Notification Requirements

**GDPR Article 33 (Supervisory Authority):**

- Notify supervisory authority within 72 hours of discovery, unless the breach is unlikely to result in a risk to individuals' rights and freedoms
- If notification is submitted after 72 hours, provide reasons for the delay
- Notification must include: nature of breach, categories of data, approximate number of affected individuals, likely consequences, and mitigation measures

**GDPR Article 34 (Affected Individuals):**

- Notify affected individuals without undue delay if the breach is likely to result in a high risk to their rights and freedoms
- Notification must include: nature of breach, categories of data concerned, likely consequences, measures taken to address the breach, and recommendations for mitigating potential harm
- No notification required if appropriate technical and organizational protection measures were applied (e.g., encryption) or immediate action rendered the data unintelligible

### Breach Assessment Criteria

1. **Likelihood of risk to rights and freedoms**
   - Types of data exposed (personal, sensitive)
   - Number of affected individuals
   - Accessibility of data to unauthorized parties

2. **Severity of potential impact**
   - Identity theft or fraud
   - Financial loss
   - Reputational damage
   - Discrimination

### Breach Notification Process

1. **Discovery**
   - Monitor security alerts
   - User reports
   - Third-party notifications

2. **Assessment**
   - Determine scope and impact
   - Classify severity (P0-P3)
   - Identify affected individuals

3. **Containment**
   - Stop ongoing breach
   - Secure systems
   - Preserve evidence

4. **Notification**
   - Supervisory authority (within 72 hours)
   - Affected individuals (if high risk)
   - Include: nature of breach, categories of data, likely consequences, mitigation measures

5. **Post-Incident**
   - Document lessons learned
   - Update security measures
   - Review compliance procedures

## Security Vulnerabilities

### Known Dependency Vulnerabilities (Last Audit: 2026-07-14)

#### @hono/node-server < 1.19.13 (Moderate)

- **Advisory:** GHSA-92pp-h63x-v22m
- **Issue:** Middleware bypass via repeated slashes in serveStatic
- **Current Version:** 1.19.14 (remediated via package.json override)
- **Dependency Chain:** prisma@7.8.0 → @prisma/dev@0.24.3 → @hono/node-server@1.19.14
- **Risk Assessment:** Low - Used only in Prisma development tooling, not in production runtime
- **Remediation Status:** **Remediated** - Fixed via package.json override to @hono/node-server@^1.19.13, resolving to 1.19.14
- **Workaround:** Not applicable (override applied)
- **Decision:** Override ensures safe version is used; monitor for Prisma update that bundles fixed version natively

#### postcss < 8.5.10 (Moderate)

- **Advisory:** GHSA-qx2v-qp2m-jg93
- **Issue:** XSS via Unescaped </style> in CSS Stringify Output
- **Current Versions:**
  - Direct: postcss@8.5.17 (safe)
  - Via Next.js: postcss@8.5.10 (remediated via package.json override)
- **Dependency Chain:** next@16.2.10 → postcss@8.5.10 (via override)
- **Risk Assessment:** Low - XSS vulnerability requires user-controlled CSS input, which is not used in application
- **Remediation Status:** **Remediated** - Fixed via package.json override (next.postcss: ^8.5.10), forcing safe version
- **Workaround:** Not applicable (override applied)
- **Decision:** Override ensures safe version is used; monitor for Next.js update that bundles fixed postcss version natively

### Risk Mitigation

- **No user-controlled CSS input** - PostCSS vulnerability not exploitable
- **@hono/node-server not in production** - Only used in Prisma dev tooling
- **Regular dependency updates** - Monitor for security patches from upstream maintainers
- **Security layering** - Application-level protections (CSP, input validation) reduce impact

### Monitoring

- Run `npm audit --audit-level=moderate` monthly
- Subscribe to security advisories for Next.js and Prisma
- Review Dependabot alerts in GitHub repository
- Update dependencies when patches are available without breaking changes

## Compliance Checklist

- [ ] Privacy policy created and published
- [ ] GDPR compliance documented
- [ ] Data retention policy defined
- [ ] User data deletion process implemented
- [ ] Data breach response plan documented
- [ ] Cookie consent mechanism (if using non-essential cookies)
- [ ] Data processing agreements with third parties
- [ ] User rights accessible from account settings
- [ ] Contact information for data protection inquiries
- [ ] Regular compliance reviews (annually)
- [x] Security vulnerabilities documented and monitored
