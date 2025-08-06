-- Drop notification_prefs column from users table
-- This column is redundant as we now use individual reminder columns
-- (reminder_enabled, reminder_time, reminder_timezone, reminder_last_sent)

ALTER TABLE users DROP COLUMN IF EXISTS notification_prefs;