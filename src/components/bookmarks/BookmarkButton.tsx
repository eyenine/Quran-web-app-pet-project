import React, { useState } from 'react';
import { useBookmarks } from '../../context';
import { Bookmark } from '../../types';

interface BookmarkButtonProps {
  ayahId: number;
  surahId: number;
  ayahNumber: number;
  note?: string;
  className?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  ayahId,
  surahId,
  ayahNumber,
  note,
  className = ''
}) => {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const [isAnimating, setIsAnimating] = useState(false);

  const bookmarked = isBookmarked(ayahId);

  const handleToggle = () => {
    setIsAnimating(true);
    
    if (bookmarked) {
      removeBookmark(ayahId);
    } else {
      const bookmark: Bookmark = {
        ayahId,
        surahId,
        ayahNumber,
        timestamp: Date.now(),
        note
      };
      addBookmark(bookmark);
    }

    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-md transition-all duration-200 ${
        bookmarked
          ? 'bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400'
          : 'text-gray-500 dark:text-gray-400 hover:text-accent-500 dark:hover:text-accent-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      } ${isAnimating ? 'scale-110' : 'scale-100'} ${className}`}
      aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <svg 
        className="w-4 h-4" 
        fill={bookmarked ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
        />
      </svg>
    </button>
  );
};