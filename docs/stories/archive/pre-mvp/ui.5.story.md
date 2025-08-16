# Story UI.5: Align Roadmap Screen with Prototype Design

## Status

Done

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

- [x] Task 1: Update roadmap container and header styling (AC: 1, 8, 9)
  - [x] Apply prototype header styling with proper spacing
  - [x] Update roadmap title typography to match prototype (22px on mobile, 26px on desktop)
  - [x] Ensure proper max-width constraint (480px) and centering
  - [x] Add help button in header if not present
  - [x] Test responsive behavior

- [x] Task 2: Implement step indicator visual states (AC: 2, 5, 6)
  - [x] Create completed state: green background (#48BB78) with white checkmark
  - [x] Create current state: blue background (#4299E1) with pulsing shadow animation
  - [x] Create locked state: light gray background (#F7FAFC) with border
  - [x] Add hover states for current step with scale transform
  - [x] Implement click handler for current step navigation
  - [x] Add proper ARIA labels for accessibility

- [x] Task 3: Implement connection lines between steps (AC: 3, 6)
  - [x] Add vertical connection lines with proper positioning
  - [x] Apply conditional styling based on step completion status
  - [x] Ensure lines don't appear after the last step
  - [x] Test alignment with different numbers of steps

- [x] Task 4: Update step content cards (AC: 4, 8)
  - [x] Apply step label styling ("STEP N" in uppercase with tracking)
  - [x] Update step name typography and color based on state
  - [x] Ensure proper spacing between indicator and content
  - [x] Add fade-in animations with staggered delays
  - [x] Test text wrapping for longer model names

- [x] Task 5: Implement bottom navigation (AC: 7, 8, 9)
  - [x] Create navigation tabs matching prototype design
  - [x] Add active state indicator (blue top border)
  - [x] Implement navigation icons and labels
  - [x] Ensure proper hover states
  - [x] Test navigation functionality

- [x] Task 6: Add animations and transitions (AC: 6)
  - [x] Implement fadeIn animation for steps on page load
  - [x] Add staggered animation delays for each step
  - [x] Create smooth transitions for state changes
  - [x] Add pulse animation for current step indicator
  - [x] Test performance on mobile devices

- [x] Task 7: Write integration tests (AC: 1-9)
  - [x] Test that roadmap renders with correct title
  - [x] Test step indicator states render correctly
  - [x] Test current step is clickable and navigates
  - [x] Test responsive behavior at different breakpoints
  - [x] Test that existing functionality remains intact

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

| Date       | Version | Description              | Author   |
| ---------- | ------- | ------------------------ | -------- |
| 2025-08-05 | 1.0     | Initial story creation   | Bob (SM) |
| 2025-08-05 | 1.1     | Completed implementation | James    |

## Dev Agent Record

### Agent Model Used

claude-opus-4-1-20250805

### Debug Log References

N/A

### Completion Notes List

- Successfully aligned roadmap screen with prototype design
- Implemented all visual states for step indicators (completed, current, locked)
- Added proper animations including pulse effect for current step
- Created bottom navigation component with active state indicators
- All existing tests pass after updating mocks for usePathname
- Linting passes with no errors

### File List

- /app/(app)/roadmap/page.tsx (modified)
- /components/features/roadmap/RoadmapView.tsx (modified)
- /components/features/roadmap/RoadmapStep.tsx (modified)
- /components/features/roadmap/RoadmapConnector.tsx (modified)
- /components/features/shared/BottomNav.tsx (created)
- /app/globals.css (modified)
- /app/(app)/roadmap/**tests**/roadmap.test.tsx (modified)

## QA Results
