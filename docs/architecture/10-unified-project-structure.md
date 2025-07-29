# **10. Unified Project Structure**

This is the complete, top-down view of our project's monorepo. It serves as a map for all development, showing where every type of file and logic should reside.

```
/lattixiq/
├── .github/
│   └── /workflows/         # CI/CD pipelines (e.g., test on push, deploy on merge)
│       └── ci.yaml
├── .vscode/                # VSCode specific settings (e.g., recommended extensions)
├── /app/
│   ├── /api/               # Backend API Routes (Serverless Functions)
│   │   ├── /roadmaps/
│   │   │   └── route.ts
│   │   └── ...             # Other resource-based routes
│   ├── /(app)/             # Protected main application routes
│   │   ├── /                 # The main dashboard / roadmap view
│   │   │   └── page.tsx
│   │   └── /toolkit/         # The "My Toolkit" screen
│   │       └── page.tsx
│   ├── /(auth)/            # Public authentication routes
│   │   └── /login/
│   │       └── page.tsx
│   ├── layout.tsx            # Root layout for the entire app
│   └── global.css            # Global styles (imported by layout)
├── /components/
│   ├── /ui/                # Base shadcn/ui components (e.g., button.tsx)
│   ├── /shared/            # Reusable, app-specific components (e.g., RoadmapCard.tsx)
│   └── /features/          # Components tied to a specific feature/route
├── /lib/
│   ├── /db/                # Data Access Layer (e.g., roadmaps.ts)
│   ├── /stores/            # Zustand global state stores (e.g., user-store.ts)
│   ├── /ai/                # Vercel AI SDK setup and helper functions
│   ├── /types/             # Shared TypeScript interfaces (e.g., types.ts)
│   └── utils.ts            # General utility functions (e.g., `cn` for Tailwind)
├── /public/                # Static assets (images, fonts, etc.)
├── /supabase/
│   └── /migrations/        # Supabase database migration files
├── /tests/
│   ├── /e2e/               # Playwright End-to-End tests
│   ├── /integration/       # Vitest Integration tests
│   └── /unit/              # Vitest Unit tests
├── middleware.ts             # For protecting routes (authentication guard)
├── .env.local              # Local environment variables (NOT committed to git)
├── .eslintrc.json          # ESLint configuration for code style
├── next.config.mjs           # Next.js configuration
├── postcss.config.mjs        # PostCSS configuration for Tailwind
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```
