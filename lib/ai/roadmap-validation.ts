import type { GeneratedRoadmap } from "@/lib/types/ai";

export class RoadmapValidator {
  static validateGoalDescription(goal: string): {
    isValid: boolean;
    error?: string;
    processedGoal?: string;
  } {
    if (!goal || goal.trim().length < 10) {
      return {
        isValid: false,
        error: "Goal description must be at least 10 characters long",
      };
    }

    // Check for vague goals
    const vaguePatterns = [
      /^i want to be better$/i,
      /^be better$/i,
      /^improve$/i,
      /^get better$/i,
      /^be good$/i,
    ];

    if (vaguePatterns.some((pattern) => pattern.test(goal.trim()))) {
      return {
        isValid: false,
        error: "Please provide a more specific goal. What exactly do you want to improve?",
      };
    }

    // Reframe negative goals
    const negativePatterns = [
      { pattern: /don'?t want to be (.*) anymore/i, replacement: "want to overcome being $1" },
      { pattern: /stop being (.*)/i, replacement: "become less $1 and more effective" },
      { pattern: /get rid of (.*)/i, replacement: "overcome $1" },
      { pattern: /hate (.*)/i, replacement: "want to improve my relationship with $1" },
    ];

    let processedGoal = goal;
    for (const { pattern, replacement } of negativePatterns) {
      if (pattern.test(processedGoal)) {
        processedGoal = processedGoal.replace(pattern, replacement);
      }
    }

    // Check for multiple goals
    const multipleGoalIndicators = [
      / and also /i,
      / plus /i,
      / as well as /i,
      /\d+\./g, // numbered lists
      /;/g, // semicolon separated
    ];

    const hasMultipleGoals = multipleGoalIndicators.some((indicator) =>
      indicator.test(processedGoal)
    );

    if (hasMultipleGoals) {
      return {
        isValid: false,
        error:
          "Please focus on one primary goal. You can create additional roadmaps for other goals later.",
      };
    }

    // Check for unrealistic expectations
    const unrealisticPatterns = [
      /perfect/i,
      /never make mistakes/i,
      /always be right/i,
      /best at everything/i,
    ];

    const hasUnrealisticExpectations = unrealisticPatterns.some((pattern) =>
      pattern.test(processedGoal)
    );

    if (hasUnrealisticExpectations) {
      processedGoal = `${processedGoal} (focusing on continuous improvement rather than perfection)`;
    }

    return {
      isValid: true,
      processedGoal: processedGoal.trim(),
    };
  }

  static validateRoadmap(roadmap: GeneratedRoadmap): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check step count
    if (roadmap.steps.length < 5 || roadmap.steps.length > 7) {
      errors.push(`Roadmap should have 5-7 steps, but has ${roadmap.steps.length}`);
    }

    // Check for duplicate concepts
    const conceptIds = new Set<string>();
    for (const step of roadmap.steps) {
      if (conceptIds.has(step.knowledgeContentId)) {
        errors.push(`Duplicate concept found: ${step.title}`);
      }
      conceptIds.add(step.knowledgeContentId);
    }

    // Verify type distribution
    const typeCount = roadmap.steps.reduce(
      (acc, step) => {
        acc[step.type] = (acc[step.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    if (!typeCount["mental-model"] || typeCount["mental-model"] < 2) {
      errors.push("Roadmap should include at least 2 mental models");
    }

    if (!typeCount["cognitive-bias"] && !typeCount["fallacy"]) {
      errors.push("Roadmap should include at least 1 cognitive bias or logical fallacy");
    }

    // Check learning mix accuracy
    const actualNewConcepts = roadmap.steps.filter((s) => s.learningStatus === "new").length;
    // const _actualReinforcementConcepts = roadmap.steps.filter(
    //   (s) => s.learningStatus === "reinforcement"
    // ).length;

    if (actualNewConcepts !== roadmap.learningMixSummary.newConcepts) {
      errors.push("Learning mix summary doesn't match actual step counts");
    }

    // Verify order sequence
    const orders = roadmap.steps.map((s) => s.order).sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i + 1) {
        errors.push("Step order sequence is not continuous");
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static handleEdgeCases(
    goal: string,
    availableConceptsCount: number,
    userLearnedCount: number
  ): {
    shouldProceed: boolean;
    message?: string;
    fallbackStrategy?: string;
  } {
    // User has learned most concepts
    if (userLearnedCount > 80) {
      if (availableConceptsCount < 5) {
        return {
          shouldProceed: false,
          message:
            "You've mastered most of our mental models! Consider creating an 'advanced synthesis' goal that combines multiple concepts you've learned.",
          fallbackStrategy: "advanced-synthesis",
        };
      }
    }

    // Very few relevant concepts found
    if (availableConceptsCount < 5) {
      return {
        shouldProceed: false,
        message:
          "Your goal might be too specific or technical. Try rephrasing it in more general terms or breaking it down into smaller goals.",
        fallbackStrategy: "rephrase-goal",
      };
    }

    // User inactive for long period
    // const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;
    if (userLearnedCount > 0) {
      // This check would need last activity date from user data
      // Simplified for now
      return {
        shouldProceed: true,
        message:
          "Welcome back! We'll include some familiar concepts to help you get back on track.",
        fallbackStrategy: "re-engagement",
      };
    }

    return { shouldProceed: true };
  }
}
