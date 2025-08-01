import {
  validateAyah,
  validateSurah,
  validateBookmark,
  validateUserPreferences,
  transformQuranApiChapterToSurah,
  transformQuranApiVerseToAyah,
  formatAyahReference,
  formatSurahName,
  getAyahDisplayText,
  getTodayDateString,
  isToday,
  normalizeSearchText,
  highlightSearchMatch,
  chunkArray,
  shuffleArray,
  createErrorMessage,
  isNetworkError
} from '../index';
import { Ayah, Surah, Bookmark, UserPreferences, QuranApiChapter, QuranApiVerse } from '../../types';

describe('Data Validation Functions', () => {
  describe('validateAyah', () => {
    it('should validate a correct Ayah object', () => {
      const validAyah: Ayah = {
        id: 1,
        surahId: 1,
        ayahNumber: 1,
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        english: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
        bangla: 'পরম করুণাময় অসীম দয়ালু আল্লাহর নামে।',
        audioUrl: 'https://example.com/audio.mp3',
        juzNumber: 1
      };
      
      expect(validateAyah(validAyah)).toBe(true);
    });

    it('should reject invalid Ayah objects', () => {
      expect(validateAyah({})).toBe(false);
      expect(validateAyah(null)).toBe(false);
      expect(validateAyah({ id: 'invalid' })).toBe(false);
    });
  });

  describe('validateSurah', () => {
    it('should validate a correct Surah object', () => {
      const validSurah: Surah = {
        id: 1,
        name: 'الفاتحة',
        englishName: 'Al-Fatihah',
        banglaName: 'আল-ফাতিহা',
        ayahCount: 7,
        revelationType: 'meccan'
      };
      
      expect(validateSurah(validSurah)).toBe(true);
    });

    it('should reject invalid revelation types', () => {
      const invalidSurah = {
        id: 1,
        name: 'الفاتحة',
        englishName: 'Al-Fatihah',
        banglaName: 'আল-ফাতিহা',
        ayahCount: 7,
        revelationType: 'invalid'
      };
      
      expect(validateSurah(invalidSurah)).toBe(false);
    });
  });

  describe('validateBookmark', () => {
    it('should validate a correct Bookmark object', () => {
      const validBookmark: Bookmark = {
        ayahId: 1,
        surahId: 1,
        ayahNumber: 1,
        timestamp: Date.now()
      };
      
      expect(validateBookmark(validBookmark)).toBe(true);
    });

    it('should validate a Bookmark with optional note', () => {
      const validBookmark: Bookmark = {
        ayahId: 1,
        surahId: 1,
        ayahNumber: 1,
        timestamp: Date.now(),
        note: 'Beautiful verse'
      };
      
      expect(validateBookmark(validBookmark)).toBe(true);
    });
  });

  describe('validateUserPreferences', () => {
    it('should validate correct UserPreferences', () => {
      const validPreferences: UserPreferences = {
        theme: 'dark',
        language: 'english',
        fontSize: 'medium',
        autoPlay: true
      };
      
      expect(validateUserPreferences(validPreferences)).toBe(true);
    });

    it('should reject invalid theme values', () => {
      const invalidPreferences = {
        theme: 'invalid',
        language: 'english',
        fontSize: 'medium',
        autoPlay: true
      };
      
      expect(validateUserPreferences(invalidPreferences)).toBe(false);
    });
  });
});

describe('Data Transformation Functions', () => {
  describe('transformQuranApiChapterToSurah', () => {
    it('should transform API chapter to Surah correctly', () => {
      const apiChapter: QuranApiChapter = {
        id: 1,
        revelation_place: 'makkah',
        revelation_order: 5,
        bismillah_pre: true,
        name_simple: 'Al-Fatihah',
        name_complex: 'Al-Fātiḥah',
        name_arabic: 'الفاتحة',
        verses_count: 7,
        pages: [1, 2],
        translated_name: {
          language_name: 'english',
          name: 'The Opening'
        }
      };

      const result = transformQuranApiChapterToSurah(apiChapter);
      
      expect(result.id).toBe(1);
      expect(result.name).toBe('الفاتحة');
      expect(result.englishName).toBe('The Opening');
      expect(result.ayahCount).toBe(7);
      expect(result.revelationType).toBe('meccan');
    });

    it('should handle medinan revelation type', () => {
      const apiChapter: QuranApiChapter = {
        id: 2,
        revelation_place: 'madinah',
        revelation_order: 87,
        bismillah_pre: true,
        name_simple: 'Al-Baqarah',
        name_complex: 'Al-Baqarah',
        name_arabic: 'البقرة',
        verses_count: 286,
        pages: [2, 49],
        translated_name: {
          language_name: 'english',
          name: 'The Cow'
        }
      };

      const result = transformQuranApiChapterToSurah(apiChapter);
      expect(result.revelationType).toBe('medinan');
    });
  });
});

