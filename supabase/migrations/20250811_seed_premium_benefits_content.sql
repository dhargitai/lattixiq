-- Seed initial premium benefits content
INSERT INTO content_blocks (content_id, content, metadata, published)
VALUES (
  'premium-benefits-modal',
  '## Unlock Your Full Potential with Premium

### 🚀 What You Get with Premium:

**Unlimited Roadmaps**
Create as many personalized learning journeys as you want. No restrictions, no limits.

**Priority AI Processing**
Get your roadmaps generated faster with priority queue access to our AI engine.

**Advanced Analytics**
Track your progress with detailed insights and patterns from your learning journey.

**Export Your Data**
Download all your reflections, roadmaps, and progress reports in multiple formats.

**Early Access**
Be the first to try new features and mental models as we expand our library.

### 💡 Why Go Premium?

You''ve already experienced the power of transforming knowledge into action with your first roadmap. Premium removes all barriers, letting you tackle every challenge in your life with the same structured approach.

### 🎯 Your Investment

**$29/month** - Less than the cost of a book, for unlimited personal growth.

Start your premium journey today and unlock your full potential.',
  jsonb_build_object(
    'version', '1.0',
    'last_updated', NOW(),
    'features', jsonb_build_array(
      'unlimited_roadmaps',
      'priority_processing',
      'analytics',
      'export',
      'early_access'
    )
  ),
  true
)
ON CONFLICT (content_id) DO UPDATE
SET 
  content = EXCLUDED.content,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();