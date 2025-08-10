"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { stripeConfig } from "@/lib/stripe/env-validation";
import ReactMarkdown from "react-markdown";

interface PremiumBenefitsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PremiumBenefitsDialog({ open, onOpenChange }: PremiumBenefitsDialogProps) {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string>("");

  const getDefaultContent = () => `## Unlock Your Full Potential with Premium

### What You Get:
- Unlimited Roadmaps
- Priority AI Processing
- Advanced Analytics
- Export Your Data
- Early Access to New Features

### Your Investment:
**$29/month** - Start your premium journey today!`;

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/content-blocks/premium-benefits-modal");
      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
      } else {
        // Use default content if API fails
        setContent(getDefaultContent());
      }
    } catch (error) {
      console.error("Failed to fetch premium benefits content:", error);
      setContent(getDefaultContent());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && !content) {
      fetchContent();
    }
  }, [open, content, fetchContent]);

  const syncSubscription = async () => {
    setIsSyncing(true);
    setSyncMessage("Syncing your subscription...");

    try {
      const response = await fetch("/api/subscription/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSyncMessage("✅ Subscription synced successfully! Refreshing...");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setSyncMessage(`❌ ${data.error || "Failed to sync subscription"}`);
        setIsSyncing(false);
      }
    } catch (error) {
      console.error("Sync error:", error);
      setSyncMessage("❌ Failed to sync subscription. Please try again.");
      setIsSyncing(false);
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setSyncMessage("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: stripeConfig.monthlyProductId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.url) {
          window.location.href = data.url;
        }
      } else if (response.status === 409 && data.requiresSync) {
        // Handle sync scenario with better UX
        setIsCheckingOut(false);
        setSyncMessage(
          "🔄 We detected you already have a subscription. Let's sync it with your account..."
        );

        // Auto-sync after a short delay for better UX
        setTimeout(() => {
          syncSubscription();
        }, 1000);
      } else if (
        response.status === 400 &&
        data.error?.includes("already have an active subscription")
      ) {
        // User already has an active subscription in the database
        setIsCheckingOut(false);
        setSyncMessage(
          "✅ You already have an active subscription! Refreshing page to show your premium status..."
        );

        // Close modal and refresh after a short delay
        setTimeout(() => {
          onOpenChange(false);
          window.location.reload();
        }, 2000);
      } else {
        console.error("Failed to create checkout session:", data.error);
        setSyncMessage(`❌ ${data.error || "Failed to create checkout session"}`);
        setIsCheckingOut(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setSyncMessage("❌ An unexpected error occurred. Please try again.");
      setIsCheckingOut(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[80vh] p-0 flex flex-col"
        style={{
          background: "linear-gradient(135deg, #EBF4FF 0%, #E6F7FF 100%)",
          border: "1px solid #BEE3F8",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <div className="flex flex-col min-h-0 flex-1">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-2xl font-bold text-center">Premium Access</DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Take your personal growth journey to the next level
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 min-h-0">
            <div className="prose prose-lg max-w-none pb-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <ReactMarkdown>{content}</ReactMarkdown>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 bg-gradient-to-r from-[#EBF4FF] via-[#E6F7FF] to-[#EBF4FF] border-t border-blue-200 p-6 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
            {/* Show sync status message if present */}
            {syncMessage && (
              <div
                className={`mb-4 p-4 rounded-lg border ${
                  syncMessage.includes("✅")
                    ? "bg-green-50 border-green-200"
                    : syncMessage.includes("❌")
                      ? "bg-red-50 border-red-200"
                      : "bg-blue-50 border-blue-200"
                }`}
              >
                <p
                  className={`text-center ${
                    syncMessage.includes("✅")
                      ? "text-green-800"
                      : syncMessage.includes("❌")
                        ? "text-red-800"
                        : "text-blue-800"
                  }`}
                >
                  {syncMessage}
                </p>
              </div>
            )}

            <div className="flex justify-center gap-3">
              {syncMessage?.includes("✅ You already have") ? (
                <Button
                  onClick={() => onOpenChange(false)}
                  size="lg"
                  variant="outline"
                  className="px-8 py-3"
                >
                  Close
                </Button>
              ) : (
                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || isSyncing}
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSyncing
                    ? "Syncing..."
                    : isCheckingOut
                      ? "Processing..."
                      : "Get Premium Access"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
