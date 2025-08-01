"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import HowItWorks from "./HowItWorks";
import GeneratingRoadmap from "./GeneratingRoadmap";

const categories = [
  { name: "Stop Procrastinating", starter: "I want to stop procrastinating on..." },
  { name: "Think More Clearly", starter: "I want to think more clearly about..." },
  { name: "Make Better Decisions", starter: "I want to make better decisions when..." },
  { name: "Overcome Biases", starter: "I want to overcome my bias of..." },
];

export default function NewRoadmapForm() {
  const [goal, setGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("hasCompletedOnboarding");
    setIsNewUser(!hasCompletedOnboarding);
  }, []);

  const handleCategoryClick = (starter: string) => {
    setGoal(starter);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (goal.length < 10) return;

    setIsLoading(true);
    setError("");

    try {
      // Call the API to generate roadmap
      const response = await fetch("/api/roadmaps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goalDescription: goal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate roadmap");
      }

      // Store goal and onboarding status
      localStorage.setItem("userGoal", goal);
      localStorage.setItem("hasCompletedOnboarding", "true");

      // Redirect to the roadmap page
      router.push("/roadmap");
    } catch (err) {
      console.error("Error generating roadmap:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const getValidationHint = () => {
    if (goal.length === 0) {
      return {
        text: "Be specific - this helps us create a better roadmap",
        className: "text-muted-foreground",
      };
    } else if (goal.length < 20) {
      return {
        text: "Add more detail for a better personalized roadmap",
        className: "text-destructive",
      };
    } else {
      return {
        text: "Great! This will help us build the right roadmap for you",
        className: "text-green-600",
      };
    }
  };

  const validationHint = getValidationHint();

  return (
    <>
      <div data-testid="new-roadmap-container" className="min-h-screen bg-[#FAFBFC] flex flex-col">
        {/* Header */}
        <header className="bg-white py-6 px-5 border-b border-[#E1E4E8] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#1A202C] tracking-tight">LattixIQ</h1>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 px-5 py-8 pb-20">
          <div className="max-w-[640px] mx-auto w-full">
            <div className="bg-white rounded-2xl px-8 py-10 shadow-[0_4px_12px_rgba(0,0,0,0.05)] animate-in fade-in slide-in-from-bottom-3 duration-500">
              <h2 className="text-[26px] font-bold text-center text-[#1A202C] mb-8 tracking-tight leading-tight">
                {isNewUser
                  ? "What is your single biggest challenge right now?"
                  : "What is your next challenge?"}
              </h2>

              <div className="space-y-8">
                {/* Category Buttons */}
                <div className="flex flex-wrap justify-center gap-3">
                  {categories.map((category) => (
                    <Button
                      key={category.name}
                      variant="outline"
                      onClick={() => handleCategoryClick(category.starter)}
                      className={cn(
                        "px-6 py-2.5 text-sm font-medium",
                        "border-2 border-[#E1E4E8] bg-white",
                        "hover:bg-[#F5F7FA] hover:border-[#CBD5E0]",
                        "transition-all duration-200",
                        "rounded-full"
                      )}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>

                {/* How It Works Section */}
                <HowItWorks isNewUser={isNewUser} />

                {/* Goal Input Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Textarea
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="Type your goal here..."
                      className={cn(
                        "min-h-[140px] resize-none",
                        "text-base px-4 py-3",
                        "border-2 border-[#E1E4E8] rounded-xl",
                        "placeholder:text-[#A0AEC0]",
                        "focus:border-[#4299E1] focus:outline-none",
                        "transition-all duration-200"
                      )}
                      autoFocus
                    />
                    <p className={cn("text-sm pl-1", validationHint.className)}>
                      {validationHint.text}
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={goal.length < 10}
                    className={cn(
                      "w-full py-4 text-base font-semibold",
                      "bg-gradient-to-r from-[#48BB78] to-[#38A169]",
                      "hover:from-[#38A169] hover:to-[#2F855A]",
                      "disabled:from-gray-400 disabled:to-gray-500",
                      "transition-all duration-200",
                      "shadow-sm hover:shadow-md",
                      "rounded-xl"
                    )}
                  >
                    Create My Roadmap
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading && <GeneratingRoadmap />}
    </>
  );
}
