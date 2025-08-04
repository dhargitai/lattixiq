# Story UI.1: Align Core Learning Loop Screens

## Status

Approved

## Story

**As a** user navigating through the core learning loop
**I want** the Learn and Plan screens to match the prototype designs
**So that** I have a consistent and polished user experience

## Acceptance Criteria

1. Learn screen matches prototype styling with proper card layouts, typography, and spacing
2. Plan screen displays form fields with correct labels based on content type:
   - Mental Models: "IF" and "THEN I WILL" fields
   - Cognitive Biases/Fallacies: Adapted spotting mission fields
3. All screens use consistent card styling with soft rounded corners and subtle shadows
4. Form validation states match prototype patterns (error highlighting, success feedback)
5. Navigation between screens maintains consistent header and back button behavior
6. Loading and error states follow the established design patterns
7. Mobile responsive layouts match prototype breakpoints
8. All existing functionality continues to work correctly

## Tasks / Subtasks

- [ ] Task 1: Align Learn screen with prototype design (AC: 1, 5, 6, 7, 8)
  - [ ] Update card component styling to match `.learn-content` wrapper from prototype
  - [ ] Apply proper typography classes for title, content sections
  - [ ] Ensure reading progress indicator positioning matches prototype
  - [ ] Update navigation header to match prototype pattern
  - [ ] Test on mobile devices for responsive behavior
  - [ ] Verify all existing learn functionality still works

- [ ] Task 2: Align Plan screen with prototype design (AC: 2, 4, 5, 6, 7, 8)
  - [ ] Update form field labels to match prototype exactly
  - [ ] Apply `.plan-form` styling patterns to form container
  - [ ] Implement proper field grouping and spacing
  - [ ] Update reminder toggle and time selector to match prototype
  - [ ] Apply validation state styling (border colors, error messages)
  - [ ] Ensure expandable goal example card matches prototype styling
  - [ ] Test form submission and validation behavior

- [ ] Task 3: Apply consistent design patterns across all screens (AC: 4, 5, 6, 7)
  - [ ] Create shared CSS classes for card containers
  - [ ] Standardize spacing using Tailwind utility classes
  - [ ] Ensure consistent shadow and border styles
  - [ ] Update loading states to use skeleton components
  - [ ] Standardize error message display patterns
  - [ ] Verify star rating selection behavior

- [ ] Task 4: Apply consistent design patterns across all screens (AC: 3, 5, 6, 7)
  - [ ] Create shared CSS classes for card containers
  - [ ] Standardize spacing using Tailwind utility classes
  - [ ] Ensure consistent shadow and border styles
  - [ ] Update loading states to use skeleton components
  - [ ] Standardize error message display patterns
  - [ ] Test navigation flow between all three screens

- [ ] Task 5: Write integration tests for UI changes (AC: 1-8)
  - [ ] Test that Learn screen renders with correct styling classes
  - [ ] Test Plan screen form field labels based on content type
  - [ ] Test responsive behavior at different breakpoints
  - [ ] Test that all existing functionality remains intact

## Dev Notes

### Previous Story Insights

This is a brownfield enhancement epic, so all existing functionality must be preserved while updating the UI.

### Component Specifications

Based on PROTOTYPE_COMPONENT_MAPPING.md:

**Learn Screen** (learn.html):

- Content Container: Use `Card` with `ScrollArea` [Source: PROTOTYPE_COMPONENT_MAPPING.md#Content Container]
- Custom typography for readability
- Focus mode styling
- Progress indicator integration

**Plan Screen** (plan.html):

- IF-THEN Form: Use `Form` with `Input` and `Textarea` [Source: PROTOTYPE_COMPONENT_MAPPING.md#IF-THEN Form Structure]
- Toggle Switches: Use `Switch` component with indigo theme
- Custom field grouping styling
- Validation states with `FormMessage`

### Frontend Alignment

From frontend-spec.md:

- "Serene Minimalist" aesthetic with generous white space [Source: frontend-spec.md#Core Design Principles]
- Card components with "soft, rounded corners and a very subtle border or shadow" [Source: frontend-spec.md#Component Library]
- Form validation with "minimum amount of text to be entered before Submit button is enabled" [Source: frontend-spec.md#Edge Cases & State Management]

### File Locations

Based on project structure:

- Learn screen: `/app/(app)/learn/[stepId]/page.tsx`
- Plan screen: `/app/(app)/plan/[stepId]/page.tsx`
- Shared components: `/components/ui/` and `/components/shared/`

### Technical Constraints

- Using shadcn/ui components (New York style) [Source: architecture/2-tech-stack.md]
- Tailwind CSS v4 with CSS variables [Source: architecture/2-tech-stack.md]
- TypeScript with strict mode enabled [Source: architecture/12-coding-standards.md]

### Testing

- Integration tests location: `/tests/integration/` [Source: architecture/11-testing-strategy.md]
- Use Vitest and React Testing Library [Source: architecture/11-testing-strategy.md]
- Test both happy and unhappy paths [Source: architecture/11-testing-strategy.md]

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
