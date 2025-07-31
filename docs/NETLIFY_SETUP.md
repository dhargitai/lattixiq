# Netlify Setup Guide

This guide walks through setting up Netlify deployment for the LattixIQ application.

## Prerequisites

- GitHub repository access
- Netlify account (create at https://app.netlify.com/signup)
- Environment variables from Story 0.3

## Task 3: Connect Netlify to GitHub Repository

1. Log into Netlify at https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Authorize Netlify to access your GitHub account
5. Select the `lettixiq-app` repository
6. Click "Deploy site"

## Task 4: Configure Netlify Build Settings

**Note**: Build settings are now configured via `netlify.toml` file in the repository root. Netlify will automatically detect and use these settings.

The configuration includes:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: `20`
- **Next.js plugin**: Auto-enabled
- **Redirect rules**: Configured for client-side routing
- **Security headers**: Enabled for all routes

If you need to override these settings:

1. In Netlify dashboard, go to "Site settings" → "Build & deploy"
2. Under "Build settings", you can override the netlify.toml values
3. Under "Build settings" → "Continuous Deployment":
   - **Production branch**: `main`
   - **Deploy Previews**: "Any pull request against your production branch"

## Task 5: Configure Environment Variables

1. In Netlify dashboard, go to "Site settings" → "Environment variables"
2. Add the following environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
3. Ensure scope is set to "All (same value for all deploy contexts)"
4. Save each variable

## Task 6: Set Up Preview Deployments

1. In "Site settings" → "Build & deploy" → "Deploy contexts"
2. Verify "Deploy Previews" is set to "Any pull request"
3. Check "Deploy preview comments" is enabled
4. In your repository settings on GitHub:
   - Go to Settings → Webhooks
   - Verify Netlify webhook is present and active

## Verification Steps

1. Create a test PR to verify CI workflow runs
2. Check that Netlify creates a preview deployment
3. Verify preview URL is accessible
4. Confirm environment variables work in preview

## Troubleshooting

### Build Failures

- Check build logs in Netlify dashboard
- Ensure Node version matches local development
- Verify all dependencies are in package.json

### Environment Variables

- Double-check variable names match exactly
- Ensure no trailing spaces in values
- Test locally with same values

### Preview Deployments

- Ensure PR is against main branch
- Check GitHub webhook is active
- Verify Netlify has repository access
