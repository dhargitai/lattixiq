import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { RoadmapGenerator } from "@/lib/ai/roadmap-generator";
import { RoadmapSupabaseService } from "@/lib/ai/roadmap-supabase-service";
import { RoadmapValidator } from "@/lib/ai/roadmap-validation";
import { RoadmapErrorHandler } from "@/lib/ai/roadmap-error-handler";
import type { UserGoalInput } from "@/lib/types/ai";
// import type { RoadmapWithSteps } from "@/lib/supabase/types";

export async function POST(request: NextRequest) {
  try {
    // Parse request body first
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    const { goalDescription } = body;

    // Integration test mode - skip E2E mock response
    if (process.env.INTEGRATION_TEST === "true" || process.env.NODE_ENV === "test") {
      // Skip E2E mode and proceed with normal flow
    } else if (process.env.NEXT_PUBLIC_E2E_TEST === "true") {
      // E2E test mode - return mock response
      console.log("E2E test mode - returning mock roadmap response");

      // Validate goal description even in test mode
      if (!goalDescription || goalDescription.length < 10) {
        return NextResponse.json(
          { error: "Goal description must be at least 10 characters long" },
          { status: 400 }
        );
      }

      // Return mock successful response
      return NextResponse.json({
        roadmapId: "test-roadmap-id",
        goalDescription,
        steps: [
          {
            knowledgeContentId: "test-content-1",
            order: 1,
            title: "First Principles Thinking",
            type: "model",
            category: "problem_solving",
            summary: "Break complex problems into fundamental truths",
            description:
              "A problem-solving approach that involves breaking down complex problems into their most basic, foundational elements.",
            application:
              "Use when facing complex problems or when conventional solutions aren't working.",
          },
          {
            knowledgeContentId: "test-content-2",
            order: 2,
            title: "Parkinson's Law",
            type: "model",
            category: "productivity",
            summary: "Work expands to fill the time available",
            description:
              "The observation that work expands to fill the time available for its completion.",
            application:
              "Set artificial deadlines to increase productivity and prevent procrastination.",
          },
        ],
      });
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate goal description
    const validation = RoadmapValidator.validateGoalDescription(goalDescription);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const processedGoal = validation.processedGoal || goalDescription;

    // Check if user already has an active roadmap
    const { data: activeRoadmap } = await supabase
      .from("roadmaps")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (activeRoadmap) {
      return NextResponse.json(
        { error: "You already have an active roadmap. Please complete or archive it first." },
        { status: 400 }
      );
    }

    // Initialize services
    const supabaseService = new RoadmapSupabaseService();

    // Get user history
    const learningHistory = await supabaseService.getUserLearningHistory(user.id);

    // For edge case validation, we'll use a reasonable estimate
    const estimatedKnowledgeCount = 125; // We have ~125 concepts in the database

    // Check edge cases before generation
    const edgeCase = RoadmapValidator.handleEdgeCases(
      processedGoal,
      estimatedKnowledgeCount,
      learningHistory.learnedConcepts.length
    );

    if (!edgeCase.shouldProceed) {
      return NextResponse.json(
        {
          error: edgeCase.message,
          fallbackStrategy: edgeCase.fallbackStrategy,
        },
        { status: 400 }
      );
    }

    // Generate roadmap
    const generator = new RoadmapGenerator();
    const goalInput: UserGoalInput = {
      goalDescription: processedGoal,
      userId: user.id,
      timestamp: new Date().toISOString(),
    };

    const generatedRoadmap = await generator.generateRoadmap(goalInput, learningHistory);

    // Validate generated roadmap
    const roadmapValidation = RoadmapValidator.validateRoadmap(generatedRoadmap);
    if (!roadmapValidation.isValid) {
      console.error("Generated roadmap validation failed:", roadmapValidation.errors);
      return NextResponse.json(
        { error: "Failed to generate a valid roadmap. Please try rephrasing your goal." },
        { status: 500 }
      );
    }

    // Save roadmap to database
    const roadmapId = await supabaseService.saveRoadmap(
      user.id,
      processedGoal,
      generatedRoadmap.steps.map((step) => ({
        knowledgeContentId: step.knowledgeContentId,
        order: step.order,
      }))
    );

    // Return the generated roadmap with database ID
    return NextResponse.json(
      {
        ...generatedRoadmap,
        roadmapId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error generating roadmap:", error);

    // Get user-friendly error message
    const userMessage = RoadmapErrorHandler.getUserMessage(error as Error);

    // Determine status code based on error type
    let statusCode = 500;
    if (error instanceof Error) {
      if (error.name === "InvalidGoalError") {
        statusCode = 400;
      } else if (error.name === "InsufficientContentError") {
        statusCode = 404;
      } else if (error.name === "EmbeddingServiceError" || error.name === "DatabaseSearchError") {
        statusCode = 503;
      }
    }

    return NextResponse.json({ error: userMessage }, { status: statusCode });
  }
}

// GET endpoint to retrieve existing roadmap
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get active roadmap with steps
    const { data: roadmap, error } = await supabase
      .from("roadmaps")
      .select(
        `
        id,
        goal_description,
        status,
        created_at,
        roadmap_steps (
          id,
          order,
          status,
          plan_situation,
          plan_trigger,
          plan_action,
          knowledge_content (
            id,
            title,
            type,
            category,
            summary,
            description,
            application
          )
        )
      `
      )
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("order", { foreignTable: "roadmap_steps", ascending: true })
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No active roadmap found
        return NextResponse.json({ roadmap: null });
      }
      throw error;
    }

    return NextResponse.json({ roadmap });
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    return NextResponse.json({ error: "Failed to fetch roadmap" }, { status: 500 });
  }
}
