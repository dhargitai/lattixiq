-- Enable Row Level Security (RLS) policies for all tables
-- These policies ensure users can only access their own data

-- 1. Users table RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- 2. Roadmaps table RLS policies
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own roadmaps
CREATE POLICY "Users can view their own roadmaps"
ON public.roadmaps FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can create their own roadmaps
CREATE POLICY "Users can create their own roadmaps"
ON public.roadmaps FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own roadmaps
CREATE POLICY "Users can update their own roadmaps"
ON public.roadmaps FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own roadmaps
CREATE POLICY "Users can delete their own roadmaps"
ON public.roadmaps FOR DELETE
USING (auth.uid() = user_id);

-- 3. Roadmap steps table RLS policies
ALTER TABLE public.roadmap_steps ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view the steps of their own roadmaps
CREATE POLICY "Users can view steps for their own roadmaps"
ON public.roadmap_steps FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM roadmaps 
    WHERE roadmaps.id = roadmap_steps.roadmap_id 
    AND roadmaps.user_id = auth.uid()
  )
);

-- Policy: Users can insert steps into their own roadmaps
CREATE POLICY "Users can insert steps for their own roadmaps"
ON public.roadmap_steps FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM roadmaps 
    WHERE roadmaps.id = roadmap_steps.roadmap_id 
    AND roadmaps.user_id = auth.uid()
  )
);

-- Policy: Users can update steps in their own roadmaps
CREATE POLICY "Users can update steps for their own roadmaps"
ON public.roadmap_steps FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM roadmaps 
    WHERE roadmaps.id = roadmap_steps.roadmap_id 
    AND roadmaps.user_id = auth.uid()
  )
);

-- Policy: Users can delete steps from their own roadmaps
CREATE POLICY "Users can delete steps from their own roadmaps"
ON public.roadmap_steps FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM roadmaps 
    WHERE roadmaps.id = roadmap_steps.roadmap_id 
    AND roadmaps.user_id = auth.uid()
  )
);

-- 4. Application logs table RLS policies
ALTER TABLE public.application_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own logs
CREATE POLICY "Users can view their own logs"
ON public.application_logs FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can create their own logs
CREATE POLICY "Users can create their own logs"
ON public.application_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own logs
CREATE POLICY "Users can update their own logs"
ON public.application_logs FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own logs
CREATE POLICY "Users can delete their own logs"
ON public.application_logs FOR DELETE
USING (auth.uid() = user_id);

-- 5. Knowledge content table RLS policies (read-only for authenticated users)
ALTER TABLE public.knowledge_content ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all knowledge content
CREATE POLICY "Authenticated users can read knowledge content"
ON public.knowledge_content FOR SELECT
USING (auth.role() = 'authenticated');

-- 6. Goal examples table RLS policies (read-only for authenticated users)
ALTER TABLE public.goal_examples ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all goal examples
CREATE POLICY "Authenticated users can read goal examples"
ON public.goal_examples FOR SELECT
USING (auth.role() = 'authenticated');