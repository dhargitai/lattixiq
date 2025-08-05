# Story UI.5: Align Roadmap Screen with Prototype Design

## Status

Draft

## Story

**As a** user navigating through my learning journey
**I want** the roadmap screen to match the prototype design
**So that** I have a visually engaging and intuitive progress tracking experience

## Acceptance Criteria

1. Roadmap title displays prominently with user's goal name
2. Step indicators show correct visual states:
   - Completed steps: Green circle with white checkmark
   - Current step: Blue circle with number and pulsing shadow effect
   - Locked steps: Light gray circle with lock icon or faded number
3. Connection lines between steps follow prototype design:
   - Completed connections: Green line
   - Future connections: Gray line
4. Step cards display with proper layout:
   - Step number label (e.g., "STEP 1")
   - Mental model/bias name clearly visible
   - Proper spacing and typography
5. Current step is interactive with hover/click states
6. Smooth animations on page load and state transitions
7. Bottom navigation matches prototype with active state indicator
8. Mobile responsive layout maintains all visual hierarchy
9. All existing navigation and functionality continues to work

## Tasks / Subtasks

- [ ] Task 1: Update roadmap container and header styling (AC: 1, 8, 9)
  - [ ] Apply prototype header styling with proper spacing
  - [ ] Update roadmap title typography to match prototype (22px on mobile, 26px on desktop)
  - [ ] Ensure proper max-width constraint (480px) and centering
  - [ ] Add help button in header if not present
  - [ ] Test responsive behavior

- [ ] Task 2: Implement step indicator visual states (AC: 2, 5, 6)
  - [ ] Create completed state: green background (#48BB78) with white checkmark
  - [ ] Create current state: blue background (#4299E1) with pulsing shadow animation
  - [ ] Create locked state: light gray background (#F7FAFC) with border
  - [ ] Add hover states for current step with scale transform
  - [ ] Implement click handler for current step navigation
  - [ ] Add proper ARIA labels for accessibility

- [ ] Task 3: Implement connection lines between steps (AC: 3, 6)
  - [ ] Add vertical connection lines with proper positioning
  - [ ] Apply conditional styling based on step completion status
  - [ ] Ensure lines don't appear after the last step
  - [ ] Test alignment with different numbers of steps

- [ ] Task 4: Update step content cards (AC: 4, 8)
  - [ ] Apply step label styling ("STEP N" in uppercase with tracking)
  - [ ] Update step name typography and color based on state
  - [ ] Ensure proper spacing between indicator and content
  - [ ] Add fade-in animations with staggered delays
  - [ ] Test text wrapping for longer model names

- [ ] Task 5: Implement bottom navigation (AC: 7, 8, 9)
  - [ ] Create navigation tabs matching prototype design
  - [ ] Add active state indicator (blue top border)
  - [ ] Implement navigation icons and labels
  - [ ] Ensure proper hover states
  - [ ] Test navigation functionality

- [ ] Task 6: Add animations and transitions (AC: 6)
  - [ ] Implement fadeIn animation for steps on page load
  - [ ] Add staggered animation delays for each step
  - [ ] Create smooth transitions for state changes
  - [ ] Add pulse animation for current step indicator
  - [ ] Test performance on mobile devices

- [ ] Task 7: Write integration tests (AC: 1-9)
  - [ ] Test that roadmap renders with correct title
  - [ ] Test step indicator states render correctly
  - [ ] Test current step is clickable and navigates
  - [ ] Test responsive behavior at different breakpoints
  - [ ] Test that existing functionality remains intact

## Dev Notes

### Previous Story Insights

From ui.1.story.md implementation:

- Successfully used global CSS utilities in `/app/globals.css` for prototype-matching styles
- Component updates maintained backward compatibility
- Integration tests were updated to match new UI text and structure

### Component Specifications

Based on PROTOTYPE_COMPONENT_MAPPING.md:

**Roadmap Page** (roadmap.html):

- Timeline Component: Custom component built with `Card` and `Badge` [Source: PROTOTYPE_COMPONENT_MAPPING.md#Roadmap Page]
- Step Status Indicators: `Badge` with custom variants for success/current/locked states
- Connection lines between steps require custom CSS positioning
- Clickable step navigation with progress animations

### Frontend Alignment

From prototype analysis (roadmap.html):

- Header height: Fixed with app name and help button
- Content max-width: 480px centered
- Step indicator size: 44px diameter circles
- Step spacing: 32px margin between steps (40px on desktop)
- Color scheme:
  - Completed: #48BB78 (green)
  - Current: #4299E1 (blue)
  - Locked: #F7FAFC background with #E2E8F0 border
  - Connection lines: #E2E8F0 (gray) or #48BB78 (green when completed)
- Typography:
  - Roadmap title: 22px mobile, 26px desktop
  - Step label: 14px uppercase with 0.5px letter-spacing
  - Step name: 18px
    [Source: prototypes/roadmap.html]

### File Locations

Based on project structure:

- Roadmap page: `/app/(app)/roadmap/page.tsx`
- Roadmap components: `/components/features/roadmap/` (if exists)
- Shared UI components: `/components/ui/`
- Global styles: `/app/globals.css`

### Technical Constraints

- Using shadcn/ui components (New York style) [Source: architecture/2-tech-stack.md]
- Tailwind CSS v4 with CSS variables [Source: architecture/2-tech-stack.md]
- TypeScript with strict mode enabled [Source: architecture/12-coding-standards.md]
- Next.js App Router for routing [Source: architecture/2-tech-stack.md]

### Testing Requirements

- Integration tests location: `/app/(app)/roadmap/__tests__/roadmap.test.tsx` already exists
- Use Vitest and React Testing Library [Source: architecture/11-testing-strategy.md]
- Test visual states, interactions, and responsive behavior
- Ensure backward compatibility with existing tests

### Implementation Notes

- The roadmap displays a vertical timeline of learning steps
- Each step represents a mental model or cognitive bias in the user's journey
- Visual feedback is critical for showing progress and encouraging completion
- The current implementation likely needs significant styling updates to match the prototype
- Consider extracting step indicator and connection line logic into reusable components

## Change Log

| Date       | Version | Description            | Author   |
| ---------- | ------- | ---------------------- | -------- |
| 2025-08-05 | 1.0     | Initial story creation | Bob (SM) |

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

## QA Results
