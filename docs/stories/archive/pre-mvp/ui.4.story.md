# Story UI.4: Standardize Form Patterns

## Status

Draft

## Story

**As a** user interacting with forms throughout the app
**I want** consistent form patterns with proper labels and validation
**So that** I have a predictable and polished form experience

## Acceptance Criteria

1. Plan screen IF-THEN labels match prototype exactly based on content type
2. Reminder settings toggle and time selector follow prototype patterns
3. Form validation displays consistent error states (red borders, error messages)
4. Success states show appropriate feedback (green checkmarks, success messages)
5. All form fields have proper placeholder text as specified in prototypes
6. Character counters display in consistent format across all textareas
7. Form buttons are disabled until minimum validation requirements are met
8. Focus states are consistent across all form inputs
9. Form submission maintains loading states with disabled buttons and spinners

## Tasks / Subtasks

- [ ] Task 1: Standardize form field components (AC: 1, 5, 8)
  - [ ] Update Input component to support consistent styling
  - [ ] Update Textarea component with character counter support
  - [ ] Ensure all form fields use consistent border and focus ring colors
  - [ ] Add placeholder text patterns from prototypes
  - [ ] Create FormField wrapper component for consistent spacing

- [ ] Task 2: Implement form validation patterns (AC: 3, 4, 7)
  - [ ] Create consistent error state styling (border-red-500)
  - [ ] Implement FormMessage component for error display
  - [ ] Add success state styling (border-green-500)
  - [ ] Create validation helpers for common patterns
  - [ ] Implement button disabled state logic
  - [ ] Add minimum character validation for textareas

- [ ] Task 3: Update Plan screen form patterns (AC: 1, 2, 5, 6)
  - [ ] Update IF-THEN labels based on content type:
    - Mental Models: "IF:" and "THEN I WILL:"
    - Cognitive Biases: Adapted spotting mission labels
  - [ ] Implement reminder toggle with proper styling
  - [ ] Create time selector grid component
  - [ ] Add appropriate placeholder text for each field type
  - [ ] Ensure form follows prototype layout exactly

- [ ] Task 4: Standardize loading and submission states (AC: 9)
  - [ ] Create consistent loading button pattern
  - [ ] Add spinner component to buttons during submission
  - [ ] Disable all form inputs during submission
  - [ ] Implement proper error recovery states
  - [ ] Add success toast notifications

- [ ] Task 5: Update other forms to follow patterns (AC: 3, 4, 6, 7, 8)
  - [ ] Update Reflect screen textarea and validation
  - [ ] Update Settings screen form controls
  - [ ] Update onboarding goal input validation
  - [ ] Ensure all forms follow the same patterns
  - [ ] Add character counters where appropriate

- [ ] Task 6: Write tests for form patterns (AC: 1-9)
  - [ ] Test form field rendering with correct labels
  - [ ] Test validation state displays
  - [ ] Test character counter functionality
  - [ ] Test button disabled/enabled states
  - [ ] Test loading states during submission
  - [ ] Test error and success feedback

## Dev Notes

### Previous Story Insights

This story builds on the UI alignment work from previous stories, focusing specifically on form consistency across the application.

### Form Patterns from Prototypes

**Plan Screen** (plan.html):

- Mental Model labels: "IF:" and "THEN I WILL:"
- Placeholder text examples:
  - IF: "When I notice [specific situation]..."
  - THEN: "I will [specific action]..."
- Reminder section with toggle and time grid

**Reflect Screen** (reflect.html):

- Character counter format: "120/500 characters"
- Textarea with min-height and auto-resize
- Star rating as form input

**Settings Screen** (settings.html):

- Toggle switches with labels
- Time selector dropdown/grid
- Consistent list item styling for form controls

### Frontend Alignment

From frontend-spec.md:

**Form Validation**:

- "The Reflect screen will require a minimum amount of text to be entered before the Submit button is enabled" [Source: frontend-spec.md#Edge Cases & State Management]
- Validation should feel supportive, not critical
- Real validation happens through user reflection, not AI judgment [Source: frontend-spec.md#Screen 3: Plan Screen]

**Placeholder Text Strategy**:

- "Smart Placeholder Text" that offers clues [Source: frontend-spec.md#Screen 3: Plan Screen]
- Context-specific examples based on the mental model

### Technical Implementation

**Form State Management**:

- Use React Hook Form for complex forms (as mentioned in PROTOTYPE_COMPONENT_MAPPING.md)
- Local state for simple toggles and selections

**Validation Patterns**:

```typescript
// Minimum character validation
const MIN_REFLECTION_LENGTH = 50;
const MIN_GOAL_LENGTH = 10;

// Character counter component
interface CharacterCounterProps {
  current: number;
  max: number;
}
```

**Error State Styling**:

```tsx
// Consistent error styling
className={cn(
  "border-input",
  error && "border-red-500 focus:ring-red-500"
)}
```

**Loading Button Pattern**:

```tsx
<Button disabled={isLoading}>
  {isLoading && <Spinner className="mr-2" />}
  {isLoading ? "Saving..." : "Save Plan"}
</Button>
```

### File Locations

- Form components: `/components/ui/form.tsx`
- Shared form utilities: `/lib/utils/form-helpers.ts`
- Validation schemas: `/lib/validations/`

### Testing

- Form validation tests: `/tests/unit/forms/`
- Integration tests for form flows: `/tests/integration/`
- Test accessibility of form states
- Test keyboard navigation through forms

## Change Log

| Date       | Version | Description            | Author   |
| ---------- | ------- | ---------------------- | -------- |
| 2025-08-04 | 1.0     | Initial story creation | Bob (SM) |

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

## QA Results
