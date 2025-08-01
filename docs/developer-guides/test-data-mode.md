# Test Data Mode for Development

## Overview

The LattixIQ application includes a test data mode that allows new developers to work with the application without needing the full knowledge_content database seeded. This is particularly useful for:

- New developers joining the project
- Local development environments
- Running tests without database dependencies
- Demonstrating functionality with curated examples

## Enabling Test Data Mode

1. Set the environment variable in your `.env.local` file:

   ```
   USE_TEST_DATA=true
   ```

2. Restart your development server

## What Test Data Includes

The test dataset (`/lib/mocks/test-knowledge-content.ts`) includes:

- **Mental Models** (10+):
  - First Principles Thinking
  - Parkinson's Law
  - Eisenhower Matrix
  - 80/20 Rule (Pareto Principle)
  - Second-Order Thinking
  - Inversion
  - Systems Thinking
  - And more...

- **Cognitive Biases** (10+):
  - Confirmation Bias
  - Planning Fallacy
  - Dunning-Kruger Effect
  - Sunk Cost Fallacy
  - Availability Heuristic
  - And more...

## How It Works

When `USE_TEST_DATA=true`:

1. The `RoadmapSupabaseService` will use the test dataset instead of querying the database
2. Semantic search is simulated using keyword matching
3. AI roadmap generation will work with the test content
4. All other features function normally

## Limitations

- Test data has simplified semantic search (keyword-based rather than true vector similarity)
- Limited to 20 mental models/biases (vs 125+ in production)
- No real embeddings (uses simplified scoring)
- Some advanced features may have reduced effectiveness

## Switching to Real Data

To use the real database:

1. Ensure your Supabase database has the knowledge_content table populated
2. Set `USE_TEST_DATA=false` (or remove the variable)
3. Restart your development server

## Integration Tests

When running integration tests:

- Set `SKIP_INTEGRATION_TESTS=true` to skip tests requiring real database
- Or ensure your test database has the knowledge_content seeded

## Adding to Test Data

To add new test content:

1. Edit `/lib/mocks/test-knowledge-content.ts`
2. Add new entries to the `testKnowledgeContent` array
3. Update the `testSemanticSearch` function if needed for better matching

## Best Practices

1. **Development**: Use test data for rapid iteration
2. **Testing**: Use test data for unit tests, real data for integration tests
3. **Production**: Always use real data
4. **PR Reviews**: Test with both modes to ensure compatibility
