"use client";

import { useState } from "react";
import { NavigationCards } from "./NavigationCards";
import { UnlockedKnowledgeModal } from "./UnlockedKnowledgeModal";

interface ToolkitClientProps {
  learnedModelsCount: number;
  completedRoadmapsCount: number;
  recentLogEntry: {
    text: string;
    date: string;
  } | null;
}

export function ToolkitClient({
  learnedModelsCount,
  completedRoadmapsCount,
  recentLogEntry,
}: ToolkitClientProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <NavigationCards
        learnedModelsCount={learnedModelsCount}
        completedRoadmapsCount={completedRoadmapsCount}
        recentLogEntry={recentLogEntry}
        onLearnedModelsClick={() => setModalOpen(true)}
      />
      <UnlockedKnowledgeModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
