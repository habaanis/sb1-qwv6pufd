import { supabase } from '../BoltDatabase';
import { logger } from '../logging/distributedLogger';
import { withRateLimit } from '../resilience/rateLimiter';
import { withCircuitBreaker } from '../resilience/circuitBreaker';

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

interface APIRequestOptions {
  useAuth?: boolean;
  rateLimit?: boolean;
  circuitBreaker?: boolean;
  cache?: boolean;
}

class RestAPI {
  private baseURL: string = '';

  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    options: APIRequestOptions = {}
  ): Promise<APIResponse<T>> {
    return this.request('GET', endpoint, undefined, params, options);
  }

  async post<T = any>(
    endpoint: string,
    body?: any,
    options: APIRequestOptions = {}
  ): Promise<APIResponse<T>> {
    return this.request('POST', endpoint, body, undefined, options);
  }

  async put<T = any>(
    endpoint: string,
    body?: any,
    options: APIRequestOptions = {}
  ): Promise<APIResponse<T>> {
    return this.request('PUT', endpoint, body, undefined, options);
  }

  async delete<T = any>(
    endpoint: string,
    options: APIRequestOptions = {}
  ): Promise<APIResponse<T>> {
    return this.request('DELETE', endpoint, undefined, undefined, options);
  }

  private async request<T = any>(
    method: string,
    endpoint: string,
    body?: any,
    params?: Record<string, any>,
    options: APIRequestOptions = {}
  ): Promise<APIResponse<T>> {
    const {
      useAuth = true,
      rateLimit = true,
      circuitBreaker = true,
      cache = false
    } = options;

    const execute = async (): Promise<APIResponse<T>> => {
      try {
        const url = this.buildURL(endpoint, params);
        const headers = await this.buildHeaders(useAuth);

        logger.debug(`API ${method} ${endpoint}`, { params, body });

        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        logger.info(`API ${method} ${endpoint} success`);

        return {
          success: true,
          data
        };
      } catch (error) {
        logger.error(`API ${method} ${endpoint} failed`, error as Error);

        return {
          success: false,
          error: (error as Error).message
        };
      }
    };

    let result: APIResponse<T>;

    if (circuitBreaker && rateLimit) {
      result = await withCircuitBreaker(
        `api-${endpoint}`,
        () => withRateLimit(
          `api-${endpoint}`,
          execute,
          { maxRequests: 100, windowMs: 60000, strategy: 'sliding' }
        )
      );
    } else if (circuitBreaker) {
      result = await withCircuitBreaker(`api-${endpoint}`, execute);
    } else if (rateLimit) {
      result = await withRateLimit(
        `api-${endpoint}`,
        execute,
        { maxRequests: 100, windowMs: 60000, strategy: 'sliding' }
      );
    } else {
      result = await execute();
    }

    return result;
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL || window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async buildHeaders(useAuth: boolean): Promise<Headers> {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });

    if (useAuth) {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        headers.set('Authorization', `Bearer ${session.access_token}`);
      }
    }

    return headers;
  }

  setBaseURL(url: string): void {
    this.baseURL = url;
  }
}

export const restAPI = new RestAPI();

export async function apiGet<T = any>(
  endpoint: string,
  params?: Record<string, any>,
  options?: APIRequestOptions
): Promise<APIResponse<T>> {
  return restAPI.get<T>(endpoint, params, options);
}

export async function apiPost<T = any>(
  endpoint: string,
  body?: any,
  options?: APIRequestOptions
): Promise<APIResponse<T>> {
  return restAPI.post<T>(endpoint, body, options);
}

export async function apiPut<T = any>(
  endpoint: string,
  body?: any,
  options?: APIRequestOptions
): Promise<APIResponse<T>> {
  return restAPI.put<T>(endpoint, body, options);
}

export async function apiDelete<T = any>(
  endpoint: string,
  options?: APIRequestOptions
): Promise<APIResponse<T>> {
  return restAPI.delete<T>(endpoint, options);
}

if (typeof window !== 'undefined') {
  (window as any).api = restAPI;
}
