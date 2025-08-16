# Epic and Story Naming Conventions

This document outlines the naming conventions for epics and user stories in the LattixIQ project.

## Epic Naming Convention

### Format

```
epic-YYYYMMDD-{feature-or-change-in-few-words}
```

### Examples

- `epic-20250816-analytics-monitoring`
- `epic-20250820-enhance-learning-screen`
- `epic-20250825-user-onboarding-flow`

### Benefits

- **Chronological Ordering**: Files naturally sort by creation date
- **Clear Feature Identification**: Descriptive names indicate epic purpose
- **Consistent Structure**: Predictable naming pattern for all team members

## Story Organization

### Directory Structure

Stories for each epic are organized in dedicated subdirectories:

```
docs/
└── stories/
    ├── YYYYMMDD-feature-name/
    │   ├── README.md
    │   ├── story-1.md
    │   ├── story-2.md
    │   └── story-N.md
    └── archive/
        └── pre-mvp/
            └── [historical stories]
```

### Story Naming

- **Format**: `story-{id}.md`
- **Location**: Within epic subdirectory
- **Example**: `/docs/stories/20250816-analytics-monitoring/story-1.md`

### Story File Structure

Each story file should include:

```markdown
# Story: [Title]

**Epic**: epic-YYYYMMDD-feature-name
**Story ID**: {id}
**Priority**: [High/Medium/Low]

## User Story

As a [user type], I want [goal] so that [benefit].

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Requirements

- Technical detail 1
- Technical detail 2

## Definition of Done

- [ ] Code implemented and tested
- [ ] Documentation updated
- [ ] Acceptance criteria verified
```

## Implementation Guidelines

### Creating New Epics

1. Use today's date in YYYYMMDD format
2. Choose descriptive, kebab-case feature name
3. Create corresponding story directory
4. Add README.md to story directory

### Managing Stories

1. Create stories in epic-specific subdirectories
2. Use sequential numbering for story IDs
3. Reference parent epic in each story
4. Update epic status as stories complete

## Migration from Previous Convention

### Active Epics

- Previous format: `epic-{number}-{description}`
- Migrated to: `epic-20250816-{description}` (using convention adoption date)

### Archived Content

- Historical epics remain in `/docs/epics/archive/`
- Historical stories remain in `/docs/stories/archive/`
- Archive README.md files explain the convention change

## Best Practices

### Epic Creation

- Create epic file first: `/docs/epics/epic-YYYYMMDD-feature-name.md`
- Create story directory: `/docs/stories/YYYYMMDD-feature-name/`
- Add directory README.md with epic overview

### Story Development

- Break epics into 3-8 stories maximum
- Each story should be completable in 1-3 days
- Stories should have clear acceptance criteria
- Update epic status as stories complete

### Documentation

- Keep epic and story documentation in sync
- Update CLAUDE.md with current convention
- Reference conventions in code review templates

## Future Considerations

- Consider automation for epic/story template generation
- Evaluate story linking to code changes via git hooks
- Plan for epic timeline visualization tools
