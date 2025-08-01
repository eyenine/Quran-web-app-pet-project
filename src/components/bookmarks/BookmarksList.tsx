import React from 'react';
import { useBookmarks } from '../../context';

interface BookmarksListProps {
  onBookmarkClick?: (surahId: number, ayahNumber: number) => void;
  className?: string;
}

export const BookmarksList: React.FC<BookmarksListProps> = ({
  onBookmarkClick,
  className = ''
}) => {
  const { bookmarks, removeBookmark, bookmarkCount } = useBookmarks();

  if (bookmarkCount === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-6xl mb-4">🔖</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No bookmarks yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Start reading the Quran and bookmark your favorite verses
        </p>
        <div className="text-sm text-gray-400 dark:text-gray-500">
          <p>• Click the bookmark icon on any verse to save it</p>
          <p>• Your bookmarks will appear here for easy access</p>
        </div>
      </div>
    );
  }

  const sortedBookmarks = [...bookmarks].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className={`space-y-4 ${className}`}>
      {sortedBookmarks.map((bookmark) => (
        <div
          key={bookmark.ayahId}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 hover:border-primary-200 dark:hover:border-primary-600"
        >
          <div className="flex justify-between items-start gap-4">
            <div 
              className="flex-1 cursor-pointer min-w-0"
              onClick={() => onBookmarkClick?.(bookmark.surahId, bookmark.ayahNumber)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 dark:text-primary-300 font-semibold text-sm">
                    {bookmark.surahId}:{bookmark.ayahNumber}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate">
                    Surah {bookmark.surahId}, Verse {bookmark.ayahNumber}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Juz {Math.ceil(bookmark.surahId / 4)} • {new Date(bookmark.timestamp).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              {bookmark.note && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 mb-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    "{bookmark.note}"
                  </p>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <span>📅 Saved {new Date(bookmark.timestamp).toLocaleDateString()}</span>
                <span>•</span>
                <span>🕒 {new Date(bookmark.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onBookmarkClick?.(bookmark.surahId, bookmark.ayahNumber)}
                className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-800/20 rounded-md transition-colors"
                aria-label="Go to verse"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
              
              <button
                onClick={() => removeBookmark(bookmark.ayahId)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                aria-label="Remove bookmark"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};