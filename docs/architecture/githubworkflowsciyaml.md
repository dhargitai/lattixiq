# .github/workflows/ci.yaml
name: 'Continuous Integration'

on:
  pull_request:
    branches: [ main ]

jobs:
  ci-checks:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20' # Matches our tech stack
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Lint & Format Check
        run: npm run lint # Enforces coding standards

      - name: Run All Tests
        run: npm test # Runs our full Vitest suite in a sandboxed environment
        env:
          SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}

      - name: Build Check
        run: npm run build # Ensures the application builds successfully
```

## **Environments**

We will maintain three distinct environments to ensure a stable and secure development lifecycle.

| Environment | Purpose | Infrastructure | URL Example |
| --- | --- | --- | --- |
| **Development** | Local development and testing. | Developer's machine | `http://localhost:3000` |
| **Preview** | Reviewing Pull Requests, E2E testing. | Vercel Preview Deployments, Staging Supabase Project | `lattixiq-feature-xyz.vercel.app` |
| **Production** | The live application for all users. | Vercel Production, Production Supabase Project | `lattixiq.com` |
