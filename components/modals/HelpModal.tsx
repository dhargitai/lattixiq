import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ReactMarkdown from "react-markdown";

interface HelpModalProps {
  contentId: string;
  onClose: () => void;
}

interface ContentBlock {
  content: string;
}

// Static titles for each screen's help content
const HELP_TITLES: Record<string, string> = {
  "toolkit-screen-help": "My Toolkit Guide",
  "settings-screen-help": "Settings & Preferences",
  "roadmap-screen-help": "Your Learning Roadmap",
  "learn-screen-help": "Learning Mental Models",
  "plan-screen-help": "Planning Your Application",
  "reflect-screen-help": "Reflection & Journaling",
  "new-roadmap-screen-help": "Creating a New Roadmap",
  "unlocked-screen-help": "Unlocked Knowledge",
  "pricing-screen-help": "Pricing & Subscription",
  "application-log-screen-help": "Application Log Guide",
  "general-help": "Getting Started",
};

export const HelpModal: React.FC<HelpModalProps> = ({ contentId, onClose }) => {
  const [content, setContent] = useState<ContentBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from("content_blocks")
          .select("content")
          .eq("content_id", contentId)
          .single();

        if (supabaseError) {
          console.error("Error loading help content:", supabaseError);
          setError("Unable to load help content. Please try again later.");
        } else if (data) {
          setContent(data);
        } else {
          setError("Help content not found for this screen.");
        }
      } catch (err) {
        console.error("Unexpected error loading help:", err);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [contentId, supabase]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!content) {
      return null;
    }

    const title = HELP_TITLES[contentId] || "Help & Guidance";

    return (
      <div className="prose prose-sm max-w-none">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-lg font-semibold mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-base font-semibold mb-1">{children}</h3>,
            p: ({ children }) => <p className="mb-3 text-sm">{children}</p>,
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-3 space-y-1 text-sm">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-3 space-y-1 text-sm">{children}</ol>
            ),
            li: ({ children }) => <li className="text-sm">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          }}
        >
          {content.content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Help & Guidance</DialogTitle>
          <DialogDescription>Learn how to use this screen effectively</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">{renderContent()}</ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
