import { describe, it, expect, beforeEach, vi } from "vitest";
import type { UserLearningHistory } from "@/lib/types/ai";

// Mock the external dependencies before importing the modules
vi.mock("../embeddings-service", () => ({
  generateEmbedding: vi.fn().mockImplementation((text: string) => {
    // Generate a deterministic embedding based on the text
    const hash = text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const embedding = new Array(1536).fill(0).map((_, i) => ((hash + i) % 256) / 255);
    return Promise.resolve(embedding);
  }),
}));

vi.mock("../roadmap-supabase-service", () => {
  const mockSearchResults = [
    {
      id: "1",
      title: "First Principles Thinking",
      category: "Decision Making",
      type: "mental-model",
      summary: "Breaking down complex problems to fundamental truths",
      description: "First principles thinking involves breaking down complicated problems...",
      application: "To use first principles thinking, start by questioning assumptions...",
      keywords: ["problem-solving", "analysis", "fundamentals"],
      embedding: JSON.stringify(new Array(1536).fill(0.1)),
      goalExamples: [
        {
          goal: "Improve decision making",
          if_then_example:
            "If I face a complex decision, then I will break it down to fundamental truths",
          spotting_mission_example: null,
        },
      ],
      similarity: 0.85,
    },
    {
      id: "2",
      title: "Confirmation Bias",
      category: "Psychology",
      type: "cognitive-bias",
      summary: "The tendency to search for information that confirms our beliefs",
      description: "Confirmation bias is our tendency to cherry-pick information...",
      application: "To counter confirmation bias, actively seek disconfirming evidence...",
      keywords: ["bias", "psychology", "decision-making"],
      embedding: JSON.stringify(new Array(1536).fill(0.2)),
      similarity: 0.75,
    },
    {
      id: "3",
      title: "Systems Thinking",
      category: "Systems Thinking",
      type: "mental-model",
      summary: "Understanding how parts interact within a whole",
      description: "Systems thinking is a holistic approach to analysis...",
      application: "Look for feedback loops and interconnections...",
      keywords: ["systems", "holistic", "interactions"],
      embedding: JSON.stringify(new Array(1536).fill(0.15)),
      similarity: 0.7,
    },
    {
      id: "4",
      title: "Present Bias",
      category: "Psychology",
      type: "cognitive-bias",
      summary: "Overvaluing immediate rewards over future benefits",
      description: "Present bias leads us to prioritize immediate gratification...",
      application: "Use commitment devices and future visualization...",
      keywords: ["bias", "time", "rewards"],
      embedding: JSON.stringify(new Array(1536).fill(0.18)),
      similarity: 0.65,
    },
    {
      id: "5",
      title: "80/20 Principle",
      category: "Productivity",
      type: "mental-model",
      summary: "80% of results come from 20% of efforts",
      description: "The Pareto principle states that roughly 80% of effects...",
      application: "Identify and focus on the vital few activities...",
      keywords: ["productivity", "efficiency", "focus"],
      embedding: JSON.stringify(new Array(1536).fill(0.12)),
      similarity: 0.8,
    },
    {
      id: "6",
      title: "Sunk Cost Fallacy",
      category: "Decision Making",
      type: "cognitive-bias",
      summary: "Continuing something because of past investments",
      description: "The sunk cost fallacy occurs when we continue...",
      application: "Ignore past investments when making future decisions...",
      keywords: ["fallacy", "investment", "decision"],
      embedding: JSON.stringify(new Array(1536).fill(0.14)),
      similarity: 0.6,
    },
    {
      id: "7",
      title: "Inversion",
      category: "Problem Solving",
      type: "mental-model",
      summary: "Solving problems by thinking backwards",
      description: "Inversion involves approaching problems from the opposite end...",
      application: "Ask 'What would make this fail?' instead of 'How to succeed?'",
      keywords: ["problem-solving", "reverse", "thinking"],
      embedding: JSON.stringify(new Array(1536).fill(0.11)),
      similarity: 0.72,
    },
    {
      id: "8",
      title: "Growth Mindset",
      category: "Psychology",
      type: "mental-model",
      summary: "Belief that abilities can be developed through dedication",
      description: "Growth mindset is the belief that talents can be developed...",
      application: "Embrace challenges and view failures as learning opportunities...",
      keywords: ["mindset", "learning", "development"],
      embedding: JSON.stringify(new Array(1536).fill(0.13)),
      similarity: 0.68,
    },
    {
      id: "9",
      title: "Anchoring Bias",
      category: "Psychology",
      type: "cognitive-bias",
      summary: "Over-relying on the first piece of information encountered",
      description: "Anchoring bias occurs when we rely too heavily on initial information...",
      application: "Question initial assumptions and seek multiple perspectives...",
      keywords: ["bias", "anchoring", "judgment"],
      embedding: JSON.stringify(new Array(1536).fill(0.16)),
      similarity: 0.62,
    },
    {
      id: "10",
      title: "Deep Work",
      category: "Productivity",
      type: "mental-model",
      summary: "Focused work without distractions on cognitively demanding tasks",
      description:
        "Deep work refers to professional activities performed in a state of distraction-free concentration...",
      application: "Schedule blocks of uninterrupted time for important tasks...",
      keywords: ["focus", "productivity", "concentration"],
      embedding: JSON.stringify(new Array(1536).fill(0.17)),
      similarity: 0.76,
    },
  ];

  return {
    RoadmapSupabaseService: vi.fn().mockImplementation(() => ({
      searchKnowledgeContentByEmbedding: vi.fn().mockResolvedValue(mockSearchResults),
      getKnowledgeContent: vi
        .fn()
        .mockResolvedValue(
          mockSearchResults.map(({ similarity: _similarity, ...content }) => content)
        ),
      getUserLearningHistory: vi.fn().mockResolvedValue({
        userId: "test-user",
        learnedConcepts: [],
        currentRoadmapId: undefined,
      }),
      saveRoadmap: vi.fn().mockResolvedValue("mock-roadmap-id"),
    })),
  };
});

