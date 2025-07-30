# Epic 3: Building the Toolkit (Long-Term Engagement)

## Epic Overview
**Title:** My Toolkit Hub - Long-term Engagement Features
**Priority:** High - Essential for user retention
**Estimated Duration:** 1.5 sprints (3 weeks)
**Dependencies:** Epics 1 and 2 must be complete (need roadmaps and reflections to display)

## Epic Description
Create the "My Toolkit" screen as the central hub for returning users. This becomes the home screen that showcases their progress, learned content, completed roadmaps, and full application log. This epic transforms the app from a one-time experience to a lifelong learning companion.

## Acceptance Criteria
- [ ] My Toolkit is the default screen for returning users
- [ ] Active roadmap prominently displayed with progress
- [ ] Library of learned models and biases accessible
- [ ] History of completed roadmaps viewable
- [ ] Full application log searchable and filterable
- [ ] Quick actions to start new roadmaps
- [ ] Testimonial collection at key milestones

## User Stories

### Story 3.1: Create My Toolkit Hub Layout
**As a** returning user  
**I want** a personalized dashboard  
**So that** I can see my progress and continue learning

**Acceptance Criteria:**
- [ ] Hub shows personalized greeting
- [ ] Active roadmap card with progress
- [ ] Quick stats (streak, total learned, etc.)
- [ ] Navigation to all key sections
- [ ] Mobile-optimized responsive design
- [ ] Empty states for new users

**Technical Tasks:**
1. Create `/app/(app)/toolkit/page.tsx` (make it index route later)
2. Design layout components:
   - Header with greeting and stats
   - Active roadmap card
   - Quick action buttons
   - Section navigation cards
3. Implement data fetching:
   - User progress stats
   - Active roadmap status
   - Recent activity
4. Create empty state components
5. Add loading skeletons
6. Implement responsive grid layout

**Story Points:** 8

---

### Story 3.2: Build Active Roadmap Display
**As a** user with an active roadmap  
**I want** to see my current progress prominently  
**So that** I can quickly continue where I left off

**Acceptance Criteria:**
- [ ] Shows current roadmap title and progress
- [ ] Visual progress bar or step indicator
- [ ] Current step highlighted with action button
- [ ] Time since last activity shown
- [ ] One-click access to continue
- [ ] Completion celebration when finished

**Technical Tasks:**
1. Create `/components/features/toolkit/ActiveRoadmapCard.tsx`
2. Design card with:
   - Roadmap title and goal
   - Progress visualization (5/7 steps)
   - Current step preview
   - "Continue Learning" CTA
   - Last activity timestamp
3. Add completion state with confetti
4. Handle multiple states:
   - In progress
   - Paused (no activity > 7 days)
   - Completed
5. Implement navigation to current step

**Story Points:** 5

---

### Story 3.3: Create Learned Models Library
**As a** user  
**I want** to review models I've learned  
**So that** I can refresh my memory and reapply them

**Acceptance Criteria:**
- [ ] Grid/list view of all completed models
- [ ] Each shows name, category, effectiveness rating
- [ ] Search and filter capabilities
- [ ] Click to view full content and reflection
- [ ] Sort by date, effectiveness, or category
- [ ] Export or share functionality

**Technical Tasks:**
1. Create `/app/(app)/toolkit/learned/page.tsx`
2. Build library components:
   - Model/bias card component
   - Filter bar (category, type, rating)
   - Search input
   - View toggle (grid/list)
3. Implement data fetching with pagination
4. Create detail modal showing:
   - Full model content
   - User's plan
   - Reflection and rating
5. Add sorting logic
6. Implement share functionality

**Story Points:** 8

---

### Story 3.4: Build Completed Roadmaps History
**As a** user  
**I want** to see all my completed journeys  
**So that** I can track my growth over time

**Acceptance Criteria:**
- [ ] List of all completed roadmaps
- [ ] Shows goal, completion date, duration
- [ ] Average effectiveness per roadmap
- [ ] Can view detailed breakdown
- [ ] Achievement badges for milestones
- [ ] Option to create similar roadmap

**Technical Tasks:**
1. Create `/app/(app)/toolkit/roadmaps/page.tsx`
2. Design roadmap history card:
   - Original goal
   - Start and end dates
   - Number of days to complete
   - Average effectiveness score
   - Key models learned
