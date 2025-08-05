/**
 * Type definitions for custom Supabase RPC functions
 *
 * These types extend the Supabase client to provide type safety
 * for custom database functions without using 'as any' or disabling linting.
 */

import type { PostgrestError } from "@supabase/supabase-js";

// Response types for RPC functions
export interface CompleteStepResult {
  success: boolean;
  next_step_id?: string;
  unlocked_steps: string[];
  completed_step_id: string;
  roadmap_id: string;
}

export interface GetUserProgressResult {
  roadmap_id: string;
  total_steps: number;
  completed_steps: number;
  progress_percentage: number;
  current_step_id?: string;
}

export interface UpdateStepStatusResult {
  success: boolean;
  step_id: string;
  new_status: "pending" | "in_progress" | "completed" | "locked";
  affected_steps: string[];
}

// RPC function parameter types
export interface CompleteStepParams {
  p_step_id: string;
  p_roadmap_id: string;
}

export interface GetUserProgressParams {
  user_id: string;
}

export interface UpdateStepStatusParams {
  step_id: string;
  new_status: "pending" | "in_progress" | "completed" | "locked";
}

// Type-safe RPC response wrapper
export interface RpcResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

// Extend Supabase client with our RPC functions
// This will be used in module augmentation
export interface CustomRpcFunctions {
  complete_step_and_unlock_next: {
    params: CompleteStepParams;
    result: CompleteStepResult;
  };
  get_user_roadmap_progress: {
    params: GetUserProgressParams;
    result: GetUserProgressResult;
  };
  update_step_status: {
    params: UpdateStepStatusParams;
    result: UpdateStepStatusResult;
  };
}
