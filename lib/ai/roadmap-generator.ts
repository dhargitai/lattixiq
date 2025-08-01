import { generateEmbedding } from "./embeddings-service";
import { RoadmapSupabaseService } from "./roadmap-supabase-service";
import { roadmapCache } from "./roadmap-cache";
import {
  RoadmapErrorHandler,
  PerformanceMonitor,
  EmbeddingServiceError,
  DatabaseSearchError,
  InsufficientContentError,
} from "./roadmap-error-handler";
import type {
  UserGoalInput,
  KnowledgeContent,
  UserLearningHistory,
  GeneratedRoadmap,
  RoadmapStep,
  ScoredKnowledgeContent,
} from "@/lib/types/ai";

const SIMILARITY_THRESHOLD = 0.3;
const OPTIMAL_SPACED_INTERVALS = [1, 3, 7, 30, 90];
const SPACED_INTERVAL_TOLERANCE = 0.2;

const WEIGHTS = {
  semanticSimilarity: 0.35,
  categoryAlignment: 0.15,
  typeDiversityBonus: 0.15,
  goalExampleMatch: 0.15,
  noveltyScore: 0.15,
  spacedRepetitionScore: 0.05,
};

export class RoadmapGenerator {
  private supabaseService: RoadmapSupabaseService;
  private cacheLoggingInterval: NodeJS.Timeout | null = null;

  constructor(enableCacheLogging = false) {
    this.supabaseService = new RoadmapSupabaseService();

    // Optionally enable cache statistics logging
    if (
      enableCacheLogging &&
      typeof process !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      this.cacheLoggingInterval = setInterval(() => {
        const stats = roadmapCache.getStats();
        console.log("[RoadmapCache] Statistics:", {
          embeddings: {
            hitRate: stats.embeddings.hits / (stats.embeddings.hits + stats.embeddings.misses) || 0,
            ...stats.embeddings,
          },
          search: {
            hitRate: stats.search.hits / (stats.search.hits + stats.search.misses) || 0,
            ...stats.search,
          },
        });
      }, 60000); // Log every minute
    }
  }

  // Clean up interval on destruction
  destroy() {
    if (this.cacheLoggingInterval) {
      clearInterval(this.cacheLoggingInterval);
      this.cacheLoggingInterval = null;
    }
  }

  async generateRoadmap(
    goalInput: UserGoalInput,
    learningHistory: UserLearningHistory
  ): Promise<GeneratedRoadmap> {
    PerformanceMonitor.startTimer("generateRoadmap");

    try {
      // Check if user is an advanced learner
      if (learningHistory.learnedConcepts.length >= 80) {
        return await this.generateAdvancedSynthesisRoadmap(goalInput, learningHistory);
      }

      // Phase 1: Goal Analysis with caching
      PerformanceMonitor.startTimer("goalAnalysis");
      let goalEmbedding = roadmapCache.getEmbedding(goalInput.goalDescription);

      if (!goalEmbedding) {
        // Generate and cache if not found
        try {
          goalEmbedding = await RoadmapErrorHandler.executeWithRetry(
            () => generateEmbedding(goalInput.goalDescription),
            {
              onRetry: (attempt, error) => {
                console.warn(`Retrying embedding generation (attempt ${attempt}):`, error.message);
              },
            }
          );
          roadmapCache.setEmbedding(goalInput.goalDescription, goalEmbedding);
        } catch (error) {
          throw new EmbeddingServiceError("Failed to generate embedding for goal", {
            goal: goalInput.goalDescription,
            error,
          });
        }
      }

      const goalContext = this.analyzeGoalContext(goalInput.goalDescription);
      PerformanceMonitor.endTimer("goalAnalysis");

      // Phase 2: Semantic Search & Learning History Analysis
      PerformanceMonitor.startTimer("findCandidates");
      const candidates = await this.findCandidates(
        goalEmbedding,
        learningHistory,
        goalContext,
        goalInput.goalDescription
      );
      PerformanceMonitor.endTimer("findCandidates");

      // Check if we have enough candidates
      if (candidates.length < 5) {
        throw new InsufficientContentError("Not enough relevant content found for your goal", {
          candidateCount: candidates.length,
          goal: goalInput.goalDescription,
        });
      }

      // Phase 3: Intelligent Curation
      PerformanceMonitor.startTimer("curateLearningPath");
      const selectedSteps = this.curateLearningPath(candidates, goalContext);
      PerformanceMonitor.endTimer("curateLearningPath");

      // Phase 4: Roadmap Assembly
      PerformanceMonitor.startTimer("assembleRoadmap");
      const roadmap = this.assembleRoadmap(goalInput.goalDescription, selectedSteps);
      PerformanceMonitor.endTimer("assembleRoadmap");

      const totalTime = PerformanceMonitor.endTimer("generateRoadmap");
      console.log(`[RoadmapGenerator] Generated roadmap in ${totalTime}ms`);

      return roadmap;
    } catch (error) {
      RoadmapErrorHandler.logError(error as Error, {
        userId: goalInput.userId,
        goal: goalInput.goalDescription,
        phase: "generateRoadmap",
      });
      throw error;
    }
  }

