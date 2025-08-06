import { createClient } from "@/lib/supabase/server";
import type { User } from "@/lib/supabase/types";

export async function getUserInfo(userId: string): Promise<User | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();

  if (error) {
    console.error("Error fetching user info:", error);
    return null;
  }

  return data;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<User>
): Promise<User | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user profile:", error);
    return null;
  }

  return data;
}
