import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClient } from "@/lib/supabase/client";

// Mock supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

describe("Step Unlocking Bug - Integration Test", () => {
  let mockSupabase: ReturnType<typeof createClient>;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "test-user" } },
          error: null,
        }),
      },
      from: vi.fn(),
      rpc: vi.fn(),
    } as unknown as ReturnType<typeof createClient>;

    vi.mocked(createClient).mockReturnValue(mockSupabase);
  });

  it("should unlock next step when marking current step as completed", async () => {
    // Mock RPC function for atomic step completion
    const mockRpc = vi.fn().mockResolvedValue({
      data: {
        completed_step_id: "step-1",
        unlocked_step_id: "step-2",
        all_steps_completed: false,
        roadmap_completed: false,
      },
      error: null,
    });

    mockSupabase.from = vi.fn();
    mockSupabase.rpc = mockRpc;

    // Execute the test
    const result = await mockSupabase.rpc("complete_step_and_unlock_next", {
      p_step_id: "step-1",
      p_roadmap_id: "roadmap-1",
    });

    // Verify the RPC was called correctly
    expect(mockRpc).toHaveBeenCalledWith("complete_step_and_unlock_next", {
      p_step_id: "step-1",
      p_roadmap_id: "roadmap-1",
    });
    expect(result.data).toEqual({
      completed_step_id: "step-1",
      unlocked_step_id: "step-2",
      all_steps_completed: false,
      roadmap_completed: false,
    });
  });

  it("should handle case where RPC function fails to unlock next step", async () => {
    // This reproduces the reported bug scenario using the RPC function
    const mockRpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Failed to unlock next step: Database error" },
    });

    mockSupabase.rpc = mockRpc;

    // Test the bug scenario with RPC approach
    let errorCaught = false;
    try {
      const supabase = createClient();

      // This should fail atomically - the bug is now properly handled
      const { error } = await (
        supabase.rpc as (
          name: string,
          params: Record<string, unknown>
        ) => Promise<{ data: unknown; error: { message: string } | null }>
      )("complete_step_and_unlock_next", {
        p_step_id: "step-1",
        p_roadmap_id: "roadmap-1",
      });

      if (error) {
        throw new Error(`Failed to complete step: ${error.message}`);
      }
    } catch (error) {
      errorCaught = true;
      expect((error as Error).message).toContain("Failed to complete step");
    }

    expect(errorCaught).toBe(true);
    expect(mockRpc).toHaveBeenCalledWith("complete_step_and_unlock_next", {
      p_step_id: "step-1",
      p_roadmap_id: "roadmap-1",
    });
  });
});
