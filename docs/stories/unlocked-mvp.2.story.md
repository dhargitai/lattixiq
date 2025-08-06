# Story UNLOCKED-MVP.2: View Individual Knowledge Piece

## Status

Ready for Review

## Story

**As a** user  
**I want** to read the full content of an unlocked knowledge piece  
**So that** I can refresh my understanding

## Acceptance Criteria

1. Clicking a list item navigates to `/unlocked/[id]` (using knowledge_content UUID)
2. Page shows the same content layout as Learn screen
3. No CTA button (read-only view)
4. Header includes back link to My Toolkit page
5. If knowledge piece is not unlocked, redirect to toolkit page

## Tasks / Subtasks

- [x] Task 1: Create unlocked viewer route (AC: 1)
  - [x] Create `/app/(app)/unlocked/[slug]/page.tsx`
  - [x] Set up dynamic route parameter handling for UUID
  - [x] Add page metadata (title, description)
  - [x] Implement loading and error states
  - [x] Add proper TypeScript types for route params

- [x] Task 2: Implement access validation middleware (AC: 5)
  - [x] Create server-side validation function
  - [x] Query user's completed roadmap steps
  - [x] Check if requested knowledge piece was actually completed
  - [x] Redirect to `/toolkit` if not authorized
  - [x] Log unauthorized access attempts for security monitoring

- [x] Task 3: Fetch and display knowledge content (AC: 2)
  - [x] Create data fetching function for knowledge piece by UUID
  - [x] Retrieve full content including description, examples, how to use
  - [x] Handle content not found scenarios
  - [x] Pass content to display components

- [x] Task 4: Reuse Learn screen components (AC: 2, 3)
  - [x] Import content display components from LearnScreen
  - [x] Extract reusable content sections if needed
  - [x] Display content in same visual layout as Learn screen
  - [x] Remove or hide the "Continue to Plan" CTA button
  - [x] Maintain consistent typography and spacing

- [x] Task 5: Add navigation header (AC: 4)
  - [x] Create header with back arrow and page title
  - [x] Link back button to `/toolkit` page
  - [x] Show knowledge piece name in header
  - [x] Style consistently with other app headers
  - [x] Add breadcrumb trail: My Toolkit > Learned Models > [Model Name]

- [x] Task 6: Implement read-only view modifications (AC: 3)
  - [x] Hide or remove any action buttons
  - [x] Disable any interactive elements from Learn screen
  - [x] Add visual indicator that this is archived/completed content
  - [x] Consider adding completion date or when it was learned

- [x] Task 7: Add loading and error states (AC: 1-5)
  - [x] Show skeleton loader while fetching content
  - [x] Handle knowledge piece not found (404)
  - [x] Handle unauthorized access gracefully
  - [x] Display user-friendly error messages
  - [x] Provide navigation options on error

- [x] Task 8: Write integration tests (AC: 1-5)
  - [x] Test successful navigation from modal to detail page
  - [x] Test content displays correctly for unlocked knowledge
  - [x] Test redirect when accessing locked content
  - [x] Test back navigation to toolkit
  - [x] Test error states and edge cases
  - [x] Test page renders correctly on mobile

## Dev Notes

### Previous Story Insights

From Story UNLOCKED-MVP.1:

- Modal implementation creates the entry point
- Navigation to `/unlocked/[id]` established (using UUID)
- Access validation patterns defined

From UI stories:

- Learn screen components available for reuse
- Content display patterns established
- Header navigation patterns consistent across app

### Component Specifications

**Learn Screen Components to Reuse:**

- Content display sections from `/components/features/roadmap/LearnScreen.tsx`
- Typography and layout patterns
- Card containers and styling
- Remove interactive elements (CTA buttons)
  [Source: Existing LearnScreen implementation]

**Header Pattern:**

