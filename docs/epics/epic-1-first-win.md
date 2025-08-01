# Epic 1: The First Win (Onboarding & First Roadmap)

## Epic Overview

**Title:** User Onboarding and First Roadmap Generation
**Priority:** High - Core MVP functionality
**Estimated Duration:** 2 sprints (4 weeks)
**Dependencies:** Epic 0 must be complete

## Epic Description

Create a seamless onboarding experience that captures the user's growth goal and generates their first personalized learning roadmap using AI-powered semantic matching. This epic delivers the "aha moment" where users see a customized path to solve their specific challenge.

## Acceptance Criteria

- [ ] New users can successfully create an account
- [ ] Users can define their growth goal through guided UI
- [ ] AI generates relevant 5-7 step roadmap based on goal
- [ ] Roadmap is visually displayed with progression mechanics
- [ ] Users are automatically directed to their first roadmap
- [ ] All 100 mental models and cognitive biases are indexed

## User Stories

### Story 1.1: Create Onboarding Flow UI

**As a** new user  
**I want** a welcoming onboarding experience  
**So that** I feel confident about starting my growth journey

**Acceptance Criteria:**

- [ ] Welcome screen with app value proposition
- [ ] Goal selection screen with categories and free text
- [ ] Loading state while roadmap generates
- [ ] Smooth transitions between screens
- [ ] Mobile-responsive design

**Technical Tasks:**

1. Create `/app/(app)/onboarding/page.tsx`
2. Design welcome screen with hero message
3. Implement goal category cards:
   - "Stop Procrastinating"
   - "Think More Clearly"
   - "Make Better Decisions"
   - "Overcome Biases"
   - "Custom Goal"
4. Create free-text input component for custom goals
5. Add loading animation component
6. Implement screen transition logic

**Story Points:** 5

---

### Story 1.2: Implement Mental Models and Biases Data Layer

**As a** system  
**I want** all mental models and biases stored and indexed  
**So that** I can match them to user goals

**Acceptance Criteria:**

- [ ] Database tables created for mental models and biases
- [ ] All 100 mental models imported from source document
- [ ] All cognitive biases imported from source document
- [ ] Each item has proper metadata (category, description, etc.)
- [ ] Data access layer implemented

**Technical Tasks:**

1. Create database migrations:
   ```sql
   - mental_models table
   - cognitive_biases table
   - categories table
   ```
2. Parse source documents to extract content
3. Create seed data scripts
4. Implement data access functions in `/lib/db/mental-models.ts`
5. Add TypeScript types in `/lib/types/learning-content.ts`
6. Create content validation tests

**Story Points:** 8

---

### Story 1.3: Build AI-Powered Roadmap Generation

**As a** user  
**I want** my roadmap to be relevant to my specific goal  
**So that** I get personalized learning content

**Acceptance Criteria:**

- [x] User goal text is converted to embeddings using OpenAI text-embedding-3-small
- [x] Sophisticated semantic matching with 6-factor relevance scoring
- [x] Algorithm prioritizes foundational concepts with synergy calculations
- [x] Roadmap contains 5-7 most relevant items with proper balancing
- [x] Generation completes in under 5 seconds with intelligent caching
- [x] Spaced repetition integration for learned concepts
- [x] Advanced synthesis algorithms for users with 80+ concepts
- [x] Comprehensive error handling with retry logic
- [x] Performance monitoring and cache statistics

**Technical Tasks:**

1. ✅ Set up Vercel AI SDK with OpenAI text-embedding-3-small model
2. ✅ Create `/app/api/roadmaps/route.ts` (integrated endpoint, not separate generate)
3. ✅ Implement sophisticated embedding service with batch processing
4. ✅ Build advanced semantic matching with cosine similarity and vector search
5. ✅ Create intelligent curation logic with:
   - 6-factor relevance scoring (semantic, category, type, goal examples, novelty, spaced repetition)
   - Foundational concept prioritization with synergy calculations
   - Advanced type balancing and diversity optimization
