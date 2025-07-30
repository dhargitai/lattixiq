# Prototype to shadcn/ui Component Mapping

## Overview
This document maps every UI component identified in the prototype files to their corresponding shadcn/ui equivalents, including required customizations to achieve the same behavior and animations.

## Component Mapping by Page

### 1. Landing Page (`index.html`)

#### Screen Cards Grid
- **Current**: Custom `.screen-card` divs with hover animations
- **shadcn Equivalent**: `Card` component with custom styling
- **Customizations Required**:
  - Add hover scale transform: `hover:scale-105`
  - Add staggered animation delays: `delay-100`, `delay-200`, etc.
  - Custom gradient backgrounds: `bg-gradient-to-br from-indigo-50 to-white`
  - Add box shadow on hover: `hover:shadow-lg hover:shadow-indigo-200/50`
  - Custom border styling: `border border-indigo-100`

#### Flow Steps
- **Current**: Custom `.flow-step` divs with checkmarks
- **shadcn Equivalent**: `Card` with `Badge` for step numbers
- **Customizations Required**:
  - Add checkmark icon when completed
  - Custom styling for active/complete states
  - Progress line connectors between steps

#### Feature Cards
- **Current**: Custom `.feature-card` divs
- **shadcn Equivalent**: `Card` with `CardContent`
- **Customizations Required**:
  - Add icon support
  - Custom gradient backgrounds
  - Hover animations

### 2. Login Page (`login.html`)

#### Social Login Buttons
- **Current**: Custom `.social-login-btn` buttons
- **shadcn Equivalent**: `Button` component with `variant="outline"`
- **Customizations Required**:
  - Add Google/Apple brand icons
  - Custom hover states with brand colors
  - Width: `w-full` for full-width buttons

#### OTP Input Fields
- **Current**: Custom 6-digit input boxes with `.otp-input`
- **shadcn Equivalent**: `InputOTP` component
- **Customizations Required**:
  - Custom styling for individual digit boxes
  - Auto-focus next input on key entry
  - Error state styling
  - Success state with checkmark

#### Form Validation Messages
- **Current**: Custom `.error-message` divs
- **shadcn Equivalent**: `Alert` component with `variant="destructive"`
- **Customizations Required**:
  - Slide-in animation from top
  - Auto-dismiss after 3 seconds

### 3. Onboarding Page (`onboarding.html`)

#### Goal Input Textarea
- **Current**: Custom `.goal-input` textarea
- **shadcn Equivalent**: `Textarea` component
- **Customizations Required**:
  - Character counter display
  - Custom focus ring styling
  - Auto-resize based on content
  - Validation states (valid/invalid)

#### Expandable "How it Works" Section
- **Current**: Custom accordion with `.expandable-section`
- **shadcn Equivalent**: `Accordion` component
- **Customizations Required**:
  - Custom chevron animations
  - Smooth expand/collapse transitions
  - Custom styling for content reveal

#### Success Overlay
- **Current**: Custom `.success-overlay` with animations
- **shadcn Equivalent**: `Dialog` component with custom content
- **Customizations Required**:
  - Full-screen overlay
  - Success checkmark animation
  - Auto-redirect after 2 seconds

### 4. My Toolkit Page (`my-toolkit.html`)

#### Active Roadmap Card
- **Current**: Custom `.roadmap-card` with progress
- **shadcn Equivalent**: `Card` with `Progress` component
- **Customizations Required**:
  - Custom progress bar styling
  - Dynamic progress percentage
  - Interactive hover states
  - Completion celebration animation

#### Modal Dialogs
- **Current**: Custom `.modal` implementations
- **shadcn Equivalent**: `Dialog` component
- **Customizations Required**:
  - Custom backdrop blur effect
  - Slide-up animation from bottom
  - Custom close button styling

#### Bottom Navigation
- **Current**: Custom `.bottom-nav` with active states
- **shadcn Equivalent**: `NavigationMenu` (horizontal variant)
- **Customizations Required**:
  - Fixed positioning at bottom
  - Active state indicators
  - Icon + label layout
  - Smooth transitions between tabs

### 5. Roadmap Page (`roadmap.html`)

#### Timeline Component
- **Current**: Custom `.timeline` with `.step` elements
- **shadcn Equivalent**: `Timeline` (custom component needed) built with `Card` and `Badge`
- **Customizations Required**:
  - Step indicators (completed/current/locked states)
  - Connection lines between steps
  - Clickable step navigation
  - Progress animations

