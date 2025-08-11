"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useRoadmapStore } from "@/lib/stores/roadmap-store";
import { useNewRoadmapStore } from "@/lib/stores/new-roadmap-store";

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      // Reset all Zustand stores to initial state and clear cache
      useRoadmapStore.getState().resetState();
      useRoadmapStore.getState().invalidateCache();
      useNewRoadmapStore.getState().resetStore();

      // Clear any cached data from memory
      if (typeof window !== "undefined" && "caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      }

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout", {
        description: "Please try again.",
      });
      setIsLoggingOut(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          className="bg-white text-[#E53E3E] border-2 border-[#E53E3E] px-8 py-3.5 text-base font-semibold rounded-[10px] transition-all duration-300 hover:bg-[#E53E3E] hover:text-white hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(229,62,62,0.25)] active:translate-y-0 active:shadow-[0_2px_6px_rgba(229,62,62,0.25)]"
        >
          Logout
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be signed out of your account and redirected to the login page. Any unsaved
            changes will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            disabled={isLoggingOut}
            className="bg-[#E53E3E] hover:bg-[#C53030] text-white"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