  private analyzeGoalContext(goalDescription: string) {
    const lowerGoal = goalDescription.toLowerCase();

    return {
      isBehavioral: /habit|stop|start|change|improve|overcome|reduce/.test(lowerGoal),
      isCognitive: /think|understand|learn|decide|analyze|solve/.test(lowerGoal),
      isEmotional: /feel|emotion|stress|anxiety|confidence|happy/.test(lowerGoal),
      isSkillBased: /skill|ability|better at|master|develop/.test(lowerGoal),
      isImmediate: /now|urgent|quickly|asap|immediately/.test(lowerGoal),
      isLongTerm: /future|long.?term|years?|months?/.test(lowerGoal),
      domain: this.identifyDomain(lowerGoal),
    };
  }

  private identifyDomain(goal: string): string {
    if (/work|job|career|professional|business/.test(goal)) return "professional";
    if (/relationship|family|friend|social|people/.test(goal)) return "relational";
    if (/health|fitness|exercise|diet|sleep/.test(goal)) return "health";
    if (/money|finance|invest|save|budget/.test(goal)) return "financial";
    return "personal";
  }

  private async findCandidates(
    goalEmbedding: number[],
    learningHistory: UserLearningHistory,
    goalContext: ReturnType<typeof this.analyzeGoalContext>,
    goalDescription: string
  ): Promise<ScoredKnowledgeContent[]> {
    // Create a hash of the learning history for cache key
    const learningHistoryHash = roadmapCache.hashLearningHistory(
      learningHistory.learnedConcepts.map((c) => c.knowledgeContentId)
    );

    // Check cache first
    let searchResults = roadmapCache.getSearchResults(
      goalEmbedding,
      SIMILARITY_THRESHOLD,
      30,
      learningHistoryHash
    );

    if (!searchResults) {
      // Use database vector search if not cached
      try {
        searchResults = await RoadmapErrorHandler.executeWithRetry(
          () =>
            this.supabaseService.searchKnowledgeContentByEmbedding(
              goalEmbedding,
              SIMILARITY_THRESHOLD,
              30, // Get top 30 candidates
              learningHistory
            ),
          {
            onRetry: (attempt, error) => {
              console.warn(`Retrying database search (attempt ${attempt}):`, error.message);
            },
          }
        );

        // Cache the results
        roadmapCache.setSearchResults(
          goalEmbedding,
          SIMILARITY_THRESHOLD,
          30,
          searchResults,
          learningHistoryHash
        );
      } catch (error) {
        throw new DatabaseSearchError("Failed to search knowledge content", {
          threshold: SIMILARITY_THRESHOLD,
          error,
        });
      }
    }

    const currentDate = new Date();
    const scoredContent: ScoredKnowledgeContent[] = [];

    for (const content of searchResults) {
      // Similarity is already calculated by the database
      const semanticSimilarity = content.similarity;

      // Learning history is already included in search results
      const isLearned = (content as any).isLearned || false;
      const learnedData = (content as any).learnedData;

      let daysSinceLastUse = 0;
      let spacedRepetitionScore = 0;

      if (isLearned && learnedData) {
        daysSinceLastUse = Math.floor(
          (currentDate.getTime() - new Date(learnedData.lastReflectionAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        spacedRepetitionScore = this.calculateSpacedRepetitionScore(
          daysSinceLastUse,
          learnedData.effectivenessRating
        );
      }

      const categoryAlignment = this.calculateCategoryAlignment(content, goalContext);
      const typeDiversityBonus = this.calculateTypeDiversityBonus(content);
      const goalExampleMatch = this.calculateGoalExampleMatch(content, goalDescription);
      const noveltyScore = isLearned ? 0 : 0.15;

      const finalScore =
        semanticSimilarity * WEIGHTS.semanticSimilarity +
        categoryAlignment * WEIGHTS.categoryAlignment +
        typeDiversityBonus * WEIGHTS.typeDiversityBonus +
        goalExampleMatch * WEIGHTS.goalExampleMatch +
        noveltyScore +
        spacedRepetitionScore;

      scoredContent.push({
        ...content,
        semanticSimilarity,
        categoryAlignment,
        typeDiversityBonus,
        goalExampleMatch,
        noveltyScore,
        spacedRepetitionScore,
        finalScore,
        isLearned,
        daysSinceLastUse: isLearned ? daysSinceLastUse : undefined,
      });
    }

    // Sort by final score descending
    return scoredContent.sort((a, b) => b.finalScore - a.finalScore).slice(0, 30);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private calculateSpacedRepetitionScore(
    daysSinceLastUse: number,
    effectivenessRating: number
  ): number {
    for (const interval of OPTIMAL_SPACED_INTERVALS) {
      const deviation = Math.abs(daysSinceLastUse - interval) / interval;
      if (deviation <= SPACED_INTERVAL_TOLERANCE) {
        return 0.05 * (effectivenessRating / 5);
      }
    }
    return 0;
  }

  private calculateGoalExampleMatch(content: KnowledgeContent, goalDescription: string): number {
    if (!content.goalExamples || content.goalExamples.length === 0) {
      return 0;
    }

    // The content embedding already includes goal examples, so the semantic similarity
    // from the database search already accounts for goal example matching.
    // Here we add a small bonus for direct keyword matches as a secondary signal.

    let keywordBonus = 0;
    const goalLower = goalDescription.toLowerCase();

    for (const example of content.goalExamples) {
      const exampleGoalLower = example.goal.toLowerCase();

      // Check for high-value keyword matches between user goal and example goals
      const highValueMatches = [
        "decision",
        "procrastin",
        "productiv",
        "relationship",
        "confidence",
        "habit",
        "career",
        "stress",
        "communication",
        "leadership",
        "creative",
        "focus",
        "motivation",
        "discipline",
      ];

      let matchCount = 0;
      for (const keyword of highValueMatches) {
        if (goalLower.includes(keyword) && exampleGoalLower.includes(keyword)) {
          matchCount++;
        }
      }

      // Calculate bonus based on match count
      if (matchCount > 0) {
        keywordBonus = Math.max(keywordBonus, matchCount * 0.02);
      }

      // Additional bonus for very similar goal patterns
      if (this.calculateStringSimilarity(goalLower, exampleGoalLower) > 0.7) {
        keywordBonus = Math.max(keywordBonus, 0.1);
      }
    }

    // Return a conservative bonus since embedding similarity is the primary signal
    return Math.min(keywordBonus, 0.15);
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    // Simple Jaccard similarity for word overlap
    const words1 = new Set(str1.split(/\s+/).filter((w) => w.length > 2));
    const words2 = new Set(str2.split(/\s+/).filter((w) => w.length > 2));

    const intersection = new Set([...words1].filter((w) => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction
    const stopWords = new Set([
      "i",
      "want",
      "to",
      "be",
      "more",
      "less",
      "my",
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
    ]);
    return text
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))
      .map((word) => word.replace(/[^a-z]/g, ""));
  }

  private calculateCategoryAlignment(
    content: KnowledgeContent,
    goalContext: ReturnType<typeof this.analyzeGoalContext>
  ): number {
    // Dynamic category scoring based on goal context
    const baseScores: Record<string, number> = {
      "Decision Making": 0.5,
      Psychology: 0.5,
      Productivity: 0.5,
      Philosophy: 0.4,
      "Systems Thinking": 0.5,
      "Problem Solving": 0.5,
      Communication: 0.4,
      Learning: 0.4,
    };

    let score = baseScores[content.category] || 0.3;

    // Boost categories based on goal characteristics
    if (goalContext.isBehavioral) {
      if (["Psychology", "Habits", "Productivity"].includes(content.category)) {
        score += 0.2;
      }
    }

    if (goalContext.isCognitive) {
      if (
        ["Decision Making", "Problem Solving", "Systems Thinking", "Learning"].includes(
          content.category
        )
      ) {
        score += 0.2;
      }
    }

    if (goalContext.isEmotional) {
      if (["Psychology", "Philosophy", "Mindfulness"].includes(content.category)) {
        score += 0.2;
      }
    }

    if (goalContext.isSkillBased) {
      if (["Learning", "Practice", "Problem Solving"].includes(content.category)) {
        score += 0.2;
      }
    }

    // Domain-specific boosts
    if (
      goalContext.domain === "professional" &&
      ["Productivity", "Communication", "Leadership"].includes(content.category)
    ) {
      score += 0.15;
    }

    if (
      goalContext.domain === "relational" &&
      ["Communication", "Psychology", "Empathy"].includes(content.category)
    ) {
      score += 0.15;
    }

    if (
      goalContext.domain === "personal" &&
      ["Philosophy", "Psychology", "Self-Improvement"].includes(content.category)
    ) {
      score += 0.1;
    }

    // Urgency modifier
    if (
      goalContext.isImmediate &&
      ["Quick Wins", "Productivity", "Action"].includes(content.category)
    ) {
      score += 0.1;
    }

    return Math.min(score, 1.0); // Cap at 1.0
  }

  private calculateTypeDiversityBonus(content: KnowledgeContent): number {
    // Bonus for types that provide different perspectives
    const typeScores: Record<string, number> = {
      "mental-model": 0.6,
      "cognitive-bias": 0.5,
      "logical-fallacy": 0.4,
    };

    return typeScores[content.type] || 0.5;
  }

  private calculateSynergyScore(
    concept: ScoredKnowledgeContent,
    selectedConcepts: ScoredKnowledgeContent[]
  ): number {
    if (selectedConcepts.length === 0) return 0;

    let synergyScore = 0;

    // Define synergistic pairs and groups
    const synergyPairs: Record<string, string[]> = {
      "First Principles Thinking": ["Inversion", "Systems Thinking", "Root Cause Analysis"],
      "Confirmation Bias": ["Scientific Method", "Falsification", "Devil's Advocate"],
      "Systems Thinking": ["Feedback Loops", "Second-Order Thinking", "Emergence"],
      "Mental Models": ["First Principles", "Inversion", "Probabilistic Thinking"],
      "Present Bias": ["Long-term Thinking", "Delayed Gratification", "Future Self"],
      "Parkinson's Law": ["Time Boxing", "Pomodoro Technique", "Deadlines"],
      "Growth Mindset": ["Deliberate Practice", "Learning from Failure", "Feedback Loops"],
      Stoicism: ["Negative Visualization", "Control Dichotomy", "Amor Fati"],
    };

    // Check for direct synergies
    const conceptTitle = concept.title;
    const selectedTitles = selectedConcepts.map((c) => c.title);

    if (synergyPairs[conceptTitle]) {
      const synergisticPartners = synergyPairs[conceptTitle];
      const matchingPartners = selectedTitles.filter((title) =>
        synergisticPartners.some((partner) => title.includes(partner) || partner.includes(title))
      );

      synergyScore += matchingPartners.length * 0.1;
    }

    // Check for category synergies
    const categorySynergies: Record<string, string[]> = {
      Psychology: ["Philosophy", "Neuroscience", "Behavioral Economics"],
      "Decision Making": ["Psychology", "Logic", "Probability"],
      Productivity: ["Psychology", "Time Management", "Systems Thinking"],
      Philosophy: ["Psychology", "Ethics", "Logic"],
    };

    if (categorySynergies[concept.category]) {
      const synergisticCategories = categorySynergies[concept.category];
      const matchingCategories = selectedConcepts.filter((c) =>
        synergisticCategories.includes(c.category)
      );

      synergyScore += (matchingCategories.length / selectedConcepts.length) * 0.05;
    }

    // Type complementarity bonus
    const typeDistribution = selectedConcepts.reduce(
      (acc, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Bonus for adding a different type when others dominate
    const totalSelected = selectedConcepts.length;
    const dominantTypeCount = Math.max(...Object.values(typeDistribution));
    if (dominantTypeCount / totalSelected > 0.6 && !typeDistribution[concept.type]) {
      synergyScore += 0.1;
    }

    // Learning sequence synergy
    if (this.isFoundational(concept.title) && selectedConcepts.length < 3) {
      synergyScore += 0.05; // Bonus for foundational concepts early
    }

    // Reinforcement synergy - bonus for pairing learned with new related concepts
    if (concept.isLearned) {
      const relatedNew = selectedConcepts.filter(
        (c) =>
          !c.isLearned &&
          (c.category === concept.category || this.areConceptsRelated(concept.title, c.title))
      );

      if (relatedNew.length > 0) {
        synergyScore += 0.08; // Bonus for reinforcement paired with new learning
      }
    }

    return Math.min(synergyScore, 0.3); // Cap at 0.3
  }

  private areConceptsRelated(title1: string, title2: string): boolean {
    // Simple relatedness check based on common themes
    const relatedGroups = [
      ["Bias", "Fallacy", "Error", "Mistake"],
      ["Thinking", "Mental", "Cognitive", "Mind"],
      ["Decision", "Choice", "Judge", "Evaluate"],
      ["System", "Process", "Method", "Framework"],
      ["Time", "Temporal", "Schedule", "Deadline"],
    ];

    for (const group of relatedGroups) {
      const title1Match = group.some((word) => title1.includes(word));
      const title2Match = group.some((word) => title2.includes(word));
      if (title1Match && title2Match) return true;
    }

    return false;
  }

  private curateLearningPath(
    candidates: ScoredKnowledgeContent[],
    goalContext: ReturnType<typeof this.analyzeGoalContext>
  ): ScoredKnowledgeContent[] {
    const selected: ScoredKnowledgeContent[] = [];
    const categoryCount = new Map<string, number>();
    const typeCount = new Map<string, number>();

    // Sort candidates with synergy consideration
    const candidatesWithSynergy = candidates
      .map((candidate) => {
        const synergyBonus = this.calculateSynergyScore(candidate, selected);
        return {
          ...candidate,
          adjustedScore: candidate.finalScore + synergyBonus,
        };
      })
      .sort((a, b) => b.adjustedScore - a.adjustedScore);

    // Define foundational concepts based on goal context
    let foundationalTitles = ["First Principles", "Mental Models"];

    if (goalContext.isBehavioral) {
      foundationalTitles.push("Habit Formation", "Behavioral Change");
    }
    if (goalContext.isCognitive) {
      foundationalTitles.push("Systems Thinking", "Critical Thinking");
    }
    if (goalContext.isEmotional) {
      foundationalTitles.push("Emotional Intelligence", "Mindfulness");
    }
    if (goalContext.domain === "professional") {
      foundationalTitles.push("80/20 Principle", "Deep Work");
    }

    // Prioritize foundational concepts
    const foundational = candidatesWithSynergy.filter((c) =>
      foundationalTitles.some((title) => c.title.includes(title) || title.includes(c.title))
    );

    // Add foundational concepts first
    for (const concept of foundational) {
      if (selected.length < 7) {
        selected.push(concept);
        this.updateCounts(concept, categoryCount, typeCount);
      }
    }

    // Priority categories based on goal context
    const priorityCategories = this.getPriorityCategories(goalContext);

    // Add high-priority category concepts
    for (const category of priorityCategories) {
      const categoryConcepts = candidatesWithSynergy.filter(
        (c) => c.category === category && !selected.includes(c)
      );

      for (const concept of categoryConcepts) {
        if (selected.length >= 7) break;

        const categoryLimit = concept.isLearned ? 3 : 2;
        const currentCategoryCount = categoryCount.get(concept.category) || 0;

        if (currentCategoryCount < categoryLimit) {
          // Recalculate synergy with current selection
          const synergy = this.calculateSynergyScore(concept, selected);
          concept.adjustedScore = concept.finalScore + synergy;

          selected.push(concept);
          this.updateCounts(concept, categoryCount, typeCount);
        }
      }
    }

    // Fill remaining slots with highest scoring concepts
    for (const concept of candidatesWithSynergy) {
      if (selected.length >= 7) break;
      if (selected.includes(concept)) continue;

      const categoryLimit = concept.isLearned ? 3 : 2;
      const currentCategoryCount = categoryCount.get(concept.category) || 0;

      if (currentCategoryCount < categoryLimit) {
        // Recalculate synergy with current selection
        const synergy = this.calculateSynergyScore(concept, selected);
        concept.adjustedScore = concept.finalScore + synergy;

        selected.push(concept);
        this.updateCounts(concept, categoryCount, typeCount);
      }
    }

    // Ensure we have at least 5 concepts
    if (selected.length < 5) {
      // Add any remaining high-scoring concepts regardless of category limits
      for (const concept of candidatesWithSynergy) {
        if (selected.length >= 5) break;
        if (!selected.includes(concept)) {
          selected.push(concept);
        }
      }
    }

    // Ensure balanced type distribution
    const mentalModels = selected.filter((c) => c.type === "mental-model").length;
    const biases = selected.filter((c) => c.type === "cognitive-bias").length;

    // If we need more balance, swap some items
    if (mentalModels < 2 || biases < 1) {
      this.rebalanceTypes(selected, candidates, mentalModels, biases);
    }

    return this.orderByProgression(selected, goalContext);
  }

  private getPriorityCategories(goalContext: ReturnType<typeof this.analyzeGoalContext>): string[] {
    const priorities: string[] = [];

    if (goalContext.isBehavioral) {
      priorities.push("Psychology", "Habits", "Behavioral Economics");
    }
    if (goalContext.isCognitive) {
      priorities.push("Decision Making", "Problem Solving", "Logic");
    }
    if (goalContext.isEmotional) {
      priorities.push("Psychology", "Philosophy", "Emotional Intelligence");
    }
    if (goalContext.isSkillBased) {
      priorities.push("Learning", "Practice", "Mastery");
    }

    // Domain-specific priorities
    if (goalContext.domain === "professional") {
      priorities.push("Productivity", "Leadership", "Communication");
    } else if (goalContext.domain === "relational") {
      priorities.push("Communication", "Empathy", "Social Psychology");
    } else if (goalContext.domain === "financial") {
      priorities.push("Economics", "Decision Making", "Risk Management");
    }

    // Remove duplicates and return
    return [...new Set(priorities)];
  }

  private updateCounts(
    concept: ScoredKnowledgeContent,
    categoryCount: Map<string, number>,
    typeCount: Map<string, number>
  ) {
    categoryCount.set(concept.category, (categoryCount.get(concept.category) || 0) + 1);
    typeCount.set(concept.type, (typeCount.get(concept.type) || 0) + 1);
  }

  private rebalanceTypes(
    selected: ScoredKnowledgeContent[],
    candidates: ScoredKnowledgeContent[],
    mentalModels: number,
    biases: number
  ) {
    // Ensure we have at least 2 mental models and 1 bias/fallacy
    const MIN_MENTAL_MODELS = 2;
    const MIN_BIASES = 1;

    // Find all unselected concepts
    const unselected = candidates.filter((c) => !selected.includes(c));

    // If we need more mental models
    if (mentalModels < MIN_MENTAL_MODELS) {
      const neededModels = MIN_MENTAL_MODELS - mentalModels;
      const availableModels = unselected
        .filter((c) => c.type === "mental-model")
        .sort((a, b) => b.finalScore - a.finalScore);

      // Find lowest scoring non-foundational concepts to replace
      const replaceable = selected
        .filter((c) => !this.isFoundational(c.title) && c.type !== "mental-model")
        .sort((a, b) => a.finalScore - b.finalScore);

      for (let i = 0; i < Math.min(neededModels, availableModels.length, replaceable.length); i++) {
        const indexToReplace = selected.indexOf(replaceable[i]);
        if (indexToReplace !== -1) {
          selected[indexToReplace] = availableModels[i];
        }
      }
    }

    // Recalculate after potential mental model swaps
    const updatedBiases = selected.filter(
      (c) => c.type === "cognitive-bias" || c.type === "logical-fallacy"
    ).length;

    // If we need more biases/fallacies
    if (updatedBiases < MIN_BIASES) {
      const neededBiases = MIN_BIASES - updatedBiases;
      const availableBiases = unselected
        .filter((c) => c.type === "cognitive-bias" || c.type === "logical-fallacy")
        .sort((a, b) => b.finalScore - a.finalScore);

      // Find lowest scoring concepts that aren't mental models or foundational
      const replaceable = selected
        .filter(
          (c) =>
            !this.isFoundational(c.title) &&
            c.type === "mental-model" &&
            selected.filter((s) => s.type === "mental-model").length > MIN_MENTAL_MODELS
        )
        .sort((a, b) => a.finalScore - b.finalScore);

      for (let i = 0; i < Math.min(neededBiases, availableBiases.length, replaceable.length); i++) {
        const indexToReplace = selected.indexOf(replaceable[i]);
        if (indexToReplace !== -1) {
          selected[indexToReplace] = availableBiases[i];
        }
      }
    }

    // Final validation - if still not balanced, force add from remaining candidates
    const finalMentalModels = selected.filter((c) => c.type === "mental-model").length;
    const finalBiases = selected.filter(
      (c) => c.type === "cognitive-bias" || c.type === "logical-fallacy"
    ).length;

    if (finalMentalModels < MIN_MENTAL_MODELS || finalBiases < MIN_BIASES) {
      // This is a fallback - add the highest scoring concepts of needed types
      // even if it means exceeding our target count temporarily
      if (finalMentalModels < MIN_MENTAL_MODELS) {
        const bestModel = unselected
          .filter((c) => c.type === "mental-model")
          .sort((a, b) => b.finalScore - a.finalScore)[0];

        if (bestModel && selected.length < 7) {
          selected.push(bestModel);
        } else if (bestModel) {
          // Replace the lowest scoring non-essential concept
          const lowestNonEssential = selected
            .filter((c) => !this.isFoundational(c.title))
            .sort((a, b) => a.finalScore - b.finalScore)[0];

          const index = selected.indexOf(lowestNonEssential);
          if (index !== -1) {
            selected[index] = bestModel;
          }
        }
      }

      if (finalBiases < MIN_BIASES) {
        const bestBias = unselected
          .filter((c) => c.type === "cognitive-bias" || c.type === "logical-fallacy")
          .sort((a, b) => b.finalScore - a.finalScore)[0];

        if (bestBias && selected.length < 7) {
          selected.push(bestBias);
        } else if (bestBias) {
          // Replace the lowest scoring non-essential concept
          const lowestNonEssential = selected
            .filter(
              (c) =>
                !this.isFoundational(c.title) &&
                !(c.type === "mental-model" && finalMentalModels <= MIN_MENTAL_MODELS)
            )
            .sort((a, b) => a.finalScore - b.finalScore)[0];

          const index = selected.indexOf(lowestNonEssential);
          if (index !== -1) {
            selected[index] = bestBias;
          }
        }
      }
    }

    // Ensure we don't exceed 7 concepts
    if (selected.length > 7) {
      // Remove lowest scoring concepts
      selected.sort((a, b) => b.finalScore - a.finalScore);
      selected.length = 7;
    }
  }

  private orderByProgression(
    concepts: ScoredKnowledgeContent[],
    goalContext: ReturnType<typeof this.analyzeGoalContext>
  ): ScoredKnowledgeContent[] {
    // Order: Foundation → Recognition → Application → Mastery
    return concepts.sort((a, b) => {
      // For immediate goals, prioritize quick wins
      if (goalContext.isImmediate) {
        const aQuickWin = ["Two-Minute Rule", "Parkinson's Law", "80/20 Principle"].includes(
          a.title
        );
        const bQuickWin = ["Two-Minute Rule", "Parkinson's Law", "80/20 Principle"].includes(
          b.title
        );
        if (aQuickWin && !bQuickWin) return -1;
        if (!aQuickWin && bQuickWin) return 1;
      }

      // Foundational concepts first
      const aFoundational = this.isFoundational(a.title);
      const bFoundational = this.isFoundational(b.title);
      if (aFoundational && !bFoundational) return -1;
      if (!aFoundational && bFoundational) return 1;

      // Spaced repetition items strategically placed
      if (a.isLearned && !b.isLearned) {
        // Place reinforcement items after 1-2 new concepts
        const newConceptsSoFar = concepts.filter(
          (c) => !c.isLearned && concepts.indexOf(c) < concepts.indexOf(a)
        ).length;
        if (newConceptsSoFar >= 2) return -1;
        return 1;
      }
      if (!a.isLearned && b.isLearned) {
        const newConceptsSoFar = concepts.filter(
          (c) => !c.isLearned && concepts.indexOf(c) < concepts.indexOf(b)
        ).length;
        if (newConceptsSoFar >= 2) return 1;
        return -1;
      }

      // Prerequisite relationships
      const aPrereqForB = this.isPrerequisite(a.title, b.title);
      const bPrereqForA = this.isPrerequisite(b.title, a.title);
      if (aPrereqForB) return -1;
      if (bPrereqForA) return 1;

      // Then by adjusted score (includes synergy)
      return (b as any).adjustedScore - (a as any).adjustedScore || b.finalScore - a.finalScore;
    });
  }

  private isPrerequisite(title1: string, title2: string): boolean {
    const prerequisites: Record<string, string[]> = {
      "First Principles": ["Second-Order Thinking", "Root Cause Analysis"],
      "Mental Models": ["Inversion", "Systems Thinking"],
      "Critical Thinking": ["Logical Fallacies", "Cognitive Biases"],
      "Systems Thinking": ["Feedback Loops", "Emergence"],
      "Scientific Method": ["Hypothesis Testing", "Falsification"],
    };

    return prerequisites[title1]?.some((prereq) => title2.includes(prereq)) || false;
  }

  private isFoundational(title: string): boolean {
    const foundationalTitles = [
      "First Principles",
      "Inversion",
      "Mental Models",
      "Systems Thinking",
      "Stoicism",
      "Growth Mindset",
      "Probabilistic Thinking",
    ];
    return foundationalTitles.includes(title);
  }

  private assembleRoadmap(
    goalDescription: string,
    selectedSteps: ScoredKnowledgeContent[]
  ): GeneratedRoadmap {
    const newConcepts = selectedSteps.filter((s) => !s.isLearned).length;
    const reinforcementConcepts = selectedSteps.filter((s) => s.isLearned).length;

    const steps: RoadmapStep[] = selectedSteps.map((concept, index) => ({
      order: index + 1,
      knowledgeContentId: concept.id,
      title: concept.title,
      type: concept.type,
      category: concept.category,
      relevanceScore: concept.finalScore,
      learningStatus: concept.isLearned ? "reinforcement" : "new",
      reinforcementContext:
        concept.isLearned && concept.daysSinceLastUse !== undefined
          ? {
              lastAppliedDaysAgo: concept.daysSinceLastUse,
              effectivenessRating: 4, // Would come from learning history
              spacedInterval: this.getSpacedIntervalName(concept.daysSinceLastUse),
            }
          : undefined,
      rationaleForInclusion: this.generateRationale(concept, goalDescription),
      suggestedFocus: this.generateSuggestedFocus(concept, goalDescription),
    }));

    return {
      goalDescription,
      totalSteps: steps.length,
      estimatedDuration: `${steps.length} weeks`,
      learningMixSummary: {
        newConcepts,
        reinforcementConcepts,
        expansionPercentage: (newConcepts / steps.length) * 100,
      },
      steps,
    };
  }

  private getSpacedIntervalName(days: number): string {
    if (days <= 1) return "1-day review";
    if (days <= 3) return "3-day review";
    if (days <= 7) return "7-day review";
    if (days <= 30) return "30-day review";
    return "90-day review";
  }

  private generateRationale(concept: ScoredKnowledgeContent, goal: string): string {
    if (concept.isLearned) {
      const interval = this.getSpacedIntervalName(concept.daysSinceLastUse || 0);
      return `Reinforcing your understanding of ${concept.title} at the optimal ${interval} interval. This concept directly applies to "${goal}" and building on your previous experience will accelerate your progress.`;
    }

    // Generate specific rationales based on concept type and goal
    const goalLower = goal.toLowerCase();

    if (concept.type === "cognitive-bias") {
      return `Understanding ${concept.title} helps you recognize when ${concept.summary.toLowerCase()} This awareness is crucial for ${goal} because it prevents self-sabotage and improves decision quality.`;
    }

    if (concept.type === "mental-model") {
      return `${concept.title} provides a framework for ${concept.summary.toLowerCase()} This mental model directly supports ${goal} by giving you a systematic approach to tackle challenges.`;
    }

    return `Learning ${concept.title} equips you with ${concept.summary.toLowerCase()} This is essential for ${goal} as it addresses the root causes of your challenge.`;
  }

  private generateSuggestedFocus(concept: ScoredKnowledgeContent, goal: string): string {
    const goalLower = goal.toLowerCase();

    // Extract key action words from goal
    const actionPatterns = {
      procrastination: ["when you feel the urge to delay", "at the start of important tasks"],
      decision: ["before making choices", "when analyzing options"],
      productivity: ["during work sessions", "when planning your day"],
      relationship: ["in conversations", "during conflicts"],
      learning: ["when studying", "while practicing"],
      confidence: ["in challenging situations", "when self-doubt arises"],
    };

    let context = "";
    for (const [key, patterns] of Object.entries(actionPatterns)) {
      if (goalLower.includes(key)) {
        context = patterns[0];
        break;
      }
    }

    if (concept.isLearned) {
      return `Notice how ${concept.title} manifests ${context || "in your daily life"} and document one new insight about its application to ${goal}.`;
    }

    if (concept.type === "cognitive-bias") {
      return `Spot instances of ${concept.title} ${context || "throughout your day"} and practice the countermeasures in your specific context of ${goal}.`;
    }

    return `Create a specific if-then plan using ${concept.title} ${context || "in relevant situations"} to directly address ${goal}.`;
  }

  private async generateAdvancedSynthesisRoadmap(
    goalInput: UserGoalInput,
    learningHistory: UserLearningHistory
  ): Promise<GeneratedRoadmap> {
    // For advanced users, create synthesis roadmaps that combine multiple learned concepts
    const learnedConceptsMap = new Map(
      learningHistory.learnedConcepts.map((concept) => [concept.knowledgeContentId, concept])
    );

    // Find the user's most effective concepts
    const topConcepts = learningHistory.learnedConcepts
      .filter((c) => c.effectivenessRating >= 4)
      .sort((a, b) => {
        // Sort by effectiveness and recency
        const scoreA =
          a.effectivenessRating * 10 + 1 / (Date.now() - new Date(a.lastReflectionAt).getTime());
        const scoreB =
          b.effectivenessRating * 10 + 1 / (Date.now() - new Date(b.lastReflectionAt).getTime());
        return scoreB - scoreA;
      })
      .slice(0, 20);

    // Create synthetic combinations
    const syntheticConcepts: ScoredKnowledgeContent[] = [];

    // Get all knowledge content from database
    const allContent = await this.supabaseService.getKnowledgeContent();

    // Find concepts that can be combined
    const mentalModels = allContent.filter(
      (c) =>
        c.type === "mental-model" &&
        learnedConceptsMap.has(c.id) &&
        topConcepts.some((tc) => tc.knowledgeContentId === c.id)
    );

    const biases = allContent.filter(
      (c) =>
        (c.type === "cognitive-bias" || c.type === "logical-fallacy") &&
        learnedConceptsMap.has(c.id) &&
        topConcepts.some((tc) => tc.knowledgeContentId === c.id)
    );

    // Create advanced combinations
    for (let i = 0; i < Math.min(3, mentalModels.length); i++) {
      for (let j = 0; j < Math.min(2, biases.length); j++) {
        const model = mentalModels[i];
        const bias = biases[j];

        // Create a synthetic concept that combines both
        const syntheticConcept: ScoredKnowledgeContent = {
          id: `synthesis-${model.id}-${bias.id}`,
          title: `${model.title} + ${bias.title} Synthesis`,
          category: "Advanced Synthesis",
          type: "mental-model",
          summary: `Advanced application combining ${model.title} with awareness of ${bias.title}`,
          description: `This synthesis challenges you to apply ${model.title} while actively countering ${bias.title}. This creates a more robust thinking framework.`,
          application: `Use ${model.title} as your primary framework, but at each decision point, check for ${bias.title} influence.`,
          keywords: [...model.keywords, ...bias.keywords, "synthesis", "advanced"],
          embedding: model.embedding, // Use the model's embedding as base
          finalScore: 0.9,
          semanticSimilarity: 0.8,
          categoryAlignment: 0.8,
          typeDiversityBonus: 0.8,
          goalExampleMatch: 0.7,
          noveltyScore: 0.15,
          spacedRepetitionScore: 0,
          isLearned: false,
        };

        syntheticConcepts.push(syntheticConcept);
      }
    }

    // Add meta-learning concepts
    const metaConcepts: ScoredKnowledgeContent[] = [
      {
        id: "meta-pattern-recognition",
        title: "Cross-Domain Pattern Recognition",
        category: "Meta-Learning",
        type: "mental-model",
        summary: "Identifying how mental models from one domain apply to another",
        description:
          "You've learned many mental models. This meta-skill helps you recognize when a model from one area (like physics) can solve problems in another (like business).",
        application:
          "When facing a new problem, scan your mental model library and ask: 'What does this remind me of from a completely different field?'",
        keywords: ["meta-learning", "transfer", "patterns"],
        embedding: new Array(1536).fill(0.5),
        finalScore: 0.85,
        semanticSimilarity: 0.7,
        categoryAlignment: 0.7,
        typeDiversityBonus: 0.7,
        goalExampleMatch: 0.6,
        noveltyScore: 0.15,
        spacedRepetitionScore: 0,
        isLearned: false,
      },
      {
        id: "meta-model-stacking",
        title: "Mental Model Stacking",
        category: "Meta-Learning",
        type: "mental-model",
        summary: "Using multiple mental models simultaneously for deeper insights",
        description:
          "Advanced practitioners don't just use one mental model at a time. Learn to layer multiple models to get multi-dimensional perspectives on problems.",
        application:
          "Take any decision and run it through 3-5 different mental models. Look for where they agree, disagree, and what unique insights each provides.",
        keywords: ["meta-learning", "synthesis", "multi-model"],
        embedding: new Array(1536).fill(0.5),
        finalScore: 0.85,
        semanticSimilarity: 0.7,
        categoryAlignment: 0.7,
        typeDiversityBonus: 0.7,
        goalExampleMatch: 0.6,
        noveltyScore: 0.15,
        spacedRepetitionScore: 0,
        isLearned: false,
      },
    ];

    // Combine and select the best synthesis concepts
    const allAdvancedConcepts = [...syntheticConcepts, ...metaConcepts]
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 7);

    // Create the advanced roadmap
    const steps: RoadmapStep[] = allAdvancedConcepts.map((concept, index) => ({
      order: index + 1,
      knowledgeContentId: concept.id,
      title: concept.title,
      type: concept.type,
      category: concept.category,
      relevanceScore: concept.finalScore,
      learningStatus: "new",
      rationaleForInclusion: `As an advanced learner with ${learningHistory.learnedConcepts.length} concepts mastered, this synthesis helps you combine and transcend individual models for "${goalInput.goalDescription}"`,
      suggestedFocus: `Apply this advanced synthesis to ${goalInput.goalDescription} by combining multiple perspectives you've already mastered`,
    }));

    return {
      goalDescription: `Advanced Synthesis: ${goalInput.goalDescription}`,
      totalSteps: steps.length,
      estimatedDuration: `${steps.length * 2} weeks`, // Longer duration for synthesis
      learningMixSummary: {
        newConcepts: steps.length,
        reinforcementConcepts: 0,
        expansionPercentage: 100,
      },
      steps,
    };
  }
}
