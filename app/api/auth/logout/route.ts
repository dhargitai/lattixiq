import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error);
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 });
  }

  redirect("/login");
}
