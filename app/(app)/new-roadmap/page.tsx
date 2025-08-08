import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/supabase";
import { checkCanCreateRoadmap } from "@/lib/subscription/check-limits";
import NewRoadmapForm from "@/components/features/new-roadmap/NewRoadmapForm";

export const metadata: Metadata = {
  title: "Create New Roadmap | LattixIQ",
  description: "Create a personalized learning roadmap tailored to your goals",
};

export default async function NewRoadmapPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user can create a new roadmap
  const canCreate = await checkCanCreateRoadmap(user.id);

  if (!canCreate) {
    // Redirect to toolkit with blocked parameter if not allowed
    redirect("/toolkit?blocked=true");
  }

  return <NewRoadmapForm />;
}
