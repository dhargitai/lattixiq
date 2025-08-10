-- ========================================
-- LETTIXIQ TEST ROADMAP DATA DUMP
-- ========================================
-- This script inserts a complete roadmap with 7 completed steps for testing purposes.
-- It creates the exact same roadmap structure that x@y.com user has.
--
-- USAGE:
-- 1. Sign up a new user in the application first
-- 2. Change the email below to match your test user's email
-- 3. Run this script: psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" < test-roadmap-dump.sql

-- ========================================
-- CHANGE THIS EMAIL TO YOUR TEST USER:
-- ========================================
\set target_email 'test@example.com'

-- Start transaction
BEGIN;

DO $$ 
DECLARE
    v_user_id uuid;
    v_roadmap_id uuid := gen_random_uuid();
    v_step1_id uuid := gen_random_uuid();
    v_step2_id uuid := gen_random_uuid();
    v_step3_id uuid := gen_random_uuid();
    v_step4_id uuid := gen_random_uuid();
    v_step5_id uuid := gen_random_uuid();
    v_step6_id uuid := gen_random_uuid();
    v_step7_id uuid := gen_random_uuid();
BEGIN
    -- Get the user ID for the target email
    SELECT id INTO v_user_id 
    FROM users 
    WHERE email = :'target_email';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found. Please sign up this user first!', :'target_email';
    END IF;
    
    RAISE NOTICE 'Found user % with ID: %', :'target_email', v_user_id;
    
    -- Insert the roadmap (completed state)
    INSERT INTO roadmaps (
        id, 
        user_id, 
        goal_description, 
        status, 
        created_at, 
        completed_at,
        updated_at
    ) VALUES (
        v_roadmap_id,
        v_user_id,
        'I want to think more clearly about...',
        'completed',
        '2025-08-09 14:30:53.334838+00'::timestamptz,
        '2025-08-10 12:58:51.74079+00'::timestamptz,
        '2025-08-10 12:58:51.74079+00'::timestamptz
    );

    UPDATE users 
    SET roadmap_count = 1,
        free_roadmaps_used = TRUE 
    WHERE id = v_user_id;
    
    RAISE NOTICE 'Created roadmap with ID: %', v_roadmap_id;
    
    -- Insert Step 1: Stoicism (completed)
    INSERT INTO roadmap_steps (
        id,
        roadmap_id,
        knowledge_content_id,
        status,
        "order",
        plan_trigger,
        plan_action,
        plan_created_at,
        updated_at,
        completed_at
    ) VALUES (
        v_step1_id,
        v_roadmap_id,
        'f00d8703-eb3a-4cd0-aa09-7e70a730cc0f', -- Stoicism
        'completed',
        1,
        'When I get frustrated with a coworker interrupting me during deep work',
        'I will pause, take a breath, and remind myself I can only control my response, not their behavior. Then politely but firmly say "I need to focus on this task until 3pm, can we discuss this after?"',
        '2025-08-09 14:39:56.353+00'::timestamptz,
        '2025-08-09 14:40:57.904578+00'::timestamptz,
        NULL
    );
    
    -- Insert Step 2: Probabilistic Thinking (completed)
    INSERT INTO roadmap_steps (
        id,
        roadmap_id,
        knowledge_content_id,
        status,
        "order",
        plan_trigger,
        plan_action,
        plan_created_at,
        updated_at,
        completed_at
    ) VALUES (
        v_step2_id,
        v_roadmap_id,
        '77485be1-e918-40d8-af4c-29bcb7ee27d4', -- Probabilistic Thinking
        'completed',
        2,
        'Before committing to a new project at work',
        'I will estimate: 30% chance of finishing on time, 50% chance of 1-2 week delay, 20% chance of major delays. Then I''ll communicate these probabilities to stakeholders instead of just saying "yes"',
        '2025-08-09 14:48:28.719+00'::timestamptz,
        '2025-08-09 14:55:04.971654+00'::timestamptz,
        NULL
    );
    
    -- Insert Step 3: Constructivism (completed)
    INSERT INTO roadmap_steps (
        id,
        roadmap_id,
        knowledge_content_id,
        status,
        "order",
        plan_trigger,
        plan_action,
        plan_created_at,
        updated_at,
        completed_at
    ) VALUES (
        v_step3_id,
        v_roadmap_id,
        'ed06c736-2b71-4b07-8749-1123c144e70c', -- Constructivism
        'completed',
        3,
        'When I disagree with someone''s approach to solving a problem',
        'I will ask "What experiences led you to this solution?" to understand their perspective, recognizing we each construct our understanding based on different backgrounds',
        '2025-08-09 14:56:55.911+00'::timestamptz,
        '2025-08-09 14:57:52.097658+00'::timestamptz,
        NULL
    );
    
    -- Insert Step 4: Twaddle Tendency (completed)
    INSERT INTO roadmap_steps (
        id,
        roadmap_id,
        knowledge_content_id,
        status,
        "order",
        plan_trigger,
        plan_action,
        plan_created_at,
        updated_at,
        completed_at
    ) VALUES (
        v_step4_id,
        v_roadmap_id,
        '7c80233f-ec0a-4274-8617-a4c041b5353e', -- Twaddle Tendency
        'completed',
        4,
        'In meetings when people are using buzzwords and jargon without substance',
        'I will politely ask "Can you give me a specific example of what that would look like in practice?" to cut through the twaddle and get to actionable information',
        '2025-08-09 16:23:59.061+00'::timestamptz,
        '2025-08-10 05:44:12.272934+00'::timestamptz,
        NULL
    );
    
    -- Insert Step 5: Doubt/Avoidance Tendency (completed)
    INSERT INTO roadmap_steps (
        id,
        roadmap_id,
        knowledge_content_id,
        status,
        "order",
        plan_trigger,
        plan_action,
        plan_created_at,
        updated_at,
        completed_at
    ) VALUES (
        v_step5_id,
        v_roadmap_id,
        '6bce98ec-5d30-41d1-ae56-682e1cb0428c', -- Doubt/Avoidance Tendency
        'completed',
        5,
        'When I''m considering a major purchase or investment',
        'I will list three things that could go wrong, research each risk, and only proceed if I have a plan to handle each potential issue',
        '2025-08-10 11:55:23.878+00'::timestamptz,
        '2025-08-10 12:43:37.762707+00'::timestamptz,
        NULL
    );
    
    -- Insert Step 6: Extremely Intense Ideology (completed)
    INSERT INTO roadmap_steps (
        id,
        roadmap_id,
        knowledge_content_id,
        status,
        "order",
        plan_trigger,
        plan_action,
        plan_created_at,
        updated_at,
        completed_at
    ) VALUES (
        v_step6_id,
        v_roadmap_id,
        'e1f2d212-5766-44ab-bca1-38c839954f6c', -- Extremely Intense Ideology
        'completed',
        6,
        'When I find myself getting very passionate about a viewpoint in discussions',
        'I will pause and ask myself "What evidence would change my mind?" If I can''t think of any, I''ll recognize I might be ideologically captured and seek opposing views',
        '2025-08-10 12:44:07.259+00'::timestamptz,
        '2025-08-10 12:58:01.666476+00'::timestamptz,
        NULL
    );
    
    -- Insert Step 7: Scientific Method (completed)
    INSERT INTO roadmap_steps (
        id,
        roadmap_id,
        knowledge_content_id,
        status,
        "order",
        plan_trigger,
        plan_action,
        plan_created_at,
        updated_at,
        completed_at
    ) VALUES (
        v_step7_id,
        v_roadmap_id,
        'bbadaaa6-5116-4f3c-8f4e-b5bb34ab1888', -- Scientific Method
        'completed',
        7,
        'When trying a new productivity technique or habit',
        'I will treat it as an experiment: define success metrics, track for 2 weeks, analyze results, and only continue if data shows improvement. Document what worked and what didn''t',
        '2025-08-10 12:58:33.652+00'::timestamptz,
        '2025-08-10 12:58:51.74079+00'::timestamptz,
        NULL
    );
    
    RAISE NOTICE 'Created 7 roadmap steps';
    
    -- Insert application logs for the completed steps
    
    -- Log for Step 1
    INSERT INTO application_logs (
        id,
        user_id,
        roadmap_step_id,
        situation_text,
        learning_text,
        effectiveness_rating,
        ai_sentiment,
        ai_topics,
        created_at
    ) VALUES (
        gen_random_uuid(),
        v_user_id,
        v_step1_id,
        'My colleague interrupted me three times during my deep work session today. Instead of getting angry like usual, I took a breath and calmly explained I needed uninterrupted time until 3pm. They apologized and said they''d come back later.',
        'The Stoic approach really helped me stay calm. By focusing on what I could control (my response) rather than what I couldn''t (their interruptions), I handled it professionally and preserved the relationship.',
        3,
        NULL,
        NULL,
        '2025-08-09 14:40:57.811+00'::timestamptz
    );
    
    -- Log for Step 2
    INSERT INTO application_logs (
        id,
        user_id,
        roadmap_step_id,
        situation_text,
        learning_text,
        effectiveness_rating,
        ai_sentiment,
        ai_topics,
        created_at
    ) VALUES (
        gen_random_uuid(),
        v_user_id,
        v_step2_id,
        'Boss asked if I could deliver the new feature by next Friday. Instead of my usual "sure, no problem", I gave probabilities: 30% on time, 50% needs weekend, 20% needs until Tuesday. She appreciated the honesty and we planned accordingly.',
        'Being upfront about probabilities led to a much better conversation than over-promising. My boss actually thanked me for the realistic assessment.',
        3,
        NULL,
        NULL,
        '2025-08-09 14:55:04.904+00'::timestamptz
    );
    
    -- Log for Step 3
    INSERT INTO application_logs (
        id,
        user_id,
        roadmap_step_id,
        situation_text,
        learning_text,
        effectiveness_rating,
        ai_sentiment,
        ai_topics,
        created_at
    ) VALUES (
        gen_random_uuid(),
        v_user_id,
        v_step3_id,
        'Designer wanted to use a complex navigation pattern I thought was confusing. Asked about their past experiences with it. Turns out they worked on an app where users loved it. We tested both approaches and found a middle ground.',
        'Understanding that we construct knowledge differently based on experience helped me be more open. The compromise solution was actually better than either original idea.',
        4,
        NULL,
        NULL,
        '2025-08-09 14:57:52.021+00'::timestamptz
    );
    
    -- Log for Step 4
    INSERT INTO application_logs (
        id,
        user_id,
        roadmap_step_id,
        situation_text,
        learning_text,
        effectiveness_rating,
        ai_sentiment,
        ai_topics,
        created_at
    ) VALUES (
        gen_random_uuid(),
        v_user_id,
        v_step4_id,
        'Meeting about "leveraging synergies to drive transformational change". Asked for specific example. Presenter struggled, then admitted they meant "getting teams to share their tools". We cut the meeting from 1 hour to 15 minutes of actual planning.',
        'Cutting through corporate buzzwords saved everyone 45 minutes. The team seemed relieved to talk about actual concrete actions instead of abstract concepts.',
        3,
        NULL,
        NULL,
        '2025-08-10 05:44:12.237+00'::timestamptz
    );
    
    -- Log for Step 5
    INSERT INTO application_logs (
        id,
        user_id,
        roadmap_step_id,
        situation_text,
        learning_text,
        effectiveness_rating,
        ai_sentiment,
        ai_topics,
        created_at
    ) VALUES (
        gen_random_uuid(),
        v_user_id,
        v_step5_id,
        'Was about to buy an expensive online course. Listed risks: 1) Might not have time to complete it 2) Content might be outdated 3) Similar free resources might exist. Found 2/3 risks were real - saved $500 by using free alternatives.',
        'The doubt tendency saved me money! By forcing myself to research the downsides first, I made a much better decision. Will definitely keep using this approach.',
        4,
        NULL,
        NULL,
        '2025-08-10 12:43:37.71+00'::timestamptz
    );
    
    -- Log for Step 6
    INSERT INTO application_logs (
        id,
        user_id,
        roadmap_step_id,
        situation_text,
        learning_text,
        effectiveness_rating,
        ai_sentiment,
        ai_topics,
        created_at
    ) VALUES (
        gen_random_uuid(),
        v_user_id,
        v_step6_id,
        'Got heated defending my favorite framework in a tech discussion. Asked myself what evidence would change my mind. Realized I couldn''t think of any - I was being dogmatic. Spent evening reading criticism of it and found valid points I had been ignoring.',
        'Recognizing my ideological blindness was uncomfortable but valuable. I still prefer my framework but now understand its limitations better.',
        4,
        NULL,
        NULL,
        '2025-08-10 12:58:01.604+00'::timestamptz
    );
    
    -- Log for Step 7
    INSERT INTO application_logs (
        id,
        user_id,
        roadmap_step_id,
        situation_text,
        learning_text,
        effectiveness_rating,
        ai_sentiment,
        ai_topics,
        created_at
    ) VALUES (
        gen_random_uuid(),
        v_user_id,
        v_step7_id,
        'Tried time-blocking for productivity. Set metrics: tasks completed, focus time, stress level. After 2 weeks: 20% more tasks done, but stress up 30%. Modified approach to include buffer time. Week 3: maintained productivity gains with normal stress.',
        'The scientific method approach to self-improvement is powerful! Having data made it easy to iterate and find what actually works for me, not just what sounds good in theory.',
        5,
        NULL,
        NULL,
        '2025-08-10 12:58:51.719+00'::timestamptz
    );
    
    RAISE NOTICE 'Created 7 application log entries';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Successfully created test data for user: %', :'target_email';
    RAISE NOTICE 'Roadmap ID: %', v_roadmap_id;
    RAISE NOTICE 'Status: COMPLETED (all 7 steps completed)';
    RAISE NOTICE '========================================';
    
END $$;

COMMIT;

-- Verify the data was inserted correctly
\echo ''
\echo 'Verification Query Results:'
\echo '==========================='

SELECT 
    r.id as roadmap_id,
    r.goal_description,
    r.status as roadmap_status,
    COUNT(rs.id) as total_steps,
    COUNT(CASE WHEN rs.status = 'completed' THEN 1 END) as completed_steps,
    u.email as user_email
FROM roadmaps r
JOIN users u ON r.user_id = u.id
LEFT JOIN roadmap_steps rs ON rs.roadmap_id = r.id
WHERE u.email = :'target_email'
GROUP BY r.id, r.goal_description, r.status, u.email;

\echo ''
\echo 'Steps Overview:'
SELECT 
    rs."order" as step_number,
    kc.title as concept,
    rs.status,
    CASE WHEN al.id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_reflection
FROM roadmap_steps rs
JOIN roadmaps r ON rs.roadmap_id = r.id
JOIN users u ON r.user_id = u.id
JOIN knowledge_content kc ON rs.knowledge_content_id = kc.id
LEFT JOIN application_logs al ON al.roadmap_step_id = rs.id
WHERE u.email = :'target_email'
ORDER BY rs."order";