describe('Formatting Functions', () => {
  describe('formatAyahReference', () => {
    it('should format Ayah reference correctly', () => {
      expect(formatAyahReference(1, 1)).toBe('1:1');
      expect(formatAyahReference(2, 255)).toBe('2:255');
    });
  });

  describe('formatSurahName', () => {
    const surah: Surah = {
      id: 1,
      name: 'الفاتحة',
      englishName: 'Al-Fatihah',
      banglaName: 'আল-ফাতিহা',
      ayahCount: 7,
      revelationType: 'meccan'
    };

    it('should return Arabic name', () => {
      expect(formatSurahName(surah, 'arabic')).toBe('الفاتحة');
    });

    it('should return English name', () => {
      expect(formatSurahName(surah, 'english')).toBe('Al-Fatihah');
    });

    it('should return Bengali name', () => {
      expect(formatSurahName(surah, 'bangla')).toBe('আল-ফাতিহা');
    });
  });

  describe('getAyahDisplayText', () => {
    const ayah: Ayah = {
      id: 1,
      surahId: 1,
      ayahNumber: 1,
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      english: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      bangla: 'পরম করুণাময় অসীম দয়ালু আল্লাহর নামে।',
      audioUrl: 'https://example.com/audio.mp3',
      juzNumber: 1
    };

    it('should return English translation', () => {
      expect(getAyahDisplayText(ayah, 'english')).toBe(ayah.english);
    });

    it('should return Bengali translation', () => {
      expect(getAyahDisplayText(ayah, 'bangla')).toBe(ayah.bangla);
    });

    it('should return both translations', () => {
      const result = getAyahDisplayText(ayah, 'both');
      expect(result).toContain(ayah.english);
      expect(result).toContain(ayah.bangla);
    });
  });
});

describe('Date Utilities', () => {
  describe('getTodayDateString', () => {
    it('should return today\'s date in YYYY-MM-DD format', () => {
      const result = getTodayDateString();
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      expect(result).toMatch(dateRegex);
    });
  });

  describe('isToday', () => {
    it('should return true for today\'s date', () => {
      const today = getTodayDateString();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];
      expect(isToday(yesterdayString)).toBe(false);
    });
  });
});

describe('Search Utilities', () => {
  describe('normalizeSearchText', () => {
    it('should normalize search text correctly', () => {
      expect(normalizeSearchText('  Hello   World  ')).toBe('hello world');
      expect(normalizeSearchText('UPPERCASE')).toBe('uppercase');
    });
  });

  describe('highlightSearchMatch', () => {
    it('should highlight search matches', () => {
      const result = highlightSearchMatch('Hello World', 'World');
      expect(result).toBe('Hello <mark>World</mark>');
    });

    it('should handle case insensitive matches', () => {
      const result = highlightSearchMatch('Hello World', 'world');
      expect(result).toBe('Hello <mark>World</mark>');
    });

    it('should return original text if no search term', () => {
      const result = highlightSearchMatch('Hello World', '');
      expect(result).toBe('Hello World');
    });
  });
});

describe('Array Utilities', () => {
  describe('chunkArray', () => {
    it('should chunk array correctly', () => {
      const array = [1, 2, 3, 4, 5, 6, 7];
      const result = chunkArray(array, 3);
      expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });

    it('should handle empty array', () => {
      const result = chunkArray([], 3);
      expect(result).toEqual([]);
    });
  });

  describe('shuffleArray', () => {
    it('should return array with same length', () => {
      const array = [1, 2, 3, 4, 5];
      const result = shuffleArray(array);
      expect(result).toHaveLength(array.length);
    });

    it('should not modify original array', () => {
      const array = [1, 2, 3, 4, 5];
      const original = [...array];
      shuffleArray(array);
      expect(array).toEqual(original);
    });
  });
});

describe('Error Handling Utilities', () => {
  describe('createErrorMessage', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Test error');
      expect(createErrorMessage(error)).toBe('Test error');
    });

    it('should handle string errors', () => {
      expect(createErrorMessage('String error')).toBe('String error');
    });

    it('should handle unknown errors', () => {
      expect(createErrorMessage(null)).toBe('An unknown error occurred');
    });
  });

  describe('isNetworkError', () => {
    it('should identify network errors', () => {
      const networkError = new Error('Failed to fetch');
      expect(isNetworkError(networkError)).toBe(true);
    });

    it('should not identify non-network errors', () => {
      const otherError = new Error('Validation error');
      expect(isNetworkError(otherError)).toBe(false);
    });
  });
});