# Epic 003: Content Management & Information Architecture

**Epic ID:** EPIC-003  
**Title:** Enhance Help System and Streamline Toolkit Interface  
**Priority:** Medium  
**Status:** Not Started  
**Epic Owner:** Product Team  
**Business Value:** Improved user support, cleaner interface, better user onboarding

## Epic Summary

Enhance the help system by adding centralized support contact information and streamline the toolkit interface by temporarily removing non-MVP features to focus user attention on core functionality.

## Business Justification

- **User Support:** Direct support contact reduces user frustration and support ticket volume
- **MVP Focus:** Removing non-essential features helps users focus on core value proposition
- **Onboarding:** Cleaner interface improves new user experience and reduces confusion
- **Support Efficiency:** Centralized support email improves support team workflow

## User Stories

### Story 3.1: Enhanced Help System

**As a** user seeking help  
**I want** easy access to additional support options  
**So that** I can get personalized assistance when the help content isn't sufficient

**Acceptance Criteria:**

- [ ] Add support email link to all HelpModal components
- [ ] Use consistent messaging: "If you have any more questions or feedback, feel free to shoot an email"
- [ ] Email link opens user's default email client
- [ ] Support email is `support@lattixiq.com`
- [ ] Link styling is consistent with existing modal design
- [ ] Link is accessible and properly labeled for screen readers

### Story 3.2: Streamlined Toolkit Interface

**As a** new user exploring the toolkit  
**I want** a focused interface that highlights core features  
**So that** I can understand the primary value without distraction

**Acceptance Criteria:**

- [ ] Comment out "My Completed Roadmaps" panel in NavigationCards
- [ ] Comment out "Application Log" panel in NavigationCards
- [ ] Ensure remaining interface elements are properly aligned
- [ ] Maintain component structure for easy re-enabling post-MVP
- [ ] Update any navigation logic that depends on hidden panels
- [ ] Verify no JavaScript errors from hidden components

### Story 3.3: Settings Simplification

**As a** user configuring reminder settings  
**I want** clear, concise interface text  
**So that** I can quickly understand and configure my preferences

**Acceptance Criteria:**

- [ ] Remove "These settings apply to all your active plans" text from ReminderSettings
- [ ] Ensure settings interface remains clear and understandable
- [ ] Verify settings functionality is unchanged
- [ ] Test settings across different screen sizes
- [ ] Maintain proper spacing and layout after text removal

## Technical Details

### Implementation Approach

1. **Help System Enhancement**
   - Modify HelpModal.tsx component
   - Add support email link below rendered content
   - Use React Router Link or standard anchor tag
   - Ensure consistent styling with existing modal elements

2. **Toolkit Interface Simplification**
   - Comment out relevant JSX in NavigationCards.tsx
   - Use block comments to preserve code structure
   - Update TypeScript props if needed
   - Test remaining components for proper layout

3. **Settings Text Removal**
   - Locate and remove specific text in ReminderSettings component
   - Verify component prop `showDescription` usage
   - Test settings functionality after changes

### Code Changes Required

**HelpModal.tsx additions:**

```jsx
<div className="mt-4 pt-4 border-t border-gray-200">
  <p className="text-sm text-gray-600">
    If you have any more questions or feedback, feel free to{" "}
    <a href="mailto:support@lattixiq.com" className="text-blue-600 hover:text-blue-800 underline">
      shoot an email
    </a>
    .
  </p>
</div>
```

**NavigationCards.tsx changes:**

- Comment out Trophy (Completed Roadmaps) card JSX block
- Comment out FileText (Application Log) card JSX block
- Maintain proper component structure

## Dependencies

- HelpModal component structure
- NavigationCards component layout
- ReminderSettings component implementation
- Email client integration testing

## Definition of Done

- [ ] Support email link added to all help modals
- [ ] Toolkit interface shows only core features (My Learned Models)
- [ ] Reminder settings text removed without breaking functionality
- [ ] All commented code is properly documented for future use
- [ ] Cross-browser testing for email links completed
- [ ] Mobile interface testing completed
- [ ] Accessibility testing for new support link completed

## Risk Assessment

**Low Risk** - These are primarily content and interface changes

**Mitigation Strategies:**

- Preserve commented code for easy rollback
- Test email functionality across different devices/email clients
- Verify no layout breakage from hidden components
- User testing to ensure help system is discoverable

## Estimated Effort

**Story Points:** 5  
**Development Time:** 1 day  
**Content Review:** 0.5 day  
**QA Time:** 0.5 day

## Acceptance Testing

### Manual Testing Scenarios

1. Open help modal on each screen and verify support email link appears
2. Click support email link and verify email client opens with correct address
3. Navigate toolkit page and verify only core features are visible
4. Test reminder settings and verify functionality works without descriptive text
5. Test on mobile devices for proper layout and link functionality

### Automated Testing

- Component rendering tests for modified components
- Link functionality tests
- Layout regression tests
- Accessibility tests for new email links

## Post-MVP Considerations

- Plan for re-enabling hidden features based on user feedback
- Monitor support email volume to measure help system effectiveness
- Consider adding in-app chat or knowledge base in future iterations
- Track user engagement with simplified toolkit interface
