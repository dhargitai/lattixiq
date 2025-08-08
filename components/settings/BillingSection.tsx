"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Calendar } from "lucide-react";
import { useState } from "react";

interface BillingSectionProps {
  subscriptionStatus?: string;
  stripeCustomerId?: string;
  subscriptionPeriodEnd?: string | null;
  isLoading?: boolean;
}

export default function BillingSection({
  subscriptionStatus,
  stripeCustomerId,
  subscriptionPeriodEnd,
  isLoading = false,
}: BillingSectionProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const isPremium = subscriptionStatus === "active" || subscriptionStatus === "trialing";

  const handleBillingClick = async () => {
    // Only premium users can click to access billing portal
    if (!isPremium || !stripeCustomerId || isNavigating) return;

    setIsNavigating(true);

    try {
      const response = await fetch("/api/billing-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error("Failed to create billing portal session");
      }
    } catch (error) {
      console.error("Error accessing billing portal:", error);
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

  // Format subscription period end date
  const formatPeriodEnd = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const periodEndFormatted = formatPeriodEnd(subscriptionPeriodEnd);

  return (
    <section className="mb-9 animate-fadeIn animation-delay-100">
      <h2 className="text-[13px] font-semibold text-[#718096] uppercase tracking-[0.8px] mb-4 pl-1">
        BILLING
      </h2>

      <Card
        className={`bg-white border border-[#E2E8F0] rounded-xl overflow-hidden transition-all duration-200 ${
          isPremium && stripeCustomerId
            ? "hover:border-[#CBD5E0] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer"
            : ""
        }`}
        onClick={handleBillingClick}
      >
        <div className="px-5 hover:bg-[#F7FAFC] transition-colors duration-200">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <span className="text-base font-medium text-[#2D3748]">Subscription</span>
              {isPremium && periodEndFormatted && (
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3 text-[#718096]" />
                  <span className="text-xs text-[#718096]">
                    {subscriptionStatus === "trialing" ? "Trial ends" : "Renews"}{" "}
                    {periodEndFormatted}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-2xl text-sm font-semibold ${
                  isPremium
                    ? "bg-gradient-to-r from-[#F6E05E] to-[#ECC94B] text-[#744210]"
                    : subscriptionStatus === "past_due"
                      ? "bg-red-100 text-red-700"
                      : "bg-[#F7FAFC] text-[#4A5568]"
                }`}
              >
                {isPremium ? "Premium" : subscriptionStatus === "past_due" ? "Past Due" : "Free"}
              </span>
              <ChevronRight
                className={`w-4 h-4 text-[#CBD5E0] transition-transform duration-200 ${isNavigating ? "animate-pulse" : ""}`}
              />
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
