// IndexedDB Cache Layer for Quran App
import { get, set, del, keys } from 'idb-keyval';

const CACHE_PREFIX = 'quran_app_';
const CACHE_VERSION = 'v1';

// Cache keys
export const CACHE_KEYS = {
  SURAH_INFO: (id: number) => `${CACHE_PREFIX}surah_info_${id}`,
  SURAH_TAFSIR: (surahId: number, tafsirId: number) => 
    `${CACHE_PREFIX}surah_tafsir_${surahId}_${tafsirId}`,
  AYAH_TAFSIR: (ayahKey: string, tafsirId: number) => 
    `${CACHE_PREFIX}ayah_tafsir_${ayahKey}_${tafsirId}`,
  TAFSIR_SOURCES: (lang: string) => `${CACHE_PREFIX}tafsir_sources_${lang}`,
  SURAH_HISTORY: (surahId: number) => `${CACHE_PREFIX}surah_history_${surahId}`,
  USER_PREFERENCES: 'user_preferences',
} as const;

// Cache expiration times (in milliseconds)
const CACHE_EXPIRY = {
  SURAH_INFO: 24 * 60 * 60 * 1000, // 24 hours
  TAFSIR: 7 * 24 * 60 * 60 * 1000, // 7 days
  SOURCES: 30 * 24 * 60 * 60 * 1000, // 30 days
  HISTORY: 365 * 24 * 60 * 60 * 1000, // 1 year
} as const;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export class QuranCache {
  private static instance: QuranCache;

  private constructor() {}

  static getInstance(): QuranCache {
    if (!QuranCache.instance) {
      QuranCache.instance = new QuranCache();
    }
    return QuranCache.instance;
  }

  // Generic cache methods
  private async setWithExpiry<T>(
    key: string, 
    data: T, 
    expiryMs: number
  ): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: expiryMs,
    };
    await set(key, entry);
  }

  private async getWithExpiry<T>(key: string): Promise<T | null> {
    try {
      const entry = await get<CacheEntry<T>>(key);
      if (!entry) return null;

      const isExpired = Date.now() - entry.timestamp > entry.expiry;
      if (isExpired) {
        await del(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  // Surah Info caching
  async cacheSurahInfo(surahId: number, info: any): Promise<void> {
    const key = CACHE_KEYS.SURAH_INFO(surahId);
    await this.setWithExpiry(key, info, CACHE_EXPIRY.SURAH_INFO);
  }

  async getCachedSurahInfo(surahId: number): Promise<any | null> {
    const key = CACHE_KEYS.SURAH_INFO(surahId);
    return this.getWithExpiry(key);
  }

  // Tafsir caching
  async cacheSurahTafsir(
    surahId: number, 
    tafsirId: number, 
    tafsir: any
  ): Promise<void> {
    const key = CACHE_KEYS.SURAH_TAFSIR(surahId, tafsirId);
    await this.setWithExpiry(key, tafsir, CACHE_EXPIRY.TAFSIR);
  }

  async getCachedSurahTafsir(
    surahId: number, 
    tafsirId: number
  ): Promise<any | null> {
    const key = CACHE_KEYS.SURAH_TAFSIR(surahId, tafsirId);
    return this.getWithExpiry(key);
  }

  async cacheAyahTafsir(
    ayahKey: string, 
    tafsirId: number, 
    tafsir: any
  ): Promise<void> {
    const key = CACHE_KEYS.AYAH_TAFSIR(ayahKey, tafsirId);
    await this.setWithExpiry(key, tafsir, CACHE_EXPIRY.TAFSIR);
  }

  async getCachedAyahTafsir(
    ayahKey: string, 
    tafsirId: number
  ): Promise<any | null> {
    const key = CACHE_KEYS.AYAH_TAFSIR(ayahKey, tafsirId);
    return this.getWithExpiry(key);
  }

  // Tafsir sources caching
  async cacheTafsirSources(lang: string, sources: any[]): Promise<void> {
    const key = CACHE_KEYS.TAFSIR_SOURCES(lang);
    await this.setWithExpiry(key, sources, CACHE_EXPIRY.SOURCES);
  }

  async getCachedTafsirSources(lang: string): Promise<any[] | null> {
    const key = CACHE_KEYS.TAFSIR_SOURCES(lang);
    return this.getWithExpiry(key);
  }

  // Surah history caching
  async cacheSurahHistory(surahId: number, history: any): Promise<void> {
    const key = CACHE_KEYS.SURAH_HISTORY(surahId);
    await this.setWithExpiry(key, history, CACHE_EXPIRY.HISTORY);
  }

  async getCachedSurahHistory(surahId: number): Promise<any | null> {
    const key = CACHE_KEYS.SURAH_HISTORY(surahId);
    return this.getWithExpiry(key);
  }

  // User preferences (no expiry)
  async cacheUserPreferences(prefs: any): Promise<void> {
    await set(CACHE_KEYS.USER_PREFERENCES, prefs);
  }

  async getUserPreferences(): Promise<any | null> {
    return get(CACHE_KEYS.USER_PREFERENCES);
  }

  // Cache management
  async clearCache(): Promise<void> {
    try {
      const allKeys = await keys();
      const quranKeys = allKeys.filter(key => 
        typeof key === 'string' && key.startsWith(CACHE_PREFIX)
      );
      
      for (const key of quranKeys) {
        await del(key);
      }
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      const allKeys = await keys();
      const quranKeys = allKeys.filter(key => 
        typeof key === 'string' && key.startsWith(CACHE_PREFIX)
      );
      return quranKeys.length;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  }

  async getCacheStats(): Promise<{
    totalEntries: number;
    estimatedSize: string;
    oldestEntry?: number;
    newestEntry?: number;
  }> {
    try {
      const allKeys = await keys();
      const quranKeys = allKeys.filter(key => 
        typeof key === 'string' && key.startsWith(CACHE_PREFIX)
      );

      let oldestEntry: number | undefined;
      let newestEntry: number | undefined;

      for (const key of quranKeys) {
        if (typeof key === 'string') {
          const entry = await get<CacheEntry<any>>(key);
          if (entry) {
            if (!oldestEntry || entry.timestamp < oldestEntry) {
              oldestEntry = entry.timestamp;
            }
            if (!newestEntry || entry.timestamp > newestEntry) {
              newestEntry = entry.timestamp;
            }
          }
        }
      }

      // Rough size estimation (each entry ~1KB)
      const estimatedSize = `${(quranKeys.length * 1).toFixed(1)} KB`;

      return {
        totalEntries: quranKeys.length,
        estimatedSize,
        oldestEntry,
        newestEntry,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { totalEntries: 0, estimatedSize: '0 KB' };
    }
  }
}

// Export singleton instance
export const quranCache = QuranCache.getInstance();

