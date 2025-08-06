# Epic: Unlocked Knowledge Viewer (MVP)

## Epic Summary

**Epic ID:** UNLOCKED-VIEWER-MVP  
**Priority:** High (MVP)  
**Status:** Approved  
**Created:** 2025-08-06  
**Epic Owner:** Product Team

## Problem Statement

Users need a way to revisit and review the mental models, cognitive biases, and logical fallacies they've already learned through their roadmap journeys. The current MVP requires a simple, read-only viewer that allows users to refresh their memory on previously learned concepts without the complexity of a full library management system.

## Solution Overview

Create a lightweight "Unlocked Knowledge Viewer" feature that:

1. Shows a simple popup/modal with a scrollable list of all unlocked knowledge pieces
2. Allows clicking on items to view them in a dedicated read-only page
3. Shares display logic with the existing Learn screen for consistency
4. Restricts access to only truly unlocked content via completed roadmap steps

## User Stories

### Story 1: View Unlocked Knowledge List

**As a** user  
**I want** to see all my unlocked mental models, biases, and fallacies in one place  
**So that** I can quickly browse what I've learned

**Acceptance Criteria:**

- Clicking "Learned Models" in My Toolkit opens a modal/popup
- Shows scrollable list of all unlocked knowledge pieces
- Each item shows: name, type (mental model/bias/fallacy), category
- List items are clickable
- Modal can be closed via X button or backdrop click

### Story 2: View Individual Knowledge Piece

**As a** user  
**I want** to read the full content of an unlocked knowledge piece  
**So that** I can refresh my understanding

**Acceptance Criteria:**

- Clicking a list item navigates to `/unlocked/[slug]`
- Page shows the same content layout as Learn screen
- No CTA button (read-only view)
- Header includes back link to My Toolkit page
- If knowledge piece is not unlocked, redirect to toolkit page

## Technical Approach

### Architecture

- **Modal Component:** `/components/features/toolkit/UnlockedKnowledgeModal.tsx`
- **Viewer Page:** `/app/(app)/unlocked/[slug]/page.tsx`
- **Shared Display:** Reuse components from Learn screen for content display
- **Data Source:** Query completed roadmap steps from user's history

### Security

- Server-side validation that knowledge piece was actually completed
- Protect `/unlocked/[slug]` routes with middleware check
- No direct database access to knowledge content without validation

### Data Flow

1. Query user's completed roadmap steps
2. Extract unique knowledge pieces (deduplicated)
3. Display in modal with basic metadata
4. On click, navigate to dedicated viewer page
5. Viewer page validates access and displays content

## Success Metrics

- Users can access previously learned content within 2 clicks
- Zero security breaches (users cannot access locked content)
- Page load time < 1 second for viewer pages
- 90% of users find the feature intuitive without help

## Dependencies

- Existing Learn screen components for content display
- Completed roadmap steps data in database
- My Toolkit page for entry point

## Implementation Phases

### Phase 1: Modal and List (MVP - Sprint 1)

- Create modal component with list
- Connect to completed roadmap steps data
- Basic styling matching My Toolkit page

### Phase 2: Viewer Page (MVP - Sprint 1)

- Create `/unlocked/[slug]` route
- Implement access validation
- Reuse Learn screen display components
- Add navigation back to toolkit

### Phase 3: Polish (MVP - Sprint 2)

- Loading states
- Empty states
- Error handling
- Basic animations

## Future Enhancements (Post-MVP)

- Full library with search/filter (Story 3.3)
- Effectiveness ratings and reflections
- Export/share functionality
- Spaced repetition reminders
- Knowledge graph visualization

## Notes

- This is a simplified version for MVP launch
- The full-featured Story 3.3 is postponed to post-MVP
- Focus on simplicity and reusing existing components
- No new AI features or complex interactions

## Change Log

| Date       | Version | Description                   | Author            |
| ---------- | ------- | ----------------------------- | ----------------- |
| 2025-08-06 | 1.0     | Initial epic creation for MVP | BMad Orchestrator |
