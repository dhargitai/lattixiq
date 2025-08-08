"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import Script from "next/script";

interface TestimonialCardProps {
  trigger: "first-completion" | "sustained-success";
  onDismiss: () => void;
}

export function TestimonialCard({ trigger, onDismiss }: TestimonialCardProps) {
  const [iframeHeight, setIframeHeight] = useState(700);

  const title =
    trigger === "first-completion"
      ? "Congratulations on finishing your first roadmap!"
      : "Wow, you've completed several roadmaps with great results!";

  const subtitle =
    trigger === "first-completion"
      ? "That's a huge achievement. If you have a moment, we'd love to hear about your experience and grant you a bonus roadmap."
      : "We're so glad you're finding this valuable. If you're willing, we'd love for you to share your story and unlock a bonus roadmap.";

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "resize" && event.data?.iframe === "senja-collector-iframe") {
        setIframeHeight(event.data.height);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <>
      <Script
        src="https://widget.senja.io/js/iframeResizer.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== "undefined") {
            const windowWithIframe = window as Window & {
              iFrameResize?: (options: object, selector: string) => void;
            };
            if (windowWithIframe.iFrameResize) {
              windowWithIframe.iFrameResize(
                { log: false, checkOrigin: false },
                "#senja-collector-iframe"
              );
            }
          }
        }}
      />

      <Card
        className="relative mb-8 p-6 border-[#BEE3F8] animate-slideIn"
        style={{
          background: "linear-gradient(135deg, #EBF4FF 0%, #E6F7FF 100%)",
          borderRadius: "16px",
          minHeight: `${iframeHeight + 100}px`,
        }}
      >
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
          aria-label="Dismiss testimonial prompt"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{subtitle}</p>
          <p className="text-sm text-gray-500 mt-2">
            <strong>Important:</strong> Please use the same email address you use to log in ({" "}
            <span className="font-mono text-xs">your login email</span>) so we can grant you the
            bonus roadmap. This is a one-time offer and may take up to 24 hours to process.
          </p>
        </div>

        <div className="w-full">
          <iframe
            id="senja-collector-iframe"
            src="https://senja.io/p/lattixiq/r/eOsaq7?mode=embed&nostyle=true"
            allow="camera;microphone"
            title="Senja testimonial form"
            width="100%"
            height={iframeHeight}
            className="rounded-lg border-0 overflow-hidden"
          />
        </div>
      </Card>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }
      `}</style>
    </>
  );
}
