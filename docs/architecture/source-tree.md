# LattixIQ App - Source Tree Architecture

This document provides the comprehensive source tree structure for the LattixIQ personalized mental models learning app, extracted from the architectural planning documentation and current implementation.

## Overview

LattixIQ is a Next.js 15.4.5 application using the App Router pattern, designed as a serverless architecture for Netlify deployment. The project follows a monorepo structure with clear separation of concerns between frontend components, backend API routes, and supporting infrastructure.

## Complete Source Tree Structure

```
/lattixiq-app/
├── .github/                   # GitHub configuration and CI/CD
│   ├── pull_request_template.md
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI pipeline
├── .husky/                    # Git hooks for code quality
│   ├── pre-commit            # Pre-commit hook script
│   └── pre-push              # Pre-push hook script
├── .storybook/                # Storybook configuration
│   ├── decorators.tsx        # Global decorators
│   ├── main.ts               # Main Storybook config
│   ├── preview.ts            # Preview configuration
│   ├── storybook.css         # Storybook-specific styles
│   ├── tailwind.css          # Tailwind styles for Storybook
│   └── vitest.setup.ts       # Vitest integration setup
├── app/                       # Next.js App Router - Core Application Logic
│   ├── (app)/                # Protected main application routes
│   │   ├── layout.tsx        # App route group layout
│   │   ├── learn/            # Learning interface for mental models
│   │   │   └── [stepId]/     # Dynamic step-specific learning pages
│   │   │       ├── __tests__/ # Route-level tests
│   │   │       ├── loading.tsx
│   │   │       └── page.tsx
│   │   ├── new-roadmap/      # Roadmap creation interface
│   │   │   ├── __tests__/
│   │   │   └── page.tsx
│   │   ├── plan/             # Planning interface for roadmap steps
│   │   │   ├── [stepId]/
│   │   │   │   └── page.tsx
│   │   │   └── __tests__/
│   │   ├── reflect/          # Reflection/journaling interface
│   │   │   └── [stepId]/
│   │   │       ├── __tests__/
│   │   │       └── page.tsx
│   │   ├── roadmap/          # Main roadmap view
│   │   │   ├── __tests__/
│   │   │   └── page.tsx
│   │   ├── settings/         # User settings and preferences
│   │   │   └── page.tsx
│   │   ├── toolkit/          # "My Toolkit" dashboard
│   │   │   └── page.tsx
│   │   └── unlocked/         # Unlocked knowledge content viewer
│   │       └── [slug]/
│   │           ├── UnlockedViewer.tsx
│   │           ├── loading.tsx
│   │           └── page.tsx
│   ├── (auth)/               # Public authentication routes
│   │   └── login/
│   │       └── page.tsx
│   ├── (main)/               # Main public routes
│   │   └── test/             # Test utilities and pages
│   │       └── notifications/
│   ├── api/                  # Backend API Routes (Serverless Functions)
│   │   ├── auth/             # Authentication endpoints
│   │   │   └── logout/
│   │   │       └── route.ts
│   │   ├── notifications/    # Push notification system
│   │   │   ├── __tests__/    # API route tests
│   │   │   ├── cron/         # Scheduled notification processing
│   │   │   │   └── route.ts
│   │   │   ├── preferences/  # User notification preferences
│   │   │   │   └── route.ts
│   │   │   ├── schedule/     # Notification scheduling
│   │   │   │   └── route.ts
│   │   │   └── test/         # Test endpoints
│   │   │       └── route.ts
│   │   ├── roadmaps/         # Roadmap management endpoints
│   │   │   ├── __tests__/
│   │   │   └── route.ts      # POST to create, GET to list roadmaps
│   │   ├── user/             # User profile management
│   │   │   └── preferences/
│   │   │       └── route.ts
│   │   └── users/            # User-related endpoints
│   │       └── testimonial/
│   │           └── route.ts
│   ├── auth/                 # Supabase auth callback handling
│   │   └── callback/
│   │       └── route.ts
│   ├── globals.css           # Global styles imported by layout
│   ├── layout.tsx            # Root layout for entire application
│   ├── page.tsx              # Landing/home page
│   └── theme.css             # CSS custom properties for theming
├── components/               # React Component Library
│   ├── features/             # Feature-specific components
│   │   ├── new-roadmap/      # Roadmap creation components
│   │   │   ├── GeneratingRoadmap.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   └── NewRoadmapForm.tsx
│   │   ├── notifications/    # Push notification components
│   │   │   ├── NotificationPreview.tsx
│   │   │   ├── NotificationTest.tsx
│   │   │   └── ServiceWorkerRegistration.tsx
│   │   ├── roadmap/          # Core roadmap interface components
│   │   │   ├── LearnScreen.tsx
│   │   │   ├── LearnSkeleton.tsx
│   │   │   ├── PlanScreen.tsx
│   │   │   ├── PlanSkeleton.tsx
│   │   │   ├── ReflectScreen.tsx
│   │   │   ├── RoadmapConnector.tsx
│   │   │   ├── RoadmapError.tsx
│   │   │   ├── RoadmapSkeleton.tsx
│   │   │   ├── RoadmapStep.tsx
│   │   │   ├── RoadmapView.tsx
│   │   │   └── __tests__/    # Component-level tests
│   │   ├── settings/         # Settings page components
│   │   │   └── ReminderSettings.tsx
│   │   ├── shared/           # Shared feature components
│   │   │   └── BottomNav.tsx
│   │   └── toolkit/          # Toolkit dashboard components
│   │       ├── ActiveRoadmapCard.tsx
│   │       ├── ActiveRoadmapCardError.tsx
│   │       ├── ActiveRoadmapCardSkeleton.tsx
│   │       ├── EmptyState.tsx
│   │       ├── HeaderGreeting.tsx
│   │       ├── NavigationCards.tsx
│   │       ├── QuickActions.tsx
│   │       ├── QuickStats.tsx
│   │       ├── SenjaWidget.tsx
│   │       ├── TestimonialPrompt.tsx
│   │       ├── TestimonialPromptWrapper.tsx
│   │       ├── ToolkitClient.tsx
│   │       └── UnlockedKnowledgeModal.tsx
│   ├── settings/             # Settings-specific components
│   │   ├── BillingSection.tsx
│   │   ├── LogoutButton.tsx
│   │   ├── NotificationSettings.tsx
│   │   └── SettingsPageContent.tsx
│   ├── shared/               # Reusable, app-specific components
│   │   └── ReminderSettings.tsx
│   ├── theme-provider.tsx    # Theme context provider
│   └── ui/                   # Base shadcn/ui components
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── badge.tsx
│       ├── bottom-navigation.tsx
│       ├── breadcrumb.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input-otp.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── progress-header.tsx
│       ├── progress.tsx
│       ├── screen-card.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── skeleton.tsx
│       ├── sonner.tsx
│       ├── star-rating.tsx
│       ├── switch.tsx
│       ├── textarea.tsx
│       ├── timeline.tsx
│       ├── toggle-group.tsx
│       └── toggle.tsx
├── docs/                     # Comprehensive Documentation
│   ├── NETLIFY_SETUP.md      # Deployment documentation
│   ├── adr/                  # Architecture Decision Records
│   │   ├── ADR-001-use-nextjs-app-router.md
│   │   ├── ADR-002-use-supabase-for-backend.md
│   │   ├── README.md
│   │   └── adr-template.md
│   ├── api/                  # API documentation
│   │   ├── README.md
│   │   ├── api-endpoint-template.md
│   │   ├── auth-callback.md
│   │   └── verify-otp.md
│   ├── architecture/         # Technical architecture docs
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
│   │   ├── index.md
│   │   └── source-tree.md    # This document
│   ├── architecture.md       # Main architecture overview
│   ├── code-style.md         # Code style guidelines
│   ├── developer-guides/     # Developer-specific guides
│   │   └── test-data-mode.md
│   ├── epics/                # Epic and story documentation
│   │   ├── epic-0/           # Detailed epic breakdowns
│   │   │   ├── acceptance-criteria.md
│   │   │   ├── epic-description.md
│   │   │   ├── epic-overview.md
│   │   │   ├── epic-summary.md
│   │   │   ├── index.md
│   │   │   └── user-stories.md
│   │   ├── epic-1/
│   │   │   └── [similar structure]
│   │   ├── epic-2/
│   │   │   └── [similar structure]
│   │   ├── epic-0-project-foundation.md
│   │   ├── epic-1-first-win.md
│   │   ├── epic-2-core-learning-loop.md
│   │   ├── epic-3-building-toolkit.md
│   │   ├── epic-4-ai-journal-analysis.md
│   │   ├── epic-5-analytics-monitoring.md
│   │   ├── epic-6-settings-preferences.md
│   │   ├── epic-unlocked-knowledge-viewer-mvp.md
│   │   ├── index.md
│   │   └── ui-prototype-alignment-epic.md
│   ├── frontend-patterns.md  # Frontend development patterns
│   ├── frontend-spec.md      # Frontend specifications
│   ├── prd/                  # Product Requirements Documentation
│   │   ├── 1-introduction-executive-summary.md
│   │   ├── 2-product-goal-vision.md
│   │   ├── 3-user-persona.md
│   │   ├── 4-user-flow-features.md
│   │   ├── 5-monetization-premium-features.md
│   │   ├── 6-success-metrics.md
│   │   ├── 7-future-considerations-v2-and-beyond.md
│   │   └── index.md
│   ├── prd.md                # Main product requirements document
│   ├── prompts/              # AI prompt engineering
│   │   └── roadmap-generation-algorithm-prompt.md
│   ├── step-unlock-bug-investigation-report.md
│   ├── stories/              # User story specifications
│   │   ├── 0.1.story.md      # Individual story files
│   │   ├── 0.2.story.md
│   │   ├── [epic stories...]
│   │   ├── ui.1.story.md     # UI-specific stories
│   │   └── unlocked-mvp.*.story.md
│   └── tutorials/            # Technical tutorials
│       └── vector-embeddings-tutorial.md
├── hooks/                    # Custom React hooks directory (placeholder)
├── lib/                      # Shared Utilities and Business Logic
│   ├── ai/                   # AI service integration
│   │   ├── __tests__/        # AI service tests
│   │   ├── embeddings-service.ts # Vector embeddings for semantic search
│   │   ├── roadmap-cache.ts  # AI response caching
│   │   ├── roadmap-error-handler.ts # Error handling for AI services
│   │   ├── roadmap-generator.ts # AI roadmap creation logic
│   │   ├── roadmap-supabase-service.ts # Supabase integration for AI
│   │   └── roadmap-validation.ts # AI response validation
│   ├── auth/                 # Authentication utilities
│   │   └── supabase.ts       # Supabase client configuration
│   ├── db/                   # Data Access Layer
│   │   ├── toolkit.ts        # Toolkit-related database operations
│   │   ├── unlocked-knowledge.server.ts # Server-side knowledge operations
│   │   ├── unlocked-knowledge.ts # Knowledge content management
│   │   └── users.ts          # User profile operations
│   ├── hooks/                # Custom React hooks
│   │   ├── useKeyboardVisibility.ts
│   │   ├── useNotificationPermission.ts
│   │   └── useUserSettings.ts
│   ├── knowledge_content.json # Static knowledge content database
│   ├── mocks/                # Test mocks and fixtures
│   │   └── test-knowledge-content.ts
│   ├── navigation/           # Navigation utilities
│   │   └── visibility.ts
│   ├── notifications/        # Push notification system
│   │   ├── permission-manager.ts # Browser notification permissions
│   │   ├── reminder-cleanup.ts # Notification cleanup logic
│   │   └── timezone-utils.ts # Timezone handling for notifications
│   ├── queries/              # Database query functions
│   │   └── roadmap-queries.ts
│   ├── stores/               # Zustand global state management
│   │   ├── __tests__/        # Store tests
│   │   ├── new-roadmap-store.ts # Roadmap creation state
│   │   └── roadmap-store.ts  # Active roadmap state
│   ├── supabase/             # Supabase configuration and types
│   │   ├── client.ts         # Client-side Supabase client
│   │   ├── database.types.ts # Generated database types
│   │   ├── rpc-extensions.ts # Custom RPC function definitions
│   │   ├── server.ts         # Server-side Supabase client
│   │   └── types.ts          # Supabase-related type definitions
│   ├── test-utils/           # Testing utilities
│   │   ├── README.md
│   │   └── types.ts
│   ├── test-utils.ts         # Main test utilities
│   ├── transformers/         # Data transformation utilities
│   │   └── roadmap-transformers.ts
│   ├── types/                # Shared TypeScript interfaces
│   │   ├── ai.ts             # AI service types
│   │   └── rpc-functions.ts  # Database RPC function types
│   ├── utils/                # Utility functions
│   │   └── testimonial-milestones.ts
│   └── utils.ts              # General utilities (cn, formatters, etc.)
├── public/                   # Static Assets
│   ├── badge-72x72.png       # PWA badge icons
│   ├── badge-72x72.svg
│   ├── favicon.ico           # Application favicon
│   ├── file.svg              # Default Next.js icons
│   ├── generate-icons.html   # Icon generation utility
│   ├── globe.svg
│   ├── icon-*.png           # PWA icons in various sizes
│   ├── icon-*.svg           # SVG versions of PWA icons
│   ├── manifest.json        # PWA manifest
│   ├── next.svg
│   ├── sw.js                # Service worker for PWA notifications
│   ├── vercel.svg
│   └── window.svg
├── scripts/                  # Utility scripts
│   ├── create-temp-icons.js  # Icon generation scripts
│   ├── fix-build-errors.ts   # Build error fixes
│   ├── generate-embeddings.ts # Vector embedding generation
│   ├── generate-icons.js
│   ├── generate-pwa-icons.ts
│   ├── sync-auth-users.js    # User synchronization
│   └── test-semantic-search.ts # Search testing
├── services/                 # External service integrations (placeholder)
├── stories/                  # Storybook Component Stories
│   ├── Badge.stories.tsx     # Component stories
│   ├── BottomNavigation.stories.tsx
│   ├── Button.stories.tsx
│   ├── Card.stories.tsx
│   ├── Configure.mdx         # Storybook configuration docs
│   ├── Input.stories.tsx
│   ├── Progress.stories.tsx
│   ├── ProgressHeader.stories.tsx
│   ├── ScreenCard.stories.tsx
│   ├── StarRating.stories.tsx
│   ├── Switch.stories.tsx
│   ├── ThemeShowcase.stories.tsx
│   ├── Timeline.stories.tsx
│   ├── assets/               # Storybook static assets
│   └── [component].css       # Component-specific styling
├── stores/                   # Additional store files (placeholder)
├── supabase/                 # Supabase Configuration
│   ├── .branches/            # Supabase branch management
│   ├── .temp/                # Temporary files
│   ├── config.toml           # Supabase project configuration
│   ├── migrations/           # Database migration files
│   │   ├── 20240101000000_create_enums.sql
│   │   ├── 20240101000001_enable_pgvector.sql
│   │   ├── 20240101000002_create_core_tables.sql
│   │   ├── 20240101000003_enable_rls_policies.sql
│   │   ├── 20240102000001_add_vector_index.sql
│   │   ├── 20240102000002_create_user_trigger.sql
│   │   ├── [recent migrations...]
│   │   └── 20250808_add_testimonial_url_to_users.sql
│   ├── seed.sql              # Database seeding
│   └── templates/            # Email templates
│       └── magic_link.html
├── tests/                    # Test Suite Organization
│   ├── README.md             # Testing documentation
│   ├── e2e/                  # Playwright End-to-End tests
│   │   ├── .auth/            # Authentication state for tests
│   │   ├── home-page.spec.ts
│   │   ├── roadmap-creation-simple.spec.ts
│   │   ├── roadmap-creation.spec.ts
│   │   └── step-completion.spec.ts
│   ├── fail-path-reporter.ts # Custom test reporter
│   ├── fixtures/             # Test data and fixtures
│   │   └── test-data.ts
│   ├── integration/          # Vitest Integration tests
│   │   ├── Button.test.tsx   # Component integration tests
│   │   ├── navigation.test.tsx
│   │   ├── step-unlock-bug.test.ts
│   │   ├── testimonial-flow.test.ts
│   │   ├── toolkit/          # Toolkit-specific integration tests
│   │   └── unlocked/         # Knowledge system tests
│   ├── setup.ts              # Test environment setup
│   ├── test-utils/           # Test utilities and mocks
│   │   └── supabase-mock-factory.ts
│   ├── unit/                 # Vitest Unit tests
│   │   ├── BottomNav.test.tsx
│   │   ├── api/              # API route unit tests
│   │   ├── components/       # Component unit tests
│   │   ├── navigation-visibility.test.ts
│   │   ├── settings/         # Settings component tests
│   │   ├── step-unlock-race-condition.test.ts
│   │   ├── utils/            # Utility function tests
│   │   └── utils.test.ts
│   └── utils/                # Test helper utilities
│       ├── auth-mocks.ts
│       └── supabase-test-client.ts
├── prototypes/               # HTML Prototypes (Reference)
│   ├── README.md
│   ├── index.html            # Landing page prototype
│   ├── learn.html            # Learning interface prototype
│   ├── login.html            # Login screen prototype
│   ├── my-toolkit.html       # Toolkit dashboard prototype
│   ├── onboarding.html       # Onboarding flow prototype
│   ├── plan.html             # Planning interface prototype
│   ├── reflect.html          # Reflection interface prototype
│   ├── roadmap.html          # Main roadmap view prototype
│   └── settings.html         # Settings page prototype
├── middleware.ts             # Next.js middleware (route protection)
├── .env.local                # Local environment variables (not in git)
├── .env.example              # Example environment variables
├── .env.test                 # Test environment variables (not in git)
├── .gitignore                # Git ignore rules
├── .gitleaks.toml            # Git secrets scanning configuration
├── .mcp.json                 # MCP server configuration
├── .prettierrc               # Prettier code formatting config
├── components.json           # shadcn/ui configuration
├── eslint.config.mjs         # ESLint flat config with Next.js rules
├── next.config.ts            # Next.js configuration
├── playwright.config.ts      # Playwright E2E testing configuration
├── postcss.config.mjs        # PostCSS configuration for Tailwind
├── tailwind.config.mjs       # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration (strict mode)
├── tsconfig.tsbuildinfo      # TypeScript build info cache
├── vitest.config.ts          # Vitest testing configuration
├── vitest.shims.d.ts         # Vitest TypeScript shims
├── package.json              # Node.js dependencies and scripts
├── package-lock.json         # Locked dependency versions
├── CLAUDE.md                 # Claude Code AI assistant instructions
├── CONTRIBUTING.md           # Contribution guidelines
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
