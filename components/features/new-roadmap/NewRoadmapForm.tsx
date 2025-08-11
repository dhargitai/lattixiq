"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/button";
import { StandardCTAButton } from "@/components/ui/StandardCTAButton";
import { Textarea } from "@/components/ui/textarea";
import { hasCompletedOnboardingClient } from "@/lib/db/user-preferences";
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
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      // Performance monitoring for DB check
      const startTime = performance.now();

      // First check database for onboarding status
      const hasCompleted = await hasCompletedOnboardingClient();
      setIsNewUser(!hasCompleted);

      const endTime = performance.now();
      console.log("[Performance] Onboarding status check", {
        duration: `${(endTime - startTime).toFixed(2)}ms`,
        hasCompleted,
        timestamp: new Date().toISOString(),
      });

      // Migration: Check localStorage for existing data
      const localStorageOnboarding = localStorage.getItem("hasCompletedOnboarding");
      const localStorageGoal = localStorage.getItem("userGoal");

      if (localStorageOnboarding && !hasCompleted) {
        // User has localStorage flag but no roadmaps in DB - likely migration needed
        console.log("[Onboarding Migration] Found localStorage flag without DB roadmaps", {
          localStorageOnboarding,
          hasCompletedInDB: hasCompleted,
          timestamp: new Date().toISOString(),
        });
        // We'll handle this by letting them create a new roadmap which will update the DB
      }

      // Clean up localStorage after checking (migration phase)
      if (localStorageOnboarding || localStorageGoal) {
        localStorage.removeItem("hasCompletedOnboarding");
        localStorage.removeItem("userGoal");
        console.log("[Onboarding Migration] Cleaned up localStorage", {
          hadOnboardingFlag: !!localStorageOnboarding,
          hadGoal: !!localStorageGoal,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Error checking onboarding status:", err);
      // Fallback to assuming new user if check fails
      setIsNewUser(true);
    } finally {
      setIsCheckingOnboarding(false);
    }
  };

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

      // Onboarding is now automatically completed when roadmap is created
      // The create_roadmap_with_tracking RPC function increments roadmap_count

      // Analytics: Log successful roadmap creation
      console.log("[Analytics] Roadmap created successfully", {
        isFirstRoadmap: isNewUser,
        goalLength: goal.length,
        timestamp: new Date().toISOString(),
        roadmapId: data.id,
      });

      // Log for debugging in E2E tests
      if (process.env.NEXT_PUBLIC_E2E_TEST === "true") {
        console.log("E2E: API response received, navigating to /roadmap");
      }

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
        <AppHeader screenName="Create New Roadmap" helpContentId="new-roadmap-screen-help" />

        {/* Content */}
        <div className="flex-1 px-5 py-8 pb-20">
          <div className="max-w-[640px] mx-auto w-full">
            <div className="bg-white rounded-2xl px-8 py-10 shadow-[0_4px_12px_rgba(0,0,0,0.05)] animate-in fade-in slide-in-from-bottom-3 duration-500">
              <h2 className="text-[26px] font-bold text-center text-[#1A202C] mb-8 tracking-tight leading-tight">
                {isCheckingOnboarding
                  ? "Loading..."
                  : isNewUser
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

                  <StandardCTAButton
                    type="submit"
                    disabled={goal.length < 10}
                    variant="secondary"
                    size="md"
                    fullWidth
                  >
                    Create My Roadmap
                  </StandardCTAButton>
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
