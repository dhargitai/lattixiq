# Story UI.3: Align Settings and My Toolkit Screens

## Status

Draft

## Story

**As a** user managing my account and viewing my progress
**I want** the Settings and My Toolkit screens to match the prototype designs
**So that** I have a consistent and polished experience across all app screens

## Acceptance Criteria

1. My Toolkit screen displays active roadmap card with progress indicator matching prototype
2. My Toolkit shows navigation list items (Learned Models, Completed Roadmaps, Application Log) with proper styling
3. Settings screen displays account information and notification preferences in list format
4. Toggle switches for notifications match prototype styling with indigo theme
5. Time selector for reminders uses the grid layout from prototype
6. All cards and list items have consistent spacing and styling
7. Screens properly handle empty states (no active roadmap, etc.)
8. Mobile responsive behavior matches prototype patterns
9. All existing functionality remains operational

## Tasks / Subtasks

- [ ] Task 1: Update My Toolkit screen layout and components (AC: 1, 2, 6, 7, 8, 9)
  - [ ] Update active roadmap card to match `.roadmap-card` prototype styling
  - [ ] Implement progress bar within roadmap card
  - [ ] Style navigation list items with proper spacing and chevron icons
  - [ ] Add hover states for interactive elements
  - [ ] Implement empty state for when no active roadmap exists
  - [ ] Ensure "Start a New Roadmap" button styling matches prototype
  - [ ] Test responsive layout on mobile devices

- [ ] Task 2: Update Settings screen components (AC: 3, 4, 5, 6, 8, 9)
  - [ ] Implement settings list items using Card components
  - [ ] Update toggle switches to use indigo color theme
  - [ ] Create time selector grid component for reminder times
  - [ ] Style account information display section
  - [ ] Add proper dividers between setting groups
  - [ ] Implement logout button with correct styling
  - [ ] Ensure form controls are properly aligned

- [ ] Task 3: Create reusable list item components (AC: 2, 3, 6)
  - [ ] Create NavigationListItem component for consistent styling
  - [ ] Implement chevron icon for navigable items
  - [ ] Create SettingsListItem component variant
  - [ ] Ensure consistent padding and typography
  - [ ] Add proper hover and focus states

- [ ] Task 4: Implement testimonial card component (AC: 7)
  - [ ] Create TestimonialCard component for My Toolkit screen
  - [ ] Implement conditional display logic based on user state
  - [ ] Add dismiss functionality with close button
  - [ ] Style card to stand out while maintaining design consistency
  - [ ] Integrate with testimonial state management

- [ ] Task 5: Write tests for UI updates (AC: 1-9)
  - [ ] Test My Toolkit rendering with and without active roadmap
  - [ ] Test Settings screen toggle and form interactions
  - [ ] Test responsive behavior for both screens
  - [ ] Test navigation between list items
  - [ ] Verify all existing functionality remains intact

## Dev Notes

### Previous Story Insights

This continues the UI prototype alignment work. Both screens are key navigation destinations from the bottom navigation implemented in UI.2.

### Component Specifications

Based on PROTOTYPE_COMPONENT_MAPPING.md:

**My Toolkit** (my-toolkit.html):

- Active Roadmap Card: `Card` with `Progress` component [Source: PROTOTYPE_COMPONENT_MAPPING.md#Active Roadmap Card]
- Custom progress bar styling
- Dynamic progress percentage
- Interactive hover states

**Settings** (settings.html):

- Settings Items: `Card` with `Switch` or `Button` actions [Source: PROTOTYPE_COMPONENT_MAPPING.md#Settings Items]
- Consistent spacing and alignment
- Icon integration
- Divider lines between items

### Frontend Alignment

From frontend-spec.md:

**My Toolkit Screen**:

- "The main landing screen for all returning users" [Source: frontend-spec.md#Screen & Feature List]
- Displays active roadmap with progress
- Shows "My Learnings" section with navigation items
- Conditional testimonial card display [Source: frontend-spec.md#Screen 7]

**Settings Screen**:

- Account section with email and plan status [Source: frontend-spec.md#Screen 5]
- Notifications section with daily reminder toggle
- Time selector for reminder configuration

### File Locations

- My Toolkit: `/app/(app)/toolkit/page.tsx`
- Settings: `/app/(app)/settings/page.tsx`
- Shared components: `/components/shared/`
- UI components: `/components/ui/`

### Data Models

From architecture/3-data-models.md:

- User model includes individual reminder fields (reminder_enabled, reminder_time, reminder_timezone, reminder_last_sent)
- Testimonial state tracked in `testimonial_state` enum field
- Roadmap status can be 'active' or 'completed'

### Technical Implementation Notes

**Progress Calculation**:

- Calculate based on completed steps vs total steps
- Use roadmap_steps with status 'completed'

**Notification Preferences Structure**:

```typescript
interface NotificationPrefs {
  daily_reminder: boolean;
  reminder_time: string; // "HH:MM" format
}
```

**List Item Patterns**:

- Use consistent padding: `p-4`
- Hover state: `hover:bg-muted`
- Active/pressed state for better mobile UX

### Testing

- Page tests: `/app/(app)/toolkit/__tests__/`, `/app/(app)/settings/__tests__/`
- Component tests in respective component directories
- Test empty states and loading states
- Test form interactions in settings

## Change Log

| Date       | Version | Description            | Author   |
| ---------- | ------- | ---------------------- | -------- |
| 2025-08-04 | 1.0     | Initial story creation | Bob (SM) |

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

## QA Results
