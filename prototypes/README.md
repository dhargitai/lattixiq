# Prototypes Directory

This directory contains HTML prototype files that serve as the visual and interaction reference for the LattixIQ application. These prototypes are **authoritative sources** for UI/UX implementation and should be referenced when implementing features.

## Important Notice for AI Agents

**All UI implementations MUST match these prototypes**. When implementing a feature, always check the corresponding prototype file for:

- Visual layout and styling
- Interactive elements and their behavior
- Form structures and field requirements
- Navigation patterns and user flows

## Prototype Files

### Core Application Screens

- `login.html` - Login flow with passwordless authentication
- `goal-selection.html` - Onboarding goal input screen
- `roadmap.html` - Visual roadmap display
- `my-toolkit.html` - Main hub/home screen for returning users
- `settings.html` - User settings and preferences (includes reminder settings)

### Learning Loop Screens

- `learn.html` - Mental model/bias learning screen
- `plan.html` - Implementation intention/spotting mission creation screen
  - **Important**: Shows IF/THEN structure with explicit labels
  - **Important**: Includes reminder toggle and time selector
- `reflect.html` - Reflection journaling screen
- `application-log.html` - Historical view of all reflections

### Key UI Patterns

1. **Bottom Navigation**: Present on all main screens (my-toolkit.html, settings.html)
2. **IF-THEN Structure**: Explicitly labeled in plan.html form
3. **Reminder Settings**:
   - Global toggle in settings.html
   - Per-plan toggle with time selector in plan.html
4. **Visual Hierarchy**: Clean, minimalist design with focus on content

## Development Guidelines

When implementing any UI feature:

1. First check if a prototype exists for that screen
2. Match the visual design, layout, and interactions exactly
3. If discrepancies exist between documentation and prototypes, prototypes take precedence for UI/UX
4. Document any necessary deviations with clear justification

## Prototype Features Not Yet Documented

Some features visible in prototypes may not be fully documented in stories. These should be flagged for story updates:

- Bottom navigation footer (visible in settings.html, my-toolkit.html)
- Explicit IF/THEN labels in plan forms
- Reminder time selector UI component
- Progress indicators and visual feedback elements
