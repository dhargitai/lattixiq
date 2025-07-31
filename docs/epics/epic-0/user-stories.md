# User Stories

## Story 0.1: Initialize Next.js Project with TypeScript

**As a** developer  
**I want** a properly configured Next.js project  
**So that** I can begin building the application with type safety

**Acceptance Criteria:**

- [ ] Next.js 15+ project created with App Router
- [ ] TypeScript configured with strict mode
- [ ] ESLint and Prettier configured
- [ ] Project runs locally with `npm run dev`
- [ ] Initial README with setup instructions

**Technical Tasks:**

1. Verify existing Next.js project setup
2. Configure `tsconfig.json` with strict settings
3. Set up `.eslintrc.json` with Next.js and TypeScript rules
4. Create `.prettierrc` for code formatting
5. Update README with project setup instructions

**Story Points:** 2

---

## Story 0.2: Configure Tailwind CSS and shadcn/ui

**As a** developer  
**I want** a configured design system  
**So that** I can build consistent UI components quickly

**Acceptance Criteria:**

- [ ] Tailwind CSS v4 properly configured
- [ ] shadcn/ui CLI installed and configured
- [ ] Base theme variables defined
- [ ] Initial UI components installed (Button, Card, Input)
- [ ] Dark mode support configured

**Technical Tasks:**

1. Configure `tailwind.config.ts` with custom theme
2. Install shadcn/ui: `npx shadcn-ui@latest init`
3. Define CSS variables in `app/globals.css`
4. Install base components: `npx shadcn-ui@latest add button card input`
5. Test dark mode toggle functionality

**Story Points:** 3

---

## Story 0.3: Set Up Supabase Project and Authentication

**As a** user  
**I want** secure authentication  
**So that** my data is protected and personalized

**Acceptance Criteria:**

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Supabase client initialized
- [ ] Auth middleware implemented
- [ ] Email/OTP authentication working
- [ ] Connection verified via Supabase MCP

**Technical Tasks:**

1. Create Supabase project at supabase.com
2. Add environment variables to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Install Supabase packages: `npm install @supabase/supabase-js @supabase/ssr`
4. Create `/lib/supabase/client.ts` and `/lib/supabase/server.ts`
5. Implement auth middleware in `/middleware.ts`
6. Create `/app/(auth)/login/page.tsx` with OTP form
7. Verify connection using Supabase MCP tools

**Story Points:** 5

---

## Story 0.4: Implement Database Schema and Migrations

**As a** developer  
**I want** a properly structured database  
**So that** I can store and retrieve application data efficiently

**Acceptance Criteria:**

- [ ] All custom ENUM types created
- [ ] pgvector extension enabled for embeddings
- [ ] All core tables created per data model specification
- [ ] Row Level Security (RLS) policies implemented
- [ ] Initial migration files created
- [ ] Database seeded with test data
- [ ] Migrations can be run locally

**Technical Tasks:**

1. Create `/supabase/migrations/` directory
2. Create migration for custom ENUM types:
   - `subscription_status`
   - `testimonial_state`
   - `roadmap_status`
   - `roadmap_step_status`
   - `ai_sentiment`
   - `knowledge_content_type`
3. Enable pgvector extension for vector embeddings
4. Create migrations for core tables:
   - `users` (profile extension with subscription info)
   - `knowledge_content` (mental models, biases, fallacies with embeddings)
   - `goal_examples` (personalized examples per knowledge content)
   - `roadmaps`
   - `roadmap_steps`
   - `application_logs`
5. Implement RLS policies for all tables
6. Create seed file with knowledge content data

**Story Points:** 8

---

## Story 0.5: Set Up CI/CD Pipeline with Netlify

**As a** development team  
**I want** automated testing and deployment  
**So that** we maintain code quality and can deploy reliably

**Acceptance Criteria:**

- [ ] GitHub Actions workflow created for testing
- [ ] Tests run on every PR
- [ ] Linting and type checking automated
- [ ] Netlify connected to GitHub repository
- [ ] Main branch auto-deploys to production via Netlify

**Technical Tasks:**

1. Create `.github/workflows/ci.yml` for testing only
2. Configure test steps:
   - Checkout code
   - Install dependencies
   - Run linter
   - Run type checker
   - Run tests
   - Build project
3. Connect Netlify to GitHub repository
4. Configure Netlify build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Set up production deployment on main branch
6. Configure environment variables in Netlify

**Story Points:** 5

---

## Story 0.6: Implement Testing Infrastructure

**As a** developer  
**I want** a complete testing setup  
**So that** I can ensure code quality and prevent regressions

**Acceptance Criteria:**

- [ ] Vitest configured for unit tests
- [ ] React Testing Library set up
- [ ] Playwright configured for E2E tests
- [ ] Example tests created
- [ ] Test commands added to package.json

**Technical Tasks:**

1. Install testing dependencies:
   ```bash
   npm install -D vitest @testing-library/react @testing-library/user-event @vitejs/plugin-react playwright
   ```
2. Configure `vitest.config.ts`
3. Create `/tests/unit/`, `/tests/integration/`, `/tests/e2e/` directories
4. Write example unit test for a utility function
5. Write example E2E test for login flow
6. Add test scripts to `package.json`

**Story Points:** 5

---

## Story 0.7: Create Developer Documentation

**As a** new developer  
**I want** comprehensive setup documentation  
**So that** I can quickly start contributing to the project

**Acceptance Criteria:**

- [ ] README updated with full setup instructions
- [ ] Architecture decision records (ADRs) created
- [ ] API documentation template created
- [ ] Contributing guidelines written
- [ ] Code style guide documented

**Technical Tasks:**

1. Update README with:
   - Prerequisites
   - Setup steps
   - Common commands
   - Troubleshooting
2. Create `/docs/adr/` directory for architecture decisions
3. Write CONTRIBUTING.md
4. Document code conventions
5. Create pull request template

**Story Points:** 3

---
