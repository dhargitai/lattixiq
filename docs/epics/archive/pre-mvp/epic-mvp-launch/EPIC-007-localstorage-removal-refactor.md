# Epic 007: localStorage Removal and State Management Refactor

**Epic ID:** EPIC-007  
**Title:** Eliminate localStorage Usage to Prevent Caching Bugs  
**Priority:** High  
**Status:** Not Started  
**Epic Owner:** Engineering Team  
**Business Value:** Improved reliability, cross-device sync, reduced bug reports, better data integrity

## Epic Summary

Remove all localStorage usage from the application and migrate to database-backed storage in the existing `users` table. This refactoring will eliminate caching bugs, provide cross-device preference synchronization, and establish the database as the single source of truth for all user data.

## Business Justification

- **Bug Reduction:** Eliminates stale data issues and localStorage-related caching bugs
- **Cross-Device Experience:** User preferences sync seamlessly across all devices
- **Data Integrity:** Single source of truth reduces data inconsistency issues
- **Security:** Removes sensitive data from browser storage
- **Maintainability:** Simpler state management without client-side persistence conflicts
- **User Satisfaction:** Reduced frustration from lost preferences or inconsistent state

## Current localStorage Usage

### Identified Usage Points:

1. **Onboarding State** (`NewRoadmapForm.tsx`)
   - `hasCompletedOnboarding` - Will use `roadmap_count > 0` instead
   - `userGoal` - Already stored in roadmaps table

2. **~~Theme Preference~~** (`theme-provider.tsx`) - **REMOVED**
   - Not used anywhere in UI, no user-facing theme toggle exists
   - Will continue using system theme via CSS prefers-color-scheme

3. **Plan Modal State** (`PlanScreen.tsx`)
   - `plan-modal-shown-${step.id}` - Tracks guidance modal visibility per step

4. **Zustand Store Persistence** (`roadmap-store.ts`)
   - Persists activeRoadmap, currentStepIndex, currentStep, knowledgeContent, cacheMetadata

5. **Logout Cleanup** (`LogoutButton.tsx`)
   - Clears all localStorage/sessionStorage on logout

## User Stories

### Story 7.1: Database Schema Enhancement

**As a** developer  
**I want** to add modal tracking column to the users table  
**So that** we can track which guidance modals users have seen

**Acceptance Criteria:**

- [ ] Migration adds `shown_modals` JSONB column for tracking shown modals
- [ ] Column has appropriate default (empty array) for existing users
- [ ] Migration runs successfully in local and production environments
- [ ] RLS policies updated to allow users to update their own preferences

### Story 7.2: Onboarding State Logic Update

**As a** user  
**I want** my onboarding status to be determined by my roadmap creation  
**So that** I have a consistent experience based on actual usage

**Acceptance Criteria:**

- [ ] `NewRoadmapForm.tsx` checks `roadmap_count > 0` for onboarding status
- [ ] No dedicated field needed (uses existing `roadmap_count`)
- [ ] User goal storage removed from localStorage (already in roadmaps table)
- [ ] Tests updated to check roadmap count instead of localStorage
- [ ] E2E tests pass with new implementation

### ~~Story 7.3: Theme Preference Migration~~ **[REMOVED]**

**Reason for removal:** Analysis revealed no user-facing theme toggle exists in the application. The theme provider is unused boilerplate code. The app will continue using system theme via CSS prefers-color-scheme media query.

### Story 7.4: Plan Modal State Migration

**As a** user  
**I want** the app to remember which guidance modals I've seen  
**So that** I'm not repeatedly shown the same instructions

**Acceptance Criteria:**

- [ ] `PlanScreen.tsx` checks database for shown modals
- [ ] Modal IDs appended to `shown_modals` JSONB array when shown
- [ ] Efficient query to check if specific modal was shown
- [ ] Modal state persists across sessions and devices
- [ ] Performance remains optimal with JSONB queries

### Story 7.5: Remove Zustand Persistence

**As a** developer  
**I want** Zustand to only manage transient UI state  
**So that** we avoid client-side caching issues

**Acceptance Criteria:**

- [ ] `persist` middleware removed from `roadmap-store.ts`
- [ ] Store only contains transient UI state
- [ ] Data always fetched fresh from database
- [ ] No localStorage keys created by Zustand
- [ ] Application performance remains unchanged or improves

### Story 7.6: Update Logout Flow

**As a** user  
**I want** logout to properly clear my session  
**So that** my data is secure when I sign out

**Acceptance Criteria:**

- [ ] `LogoutButton.tsx` no longer calls localStorage.clear()
- [ ] sessionStorage.clear() removed
- [ ] Only Supabase signOut and cache clearing remain
- [ ] Logout properly clears all user state
- [ ] No residual data remains after logout

### Story 7.7: Create Database Helper Functions

**As a** developer  
**I want** reusable functions for modal tracking and onboarding checks  
**So that** database operations are consistent and maintainable

**Acceptance Criteria:**

- [ ] Create `lib/db/user-preferences.ts` with helper functions
- [ ] `hasCompletedOnboarding(userId)` checks if roadmap_count > 0
- [ ] `addShownModal(userId, stepId)` appends to shown_modals array
- [ ] `hasShownModal(userId, stepId)` checks if modal was shown
- [ ] All functions have proper TypeScript types
- [ ] Functions handle errors gracefully

### Story 7.8: Update Test Suite

**As a** developer  
**I want** all tests to work with the new implementation  
**So that** we maintain code quality and coverage

**Acceptance Criteria:**

- [ ] `new-roadmap.test.tsx` mocks database instead of localStorage
- [ ] `plan-modal-flow.test.tsx` uses database mocks
- [ ] `roadmap-creation.spec.ts` E2E test assertions updated
- [ ] `logout-button.test.tsx` localStorage mocks removed
- [ ] All tests pass in CI/CD pipeline
- [ ] Test coverage maintained or improved

## Technical Approach

1. **Phase 1:** Database migration to add new columns
2. **Phase 2:** Create helper functions for preference management
3. **Phase 3:** Update components one by one with feature flags if needed
4. **Phase 4:** Remove Zustand persistence
5. **Phase 5:** Update all tests
6. **Phase 6:** Deploy and monitor for issues

## Dependencies

- Database migration tools
- Supabase RLS policy updates
- Testing infrastructure
- No external team dependencies

## Success Metrics

- Zero localStorage-related bug reports post-deployment
- User preference sync working across devices (measured via support tickets)
- No performance degradation (measured via monitoring)
- Test coverage maintained above 80%
- Successful deployment with zero rollbacks

## Risks and Mitigation

| Risk                                   | Impact | Mitigation                                                  |
| -------------------------------------- | ------ | ----------------------------------------------------------- |
| Data migration issues                  | High   | Test thoroughly in staging, have rollback plan              |
| Performance impact from DB queries     | Medium | Implement caching layer if needed, optimize queries         |
| User preferences lost during migration | High   | Backup existing localStorage data, gradual rollout          |
| Breaking changes for existing users    | High   | Feature flag implementation, backwards compatibility period |

## Acceptance Criteria (Epic Level)

- [ ] All localStorage usage removed from codebase
- [ ] User preferences stored in database
- [ ] Cross-device synchronization working
- [ ] All tests passing
- [ ] No performance regression
- [ ] Documentation updated
- [ ] Zero critical bugs in production for 2 weeks post-deployment

## Notes

- This refactor addresses technical debt accumulated during MVP development
- Aligns with best practices for state management in modern web applications
- Sets foundation for future features requiring server-side preference storage
- Consider implementing this after EPIC-006 completion to maintain focus
