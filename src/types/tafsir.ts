// Tafsir and Surah Information Types

export type TafsirSource = {
  id: number;
  name: string;
  lang: string;
  author?: string;
  resourceName?: string;
  resourceId?: number;
};

export type AyahKey = `${number}:${number}`;

export type AyahTafsir = {
  ayahKey: AyahKey;
  tafsirId: number;
  textHtml: string;
  sourceName: string;
  lang: string;
  resourceName?: string;
  resourceId?: number;
};

export interface SurahInfo {
  id: number;
  name: string;
  nameArabic: string;
  revelationPlace: 'meccan' | 'medinan';
  revelationOrder: number;
  totalVerses: number;
  totalPages: number;
  bismillahPre: boolean;
  revelationType: string;
  // Enhanced Shan-e-Nuzul and historical data
  shanEN?: string;
  shanBN?: string;
  summaryEN?: string;
  summaryBN?: string;
  historicalContext?: string;
  relatedSurahs?: string[];
}

export type TafsirProvider = 'qurancom' | 'alquran' | 'quranenc';

export type TafsirPreferences = {
  preferredTafsirId: Record<string, number>; // lang -> tafsirId
  provider: TafsirProvider;
  autoLoad: boolean;
};

export type SurahHistory = {
  surahId: number;
  lastRead: number; // timestamp
  readCount: number;
  lastAyah: number;
  bookmarked: boolean;
  notesCount: number;
};

