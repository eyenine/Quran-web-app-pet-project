import { Bookmark, UserPreferences, DailyAyah, NoteEntry } from '../types';
import { validateBookmark, validateUserPreferences } from './index';

// Storage keys
const STORAGE_KEYS = {
  USER_PREFERENCES: 'quran_app_user_preferences',
  BOOKMARKS: 'quran_app_bookmarks',
  DAILY_AYAH: 'quran_app_daily_ayah',
  LAST_READ: 'quran_app_last_read',
  SEARCH_HISTORY: 'quran_app_search_history'
} as const;

// Default values
const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'light',
  language: 'both',
  fontSize: 'medium',
  autoPlay: false,
  playbackRate: 1,
  preferredQari: 'Alafasy'
};

// Generic localStorage functions
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const setToStorage = <T>(key: string, value: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    return false;
  }
};

const removeFromStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
    return false;
  }
};

// User Preferences functions
export const getUserPreferences = (): UserPreferences => {
  const preferences = getFromStorage(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_USER_PREFERENCES);
  
  // Validate the preferences to ensure they match the expected structure
  if (validateUserPreferences(preferences)) {
    return preferences;
  }
  
  // If validation fails, return default preferences and update storage
  setUserPreferences(DEFAULT_USER_PREFERENCES);
  return DEFAULT_USER_PREFERENCES;
};

export const setUserPreferences = (preferences: UserPreferences): boolean => {
  if (!validateUserPreferences(preferences)) {
    console.error('Invalid user preferences provided');
    return false;
  }
  return setToStorage(STORAGE_KEYS.USER_PREFERENCES, preferences);
};

export const updateUserPreference = <K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K]
): boolean => {
  const currentPreferences = getUserPreferences();
  const updatedPreferences = { ...currentPreferences, [key]: value };
  return setUserPreferences(updatedPreferences);
};

// Bookmarks functions
export const getBookmarks = (): Bookmark[] => {
  const bookmarks = getFromStorage<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
  
  // Validate each bookmark and filter out invalid ones
  return bookmarks.filter(validateBookmark);
};

export const addBookmark = (bookmark: Bookmark): boolean => {
  if (!validateBookmark(bookmark)) {
    console.error('Invalid bookmark provided');
    return false;
  }
  
  const currentBookmarks = getBookmarks();
  
  // Check if bookmark already exists
  const existingIndex = currentBookmarks.findIndex(
    b => b.ayahId === bookmark.ayahId
  );
  
  if (existingIndex !== -1) {
    // Update existing bookmark
    currentBookmarks[existingIndex] = bookmark;
  } else {
    // Add new bookmark
    currentBookmarks.push(bookmark);
  }
  
  return setToStorage(STORAGE_KEYS.BOOKMARKS, currentBookmarks);
};

export const removeBookmark = (ayahId: number): boolean => {
  const currentBookmarks = getBookmarks();
  const filteredBookmarks = currentBookmarks.filter(b => b.ayahId !== ayahId);
  return setToStorage(STORAGE_KEYS.BOOKMARKS, filteredBookmarks);
};

export const isBookmarked = (ayahId: number): boolean => {
  const bookmarks = getBookmarks();
  return bookmarks.some(b => b.ayahId === ayahId);
};

export const getBookmarksBySurah = (surahId: number): Bookmark[] => {
  const bookmarks = getBookmarks();
  return bookmarks.filter(b => b.surahId === surahId);
};

// Daily Ayah functions
export const getDailyAyah = (): DailyAyah | null => {
  const dailyAyah = getFromStorage<DailyAyah | null>(STORAGE_KEYS.DAILY_AYAH, null);
  
  if (!dailyAyah) {
    return null;
  }
  
  // Check if the stored daily Ayah is for today
  const today = new Date().toISOString().split('T')[0];
  if (dailyAyah.date !== today) {
    // Remove outdated daily Ayah
    removeFromStorage(STORAGE_KEYS.DAILY_AYAH);
    return null;
  }
  
  return dailyAyah;
};

export const setDailyAyah = (dailyAyah: DailyAyah): boolean => {
  return setToStorage(STORAGE_KEYS.DAILY_AYAH, dailyAyah);
};

// Last read position functions
export interface LastReadPosition {
  surahId: number;
  ayahId: number;
  timestamp: number;
}

export const getLastReadPosition = (): LastReadPosition | null => {
  return getFromStorage<LastReadPosition | null>(STORAGE_KEYS.LAST_READ, null);
};

export const setLastReadPosition = (position: LastReadPosition): boolean => {
  return setToStorage(STORAGE_KEYS.LAST_READ, position);
};

// Search history functions
export const getSearchHistory = (): string[] => {
  return getFromStorage<string[]>(STORAGE_KEYS.SEARCH_HISTORY, []);
};

export const addToSearchHistory = (searchTerm: string): boolean => {
  if (!searchTerm.trim()) {
    return false;
  }
  
  const currentHistory = getSearchHistory();
  const normalizedTerm = searchTerm.trim().toLowerCase();
  
  // Remove if already exists to avoid duplicates
  const filteredHistory = currentHistory.filter(
    term => term.toLowerCase() !== normalizedTerm
  );
  
  // Add to beginning and limit to 10 items
  const updatedHistory = [searchTerm.trim(), ...filteredHistory].slice(0, 10);
  
  return setToStorage(STORAGE_KEYS.SEARCH_HISTORY, updatedHistory);
};

export const clearSearchHistory = (): boolean => {
  return removeFromStorage(STORAGE_KEYS.SEARCH_HISTORY);
};

// Notes functions
const NOTES_KEY_PREFIX = 'quran_app_notes_v2';

export const getNoteKey = (surahId: number, ayahNumber: number): string => {
  return `${NOTES_KEY_PREFIX}:${surahId}:${ayahNumber}`;
};

export const saveNote = (note: NoteEntry): boolean => {
  try {
    const key = getNoteKey(note.surahId, note.ayahNumber);
    setToStorage(key, note);
    return true;
  } catch (e) {
    console.error('Failed to save note', e);
    return false;
  }
};

export const getNote = (surahId: number, ayahNumber: number): NoteEntry | null => {
  return getFromStorage<NoteEntry | null>(getNoteKey(surahId, ayahNumber), null);
};

export const deleteNote = (surahId: number, ayahNumber: number): boolean => {
  return removeFromStorage(getNoteKey(surahId, ayahNumber));
};

export const listAllNotes = (): NoteEntry[] => {
  try {
    const notes: NoteEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) as string;
      if (key && key.startsWith(NOTES_KEY_PREFIX)) {
        const note = getFromStorage<NoteEntry | null>(key, null);
        if (note && note.content) notes.push(note);
      }
    }
    // Sort by updatedAt desc
    return notes.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (e) {
    console.error('Failed to list notes', e);
    return [];
  }
};

// Storage management functions
export const clearAllAppData = (): boolean => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing app data:', error);
    return false;
  }
};

export const getStorageUsage = (): { used: number; available: number } => {
  try {
    let used = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        used += item.length;
      }
    });
    
    // Estimate available space (localStorage typically has 5-10MB limit)
    const estimated = 5 * 1024 * 1024; // 5MB in bytes
    
    return {
      used,
      available: Math.max(0, estimated - used)
    };
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return { used: 0, available: 0 };
  }
};