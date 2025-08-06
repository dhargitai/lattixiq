# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

LattixIQ is a "Rationality Toolkit" app that helps users overcome the "knowing-doing gap" in personal development. It creates personalized learning journeys tied to real-world goals, transforming passive knowledge into applied wisdom through mental models and cognitive bias awareness.

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

1. **Onboarding**: Goal selection → AI-powered roadmap generation (5-7 mental models)
2. **Core Learning Loop**: Learn → Plan → Reflect cycle for each concept
3. **My Toolkit Hub**: Central dashboard with active roadmap, learned models, history
4. **Application Log**: Journal of all reflections for AI analysis
5. **Unlocked Knowledge**: Progressive discovery of knowledge content as users complete steps

### Route Structure

- `/` - Landing page with hero and CTA
- `/new-roadmap` - AI roadmap generation flow
- `/roadmap/[id]` - Active roadmap view
- `/learn/[stepId]` - Learning content for specific step
- `/plan/[stepId]` - Planning interface for step application
- `/reflect/[stepId]` - Reflection/journaling for step completion
- `/toolkit` - Main dashboard showing active and completed roadmaps
- `/unlocked/[slug]` - Knowledge content viewer for unlocked concepts
- `/settings` - User preferences, notifications, billing
- `/login` - Authentication flow

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

- **Vercel AI SDK** for roadmap generation via `/api/roadmaps/route.ts`
- **OpenAI embeddings** for semantic search in knowledge content
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
