# **14. Deployment Architecture**

## **Deployment Strategy**

We will use a Git-based, continuous deployment model powered by Netlify and GitHub.

- **Netlify for Frontend & API Routes:**
    1. The `main` branch in our GitHub repository will represent the production application.
    2. When a developer opens a Pull Request (PR), Netlify will automatically build and deploy a unique **Preview Environment**. This allows us to review and test every change in a live, isolated setting before it reaches production.
    3. When a PR is approved and merged into `main`, Netlify will automatically trigger a **Production Deployment**, pushing the changes live.
- **Supabase for Database Migrations:**
    - Database schema changes are **not** deployed automatically with the application code.
    - Developers will create migration files locally using the Supabase CLI. These files will be committed to the `/supabase/migrations/` directory in our repository.
    - Applying migrations to our Staging and Production databases will be a controlled step within our GitHub Actions pipeline, requiring manual approval for production releases to prevent accidental data loss.

## **CI/CD Pipeline (GitHub Actions)**

A `ci.yaml` workflow file will be created in `.github/workflows/`. This pipeline will run automatically on every Pull Request to enforce our quality and coding standards. **A Pull Request cannot be merged unless all of these checks pass.**

```yaml