- Back arrow with blue color (#4299E1)
- Consistent height and padding with other screens
- Title typography matching app standards
  [Source: UI prototype patterns]

### Data Models

**Knowledge Content Structure:**

```typescript
interface KnowledgeContent {
  id: string;
  name: string;
  type: "mental_model" | "cognitive_bias" | "logical_fallacy";
  category: string;
  description: string;
  example_scenario: string;
  how_to_use: string;
  // Additional fields as needed
}
```

[Source: architecture/database-schema.md]

**Access Validation Query:**

- Join `roadmap_steps` with `knowledge_content`
- Filter by `user_id` and `status = 'completed'`
- Check if requested UUID exists in user's completed content
  [Source: Security requirements]

### File Locations

Based on project structure:

- Viewer page: `/app/(app)/unlocked/[slug]/page.tsx`
- Shared components: `/components/features/roadmap/` (reuse from LearnScreen)
- Data access: `/lib/db/unlocked-knowledge.ts` (extend from Story 1)
- Types: `/lib/types/knowledge.ts` (if needed)
  [Source: architecture/10-unified-project-structure.md]

### Visual Design Reference

From Learn screen and prototypes:

- Background: #FAFBFC
- Content cards: White with 16px border radius
- Text colors: #1A202C (headings), #2D3748 (body)
- Shadows: 0 4px 12px rgba(0, 0, 0, 0.05)
- Spacing: 32px between sections
  [Source: prototype styling patterns]

### Testing Requirements

- Integration tests in `/tests/integration/unlocked/`
- Test authorization logic thoroughly
- Mock different user scenarios (has/hasn't completed)
- Verify content display matches Learn screen
- Test navigation flows
  [Source: architecture/testing-strategy.md]

### Technical Constraints

- Server-side rendering for SEO and security
- No client-side content filtering
- Must handle direct URL access (not just from modal)
- Graceful degradation for missing content
- Mobile-responsive design required
  [Source: architecture/12-coding-standards.md]

### Security Considerations

- All access checks must be server-side
- Never expose locked content in API responses
- Log suspicious access patterns
- Rate limit API calls if needed
- Validate UUID format to prevent injection
  [Source: Epic requirements - Security section]

### Implementation Priorities

1. Security - Ensure proper access validation
2. Content display - Reuse Learn screen components
3. Navigation - Smooth user experience
4. Error handling - Graceful failures
5. Performance - Fast page loads

## Change Log

| Date       | Version | Description                                        | Author      |
| ---------- | ------- | -------------------------------------------------- | ----------- |
| 2025-08-06 | 1.0     | Initial story creation                             | Bob (SM)    |
| 2025-08-06 | 1.1     | Completed implementation                           | James (Dev) |
| 2025-08-06 | 1.2     | Refactored to use UUID instead of title-based slug | James (Dev) |

## Dev Agent Record

### Agent Model Used

claude-3-5-sonnet-20241022

### Debug Log References

- Successfully created unlocked viewer route with dynamic UUID parameter
- Refactored from title-based slug to UUID for robustness
- Implemented server-side access validation with user authentication check
- Reused LearnScreen components for consistent UI layout
- Added comprehensive integration tests for all acceptance criteria

### Completion Notes List

- Created read-only viewer for unlocked knowledge pieces
- Implemented secure access validation at server level
- Added breadcrumb navigation for better UX
- Included completed badge and read-only indicators
- All tests pass with proper TypeScript types
- Refactored to use knowledge_content UUID instead of title-based slug for more robust routing

### File List

#### Created:

- `/app/(app)/unlocked/[slug]/page.tsx` - Server component for unlocked viewer page
- `/app/(app)/unlocked/[slug]/UnlockedViewer.tsx` - Client component for displaying content
- `/app/(app)/unlocked/[slug]/loading.tsx` - Loading state component
- `/tests/integration/unlocked/unlocked-viewer.test.ts` - Integration tests

#### Modified:

- `/lib/db/unlocked-knowledge.ts` - Added `isKnowledgeUnlocked` function for access validation, refactored to use UUID
- `/components/features/toolkit/UnlockedKnowledgeModal.tsx` - Updated to navigate using UUID instead of slug

## QA Results
