import type {
  Roadmap,
  RoadmapStep,
  KnowledgeContent,
  User,
  ApplicationLog,
} from "@/lib/supabase/types";

// Test Users
export const testUsers = {
  primary: {
    id: "test-user-001",
    email: "test@example.com",
    created_at: "2025-01-01T00:00:00Z",
    reminder_enabled: true,
    reminder_time: "09:00",
    reminder_timezone: "America/New_York",
    reminder_last_sent: null,
    subscription_status: "free" as const,
    stripe_customer_id: null,
    testimonial_state: "not_asked" as const,
  } as User,

  secondary: {
    id: "test-user-002",
    email: "test2@example.com",
    created_at: "2025-01-02T00:00:00Z",
    reminder_enabled: false,
    reminder_time: null,
    reminder_timezone: "Europe/London",
    reminder_last_sent: null,
    subscription_status: "premium" as const,
    stripe_customer_id: "cus_test123",
    testimonial_state: "not_asked" as const,
  } as User,
};

// Test Knowledge Content
export const testKnowledgeContent = {
  activationEnergy: {
    id: "knowledge-001",
    title: "Activation Energy",
    type: "mental-model" as const,
    category: "Psychology",
    description: "The minimum energy required to initiate a process.",
    summary: "Start with the smallest possible action to overcome inertia.",
    application: "Lower the activation energy for desired behaviors.",
    keywords: ["procrastination", "habit", "momentum", "inertia"],
    embedding: null,
  } as KnowledgeContent,

  inversion: {
    id: "knowledge-002",
    title: "Inversion",
    type: "mental-model" as const,
    category: "Problem Solving",
    description: "Approach problems by considering what you want to avoid.",
    summary: "Work backwards from failure to identify paths to success.",
    application: "Think backwards from failure to find success.",
    keywords: ["problem-solving", "reverse-thinking", "avoiding-failure"],
    embedding: null,
  } as KnowledgeContent,

  doubtAvoidance: {
    id: "knowledge-003",
    title: "Doubt/Avoidance Tendency",
    type: "cognitive-bias" as const,
    category: "Decision Making",
    description: "The tendency to quickly remove doubt by making a decision.",
    summary: "We rush decisions to escape the discomfort of uncertainty.",
    application: "Recognize when you're rushing decisions to avoid uncertainty.",
    keywords: ["bias", "decision-making", "uncertainty", "rushing"],
    embedding: null,
  } as KnowledgeContent,
};

// Test Roadmaps
export const testRoadmaps = {
  active: {
    id: "roadmap-001",
    user_id: testUsers.primary.id,
    status: "active" as const,
    goal_description: "I want to stop procrastinating on important projects",
    created_at: "2025-01-05T00:00:00Z",
    completed_at: null,
    updated_at: "2025-01-05T00:00:00Z",
  } as Roadmap,

  completed: {
    id: "roadmap-002",
    user_id: testUsers.primary.id,
    status: "completed" as const,
    goal_description: "I want to make better financial decisions",
    created_at: "2025-01-01T00:00:00Z",
    completed_at: "2025-01-04T00:00:00Z",
    updated_at: "2025-01-04T00:00:00Z",
  } as Roadmap,
};

// Test Roadmap Steps
export const testRoadmapSteps = {
  activationEnergyStep: {
    id: "step-001",
    roadmap_id: testRoadmaps.active.id,
    knowledge_content_id: testKnowledgeContent.activationEnergy.id,
    order: 0,
    status: "completed" as const,
    plan_created_at: "2025-01-05T10:00:00Z",
    plan_situation: "It's 9 AM and I need to start my report",
    plan_trigger: null,
    plan_action: "Open the doc and write for just 5 minutes",
    completed_at: "2025-01-05T11:00:00Z",
    updated_at: "2025-01-05T11:00:00Z",
  } as RoadmapStep,

  inversionStep: {
    id: "step-002",
    roadmap_id: testRoadmaps.active.id,
    knowledge_content_id: testKnowledgeContent.inversion.id,
    order: 1,
    status: "unlocked" as const,
    plan_created_at: null,
    plan_situation: null,
    plan_trigger: null,
    plan_action: null,
    completed_at: null,
    updated_at: null,
  } as RoadmapStep,

  doubtAvoidanceStep: {
    id: "step-003",
    roadmap_id: testRoadmaps.active.id,
    knowledge_content_id: testKnowledgeContent.doubtAvoidance.id,
    order: 2,
    status: "locked" as const,
    plan_created_at: null,
    plan_situation: null,
    plan_trigger: null,
    plan_action: null,
    completed_at: null,
    updated_at: null,
  } as RoadmapStep,
};

