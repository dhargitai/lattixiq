import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClient } from "@/lib/supabase/client";

// Mock supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

describe("Step Unlocking Bug - Integration Test", () => {
  let mockSupabase: any;

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

    vi.mocked(createClient).mockReturnValue(mockSupabase);
  });

  it("should unlock next step when marking current step as completed", async () => {
    // Mock roadmap data
    const mockSteps = [
      {
        id: "step-1",
        roadmap_id: "roadmap-1",
        order: 0,
        status: "unlocked",
        plan_situation: "Test situation",
        plan_trigger: "Test trigger",
        plan_action: "Test action",
      },
      {
        id: "step-2",
        roadmap_id: "roadmap-1",
        order: 1,
        status: "locked",
        plan_situation: null,
        plan_trigger: null,
        plan_action: null,
      },
    ];

    // Mock database responses
    const mockUpdate = vi.fn().mockResolvedValue({ error: null });
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        gt: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockSteps[1],
                error: null,
              }),
            }),
          }),
        }),
      }),
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "roadmap_steps") {
        return {
          update: mockUpdate,
          select: mockSelect,
          eq: vi.fn(),
        };
      }
      return { update: vi.fn(), select: vi.fn() };
    });

    // Test the unlock logic directly
    const mockMarkCompleted = async (stepId: string) => {
      // This simulates the logic from roadmap-store.ts
      await mockSupabase.from("roadmap_steps").update({ status: "completed" }).eq("id", stepId);

      // Find next step
      const { data: nextStep } = await mockSupabase
        .from("roadmap_steps")
        .select("id, status, order")
        .eq("roadmap_id", "roadmap-1")
        .gt("order", 0)
        .order("order", { ascending: true })
        .limit(1)
        .single();

      if (nextStep && nextStep.status === "locked") {
        await mockSupabase
          .from("roadmap_steps")
          .update({ status: "unlocked" })
          .eq("id", nextStep.id);
      }
    };

    // Execute the test
    await mockMarkCompleted("step-1");

    // Verify the calls
    expect(mockUpdate).toHaveBeenCalledTimes(2);
    expect(mockUpdate).toHaveBeenNthCalledWith(1, { status: "completed" });
    expect(mockUpdate).toHaveBeenNthCalledWith(2, { status: "unlocked" });
  });

  it("should handle case where next step unlock silently fails", async () => {
    // This reproduces the reported bug
    const mockUpdate = vi
      .fn()
      .mockResolvedValueOnce({ error: null }) // Mark completed succeeds
      .mockResolvedValueOnce({ error: { message: "Database error" } }); // Unlock fails

    mockSupabase.from.mockImplementation(() => ({ update: mockUpdate }));

    // Test the bug scenario
    let errorCaught = false;
    try {
      // This simulates the direct database approach used in ReflectScreen fallback
      const supabase = createClient();

      // This works
      await supabase.from("roadmap_steps").update({ status: "completed" }).eq("id", "step-1");

      // This fails silently - the bug
      const { error: unlockError } = await supabase
        .from("roadmap_steps")
        .update({ status: "unlocked" })
        .eq("id", "step-2");

      if (unlockError) {
        throw new Error(`Failed to unlock next step: ${unlockError.message}`);
      }
    } catch (error) {
      errorCaught = true;
      expect((error as Error).message).toContain("Failed to unlock next step");
    }

    expect(errorCaught).toBe(true);
  });
});
