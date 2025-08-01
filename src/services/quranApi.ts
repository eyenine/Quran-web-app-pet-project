import { 
  Surah, 
  Ayah, 
  QuranApiChapter, 
  QuranApiVerse,
  ApiResponse 
} from '../types';
import { 
  transformQuranApiChapterToSurah, 
  transformQuranApiVerseToAyah 
} from '../utils';
import { cachedApiRequest, apiRequest } from './apiClient';

// Translation IDs for different languages
const TRANSLATION_IDS = {
  english: 20, // Sahih International (more widely available)
  bangla: 161,  // Muhiuddin Khan
} as const;

// Reciter ID for audio
const RECITER_ID = 7; // Mishary Rashid Alafasy

// Cache durations (in milliseconds)
const CACHE_DURATIONS = {
  chapters: 24 * 60 * 60 * 1000, // 24 hours
  verses: 60 * 60 * 1000,        // 1 hour
  translations: 60 * 60 * 1000,   // 1 hour
} as const;

/**
 * Fetch all Surahs (chapters) from the API
 */
export async function fetchSurahs(): Promise<Surah[]> {
  try {
    const response = await cachedApiRequest<{ chapters: QuranApiChapter[] }>(
      '/chapters',
      'quran_chapters',
      CACHE_DURATIONS.chapters
    );

    return response.data.chapters.map(transformQuranApiChapterToSurah);
  } catch (error) {
    console.error('Error fetching Surahs:', error);
    throw new Error('Failed to fetch Surahs. Please check your internet connection.');
  }
}

/**
 * Fetch a specific Surah by ID
 */
export async function fetchSurah(surahId: number): Promise<Surah | null> {
  try {
    const response = await cachedApiRequest<{ chapter: QuranApiChapter }>(
      `/chapters/${surahId}`,
      `quran_chapter_${surahId}`,
      CACHE_DURATIONS.chapters
    );

    return transformQuranApiChapterToSurah(response.data.chapter);
  } catch (error) {
    console.error(`Error fetching Surah ${surahId}:`, error);
    return null;
  }
}

/**
 * Fetch verses for a specific Surah
 */
export async function fetchSurahVerses(
  surahId: number,
  includeTranslations: boolean = true
): Promise<Ayah[]> {
  try {
    let endpoint = `/verses/by_chapter/${surahId}`;
    
    if (includeTranslations) {
      const translationIds = [TRANSLATION_IDS.english, TRANSLATION_IDS.bangla].join(',');
      endpoint += `?translations=${translationIds}&fields=text_uthmani,chapter_id,verse_number,juz_number&per_page=300`;
    } else {
      endpoint += `?fields=text_uthmani,chapter_id,verse_number,juz_number&per_page=300`;
    }

    const response = await cachedApiRequest<{ verses: QuranApiVerse[] }>(
      endpoint,
      `quran_verses_${surahId}_${includeTranslations}`,
      CACHE_DURATIONS.verses
    );

    console.log(`Fetched ${response.data.verses.length} verses for Surah ${surahId}`);
    console.log('First verse sample:', response.data.verses[0]);
    
    // Debug: Check if chapter_id is missing in any verses
    const versesWithoutChapterId = response.data.verses.filter(v => !v.chapter_id);
    if (versesWithoutChapterId.length > 0) {
      console.warn(`Found ${versesWithoutChapterId.length} verses without chapter_id:`, versesWithoutChapterId.slice(0, 3));
    }

    return response.data.verses.map(verse => {
      const englishTranslation = verse.translations?.find(
        t => t.resource_id === TRANSLATION_IDS.english
      )?.text || '';
      
      const banglaTranslation = verse.translations?.find(
        t => t.resource_id === TRANSLATION_IDS.bangla
      )?.text || '';

      if (verse.verse_number <= 3) {
        console.log(`Verse ${verse.verse_number}:`);
        console.log(`  Arabic: "${verse.text_uthmani?.substring(0, 50)}..."`);
        console.log(`  English: "${englishTranslation?.substring(0, 50)}..."`);
        console.log(`  Bangla: "${banglaTranslation?.substring(0, 50)}..."`);
        console.log(`  Translations array:`, verse.translations);
      }

      return transformQuranApiVerseToAyah(verse, englishTranslation, banglaTranslation);
    });
  } catch (error) {
    console.error(`Error fetching verses for Surah ${surahId}:`, error);
    throw new Error(`Failed to fetch verses for Surah ${surahId}. Please try again.`);
  }
}

/**
 * Fetch a specific verse by Surah and Ayah number
 */