3. Add achievement badges:
   - First roadmap completed
   - Speed learner (< 30 days)
   - High achiever (avg rating > 4)
4. Create detailed view showing all steps
5. Add "Create Similar Roadmap" action

**Story Points:** 5

---

### Story 3.5: Implement Application Log
**As a** user  
**I want** to review all my reflections  
**So that** I can see my growth journey and patterns

**Acceptance Criteria:**
- [ ] Chronological list of all reflections
- [ ] Full text search across entries
- [ ] Filter by date range, model, rating
- [ ] Each entry shows context and content
- [ ] Infinite scroll or pagination
- [ ] Export to PDF/markdown option

**Technical Tasks:**
1. Create `/app/(app)/toolkit/journal/page.tsx`
2. Build journal components:
   - Entry card with date, model, preview
   - Expandable full content
   - Search bar with filters
   - Date range picker
3. Implement search functionality:
   - Full-text search in reflections
   - Filter by model/bias
   - Filter by effectiveness rating
4. Add pagination/infinite scroll
5. Create export functionality:
   - Generate PDF with entries
   - Markdown export option
6. Add data visualization of patterns

**Story Points:** 13

---

### Story 3.6: Add Quick Actions
**As a** user  
**I want** shortcuts to common actions  
**So that** I can quickly engage with the app

**Acceptance Criteria:**
- [ ] "Start New Roadmap" prominent button
- [ ] "Today's Reflection" if plan active
- [ ] "Explore Random Model" for discovery
- [ ] "View Insights" (placeholder for Epic 4)
- [ ] Recent activity feed
- [ ] Contextual actions based on state

**Technical Tasks:**
1. Create `/components/features/toolkit/QuickActions.tsx`
2. Implement action buttons:
   - Dynamic based on user state
   - Show/hide based on context
3. Add recent activity feed:
   - Last 3-5 reflections
   - Recent completions
   - Milestone achievements
4. Create "Random Model" feature:
   - Pick unlearned model
   - Show preview modal
   - Option to add to roadmap
5. Add placeholder for premium insights

**Story Points:** 5

---

### Story 3.7: Implement Testimonial Collection
**As a** product team  
**I want** to collect user testimonials  
**So that** we can showcase success stories

**Acceptance Criteria:**
- [ ] Prompt appears after first roadmap completion
- [ ] Simple form with guided questions
- [ ] Optional - user can skip
- [ ] Testimonials saved to database
- [ ] Thank you message after submission
- [ ] Only asked once per milestone

**Technical Tasks:**
1. Create `/components/features/toolkit/TestimonialPrompt.tsx`
2. Design testimonial form:
   - "What was your goal?"
   - "What changed for you?"
   - "Would you recommend this?"
   - Star rating
   - Optional name/initials
3. Implement display logic:
   - Check if already submitted
   - Show at milestone moments
   - Dismissible
4. Create API endpoint for submission
5. Add to testimonials table
6. Track completion in user preferences

**Story Points:** 5

---

### Story 3.8: Create Navigation and Information Architecture
**As a** user  
**I want** consistent navigation  
**So that** I can easily move between sections

**Acceptance Criteria:**
- [ ] Bottom navigation on mobile
- [ ] Sidebar navigation on desktop
- [ ] Clear active states
- [ ] Logical grouping of features
- [ ] Settings access
- [ ] Consistent across all screens

**Technical Tasks:**
1. Create `/components/shared/Navigation.tsx`
2. Implement responsive navigation:
   - Mobile: bottom tabs
   - Desktop: sidebar
   - Tablet: collapsible sidebar
3. Define navigation structure:
   - Toolkit (home)
   - Current Roadmap
   - Library
   - Journal
   - Settings
4. Add active state indicators
5. Implement route persistence
6. Add navigation animations

**Story Points:** 8

---

## Epic Summary
**Total Story Points:** 54
**Critical Path:** Application Log (3.5) is most complex feature
**Risk Areas:**
- Performance with large amounts of reflection data
- Search functionality across text entries
- Export feature complexity

**Success Metrics:**
- 80% of users visit Toolkit weekly
- 60% of users complete multiple roadmaps
- 40% of users use journal search
- 25% provide testimonials

**Testing Requirements:**
- Performance tests for large datasets
- Search functionality testing
- Export feature validation
- Responsive design testing on all breakpoints