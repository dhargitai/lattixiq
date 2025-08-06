import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type TestimonialState = Database["public"]["Enums"]["testimonial_state"];

interface UpdateTestimonialRequest {
  testimonialState?: TestimonialState;
  testimonialUrl?: string;
}

// Valid state transitions
const validTransitions: Record<TestimonialState, TestimonialState[]> = {
  not_asked: ["asked_first", "dismissed_first", "submitted"],
  asked_first: ["dismissed_first", "submitted", "asked_second"],
  dismissed_first: ["asked_second", "submitted"],
  submitted: [], // Terminal state
  asked_second: ["dismissed_second", "submitted"],
  dismissed_second: ["submitted"], // Can still submit after dismissing
};

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body: UpdateTestimonialRequest = await request.json();
    const { testimonialState, testimonialUrl } = body;

    if (!testimonialState) {
      return NextResponse.json({ error: "testimonialState is required" }, { status: 400 });
    }

    // Get current user state
    const { data: currentUser, error: fetchError } = await supabase
      .from("users")
      .select("testimonial_state")
      .eq("id", user.id)
      .single();

    if (fetchError || !currentUser) {
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
    }

    // Validate state transition
    const currentState = currentUser.testimonial_state || "not_asked";
    const allowedTransitions = validTransitions[currentState];

    if (!allowedTransitions.includes(testimonialState)) {
      return NextResponse.json(
        {
          error: `Invalid state transition from ${currentState} to ${testimonialState}`,
        },
        { status: 400 }
      );
    }

    // Update user record
    const updateData: Record<string, unknown> = {
      testimonial_state: testimonialState,
    };

    // Only update testimonial_url if provided and transitioning to submitted
    if (testimonialUrl && testimonialState === "submitted") {
      updateData.testimonial_url = testimonialUrl;
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating user testimonial state:", updateError);
      return NextResponse.json({ error: "Failed to update testimonial state" }, { status: 500 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error in PATCH /api/users/testimonial:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
