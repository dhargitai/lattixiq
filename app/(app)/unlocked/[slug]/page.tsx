import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import UnlockedViewer from "./UnlockedViewer";
import type { KnowledgeContent } from "@/lib/supabase/types";
import { isKnowledgeUnlocked } from "@/lib/db/unlocked-knowledge.server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  await params; // Await params but don't use it
  return {
    title: `View Knowledge - LattixIQ`,
    description: "Review your learned mental models and cognitive biases",
  };
}

async function getKnowledgeContent(knowledgeId: string): Promise<KnowledgeContent | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("knowledge_content")
    .select("*")
    .eq("id", knowledgeId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export default async function UnlockedPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Await params as required in Next.js 15
  const resolvedParams = await params;
  // The slug is now the UUID of the knowledge_content
  const knowledgeId = resolvedParams.slug;

  // Validate access using the UUID
  const hasAccess = await isKnowledgeUnlocked(knowledgeId, user.id);

  if (!hasAccess) {
    console.log(`Unauthorized access attempt to /unlocked/${knowledgeId} by user ${user.id}`);
    redirect("/toolkit");
  }

  const content = await getKnowledgeContent(knowledgeId);

  if (!content) {
    notFound();
  }

  return <UnlockedViewer content={content} />;
}
