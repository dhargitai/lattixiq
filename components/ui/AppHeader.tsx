"use client";

import React from "react";
import { HelpCircle, ArrowLeft } from "lucide-react";
import { Button } from "./button";
import { HelpModal } from "@/components/modals/HelpModal";
import { useState } from "react";

interface BackLink {
  text: string;
  href?: string;
  onClick?: () => void;
}

interface AppHeaderProps {
  screenName: string;
  helpContentId?: string;
  showHelp?: boolean;
  backLink?: BackLink;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  screenName,
  helpContentId,
  showHelp = true,
  backLink,
}) => {
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleBackClick = () => {
    if (backLink?.onClick) {
      backLink.onClick();
    } else if (backLink?.href) {
      // This will be handled by the component using AppHeader
      // They should use router.push or Link component
    }
  };

  return (
    <>
      <header className="h-16 md:h-14 border-b bg-background px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {backLink && (
            <Button
              variant="ghost"
              onClick={handleBackClick}
              data-testid="back-button"
              className="text-blue-500 hover:text-blue-600 hover:bg-gray-50 font-medium px-2 py-1.5 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLink.text}
            </Button>
          )}
          {!backLink && <h1 className="text-lg font-semibold truncate pr-2">{screenName}</h1>}
        </div>
        {showHelp && helpContentId && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
            onClick={() => setShowHelpModal(true)}
            aria-label="Show help"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        )}
      </header>

      {showHelpModal && helpContentId && (
        <HelpModal contentId={helpContentId} onClose={() => setShowHelpModal(false)} />
      )}
    </>
  );
};
