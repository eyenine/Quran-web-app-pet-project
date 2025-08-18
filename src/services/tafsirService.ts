// Tafsir Service - Main interface for Tafsir functionality
import { TafsirSource, AyahTafsir, SurahInfo, AyahKey, TafsirProvider } from '../types/tafsir';
import { quranComProvider } from './providers/qurancom';
import { quranCache } from '../cache/db';

export class TafsirService {
  private static instance: TafsirService;
  private currentProvider: TafsirProvider = 'qurancom';

  private constructor() {}

  static getInstance(): TafsirService {
    if (!TafsirService.instance) {
      TafsirService.instance = new TafsirService();
    }
    return TafsirService.instance;
  }

  // Set the current provider
  setProvider(provider: TafsirProvider): void {
    this.currentProvider = provider;
  }

  // Get current provider
  getCurrentProvider(): TafsirProvider {
    return this.currentProvider;
  }

  // Get Tafsir sources with caching
  async getTafsirSources(language: string = 'en'): Promise<TafsirSource[]> {
    try {
      // Try cache first
      const cached = await quranCache.getCachedTafsirSources(language);
      if (cached) {
        console.log('Tafsir sources served from cache');
        return cached;
      }

      // Fetch from provider
      let sources: TafsirSource[] = [];
      
      switch (this.currentProvider) {
        case 'qurancom':
          sources = await quranComProvider.getTafsirSources(language);
          break;
        // Add other providers here
        default:
          sources = await quranComProvider.getTafsirSources(language);
      }

      // Cache the results
      await quranCache.cacheTafsirSources(language, sources);
      
      return sources;
    } catch (error) {
      console.error('Error getting Tafsir sources:', error);
      throw error;
    }
  }

  // Get Tafsir for a specific ayah with caching
  async getAyahTafsir(
    ayahKey: AyahKey, 
    tafsirId: number
  ): Promise<AyahTafsir | null> {
    try {
      // Try cache first
      const cached = await quranCache.getCachedAyahTafsir(ayahKey, tafsirId);
      if (cached) {
        console.log(`Ayah Tafsir for ${ayahKey} served from cache`);
        return cached;
      }

      // Fetch from provider
      let tafsir: AyahTafsir | null = null;
      
      switch (this.currentProvider) {
        case 'qurancom':
          tafsir = await quranComProvider.getAyahTafsir(ayahKey, tafsirId);
          break;
        // Add other providers here
        default:
          tafsir = await quranComProvider.getAyahTafsir(ayahKey, tafsirId);
      }

      // Cache the result if found
      if (tafsir) {
        await quranCache.cacheAyahTafsir(ayahKey, tafsirId, tafsir);
      }
      
      return tafsir;
    } catch (error) {
      console.error(`Error getting Tafsir for ${ayahKey}:`, error);
      throw error;
    }
  }

  // Get Tafsir for entire Surah with caching
  async getSurahTafsir(
    surahId: number, 
    tafsirId: number
  ): Promise<AyahTafsir[]> {
    try {
      // Try cache first
      const cached = await quranCache.getCachedSurahTafsir(surahId, tafsirId);
      if (cached) {
        console.log(`Surah Tafsir for ${surahId} served from cache`);
        return cached;
      }

      // Fetch from provider
      let tafsirs: AyahTafsir[] = [];
      
      switch (this.currentProvider) {
        case 'qurancom':
          tafsirs = await quranComProvider.getSurahTafsir(surahId, tafsirId);
          break;
        // Add other providers here
        default:
          tafsirs = await quranComProvider.getSurahTafsir(surahId, tafsirId);
      }

      // Cache the results
      await quranCache.cacheSurahTafsir(surahId, tafsirId, tafsirs);
      
      return tafsirs;
    } catch (error) {
      console.error(`Error getting Surah Tafsir for ${surahId}:`, error);
      throw error;
    }
  }

  // Get Surah information with caching
  async getSurahInfo(
    surahId: number, 
    language: string = 'en'
  ): Promise<SurahInfo | null> {
    try {
      // Try cache first
      const cached = await quranCache.getCachedSurahInfo(surahId);
      if (cached) {
        console.log(`Surah info for ${surahId} served from cache`);
        return cached;
      }

      // Fetch from provider
      let info: SurahInfo | null = null;
      
      switch (this.currentProvider) {
        case 'qurancom':
          info = await quranComProvider.getSurahInfo(surahId, language);
          break;
        // Add other providers here
        default:
          info = await quranComProvider.getSurahInfo(surahId, language);
      }

      // Cache the result if found
      if (info) {
        await quranCache.cacheSurahInfo(surahId, info);
      }
      
      return info;
    } catch (error) {
      console.error(`Error getting Surah info for ${surahId}:`, error);
      throw error;
    }
  }

  // Get default Tafsir ID based on language
  getDefaultTafsirId(language: string = 'en'): number {
    // Use working Tafsir IDs based on language
    switch (language) {
      case 'en':
        return 169; // Ibn Kathir (Abridged) - English
      case 'bangla':
        return 381; // Tafsir Fathul Majid - Bengali
      case 'ar':
        return 16; // Tafsir Muyassar - Arabic
      case 'urdu':
        return 157; // Fi Zilal al-Quran - Urdu
      default:
        return 169; // Default to English Ibn Kathir
    }
  }

  // Get Tafsir sources filtered by language
  async getTafsirSourcesByLanguage(language: string): Promise<TafsirSource[]> {
    const allSources = await this.getTafsirSources();
    return allSources.filter(source => source.lang === language);
  }

  // Search Tafsir content (if provider supports it)
  async searchTafsir(
    query: string, 
    language: string = 'en',
    tafsirId?: number
  ): Promise<AyahTafsir[]> {
    try {
      // This is a placeholder - not all providers support Tafsir search
      // For now, we'll return empty array
      console.warn('Tafsir search not yet implemented for current provider');
      return [];
    } catch (error) {
      console.error('Error searching Tafsir:', error);
      throw error;
    }
  }

  // Get Tafsir statistics
  async getTafsirStats(): Promise<{
    totalSources: number;
    languages: string[];
    totalCached: number;
  }> {
    try {
      const allSources = await this.getTafsirSources();
      const languages = Array.from(new Set(allSources.map(s => s.lang)));
      const cacheStats = await quranCache.getCacheStats();

      return {
        totalSources: allSources.length,
        languages,
        totalCached: cacheStats.totalEntries,
      };
    } catch (error) {
      console.error('Error getting Tafsir stats:', error);
      return {
        totalSources: 0,
        languages: [],
        totalCached: 0,
      };
    }
  }

  // Clear Tafsir cache
  async clearTafsirCache(): Promise<void> {
    try {
      await quranCache.clearCache();
      console.log('Tafsir cache cleared successfully');
    } catch (error) {
      console.error('Error clearing Tafsir cache:', error);
      throw error;
    }
  }

  // Get cache statistics
  async getCacheStats() {
    return quranCache.getCacheStats();
  }
}

// Export singleton instance
export const tafsirService = TafsirService.getInstance();
