"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, KeyRound, Lightbulb, Home } from "lucide-react";
import type { KnowledgeContent } from "@/lib/supabase/types";

interface UnlockedViewerProps {
  content: KnowledgeContent;
}

export default function UnlockedViewer({ content }: UnlockedViewerProps) {
  const router = useRouter();

  const handleNavigateBack = () => {
    router.push("/toolkit");
  };

  const getTypeLabel = () => {
    switch (content.type) {
      case "mental-model":
        return "Mental Model";
      case "cognitive-bias":
        return "Cognitive Bias";
      case "fallacy":
        return "Fallacy";
      default:
        return content.type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <AppHeader screenName="Unlocked Knowledge" helpContentId="unlocked-screen-help" />

      {/* Main content - reusing Learn screen layout */}
      <main className="flex-1 px-5 py-8 pb-24 md:px-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          {/* Back navigation */}
          <Button
            variant="ghost"
            onClick={handleNavigateBack}
            className="mb-6 text-blue-500 hover:text-blue-600 hover:bg-gray-50 font-medium px-2 py-1.5 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Toolkit
          </Button>

          {/* Content card with enhanced styling */}
          <Card className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-8 md:p-14 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <CardContent className="p-0 space-y-8">
              {/* Completed badge indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium">Completed & Learned</span>
                </div>
              </div>

              {/* Type label and title section */}
              <div>
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {getTypeLabel()}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-2">
                  {content.title}
                </h1>
                <div className="h-0.5 w-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
              </div>

              {/* Summary section */}
              {content.summary && (
                <p className="text-xl md:text-2xl leading-relaxed text-gray-700 font-medium">
                  {content.summary}
                </p>
              )}

              {/* Description section */}
              {content.description && (
                <div className="text-base md:text-lg leading-relaxed text-gray-600 space-y-4">
                  {content.description.split("\n\n").map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              )}

              {/* Example/Application section */}
              {content.application && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-lg p-6 relative overflow-hidden">
                  <Lightbulb className="absolute top-5 right-5 h-6 w-6 text-blue-300/30" />
                  <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">
                    Example in Practice
                  </h3>
                  <p className="text-base text-blue-600 italic leading-relaxed relative z-10">
                    {content.application}
                  </p>
                </div>
              )}

              {/* Key takeaway section */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <KeyRound className="h-5 w-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Key Takeaway</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  This {getTypeLabel().toLowerCase()} helps you{" "}
                  {content.category?.toLowerCase() || "improve"} by providing a structured approach
                  to understanding and addressing your challenges.
                </p>
              </div>

              {/* Navigation footer - Read-only, no CTA */}
              <div className="flex justify-center pt-8 border-t border-gray-100">
                <Button
                  onClick={() => router.push("/toolkit")}
                  variant="outline"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-medium rounded-xl transition-all duration-200"
                >
                  <Home className="h-4 w-4" />
                  Back to My Toolkit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Read-only indicator */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-700 px-6 py-3 rounded-full shadow-lg shadow-gray-300/50 text-sm text-white font-medium z-10">
        Viewing Completed Knowledge
      </div>
    </div>
  );
}
