-- Add RLS policy to allow users to insert their own notification logs
CREATE POLICY "Users can insert their own notification logs" ON public.notification_logs
FOR INSERT 
WITH CHECK (auth.uid() = user_id);