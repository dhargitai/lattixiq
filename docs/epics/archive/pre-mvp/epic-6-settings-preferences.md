# Epic 6: Settings & User Preferences (MVP)

## Epic Overview

**Epic Name:** Settings & User Preferences - MVP
**Epic ID:** EPIC-6
**Priority:** High (P1)
**Status:** Done
**Target Release:** MVP 1.0

## Epic Description

### Business Context

The Settings page provides users with essential account management capabilities for the MVP release. This simplified implementation focuses on the core features users need: viewing account information, managing notifications, accessing billing, and logging out.

### User Problem

Users need a simple, centralized location to:

- View their account email and login method
- Access billing/subscription management
- Control notification preferences
- Log out of their account

### Solution Overview

A clean, minimal Settings screen that provides only the essential account management features. The implementation follows the prototype design exactly and defers advanced features to post-MVP releases.

## Success Metrics

### Primary KPIs

- Settings page load time: <200ms
- Successful navigation to billing/pricing: 100% success rate
- Notification preference saves: 100% success rate
- Zero critical bugs in settings functionality

### Secondary Metrics

- User engagement with settings: Track page views
- Notification opt-in rate: >70% of users
- Support tickets related to settings: <5%

## User Stories

### Story 6.1: Core Settings Screen - MVP

**Priority:** P0 - Must Have
**Size:** 3 points

As a user, I want to access a simple settings screen so that I can view my account info and manage basic preferences.

**Acceptance Criteria:**

1. Settings screen accessible via navigation
2. Clean layout matching prototype design (prototypes/settings.html)
3. Four main sections: Account, Billing, Notifications, Logout
4. Responsive design for mobile and desktop
5. Consistent with app's shadcn/ui New York design system

### Story 6.2: Account Information Display

**Priority:** P0 - Must Have  
**Size:** 2 points

As a user, I want to see my account email and login method so that I know which account I'm using.

**Acceptance Criteria:**

1. Display user's email address
2. Show login method (Email or Google)
3. Read-only display (no editing in MVP)
4. Properly formatted and styled per prototype

### Story 6.3: Billing Section

**Priority:** P0 - Must Have
**Size:** 2 points

As a user, I want to access my billing information so that I can manage my subscription.

**Acceptance Criteria:**

1. Show current plan status (Free or Premium)
2. If Premium: Link to Stripe customer portal (external)
3. If Free: Link to internal /pricing page
4. Clear visual distinction between plan types
5. Plan badge styling per prototype

### Story 6.4: Notification Preferences

**Priority:** P0 - Must Have
**Size:** 3 points

As a user, I want to control my notification settings so that I receive reminders when I want them.

**Acceptance Criteria:**

1. Master toggle for all notifications
2. Daily reminder time selector
3. Settings persist across sessions
4. Visual feedback on save
5. Match prototype toggle and time selector design

### Story 6.5: Logout Functionality

**Priority:** P0 - Must Have
**Size:** 1 point

As a user, I want to log out of my account so that I can secure my session.

**Acceptance Criteria:**

1. Clear logout button at bottom of settings
2. Red border styling per prototype
3. Confirms logout action
4. Redirects to login page after logout
5. Clears all session data

## Technical Requirements

### Frontend Components

- Settings page: `/app/(app)/settings/page.tsx`
- Settings components: `/components/settings/`
- Reuse existing shadcn/ui components

### Backend Requirements

- User preferences API endpoint (notification settings only)
- Integration with Supabase Auth for user data
- Stripe customer portal URL generation (future)

### Data Model (Simplified)

```typescript
interface UserPreferences {
  userId: string;
  notifications: {
    enabled: boolean;
    dailyReminderTime: string; // "HH:mm" format
  };
}

interface UserAccount {
  email: string;
  provider: "email" | "google";
  subscription: {
    status: "free" | "premium";
    stripeCustomerId?: string;
  };
}
```

### Security Considerations

- Require authentication for settings access
- Secure logout with session cleanup
- HTTPS only for all operations

## Dependencies

### Internal Dependencies

- Authentication system (Supabase Auth)
- Navigation components
- shadcn/ui component library

### External Dependencies

- Stripe (for billing portal - future)
- Supabase (for auth and preferences)

## Risks & Mitigations

### Risk 1: Stripe integration complexity

**Impact:** Medium
**Probability:** Low
**Mitigation:** Use Stripe's hosted customer portal, minimal custom implementation

### Risk 2: Notification settings not persisting

**Impact:** High  
**Probability:** Low
**Mitigation:** Implement proper error handling and retry logic

## Design & UX Considerations

### Design Principles

- Match prototype exactly (prototypes/settings.html)
- Minimal and clean interface
- Clear visual hierarchy
- Consistent spacing and styling

### Prototype References

- Settings screen: `/prototypes/settings.html`
- Use exact styling for:
  - Section headers (uppercase, letter-spacing)
  - Settings items (white cards with borders)
  - Toggle switches (48x28px)
  - Logout button (red border)

### Accessibility Requirements

- Keyboard navigation support
- Proper ARIA labels
- Focus indicators
- Screen reader compatible

## Implementation Phases

### Phase 1: MVP Release

- All 5 stories listed above
- Basic functionality only
- No advanced features

### Phase 2: Post-MVP (Future)

- Email change with verification
- Password management
- Account deletion
- Session management
- Advanced notification options
- Theme preferences

## Definition of Done

- [ ] All MVP stories completed
- [ ] Settings persist correctly
- [ ] Mobile and desktop responsive
- [ ] Matches prototype design exactly
- [ ] No critical bugs
- [ ] Tests written and passing

## Related Documentation

- [UI Prototype](../../prototypes/settings.html)
- [Frontend Specification](../frontend-spec.md)
- [Architecture Documentation](../architecture.md)

## Epic Status Updates

| Date       | Status  | Notes                          |
| ---------- | ------- | ------------------------------ |
| 2025-08-06 | Created | Initial epic definition        |
| 2025-08-06 | Updated | Simplified to MVP requirements |

## Open Questions

1. Stripe customer portal URL generation - needs API key setup
2. Notification service provider selection (post-MVP)

---

_Epic Owner: Product Team_
_Technical Lead: TBD_
_Design Lead: TBD_
