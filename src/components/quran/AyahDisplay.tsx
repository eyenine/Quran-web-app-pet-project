import React, { useMemo, useRef, useState } from 'react';
import { Ayah } from '../../types';
import { useLanguage, useBookmarks } from '../../context';
import { useAudio } from '../../context/AudioContext';
import { VerseNotes } from './VerseNotes';
import { AudioButton } from '../audio/AudioButton';
import { trackAyahPlay, trackBookmarkAdd } from '../../services/analytics';

interface AyahDisplayProps {
  ayah: Ayah;
  surahName?: string;
  showSurahInfo?: boolean;
  className?: string;
  role?: string;
  'aria-current'?: string;
  'data-verse'?: number;
}

export const AyahDisplay: React.FC<AyahDisplayProps> = ({
  ayah,
  surahName,
  showSurahInfo = false,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { isEnglishEnabled, isBanglaEnabled } = useLanguage();

  // Pre-compute verse text for clipboard comparison
  const verseText = useMemo(() => {
    return `${ayah.arabic}\n\n${ayah.english}${ayah.bangla ? `\n\n${ayah.bangla}` : ''}`;
  }, [ayah.arabic, ayah.english, ayah.bangla]);
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { state: audioState } = useAudio();
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  // Check if this verse is part of currently playing surah
  const isPartOfPlayingSurah = useMemo(() => {
    return audioState.playMode === 'surah' && 
           audioState.surahData?.surahId === ayah.surahId &&
           audioState.isPlaying;
  }, [audioState.playMode, audioState.surahData, audioState.isPlaying, ayah.surahId]);

  // Check if this is the currently playing verse
  const isCurrentlyPlaying = useMemo(() => {
    return audioState.currentVerse?.surahId === ayah.surahId &&
           audioState.currentVerse?.ayahNumber === ayah.ayahNumber &&
           audioState.isPlaying;
  }, [audioState.currentVerse, audioState.isPlaying, ayah.surahId, ayah.ayahNumber]);

  // Memoize the bookmark state to prevent unnecessary re-renders
  const isCurrentlyBookmarked = useMemo(() => isBookmarked(ayah.id), [isBookmarked, ayah.id]);

  // Memoize the surah info display
  const surahInfo = useMemo(() => {
    if (!showSurahInfo) return null;
    return (
      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {surahName || `Surah ${ayah.surahId}`}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Verse {ayah.ayahNumber} • Juz {ayah.juzNumber}
        </div>
      </div>
    );
  }, [showSurahInfo, surahName, ayah.surahId, ayah.ayahNumber, ayah.juzNumber]);

  const handleBookmarkToggle = () => {
    if (isCurrentlyBookmarked) {
      removeBookmark(ayah.id);
    } else {
      addBookmark({
        ayahId: ayah.id,
        surahId: ayah.surahId,
        ayahNumber: ayah.ayahNumber,
        timestamp: Date.now()
      });
      trackBookmarkAdd(ayah.surahId, ayah.ayahNumber);
    }
  };

  const openNotes = () => setIsNotesOpen(true);



  return (
    <div 
      ref={containerRef}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 transition-all duration-300 ${
        isCurrentlyPlaying 
          ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-lg' 
          : isPartOfPlayingSurah
          ? 'border-primary-300 dark:border-primary-600 bg-primary-25 dark:bg-primary-900/10'
          : 'border-gray-200 dark:border-gray-700'
      } ${className} ${isFocused ? 'ring-2 ring-primary-500 dark:ring-accent-400' : ''}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          setIsFocused(!isFocused);
        }
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="article"
      aria-label={`Verse ${ayah.ayahNumber} of ${surahName || `Surah ${ayah.surahId}`}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          {/* Ayah number */}
          <div 
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold relative ${
              isCurrentlyPlaying
                ? 'bg-primary-600 dark:bg-primary-500 text-white shadow-lg animate-pulse'
                : isPartOfPlayingSurah
                ? 'bg-primary-400 dark:bg-primary-600 text-white'
                : 'bg-primary-500 dark:bg-accent-400 text-white'
            }`}
            aria-label={`Verse ${ayah.ayahNumber}`}
            role="heading"
            aria-level={2}
          >
            {ayah.ayahNumber}
            {isCurrentlyPlaying && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
              </div>
            )}
          </div>
          
          {/* Surah info */}
          {surahInfo}
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          {/* Audio button */}
          <AudioButton
            surahId={ayah.surahId}
            ayahNumber={ayah.ayahNumber}
            showStop={true}
            className="text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-accent-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          />

          {/* Bookmark button */}
          <button
            onClick={handleBookmarkToggle}
            className={`p-2 rounded-md transition-colors ${
              isCurrentlyBookmarked
                ? 'bg-accent-100 dark:bg-accent-400/20 text-accent-600 dark:text-accent-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-accent-500 dark:hover:text-accent-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            aria-label={isCurrentlyBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            aria-pressed={isCurrentlyBookmarked}
          >
            <svg className="w-4 h-4" fill={isCurrentlyBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>

          {/* Copy button */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(verseText);
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 2000);
            }}
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Copy verse"
            aria-describedby={`copy-status-${ayah.id}`}
          >
            <span id={`copy-status-${ayah.id}`} className="sr-only">
              {isCopied ? 'Copied' : 'Copy verse'}
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Notes button */}
          <button
            onClick={openNotes}
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Add note"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 00-3 0L7 11v4h4l8.5-8.5a2.121 2.121 0 000-3z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Arabic text */}
      <div className="mb-6">
        <p className="font-arabic text-2xl leading-loose text-right text-gray-900 dark:text-white">
          {ayah.arabic}
        </p>
      </div>

      {/* Translations */}
      <div className="space-y-4">
        {isEnglishEnabled && ayah.english && (
          <div className="border-l-4 border-primary-200 dark:border-primary-600 pl-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {ayah.english}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              English Translation
            </p>
          </div>
        )}

        {isBanglaEnabled && ayah.bangla && (
          <div className="border-l-4 border-accent-200 dark:border-accent-600 pl-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-bengali">
              {ayah.bangla}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              বাংলা অনুবাদ
            </p>
          </div>
        )}
      </div>

      {/* Audio error display */}
      {audioState.error && 
       audioState.currentVerse?.surahId === ayah.surahId && 
       audioState.currentVerse?.ayahNumber === ayah.ayahNumber && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-700 dark:text-red-300">
            Audio playback failed: {audioState.error}
          </p>
        </div>
      )}

      <VerseNotes
        surahId={ayah.surahId}
        ayahNumber={ayah.ayahNumber}
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
      />
    </div>
  );
};