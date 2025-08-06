import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      return NextResponse.json({ error: "Failed to sign out" }, { status: 500 });
    }

    // Create response with success message
    const response = NextResponse.json({ message: "Successfully logged out" }, { status: 200 });

    // Clear any server-side cookies
    response.cookies.set({
      name: "sb-access-token",
      value: "",
      maxAge: 0,
      path: "/",
    });
    response.cookies.set({
      name: "sb-refresh-token",
      value: "",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Unexpected error during logout:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