6. ✅ Implement intelligent caching layer (LRU with TTL for embeddings and search results)
7. ✅ Add spaced repetition algorithms for learning history integration
8. ✅ Build advanced synthesis roadmaps for power users (80+ concepts)
9. ✅ Comprehensive error handling with custom error types and retry logic
10. ✅ Performance monitoring with timing and statistics tracking
11. ✅ Store generated roadmap in database with full validation
12. ✅ Implement comprehensive test suite covering all functionality

**Story Points:** 20 _(Updated from original 13 to reflect actual implementation complexity)_

---

### Story 1.4: Create Roadmap Visualization Component

**As a** user  
**I want** to see my personalized roadmap visually  
**So that** I understand my learning journey

**Acceptance Criteria:**

- [ ] Roadmap displays as vertical progression
- [ ] Current step is highlighted
- [ ] Future steps are locked/blurred
- [ ] Step numbers and titles visible
- [ ] Progress indicator shows completion
- [ ] Tapping a step shows preview (if unlocked)

**Technical Tasks:**

1. Create `/components/features/roadmap/RoadmapView.tsx`
2. Design step component with:
   - Step number badge
   - Title and brief description
   - Lock icon for future steps
   - Completion checkmark
3. Implement progression line connecting steps
4. Add blur effect for locked content
5. Create step preview modal
6. Add animations for step transitions

**Story Points:** 8

---

### Story 1.5: Implement Roadmap Data Management

**As a** user  
**I want** my roadmap progress to be saved  
**So that** I can continue where I left off

**Acceptance Criteria:**

- [ ] Roadmap state persists to database
- [ ] Current step tracking works
- [ ] Roadmap loads on app return
- [ ] Multiple roadmaps supported (future-proofing)
- [ ] Optimistic UI updates

**Technical Tasks:**

1. Create database schema:
   - roadmaps table (user_id, created_at, status)
   - roadmap_steps table (roadmap_id, step_order, content_type, content_id, status)
2. Implement `/lib/db/roadmaps.ts` with functions:
   - createRoadmap()
   - getRoadmapById()
   - updateStepStatus()
   - getUserActiveRoadmap()
   - getUserRoadmapCount() // NEW: For checking if user has completed onboarding
3. Create Zustand store for roadmap state
4. Add API routes for roadmap operations
5. Implement data synchronization logic
6. REFACTOR: Replace localStorage 'hasCompletedOnboarding' checks with getUserRoadmapCount() > 0

**Story Points:** 8

---

### Story 1.6: Build Navigation from Onboarding to Roadmap

**As a** user  
**I want** to seamlessly transition to my roadmap  
**So that** I can start learning immediately

**Acceptance Criteria:**

- [ ] After goal selection, roadmap generates automatically
- [ ] User sees brief "Creating your roadmap..." message
- [ ] Automatic redirect to roadmap view
- [ ] Back navigation is disabled during generation
- [ ] Error handling for generation failures

**Technical Tasks:**

1. Implement form submission handler in onboarding
2. Create loading state management
3. Add router navigation logic:
   - Generate roadmap via API
   - Store roadmap ID
   - Navigate to /roadmap/[id]
4. Implement error boundary for failures
5. Add fallback UI for generation errors
6. Create success animation transition

**Story Points:** 5

---

## Epic Summary

**Total Story Points:** 54 _(Updated from 47 due to Story 1.3 complexity increase)_
**Critical Path:** Stories 1.2 and 1.3 are critical for AI functionality
**Risk Areas:**

- AI embedding generation performance
- Semantic matching accuracy
- Database query optimization for content

**Success Metrics:**

- 80% of users complete onboarding
- Roadmap generation under 5 seconds
- 90% relevance rating for generated roadmaps
- Zero crashes during onboarding flow

**Testing Requirements:**

- Unit tests for roadmap generation algorithm
- Integration tests for API endpoints
- E2E tests for complete onboarding flow
- Performance tests for AI operations

**Note:** Analytics tracking for onboarding funnel has been moved to Epic 5 (Post-Launch Analytics & Monitoring) to focus initial development on core functionality.
