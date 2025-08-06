# Story UNLOCKED-MVP.2: View Individual Knowledge Piece

## Status

Draft

## Story

**As a** user  
**I want** to read the full content of an unlocked knowledge piece  
**So that** I can refresh my understanding

## Acceptance Criteria

1. Clicking a list item navigates to `/unlocked/[slug]`
2. Page shows the same content layout as Learn screen
3. No CTA button (read-only view)
4. Header includes back link to My Toolkit page
5. If knowledge piece is not unlocked, redirect to toolkit page

## Tasks / Subtasks

- [ ] Task 1: Create unlocked viewer route (AC: 1)
  - [ ] Create `/app/(app)/unlocked/[slug]/page.tsx`
  - [ ] Set up dynamic route parameter handling for slug
  - [ ] Add page metadata (title, description)
  - [ ] Implement loading and error states
  - [ ] Add proper TypeScript types for route params

- [ ] Task 2: Implement access validation middleware (AC: 5)
  - [ ] Create server-side validation function
  - [ ] Query user's completed roadmap steps
  - [ ] Check if requested knowledge piece was actually completed
  - [ ] Redirect to `/toolkit` if not authorized
  - [ ] Log unauthorized access attempts for security monitoring

- [ ] Task 3: Fetch and display knowledge content (AC: 2)
  - [ ] Create data fetching function for knowledge piece by slug
  - [ ] Retrieve full content including description, examples, how to use
  - [ ] Handle content not found scenarios
  - [ ] Pass content to display components

- [ ] Task 4: Reuse Learn screen components (AC: 2, 3)
  - [ ] Import content display components from LearnScreen
  - [ ] Extract reusable content sections if needed
  - [ ] Display content in same visual layout as Learn screen
  - [ ] Remove or hide the "Continue to Plan" CTA button
  - [ ] Maintain consistent typography and spacing

- [ ] Task 5: Add navigation header (AC: 4)
  - [ ] Create header with back arrow and page title
  - [ ] Link back button to `/toolkit` page
  - [ ] Show knowledge piece name in header
  - [ ] Style consistently with other app headers
  - [ ] Add breadcrumb trail: My Toolkit > Learned Models > [Model Name]

- [ ] Task 6: Implement read-only view modifications (AC: 3)
  - [ ] Hide or remove any action buttons
  - [ ] Disable any interactive elements from Learn screen
  - [ ] Add visual indicator that this is archived/completed content
  - [ ] Consider adding completion date or when it was learned

- [ ] Task 7: Add loading and error states (AC: 1-5)
  - [ ] Show skeleton loader while fetching content
  - [ ] Handle knowledge piece not found (404)
  - [ ] Handle unauthorized access gracefully
  - [ ] Display user-friendly error messages
  - [ ] Provide navigation options on error

- [ ] Task 8: Write integration tests (AC: 1-5)
  - [ ] Test successful navigation from modal to detail page
  - [ ] Test content displays correctly for unlocked knowledge
  - [ ] Test redirect when accessing locked content
  - [ ] Test back navigation to toolkit
  - [ ] Test error states and edge cases
  - [ ] Test page renders correctly on mobile

## Dev Notes

### Previous Story Insights

From Story UNLOCKED-MVP.1:

- Modal implementation creates the entry point
- Navigation to `/unlocked/[slug]` established
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
  slug: string;
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
- Check if requested slug exists in user's completed content
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
- Validate slug format to prevent injection
  [Source: Epic requirements - Security section]

### Implementation Priorities

1. Security - Ensure proper access validation
2. Content display - Reuse Learn screen components
3. Navigation - Smooth user experience
4. Error handling - Graceful failures
5. Performance - Fast page loads

## Change Log

| Date       | Version | Description            | Author   |
| ---------- | ------- | ---------------------- | -------- |
| 2025-08-06 | 1.0     | Initial story creation | Bob (SM) |

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

## QA Results
