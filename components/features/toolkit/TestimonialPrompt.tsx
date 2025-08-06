"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SenjaWidget } from "./SenjaWidget";
import type { Database } from "@/lib/supabase/database.types";

type TestimonialState = Database["public"]["Enums"]["testimonial_state"];

interface TestimonialPromptProps {
  testimonialState: TestimonialState;
  triggerType: "first_roadmap" | "sustained_success";
  onDismiss: () => void;
  onSubmit?: (testimonialUrl?: string) => void;
}

export function TestimonialPrompt({
  testimonialState,
  triggerType,
  onDismiss,
  onSubmit,
}: TestimonialPromptProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Don't show if already dismissed or submitted
  if (
    testimonialState === "dismissed_first" ||
    testimonialState === "dismissed_second" ||
    testimonialState === "submitted"
  ) {
    return null;
  }

  // Don't show for second trigger if not yet asked first
  if (triggerType === "sustained_success" && testimonialState === "not_asked") {
    return null;
  }

  const handleDismiss = async () => {
    setIsLoading(true);
    try {
      await onDismiss();
    } finally {
      setIsLoading(false);
    }
  };

  const getContent = () => {
    if (triggerType === "first_roadmap") {
      return {
        emoji: "🎉",
        title: "Congratulations on finishing your first roadmap!",
        text: "That's a huge achievement. If you have a moment, we'd love to hear about your experience.",
      };
    } else {
      return {
        emoji: "🌟",
        title: "Wow, you've completed several roadmaps with great results!",
        text: "We're so glad you're finding this valuable. If you're willing, we'd love for you to share your story.",
      };
    }
  };

  const content = getContent();

  return (
    <Card className="relative mb-8 border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 p-6 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 h-8 w-8 rounded-full bg-white shadow-sm hover:scale-110"
        onClick={handleDismiss}
        disabled={isLoading}
        aria-label="Dismiss"
      >
        <X className="h-4 w-4 text-blue-500" />
      </Button>

      <div className="mb-4 text-center text-4xl">{content.emoji}</div>

      <h3 className="mb-3 pr-10 text-xl font-semibold text-blue-900">{content.title}</h3>

      <p className="mb-5 text-base leading-relaxed text-blue-700">{content.text}</p>

      {/* Senja.io widget */}
      <div className="rounded-xl bg-white p-6">
        <SenjaWidget
          projectId={process.env.NEXT_PUBLIC_SENJA_PROJECT_ID}
          formId={process.env.NEXT_PUBLIC_SENJA_FORM_ID}
          onSuccess={(testimonialUrl) => {
            onSubmit?.(testimonialUrl);
          }}
        />
      </div>
    </Card>
  );
}
