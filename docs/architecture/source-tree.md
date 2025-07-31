# LattixIQ App - Source Tree Architecture

This document provides the comprehensive source tree structure for the LattixIQ "Rationality Toolkit" application, extracted from the architectural planning documentation and current implementation.

## Overview

LattixIQ is a Next.js 15.4.5 application using the App Router pattern, designed as a serverless architecture for Netlify deployment. The project follows a monorepo structure with clear separation of concerns between frontend components, backend API routes, and supporting infrastructure.

## Complete Source Tree Structure

```
/lattixiq-app/
├── .github/
│   └── workflows/                # CI/CD pipelines (test on push, deploy on merge)
│       └── ci.yaml
├── .vscode/                      # VSCode settings and recommended extensions
├── app/                          # Next.js App Router - Core Application Logic
│   ├── api/                      # Backend API Routes (Serverless Functions)
│   │   ├── roadmaps/
│   │   │   └── route.ts         # POST to create, GET to list roadmaps
│   │   ├── logs/
│   │   │   └── route.ts         # POST to create reflection logs
│   │   ├── user/
│   │   │   └── me/
│   │   │       └── route.ts     # PATCH to update user profile
│   │   └── [other-resources]/   # Additional resource-based API endpoints
│   ├── (app)/                   # Protected main application routes
│   │   ├── page.tsx             # Main dashboard/roadmap view
│   │   ├── toolkit/             # "My Toolkit" screen
│   │   │   └── page.tsx
│   │   ├── learn/               # Learning interface for mental models
│   │   │   └── page.tsx
│   │   ├── plan/                # Planning interface
│   │   │   └── page.tsx
│   │   ├── reflect/             # Reflection/journaling interface
│   │   │   └── page.tsx
│   │   └── settings/            # User settings
│   │       └── page.tsx
│   ├── (auth)/                  # Public authentication routes
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── onboarding/          # Post-signup onboarding flow
│   │       └── page.tsx
│   ├── layout.tsx               # Root layout for entire application
│   ├── page.tsx                 # Landing/home page
│   ├── globals.css              # Global styles imported by layout
│   ├── theme.css                # CSS custom properties for theming
│   └── favicon.ico              # Application favicon
├── components/                   # React Component Library
│   ├── ui/                      # Base shadcn/ui components (unstyled/minimal)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── progress.tsx
│   │   ├── accordion.tsx
│   │   ├── alert.tsx
│   │   ├── badge.tsx
│   │   ├── bottom-navigation.tsx
│   │   ├── input-otp.tsx
│   │   ├── progress-header.tsx
│   │   ├── screen-card.tsx
│   │   ├── star-rating.tsx
│   │   ├── switch.tsx
│   │   ├── textarea.tsx
│   │   ├── timeline.tsx
│   │   ├── toggle-group.tsx
│   │   └── toggle.tsx
│   ├── shared/                  # Reusable, app-specific components
│   │   ├── RoadmapCard.tsx      # Displays roadmap overview
│   │   ├── SiteHeader.tsx       # Main navigation header
│   │   ├── MentalModelCard.tsx  # Individual mental model display
│   │   └── ReflectionForm.tsx   # Journal entry form
│   └── features/                # Feature-specific components
│       ├── settings/
│       │   └── NotificationToggles.tsx
│       ├── roadmap/
│       │   ├── Step.tsx         # Individual roadmap step
│       │   └── ProgressTracker.tsx
│       ├── onboarding/
│       │   └── GoalSelector.tsx
│       └── toolkit/
│           └── ModelLibrary.tsx
├── lib/                         # Shared Utilities and Business Logic
│   ├── db/                     # Data Access Layer
│   │   ├── roadmaps.ts         # Roadmap database operations
│   │   ├── users.ts            # User profile operations
│   │   ├── logs.ts             # Reflection log operations
│   │   └── mental-models.ts    # Mental model data operations
│   ├── stores/                 # Zustand global state management
│   │   ├── user-store.ts       # User profile and session state
│   │   ├── roadmap-store.ts    # Active roadmap state
│   │   └── ui-store.ts         # UI state (modals, loading, etc.)
│   ├── ai/                     # Vercel AI SDK integration
│   │   ├── roadmap-generator.ts # AI roadmap creation logic
│   │   ├── reflection-analyzer.ts # Journal analysis
│   │   └── embeddings.ts       # Vector embedding utilities
│   ├── types/                  # Shared TypeScript interfaces
│   │   ├── index.ts            # Main type exports
│   │   ├── database.ts         # Database schema types
│   │   ├── api.ts              # API request/response types
│   │   └── ai.ts               # AI service types
│   ├── auth/                   # Authentication utilities
│   │   └── supabase.ts         # Supabase client configuration
│   ├── payments/               # Stripe integration
│   │   └── stripe.ts           # Payment processing utilities
│   └── utils.ts                # General utilities (cn, formatters, etc.)
├── hooks/                      # Custom React hooks (if needed)
├── services/                   # External service integrations
├── stores/                     # Additional store files (if needed)
├── public/                     # Static Assets
│   ├── images/                 # Application images
│   ├── icons/                  # Icon files
│   ├── file.svg                # Default Next.js icons
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── supabase/                   # Supabase Configuration
│   ├── migrations/             # Database migration files
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_roadmaps.sql
│   │   └── 003_add_rls_policies.sql
│   └── config.toml             # Supabase project configuration
├── tests/                      # Test Suite Organization
│   ├── e2e/                    # Playwright End-to-End tests
│   │   ├── user-registration.spec.ts
│   │   ├── roadmap-creation.spec.ts
│   │   └── learning-loop.spec.ts
│   ├── integration/            # Vitest Integration tests
│   │   ├── api/                # API route testing
│   │   │   ├── roadmaps.test.ts
│   │   │   └── logs.test.ts
│   │   └── components/         # Component integration tests
│   │       ├── RoadmapCard.test.tsx
│   │       └── ReflectionForm.test.tsx
│   └── unit/                   # Vitest Unit tests
│       ├── utils.test.ts       # Utility function tests
│       ├── ai/                 # AI service unit tests
│       │   └── roadmap-generator.test.ts
│       └── db/                 # Database layer unit tests
│           └── roadmaps.test.ts
├── stories/                    # Storybook Component Stories
│   ├── assets/                 # Storybook static assets
│   ├── Badge.stories.tsx
│   ├── Button.stories.tsx
│   ├── Card.stories.tsx
│   ├── Input.stories.tsx
│   ├── Progress.stories.tsx
│   ├── ProgressHeader.stories.tsx
│   ├── ScreenCard.stories.tsx
│   ├── StarRating.stories.tsx
│   ├── Switch.stories.tsx
│   ├── ThemeShowcase.stories.tsx
│   ├── Timeline.stories.tsx
│   ├── Configure.mdx           # Storybook configuration docs
│   └── [component].css         # Component-specific styling
├── prototypes/                 # HTML Prototypes (Reference)
│   ├── index.html              # Landing page prototype
│   ├── login.html              # Login screen prototype
│   ├── onboarding.html         # Onboarding flow prototype
│   ├── roadmap.html            # Main roadmap view prototype
│   ├── learn.html              # Learning interface prototype
│   ├── plan.html               # Planning interface prototype
│   ├── reflect.html            # Reflection interface prototype
│   ├── my-toolkit.html         # Toolkit dashboard prototype
│   └── settings.html           # Settings page prototype
├── docs/                       # Comprehensive Documentation
│   ├── architecture/           # Technical architecture docs
│   │   ├── index.md
│   │   ├── 1-high-level-architecture.md
│   │   ├── 2-tech-stack.md
│   │   ├── 3-data-models.md
│   │   ├── 4-api-specification.md
│   │   ├── 5-system-components.md
│   │   ├── 6-core-workflows.md
│   │   ├── 7-database-schema.md
│   │   ├── 8-frontend-architecture.md
│   │   ├── 9-backend-architecture.md
│   │   ├── 10-unified-project-structure.md
│   │   ├── 11-testing-strategy.md
│   │   ├── 12-coding-standards.md
│   │   ├── 13-error-handling-strategy.md
│   │   ├── 14-deployment-architecture.md
│   │   ├── 15-monitoring-and-observability.md
│   │   ├── githubworkflowsciyaml.md
│   │   └── source-tree.md      # This document
│   ├── prd/                    # Product Requirements Documentation
│   │   ├── index.md
│   │   ├── 1-introduction-executive-summary.md
│   │   ├── 2-product-goal-vision.md
│   │   ├── 3-user-persona.md
│   │   ├── 4-user-flow-features.md
│   │   ├── 5-monetization-premium-features.md
│   │   ├── 6-success-metrics.md
│   │   └── 7-future-considerations-v2-and-beyond.md
│   ├── epics/                  # Epic and story documentation
│   │   ├── index.md
│   │   ├── epic-0-project-foundation.md
│   │   ├── epic-1-first-win.md
│   │   ├── epic-2-core-learning-loop.md
│   │   ├── epic-3-building-toolkit.md
│   │   ├── epic-4-ai-journal-analysis.md
│   │   ├── epic-5-analytics-monitoring.md
│   │   ├── epic-0/             # Detailed epic breakdown
│   │   ├── epic-1/
│   │   └── epic-2/
│   └── stories/                # User story specifications
│       ├── 0.1.story.md        # Individual story files
│       ├── 0.2.story.md
│       └── [additional-stories]
├── middleware.ts               # Next.js middleware (route protection)
├── .env.local                  # Local environment variables (not in git)
├── .env.example               # Example environment variables
├── .env.test                  # Test environment variables (not in git)
├── .gitignore                 # Git ignore rules
├── .eslintrc.json            # ESLint configuration for code quality
├── eslint.config.mjs         # ESLint flat config with Next.js rules
├── next.config.ts            # Next.js configuration
├── postcss.config.mjs        # PostCSS configuration for Tailwind
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration (strict mode)
├── tsconfig.tsbuildinfo      # TypeScript build info cache
├── vitest.config.ts          # Vitest testing configuration
├── vitest.shims.d.ts         # Vitest TypeScript shims
├── components.json           # shadcn/ui configuration
├── package.json              # Node.js dependencies and scripts
├── package-lock.json         # Locked dependency versions
├── CLAUDE.md                 # Claude Code AI assistant instructions
├── PROTOTYPE_COMPONENT_MAPPING.md # Component mapping documentation
└── README.md                 # Project overview and setup instructions
```

