# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Security Patterns

### Database Functions for Secure Operations

When creating or modifying roadmaps, use the following database functions via RPC:

1. **create_roadmap_with_tracking** - Creates roadmap with automatic user counter updates
   - Updates: roadmap_count, free_roadmaps_used, testimonial_bonus_used
   - Usage: `supabase.rpc('create_roadmap_with_tracking', { p_user_id, p_goal_description, p_steps })`

2. **sync_user_data** - Synchronizes user data if counts get out of sync
   - Usage: `supabase.rpc('sync_user_data', { p_user_id })` or omit p_user_id to sync all

### Subscription Security

- Subscription data is stored in the `user_subscriptions` table (read-only for users)
- Only service role (webhooks) can write to this table
- Check subscription status using `checkCanCreateRoadmap()` from lib/subscription/check-limits.ts
- Users cannot delete roadmaps (no DELETE RLS policies) to prevent bypassing free limits

### Important Security Notes

- NEVER allow users to delete roadmaps or roadmap_steps
- Always use the tracking functions for roadmap operations
- Subscription status updates must only come from Stripe webhooks

## Development Commands

### Core Commands

```bash
# Development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Run Storybook for component development
npm run storybook

# Build Storybook static site
npm run build-storybook
```

### Testing

Tests are configured with Vitest and integrate with Storybook for component testing. The browser-based testing uses Playwright.

#### Console Output Management

The test suite uses a hybrid console capture approach (configured in `tests/setup.ts`):

- **Normal test runs**: Console outputs (log, warn, error) are suppressed for cleaner output
- **Failed tests**: Captured console outputs are displayed to help with debugging
- **Verbose mode**: Set `VERBOSE_TEST_LOGS=true` to also show console.log outputs for failed tests

This approach keeps test output clean while preserving debugging information when needed.

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run specific test file
npm run test:unit -- <test-file-path>

# Run E2E tests with Playwright
NEXT_PUBLIC_E2E_TEST=true npm run test:e2e

# Debug E2E tests in headed mode
NEXT_PUBLIC_E2E_TEST=true npm run test:e2e -- --project=chromium --headed

# Run single E2E test
NEXT_PUBLIC_E2E_TEST=true npx playwright test tests/e2e/roadmap-creation.spec.ts -g "should successfully create a roadmap"
```

**Note for integration tests**: Some tests require local Supabase and Next.js to be running:

1. Start local Supabase: `supabase start`
2. Start Next.js dev server: `npm run dev`
3. Run tests: `npm run test`

Integration tests will automatically skip if Supabase credentials aren't available.

### Database Commands

```bash
# Start Supabase locally
supabase start

# Reset database (caution: deletes all data)
supabase db reset

# Run new migrations
supabase migration up

# Apply specific migration
supabase migration up --target <migration-version>

