import { useState, useMemo } from "react";

export interface DynamicFocusStateOptions {
  threshold?: number;
}

export interface DynamicFocusStateReturn {
  characterCount: number;
  focusColorClasses: string;
  displayText: string;
  isAboveThreshold: boolean;
  updateCharacterCount: (text: string) => void;
}

/**
 * Custom hook for managing dynamic focus states based on character count
 * Provides blue focus until threshold is reached, then green focus
 * Matches the pattern used in ReflectScreen
 */
export function useDynamicFocusState(
  options: DynamicFocusStateOptions = {}
): DynamicFocusStateReturn {
  const { threshold = 50 } = options;
  const [characterCount, setCharacterCount] = useState(0);

  const updateCharacterCount = (text: string) => {
    setCharacterCount(text.length);
  };

  const isAboveThreshold = characterCount >= threshold;

  const focusColorClasses = useMemo(() => {
    if (isAboveThreshold) {
      return "focus:border-green-500 focus:ring-green-200";
    }
    return "focus:border-blue-500 focus:ring-blue-200";
  }, [isAboveThreshold]);

  const displayText = useMemo(() => {
    if (isAboveThreshold) {
      return `${characterCount} characters`;
    }
    return `${characterCount} / ${threshold} minimum`;
  }, [characterCount, threshold, isAboveThreshold]);

  return {
    characterCount,
    focusColorClasses,
    displayText,
    isAboveThreshold,
    updateCharacterCount,
  };
}
