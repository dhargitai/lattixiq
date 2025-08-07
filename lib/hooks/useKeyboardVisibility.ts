"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect virtual keyboard visibility on mobile devices
 * Returns true when keyboard is likely visible
 */
export function useKeyboardVisibility() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      // Check if we're on a mobile device
      const isMobile = window.innerWidth <= 768;
      if (!isMobile) {
        setIsKeyboardVisible(false);
        return;
      }

      // On mobile, if viewport height is significantly less than expected,
      // keyboard is likely visible
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const screenHeight = window.screen.height;
      const threshold = screenHeight * 0.75; // If viewport is less than 75% of screen, keyboard is likely visible

      setIsKeyboardVisible(viewportHeight < threshold);
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true";

      if (isInput && window.innerWidth <= 768) {
        // Small delay to let keyboard animation start
        setTimeout(() => setIsKeyboardVisible(true), 100);
      }
    };

    const handleFocusOut = () => {
      // Small delay to let keyboard animation complete
      setTimeout(() => setIsKeyboardVisible(false), 100);
    };

    // Listen to multiple events for better detection
    window.addEventListener("resize", handleResize);
    window.visualViewport?.addEventListener("resize", handleResize);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("resize", handleResize);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  return isKeyboardVisible;
}
