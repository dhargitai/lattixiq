-- Database functions for secure roadmap operations with automatic tracking

-- Function: create_roadmap_with_tracking
-- Creates a roadmap with steps and automatically updates user tracking fields
CREATE OR REPLACE FUNCTION create_roadmap_with_tracking(
  p_user_id UUID,
  p_goal_description TEXT,
  p_steps JSONB -- Array of {knowledge_content_id: UUID, order: number}
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_roadmap_id UUID;
  v_roadmap_count INTEGER;
  v_has_testimonial BOOLEAN;
  v_step JSONB;
BEGIN
  -- Start transaction
  BEGIN
    -- Create the roadmap
    INSERT INTO roadmaps (user_id, goal_description, status, created_at)
    VALUES (p_user_id, p_goal_description, 'active', NOW())
    RETURNING id INTO v_roadmap_id;

    -- Create roadmap steps
    FOR v_step IN SELECT * FROM jsonb_array_elements(p_steps)
    LOOP
      INSERT INTO roadmap_steps (
        roadmap_id,
        knowledge_content_id,
        "order",
        status
      ) VALUES (
        v_roadmap_id,
        (v_step->>'knowledge_content_id')::UUID,
        (v_step->>'order')::INTEGER,
        CASE 
          WHEN (v_step->>'order')::INTEGER = 1 THEN 'unlocked'::roadmap_step_status
          ELSE 'locked'::roadmap_step_status
        END
      );
    END LOOP;

    -- Get current roadmap count for user
    SELECT COUNT(*) INTO v_roadmap_count
    FROM roadmaps
    WHERE user_id = p_user_id;

    -- Check if user has testimonial
    SELECT (testimonial_url IS NOT NULL) INTO v_has_testimonial
    FROM users
    WHERE id = p_user_id;

    -- Update user tracking fields
    UPDATE users
    SET 
      roadmap_count = v_roadmap_count,
      free_roadmaps_used = CASE 
        WHEN v_roadmap_count >= 1 THEN TRUE 
        ELSE FALSE 
      END,
      testimonial_bonus_used = CASE
        WHEN v_roadmap_count = 2 AND v_has_testimonial THEN TRUE
        ELSE testimonial_bonus_used -- Keep existing value
      END
    WHERE id = p_user_id;

    -- Return the created roadmap ID
    RETURN v_roadmap_id;

  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback will happen automatically
      RAISE EXCEPTION 'Failed to create roadmap: %', SQLERRM;
  END;
END;
$$;

-- Function: sync_user_data
-- Synchronizes user's roadmap counts and testimonial status
-- Can be called manually if data gets out of sync
CREATE OR REPLACE FUNCTION sync_user_data(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  user_id UUID,
  roadmap_count INTEGER,
  free_roadmaps_used BOOLEAN,
  testimonial_bonus_used BOOLEAN,
  has_testimonial BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
BEGIN
  -- If no user_id provided, sync all users (admin operation)
  FOR v_user IN 
    SELECT DISTINCT u.id
    FROM users u
    WHERE p_user_id IS NULL OR u.id = p_user_id
  LOOP
    -- Count actual roadmaps for this user
    WITH user_stats AS (
      SELECT 
        u.id,
        COUNT(r.id) AS actual_roadmap_count,
        (u.testimonial_url IS NOT NULL) AS has_testimonial
      FROM users u
      LEFT JOIN roadmaps r ON r.user_id = u.id
      WHERE u.id = v_user.id
      GROUP BY u.id, u.testimonial_url
    )
    UPDATE users u
    SET 
      roadmap_count = us.actual_roadmap_count,
      free_roadmaps_used = (us.actual_roadmap_count >= 1),
      testimonial_bonus_used = CASE
        WHEN us.actual_roadmap_count >= 2 AND us.has_testimonial THEN TRUE
        ELSE FALSE
      END
    FROM user_stats us
    WHERE u.id = us.id
    RETURNING 
      u.id,
      u.roadmap_count,
      u.free_roadmaps_used,
      u.testimonial_bonus_used,
      (u.testimonial_url IS NOT NULL)
    INTO user_id, roadmap_count, free_roadmaps_used, testimonial_bonus_used, has_testimonial;
    
    RETURN NEXT;
  END LOOP;
  
  RETURN;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_roadmap_with_tracking TO authenticated;
GRANT EXECUTE ON FUNCTION sync_user_data TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION create_roadmap_with_tracking IS 'Creates a roadmap with steps and updates user tracking fields atomically';
COMMENT ON FUNCTION sync_user_data IS 'Synchronizes user roadmap counts and testimonial status - can be called for recovery';