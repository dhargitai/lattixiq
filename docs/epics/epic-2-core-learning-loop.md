# Epic 2: The Core Learning Loop

## Epic Overview
**Title:** Core Learning Loop Implementation
**Priority:** High - Essential MVP functionality
**Estimated Duration:** 2 sprints (4 weeks)
**Dependencies:** Epic 1 must be complete (users need roadmaps to learn from)

## Epic Description
Implement the three-screen learning loop (Learn, Plan, Reflect) that transforms knowledge into action. This is the heart of the application where users engage with mental models and cognitive biases, create implementation plans, and reflect on their experiences to unlock progression.

## Acceptance Criteria
- [ ] Users can access Learn screen for current roadmap step
- [ ] Users can create implementation plans or spotting missions
- [ ] Reminder system sends notifications at chosen times
- [ ] Users can complete reflection journals
- [ ] Progress unlocks next roadmap step
- [ ] Navigation between screens is intuitive
- [ ] All user inputs are saved and retrievable

## User Stories

### Story 2.1: Build Learn Screen
**As a** user  
**I want** to understand the mental model or bias  
**So that** I can apply it effectively in my life

**Acceptance Criteria:**
- [ ] Display mental model/bias name prominently
- [ ] Show concise, actionable summary (200-300 words)
- [ ] Include 2-3 real-world examples
- [ ] Provide "key insight" callout box
- [ ] Navigation to Plan screen available
- [ ] Progress indicator shows current step

**Technical Tasks:**
1. Create `/app/(app)/learn/[stepId]/page.tsx`
2. Design content layout components:
   - Title section with icon
   - Summary paragraph component
   - Example cards component
   - Key insight highlight box
3. Implement content fetching from database
4. Add loading and error states
5. Create "Continue to Plan" button
6. Add breadcrumb navigation

**Story Points:** 5

---

### Story 2.2: Create Plan Screen for Implementation Intentions
**As a** user learning a mental model  
**I want** to create a specific plan to use it  
**So that** I actually apply what I learned

**Acceptance Criteria:**
- [ ] Form captures: situation, trigger, and action
- [ ] Clear examples guide user input
- [ ] Plan saves to database
- [ ] Reminder opt-in toggle available
- [ ] Time picker for reminder preference
- [ ] Confirmation shows plan was saved

**Technical Tasks:**
1. Create `/app/(app)/plan/[stepId]/page.tsx`
2. Build form components:
   - Situation input (When/Where will you use this?)
   - Trigger input (What will remind you?)
   - Action input (Exactly what will you do?)
3. Add helpful placeholder text and examples
4. Implement reminder toggle with time picker
5. Create API route `/api/plans/route.ts`
6. Add success toast notification
7. Store plan in `application_logs` table

**Story Points:** 8

---

### Story 2.3: Create Plan Screen for Spotting Missions (Biases)
**As a** user learning about a bias  
**I want** to create a mission to spot it  
**So that** I become aware of it in real life

**Acceptance Criteria:**
- [ ] Different form for bias spotting
- [ ] Captures: where to look, what to watch for
- [ ] Examples specific to bias detection
- [ ] Shares reminder system with mental models
- [ ] Clear differentiation from implementation intentions

**Technical Tasks:**
1. Extend Plan screen with conditional rendering
2. Create bias-specific form fields:
   - "Where will you watch for this bias?"
   - "What specific behaviors/thoughts to notice?"
   - "Who might exhibit this bias?"
3. Add bias-specific examples
4. Implement shared reminder logic
5. Update API to handle both plan types

**Story Points:** 5

---

### Story 2.4: Implement Reminder Notification System
**As a** user with an active plan  
**I want** to receive a daily reminder  
**So that** I remember to practice

**Acceptance Criteria:**
- [ ] Global reminder preference saved
- [ ] Notifications sent at chosen time
- [ ] Reminder includes plan summary
- [ ] Link opens app to reflect screen
- [ ] Can disable reminders anytime
- [ ] Works on mobile and desktop

**Technical Tasks:**
1. Create notification service architecture
2. Implement notification preferences in database
3. Set up notification provider (OneSignal/Firebase)
4. Create `/api/notifications/schedule/route.ts`
5. Build notification templates:
   - Title: "Time to practice [Model Name]"
   - Body: Brief plan reminder
   - Action: Deep link to reflect screen
6. Add preference UI in settings
7. Handle timezone considerations

**Story Points:** 13

---

### Story 2.5: Build Reflect Screen
**As a** user who tried my plan  
**I want** to journal about my experience  
**So that** I can learn and progress

**Acceptance Criteria:**
- [ ] Structured reflection prompts displayed
- [ ] Text area for detailed reflection
- [ ] Effectiveness rating (1-5 stars)
- [ ] "What did you learn?" prompt
- [ ] Saves complete reflection to database
- [ ] Unlocks next roadmap step on completion

**Technical Tasks:**
1. Create `/app/(app)/reflect/[stepId]/page.tsx`
2. Design reflection form:
   - Recap of original plan
   - "What happened?" text area
   - "What did you learn?" text area
   - Effectiveness rating component
   - "Would you use this again?" toggle
3. Implement character count (min 50 words)
4. Create submission handler
5. Update roadmap progress on submission
6. Add completion animation
7. Auto-navigate to next step

**Story Points:** 8

---

### Story 2.6: Implement Smart Navigation Logic
**As a** returning user  
**I want** the app to know where I left off  
**So that** I can continue seamlessly

**Acceptance Criteria:**
- [ ] Returning to a step shows correct screen
- [ ] If plan saved but not reflected → Reflect screen
- [ ] If reflected → Show completion state
- [ ] Can navigate back to Learn from Reflect
- [ ] URL structure supports direct linking
- [ ] Loading states prevent navigation errors

**Technical Tasks:**
1. Create navigation state machine
2. Implement route guards:
   - Check step completion status
   - Redirect based on progress
   - Prevent skipping steps
3. Add navigation utilities in `/lib/navigation.ts`
4. Update breadcrumb component
5. Handle edge cases:
   - Expired plans
   - Incomplete reflections
   - Direct URL access
6. Add loading skeletons

**Story Points:** 8

---

### Story 2.7: Create Progress Tracking Dashboard
**As a** user  
**I want** to see my learning progress  
**So that** I stay motivated

**Acceptance Criteria:**
- [ ] Current streak displayed
- [ ] Total reflections count
- [ ] Current roadmap progress bar
- [ ] Most effective models highlighted
- [ ] Recent reflections preview
- [ ] Accessible from main navigation

**Technical Tasks:**
1. Create `/components/features/progress/ProgressDashboard.tsx`
2. Build progress metrics queries:
   - Calculate streak from reflection dates
   - Count total completed steps
   - Average effectiveness ratings
3. Design visual components:
   - Streak flame icon with number
   - Progress bar component
   - Stats cards
4. Add to navigation menu
5. Implement data caching for performance

**Story Points:** 5

---

## Epic Summary
**Total Story Points:** 52
**Critical Path:** Reminder system (2.4) is most complex and risk-prone
**Risk Areas:**
- Notification delivery reliability
- Cross-platform notification support  
- State management complexity

**Success Metrics:**
- 70% of users complete their first reflection
- 50% of users enable reminders
- Average effectiveness rating > 3.5 stars
- 60% day-1 retention after first reflection

**Testing Requirements:**
- Unit tests for navigation state machine
- Integration tests for plan/reflection flow
- E2E tests for complete learning loop
- Manual testing of notifications on iOS/Android