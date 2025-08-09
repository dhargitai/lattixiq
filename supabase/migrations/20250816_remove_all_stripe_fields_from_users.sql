-- First, migrate any existing stripe_customer_id data from users to user_subscriptions
-- This ensures we don't lose any existing customer mappings
INSERT INTO user_subscriptions (
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_status,
  subscription_current_period_end,
  created_at,
  updated_at
)
SELECT 
  id as user_id,
  stripe_customer_id,
  stripe_subscription_id,
  COALESCE(subscription_status, 'free') as subscription_status,
  subscription_current_period_end,
  COALESCE(created_at, now()) as created_at,
  now() as updated_at
FROM users
WHERE stripe_customer_id IS NOT NULL
ON CONFLICT (user_id) 
DO UPDATE SET
  stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, user_subscriptions.stripe_customer_id),
  stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, user_subscriptions.stripe_subscription_id),
  subscription_status = COALESCE(EXCLUDED.subscription_status, user_subscriptions.subscription_status),
  subscription_current_period_end = COALESCE(EXCLUDED.subscription_current_period_end, user_subscriptions.subscription_current_period_end),
  updated_at = now();

-- Now remove all Stripe-related columns from the users table
-- First drop the constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_subscription_status;

-- Drop the indexes
DROP INDEX IF EXISTS idx_users_stripe_customer_id;
DROP INDEX IF EXISTS idx_users_subscription_status;

-- Finally, drop the columns
ALTER TABLE users 
DROP COLUMN IF EXISTS stripe_customer_id,
DROP COLUMN IF EXISTS stripe_subscription_id,
DROP COLUMN IF EXISTS subscription_status,
DROP COLUMN IF EXISTS subscription_current_period_end;

-- Add comment to document the change
COMMENT ON TABLE users IS 'User profile data. All Stripe subscription data has been moved to user_subscriptions table.';
COMMENT ON TABLE user_subscriptions IS 'Stores all Stripe-related data including customer IDs and subscription information. This is the single source of truth for subscription data.';