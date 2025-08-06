"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen } from "lucide-react";
import { getUnlockedKnowledge } from "@/lib/db/unlocked-knowledge";
import type { UnlockedKnowledge } from "@/lib/db/unlocked-knowledge";

interface UnlockedKnowledgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UnlockedKnowledgeModal({ open, onOpenChange }: UnlockedKnowledgeModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [knowledge, setKnowledge] = useState<UnlockedKnowledge[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchUnlockedKnowledge();
    }
  }, [open]);

  const fetchUnlockedKnowledge = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUnlockedKnowledge();
      setKnowledge(data);
    } catch (err) {
      setError("Failed to load your learned models");
      console.error("Error fetching unlocked knowledge:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (slug: string) => {
    onOpenChange(false);
    router.push(`/unlocked/${slug}`);
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "mental-model":
        return "default";
      case "cognitive-bias":
        return "secondary";
      case "fallacy":
        return "outline";
      default:
        return "default";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "mental-model":
        return "Mental Model";
      case "cognitive-bias":
        return "Cognitive Bias";
      case "fallacy":
        return "Logical Fallacy";
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Learned Models</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>{error}</p>
            </div>
          ) : knowledge.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No models learned yet</p>
              <p className="text-sm text-muted-foreground">
                Complete your first roadmap step to unlock mental models
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[50vh]">
              <div className="space-y-2">
                {knowledge.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className="w-full p-4 text-left rounded-lg border hover:bg-accent hover:border-accent-foreground/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-base mb-1">{item.name}</h3>
                        {item.category && (
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        )}
                      </div>
                      <Badge variant={getTypeBadgeVariant(item.type)}>
                        {getTypeLabel(item.type)}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
