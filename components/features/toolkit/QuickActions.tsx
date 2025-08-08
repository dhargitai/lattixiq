"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Crown } from "lucide-react";
import { PremiumBenefitsDialog } from "@/components/features/subscription/PremiumBenefitsDialog";
import { getUserSubscriptionStatus } from "@/lib/subscription/check-limits";
import { toast } from "sonner";

interface QuickActionsProps {
  hasActiveRoadmap: boolean;
  hasActivePlan: boolean;
  currentStepId: string | null;
  userId?: string;
  hasCompletedRoadmap?: boolean;
}

export function QuickActions({
  hasActiveRoadmap,
  hasActivePlan,
  currentStepId,
  userId,
  hasCompletedRoadmap = false,
}: QuickActionsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [canCreateRoadmap, setCanCreateRoadmap] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Check for success/failure messages from checkout and blocked access
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const blocked = searchParams.get("blocked");

    if (success === "true") {
      toast.success("Welcome to Premium! You can now create unlimited roadmaps.");
    } else if (canceled === "true") {
      toast.info("Checkout canceled. You can upgrade anytime.");
    } else if (blocked === "true") {
      toast.info("Upgrade to Premium to create more roadmaps!");
      setShowPremiumDialog(true);
    }
  }, [searchParams]);

  // Check subscription status if user has completed a roadmap
  useEffect(() => {
    const checkStatus = async () => {
      if (userId && hasCompletedRoadmap && !hasActiveRoadmap) {
        setIsLoading(true);
        try {
          const status = await getUserSubscriptionStatus(userId);
          setCanCreateRoadmap(status.canCreateRoadmap);
        } catch (error) {
          console.error("Failed to check subscription status:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    checkStatus();
  }, [userId, hasCompletedRoadmap, hasActiveRoadmap]);

  if (!hasActiveRoadmap && !hasCompletedRoadmap) {
    // First roadmap - always allowed
    return (
      <div className="flex justify-center">
        <Button
          size="lg"
          className="w-full max-w-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
          onClick={() => router.push("/new-roadmap")}
        >
          <Plus className="mr-2 h-5 w-5" />
          Start Your First Roadmap
        </Button>
      </div>
    );
  }

  if (!hasActiveRoadmap && hasCompletedRoadmap && !canCreateRoadmap) {
    // User has completed free roadmap and needs premium
    return (
      <>
        <div className="flex justify-center">
          <Button
            size="lg"
            className="w-full max-w-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
            onClick={() => setShowPremiumDialog(true)}
            disabled={isLoading}
          >
            <Crown className="mr-2 h-5 w-5" />
            See what you&apos;ll get with Premium
          </Button>
        </div>
        <PremiumBenefitsDialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog} />
      </>
    );
  }

  return (
    <div className="space-y-3">
      {hasActivePlan && currentStepId && (
        <Button
          variant="outline"
          className="w-full justify-start border-green-200 hover:bg-green-50 hover:border-green-300"
          onClick={() => router.push(`/reflect/${currentStepId}`)}
        >
          <Calendar className="mr-3 h-5 w-5 text-green-600" />
          <span className="text-gray-700">Today&apos;s Reflection</span>
        </Button>
      )}

      {!hasActiveRoadmap && (
        <Button
          variant="outline"
          className="w-full justify-start hover:bg-gray-50"
          onClick={() => router.push("/new-roadmap")}
        >
          <Plus className="mr-3 h-5 w-5 text-blue-600" />
          <span className="text-gray-700">Start New Roadmap</span>
        </Button>
      )}

      {/* Explore Random Model - commented out for now
      <Button
        variant="outline"
        className="w-full justify-start hover:bg-gray-50"
        onClick={() => router.push("/explore")}
      >
        <Shuffle className="mr-3 h-5 w-5 text-purple-600" />
        <span className="text-gray-700">Explore Random Model</span>
      </Button>
      */}
    </div>
  );
}