// Test Application Logs
export const testApplicationLogs = {
  activationEnergyLog: {
    id: "log-001",
    user_id: testUsers.primary.id,
    roadmap_step_id: testRoadmapSteps.activationEnergyStep.id,
    situation_text: "Started working on my quarterly report",
    learning_text: "Once I started, I actually wrote for 30 minutes!",
    effectiveness_rating: 5,
    created_at: "2025-01-05T14:00:00Z",
    ai_sentiment: "positive" as const,
    ai_topics: ["productivity", "procrastination"],
  } as ApplicationLog,
};

// Helper function to create a complete roadmap with steps
export function createTestRoadmap(options?: {
  userId?: string;
  goalDescription?: string;
  stepCount?: number;
  completedSteps?: number;
}) {
  const {
    userId = testUsers.primary.id,
    goalDescription = "Test goal",
    stepCount = 3,
    completedSteps = 0,
  } = options || {};

  const roadmap: Roadmap = {
    id: `roadmap-${Date.now()}`,
    user_id: userId,
    status: "active" as const,
    goal_description: goalDescription,
    created_at: new Date().toISOString(),
    completed_at: null,
    updated_at: new Date().toISOString(),
  };

  const steps: RoadmapStep[] = [];
  const knowledgeContentArray = Object.values(testKnowledgeContent);

  for (let i = 0; i < stepCount; i++) {
    const knowledgeContent = knowledgeContentArray[i % knowledgeContentArray.length];
    let status: "completed" | "unlocked" | "locked";

    if (i < completedSteps) {
      status = "completed";
    } else if (i === completedSteps) {
      status = "unlocked";
    } else {
      status = "locked";
    }

    steps.push({
      id: `step-${roadmap.id}-${i}`,
      roadmap_id: roadmap.id,
      knowledge_content_id: knowledgeContent.id,
      order: i,
      status,
      plan_created_at: status === "completed" ? new Date().toISOString() : null,
      plan_situation: status === "completed" ? "Test situation" : null,
      plan_trigger: null,
      plan_action: status === "completed" ? "Test action" : null,
      completed_at: status === "completed" ? new Date().toISOString() : null,
      updated_at: status === "completed" ? new Date().toISOString() : null,
    });
  }

  return { roadmap, steps };
}

// Create test data with relationships
export function createTestDataWithRelationships() {
  const user = testUsers.primary;
  const { roadmap, steps } = createTestRoadmap({
    userId: user.id,
    goalDescription: "I want to think more clearly about complex problems",
    stepCount: 5,
    completedSteps: 2,
  });

  const stepsWithContent = steps.map((step, index) => {
    const knowledgeContentArray = Object.values(testKnowledgeContent);
    return {
      ...step,
      knowledge_content: knowledgeContentArray[index % knowledgeContentArray.length],
    };
  });

  const roadmapWithSteps = {
    ...roadmap,
    steps: stepsWithContent,
  };

  const applicationLogs = steps
    .filter((step) => step.status === "completed")
    .map(
      (step, index) =>
        ({
          id: `log-${step.id}`,
          user_id: user.id,
          roadmap_step_id: step.id,
          situation_text: `Applied ${step.id} in situation ${index + 1}`,
          learning_text: `Learned that ${step.id} is effective`,
          effectiveness_rating: 4,
          created_at: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
          ai_sentiment: "positive" as const,
          ai_topics: ["learning", "growth"],
        }) as ApplicationLog
    );

  return {
    user,
    roadmap: roadmapWithSteps,
    steps: stepsWithContent,
    applicationLogs,
  };
}