#### Step Status Indicators
- **Current**: Custom status badges (✓, ●, 🔒)
- **shadcn Equivalent**: `Badge` with custom variants
- **Customizations Required**:
  - Success: Green checkmark badge
  - Current: Blue active badge with pulse
  - Locked: Gray lock icon badge

### 6. Learn Page (`learn.html`)

#### Content Container
- **Current**: Custom `.learn-content` wrapper
- **shadcn Equivalent**: `Card` with `ScrollArea`
- **Customizations Required**:
  - Custom typography for readability
  - Focus mode styling
  - Progress indicator integration

#### Reading Progress Bar
- **Current**: Custom `.progress-bar` at top
- **shadcn Equivalent**: `Progress` component
- **Customizations Required**:
  - Fixed position at top of viewport
  - Smooth scroll-based updates
  - Completion celebration

### 7. Plan Page (`plan.html`)

#### IF-THEN Form Structure
- **Current**: Custom form with `.plan-form` styling
- **shadcn Equivalent**: `Form` with `Input` and `Textarea`
- **Customizations Required**:
  - Custom field grouping styling
  - Validation states
  - Character counters

#### Toggle Switches
- **Current**: Custom `.toggle-switch` elements
- **shadcn Equivalent**: `Switch` component
- **Customizations Required**:
  - Custom colors (indigo theme)
  - Smooth transition animations
  - Label positioning

#### Time Selection Grid
- **Current**: Custom `.time-grid` with buttons
- **shadcn Equivalent**: `ToggleGroup` component
- **Customizations Required**:
  - Grid layout for time slots
  - Active state styling
  - Multi-select capability

### 8. Reflect Page (`reflect.html`)

#### Star Rating Component
- **Current**: Custom `.star-rating` with hover states
- **shadcn Equivalent**: Custom component using `Button` with star icons
- **Customizations Required**:
  - Hover and selection states
  - Star fill animations
  - Rating submission feedback

#### Character Counter
- **Current**: Custom `.char-counter` span
- **shadcn Equivalent**: Custom text component with count display
- **Customizations Required**:
  - Real-time character counting
  - Limit indicator (e.g., "120/200")
  - Color changes as limit approaches

### 9. Settings Page (`settings.html`)

#### Settings Items
- **Current**: Custom `.settings-item` rows
- **shadcn Equivalent**: `Card` with `Switch` or `Button` actions
- **Customizations Required**:
  - Consistent spacing and alignment
  - Icon integration
  - Divider lines between items

#### Upgrade Modal
- **Current**: Custom `.upgrade-modal` with pricing
- **shadcn Equivalent**: `Dialog` with `Card` content
- **Customizations Required**:
  - Pricing tier display
  - Feature comparison table
  - CTA buttons for each tier

## Global Components & Patterns

### Animations
- **Page transitions**: Use `framer-motion` for route transitions
- **Hover effects**: Consistent scale and shadow transitions
- **Loading states**: Skeleton loaders using `Skeleton` component
- **Success feedback**: Checkmark animations and success toasts

### Form Patterns
- **Validation states**: Use `Form` component with `FormMessage` for errors
- **Loading states**: Disable buttons and show loading spinners
- **Success states**: Auto-clear forms and show success messages

### Responsive Design
- **Mobile-first**: All components should work on mobile
- **Breakpoints**: Use Tailwind's responsive prefixes
- **Touch targets**: Minimum 44x44px for mobile buttons

### State Management
- **LocalStorage**: Use custom hooks for data persistence
- **Form state**: Use React Hook Form for complex forms
- **UI state**: Use local component state for modals and toggles

## Implementation Notes

### Custom Components to Create
1. `Timeline` component for roadmap steps
2. `StarRating` component for feedback
3. `ProgressHeader` for reading progress
4. `BottomNavigation` for mobile nav
5. `ScreenCard` for landing page cards

### Animation Libraries
- **framer-motion** for complex animations
- **Tailwind transitions** for simple hover/focus states
- **CSS keyframes** for custom loading animations

### Icons
- **lucide-react** for consistent iconography
- **Custom SVG** for brand-specific icons (Google, Apple)

### Styling Approach
- **CSS Variables** for theming consistency
- **Tailwind classes** for layout and spacing
- **Custom classes** only when necessary for complex animations

## Priority Order for Implementation

1. **High Priority** (Core functionality):
   - Button, Input, Card, Dialog, Form components
   - Navigation and layout components

2. **Medium Priority** (Enhanced UX):
   - Progress indicators, modals, toggles
   - Animation enhancements

3. **Low Priority** (Polish):
   - Advanced animations
   - Micro-interactions
   - Loading states