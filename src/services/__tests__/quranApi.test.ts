import { 
  fetchSurahs, 
  fetchSurah, 
  fetchSurahVerses,
  fetchVerse,
  getVerseAudioUrl,
  getSurahAudioUrl,
  getRandomVerse,
  clearApiCache
} from '../quranApi';

// Mock the API client
jest.mock('../apiClient', () => ({
  cachedApiRequest: jest.fn(),
  apiRequest: jest.fn(),
}));

import { cachedApiRequest } from '../apiClient';

const mockCachedApiRequest = cachedApiRequest as jest.MockedFunction<typeof cachedApiRequest>;

describe('Quran API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        key: jest.fn(),
        length: 0
      },
      writable: true
    });
  });

  describe('fetchSurahs', () => {
    it('should fetch and transform all Surahs', async () => {
      const mockApiResponse = {
        data: {
          chapters: [
            {
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
            }
          ]
        },
        status: 200,
        message: 'Success'
      };

      mockCachedApiRequest.mockResolvedValue(mockApiResponse);

      const result = await fetchSurahs();

      expect(mockCachedApiRequest).toHaveBeenCalledWith(
        '/chapters',
        'quran_chapters',
        24 * 60 * 60 * 1000
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        name: 'الفاتحة',
        englishName: 'The Opening',
        banglaName: 'The Opening',
        ayahCount: 7,
        revelationType: 'meccan'
      });
    });

    it('should handle API errors gracefully', async () => {
      mockCachedApiRequest.mockRejectedValue(new Error('Network error'));

      await expect(fetchSurahs()).rejects.toThrow('Failed to fetch Surahs. Please check your internet connection.');
    });
  });

  describe('fetchSurah', () => {
    it('should fetch a specific Surah by ID', async () => {
      const mockApiResponse = {
        data: {
          chapter: {
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
          }
        },
        status: 200,
        message: 'Success'
      };

      mockCachedApiRequest.mockResolvedValue(mockApiResponse);

      const result = await fetchSurah(1);

      expect(mockCachedApiRequest).toHaveBeenCalledWith(
        '/chapters/1',
        'quran_chapter_1',
        24 * 60 * 60 * 1000
      );

      expect(result).toEqual({
        id: 1,
        name: 'الفاتحة',
        englishName: 'The Opening',
        banglaName: 'The Opening',
        ayahCount: 7,
        revelationType: 'meccan'
      });
    });

    it('should return null on error', async () => {
      mockCachedApiRequest.mockRejectedValue(new Error('Not found'));

      const result = await fetchSurah(999);
      expect(result).toBeNull();
    });
  });

  describe('fetchSurahVerses', () => {
    it('should fetch verses for a Surah with translations', async () => {
      const mockApiResponse = {
        data: {
          verses: [
            {
              id: 1,
              verse_number: 1,
              verse_key: '1:1',
              chapter_id: 1,
              juz_number: 1,
              text_uthmani: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
              translations: [
                {
                  id: 1,
                  resource_id: 20,
                  text: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.'
                },
                {
                  id: 2,
                  resource_id: 161,
                  text: 'পরম করুণাময় অসীম দয়ালু আল্লাহর নামে।'
                }
              ]
            }
          ]
        },
        status: 200,
        message: 'Success'
      };

      mockCachedApiRequest.mockResolvedValue(mockApiResponse);

      const result = await fetchSurahVerses(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        surahId: 1,
        ayahNumber: 1,
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        english: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
        bangla: 'পরম করুণাময় অসীম দয়ালু আল্লাহর নামে।',
        audioUrl: 'https://verses.quran.com/Alafasy/mp3/001001.mp3',
        juzNumber: 1
      });
    });

    it('should handle API errors', async () => {
      mockCachedApiRequest.mockRejectedValue(new Error('Server error'));

      await expect(fetchSurahVerses(1)).rejects.toThrow('Failed to fetch verses for Surah 1. Please try again.');
    });
  });

  describe('Audio URL functions', () => {
    it('should generate correct verse audio URL', () => {
      const url = getVerseAudioUrl(1, 1);
      expect(url).toBe('https://verses.quran.com/Alafasy/mp3/001001.mp3');
    });

    it('should generate correct verse audio URL with padding', () => {
      const url = getVerseAudioUrl(114, 6);
      expect(url).toBe('https://verses.quran.com/Alafasy/mp3/114006.mp3');
    });

    it('should generate correct Surah audio URL', () => {
      const url = getSurahAudioUrl(1);
      expect(url).toBe('https://download.quranicaudio.com/quran/mishary_rashid_alafasy/001.mp3');
    });

    it('should generate correct Surah audio URL with padding', () => {
      const url = getSurahAudioUrl(114);
      expect(url).toBe('https://download.quranicaudio.com/quran/mishary_rashid_alafasy/114.mp3');
    });
  });

  describe('getRandomVerse', () => {
    it('should return a random verse', async () => {
      // Mock Math.random to return predictable values
      const originalRandom = Math.random;
      Math.random = jest.fn()
        .mockReturnValueOnce(0) // First Surah (1)
        .mockReturnValueOnce(0); // First verse (1)

      const mockSurahResponse = {
        data: {
          chapter: {
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
          }
        },
        status: 200,
        message: 'Success'
      };

      const mockVerseResponse = {
        data: {
          verse: {
            id: 1,
            verse_number: 1,
            verse_key: '1:1',
            chapter_id: 1,
            juz_number: 1,
            text_uthmani: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            translations: [
              {
                id: 1,
                resource_id: 20,
                text: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.'
              }
            ]
          }
        },
        status: 200,
        message: 'Success'
      };

      mockCachedApiRequest
        .mockResolvedValueOnce(mockSurahResponse)
        .mockResolvedValueOnce(mockVerseResponse);

      const result = await getRandomVerse();

      expect(result).not.toBeNull();
      expect(result?.surahId).toBe(1);
      expect(result?.ayahNumber).toBe(1);

      // Restore Math.random
      Math.random = originalRandom;
    });

    it('should return null on error', async () => {
      mockCachedApiRequest.mockRejectedValue(new Error('API error'));

      const result = await getRandomVerse();
      expect(result).toBeNull();
    });
  });

  describe('clearApiCache', () => {
    it('should clear all Quran-related cache entries', () => {
      const mockRemoveItem = jest.fn();
      Object.defineProperty(window, 'sessionStorage', {
        value: {
          ...window.sessionStorage,
          removeItem: mockRemoveItem,
          keys: jest.fn().mockReturnValue(['quran_chapters', 'quran_verses_1', 'other_key'])
        },
        writable: true
      });

      // Mock Object.keys to return our test keys
      const originalKeys = Object.keys;
      Object.keys = jest.fn().mockReturnValue(['quran_chapters', 'quran_verses_1', 'other_key']);

      clearApiCache();

      expect(mockRemoveItem).toHaveBeenCalledWith('quran_chapters');
      expect(mockRemoveItem).toHaveBeenCalledWith('quran_verses_1');
      expect(mockRemoveItem).not.toHaveBeenCalledWith('other_key');

      // Restore Object.keys
      Object.keys = originalKeys;
    });
  });
});