import {
  getUserPreferences,
  setUserPreferences,
  updateUserPreference,
  getBookmarks,
  addBookmark,
  removeBookmark,
  isBookmarked,
  getBookmarksBySurah,
  getDailyAyah,
  setDailyAyah,
  getLastReadPosition,
  setLastReadPosition,
  getSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
  clearAllAppData,
  getStorageUsage
} from '../localStorage';
import { UserPreferences, Bookmark, DailyAyah, Ayah } from '../../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('localStorage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('User Preferences', () => {
    describe('getUserPreferences', () => {
      it('should return default preferences when none exist', () => {
        const preferences = getUserPreferences();
        expect(preferences).toEqual({
          theme: 'light',
          language: 'english',
          fontSize: 'medium',
          autoPlay: false
        });
      });

      it('should return stored preferences', () => {
        const customPreferences: UserPreferences = {
          theme: 'dark',
          language: 'bangla',
          fontSize: 'large',
          autoPlay: true
        };
        
        setUserPreferences(customPreferences);
        const retrieved = getUserPreferences();
        expect(retrieved).toEqual(customPreferences);
      });

      it('should return default preferences for invalid stored data', () => {
        localStorage.setItem('quran_app_user_preferences', 'invalid json');
        const preferences = getUserPreferences();
        expect(preferences).toEqual({
          theme: 'light',
          language: 'english',
          fontSize: 'medium',
          autoPlay: false
        });
      });
    });

    describe('setUserPreferences', () => {
      it('should store valid preferences', () => {
        const preferences: UserPreferences = {
          theme: 'dark',
          language: 'english',
          fontSize: 'large',
          autoPlay: true
        };
        
        const result = setUserPreferences(preferences);
        expect(result).toBe(true);
        expect(getUserPreferences()).toEqual(preferences);
      });

      it('should reject invalid preferences', () => {
        const invalidPreferences = {
          theme: 'invalid',
          language: 'english',
          fontSize: 'medium',
          autoPlay: true
        } as any;
        
        const result = setUserPreferences(invalidPreferences);
        expect(result).toBe(false);
      });
    });

    describe('updateUserPreference', () => {
      it('should update a single preference', () => {
        const result = updateUserPreference('theme', 'dark');
        expect(result).toBe(true);
        
        const preferences = getUserPreferences();
        expect(preferences.theme).toBe('dark');
        expect(preferences.language).toBe('english'); // Should remain default
      });
    });
  });

  describe('Bookmarks', () => {
    const sampleBookmark: Bookmark = {
      ayahId: 1,
      surahId: 1,
      ayahNumber: 1,
      timestamp: Date.now()
    };

    describe('getBookmarks', () => {
      it('should return empty array when no bookmarks exist', () => {
        const bookmarks = getBookmarks();
        expect(bookmarks).toEqual([]);
      });

      it('should return stored bookmarks', () => {
        addBookmark(sampleBookmark);
        const bookmarks = getBookmarks();
        expect(bookmarks).toHaveLength(1);
        expect(bookmarks[0]).toEqual(sampleBookmark);
      });

      it('should filter out invalid bookmarks', () => {
        localStorage.setItem('quran_app_bookmarks', JSON.stringify([
          sampleBookmark,
          { invalid: 'bookmark' }
        ]));
        
        const bookmarks = getBookmarks();
        expect(bookmarks).toHaveLength(1);
        expect(bookmarks[0]).toEqual(sampleBookmark);
      });
    });

    describe('addBookmark', () => {
      it('should add a new bookmark', () => {
        const result = addBookmark(sampleBookmark);
        expect(result).toBe(true);
        expect(isBookmarked(sampleBookmark.ayahId)).toBe(true);
      });

      it('should update existing bookmark', () => {
        addBookmark(sampleBookmark);
        
        const updatedBookmark = {
          ...sampleBookmark,
          note: 'Updated note'
        };
        
        const result = addBookmark(updatedBookmark);
        expect(result).toBe(true);
        
        const bookmarks = getBookmarks();
        expect(bookmarks).toHaveLength(1);
        expect(bookmarks[0].note).toBe('Updated note');
      });

      it('should reject invalid bookmark', () => {
        const invalidBookmark = { invalid: 'bookmark' } as any;
        const result = addBookmark(invalidBookmark);
        expect(result).toBe(false);
      });
    });

    describe('removeBookmark', () => {
      it('should remove existing bookmark', () => {
        addBookmark(sampleBookmark);
        expect(isBookmarked(sampleBookmark.ayahId)).toBe(true);
        
        const result = removeBookmark(sampleBookmark.ayahId);
        expect(result).toBe(true);
        expect(isBookmarked(sampleBookmark.ayahId)).toBe(false);
      });
    });

    describe('getBookmarksBySurah', () => {
      it('should return bookmarks for specific surah', () => {
        const bookmark1 = { ...sampleBookmark, surahId: 1 };
        const bookmark2 = { ...sampleBookmark, ayahId: 2, surahId: 2 };
        
        addBookmark(bookmark1);
        addBookmark(bookmark2);
        
        const surah1Bookmarks = getBookmarksBySurah(1);
        expect(surah1Bookmarks).toHaveLength(1);
        expect(surah1Bookmarks[0].surahId).toBe(1);
      });
    });
  });

  describe('Daily Ayah', () => {
    const sampleAyah: Ayah = {
      id: 1,
      surahId: 1,
      ayahNumber: 1,
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      english: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      bangla: 'পরম করুণাময় অসীম দয়ালু আল্লাহর নামে।',
      audioUrl: 'https://example.com/audio.mp3',
      juzNumber: 1
    };

    describe('getDailyAyah', () => {
      it('should return null when no daily ayah exists', () => {
        const dailyAyah = getDailyAyah();
        expect(dailyAyah).toBeNull();
      });

      it('should return today\'s daily ayah', () => {
        const today = new Date().toISOString().split('T')[0];
        const dailyAyah: DailyAyah = {
          date: today,
          ayah: sampleAyah
        };
        
        setDailyAyah(dailyAyah);
        const retrieved = getDailyAyah();
        expect(retrieved).toEqual(dailyAyah);
      });

      it('should return null for outdated daily ayah', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        const outdatedDailyAyah: DailyAyah = {
          date: yesterdayString,
          ayah: sampleAyah
        };
        
        setDailyAyah(outdatedDailyAyah);
        const retrieved = getDailyAyah();
        expect(retrieved).toBeNull();
      });
    });
  });

  describe('Search History', () => {
    describe('getSearchHistory', () => {
      it('should return empty array when no history exists', () => {
        const history = getSearchHistory();
        expect(history).toEqual([]);
      });
    });

    describe('addToSearchHistory', () => {
      it('should add search term to history', () => {
        const result = addToSearchHistory('test search');
        expect(result).toBe(true);
        
        const history = getSearchHistory();
        expect(history).toContain('test search');
      });

      it('should not add empty search terms', () => {
        const result = addToSearchHistory('   ');
        expect(result).toBe(false);
      });

      it('should avoid duplicates and move to front', () => {
        addToSearchHistory('first');
        addToSearchHistory('second');
        addToSearchHistory('first'); // Duplicate
        
        const history = getSearchHistory();
        expect(history[0]).toBe('first');
        expect(history).toHaveLength(2);
      });

      it('should limit history to 10 items', () => {
        for (let i = 1; i <= 12; i++) {
          addToSearchHistory(`search ${i}`);
        }
        
        const history = getSearchHistory();
        expect(history).toHaveLength(10);
        expect(history[0]).toBe('search 12');
      });
    });

    describe('clearSearchHistory', () => {
      it('should clear all search history', () => {
        addToSearchHistory('test');
        expect(getSearchHistory()).toHaveLength(1);
        
        const result = clearSearchHistory();
        expect(result).toBe(true);
        expect(getSearchHistory()).toHaveLength(0);
      });
    });
  });

  describe('Storage Management', () => {
    describe('clearAllAppData', () => {
      it('should clear all app data', () => {
        // Add some data
        setUserPreferences({
          theme: 'dark',
          language: 'english',
          fontSize: 'medium',
          autoPlay: false
        });
        addBookmark({
          ayahId: 1,
          surahId: 1,
          ayahNumber: 1,
          timestamp: Date.now()
        });
        addToSearchHistory('test');
        
        // Clear all data
        const result = clearAllAppData();
        expect(result).toBe(true);
        
        // Verify data is cleared
        expect(getUserPreferences()).toEqual({
          theme: 'light',
          language: 'english',
          fontSize: 'medium',
          autoPlay: false
        }); // Should return defaults
        expect(getBookmarks()).toEqual([]);
        expect(getSearchHistory()).toEqual([]);
      });
    });

    describe('getStorageUsage', () => {
      it('should return storage usage information', () => {
        const usage = getStorageUsage();
        expect(usage).toHaveProperty('used');
        expect(usage).toHaveProperty('available');
        expect(typeof usage.used).toBe('number');
        expect(typeof usage.available).toBe('number');
      });
    });
  });
});