# Epic 005: Email & Notification System Enhancement

**Epic ID:** EPIC-005  
**Title:** Implement Resend Email Integration for Plan Reminders  
**Priority:** High  
**Status:** Not Started  
**Epic Owner:** Backend Team  
**Business Value:** Improved user engagement, multi-channel reminder system, better user retention

## Epic Summary

Integrate Resend email service to complement the existing browser notification system with email reminders, providing users with multiple touchpoints to encourage plan execution and maintain engagement with their learning journey.

## Business Justification

- **User Engagement:** Email reminders increase the likelihood of users following through on plans
- **Accessibility:** Users receive reminders even when not actively browsing
- **Retention:** Multi-channel approach improves long-term user engagement
- **Professional Communication:** Branded email templates enhance product perception

## User Stories

### Story 5.1: Resend Integration Setup

**As a** system administrator  
**I want** Resend email service properly configured  
**So that** the application can send reliable transactional emails

**Acceptance Criteria:**

- [ ] Install and configure Resend Node.js SDK
- [ ] Set up environment variables for Resend API key
- [ ] Create email service utility functions
- [ ] Implement error handling and retry logic
- [ ] Test email sending functionality in development environment
- [ ] Set up email delivery monitoring and logging

### Story 5.2: Plan Reminder Email Template

**As a** user with an active plan  
**I want** to receive well-designed email reminders  
**So that** I'm motivated to practice my planned behaviors

**Acceptance Criteria:**

- [ ] Create HTML email template matching OTP email styling
- [ ] Include user's current plan content (IF and THEN statements)
- [ ] Add encouraging motivational messaging based on mental model or bias type
- [ ] Ensure template is mobile-responsive
- [ ] Include LattixIQ branding and footer
- [ ] No external links in email (per requirement)
- [ ] Test email rendering across major email clients

### Story 5.3: Dual Notification System

**As a** user who enabled reminders  
**I want** to receive both browser and email notifications  
**So that** I have multiple opportunities to see and act on my reminders

**Acceptance Criteria:**

- [ ] Send email simultaneously with browser notification
- [ ] Integrate email sending into existing reminder cron job
- [ ] Handle email delivery failures gracefully
- [ ] Log both notification types for tracking
- [ ] Ensure no duplicate notifications if one method fails
- [ ] Respect user's timezone for email sending timing
- [ ] Allow users to opt out of email notifications independently

## Technical Details

### Implementation Approach

1. **Resend SDK Integration**
   ```bash
   npm install resend
   ```
2. **Email Template Creation**
   - Base template on existing OTP email styling
   - Use React Email components for better maintainability
   - Include dynamic content for plan details

3. **Service Integration**
   - Extend existing reminder cron job (/api/notifications/cron/route.ts)
   - Add email sending alongside browser notification logic
   - Implement proper error handling and fallbacks

### Email Template Structure

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Time to Practice Your Plan</title>
    <style>
      /* Reuse OTP email styles */
      body {
        font-family:
          -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        background-color: #f3f4f6;
        margin: 0;
        padding: 0;
      }
      /* ... additional styles ... */
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">🧠</div>
        <h1>LattixIQ</h1>
      </div>

      <p class="message">Hi there,</p>

      <p class="message">It's time to practice your plan:</p>

      <div class="plan-container">
        <div class="plan-content">
          <strong>IF:</strong> {{plan_trigger}}<br />
          <strong>THEN:</strong> {{plan_action}}
        </div>
      </div>

      <p class="message">{{encouraging_message}}</p>

      <div class="footer">
        <p>Your roadmap to a clearer mind.</p>
      </div>
    </div>
  </body>
</html>
```

### Environment Variables Required

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=notifications@lattixiq.com
```

### API Integration Points

- Modify `app/api/notifications/cron/route.ts`
- Add email utility functions in `lib/email/`
- Update notification logging system
- Extend user preferences for email notifications

## Dependencies

- Existing reminder cron job system
- User timezone utilities
- Notification logging infrastructure
- OTP email template styling

## Definition of Done

- [ ] Resend SDK installed and configured
- [ ] Email template created and tested across email clients
- [ ] Dual notification system (browser + email) working
- [ ] Email delivery integrated with existing cron job
- [ ] Error handling and logging implemented
- [ ] User can receive both notification types simultaneously
- [ ] Email template renders correctly on mobile devices
- [ ] Environment variables documented and configured

## Risk Assessment

**Medium Risk** - Adding external service dependency and email deliverability concerns

**Mitigation Strategies:**

- Implement comprehensive error handling
- Set up email delivery monitoring
- Have fallback to browser-only notifications if email fails
- Test email deliverability across major providers (Gmail, Outlook, etc.)
- Monitor bounce rates and spam complaints

## Estimated Effort

**Story Points:** 21  
**Development Time:** 3-4 days  
**Email Template Design:** 1 day  
**Testing & QA:** 2 days

## Acceptance Testing

### Manual Testing Scenarios

1. Enable reminders and verify both browser and email notifications arrive
2. Test email rendering in Gmail, Outlook, Apple Mail, Yahoo Mail
3. Test email on mobile devices (iOS, Android)
4. Verify email content includes correct plan details
5. Test email delivery during cron job execution
6. Verify encouraging messages match the content type (mental model vs bias)
7. Test error handling when Resend API is unavailable

### Automated Testing

- Unit tests for email template rendering
- Integration tests for Resend API calls
- E2E tests for complete notification flow
- Load testing for bulk email sending

## Email Deliverability Considerations

- Set up SPF, DKIM, and DMARC records for sending domain
- Monitor sender reputation
- Implement proper unsubscribe mechanisms
- Track bounce rates and spam complaints
- Use consistent from address and sender name

## Monitoring and Analytics

- Track email delivery rates
- Monitor email open rates (if pixel tracking is acceptable)
- Log email sending errors and retries
- Track user engagement with email reminders
- Monitor Resend API usage and costs

## Compliance and Privacy

- Ensure email sending complies with CAN-SPAM Act
- Implement proper unsubscribe functionality
- Include physical mailing address in email footer
- Document email data retention policies
- Ensure GDPR compliance for EU users
