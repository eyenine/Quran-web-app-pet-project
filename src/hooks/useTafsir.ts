// React hooks for Tafsir functionality
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tafsirService } from '../services/tafsirService';
import { TafsirSource, AyahTafsir, SurahInfo, AyahKey } from '../types/tafsir';
import { useLanguage } from '../context/LanguageContext';

// Query keys for React Query
export const tafsirQueryKeys = {
  sources: (lang: string) => ['tafsir', 'sources', lang],
  ayahTafsir: (ayahKey: AyahKey, tafsirId: number) => 
    ['tafsir', 'ayah', ayahKey, tafsirId],
  surahTafsir: (surahId: number, tafsirId: number) => 
    ['tafsir', 'surah', surahId, tafsirId],
  surahInfo: (surahId: number, lang: string) => 
    ['tafsir', 'surahInfo', surahId, lang],
  stats: () => ['tafsir', 'stats'],
} as const;

// Hook to get Tafsir sources
export const useTafsirSources = (language?: string) => {
  const { language: currentLang } = useLanguage();
  const lang = language || currentLang;

  return useQuery({
    queryKey: tafsirQueryKeys.sources(lang),
    queryFn: () => tafsirService.getTafsirSources(lang),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 2,
    retryDelay: 1000,
  });
};

// Hook to get Tafsir for a specific ayah
export const useAyahTafsir = (
  ayahKey: AyahKey, 
  tafsirId: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: tafsirQueryKeys.ayahTafsir(ayahKey, tafsirId),
    queryFn: () => tafsirService.getAyahTafsir(ayahKey, tafsirId),
    enabled,
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    gcTime: 30 * 24 * 60 * 60 * 1000, // 30 days
    retry: 2,
    retryDelay: 1000,
  });
};

// Hook to get Tafsir for entire Surah
export const useSurahTafsir = (
  surahId: number, 
  tafsirId: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: tafsirQueryKeys.surahTafsir(surahId, tafsirId),
    queryFn: () => tafsirService.getSurahTafsir(surahId, tafsirId),
    enabled,
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    gcTime: 30 * 24 * 60 * 60 * 1000, // 30 days
    retry: 2,
    retryDelay: 1000,
  });
};

// Hook to get Surah information
export const useSurahInfo = (
  surahId: number, 
  language?: string,
  enabled: boolean = true
) => {
  const { language: currentLang } = useLanguage();
  const lang = language || currentLang;

  return useQuery({
    queryKey: tafsirQueryKeys.surahInfo(surahId, lang),
    queryFn: () => tafsirService.getSurahInfo(surahId, lang),
    enabled,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    retry: 2,
    retryDelay: 1000,
  });
};

// Hook to get Tafsir statistics
export const useTafsirStats = () => {
  return useQuery({
    queryKey: tafsirQueryKeys.stats(),
    queryFn: () => tafsirService.getTafsirStats(),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 2,
    retryDelay: 1000,
  });
};

// Hook to get Tafsir sources filtered by language
export const useTafsirSourcesByLanguage = (language?: string) => {
  const { language: currentLang } = useLanguage();
  const lang = language || currentLang;

  return useQuery({
    queryKey: ['tafsir', 'sourcesByLang', lang],
    queryFn: () => tafsirService.getTafsirSourcesByLanguage(lang),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 2,
    retryDelay: 1000,
  });
};

// Hook to get default Tafsir ID for current language
export const useDefaultTafsirId = (language?: string) => {
  const { language: currentLang } = useLanguage();
  const lang = language || currentLang;

  return tafsirService.getDefaultTafsirId(lang);
};

// Hook to clear Tafsir cache
export const useClearTafsirCache = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => tafsirService.clearTafsirCache(),
    onSuccess: () => {
      // Invalidate all Tafsir queries
      queryClient.invalidateQueries({ queryKey: ['tafsir'] });
      console.log('Tafsir cache cleared successfully');
    },
    onError: (error) => {
      console.error('Error clearing Tafsir cache:', error);
    },
  });
};

// Hook to get cache statistics
export const useCacheStats = () => {
  return useQuery({
    queryKey: ['tafsir', 'cacheStats'],
    queryFn: () => tafsirService.getCacheStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    retryDelay: 1000,
  });
};

// Hook to search Tafsir content
export const useSearchTafsir = () => {
  return useMutation({
    mutationFn: ({ 
      query, 
      language, 
      tafsirId 
    }: { 
      query: string; 
      language: string; 
      tafsirId?: number; 
    }) => tafsirService.searchTafsir(query, language, tafsirId),
    onError: (error) => {
      console.error('Error searching Tafsir:', error);
    },
  });
};

// Hook to prefetch Tafsir data
export const usePrefetchTafsir = () => {
  const queryClient = useQueryClient();

  const prefetchAyahTafsir = (ayahKey: AyahKey, tafsirId: number) => {
    queryClient.prefetchQuery({
      queryKey: tafsirQueryKeys.ayahTafsir(ayahKey, tafsirId),
      queryFn: () => tafsirService.getAyahTafsir(ayahKey, tafsirId),
      staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  };

  const prefetchSurahTafsir = (surahId: number, tafsirId: number) => {
    queryClient.prefetchQuery({
      queryKey: tafsirQueryKeys.surahTafsir(surahId, tafsirId),
      queryFn: () => tafsirService.getSurahTafsir(surahId, tafsirId),
      staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  };

  const prefetchSurahInfo = (surahId: number, language: string) => {
    queryClient.prefetchQuery({
      queryKey: tafsirQueryKeys.surahInfo(surahId, language),
      queryFn: () => tafsirService.getSurahInfo(surahId, language),
      staleTime: 24 * 60 * 60 * 1000, // 24 hours
    });
  };

  return {
    prefetchAyahTafsir,
    prefetchSurahTafsir,
    prefetchSurahInfo,
  };
};

