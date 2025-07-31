# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the LattixIQ project. ADRs document significant architectural decisions made during the development of the system.

## What is an ADR?

An Architecture Decision Record (ADR) captures an important architectural decision made along with its context and consequences. ADRs help:

- Document the reasoning behind architectural choices
- Provide context for future developers
- Track the evolution of the system architecture
- Facilitate onboarding of new team members
- Enable informed decision-making for future changes

## Creating a New ADR

### 1. Copy the Template

Start by copying the template:

```bash
cp adr-template.md ADR-XXX-short-description.md
```

Replace `XXX` with the next sequential number and provide a short, descriptive filename.

### 2. Fill Out the Sections

Each ADR should include:

- **Title**: ADR-XXX: Clear, concise title
- **Status**: One of: Proposed, Accepted, Deprecated, or Superseded
- **Context**: The issue or problem that led to this decision
- **Decision**: The architectural decision that was made
- **Consequences**: Both positive and negative outcomes

### 3. Naming Convention

ADR files should follow this pattern:

```
ADR-XXX-short-description.md
```

Where:

- `XXX` is a three-digit sequential number (e.g., 001, 002, 003)
- `short-description` is a kebab-case description of the decision

### 4. Review Process

1. Create the ADR with status "Proposed"
2. Submit a pull request for team review
3. After discussion and approval, update status to "Accepted"
4. Merge the ADR into the main branch

## Current ADRs

| Number                                           | Title                    | Status   |
| ------------------------------------------------ | ------------------------ | -------- |
| [ADR-001](./ADR-001-use-nextjs-app-router.md)    | Use Next.js App Router   | Accepted |
| [ADR-002](./ADR-002-use-supabase-for-backend.md) | Use Supabase for Backend | Accepted |

## ADR Status Definitions

- **Proposed**: The decision is under consideration
- **Accepted**: The decision has been agreed upon and implemented
- **Deprecated**: The decision is no longer relevant or has been replaced
- **Superseded by ADR-XXX**: This decision has been replaced by another ADR

## Best Practices

1. **Be Concise**: ADRs should be brief but complete
2. **Include Context**: Future readers need to understand why the decision was made
3. **List Alternatives**: Document what other options were considered
4. **Be Honest**: Include both positive and negative consequences
5. **Link References**: Include links to relevant documentation, issues, or discussions
6. **Keep Updated**: Mark ADRs as deprecated or superseded when appropriate

## Resources

- [Michael Nygard's ADR Article](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR GitHub Organization](https://adr.github.io/)
- [Thoughtworks Technology Radar on ADRs](https://www.thoughtworks.com/radar/techniques/lightweight-architecture-decision-records)
