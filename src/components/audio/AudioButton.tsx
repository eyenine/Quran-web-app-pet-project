import React from 'react';
import { useAudio } from '../../context/AudioContext';

interface AudioButtonProps {
  surahId: number;
  ayahNumber: number;
  className?: string;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  surahId,
  ayahNumber,
  className = ''
}) => {
  const { state, playVerse, pauseAudio } = useAudio();

  const isCurrentVerse = state.currentVerse?.surahId === surahId && 
                        state.currentVerse?.ayahNumber === ayahNumber;
  const isPlaying = isCurrentVerse && state.isPlaying;
  const isLoading = isCurrentVerse && state.isLoading;

  const handleClick = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playVerse(surahId, ayahNumber);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`p-2 rounded-md transition-all duration-200 ${
        isPlaying
          ? 'bg-primary-500 text-white shadow-lg'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-800'
      } disabled:opacity-50 ${className}`}
      aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isPlaying ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      )}
    </button>
  );
}; 