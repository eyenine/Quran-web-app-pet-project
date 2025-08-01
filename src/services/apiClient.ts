import { ApiResponse } from '../types';

// Base API configuration
const API_BASE_URL = 'https://api.quran.com/api/v4';
// Enable request compression
const DEFAULT_HEADERS = {
  'Accept-Encoding': 'gzip, deflate',
  'Accept': 'application/json',
};

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 10000;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Base delay in milliseconds

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Utility function to create delay
const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// Exponential backoff calculation
const calculateBackoffDelay = (attempt: number, baseDelay: number): number => {
  return baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
};

// Check if error is retryable
const isRetryableError = (error: unknown): boolean => {
  if (error instanceof ApiError) {
    // Retry on network errors or 5xx server errors
    return !error.status || error.status >= 500;
  }
  
  if (error instanceof TypeError && error.message.includes('fetch')) {
    // Network error
    return true;
  }
  
  return false;
};

// Main API client function with retry logic
async function apiRequest<T>(
  endpoint: string, 
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  // Combine default headers with user-provided headers
  const headers = {
    ...DEFAULT_HEADERS,
    ...options.headers
  };
  const {
    method = 'GET',
    body,
    timeout = REQUEST_TIMEOUT
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if response is ok
      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response
        );
      }

      // Parse JSON response
      const data = await response.json();

      return {
        data,
        status: response.status,
        message: 'Success'
      };

    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt
      if (attempt === MAX_RETRIES) {
        break;
      }

      // Check if error is retryable
      if (!isRetryableError(error)) {
        break;
      }

      // Calculate delay for next attempt
      const delayMs = calculateBackoffDelay(attempt, RETRY_DELAY);
      console.warn(`API request failed (attempt ${attempt}/${MAX_RETRIES}), retrying in ${delayMs}ms...`, error);
      
      await delay(delayMs);
    }
  }

  // All retries failed, throw the last error
  if (lastError instanceof ApiError) {
    throw lastError;
  }
  
  if (lastError instanceof Error) {
    throw new ApiError(`Network error: ${lastError.message}`);
  }
  
  throw new ApiError('Unknown API error occurred');
}

// Cached GET request with sessionStorage
async function cachedApiRequest<T>(
  endpoint: string,
  cacheKey: string,
  cacheDuration: number = 300000 // 5 minutes default
): Promise<ApiResponse<T>> {
  try {
    // Check cache first
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      if (now - timestamp < cacheDuration) {
        return {
          data,
          status: 200,
          message: 'From cache'
        };
      }
    }
  } catch (error) {
    console.warn('Cache read error:', error);
  }

  // Make API request
  const response = await apiRequest<T>(endpoint);
  
  // Cache the response
  try {
    const cacheData = {
      data: response.data,
      timestamp: Date.now()
    };
    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Cache write error:', error);
  }

  return response;
}

// Export the main functions
export { apiRequest, cachedApiRequest, ApiError };

// Request debouncing utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T => {
  let timeoutId: NodeJS.Timeout;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), wait);
  } as T;
};

// Request throttling utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  return function (this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  } as T;
};

// Health check function
export async function checkApiHealth(): Promise<boolean> {
  try {
    await apiRequest('/chapters', { timeout: 5000 });
    return true;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}