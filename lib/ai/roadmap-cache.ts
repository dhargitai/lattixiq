import { LRUCache } from "lru-cache";
import type { KnowledgeSearchResult } from "./roadmap-supabase-service";

/**
 * Cache configuration for roadmap generation
 */
interface CacheConfig {
  // Max items in cache
  max: number;
  // Time to live in milliseconds
  ttl: number;
  // Max memory size in bytes (optional)
  maxSize?: number;
}

/**
 * Cached embedding result
 */
interface CachedEmbedding {
  embedding: number[];
  timestamp: number;
}

/**
 * Cached search results
 */
interface CachedSearchResults {
  results: KnowledgeSearchResult[];
  timestamp: number;
}

/**
 * RoadmapCache provides caching for embeddings and search results
 * to improve performance and reduce API calls
 */
export class RoadmapCache {
  private embeddingCache: LRUCache<string, CachedEmbedding>;
  private searchCache: LRUCache<string, CachedSearchResults>;

  constructor(config?: { embeddings?: Partial<CacheConfig>; search?: Partial<CacheConfig> }) {
    // Default configuration
    const defaultEmbeddingConfig: CacheConfig = {
      max: 100, // Store up to 100 goal embeddings
      ttl: 1000 * 60 * 60 * 24, // 24 hours
    };

    const defaultSearchConfig: CacheConfig = {
      max: 50, // Store up to 50 search results
      ttl: 1000 * 60 * 60, // 1 hour
    };

    // Initialize embedding cache
    this.embeddingCache = new LRUCache<string, CachedEmbedding>({
      max: config?.embeddings?.max || defaultEmbeddingConfig.max,
      ttl: config?.embeddings?.ttl || defaultEmbeddingConfig.ttl,
      sizeCalculation: (value: CachedEmbedding) =>
        // Each float in embedding is ~4 bytes, plus overhead
        value.embedding.length * 4 + 100,
      maxSize: config?.embeddings?.maxSize,
    });

    // Initialize search cache
    this.searchCache = new LRUCache<string, CachedSearchResults>({
      max: config?.search?.max || defaultSearchConfig.max,
      ttl: config?.search?.ttl || defaultSearchConfig.ttl,
      sizeCalculation: (value: CachedSearchResults) =>
        // Rough estimate of memory usage per result
        JSON.stringify(value.results).length,
      maxSize: config?.search?.maxSize,
    });
  }

  /**
   * Generate a cache key for goal embeddings
   */
  private getEmbeddingKey(goalDescription: string): string {
    // Normalize and create a stable key
    const normalized = goalDescription.toLowerCase().trim();
    return `embed:${normalized}`;
  }

  /**
   * Generate a cache key for search results
   */
  private getSearchKey(
    embedding: number[],
    threshold: number,
    count: number,
    learningHistoryHash?: string
  ): string {
    // Create a hash of the embedding for the key
    const embeddingHash = this.hashEmbedding(embedding);
    const historyPart = learningHistoryHash ? `:${learningHistoryHash}` : "";
    return `search:${embeddingHash}:${threshold}:${count}${historyPart}`;
  }

  /**
   * Create a simple hash of an embedding for cache keys
   */
  private hashEmbedding(embedding: number[]): string {
    // Use first and last few values plus length as a simple hash
    if (embedding.length < 10) {
      return embedding.join(",");
    }

    const parts = [
      embedding.slice(0, 3).join(","),
      embedding.length,
      embedding.slice(-3).join(","),
    ];

    return parts.join(":");
  }

  /**
   * Get cached embedding for a goal description
   */
  getEmbedding(goalDescription: string): number[] | null {
    const key = this.getEmbeddingKey(goalDescription);
    const cached = this.embeddingCache.get(key);

    if (cached) {
      return cached.embedding;
    }

    return null;
  }

  /**
   * Store embedding in cache
   */
  setEmbedding(goalDescription: string, embedding: number[]): void {
    const key = this.getEmbeddingKey(goalDescription);
    this.embeddingCache.set(key, {
      embedding,
      timestamp: Date.now(),
    });
  }

  /**
   * Get cached search results
   */
  getSearchResults(
    embedding: number[],
    threshold: number,
    count: number,
    learningHistoryHash?: string
  ): KnowledgeSearchResult[] | null {
    const key = this.getSearchKey(embedding, threshold, count, learningHistoryHash);
    const cached = this.searchCache.get(key);

    if (cached) {
      return cached.results;
    }

    return null;
  }

  /**
   * Store search results in cache
   */
  setSearchResults(
    embedding: number[],
    threshold: number,
    count: number,
    results: KnowledgeSearchResult[],
    learningHistoryHash?: string
  ): void {
    const key = this.getSearchKey(embedding, threshold, count, learningHistoryHash);
    this.searchCache.set(key, {
      results,
      timestamp: Date.now(),
    });
  }

  /**
   * Create a hash of learning history for cache invalidation
   */
  hashLearningHistory(learnedConceptIds: string[]): string {
    if (learnedConceptIds.length === 0) {
      return "empty";
    }

    // Sort to ensure consistent hashing
    const sorted = [...learnedConceptIds].sort();
    return `${sorted.length}:${sorted.slice(0, 5).join(",")}`;
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.embeddingCache.clear();
    this.searchCache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      embeddings: {
        size: this.embeddingCache.size,
        hits: (this.embeddingCache as any).hits || 0, // eslint-disable-line @typescript-eslint/no-explicit-any
        misses: (this.embeddingCache as any).misses || 0, // eslint-disable-line @typescript-eslint/no-explicit-any
      },
      search: {
        size: this.searchCache.size,
        hits: (this.searchCache as any).hits || 0, // eslint-disable-line @typescript-eslint/no-explicit-any
        misses: (this.searchCache as any).misses || 0, // eslint-disable-line @typescript-eslint/no-explicit-any
      },
    };
  }

  /**
   * Prune expired entries
   */
  prune(): void {
    this.embeddingCache.purgeStale();
    this.searchCache.purgeStale();
  }
}

// Export a singleton instance for the application
export const roadmapCache = new RoadmapCache({
  embeddings: {
    max: 100,
    ttl: 1000 * 60 * 60 * 24, // 24 hours
    maxSize: 1000 * 1000 * 10, // 10MB max for embeddings
  },
  search: {
    max: 50,
    ttl: 1000 * 60 * 60, // 1 hour
    maxSize: 1000 * 1000 * 20, // 20MB max for search results
  },
});
