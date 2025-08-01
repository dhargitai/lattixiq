#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncAuthUsers() {
  try {
    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("Error fetching auth users:", authError);
      return;
    }

    console.log(`Found ${authUsers.users.length} auth users`);

    // Get all public users
    const { data: publicUsers, error: publicError } = await supabase.from("users").select("id");

    if (publicError) {
      console.error("Error fetching public users:", publicError);
      return;
    }

    const publicUserIds = new Set(publicUsers.map((u) => u.id));

    // Find auth users without public user records
    const missingUsers = authUsers.users.filter((authUser) => !publicUserIds.has(authUser.id));

    if (missingUsers.length === 0) {
      console.log("All auth users have corresponding public user records");
      return;
    }

    console.log(`Found ${missingUsers.length} auth users without public user records`);

    // Insert missing user records
    const usersToInsert = missingUsers.map((user) => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    }));

    const { error: insertError } = await supabase.from("users").insert(usersToInsert);

    if (insertError) {
      console.error("Error inserting users:", insertError);
    } else {
      console.log(`Successfully synced ${missingUsers.length} users`);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

syncAuthUsers();
