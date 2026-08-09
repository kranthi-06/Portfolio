/**
 * Safe execution wrapper for external service calls.
 * Provides timeout, automatic retries with exponential backoff, and robust error handling.
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  timeoutMs?: number;
  backoffFactor?: number;
  // Determine if an error is retryable (e.g., 5xx errors, network timeouts, but NOT 4xx errors)
  shouldRetry?: (error: unknown) => boolean;
}

export class TimeoutError extends Error {
  constructor(message = "Operation timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}

const defaultShouldRetry = (error: unknown): boolean => {
  if (error instanceof TimeoutError) return true;
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    // Do not retry known safe failures like validation or auth
    if (msg.includes("unauthorized") || msg.includes("forbidden") || msg.includes("validation")) {
      return false;
    }
  }
  return true; // Default to retry for unknown errors
};

/**
 * Execute an async function with timeout and exponential backoff retry.
 * 
 * @param operation The async function to execute
 * @param options Configuration for retries and timeouts
 * @returns The result of the operation
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 500,
    maxDelayMs = 5000,
    timeoutMs = 10000,
    backoffFactor = 2,
    shouldRetry = defaultShouldRetry,
  } = options;

  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt <= maxRetries) {
    try {
      return await executeWithTimeout(operation(), timeoutMs);
    } catch (error) {
      attempt++;
      
      if (attempt > maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 200 - 100; // ±100ms
      const sleepTime = Math.min(delay, maxDelayMs) + jitter;
      
      console.warn(`[Retry ${attempt}/${maxRetries}] Operation failed, retrying in ${Math.round(sleepTime)}ms...`, { error: (error as Error).message });
      
      await new Promise((resolve) => setTimeout(resolve, Math.max(0, sleepTime)));
      
      // Exponential backoff
      delay *= backoffFactor;
    }
  }
  
  throw new Error("Unreachable");
}

function executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new TimeoutError(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}