## Architecture Principles

### 1. **Serverless-First Design**

- API routes deployed as Vercel/Netlify serverless functions
- Stateless application design
- External services for persistence (Supabase) and AI (Vercel AI SDK)

### 2. **Component-Driven Development**

- Three-tier component architecture: `ui/` → `shared/` → `features/`
- Storybook for component development and documentation
- shadcn/ui as foundation with custom styling

### 3. **Data Access Layer Abstraction**

- All database operations isolated in `/lib/db/`
- API routes consume data access functions, never raw queries
- Consistent error handling and validation patterns

### 4. **Test-Driven Development**

- Integration tests as foundation (`/tests/integration/`)
- E2E tests for critical user flows (`/tests/e2e/`)
- Unit tests for complex business logic (`/tests/unit/`)

### 5. **Progressive Enhancement**

- URL state for bookmarkable interactions
- Local component state for ephemeral UI
- Global state (Zustand) for cross-component data

## Current Implementation Status

### ✅ **Implemented**

- Next.js App Router foundation with route groups
- shadcn/ui component library with customizations
- Storybook integration with Vitest
- TypeScript strict mode configuration
- Basic middleware for route protection
- Comprehensive documentation structure

### 🚧 **In Progress**

- API route implementations
- Database schema and migrations
- Authentication integration with Supabase
- AI service integration

### 📋 **Planned**

- Complete test suite implementation
- CI/CD pipeline setup
- Production deployment configuration
- Performance monitoring and observability

## Key Integration Points

### Authentication Flow

```
middleware.ts → Supabase Auth → API Routes → Database (RLS)
```

### Component Data Flow

```
UI Components → Zustand Stores → API Routes → Data Access Layer → Supabase
```

### Testing Strategy

```
E2E (Playwright) → Integration (Vitest + RTL) → Unit (Vitest) → Storybook
```

This source tree structure provides a scalable foundation for the LattixIQ rationality toolkit, balancing developer experience with production requirements while maintaining clear separation of concerns across all application layers.
