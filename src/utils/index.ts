import { Ayah, Surah, Bookmark, UserPreferences, DailyAyah, QuranApiChapter, QuranApiVerse } from '../types';

// Data validation functions
export const validateAyah = (ayah: any): ayah is Ayah => {
  return (
    typeof ayah === 'object' &&
    ayah !== null &&
    typeof ayah.id === 'number' &&
    typeof ayah.surahId === 'number' &&
    typeof ayah.ayahNumber === 'number' &&
    typeof ayah.arabic === 'string' &&
    typeof ayah.english === 'string' &&
    typeof ayah.bangla === 'string' &&
    typeof ayah.audioUrl === 'string' &&
    typeof ayah.juzNumber === 'number'
  );
};

export const validateSurah = (surah: any): surah is Surah => {
  return (
    typeof surah === 'object' &&
    surah !== null &&
    typeof surah.id === 'number' &&
    typeof surah.name === 'string' &&
    typeof surah.englishName === 'string' &&
    typeof surah.banglaName === 'string' &&
    typeof surah.ayahCount === 'number' &&
    (surah.revelationType === 'meccan' || surah.revelationType === 'medinan')
  );
};

export const validateBookmark = (bookmark: any): bookmark is Bookmark => {
  return (
    typeof bookmark === 'object' &&
    bookmark !== null &&
    typeof bookmark.ayahId === 'number' &&
    typeof bookmark.surahId === 'number' &&
    typeof bookmark.ayahNumber === 'number' &&
    typeof bookmark.timestamp === 'number' &&
    (bookmark.note === undefined || typeof bookmark.note === 'string')
  );
};

export const validateUserPreferences = (preferences: any): preferences is UserPreferences => {
  return (
    typeof preferences === 'object' &&
    preferences !== null &&
    (preferences.theme === 'light' || preferences.theme === 'dark') &&
    (preferences.language === 'english' || preferences.language === 'bangla' || preferences.language === 'both') &&
    (preferences.fontSize === 'small' || preferences.fontSize === 'medium' || preferences.fontSize === 'large') &&
    typeof preferences.autoPlay === 'boolean'
  );
};

// Data transformation functions
export const transformQuranApiChapterToSurah = (chapter: QuranApiChapter): Surah => {
  return {
    id: chapter.id,
    name: chapter.name_arabic,
    englishName: chapter.translated_name.name,
    banglaName: chapter.translated_name.name, // Will be updated with actual Bengali names
    ayahCount: chapter.verses_count,
    revelationType: chapter.revelation_place.toLowerCase() === 'makkah' ? 'meccan' : 'medinan'
  };
};

export const transformQuranApiVerseToAyah = (
  verse: QuranApiVerse,
  englishTranslation?: string,
  banglaTranslation?: string
): Ayah => {
  // Handle missing chapter_id by extracting from verse_key (format: "1:1")
  let chapterId = verse.chapter_id;
  if (!chapterId && verse.verse_key) {
    chapterId = parseInt(verse.verse_key.split(':')[0]);
  }
  
  // If still no chapter_id, throw an error with helpful context
  if (!chapterId) {
    console.error('Missing chapter_id in verse:', verse);
    throw new Error(`Invalid verse data: missing chapter_id for verse ${verse.id}`);
  }

  // Generate audio URL using the pattern from the API
  const paddedSurah = chapterId.toString().padStart(3, '0');
  const paddedAyah = (verse.verse_number || 1).toString().padStart(3, '0');
  const audioUrl = `https://verses.quran.com/Alafasy/mp3/${paddedSurah}${paddedAyah}.mp3`;

  return {
    id: verse.id,
    surahId: chapterId,
    ayahNumber: verse.verse_number || 1,
    arabic: verse.text_uthmani || verse.text_simple || '',
    english: cleanTranslationText(englishTranslation || ''),
    bangla: cleanTranslationText(banglaTranslation || ''),
    audioUrl: audioUrl,
    juzNumber: verse.juz_number || 1
  };
};

// Utility functions for formatting
export const formatAyahReference = (surahId: number, ayahNumber: number): string => {
  return `${surahId}:${ayahNumber}`;
};

export const formatSurahName = (surah: Surah, language: 'arabic' | 'english' | 'bangla'): string => {
  switch (language) {
    case 'arabic':
      return surah.name;
    case 'english':
      return surah.englishName;
    case 'bangla':
      return surah.banglaName;
    default:
      return surah.englishName;
  }
};

export const getAyahDisplayText = (ayah: Ayah, language: 'english' | 'bangla' | 'both'): string => {
  switch (language) {
    case 'english':
      return cleanTranslationText(ayah.english);
    case 'bangla':
      return cleanTranslationText(ayah.bangla);
    case 'both':
      return `${cleanTranslationText(ayah.english)}\n\n${cleanTranslationText(ayah.bangla)}`;
    default:
      return cleanTranslationText(ayah.english);
  }
};

// Date utilities
export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const isToday = (dateString: string): boolean => {
  return dateString === getTodayDateString();
};

// Text cleaning utilities
export const cleanTranslationText = (text: string): string => {
  if (!text) return '';
  
  // Remove HTML footnote markers like <sup foot_note=195935>1</sup>
  let cleaned = text.replace(/<sup[^>]*foot_note[^>]*>.*?<\/sup>/gi, '');
  
  // Remove any other HTML tags that might be present
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
};

// Search utilities
export const normalizeSearchText = (text: string): string => {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
};

export const highlightSearchMatch = (text: string, searchTerm: string): string => {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// Array utilities
export const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Error handling utilities
export const createErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
};

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof Error && (
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.message.includes('Failed to fetch')
  );
};