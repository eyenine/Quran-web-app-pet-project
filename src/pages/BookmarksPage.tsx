import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookmarksList } from '../components';
import { useBookmarks } from '../context';

export const BookmarksPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookmarkCount } = useBookmarks();

  const handleBookmarkClick = (surahId: number, ayahNumber: number) => {
    navigate(`/surah/${surahId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🔖</span>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              My Bookmarks
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {bookmarkCount} saved verse{bookmarkCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Bookmarks List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <BookmarksList onBookmarkClick={handleBookmarkClick} />
      </div>

      {/* Tips */}
      {bookmarkCount > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-green-900 dark:text-green-200 mb-3">
            Bookmark Tips
          </h3>
          <ul className="text-green-800 dark:text-green-300 space-y-2 text-sm">
            <li>• Click on any bookmark to navigate to that verse</li>
            <li>• Use the × button to remove bookmarks you no longer need</li>
            <li>• Bookmarks are saved locally and will persist between sessions</li>
            <li>• You can add notes to bookmarks when saving them</li>
          </ul>
        </div>
      )}
    </div>
  );
};