# Frontend Patterns Bridge Document

This document bridges the gap between the frontend-spec.md (UI/UX vision) and technical implementation, providing clear patterns for developers to follow when implementing UI features.

> **Note:** For detailed component-by-component mappings from prototypes to shadcn/ui components, refer to `PROTOTYPE_COMPONENT_MAPPING.md`. This document focuses on high-level patterns and implementation guidelines.

## Purpose

To ensure consistent implementation of UI/UX patterns across the application by mapping design specifications to technical patterns and component structures.

## Key UI Patterns from Frontend-Spec

### 1. Navigation Patterns

#### Bottom Navigation (Mobile-First)

**Design Spec:** Persistent bottom navigation with "My Toolkit" and "Settings"
**Prototype Reference:** `prototypes/settings.html`, `prototypes/my-toolkit.html`
**Implementation Pattern:**

```tsx
// components/ui/bottom-navigation.tsx
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
  <div className="flex justify-around py-2">
    <NavItem href="/" icon="🛠️" label="My Toolkit" />
    <NavItem href="/settings" icon="⚙️" label="Settings" />
  </div>
</nav>
```

#### Breadcrumb Navigation

**Design Spec:** Contextual navigation showing user's location
**Implementation:** Use Next.js pathname to build breadcrumb trail

### 2. Form Patterns

#### IF-THEN Planning Structure

**Design Spec:** Explicit "IF:" and "THEN I WILL:" labels for implementation intentions
**Prototype Reference:** `prototypes/plan.html`
**Implementation Pattern:**

```tsx
<div className="space-y-4">
  <div>
    <Label htmlFor="if-input">IF:</Label>
    <Textarea id="if-input" placeholder="When this situation occurs..." />
  </div>
  <div>
    <Label htmlFor="then-input">THEN I WILL:</Label>
    <Textarea id="then-input" placeholder="Take this specific action..." />
  </div>
</div>
```

#### Reminder Settings Pattern

**Design Spec:** Toggle switch with time selector
**Prototype Reference:** `prototypes/plan.html` (lines 503-536)
**Implementation Pattern:**

```tsx
// Reminder container with toggle and time selector
<div className="reminder-section">
  <div className="flex items-center justify-between">
    <Label>Daily Reminder</Label>
    <Switch checked={reminderEnabled} onCheckedChange={setReminderEnabled} />
  </div>
  {reminderEnabled && (
    <Select value={reminderTime} onValueChange={setReminderTime}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{/* Time options */}</SelectContent>
    </Select>
  )}
</div>
```

### 3. Visual Hierarchy Patterns

#### Card-Based Content

**Design Spec:** Clean cards with soft shadows for content grouping
**Implementation:** Use shadcn/ui Card components consistently

#### Progress Indicators

**Design Spec:** Visual progress through roadmap steps
**Implementation Pattern:**

```tsx
// Roadmap step states
const stepStyles = {
  completed: "bg-green-100 border-green-500",
  current: "bg-blue-100 border-blue-500 animate-pulse",
  locked: "bg-gray-100 border-gray-300 opacity-50",
};
```

### 4. Interactive Patterns

#### Expandable Content

**Design Spec:** Collapsible sections with chevron indicators
**Prototype Reference:** Goal examples in plan screen
**Implementation:** Use Collapsible component with rotation animation

#### Loading States

**Design Spec:** Skeleton screens for better perceived performance
**Implementation:** Create matching skeleton components for each screen

### 5. Mobile Responsiveness

#### Breakpoint Strategy

**Design Spec:** Mobile-first with tablet/desktop enhancements
**Implementation:**

- Mobile: Default styles
- Tablet: `md:` prefix (768px+)
- Desktop: `lg:` prefix (1024px+)

### 6. Component Mapping Summary

For comprehensive component mappings, see `PROTOTYPE_COMPONENT_MAPPING.md`. Key mappings include:

| Frontend-Spec Element | Prototype Location             | shadcn/ui Component | Custom Requirements          |
| --------------------- | ------------------------------ | ------------------- | ---------------------------- |
| Bottom Navigation     | settings.html, my-toolkit.html | Custom              | Fixed position, icon support |
| Toggle Switch         | plan.html, settings.html       | Switch              | With label alignment         |
| Time Selector         | plan.html                      | Select              | 15 time options              |
| IF-THEN Form          | plan.html                      | Textarea + Label    | Explicit labels required     |
| Progress Indicator    | Multiple screens               | Custom              | Step visualization           |
| Expandable Card       | plan.html                      | Collapsible + Card  | Chevron animation            |

**See `PROTOTYPE_COMPONENT_MAPPING.md` for:**

- Complete mappings for all 9 prototype screens
- Detailed customization requirements
- Animation specifications
- State management patterns

## Implementation Checklist

When implementing any UI feature:

1. **Check Frontend-Spec:** Review the design principles and requirements
2. **Review Prototype:** Open the HTML file to see exact visual implementation
3. **Consult PROTOTYPE_COMPONENT_MAPPING.md:** Find the exact shadcn/ui component and customizations needed
4. **Use This Pattern Guide:** Follow the high-level patterns documented here
5. **Verify Consistency:** Ensure your implementation matches existing patterns
6. **Test Responsiveness:** Verify mobile-first approach works correctly

## Common Pitfalls to Avoid

1. **Don't Skip Prototypes:** Always check the prototype even if the story seems clear
2. **Don't Omit UI Elements:** Include all elements visible in prototypes (e.g., bottom nav)
3. **Don't Change Labels:** Use exact label text from prototypes (e.g., "IF:" not "Situation:")
4. **Don't Forget Mobile:** Test on mobile viewport sizes first

## Future Patterns

As new UI patterns are introduced:

1. Add them to this document with clear implementation guidance
2. Update the component mapping table
3. Create reusable components for repeated patterns
4. Document any deviations from prototypes with justification
