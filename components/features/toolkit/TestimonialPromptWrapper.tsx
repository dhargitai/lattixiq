"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TestimonialCard } from "../testimonial/TestimonialCard";
import type { Database } from "@/lib/supabase/database.types";

type TestimonialState = Database["public"]["Enums"]["testimonial_state"];

interface TestimonialPromptWrapperProps {
  initialTestimonialState: TestimonialState;
  triggerType: "first_roadmap" | "sustained_success";
}

export function TestimonialPromptWrapper({
  initialTestimonialState,
  triggerType,
}: TestimonialPromptWrapperProps) {
  const [testimonialState, setTestimonialState] = useState(initialTestimonialState);
  const router = useRouter();

  const updateTestimonialState = async (newState: TestimonialState, testimonialUrl?: string) => {
    try {
      const response = await fetch("/api/users/testimonial", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testimonialState: newState,
          testimonialUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update testimonial state");
      }

      const updatedUser = await response.json();
      setTestimonialState(updatedUser.testimonial_state);

      // Refresh the page to hide the prompt
      router.refresh();
    } catch (error) {
      console.error("Error updating testimonial state:", error);
      // You might want to show an error toast here
    }
  };

  const handleDismiss = async () => {
    const newState = triggerType === "first_roadmap" ? "dismissed_first" : "dismissed_second";
    await updateTestimonialState(newState);
  };

  // Don't show if already handled
  if (
    testimonialState === "dismissed_first" ||
    testimonialState === "dismissed_second" ||
    testimonialState === "submitted"
  ) {
    return null;
  }

  return (
    <TestimonialCard
      trigger={triggerType === "first_roadmap" ? "first-completion" : "sustained-success"}
      onDismiss={handleDismiss}
    />
  );
}
