"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StandardCTAButton } from "@/components/ui/StandardCTAButton";

interface ApplicationGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  conceptType: "mental-model" | "cognitive-bias" | "fallacy";
  conceptName?: string;
}

export function ApplicationGuidanceModal({
  isOpen,
  onClose,
  conceptType,
  conceptName,
}: ApplicationGuidanceModalProps) {
  const getConceptTypeDisplay = () => {
    switch (conceptType) {
      case "mental-model":
        return "mental model";
      case "cognitive-bias":
        return "cognitive bias";
      case "fallacy":
        return "logical fallacy";
      default:
        return "concept";
    }
  };

  const conceptTypeDisplay = getConceptTypeDisplay();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[500px] p-6 md:p-8 rounded-2xl"
        showCloseButton={false}
        aria-describedby="application-guidance-description"
      >
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-xl md:text-2xl font-semibold text-gray-900 text-center">
            Time to Apply What You&apos;ve Learned! 🎯
          </DialogTitle>
          <DialogDescription
            id="application-guidance-description"
            className="text-base md:text-lg text-gray-600 text-center leading-relaxed"
          >
            Great plan! Now it&apos;s time to put it into action.
            {conceptName && (
              <span className="block mt-2">
                Go offline and work on applying{" "}
                <span className="font-medium text-gray-700">&quot;{conceptName}&quot;</span> in real
                life.
              </span>
            )}
            {!conceptName && (
              <span className="block mt-2">
                Go offline and work on applying this {conceptTypeDisplay} in real life.
              </span>
            )}
            <span className="block mt-2">
              Come back when you have some experience to reflect on.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <StandardCTAButton onClick={onClose} variant="primary" size="md" fullWidth>
            Got it!
          </StandardCTAButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
