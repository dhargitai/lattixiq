"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

interface BillingSectionProps {
  subscriptionStatus?: string;
  stripeCustomerId?: string;
  isLoading?: boolean;
}

export default function BillingSection({
  subscriptionStatus,
  stripeCustomerId,
  isLoading = false,
}: BillingSectionProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const isPremium = subscriptionStatus === "premium";

  const handleBillingClick = async () => {
    if (isNavigating) return;

    setIsNavigating(true);

    try {
      if (isPremium && stripeCustomerId) {
        // TODO: Create Stripe customer portal session
        // For now, just log the action
        console.log("Redirect to Stripe customer portal");
        // In production, this would be:
        // const response = await fetch('/api/stripe/portal', { method: 'POST' });
        // const { url } = await response.json();
        // window.location.href = url;
      } else {
        router.push("/pricing");
      }
    } finally {
      setIsNavigating(false);
    }
  };

  if (isLoading) {
    return (
      <section className="mb-9 animate-fadeIn animation-delay-100">
        <h2 className="text-[13px] font-semibold text-[#718096] uppercase tracking-[0.8px] mb-4 pl-1">
          BILLING
        </h2>
        <Card className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="px-5 py-[18px] flex justify-between items-center">
            <Skeleton className="h-5 w-24" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-16 rounded-2xl" />
              <Skeleton className="h-4 w-4" />
            </div>
          </div>
        </Card>
      </section>
    );
  }

  // Default to Free if subscription status is unavailable
  const displayStatus = subscriptionStatus || "free";
  const displayPremium = displayStatus === "premium";

  return (
    <section className="mb-9 animate-fadeIn animation-delay-100">
      <h2 className="text-[13px] font-semibold text-[#718096] uppercase tracking-[0.8px] mb-4 pl-1">
        BILLING
      </h2>

      <Card
        className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden hover:border-[#CBD5E0] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 cursor-pointer"
        onClick={handleBillingClick}
      >
        <div className="px-5 flex justify-between items-center hover:bg-[#F7FAFC] transition-colors duration-200">
          <span className="text-base font-medium text-[#2D3748]">Subscription</span>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-2xl text-sm font-semibold ${
                displayPremium
                  ? "bg-gradient-to-r from-[#F6E05E] to-[#ECC94B] text-[#744210]"
                  : "bg-[#F7FAFC] text-[#4A5568]"
              }`}
            >
              {displayPremium ? "Premium" : "Free"}
            </span>
            <ChevronRight
              className={`w-4 h-4 text-[#CBD5E0] transition-transform duration-200 ${isNavigating ? "animate-pulse" : ""}`}
            />
          </div>
        </div>
      </Card>
    </section>
  );
}
