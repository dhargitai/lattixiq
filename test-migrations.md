# Testing Database Migrations

This document provides instructions for testing the database migrations locally.

## Prerequisites

1. **Docker Desktop** must be running
2. **Supabase CLI** must be installed (already available)
3. **Project linked** to remote Supabase project

## Testing Steps

### 1. Start Local Supabase

```bash
# Start local Supabase services
supabase start

# This will start:
# - PostgreSQL database on port 54322
# - Supabase Studio on port 54323
# - API server on port 54321
```

### 2. Run Migrations

```bash
# Apply all migrations to local database
supabase db push

# Alternative: Reset and apply all migrations
supabase db reset
```

### 3. Verify Database Schema

```bash
# Connect to local database
supabase db shell

# Then run these SQL commands to verify:
```

#### Check ENUM Types

```sql
\dT+ subscription_status
\dT+ testimonial_state
\dT+ roadmap_status
\dT+ roadmap_step_status
\dT+ ai_sentiment
\dT+ knowledge_content_type
```

#### Check Tables

```sql
\d+ users
\d+ knowledge_content
\d+ goal_examples
\d+ roadmaps
\d+ roadmap_steps
\d+ application_logs
```

#### Check Extensions

```sql
\dx vector
```

#### Check RLS Policies

```sql
\dp users
\dp roadmaps
\dp roadmap_steps
\dp application_logs
\dp knowledge_content
\dp goal_examples
```

### 4. Test Seed Data

```sql
-- Check if seed data was inserted
SELECT COUNT(*) FROM knowledge_content;
SELECT COUNT(*) FROM goal_examples;

-- Verify data structure
SELECT id, title, type, category FROM knowledge_content LIMIT 5;
SELECT goal, knowledge_content_id FROM goal_examples LIMIT 5;
```

### 5. Test RLS Policies

Create a test user and verify policies work:

```sql
-- This would typically be done through the Supabase Auth API
-- but for testing, you can verify policy structure exists
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

## Expected Results

### Migration Files Applied

- `20240101000000_create_enums.sql` - 6 ENUM types created
- `20240101000001_enable_pgvector.sql` - vector extension enabled
- `20240101000002_create_core_tables.sql` - 6 tables created
- `20240101000003_enable_rls_policies.sql` - RLS policies applied

### Seed Data

- 5 knowledge_content records (3 mental models, 2 biases, 1 fallacy)
- 7 goal_examples records linked to the knowledge content

### RLS Policies

- 15 total policies across 6 tables
- Each table has appropriate access controls

## Troubleshooting

### Common Issues

1. **Docker not running**: Start Docker Desktop
2. **Port conflicts**: Stop other services using ports 54321-54324
3. **Migration errors**: Check SQL syntax and dependencies
4. **Permission errors**: Ensure RLS policies are correctly formatted

### Useful Commands

```bash
# Check migration status
supabase migration list

# View local database URL
supabase status

# Stop local services
supabase stop

# View logs
supabase logs
```

## Remote Testing

To test against the remote Supabase project:

```bash
# Link to remote project (if not already linked)
supabase link --project-ref your-project-ref

# Push migrations to remote
supabase db push --db-url "your-remote-db-url"
```

**Warning**: Only run against remote database when you're confident the migrations are correct.
