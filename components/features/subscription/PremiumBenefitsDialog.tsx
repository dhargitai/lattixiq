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

  const handleCheckout = async () => {
    setIsCheckingOut(true);
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

      if (response.ok) {
        const { url } = await response.json();
        if (url) {
          window.location.href = url;
        }
      } else {
        console.error("Failed to create checkout session");
        // Could show an error toast here
      }
    } catch (error) {
      console.error("Checkout error:", error);
      // Could show an error toast here
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
        style={{
          background: "linear-gradient(135deg, #EBF4FF 0%, #E6F7FF 100%)",
          border: "1px solid #BEE3F8",
          borderRadius: "16px",
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Premium Access</DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Take your personal growth journey to the next level
          </DialogDescription>
        </DialogHeader>

        <div className="prose prose-lg max-w-none p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <ReactMarkdown>{content}</ReactMarkdown>
          )}
        </div>

        <div className="flex justify-center pb-6">
          <Button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isCheckingOut ? "Processing..." : "Get Premium Access"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