export async function fetchVerse(
  surahId: number, 
  ayahNumber: number,
  includeTranslations: boolean = true
): Promise<Ayah | null> {
  try {
    let endpoint = `/verses/by_key/${surahId}:${ayahNumber}`;
    
    if (includeTranslations) {
      const translationIds = [TRANSLATION_IDS.english, TRANSLATION_IDS.bangla].join(',');
      endpoint += `?translations=${translationIds}&fields=text_uthmani,chapter_id,verse_number,juz_number`;
    }

    const response = await cachedApiRequest<{ verse: QuranApiVerse }>(
      endpoint,
      `quran_verse_${surahId}_${ayahNumber}_${includeTranslations}`,
      CACHE_DURATIONS.verses
    );

    const verse = response.data.verse;
    const englishTranslation = verse.translations?.find(
      t => t.resource_id === TRANSLATION_IDS.english
    )?.text || '';
    
    const banglaTranslation = verse.translations?.find(
      t => t.resource_id === TRANSLATION_IDS.bangla
    )?.text || '';

    return transformQuranApiVerseToAyah(verse, englishTranslation, banglaTranslation);
  } catch (error) {
    console.error(`Error fetching verse ${surahId}:${ayahNumber}:`, error);
    return null;
  }
}

/**
 * Fetch verses for a specific Juz (Para)
 */
export async function fetchJuzVerses(
  juzNumber: number,
  includeTranslations: boolean = true
): Promise<Ayah[]> {
  try {
    let allVerses: QuranApiVerse[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      let endpoint = `/verses/by_juz/${juzNumber}`;
      const params = [
        includeTranslations
          ? `translations=${[TRANSLATION_IDS.english, TRANSLATION_IDS.bangla].join(',')}`
          : '',
        'fields=text_uthmani,chapter_id,verse_number,juz_number',
        'per_page=300',
        `page=${page}`
      ].filter(Boolean).join('&');
      endpoint += `?${params}`;

      const response = await cachedApiRequest<{ verses: QuranApiVerse[]; meta?: { total_pages?: number } }>(
        endpoint,
        `quran_juz_${juzNumber}_${includeTranslations}_page_${page}`,
        CACHE_DURATIONS.verses
      );
      allVerses = allVerses.concat(response.data.verses);
      totalPages = response.data.meta?.total_pages || 1;
      page++;
    } while (page <= totalPages);

    return allVerses.map(verse => {
      const englishTranslation = verse.translations?.find(
        t => t.resource_id === TRANSLATION_IDS.english
      )?.text || '';
      const banglaTranslation = verse.translations?.find(
        t => t.resource_id === TRANSLATION_IDS.bangla
      )?.text || '';
      return transformQuranApiVerseToAyah(verse, englishTranslation, banglaTranslation);
    });
  } catch (error) {
    console.error(`Error fetching Juz ${juzNumber}:`, error);
    throw new Error(`Failed to fetch Juz ${juzNumber}. Please try again.`);
  }
}

/**
 * Get audio URL for a specific verse
 */
export function getVerseAudioUrl(surahId: number, ayahNumber: number): string {
  // Format: https://verses.quran.com/Alafasy/mp3/001001.mp3
  const paddedSurah = surahId.toString().padStart(3, '0');
  const paddedAyah = ayahNumber.toString().padStart(3, '0');
  return `https://verses.quran.com/Alafasy/mp3/${paddedSurah}${paddedAyah}.mp3`;
}

/**
 * Get audio URL for a complete Surah
 */
export function getSurahAudioUrl(surahId: number): string {
  // Format: https://download.quranicaudio.com/quran/mishary_rashid_alafasy/001.mp3
  const paddedSurah = surahId.toString().padStart(3, '0');
  return `https://download.quranicaudio.com/quran/mishary_rashid_alafasy/${paddedSurah}.mp3`;
}

/**
 * Search verses by text (this would need to be implemented with a search endpoint)
 * For now, this is a placeholder that searches locally
 */
export async function searchVerses(
  query: string,
  language: 'arabic' | 'english' | 'bangla' = 'english'
): Promise<Ayah[]> {
  // This is a simplified search - in a real implementation,
  // you would use the API's search endpoint or implement full-text search
  console.warn('Search functionality not yet implemented with API');
  return [];
}

/**
 * Get random verse for daily Ayah feature
 */
export async function getRandomVerse(): Promise<Ayah | null> {
  try {
    // Generate random Surah (1-114) and verse number
    const randomSurah = Math.floor(Math.random() * 114) + 1;
    
    // First, get the Surah info to know how many verses it has
    const surah = await fetchSurah(randomSurah);
    if (!surah) return null;
    
    const randomAyah = Math.floor(Math.random() * surah.ayahCount) + 1;
    
    return await fetchVerse(randomSurah, randomAyah);
  } catch (error) {
    console.error('Error fetching random verse:', error);
    return null;
  }
}

/**
 * Preload critical data for better performance
 */
export async function preloadCriticalData(): Promise<void> {
  try {
    // Preload all Surahs
    await fetchSurahs();
    
    // Preload first Surah (Al-Fatihah) verses
    await fetchSurahVerses(1);
    
    console.log('Critical data preloaded successfully');
  } catch (error) {
    console.warn('Failed to preload critical data:', error);
  }
}

/**
 * Clear all cached API data
 */
export function clearApiCache(): void {
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('quran_')) {
        sessionStorage.removeItem(key);
      }
    });
    console.log('API cache cleared');
  } catch (error) {
    console.warn('Failed to clear API cache:', error);
  }
}