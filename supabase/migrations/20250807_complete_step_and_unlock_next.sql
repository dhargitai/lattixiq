-- Create RPC function for atomic step completion and next step unlocking
CREATE OR REPLACE FUNCTION complete_step_and_unlock_next(
  p_step_id UUID,
  p_roadmap_id UUID
) RETURNS JSON AS $$
DECLARE
  v_next_step_id UUID;
  v_completed_step_order INT;
  v_all_steps_completed BOOLEAN;
  v_result JSON;
BEGIN
  -- Start transaction
  -- First, mark the current step as completed
  UPDATE roadmap_steps
  SET 
    status = 'completed',
    updated_at = NOW()
  WHERE 
    id = p_step_id 
    AND roadmap_id = p_roadmap_id
  RETURNING "order" INTO v_completed_step_order;
  
  -- Check if the step was found and updated
  IF v_completed_step_order IS NULL THEN
    RAISE EXCEPTION 'Step not found or already completed';
  END IF;
  
  -- Find the next step in the sequence
  SELECT id INTO v_next_step_id
  FROM roadmap_steps
  WHERE 
    roadmap_id = p_roadmap_id
    AND "order" > v_completed_step_order
    AND status = 'locked'
  ORDER BY "order"
  LIMIT 1;
  
  -- If there's a next step, unlock it
  IF v_next_step_id IS NOT NULL THEN
    UPDATE roadmap_steps
    SET 
      status = 'unlocked',
      updated_at = NOW()
    WHERE id = v_next_step_id;
  END IF;
  
  -- Check if all steps are completed
  SELECT 
    NOT EXISTS (
      SELECT 1 
      FROM roadmap_steps 
      WHERE roadmap_id = p_roadmap_id 
      AND status != 'completed'
    ) INTO v_all_steps_completed;
  
  -- If all steps are completed, update the roadmap status
  IF v_all_steps_completed THEN
    UPDATE roadmaps
    SET 
      status = 'completed',
      completed_at = NOW(),
      updated_at = NOW()
    WHERE id = p_roadmap_id;
  END IF;
  
  -- Build the result JSON
  SELECT json_build_object(
    'completed_step_id', p_step_id,
    'unlocked_step_id', v_next_step_id,
    'all_steps_completed', v_all_steps_completed,
    'roadmap_completed', v_all_steps_completed
  ) INTO v_result;
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback is automatic in case of exception
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION complete_step_and_unlock_next(UUID, UUID) TO authenticated;

-- Add a comment to document the function
COMMENT ON FUNCTION complete_step_and_unlock_next(UUID, UUID) IS 
'Atomically marks a roadmap step as completed and unlocks the next step in sequence. 
Also updates the roadmap status to completed if all steps are done.
Returns a JSON object with the operation results.';