// Import modules after mocks are set up
import { RoadmapGenerator } from "../roadmap-generator";
import { RoadmapValidator } from "../roadmap-validation";

describe("RoadmapGenerator", () => {
  let generator: RoadmapGenerator;
  let mockLearningHistory: UserLearningHistory;

  beforeEach(() => {
    vi.clearAllMocks();
    generator = new RoadmapGenerator();
    mockLearningHistory = {
      userId: "test-user",
      learnedConcepts: [],
      currentRoadmapId: undefined,
    };
  });

  describe("Goal Analysis", () => {
    it("should identify behavioral goals", () => {
      const goal = "I want to stop procrastinating on important work";
      const analysis = (generator as any).analyzeGoalContext(goal); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(analysis.isBehavioral).toBe(true);
    });

    it("should identify cognitive goals", () => {
      const goal = "I want to think more clearly and make better decisions";
      const analysis = (generator as any).analyzeGoalContext(goal); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(analysis.isCognitive).toBe(true);
    });

    it("should identify professional domain", () => {
      const goal = "I want to advance in my career";
      const analysis = (generator as any).analyzeGoalContext(goal); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(analysis.domain).toBe("professional");
    });
  });

  describe("Roadmap Generation", () => {
    it("should generate a roadmap with 5-7 steps", async () => {
      const goalInput = {
        goalDescription: "I want to improve my decision making skills",
        userId: "test-user",
        timestamp: new Date().toISOString(),
      };

      const roadmap = await generator.generateRoadmap(goalInput, mockLearningHistory);

      expect(roadmap.steps.length).toBeGreaterThanOrEqual(5);
      expect(roadmap.steps.length).toBeLessThanOrEqual(7);
    });

    it("should prioritize mental models", async () => {
      const goalInput = {
        goalDescription: "I want to be more productive at work",
        userId: "test-user",
        timestamp: new Date().toISOString(),
      };

      const roadmap = await generator.generateRoadmap(goalInput, mockLearningHistory);
      const mentalModels = roadmap.steps.filter((s) => s.type === "mental-model");

      expect(mentalModels.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Learning History Integration", () => {
    it("should include spaced repetition for learned concepts", async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Mock a learning history with a learned concept
      const mockServiceWithHistory = (generator as any).supabaseService; // eslint-disable-line @typescript-eslint/no-explicit-any
      mockServiceWithHistory.searchKnowledgeContentByEmbedding = vi.fn().mockResolvedValue([
        {
          id: "1",
          title: "First Principles Thinking",
          category: "Decision Making",
          type: "mental-model",
          summary: "Breaking down complex problems to fundamental truths",
          description: "First principles thinking involves breaking down complicated problems...",
          application: "To use first principles thinking, start by questioning assumptions...",
          keywords: ["problem-solving", "analysis", "fundamentals"],
          embedding: JSON.stringify(new Array(1536).fill(0.1)),
          similarity: 0.85,
          isLearned: true,
          learnedData: {
            completedAt: sevenDaysAgo.toISOString(),
            lastReflectionAt: sevenDaysAgo.toISOString(),
            effectivenessRating: 4,
            applicationCount: 3,
          },
        },
        {
          id: "2",
          title: "Confirmation Bias",
          category: "Psychology",
          type: "cognitive-bias",
          summary: "The tendency to search for information that confirms our beliefs",
          description: "Confirmation bias is our tendency to cherry-pick information...",
          application: "To counter confirmation bias, actively seek disconfirming evidence...",
          keywords: ["bias", "psychology", "decision-making"],
          embedding: JSON.stringify(new Array(1536).fill(0.2)),
          similarity: 0.75,
        },
        {
          id: "3",
          title: "Systems Thinking",
          category: "Systems Thinking",
          type: "mental-model",
          summary: "Understanding how parts interact within a whole",
          description: "Systems thinking is a holistic approach to analysis...",
          application: "Look for feedback loops and interconnections...",
          keywords: ["systems", "holistic", "interactions"],
          embedding: JSON.stringify(new Array(1536).fill(0.15)),
          similarity: 0.7,
        },
        {
          id: "4",
          title: "Present Bias",
          category: "Psychology",
          type: "cognitive-bias",
          summary: "Overvaluing immediate rewards over future benefits",
          description: "Present bias leads us to prioritize immediate gratification...",
          application: "Use commitment devices and future visualization...",
          keywords: ["bias", "time", "rewards"],
          embedding: JSON.stringify(new Array(1536).fill(0.18)),
          similarity: 0.65,
        },
        {
          id: "5",
          title: "80/20 Principle",
          category: "Productivity",
          type: "mental-model",
          summary: "80% of results come from 20% of efforts",
          description: "The Pareto principle states that roughly 80% of effects...",
          application: "Identify and focus on the vital few activities...",
          keywords: ["productivity", "efficiency", "focus"],
          embedding: JSON.stringify(new Array(1536).fill(0.12)),
          similarity: 0.8,
        },
      ]);

      mockLearningHistory.learnedConcepts = [
        {
          knowledgeContentId: "1",
          completedAt: sevenDaysAgo.toISOString(),
          lastReflectionAt: sevenDaysAgo.toISOString(),
          effectivenessRating: 4,
          applicationCount: 3,
        },
      ];

      const goalInput = {
        goalDescription: "I want to make better decisions",
        userId: "test-user",
        timestamp: new Date().toISOString(),
      };

      const roadmap = await generator.generateRoadmap(goalInput, mockLearningHistory);
      const reinforcementSteps = roadmap.steps.filter((s) => s.learningStatus === "reinforcement");

      expect(reinforcementSteps.length).toBeGreaterThan(0);
    });
  });

  describe("Goal Context Usage", () => {
    it("should prioritize psychology concepts for behavioral goals", async () => {
      const goalInput = {
        goalDescription: "I want to stop procrastinating and build better habits",
        userId: "test-user",
        timestamp: new Date().toISOString(),
      };

      const roadmap = await generator.generateRoadmap(goalInput, mockLearningHistory);
      const psychologyConcepts = roadmap.steps.filter((s) => s.category === "Psychology");

      expect(psychologyConcepts.length).toBeGreaterThanOrEqual(1);
    });

    it("should prioritize productivity concepts for professional goals", async () => {
      const goalInput = {
        goalDescription: "I want to be more productive at work and advance my career",
        userId: "test-user",
        timestamp: new Date().toISOString(),
      };

      const roadmap = await generator.generateRoadmap(goalInput, mockLearningHistory);
      const productivityConcepts = roadmap.steps.filter(
        (s) => s.category === "Productivity" || s.title.includes("80/20")
      );

      expect(productivityConcepts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Advanced Synthesis", () => {
    it("should generate synthesis roadmap for users with 80+ learned concepts", async () => {
      // Mock the getKnowledgeContent for advanced synthesis
      const mockService = (generator as any).supabaseService; // eslint-disable-line @typescript-eslint/no-explicit-any
      mockService.getKnowledgeContent = vi.fn().mockResolvedValue([
        {
          id: "1",
          title: "First Principles Thinking",
          category: "Decision Making",
          type: "mental-model",
          summary: "Breaking down complex problems to fundamental truths",
          description: "First principles thinking involves breaking down complicated problems...",
          application: "To use first principles thinking, start by questioning assumptions...",
          keywords: ["problem-solving", "analysis", "fundamentals"],
          embedding: JSON.stringify(new Array(1536).fill(0.1)),
        },
        {
          id: "2",
          title: "Confirmation Bias",
          category: "Psychology",
          type: "cognitive-bias",
          summary: "The tendency to search for information that confirms our beliefs",
          description: "Confirmation bias is our tendency to cherry-pick information...",
          application: "To counter confirmation bias, actively seek disconfirming evidence...",
          keywords: ["bias", "psychology", "decision-making"],
          embedding: JSON.stringify(new Array(1536).fill(0.2)),
        },
      ]);

      // Create a learning history with 80 concepts
      const extensiveLearningHistory: UserLearningHistory = {
        userId: "advanced-user",
        learnedConcepts: Array(80)
          .fill(null)
          .map((_, i) => ({
            knowledgeContentId: `${(i % 7) + 1}`, // Cycle through our 7 mock concepts
            completedAt: new Date().toISOString(),
            lastReflectionAt: new Date().toISOString(),
            effectivenessRating: 4 + (i % 2), // 4 or 5
            applicationCount: 5 + i,
          })),
        currentRoadmapId: undefined,
      };

      const goalInput = {
        goalDescription: "Master strategic thinking",
        userId: "advanced-user",
        timestamp: new Date().toISOString(),
      };

      const roadmap = await generator.generateRoadmap(goalInput, extensiveLearningHistory);

      expect(roadmap.goalDescription).toContain("Advanced Synthesis");
      expect(roadmap.steps.every((s) => s.learningStatus === "new")).toBe(true);
      expect(roadmap.estimatedDuration).toContain("weeks");
    });
  });

  describe("Type Balancing", () => {
    it("should ensure proper distribution of mental models and biases", async () => {
      const goalInput = {
        goalDescription: "I want to think more clearly",
        userId: "test-user",
        timestamp: new Date().toISOString(),
      };

      const roadmap = await generator.generateRoadmap(goalInput, mockLearningHistory);

      const mentalModels = roadmap.steps.filter((s) => s.type === "mental-model");
      const biases = roadmap.steps.filter(
        (s) => s.type === "cognitive-bias" || s.type === "fallacy"
      );

      expect(mentalModels.length).toBeGreaterThanOrEqual(2);
      expect(biases.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Synergy Scoring", () => {
    it("should prioritize concepts that work well together", () => {
      // Access private method for testing
      const synergyScore = (generator as any).calculateSynergyScore; // eslint-disable-line @typescript-eslint/no-explicit-any

      const concept1 = {
        id: "1",
        title: "First Principles Thinking",
        category: "Decision Making",
        type: "mental-model" as const,
        summary: "Breaking down complex problems",
        description: "Description",
        application: "Application",
        keywords: ["problem-solving"],
        embedding: JSON.stringify(new Array(1536).fill(0.1)),
        finalScore: 0.7,
        semanticSimilarity: 0.7,
        categoryAlignment: 0.7,
        typeDiversityBonus: 0.6,
        goalExampleMatch: 0.1,
        noveltyScore: 0.15,
        spacedRepetitionScore: 0,
        isLearned: false,
      };

      const concept2 = {
        id: "7",
        title: "Inversion",
        category: "Problem Solving",
        type: "mental-model" as const,
        summary: "Thinking backwards",
        description: "Description",
        application: "Application",
        keywords: ["problem-solving"],
        embedding: JSON.stringify(new Array(1536).fill(0.11)),
        finalScore: 0.65,
        semanticSimilarity: 0.65,
        categoryAlignment: 0.7,
        typeDiversityBonus: 0.6,
        goalExampleMatch: 0.1,
        noveltyScore: 0.15,
        spacedRepetitionScore: 0,
        isLearned: false,
      };

      const synergy = synergyScore.call(generator, concept2, [concept1]);

      expect(synergy).toBeGreaterThan(0); // Should have synergy since they're related
    });
  });
});

describe("RoadmapValidator", () => {
  describe("Goal Validation", () => {
    it("should reject vague goals", () => {
      const result = RoadmapValidator.validateGoalDescription("I want to be better");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("more specific");
    });

    it("should reframe negative goals", () => {
      const result = RoadmapValidator.validateGoalDescription("I don't want to be lazy anymore");
      expect(result.isValid).toBe(true);
      expect(result.processedGoal).toContain("overcome");
    });

    it("should detect multiple goals", () => {
      const result = RoadmapValidator.validateGoalDescription(
        "I want to be more productive and also improve my relationships"
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("one primary goal");
    });
  });

  describe("Roadmap Validation", () => {
    it("should validate step count", () => {
      const roadmap = {
        goalDescription: "Test goal",
        totalSteps: 4,
        estimatedDuration: "4 weeks",
        learningMixSummary: {
          newConcepts: 4,
          reinforcementConcepts: 0,
          expansionPercentage: 100,
        },
        steps: new Array(4).fill(null).map((_, i) => ({
          order: i + 1,
          knowledgeContentId: `${i}`,
          title: `Concept ${i}`,
          type: "mental-model" as const,
          category: "Test",
          relevanceScore: 0.8,
          learningStatus: "new" as const,
          rationaleForInclusion: "Test rationale",
          suggestedFocus: "Test focus",
        })),
      };

      const result = RoadmapValidator.validateRoadmap(roadmap);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Roadmap should have 5-7 steps, but has 4");
    });
  });
});
