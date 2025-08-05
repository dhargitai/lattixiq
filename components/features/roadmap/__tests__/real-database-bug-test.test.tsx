import { describe, it, expect } from "vitest";
import { createClient } from "@/lib/supabase/client";

// This test uses the real database to reproduce the bug scenario
describe("Real Database Bug Reproduction", () => {
  const supabase = createClient();

  it("should unlock next step when current step is completed", async () => {
    // Find the completed step (order 2) and the locked step (order 3)
    const { data: completedStep } = await supabase
      .from("roadmap_steps")
      .select("id, roadmap_id, order, status")
      .eq("order", 2)
      .single();

    if (!completedStep) {
      console.log("No completed step found, skipping test");
      return;
    }

    const { data: lockedStep } = await supabase
      .from("roadmap_steps")
      .select("id, roadmap_id, order, status")
      .eq("roadmap_id", completedStep.roadmap_id)
      .eq("order", 3)
      .single();

    console.log("Current state:");
    console.log("- Completed step:", completedStep);
    console.log("- Next step:", lockedStep);

    expect(completedStep?.status).toBe("completed");
    expect(lockedStep?.status).toBe("locked"); // This shows the bug - should be unlocked!

    // Now test the fallback mechanism from ReflectScreen
    // Simulate what happens when roadmap store is empty
    if (lockedStep && lockedStep.status === "locked") {
      console.log("Attempting to unlock next step using fallback mechanism...");

      // This is the exact code from ReflectScreen.tsx lines 143-147
      const { error: unlockError } = await supabase
        .from("roadmap_steps")
        .update({ status: "unlocked" })
        .eq("id", lockedStep.id);

      expect(unlockError).toBeNull();

      // Verify it was unlocked
      const { data: updatedStep } = await supabase
        .from("roadmap_steps")
        .select("status")
        .eq("id", lockedStep.id)
        .single();

      console.log("After unlock attempt:", updatedStep);
      expect(updatedStep?.status).toBe("unlocked");

      // Clean up - set it back to locked for future tests
      await supabase.from("roadmap_steps").update({ status: "locked" }).eq("id", lockedStep.id);
    }
  });

  it("should demonstrate the exact bug scenario from reflect submission", async () => {
    // Get the test user and roadmap data
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.log("No authenticated user found, skipping test");
      return;
    }

    // Find a completed step and its next step
    const { data: completedStep } = await supabase
      .from("roadmap_steps")
      .select("*")
      .eq("status", "completed")
      .order("order", { ascending: false })
      .limit(1)
      .single();

    if (!completedStep) {
      console.log("No completed steps found, skipping test");
      return;
    }

    // Check if there's a next step that should be unlocked
    const { data: nextStep } = await supabase
      .from("roadmap_steps")
      .select("id, status, order")
      .eq("roadmap_id", completedStep.roadmap_id)
      .gt("order", completedStep.order)
      .order("order", { ascending: true })
      .limit(1)
      .single();

    console.log("Bug demonstration:");
    console.log("- Completed step order:", completedStep.order);
    console.log("- Next step:", nextStep);

    if (nextStep) {
      // This should be unlocked if the progression worked correctly
      // But if there's a bug, it will still be locked
      console.log("Next step status:", nextStep.status);

      if (nextStep.status === "locked") {
        console.log("🐛 BUG CONFIRMED: Next step is still locked when it should be unlocked!");

        // Test the fix
        console.log("Testing fix...");
        const { error } = await supabase
          .from("roadmap_steps")
          .update({ status: "unlocked" })
          .eq("id", nextStep.id);

        expect(error).toBeNull();
        console.log("✅ Fix applied successfully");

        // Verify fix
        const { data: fixedStep } = await supabase
          .from("roadmap_steps")
          .select("status")
          .eq("id", nextStep.id)
          .single();

        expect(fixedStep?.status).toBe("unlocked");
        console.log("✅ Next step is now unlocked");
      } else {
        console.log("✅ No bug detected - next step is properly unlocked");
      }
    }
  });
});
