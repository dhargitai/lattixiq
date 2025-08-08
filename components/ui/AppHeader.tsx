import React from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "./button";
import { HelpModal } from "@/components/modals/HelpModal";
import { useState } from "react";

interface AppHeaderProps {
  screenName: string;
  helpContentId?: string;
  showHelp?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  screenName,
  helpContentId,
  showHelp = true,
}) => {
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <>
      <header className="h-16 md:h-14 border-b bg-background px-4 md:px-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold truncate pr-2">{screenName}</h1>
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
