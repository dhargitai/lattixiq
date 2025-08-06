"use client";

import { useEffect, useRef } from "react";

interface SenjaWidgetProps {
  projectId?: string;
  formId?: string;
  onSuccess?: (testimonialUrl?: string) => void;
}

export function SenjaWidget({
  projectId = "lettixiq", // Replace with actual Senja project ID
  formId = "default", // Replace with actual Senja form ID
  onSuccess,
}: SenjaWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetLoadedRef = useRef(false);

  useEffect(() => {
    if (widgetLoadedRef.current) return;

    // Load Senja.io script
    const script = document.createElement("script");
    script.src = "https://widget.senja.io/widget.js";
    script.async = true;
    script.defer = true;
    script.setAttribute("data-id", projectId);
    script.setAttribute("data-form", formId);

    // Add event listener for successful submission
    script.onload = () => {
      widgetLoadedRef.current = true;

      // Listen for Senja widget events
      window.addEventListener("message", (event) => {
        if (event.origin !== "https://widget.senja.io") return;

        if (event.data?.type === "senja:testimonial:submitted") {
          // Call onSuccess callback when testimonial is submitted
          onSuccess?.(event.data.testimonialUrl);
        }
      });
    };

    // Append script to container
    const container = containerRef.current;
    if (container) {
      container.appendChild(script);
    }

    return () => {
      // Cleanup script on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      widgetLoadedRef.current = false;
    };
  }, [projectId, formId, onSuccess]);

  return (
    <div
      ref={containerRef}
      className="senja-widget-container"
      data-senja-project={projectId}
      data-senja-form={formId}
    >
      {/* Senja widget will be injected here */}
      <div className="flex min-h-[240px] items-center justify-center">
        <p className="italic text-gray-400">Loading testimonial form...</p>
      </div>
    </div>
  );
}
