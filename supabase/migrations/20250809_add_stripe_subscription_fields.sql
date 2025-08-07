-- First, we need to handle the existing subscription_status column which is an enum
-- We'll need to convert it to text to support Stripe's subscription statuses

-- Drop the existing subscription_status column with enum type
ALTER TABLE users DROP COLUMN IF EXISTS subscription_status;

-- Add new columns for Stripe subscription tracking
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;

-- Add index for faster lookups by stripe_customer_id (if not exists)
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Add index for subscription status queries
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- Add constraint to ensure valid subscription statuses
ALTER TABLE users 
ADD CONSTRAINT valid_subscription_status 
CHECK (subscription_status IN ('free', 'active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired'));

-- Add comment for documentation
COMMENT ON COLUMN users.stripe_customer_id IS 'Stripe customer ID for subscription management';
COMMENT ON COLUMN users.stripe_subscription_id IS 'Active Stripe subscription ID';
COMMENT ON COLUMN users.subscription_status IS 'Current subscription status: free, active, canceled, past_due, trialing, incomplete, incomplete_expired';
COMMENT ON COLUMN users.subscription_current_period_end IS 'End date of the current subscription period';