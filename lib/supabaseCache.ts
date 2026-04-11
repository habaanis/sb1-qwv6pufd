interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SupabaseCache {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  private generateKey(table: string, params: Record<string, any>): string {
    return `supabase_${table}_${JSON.stringify(params)}`;
  }

  get<T>(table: string, params: Record<string, any> = {}): T | null {
    const key = this.generateKey(table, params);
    const entry = this.memoryCache.get(key);

    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(table: string, params: Record<string, any>, data: T, ttl?: number): void {
    const key = this.generateKey(table, params);
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL,
    });
  }

  invalidate(table: string, params?: Record<string, any>): void {
    if (params) {
      const key = this.generateKey(table, params);
      this.memoryCache.delete(key);
    } else {
      const prefix = `supabase_${table}_`;
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(prefix)) {
          this.memoryCache.delete(key);
        }
      }
    }
  }

  clear(): void {
    this.memoryCache.clear();
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.memoryCache.size,
      keys: Array.from(this.memoryCache.keys()),
    };
  }
}

export const supabaseCache = new SupabaseCache();

export function withCache<T>(
  table: string,
  params: Record<string, any>,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = supabaseCache.get<T>(table, params);
  if (cached !== null) {
    return Promise.resolve(cached);
  }

  return fetcher().then((data) => {
    supabaseCache.set(table, params, data, ttl);
    return data;
  });
}
