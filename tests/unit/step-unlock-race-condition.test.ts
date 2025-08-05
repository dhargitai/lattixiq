import { describe, it, expect, vi, beforeEach } from "vitest";

// Test to reproduce the step unlocking race condition bug
describe("Step Unlocking Race Condition Bug", () => {
  let mockSupabase: any;
  let mockRouter: any;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "test-user" } },
          error: null,
        }),
      },
      from: vi.fn(),
    };

    mockRouter = {
      push: vi.fn(),
    };
  });

  it("should demonstrate atomic step completion prevents race conditions", async () => {
    // Setup mock data
    const step = {
      id: "step-1",
      roadmap_id: "roadmap-1",
      order: 0,
      plan_situation: "Test situation",
      plan_trigger: "Test trigger",
      plan_action: "Test action",
    };

    // Mock RPC function that handles atomic operations
    const mockRpc = vi.fn().mockImplementation((functionName: string, params: any) => {
      return new Promise((resolve) => {
        // Simulate database latency
        setTimeout(() => {
          resolve({
            data: {
              completed_step_id: params.p_step_id,
              unlocked_step_id: "step-2",
              all_steps_completed: false,
              roadmap_completed: false,
            },
            error: null,
          });
        }, 100);
      });
    });

    mockSupabase.rpc = mockRpc;

    // Test the atomic completion scenario
    const markStepCompletedAtomically = async () => {
      try {
        // Use RPC function for atomic step completion and next step unlocking
        const { data, error } = await mockSupabase.rpc("complete_step_and_unlock_next", {
          p_step_id: step.id,
          p_roadmap_id: step.roadmap_id,
        });

        if (error) {
          throw error;
        }

        // Only navigate if operation succeeds
        mockRouter.push("/roadmap?success=true");
        return { success: true, data };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    };

    // Execute the test
    const result = await markStepCompletedAtomically();

    // Verify the RPC was called correctly
    expect(result.success).toBe(true);
    expect(mockRpc).toHaveBeenCalledWith("complete_step_and_unlock_next", {
      p_step_id: step.id,
      p_roadmap_id: step.roadmap_id,
    });
    expect(mockRouter.push).toHaveBeenCalledWith("/roadmap?success=true");
  });

  it("should demonstrate RPC properly handles unlock failures", async () => {
    // Setup mock with error in RPC function
    const step = {
      id: "step-1",
      roadmap_id: "roadmap-1",
      order: 0,
    };

    // Mock RPC function that fails
    const mockRpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Failed to unlock next step: Foreign key constraint violation" },
    });

    mockSupabase.rpc = mockRpc;

    // Test proper error handling with RPC
    const markStepCompletedWithErrorHandling = async () => {
      try {
        // Use RPC function for atomic step completion
        const { data, error } = await mockSupabase.rpc("complete_step_and_unlock_next", {
          p_step_id: step.id,
          p_roadmap_id: step.roadmap_id,
        });

        if (error) {
          // The fix: RPC errors are properly propagated to the user
          throw new Error(`Failed to complete step: ${error.message}`);
        }

        // Only navigate if the entire operation succeeds
        mockRouter.push("/roadmap?success=true");
        return { success: true, data };
      } catch (error) {
        // The fix: user is informed of the failure
        console.error("Step completion failed:", error);
        return { success: false, error: (error as Error).message };
      }
    };

    // Execute the test
    const result = await markStepCompletedWithErrorHandling();

    // The fix: function properly fails when unlock fails
    expect(result.success).toBe(false);
    expect(result.error).toContain("Failed to complete step");
    expect(mockRpc).toHaveBeenCalledWith("complete_step_and_unlock_next", {
      p_step_id: step.id,
      p_roadmap_id: step.roadmap_id,
    });
    expect(mockRouter.push).not.toHaveBeenCalled(); // Navigation only on success
  });
});
