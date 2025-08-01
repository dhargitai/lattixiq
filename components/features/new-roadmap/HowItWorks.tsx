"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

interface HowItWorksProps {
  isNewUser: boolean;
}

export default function HowItWorks({ isNewUser }: HowItWorksProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsExpanded(isNewUser);
  }, [isNewUser]);

  return (
    <div
      data-testid="how-it-works"
      className={cn(
        "rounded-lg bg-gradient-to-br from-green-50 to-green-100",
        "dark:from-green-950 dark:to-green-900",
        "transition-all duration-300"
      )}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-left"
        aria-label="How this works"
      >
        <h3 className="font-semibold text-green-800 dark:text-green-200">How this works</h3>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-green-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-green-600" />
        )}
      </button>

      <div
        data-testid="how-it-works-content"
        className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? "max-h-96" : "max-h-0"
        )}
        style={{ display: isExpanded ? "block" : "none" }}
      >
        <div className="space-y-3 px-4 pb-4">
          <p className="text-sm text-green-700 dark:text-green-300">
            We&apos;ll create a personalized roadmap just for you:
          </p>
          <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>5-7 mental models tailored to your specific challenge</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Each model includes practical exercises and real-world applications</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Learn at your own pace with our Learn → Plan → Reflect cycle</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Track your progress and build your personal toolkit of wisdom</span>
            </li>
          </ul>
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            Your journey to clearer thinking starts here!
          </p>
        </div>
      </div>
    </div>
  );
}
