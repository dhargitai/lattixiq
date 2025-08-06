# Story UNLOCKED-MVP.1: View Unlocked Knowledge List

## Status

Approved

## Story

**As a** user  
**I want** to see all my unlocked mental models, biases, and fallacies in one place  
**So that** I can quickly browse what I've learned

## Acceptance Criteria

1. Clicking "Learned Models" in My Toolkit opens a modal/popup
2. Shows scrollable list of all unlocked knowledge pieces
3. Each item shows: name, type (mental model/bias/fallacy), category
4. List items are clickable
5. Modal can be closed via X button or backdrop click

## Tasks / Subtasks

- [ ] Task 1: Create modal component structure (AC: 1, 5)
  - [ ] Create `/components/features/toolkit/UnlockedKnowledgeModal.tsx`
  - [ ] Implement modal open/close functionality with state management
  - [ ] Add backdrop click handler for closing
  - [ ] Add X button in modal header for closing
  - [ ] Test modal accessibility (ARIA attributes, focus trap)

- [ ] Task 2: Implement data fetching for unlocked knowledge (AC: 2)
  - [ ] Create data access function in `/lib/db/unlocked-knowledge.ts`
  - [ ] Query completed roadmap steps for current user
  - [ ] Join with knowledge_content table to get content details
  - [ ] Deduplicate knowledge pieces (user may have learned same model in multiple roadmaps)
  - [ ] Sort by most recently completed

- [ ] Task 3: Build knowledge list display (AC: 2, 3)
  - [ ] Create list item component for knowledge pieces
  - [ ] Display knowledge piece name prominently
  - [ ] Show type badge (Mental Model/Cognitive Bias/Logical Fallacy)
  - [ ] Display category label
  - [ ] Implement scrollable container with proper height constraints
  - [ ] Add empty state for users with no unlocked knowledge

- [ ] Task 4: Implement click navigation (AC: 4)
  - [ ] Add click handler to each list item
  - [ ] Navigate to `/unlocked/[slug]` on click
  - [ ] Pass knowledge piece ID/slug as route parameter
  - [ ] Ensure modal closes before navigation

- [ ] Task 5: Integrate with My Toolkit page (AC: 1)
  - [ ] Add state management for modal visibility in toolkit page
  - [ ] Update "Learned Models" navigation card click handler
  - [ ] Import and render UnlockedKnowledgeModal component
  - [ ] Ensure modal renders above other content (z-index)

- [ ] Task 6: Style modal with shadcn/ui components (AC: 1-5)
  - [ ] Use Dialog component from shadcn/ui as base
  - [ ] Apply consistent styling with My Toolkit page
  - [ ] Add loading state while fetching data
  - [ ] Implement smooth open/close animations
  - [ ] Ensure responsive design for mobile devices

- [ ] Task 7: Write integration tests (AC: 1-5)
  - [ ] Test modal opens when "Learned Models" is clicked
  - [ ] Test modal displays correct unlocked knowledge
  - [ ] Test clicking item navigates to detail page
  - [ ] Test modal closes via X button
  - [ ] Test modal closes via backdrop click
  - [ ] Test empty state when no knowledge unlocked

## Dev Notes

### Previous Story Insights

From UI stories and Story 3.1 (My Toolkit):

- Navigation cards in toolkit use `NavigationCards.tsx` component
- Modal patterns established using shadcn/ui Dialog component
- My Toolkit page located at `/app/(app)/toolkit/page.tsx`
- Consistent card styling with white backgrounds and subtle shadows

### Data Models

**From database schema:**

- `roadmap_steps` table contains completed steps with `status` field
- `knowledge_content` table contains mental model/bias/fallacy details
- Join via `knowledge_content_id` foreign key
- Relevant fields:
  - `knowledge_content.name`: Display name
  - `knowledge_content.type`: 'mental_model', 'cognitive_bias', 'logical_fallacy'
  - `knowledge_content.category`: Category classification
  - `roadmap_steps.completed_at`: For sorting by recency
    [Source: architecture/database-schema.md]

### Component Specifications

**Modal Component:**

- Use shadcn/ui `Dialog` component as base
- DialogContent for main container
- DialogHeader for title and close button
- ScrollArea for scrollable list
  [Source: shadcn/ui component library]

**Navigation Integration:**

- "Learned Models" card in NavigationCards component
- Currently shows "coming-soon" state
- Update to trigger modal instead
  [Source: components/features/toolkit/NavigationCards.tsx]

### File Locations

Based on project structure:

- Modal component: `/components/features/toolkit/UnlockedKnowledgeModal.tsx`
- Data access: `/lib/db/unlocked-knowledge.ts`
- Integration point: `/app/(app)/toolkit/page.tsx`
- Navigation cards: `/components/features/toolkit/NavigationCards.tsx`
  [Source: architecture/10-unified-project-structure.md]

### Testing Requirements

- Integration tests in `/tests/integration/toolkit/`
- Use Vitest for component testing
- Test user interactions and navigation flow
- Ensure proper data mocking for unlocked content
  [Source: architecture/12-coding-standards.md]

### Technical Constraints

- Must validate user has actually completed the knowledge pieces
- No direct access to locked content
- Use server-side data fetching for security
- Maintain consistent styling with My Toolkit page
- Follow functional programming patterns (pure functions, immutability)
  [Source: architecture/12-coding-standards.md]

### Security Considerations

- Server-side validation required before showing content
- Only query steps where `user_id` matches authenticated user
- Only show knowledge from steps with `status = 'completed'`
- No client-side filtering of locked/unlocked content
  [Source: Epic requirements - Security section]

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
