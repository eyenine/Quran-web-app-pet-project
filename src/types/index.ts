// Core data models for the Qur'an Web App

export interface Ayah {
  id: number;
  surahId: number;
  ayahNumber: number;
  arabic: string;
  english: string;
  bangla: string;
  audioUrl: string;
  juzNumber: number;
}

export interface Surah {
  id: number;
  name: string;
  englishName: string;
  banglaName: string;
  ayahCount: number;
  revelationType: 'meccan' | 'medinan';
}

export interface Bookmark {
  ayahId: number;
  surahId: number;
  ayahNumber: number;
  timestamp: number;
  note?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'english' | 'bangla' | 'both';
  fontSize: 'small' | 'medium' | 'large';
  autoPlay: boolean;
}

export interface DailyAyah {
  date: string;
  ayah: Ayah;
}

export interface SearchResult {
  ayah: Ayah;
  surah: Surah;
  matchType: 'arabic' | 'english' | 'bangla' | 'surah_name';
  highlightedText: string;
}

export interface AudioState {
  isPlaying: boolean;
  currentAyahId: number | null;
  isLoading: boolean;
  error: string | null;
  isLooping: boolean;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface QuranApiChapter {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface QuranApiVerse {
  id: number;
  verse_number: number;
  verse_key: string;
  hizb_number: number;
  rub_el_hizb_number: number;
  ruku_number: number;
  manzil_number: number;
  sajdah_number: number | null;
  chapter_id: number;
  page_number: number;
  juz_number: number;
  text_uthmani: string;
  text_indopak: string;
  text_simple: string;
  words: QuranApiWord[];
  translations?: QuranApiTranslation[];
  audio?: QuranApiAudio;
}

export interface QuranApiWord {
  id: number;
  position: number;
  audio_url: string | null;
  char_type_name: string;
  code_v1: string;
  page_number: number;
  line_number: number;
  text: string;
  translation: {
    text: string;
    language_name: string;
  };
  transliteration: {
    text: string;
    language_name: string;
  };
}

export interface QuranApiTranslation {
  id: number;
  language_name: string;
  text: string;
  resource_name: string;
  resource_id: number;
}

export interface QuranApiAudio {
  url: string;
  duration: number;
  format: string;
}