"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export function EmptyState() {
  const router = useRouter();

  return (
    <Card className="p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
          <Sparkles className="h-10 w-10 text-blue-600" />
        </div>

        <h3 className="text-2xl font-semibold text-gray-900 mb-3">Welcome to Your Toolkit!</h3>

        <p className="text-gray-600 max-w-md mx-auto mb-2">
          Your personal space for growth and learning. Start your journey by creating your first
          personalized roadmap of mental models tailored to your goals.
        </p>

        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Tell us what you want to improve, and we&apos;ll build a custom learning path just for
          you.
        </p>
      </div>

      <Button
        size="lg"
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
        onClick={() => router.push("/onboarding")}
      >
        Start Your First Roadmap
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>

      <div className="mt-8 pt-6 border-t border-blue-200">
        <p className="text-sm text-gray-600 mb-3">What you&apos;ll discover:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge>Mental Models</Badge>
          <Badge>Cognitive Biases</Badge>
          <Badge>Decision Frameworks</Badge>
          <Badge>Problem-Solving Tools</Badge>
        </div>
      </div>
    </Card>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-blue-700 border border-blue-200">
      {children}
    </span>
  );
}
