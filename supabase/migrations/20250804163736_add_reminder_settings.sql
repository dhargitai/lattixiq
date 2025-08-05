-- Add reminder preferences to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reminder_time TIME DEFAULT '09:00'::time;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reminder_timezone TEXT DEFAULT 'UTC';
ALTER TABLE users ADD COLUMN IF NOT EXISTS reminder_last_sent TIMESTAMP WITH TIME ZONE;

-- Create notification delivery log table
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_step_id UUID REFERENCES roadmap_steps(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL DEFAULT 'daily_reminder',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  delivery_status TEXT, -- 'sent', 'failed', 'blocked', 'no_active_plan'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_scheduled_for ON notification_logs(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_logs_delivery_status ON notification_logs(delivery_status);

-- Add RLS policies for notification_logs
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notification logs
CREATE POLICY "Users can view their own notification logs"
  ON notification_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all notification logs
CREATE POLICY "Service role can manage notification logs"
  ON notification_logs
  FOR ALL
  USING (auth.role() = 'service_role');