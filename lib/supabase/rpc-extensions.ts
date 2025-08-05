/**
 * Supabase RPC function type extensions
 *
 * This file provides proper TypeScript typing for custom RPC functions
 * defined in the database, eliminating the need for 'as any' casts.
 *
 * Usage: Import this file wherever you use Supabase RPC functions
 * to get full type safety and IntelliSense support.
 */

import type { PostgrestError } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// RPC function parameter types
export interface CompleteStepParams {
  p_step_id: string;
  p_roadmap_id: string;
}

export interface GetUserProgressParams {
  p_user_id: string;
}

export interface UpdateStepStatusParams {
  p_step_id: string;
  p_new_status: "pending" | "in_progress" | "completed" | "locked";
}

// RPC function return types
export interface CompleteStepResult {
  success: boolean;
  next_step_id?: string;
  unlocked_steps: string[];
  completed_step_id: string;
  roadmap_id: string;
  updated_at: string;
}

export interface UserProgressResult {
  roadmap_id: string;
  title: string;
  total_steps: number;
  completed_steps: number;
  progress_percentage: number;
  current_step_id?: string;
  last_activity: string;
}

export interface StepStatusResult {
  success: boolean;
  step_id: string;
  previous_status: string;
  new_status: string;
  affected_steps: Array<{
    step_id: string;
    new_status: string;
  }>;
}

// Type-safe RPC response wrapper
export interface RpcResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

// Extend the Supabase client with our custom RPC functions
// This provides type safety for rpc() calls
export interface CustomRpcFunctions {
  complete_step_and_unlock_next: {
    params: CompleteStepParams;
    result: CompleteStepResult;
  };
  get_user_roadmap_progress: {
    params: GetUserProgressParams;
    result: UserProgressResult[];
  };
  update_step_status: {
    params: UpdateStepStatusParams;
    result: StepStatusResult;
  };
}

// Helper type for type-safe RPC calls
export type RpcFunctionName = keyof CustomRpcFunctions;

// Helper function for type-safe RPC calls
export async function rpcCall<T extends RpcFunctionName>(
  supabase: any,
  functionName: T,
  params: CustomRpcFunctions[T]["params"]
): Promise<{ data: CustomRpcFunctions[T]["result"] | null; error: PostgrestError | null }> {
  return supabase.rpc(functionName, params);
}

// Usage example:
// import { rpcCall } from '@/lib/supabase/rpc-extensions'
//
// const result = await rpcCall(supabase, 'complete_step_and_unlock_next', {
//   p_step_id: 'step-123',
//   p_roadmap_id: 'roadmap-456'
// })
//
// if (result.data) {
//   // result.data is fully typed as CompleteStepResult
// }
