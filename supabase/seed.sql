-- Seed data for LattixIQ knowledge content
-- This file contains sample mental models, cognitive biases, and fallacies
-- Following the JSON structure specified in the database schema documentation

-- Insert sample mental models
INSERT INTO public.knowledge_content (title, category, type, summary, description, application, keywords) VALUES
(
  'First Principles Thinking',
  'Problem Solving',
  'mental-model',
  'Break down complex problems to their fundamental truths and reason up from there.',
  'First principles thinking involves breaking down complicated problems into basic elements and then reassembling them from the ground up. This approach helps you avoid assumptions and find innovative solutions by starting with what you know to be true.',
  'When facing a complex problem, ask "What are the fundamental truths?" and "What am I assuming that might not be true?" Then build your solution from these basic facts.',
  ARRAY['problem-solving', 'innovation', 'assumptions', 'reasoning', 'fundamentals']
),
(
  'Systems Thinking',
  'Problem Solving',
  'mental-model',
  'View problems as part of interconnected systems rather than isolated events.',
  'Systems thinking is a holistic approach to analysis that focuses on the way that a system''s constituent parts interrelate and how systems work over time and within the context of larger systems. It helps you see patterns, relationships, and connections.',
  'Look for root causes, feedback loops, and unintended consequences. Ask "How does this connect to other parts of the system?" and "What are the second and third-order effects?"',
  ARRAY['systems', 'holistic', 'patterns', 'feedback-loops', 'root-causes']
),
(
  'Inversion',
  'Decision Making',
  'mental-model',
  'Think about what you want to avoid happening and work backwards.',
  'Inversion means approaching problems by thinking about what you want to avoid rather than what you want to achieve. By considering failure modes and negative outcomes, you can often find clearer paths to success.',
  'Instead of asking "How do I succeed?" ask "How do I fail?" or "What would make this go wrong?" Then work to avoid those failure modes.',
  ARRAY['backwards-thinking', 'failure-modes', 'risk-management', 'planning', 'prevention']
);

-- Insert sample cognitive biases
INSERT INTO public.knowledge_content (title, category, type, summary, description, application, keywords) VALUES
(
  'Confirmation Bias',
  'Psychology',
  'cognitive-bias',
  'The tendency to search for, interpret, and recall information that confirms our pre-existing beliefs.',
  'Confirmation bias is the tendency to search for, interpret, favor, and recall information in a way that confirms or supports one''s pre-existing beliefs or values. This bias leads people to give disproportionately less consideration to alternative possibilities.',
  'Actively seek out information that challenges your views. Ask "What evidence would change my mind?" and "Am I only looking for information that supports what I already believe?"',
  ARRAY['bias', 'beliefs', 'information-processing', 'evidence', 'preconceptions']
),
(
  'Availability Heuristic',
  'Psychology',
  'cognitive-bias',
  'Judging probability by how easily examples come to mind.',
  'The availability heuristic is a mental shortcut where people estimate the likelihood of events based on how easily they can recall examples. Recent, emotionally charged, or frequently reported events seem more probable than they actually are.',
  'When making probability judgments, ask "Am I being influenced by vivid recent examples?" and "What does the actual data show?" Look for base rates and statistical evidence.',
  ARRAY['probability', 'memory', 'examples', 'frequency', 'judgment']
);

-- Insert sample fallacies
INSERT INTO public.knowledge_content (title, category, type, summary, description, application, keywords) VALUES
(
  'Ad Hominem Fallacy',
  'Logic',
  'fallacy',
  'Attacking the person making an argument rather than the argument itself.',
  'An ad hominem fallacy occurs when someone responds to an argument by attacking the character, motives, or other attributes of the person making the argument, rather than addressing the substance of the argument itself.',
  'When you hear personal attacks in debates, redirect to the actual argument. Ask "What does this person''s character have to do with the validity of their argument?" Focus on evidence and reasoning.',
  ARRAY['logic', 'arguments', 'personal-attacks', 'debate', 'reasoning']
);

-- Insert goal examples for the knowledge content
-- Note: We'll need to reference the actual UUIDs generated above
-- For now, let's create examples that reference the knowledge content by title
INSERT INTO public.goal_examples (knowledge_content_id, goal, if_then_example, spotting_mission_example) 
SELECT 
  kc.id,
  'Procrastination',
  'If I find myself procrastinating on a task, then I will break it down to first principles: What exactly needs to be done? What is the smallest possible first step? What am I assuming that makes this seem harder than it is?',
  'Notice when you or others say "That''s just how things are done" without questioning the underlying assumptions.'
FROM public.knowledge_content kc 
WHERE kc.title = 'First Principles Thinking';

INSERT INTO public.goal_examples (knowledge_content_id, goal, if_then_example, spotting_mission_example) 
SELECT 
  kc.id,
  'Decision Making',
  'If I need to make a complex decision, then I will identify the fundamental factors that matter most, strip away conventional wisdom, and reason from basic facts about what I value and what outcomes I want.',
  'Catch yourself making decisions based on "best practices" without understanding why those practices exist.'
FROM public.knowledge_content kc 
WHERE kc.title = 'First Principles Thinking';

INSERT INTO public.goal_examples (knowledge_content_id, goal, if_then_example, spotting_mission_example) 
SELECT 
  kc.id,
  'Procrastination',
  'If I''m procrastinating, then I will examine the system: What triggers my procrastination? What rewards am I getting from delaying? How does my environment contribute? What feedback loops keep this pattern going?',
  'Look for times when you treat symptoms (rushing to meet deadlines) rather than addressing root causes (poor planning systems).'
FROM public.knowledge_content kc 
WHERE kc.title = 'Systems Thinking';

INSERT INTO public.goal_examples (knowledge_content_id, goal, if_then_example, spotting_mission_example) 
SELECT 
  kc.id,
  'Decision Making',
  'If I need to make an important decision, then I will first imagine all the ways this could fail catastrophically, then work backwards to identify what would prevent those failures.',
  'Notice when you only consider best-case scenarios in planning, without thinking about what could go wrong.'
FROM public.knowledge_content kc 
WHERE kc.title = 'Inversion';

INSERT INTO public.goal_examples (knowledge_content_id, goal, if_then_example, spotting_mission_example) 
SELECT 
  kc.id,
  'Decision Making',
  'If I''m researching a decision, then I will actively seek out information that contradicts my initial preference and give it serious consideration before finalizing my choice.',
  'Catch yourself cherry-picking evidence that supports what you already want to believe, especially in emotionally charged topics.'
FROM public.knowledge_content kc 
WHERE kc.title = 'Confirmation Bias';

INSERT INTO public.goal_examples (knowledge_content_id, goal, if_then_example, spotting_mission_example) 
SELECT 
  kc.id,
  'Risk Assessment',
  'If I''m evaluating risks, then I will look up actual statistics rather than relying on memorable examples from news or personal experience.',
  'Notice when recent dramatic events (plane crashes, shark attacks) make you overestimate their probability compared to mundane but common risks.'
FROM public.knowledge_content kc 
WHERE kc.title = 'Availability Heuristic';

INSERT INTO public.goal_examples (knowledge_content_id, goal, if_then_example, spotting_mission_example) 
SELECT 
  kc.id,
  'Communication',
  'If someone attacks me personally in a debate, then I will acknowledge their concern but redirect to the substance: "I understand you have concerns about my perspective, but let''s focus on the evidence for this specific claim."',
  'Watch for times when political or contentious discussions devolve into character attacks rather than addressing the actual policies or ideas being proposed.'
FROM public.knowledge_content kc 
WHERE kc.title = 'Ad Hominem Fallacy';