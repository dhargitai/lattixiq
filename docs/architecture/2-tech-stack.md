# **2. Tech Stack**

This section serves as the definitive, single source of truth for all technologies, frameworks, and services to be used in the LattixIQ project. All development must adhere to these choices and specified versions to ensure consistency and stability. 1111

| Category | Technology | Version | Purpose | Rationale |
| --- | --- | --- | --- | --- |
| **Frontend Language** | TypeScript | `~5.5.3` | Primary language for type safety in the frontend. | Ensures code quality, improves developer experience, and reduces runtime errors. |
| **Frontend Framework** | Next.js | `~15.0.0` | The core React framework for the application. | Provides a robust foundation with server-side rendering, static site generation, API routes, and a seamless developer experience. Aligns with Vercel platform. |
| **UI Components** | shadcn/ui | `~2.0.0` | The component library for building the user interface. | Provides accessible, unstyled components that can be fully customized with Tailwind, perfectly matching our "Serene Minimalist" aesthetic. |
| **Styling** | Tailwind CSS | `~4.0.0` | The utility-first CSS framework for all styling. | Enables rapid, consistent UI development and is the native styling solution for shadcn/ui. |
| **State Management** | Zustand | `~4.5.2` | For managing complex, shared client-side state. | A simple, fast, and scalable state management solution that avoids the boilerplate of more complex libraries. Will be used only where Next.js's native state management is insufficient. |
| **Backend** | Next.js API Routes | `~15.0.0` | For creating serverless API endpoints. | Tightly integrated with the frontend, providing a unified TypeScript codebase and simplifying the developer workflow. Deploys as serverless functions on Vercel. |
| **Database** | Supabase (Postgres) | `~15.x` | The primary database for all user data. | A powerful, open-source relational database. Supabase provides a managed solution with excellent tooling and Row-Level Security (RLS) for data privacy. |
| **Authentication** | Supabase Auth | `~2.0.0` | Handles all user authentication (Social & OTP). | Provides a secure, all-in-one solution for social logins (Google/Apple) and passwordless OTP, as required by the UI/UX spec. Integrates directly with database RLS. |
| **Payments** | Stripe SDK | `latest` | For processing premium subscription payments. | Industry standard for payments, providing robust APIs, security, and a pre-built customer portal to manage subscriptions. |
| **AI** | Vercel AI SDK | `~3.2.0` | For interacting with LLMs for personalization. | Simplifies streaming UI responses and connecting to various AI models, providing a seamless integration for our AI-powered features. |
| **Unit/Integration Tests** | Vitest | `~1.6.0` | For testing components and functions. | A modern, fast test runner. Its powerful in-memory mocking capabilities are ideal for creating the **sandboxed test environment** you require. |
| **E2E Testing** | Playwright | `~1.45.0` | For end-to-end testing of user flows. | A powerful browser automation tool that enables robust testing of both **happy and unhappy user paths** across different browsers. |
| **CI/CD** | GitHub Actions | `latest` | For continuous integration and deployment. | Native integration with GitHub. We will create workflows to run tests, linting, and deploy automatically to Vercel, ensuring quality control. |
| **Notifications** | To be determined | `N/A` | Handles sending app-related notification emails and push notifications. | We will build an abstracted `NotificationService` that can use any provider (e.g., Resend, Twilio) as an implementation detail, ensuring flexibility. |
