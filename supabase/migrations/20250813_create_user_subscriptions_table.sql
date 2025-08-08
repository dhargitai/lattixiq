-- Create separate table for subscription data with restricted access
-- Only service role (webhooks) can write to this table, users can only read their own data

CREATE TABLE IF NOT EXISTS user_subscriptions (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  subscription_status TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(subscription_status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Add constraint for valid subscription statuses (matching Stripe's statuses)
ALTER TABLE user_subscriptions 
ADD CONSTRAINT valid_user_subscription_status 
CHECK (subscription_status IN ('free', 'active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired'));

-- Enable RLS for security
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own subscription data
CREATE POLICY "Users can view own subscription"
ON user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- No INSERT, UPDATE, or DELETE policies - only service role can modify

-- Add helpful comments
COMMENT ON TABLE user_subscriptions IS 'Stores subscription data separate from user table for security. Only service role can write.';
COMMENT ON COLUMN user_subscriptions.user_id IS 'References the user this subscription belongs to';
COMMENT ON COLUMN user_subscriptions.subscription_status IS 'Current subscription status from Stripe or "free" for non-subscribers';
COMMENT ON COLUMN user_subscriptions.stripe_customer_id IS 'Stripe customer ID for subscription management';
COMMENT ON COLUMN user_subscriptions.stripe_subscription_id IS 'Active Stripe subscription ID';
COMMENT ON COLUMN user_subscriptions.subscription_current_period_end IS 'End date of current subscription period';

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();