# Generate TypeScript types from database
npx supabase gen types typescript --local > lib/supabase/database.types.ts
```

## Architecture Overview

### Stack

- **Framework**: Next.js 15.4.5 with App Router (React 19.1.0)
- **Styling**: Tailwind CSS v4 with CSS variables, shadcn/ui components (New York style)
- **Component Development**: Storybook v9 with Vitest integration
- **Language**: TypeScript with strict mode enabled
- **Path Aliases**: `@/*` maps to the project root

### Project Purpose

LattixIQ helps you learn mental models through creating a personalized roadmap of the most relevant ones for your current goal or problem. It provides practical, short, and easy-to-consume learning materials with examples—even personalized ones for your specific situation. Built-in scientifically proven methods like spaced repetition, IF-THEN planning, and reflection analysis help you learn faster and for good, while uncovering patterns in your thinking and behavior.

The app is based on Charlie Munger's "Latticework of Mental Models" approach, building a broad, interconnected thinking toolkit drawn from multiple disciplines. The core transformation is from a scattered, overwhelmed thinker to a clear, strategic thinker with automatic recall of the right mental model at the right time.

### Key Architecture Elements

1. **Serverless Architecture**: Designed for Netlify deployment with Edge Functions
2. **Data Layer**: Supabase for auth and Postgres with Row-Level Security
3. **AI Integration**: Vercel AI SDK for roadmap generation and journal analysis
4. **Payment**: Stripe integration for premium features
5. **Component Library**: Custom shadcn/ui components with extensive customizations

### Directory Structure

- `/app` - Next.js App Router pages and layouts with route groups `(app)`, `(auth)`, `(main)`
- `/components/ui` - shadcn/ui components with customizations
- `/components/features` - Feature-specific components organized by domain
- `/stories` - Storybook stories for components
- `/prototypes` - HTML prototypes for reference (UI/UX alignment)
- `/docs` - Comprehensive documentation including PRD, architecture, and epics
- `/lib` - Utility functions and shared code organized by domain
  - `/lib/ai` - AI services (roadmap generation, embeddings)
  - `/lib/notifications` - Push notification and reminder logic
  - `/lib/stores` - Zustand state management stores
  - `/lib/db` - Database queries and operations

### Key User Flows

1. **Goal-Based Onboarding**: User defines their challenge → AI generates personalized roadmap of 5-7 most relevant mental models
2. **Core Learning Loop**: Learn (concept) → Plan (IF-THEN application) → Reflect (analyze outcomes) for each mental model
3. **My Toolkit Hub**: Central dashboard with active roadmap, learned models library, reflection history
4. **Reflection Analysis**: AI analyzes journal entries to reveal patterns in thinking and behavior
5. **Evolving Roadmaps**: System adapts recommendations as user goals and challenges change

### Route Structure

- `/` - Redirects to `/toolkit` (main hub)
- `/new-roadmap` - Goal input and AI roadmap generation
- `/roadmap/[id]` - Visual roadmap with step progression
- `/learn/[stepId]` - Mental model learning interface with practical examples
- `/plan/[stepId]` - IF-THEN implementation planning for real-world application
- `/reflect/[stepId]` - Reflection journaling and outcome analysis
- `/toolkit` - Main dashboard with active roadmap, learned models, and reflection history
- `/unlocked/[slug]` - Progressive knowledge content discovery
- `/settings` - User preferences, notifications, billing
- `/login` - Authentication flow with "Think Better, Today" branding

### Component Development Guidelines

- All UI components are based on shadcn/ui with custom styling defined in `PROTOTYPE_COMPONENT_MAPPING.md`
- Components use Tailwind CSS v4 with CSS variables for theming
- Follow the established pattern in existing components for consistency
- Use Storybook for component development and visual testing
- Custom components should extend shadcn/ui base with consistent styling patterns

### State Management Patterns

- **Zustand stores** in `/lib/stores/` for client-side state (roadmaps, UI state)
- **React Query** for server state management (not explicitly used yet)
- **URL state** for navigation and filtering via Next.js App Router
- **Local storage** for user preferences (theme, notification settings)

### Database Schema Key Entities

- **roadmaps** - User's learning journeys with AI-generated content
- **roadmap_steps** - Individual steps within a roadmap
- **user_preferences** - Settings for notifications and reminders
- **notification_logs** - History of push notifications sent
- **unlocked_knowledge** - Progressive knowledge discovery system

### AI Integration Architecture

- **Roadmap Generation**: Vercel AI SDK creates personalized mental model roadmaps based on user goals via `/api/roadmaps/route.ts`
- **Semantic Matching**: OpenAI embeddings match user challenges to most relevant mental models
- **Reflection Analysis**: AI analyzes journal entries to identify patterns in thinking and behavior
- **Personalized Examples**: AI generates context-specific examples for each mental model
- **Caching layer** in `/lib/ai/roadmap-cache.ts` for AI responses
- **Error handling** in `/lib/ai/roadmap-error-handler.ts`

### Notification System

- **Web Push API** for browser notifications
- **Background sync** via service worker in `/public/sw.js`
- **Timezone-aware scheduling** in `/lib/notifications/timezone-utils.ts`
- **Permission management** via `/lib/hooks/useNotificationPermission.ts`

### Important Configuration Files

- `components.json` - shadcn/ui configuration
- `tsconfig.json` - TypeScript config with strict mode
- `vitest.config.ts` - Test configuration with Storybook integration
- `eslint.config.mjs` - ESLint flat config with Next.js and Storybook rules
- `playwright.config.ts` - E2E test configuration
- `supabase/config.toml` - Local Supabase configuration
- `middleware.ts` - Next.js middleware for auth and routing

## Epic and Story Naming Conventions

### Epic Naming Format

Use date-based naming for chronological ordering:

```
epic-YYYYMMDD-{feature-or-change-in-few-words}
```

**Examples:**

- `epic-20250816-analytics-monitoring`
- `epic-20250820-enhance-learning-screen`
- `epic-20250825-user-onboarding-flow`

### Story Organization

Stories are organized in epic-specific subdirectories:

```
docs/stories/epic-YYYYMMDD-feature-name/
├── README.md
├── story-1.md
├── story-2.md
└── story-N.md
```

**When creating new epics:**

1. Create epic file: `/docs/epics/epic-YYYYMMDD-feature-name.md`
2. Create story directory: `/docs/stories/epic-YYYYMMDD-feature-name/`
3. Add README.md to story directory with epic overview

**Benefits:**

- Files naturally sort chronologically
- Clear epic-story relationships
- Easy to find all stories for a specific epic
- Consistent structure for all team members

See `/docs/conventions/epic-naming.md` for detailed guidelines.
