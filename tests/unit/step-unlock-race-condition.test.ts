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

  it("should demonstrate the race condition in step unlocking", async () => {
    // Setup mock data
    const step = {
      id: "step-1",
      roadmap_id: "roadmap-1",
      order: 0,
      plan_situation: "Test situation",
      plan_trigger: "Test trigger",
      plan_action: "Test action",
    };

    const nextStep = {
      id: "step-2",
      roadmap_id: "roadmap-1",
      order: 1,
      status: "locked",
    };

    // Mock database operations with realistic delays
    const mockUpdateStep = vi.fn().mockImplementation(() => {
      // Simulate database latency
      return new Promise((resolve) => setTimeout(() => resolve({ error: null }), 50));
    });

    const mockUpdateNextStep = vi.fn().mockImplementation(() => {
      // Simulate slower database operation for next step
      return new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100));
    });

    const mockSelectNextStep = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: nextStep, error: null }),
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "roadmap_steps") {
        return {
          update: mockUpdateStep,
          select: mockSelectNextStep,
          eq: vi.fn().mockReturnThis(),
        };
      }
      if (table === "application_logs") {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return { update: vi.fn(), select: vi.fn() };
    });

    // Test the race condition scenario
    const markStepCompletedWithRaceCondition = async () => {
      try {
        // This simulates the ReflectScreen fallback mechanism

        // Step 1: Mark current step as completed
        await mockSupabase.from("roadmap_steps").update({ status: "completed" }).eq("id", step.id);

        // Step 2: Find next step
        const { data: nextStepData } = await mockSupabase
          .from("roadmap_steps")
          .select("id, status, order")
          .eq("roadmap_id", step.roadmap_id)
          .gt("order", step.order)
          .order("order", { ascending: true })
          .limit(1)
          .single();

        if (nextStepData && nextStepData.status === "locked") {
          // Step 3: Unlock next step - THIS MIGHT BE RACE CONDITION
          await mockSupabase
            .from("roadmap_steps")
            .update({ status: "unlocked" })
            .eq("id", nextStepData.id);
        }

        // Step 4: Navigate immediately (potential race condition)
        mockRouter.push("/roadmap?success=true");

        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    };

    // Execute the test
    const result = await markStepCompletedWithRaceCondition();

    // Verify the operations completed
    expect(result.success).toBe(true);
    expect(mockUpdateStep).toHaveBeenCalledWith({ status: "completed" });
    expect(mockUpdateNextStep).toHaveBeenCalledWith({ status: "unlocked" });
    expect(mockRouter.push).toHaveBeenCalledWith("/roadmap?success=true");
  });

  it("should demonstrate the bug where unlock fails silently", async () => {
    // Setup mock with error in unlock operation
    const step = {
      id: "step-1",
      roadmap_id: "roadmap-1",
      order: 0,
    };

    const nextStep = {
      id: "step-2",
      roadmap_id: "roadmap-1",
      order: 1,
      status: "locked",
    };

    // Mock successful step completion but failed unlock
    const mockUpdateStep = vi.fn().mockResolvedValue({ error: null });
    const mockUpdateNextStep = vi.fn().mockResolvedValue({
      error: { message: "Foreign key constraint violation" },
    });

    const mockSelectNextStep = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: nextStep, error: null }),
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "roadmap_steps") {
        return {
          update: mockUpdateStep,
          select: mockSelectNextStep,
          eq: vi.fn().mockReturnThis(),
        };
      }
      return { update: vi.fn(), select: vi.fn() };
    });

    // Test the silent failure scenario
    const markStepCompletedWithSilentFailure = async () => {
      try {
        // Mark current step as completed
        const { error: stepError } = await mockSupabase
          .from("roadmap_steps")
          .update({ status: "completed" })
          .eq("id", step.id);

        if (stepError) throw stepError;

        // Find next step
        const { data: nextStepData } = await mockSupabase
          .from("roadmap_steps")
          .select("id, status, order")
          .eq("roadmap_id", step.roadmap_id)
          .gt("order", step.order)
          .order("order", { ascending: true })
          .limit(1)
          .single();

        if (nextStepData && nextStepData.status === "locked") {
          // This might fail silently
          const { error: unlockError } = await mockSupabase
            .from("roadmap_steps")
            .update({ status: "unlocked" })
            .eq("id", nextStepData.id);

          if (unlockError) {
            // BUG: This error is not being handled properly
            console.warn("Failed to unlock next step:", unlockError.message);
            // User sees success, but next step remains locked
          }
        }

        // Always navigate to roadmap regardless of unlock success
        mockRouter.push("/roadmap?success=true");

        return { success: true, stepCompleted: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    };

    // Execute the test
    const result = await markStepCompletedWithSilentFailure();

    // The bug: function succeeds even when unlock fails
    expect(result.success).toBe(true);
    expect(result.stepCompleted).toBe(true);
    expect(mockRouter.push).toHaveBeenCalledWith("/roadmap?success=true");
    expect(mockUpdateNextStep).toHaveBeenCalledWith({ status: "unlocked" });
  });
});
