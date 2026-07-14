# Compliance Documentation

## GDPR Compliance

### Data Processing Principles

DJcovery processes personal data in accordance with GDPR Article 5:

1. **Lawfulness, fairness, and transparency**
   - User consent obtained via sign-up process
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

- **User accounts**: Consent (Article 6(1)(a))
- **Authentication**: Contract performance (Article 6(1)(b))
- **Analytics**: Legitimate interest (Article 6(1)(f))
- **Marketing**: Consent (Article 6(1)(a))

### User Rights Under GDPR

Users have the right to:
1. **Access** (Article 15) - Request copy of personal data
2. **Rectification** (Article 16) - Correct inaccurate data
3. **Erasure** (Article 17) - Request data deletion ("right to be forgotten")
4. **Portability** (Article 20) - Receive data in machine-readable format
5. **Object** (Article 21) - Object to processing based on legitimate interest
6. **Restrict** (Article 18) - Limit processing in certain circumstances

## Data Retention Policy

### User Account Data

| Data Type | Retention Period | Justification |
|-----------|------------------|---------------|
| User profile (name, email, city) | 2 years after account deletion | Legal compliance, fraud prevention |
| Authentication logs | 1 year | Security auditing |
| Session data | 30 days | Security, session management |
| Booking inquiries | 3 years after completion | Legal compliance, dispute resolution |
| DJ profile data | 2 years after account deletion | Legal compliance |
| Media uploads | Until account deletion + 30 days | Service delivery, user control |

### Analytics Data

| Data Type | Retention Period | Justification |
|-----------|------------------|---------------|
| Page views | 13 months | Service improvement |
| Error logs (Sentry) | 90 days | Security, debugging |
| Performance metrics | 13 months | Service improvement |

### Automatic Deletion

- Inactive accounts (no login for 2 years) are marked for deletion
- Users receive 30-day notice before deletion
- Users can reactivate account during notice period

## User Data Deletion Process

### User-Initiated Deletion

1. **Request Submission**
   - User submits deletion request via account settings
   - Confirmation email sent to user's registered email
   - 30-day grace period for cancellation

2. **Data Deletion Steps**
   - Mark user account as "deleted" in database
   - Remove user from all search results and directories
   - Delete user's media files from Supabase Storage
   - Anonymize booking inquiries (retain only for legal compliance)
   - Delete authentication tokens and sessions
   - Remove user from analytics (where possible)

3. **Verification**
   - Confirm deletion via email
   - Provide summary of deleted data
   - Information on data retained for legal compliance

### Right to be Forgotten (Article 17)

Exceptions where data may be retained:
- Legal obligations (tax records, transaction logs)
- Dispute resolution (booking inquiries, communications)
- Fraud prevention (suspicious activity logs)
- Public interest (deleted DJ profiles may show as "removed")

### Data Deletion API Endpoint

**Endpoint:** `DELETE /api/account/delete`

**Requirements:**
- User must be authenticated
- Re-authentication required (password confirmation)
- Email confirmation sent before deletion
- 30-day grace period for cancellation

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
   - Shared with: Supabase (database hosting), Vercel (deployment), Sentry (error tracking)
   - Not sold to third parties
   - Shared only with user consent or legal requirement

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
   - Data stored in EU (Supabase EU region)
   - US-based services (Vercel, Sentry) with GDPR-compliant data processing agreements

8. **Children's Privacy**
   - Minimum age: 18 years (Swedish law)
   - No data collection from users under 18
   - Parental consent not applicable (adult-only service)

9. **Changes to Privacy Policy**
   - Users notified of material changes
   - 30-day notice period for significant changes
   - Continued use constitutes acceptance

10. **Contact Information**
    - Email: support@djcovery.com
    - Data Protection Officer: [DPO contact if applicable]
    - Supervisory Authority: IMY (Swedish authority) or local equivalent

### Privacy Policy Location

- **URL:** `/privacy` (to be created)
- **Link:** Footer of all pages
- **Last Updated:** [Date]
- **Version:** 1.0

## Data Breach Response

### Notification Requirements

Under GDPR Article 33:
- Notify supervisory authority within 72 hours of discovery
- Notify affected individuals without undue delay if high risk

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
