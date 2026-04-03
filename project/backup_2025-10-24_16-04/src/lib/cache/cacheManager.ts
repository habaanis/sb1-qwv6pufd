interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

class CacheManager {
  private cache: Map<string, CacheItem<any>>;
  private defaultTTL: number;
  private maxSize: number;
  private stats: { hits: number; misses: number };

  constructor(defaultTTL: number = 5 * 60 * 1000, maxSize: number = 100) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    this.maxSize = maxSize;
    this.stats = { hits: 0, misses: 0 };

    this.loadFromSessionStorage();
    this.startCleanupInterval();
  }

  private generateKey(prefix: string, params: any): string {
    return `${prefix}:${JSON.stringify(params)}`;
  }

  get<T>(key: string): T | null {
    this.cleanup();

    const item = this.cache.get(key);

    if (!item) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.data as T;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt
    });

    if (this.cache.size > this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.saveToSessionStorage();
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.saveToSessionStorage();
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
    sessionStorage.removeItem('dalil_cache');
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      this.saveToSessionStorage();
    }
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, 60 * 1000); // Nettoyage toutes les minutes
  }

  private saveToSessionStorage(): void {
    try {
      const cacheData: Array<[string, CacheItem<any>]> = [];

      for (const [key, value] of this.cache.entries()) {
        if (Date.now() < value.expiresAt) {
          cacheData.push([key, value]);
        }
      }

      sessionStorage.setItem('dalil_cache', JSON.stringify({
        data: cacheData,
        stats: this.stats
      }));
    } catch (error) {
      console.warn('Failed to save cache to sessionStorage:', error);
    }
  }

  private loadFromSessionStorage(): void {
    try {
      const cached = sessionStorage.getItem('dalil_cache');
      if (!cached) return;

      const { data, stats } = JSON.parse(cached);

      const now = Date.now();
      data.forEach(([key, item]: [string, CacheItem<any>]) => {
        if (now < item.expiresAt) {
          this.cache.set(key, item);
        }
      });

      if (stats) {
        this.stats = stats;
      }
    } catch (error) {
      console.warn('Failed to load cache from sessionStorage:', error);
      sessionStorage.removeItem('dalil_cache');
    }
  }

  invalidateByPrefix(prefix: string): number {
    let count = 0;
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      count++;
    });

    if (count > 0) {
      this.saveToSessionStorage();
    }

    return count;
  }

  getByPrefix(prefix: string): Array<{ key: string; data: any }> {
    const results: Array<{ key: string; data: any }> = [];

    for (const [key, item] of this.cache.entries()) {
      if (key.startsWith(prefix) && Date.now() < item.expiresAt) {
        results.push({ key, data: item.data });
      }
    }

    return results;
  }
}

export const cacheManager = new CacheManager(5 * 60 * 1000, 100);

export function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cacheManager.get<T>(key);

  if (cached !== null) {
    return Promise.resolve(cached);
  }

  return fetcher().then(data => {
    cacheManager.set(key, data, ttl);
    return data;
  });
}

export function clearSearchCache(): void {
  cacheManager.invalidateByPrefix('search:');
  cacheManager.invalidateByPrefix('suggestions:');
}

export function clearAllCache(): void {
  cacheManager.clear();
}

export function getCacheStats(): CacheStats {
  return cacheManager.getStats();
}
