/**
 * Custom error types for roadmap generation
 */

export class RoadmapGenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any,
    public isRetryable = false
  ) {
    super(message);
    this.name = "RoadmapGenerationError";
  }
}

export class EmbeddingServiceError extends RoadmapGenerationError {
  constructor(message: string, details?: any) {
    super(message, "EMBEDDING_SERVICE_ERROR", details, true);
    this.name = "EmbeddingServiceError";
  }
}

export class DatabaseSearchError extends RoadmapGenerationError {
  constructor(message: string, details?: any) {
    super(message, "DATABASE_SEARCH_ERROR", details, true);
    this.name = "DatabaseSearchError";
  }
}

export class InsufficientContentError extends RoadmapGenerationError {
  constructor(message: string, details?: any) {
    super(message, "INSUFFICIENT_CONTENT", details, false);
    this.name = "InsufficientContentError";
  }
}

export class InvalidGoalError extends RoadmapGenerationError {
  constructor(message: string, details?: any) {
    super(message, "INVALID_GOAL", details, false);
    this.name = "InvalidGoalError";
  }
}

/**
 * Error handler with retry logic
 */
export class RoadmapErrorHandler {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY_MS = 1000;

  /**
   * Execute a function with retry logic
   */
  static async executeWithRetry<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries?: number;
      retryDelay?: number;
      onRetry?: (attempt: number, error: Error) => void;
    } = {}
  ): Promise<T> {
    const maxRetries = options.maxRetries || this.MAX_RETRIES;
    const retryDelay = options.retryDelay || this.RETRY_DELAY_MS;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable
        if (error instanceof RoadmapGenerationError && !error.isRetryable) {
          throw error;
        }

        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Call retry callback if provided
        if (options.onRetry) {
          options.onRetry(attempt, lastError);
        }

        // Wait before retrying with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // If we've exhausted all retries, throw the last error
    throw lastError || new Error("Unknown error during retry");
  }

  /**
   * Log error with context
   */
  static logError(
    error: Error,
    context: {
      userId?: string;
      goal?: string;
      phase?: string;
      [key: string]: any;
    }
  ): void {
    const errorData: {
      name: string;
      message: string;
      stack?: string;
      timestamp: string;
      code?: string;
      details?: any;
      isRetryable?: boolean;
      [key: string]: any;
    } = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context,
    };

    if (error instanceof RoadmapGenerationError) {
      errorData.code = error.code;
      errorData.details = error.details;
      errorData.isRetryable = error.isRetryable;
    }

    // In production, this would send to a monitoring service
    console.error("[RoadmapGenerator] Error:", errorData);
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: Error): string {
    if (error instanceof InvalidGoalError) {
      return error.message;
    }

    if (error instanceof InsufficientContentError) {
      return "We couldn't find enough relevant content for your goal. Please try rephrasing it or being more specific.";
    }

    if (error instanceof EmbeddingServiceError) {
      return "Our AI service is temporarily unavailable. Please try again in a few moments.";
    }

    if (error instanceof DatabaseSearchError) {
      return "We're having trouble searching our knowledge base. Please try again.";
    }

    // Generic fallback
    return "An unexpected error occurred while generating your roadmap. Please try again or contact support if the issue persists.";
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static timers = new Map<string, number>();
  private static metrics = new Map<string, number[]>();

  /**
   * Start timing an operation
   */
  static startTimer(operationName: string): void {
    this.timers.set(operationName, Date.now());
  }

  /**
   * End timing and record the duration
   */
  static endTimer(operationName: string): number {
    const startTime = this.timers.get(operationName);
    if (!startTime) {
      console.warn(`No timer found for operation: ${operationName}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(operationName);

    // Store metric
    if (!this.metrics.has(operationName)) {
      this.metrics.set(operationName, []);
    }
    this.metrics.get(operationName)!.push(duration);

    // Keep only last 100 measurements
    const measurements = this.metrics.get(operationName)!;
    if (measurements.length > 100) {
      measurements.shift();
    }

    return duration;
  }

  /**
   * Get performance statistics for an operation
   */
  static getStats(operationName: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p95: number;
  } | null {
    const measurements = this.metrics.get(operationName);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);

    return {
      count: sorted.length,
      avg: Math.round(sum / sorted.length),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(sorted.length * 0.95)],
    };
  }

  /**
   * Log all performance statistics
   */
  static logAllStats(): void {
    console.log("[PerformanceMonitor] Statistics:");
    for (const [operation, _] of this.metrics) {
      const stats = this.getStats(operation);
      if (stats) {
        console.log(`  ${operation}:`, stats);
      }
    }
  }

  /**
   * Clear all metrics
   */
  static clear(): void {
    this.timers.clear();
    this.metrics.clear();
  }
}
