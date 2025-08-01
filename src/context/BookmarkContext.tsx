import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Bookmark } from '../types';
import { 
  getBookmarks, 
  addBookmark as addBookmarkToStorage, 
  removeBookmark as removeBookmarkFromStorage,
  isBookmarked as checkIsBookmarked,
  getBookmarksBySurah 
} from '../utils/localStorage';

interface BookmarkContextType {
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Bookmark) => boolean;
  removeBookmark: (ayahId: number) => boolean;
  isBookmarked: (ayahId: number) => boolean;
  getBookmarksBySurah: (surahId: number) => Bookmark[];
  bookmarkCount: number;
  refreshBookmarks: () => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

interface BookmarkProviderProps {
  children: ReactNode;
}

export const BookmarkProvider: React.FC<BookmarkProviderProps> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Load bookmarks on mount
  useEffect(() => {
    refreshBookmarks();
  }, []);

  const refreshBookmarks = () => {
    const storedBookmarks = getBookmarks();
    setBookmarks(storedBookmarks);
  };

  const addBookmark = (bookmark: Bookmark): boolean => {
    const success = addBookmarkToStorage(bookmark);
    if (success) {
      refreshBookmarks();
    }
    return success;
  };

  const removeBookmark = (ayahId: number): boolean => {
    const success = removeBookmarkFromStorage(ayahId);
    if (success) {
      refreshBookmarks();
    }
    return success;
  };

  const isBookmarked = (ayahId: number): boolean => {
    return checkIsBookmarked(ayahId);
  };

  const getBookmarksBySurahContext = (surahId: number): Bookmark[] => {
    return getBookmarksBySurah(surahId);
  };

  const value: BookmarkContextType = {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    getBookmarksBySurah: getBookmarksBySurahContext,
    bookmarkCount: bookmarks.length,
    refreshBookmarks,
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = (): BookmarkContextType => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};