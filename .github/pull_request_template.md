## Description

<!-- Provide a brief description of the changes in this PR -->

## Related Issues

<!-- Link related issues using #issue-number -->

Closes #

## Type of Change

<!-- Mark the relevant option with an "x" -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 Style update (formatting, renaming)
- [ ] ♻️ Code refactor (no functional changes, no API changes)
- [ ] ⚡ Performance improvement
- [ ] ✅ Test update
- [ ] 🔧 Build configuration change
- [ ] 🔄 CI/CD update
- [ ] ⬆️ Dependency update

## Changes Made

<!-- List the main changes made in this PR -->

-
-
-

## Screenshots

<!-- If applicable, add screenshots to help explain your changes -->

## Testing

### Test Coverage

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] All tests passing

### Manual Testing

<!-- Describe the manual testing performed -->

1.
2.
3.

### Browser Testing

<!-- Mark browsers tested -->

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile (iOS/Android)

## Checklist

### Code Quality

- [ ] My code follows the project's code style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings or errors
- [ ] I have removed any console.logs or debug code

### Documentation

- [ ] I have updated the documentation accordingly
- [ ] I have updated the README if needed
- [ ] I have added/updated code comments and JSDoc where appropriate
- [ ] I have updated the API documentation if I changed endpoints

### Security

**⚠️ CRITICAL: All security items MUST be checked before merging**

#### Secrets & Credentials

- [ ] No hardcoded secrets, API keys, tokens, or passwords in the code
- [ ] All sensitive configuration uses environment variables
- [ ] No secrets in comments, console.logs, or error messages
- [ ] `.env` files are NOT included in this commit
- [ ] Service role keys are ONLY used server-side (never in client code)

#### Authentication & Authorization

- [ ] Authorization checks are in place for all protected endpoints
- [ ] Using appropriate auth keys (anon for client, service role for server only)
- [ ] Row-Level Security (RLS) policies maintained/updated for DB changes
- [ ] JWT tokens have appropriate expiration times

#### Input Validation & Sanitization

- [ ] All user inputs are validated and sanitized
- [ ] API endpoints validate request body/params using Zod schemas
- [ ] File uploads are restricted by type and size
- [ ] SQL queries use parameterized statements (no string concatenation)

#### Error Handling & Information Disclosure

- [ ] Error messages do not expose sensitive system information
- [ ] Stack traces are not sent to the client
- [ ] Database queries and internal logic are not exposed in errors
- [ ] Generic error messages returned to users

#### Data Protection

- [ ] No sensitive data stored in localStorage or sessionStorage
- [ ] Sensitive cookies are httpOnly, secure, and have sameSite set
- [ ] PII is properly handled according to privacy requirements
- [ ] Passwords are hashed (handled by Supabase Auth)

#### Security Testing

- [ ] Security-focused tests added for auth flows
- [ ] Tested for injection vulnerabilities
- [ ] Tested for XSS vulnerabilities
- [ ] Rate limiting tested on public endpoints

### Performance

- [ ] I have considered the performance impact of my changes
- [ ] I have added lazy loading where appropriate
- [ ] I have optimized images and assets
- [ ] I have tested the changes with a production build

### Accessibility

- [ ] I have tested keyboard navigation
- [ ] I have added appropriate ARIA labels
- [ ] I have ensured proper color contrast
- [ ] I have tested with a screen reader (if applicable)

### Breaking Changes

<!-- If this PR includes breaking changes, describe them here -->

- [ ] I have documented any breaking changes
- [ ] I have updated migration guides if needed
- [ ] I have communicated these changes to the team

## Deployment Notes

<!-- Any special deployment considerations or steps -->

## Post-Deployment Checklist

- [ ] Monitor error tracking for new issues
- [ ] Verify feature flags are correctly set
- [ ] Check performance metrics
- [ ] Confirm no degradation in user experience

## Additional Context

<!-- Add any other context about the PR here -->

## Reviewer Guidelines

<!-- Instructions for reviewers -->

### Focus Areas

Please pay special attention to:

1.
2.
3.

### Out of Scope

The following items are out of scope for this PR and will be addressed separately:

-
-
