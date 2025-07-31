# Contributing to LattixIQ

First off, thank you for considering contributing to LattixIQ! It's people like you that make LattixIQ such a great tool for personal growth and rational thinking.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Git Workflow](#git-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@lattixiq.com](mailto:conduct@lattixiq.com).

### Our Standards

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## Getting Started

1. **Fork the Repository**: Click the "Fork" button in the top right corner of the [repository page](https://github.com/yourusername/lattixiq-app)

2. **Clone Your Fork**:

   ```bash
   git clone https://github.com/your-username/lattixiq-app.git
   cd lattixiq-app
   ```

3. **Add Upstream Remote**:
   ```bash
   git remote add upstream https://github.com/yourusername/lattixiq-app.git
   ```

## Development Setup

Follow the setup instructions in our [README](./README.md#setup-instructions) to get your development environment running.

### Prerequisites

- Node.js v20.0.0 or later
- npm v10.0.0 or later
- Git
- Supabase CLI
- VS Code (recommended) with our recommended extensions

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- A clear and descriptive title
- Exact steps to reproduce the problem
- Expected behavior vs actual behavior
- Screenshots (if applicable)
- Your environment details (OS, Node version, browser)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- A clear and descriptive title
- Step-by-step description of the suggested enhancement
- Explanation of why this enhancement would be useful
- Possible implementation approach (if you have ideas)

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- `good-first-issue` - Simple issues perfect for beginners
- `help-wanted` - Issues where we need community help
- `documentation` - Documentation improvements

## Development Workflow

### 1. Create a Feature Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clean, maintainable code
- Follow our [coding standards](#coding-standards)
- Add/update tests as needed
- Update documentation if required

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Check code quality
npm run lint
npm run typecheck
```

### 4. Commit Your Changes

Follow our [commit message guidelines](#commit-message-guidelines):

```bash
git add .
git commit -m "feat: add new mental model component"
```

## Git Workflow

### Branch Naming Conventions

- `feature/` - New features (e.g., `feature/add-reflection-reminders`)
- `fix/` - Bug fixes (e.g., `fix/login-redirect-issue`)
- `docs/` - Documentation changes (e.g., `docs/update-api-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/optimize-roadmap-queries`)
- `test/` - Test additions or fixes (e.g., `test/add-user-profile-tests`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream changes into your main branch
git checkout main
git merge upstream/main

# Update your feature branch
git checkout feature/your-feature-name
git rebase main
```

## Pull Request Process

### Before Submitting

1. **Update Documentation**: If you've changed APIs, update the relevant documentation
2. **Add Tests**: Ensure your changes are covered by tests
3. **Run All Checks**:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```
4. **Update CHANGELOG.md**: Add a note about your changes in the Unreleased section

### Submitting a Pull Request

1. Push your branch to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

2. Go to the [main repository](https://github.com/yourusername/lattixiq-app) and click "New Pull Request"

3. Select your fork and branch

4. Fill out the PR template with:
   - Clear description of changes
   - Related issue numbers
   - Screenshots (for UI changes)
   - Testing steps

### PR Review Process

- At least one maintainer approval is required
- All CI checks must pass
- No merge conflicts
- Up-to-date with main branch

### After Your PR is Merged

- Delete your local feature branch
- Pull the latest main branch
- Celebrate your contribution! 🎉

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Define interfaces for all data structures
- Avoid `any` type - use `unknown` if type is truly unknown
- Prefer `interface` over `type` for object shapes

### React Components

```typescript
// Use functional components with TypeScript
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({ variant, onClick, children }: ButtonProps) {
  return (
    <button
      className={cn('button', variant)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### File Organization

- One component per file
- Colocate related files (component, styles, tests)
- Use index files for clean imports

### Naming Conventions

- **Components**: PascalCase (e.g., `RoadmapCard.tsx`)
- **Functions/Variables**: camelCase (e.g., `getUserProfile`)
- **Types/Interfaces**: PascalCase (e.g., `interface UserProfile`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **Files**: kebab-case for non-components (e.g., `user-utils.ts`)

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or corrections
- `build`: Build system changes
- `ci`: CI configuration changes
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
feat(roadmap): add ability to share roadmaps with friends

# Bug fix
fix(auth): resolve Google OAuth redirect loop

# Documentation
docs(api): update roadmap endpoint examples

# Refactoring
refactor(components): extract common button styles
```

## Testing Requirements

### Test Coverage

- Aim for >80% code coverage
- All new features must include tests
- Bug fixes should include regression tests

### Test Types

1. **Unit Tests** (`*.test.ts`):
   - Test individual functions and utilities
   - Mock external dependencies

2. **Integration Tests** (`*.integration.test.ts`):
   - Test component interactions
   - Test API endpoints

3. **E2E Tests** (`*.e2e.test.ts`):
   - Test complete user flows
   - Run against real browser

### Writing Tests

```typescript
// Example unit test
describe("formatDate", () => {
  it("should format date in user locale", () => {
    const date = new Date("2024-01-15");
    expect(formatDate(date)).toBe("January 15, 2024");
  });
});
```

## Documentation

- Update README.md if you change setup steps
- Document new environment variables
- Add JSDoc comments for complex functions
- Update API documentation for endpoint changes
- Create ADRs for significant architectural decisions

## Code Review Checklist

Before requesting review, ensure:

- [ ] Code follows our style guidelines
- [ ] Self-review performed
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] No console.logs or debug code
- [ ] Sensitive data not exposed
- [ ] Performance impact considered
- [ ] Accessibility requirements met

## Community

- **Discord**: [Join our Discord](https://discord.gg/lattixiq)
- **Twitter**: [@lattixiq](https://twitter.com/lattixiq)
- **Blog**: [blog.lattixiq.com](https://blog.lattixiq.com)

## Recognition

Contributors will be recognized in our:

- README.md contributors section
- Release notes
- Annual contributor spotlight

Thank you for making LattixIQ better! 🙏
