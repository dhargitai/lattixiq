import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/supabase";
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

  return <NewRoadmapForm />;
}
