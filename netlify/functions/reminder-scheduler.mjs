/**
 * Netlify Scheduled Function to trigger email reminders
 * Runs every 5 minutes to check for users who need reminders
 */

export default async (req) => {
  console.log("🕐 Reminder scheduler triggered");

  // Get the app URL and cron secret from environment variables
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.URL || "http://localhost:3000";
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("❌ CRON_SECRET environment variable is not configured");
    return new Response(
      JSON.stringify({ error: "CRON_SECRET not configured" }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    // Parse the next_run time from the request if available
    const body = await req.json().catch(() => ({}));
    const { next_run } = body;
    
    if (next_run) {
      console.log("Next scheduled run:", next_run);
    }

    // Call the Next.js cron endpoint with proper authentication
    const cronUrl = `${appUrl}/api/notifications/cron`;
    console.log(`📧 Calling cron endpoint: ${cronUrl}`);

    const response = await fetch(cronUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${cronSecret}`,
        "Content-Type": "application/json",
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error(`❌ Cron endpoint returned error: ${response.status}`, responseData);
      return new Response(
        JSON.stringify({ 
          error: "Cron endpoint error", 
          status: response.status,
          details: responseData 
        }),
        { 
          status: response.status,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Log the results
    if (responseData.summary) {
      console.log("✅ Reminder processing completed:", {
        total: responseData.summary.total,
        sent: responseData.summary.sent,
        no_active_plan: responseData.summary.no_active_plan,
        errors: responseData.summary.errors,
      });
    } else {
      console.log("✅ Reminder check completed:", responseData.message);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Reminder scheduler executed successfully",
        results: responseData 
      }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("❌ Error in reminder scheduler:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal scheduler error", 
        message: error.message 
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

// Configure the function to run on a schedule
// @every 30m means every 30 minutes
// You can also use cron syntax like "*/30 * * * *" for every 30 minutes
export const config = {
  schedule: "@every 30m"
};