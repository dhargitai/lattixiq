# LattixIQ - Your Personal Rationality Toolkit 🧠

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

_Transform passive knowledge into applied wisdom through personalized learning journeys_

[Live Demo](#) • [Documentation](./docs) • [Report Bug](https://github.com/yourusername/lattixiq-app/issues) • [Request Feature](https://github.com/yourusername/lattixiq-app/issues)

</div>

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Setup Instructions](#-setup-instructions)
- [Environment Variables](#-environment-variables)
- [Common Commands](#-common-commands)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [Documentation](#-documentation)

## 🌟 Project Overview

**LattixIQ** is your personal rationality toolkit that helps you build a comprehensive framework of mental models and cognitive bias awareness for navigating life's challenges. Rather than consuming passive content, you'll master proven problem-solving and decision-making frameworks through structured application using behavioral science techniques like IF-THEN journaling and spaced repetition.

### Key Features

- **🎯 Personalized Learning Paths**: AI analyzes your specific goals to create custom roadmaps of 5-7 mental models
- **🔄 Learn-Plan-Reflect Loop**: Structured methodology ensures concepts move from theory to practice
- **📊 Progress Tracking**: Visual roadmaps and reflection logs show your growth over time
- **🤖 AI-Powered Insights**: Advanced semantic matching connects the right mental models to your unique challenges
- **📱 Mobile-First Design**: Learn and reflect anywhere with our responsive, PWA-ready interface

## 🛠️ Tech Stack

| Category                   | Technology            | Version   | Purpose                                                   |
| -------------------------- | --------------------- | --------- | --------------------------------------------------------- |
| **Frontend Framework**     | Next.js               | `~15.4.5` | React framework with App Router for server-side rendering |
| **Frontend Language**      | TypeScript            | `~5.5.3`  | Type safety and improved developer experience             |
| **UI Components**          | shadcn/ui             | `latest`  | Customizable component library with New York style        |
| **Styling**                | Tailwind CSS          | `~4.0.0`  | Utility-first CSS framework with CSS variables            |
| **State Management**       | Zustand               | `~4.5.2`  | Lightweight state management for complex client state     |
| **Backend**                | Next.js API Routes    | `~15.4.5` | Serverless API endpoints                                  |
| **Database**               | Supabase (PostgreSQL) | `latest`  | Managed PostgreSQL with Row-Level Security                |
| **Authentication**         | Supabase Auth         | `~2.0.0`  | Social logins (Google/Apple) and passwordless OTP         |
| **Payments**               | Stripe SDK            | `latest`  | Subscription management and payment processing            |
| **AI Integration**         | Vercel AI SDK         | `~3.2.0`  | LLM integration for personalization                       |
| **Unit/Integration Tests** | Vitest                | `~1.6.0`  | Fast test runner with browser mode                        |
| **E2E Testing**            | Playwright            | `~1.45.0` | Cross-browser end-to-end testing                          |
| **CI/CD**                  | GitHub Actions        | `latest`  | Continuous integration and deployment                     |
| **Component Development**  | Storybook             | `~9.0.0`  | Interactive component development and documentation       |
| **Code Quality**           | ESLint + Prettier     | `latest`  | Code linting and formatting                               |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20.0.0 or later ([Download](https://nodejs.org/))
- **npm**: v10.0.0 or later (comes with Node.js)
- **Git**: Latest version ([Download](https://git-scm.com/))
- **Supabase CLI**: Latest version ([Installation guide](https://supabase.com/docs/guides/cli))

### Recommended Tools

- **VS Code**: ([Download](https://code.visualstudio.com/))
  - Extensions:
    - ESLint
    - Prettier - Code formatter
    - Tailwind CSS IntelliSense
    - TypeScript and JavaScript Language Features
- **Chrome/Edge**: For development and debugging

## 🚀 Setup Instructions

Follow these steps to get your development environment running:

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/lattixiq-app.git

# Navigate to the project directory
cd lattixiq-app
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install

# This will also run the prepare script to set up Git hooks
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Open .env.local in your editor and update the values
# See the Environment Variables section below for details
```

### 4. Set Up the Database

```bash
# Start Supabase locally (requires Docker)
npx supabase start

# Apply database migrations
npx supabase db push

# Seed the database (optional, for development data)
npm run db:seed
```

### 5. Start the Development Server

```bash
# Start the Next.js development server with Turbopack
npm run dev

# The application will be available at http://localhost:3000
```

### 6. Start Storybook (Optional)

```bash
# In a new terminal, start Storybook for component development
npm run storybook

# Storybook will be available at http://localhost:6006
```

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Integration
OPENAI_API_KEY=your_openai_api_key

# Stripe Configuration (for premium features)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Getting Your API Keys

1. **Supabase**: Create a project at [supabase.com](https://supabase.com) and find your keys in Project Settings > API
2. **OpenAI**: Get your API key from [platform.openai.com](https://platform.openai.com)
3. **Stripe**: Create an account at [stripe.com](https://stripe.com) and find your keys in the Dashboard

## 📜 Common Commands

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run storybook        # Start Storybook for component development

# Building
npm run build            # Build for production
npm run start            # Start production server
npm run build-storybook  # Build Storybook static site

# Testing
npm test                 # Run all tests
npm run test:unit        # Run unit tests only
npm run test:e2e         # Run end-to-end tests
npm run test:watch       # Run tests in watch mode

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run typecheck        # Run TypeScript type checking

# Database
npm run db:push          # Push database schema changes
npm run db:seed          # Seed database with test data
npm run db:reset         # Reset database to initial state

# Other
npm run analyze          # Analyze bundle size
npm run clean            # Clean build artifacts
```

## 🗂️ Project Structure

````
lattixiq-app/
├── app/                          # Next.js App Router - Core Application Logic
│   ├── (auth)/                   # Public authentication routes
│   │   ├── login/                # Login page
│   │   ├── signup/               # Signup page
│   │   └── onboarding/           # Post-signup onboarding flow
│   ├── (app)/                    # Protected main application routes
│   │   ├── toolkit/              # "My Toolkit" dashboard
│   │   ├── learn/                # Learning interface
│   │   ├── plan/                 # Planning interface
│   │   ├── reflect/              # Reflection/journaling interface
│   │   └── settings/             # User settings
│   └── api/                      # Backend API Routes (Serverless Functions)
│       ├── roadmaps/             # Roadmap management endpoints
│       ├── logs/                 # Reflection log endpoints
│       └── user/                 # User profile endpoints
├── components/                   # React Component Library
│   ├── ui/                       # Base shadcn/ui components
│   ├── shared/                   # Reusable app-specific components
│   └── features/                 # Feature-specific components
├── lib/                          # Shared Utilities and Business Logic
│   ├── db/                       # Data Access Layer
│   ├── stores/                   # Zustand global state management
│   ├── ai/                       # Vercel AI SDK integration
│   ├── auth/                     # Authentication utilities
│   └── types/                    # TypeScript type definitions
├── docs/                         # Comprehensive Documentation
│   ├── architecture/             # Technical architecture docs
│   ├── prd/                      # Product requirements
│   ├── epics/                    # Development epics
│   ├── adr/                      # Architecture Decision Records
│   ├── api/                      # API documentation
│   └── stories/                  # User stories
├── tests/                        # Test Suite Organization
│   ├── unit/                     # Unit tests (Vitest)
│   ├── integration/              # Integration tests
│   └── e2e/                      # End-to-end tests (Playwright)
├── stories/                      # Storybook Component Stories
├── supabase/                     # Supabase Configuration
│   └── migrations/               # Database migration files
└── .github/                      # GitHub Configuration
    ├── workflows/                # CI/CD pipelines
    └── pull_request_template.md  # PR template

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 🧰 Troubleshooting

### Common Issues and Solutions

#### Port 3000 Already in Use
```bash
# Kill the process using port 3000
npx kill-port 3000
# Or run on a different port
npm run dev -- -p 3001
````

#### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors

- Ensure VS Code is using the workspace TypeScript version
- Run `npm run typecheck` to see all type errors
- Check that `tsconfig.json` has `"strict": true`

#### Storybook Not Loading

```bash
# Clear Storybook cache
rm -rf node_modules/.cache/storybook
npm run storybook
```

#### Database Connection Issues

```bash
# Restart Supabase
npx supabase stop
npx supabase start

# Check Supabase status
npx supabase status
```

#### Build Failures

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### Environment Variable Issues

- Ensure all required variables are set in `.env.local`
- Restart the development server after changing environment variables
- Use `NEXT_PUBLIC_` prefix for client-side variables

### Getting Help

If you encounter issues not covered here:

1. Check the [issues page](https://github.com/yourusername/lattixiq-app/issues) for similar problems
2. Review the [documentation](./docs) for detailed guides
3. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - System information (OS, Node version, etc.)

## 📚 Documentation

### Key Documentation

- **[Architecture Documentation](./docs/architecture/)** - System design and technical decisions
- **[API Documentation](./docs/api/)** - API endpoints and usage examples
- **[Contributing Guidelines](./CONTRIBUTING.md)** - How to contribute to the project
- **[Code Style Guide](./docs/code-style.md)** - Coding standards and conventions
- **[Architecture Decision Records](./docs/adr/)** - Important architectural decisions

### Additional Resources

- **[Product Requirements](./docs/prd/)** - Product vision and specifications
- **[Development Epics](./docs/epics/)** - Feature roadmap and implementation plans
- **[Component Library](http://localhost:6006)** - Interactive Storybook documentation (when running)
- **[TypeScript Types](./lib/types/)** - Shared type definitions

---

<div align="center">

**[Documentation](./docs)** • **[Issues](https://github.com/yourusername/lattixiq-app/issues)** • **[Discussions](https://github.com/yourusername/lattixiq-app/discussions)**

Built with ❤️ by the LattixIQ Team

</div>
