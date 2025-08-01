import React from 'react';
import { useAudio } from '../../context/AudioContext';

interface AudioButtonProps {
  surahId: number;
  ayahNumber: number;
  className?: string;
  showStop?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  surahId,
  ayahNumber,
  className = '',
  showStop = false,
  size = 'md'
}) => {
  const { state, playVerse, pauseAudio, stopAudio } = useAudio();

  const isCurrentVerse = state.currentVerse?.surahId === surahId && 
                        state.currentVerse?.ayahNumber === ayahNumber;
  const isPlaying = isCurrentVerse && state.isPlaying;
  const isLoading = isCurrentVerse && (state.isLoading || state.isBuffering);
  const hasError = isCurrentVerse && state.error;

  const sizeClasses = {
    sm: 'p-1.5 w-3 h-3',
    md: 'p-2 w-4 h-4',
    lg: 'p-3 w-5 h-5'
  };

  const handlePlayPause = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isPlaying) {
        pauseAudio();
      } else {
        playVerse(surahId, ayahNumber);
      }
    } catch (error) {
      console.error('Error handling play/pause:', error);
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    stopAudio();
  };

  const getButtonState = () => {
    if (hasError) return 'error';
    if (isLoading) return 'loading';
    if (isPlaying) return 'playing';
    return 'idle';
  };

  const buttonState = getButtonState();

  const getButtonStyles = () => {
    const baseStyles = `${sizeClasses[size].split(' ')[0]} rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`;
    
    switch (buttonState) {
      case 'playing':
        return `${baseStyles} bg-primary-500 text-white shadow-lg hover:bg-primary-600 active:bg-primary-700`;
      case 'loading':
        return `${baseStyles} bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-300 cursor-wait`;
      case 'error':
        return `${baseStyles} bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50`;
      default:
        return `${baseStyles} bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-800 hover:text-primary-600 dark:hover:text-primary-300`;
    }
  };

  const renderIcon = () => {
    const iconSize = sizeClasses[size].split(' ')[1] + ' ' + sizeClasses[size].split(' ')[2];
    
    if (isLoading) {
      return (
        <div className={`${iconSize} border-2 border-current border-t-transparent rounded-full animate-spin`} />
      );
    }
    
    if (hasError) {
      return (
        <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      );
    }
    
    if (isPlaying) {
      return (
        <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      );
    }
    
    return (
      <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>
    );
  };

  const getAriaLabel = () => {
    if (hasError) return 'Audio error - click to retry';
    if (isLoading) return 'Loading audio...';
    if (isPlaying) return 'Pause audio';
    return 'Play audio';
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <button
        onClick={handlePlayPause}
        disabled={isLoading && !hasError}
        className={getButtonStyles()}
        aria-label={getAriaLabel()}
        title={getAriaLabel()}
      >
        {renderIcon()}
      </button>
      
      {showStop && (isPlaying || isCurrentVerse) && !isLoading && (
        <button
          onClick={handleStop}
          className={`${sizeClasses[size].split(' ')[0]} rounded-md transition-all duration-200 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
          aria-label="Stop audio"
          title="Stop audio"
        >
          <svg className={sizeClasses[size].split(' ')[1] + ' ' + sizeClasses[size].split(' ')[2]} fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z"/>
          </svg>
        </button>
      )}
      
      {/* Loading indicator for current verse */}
      {isCurrentVerse && state.isBuffering && (
        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
          <span>Buffering...</span>
        </div>
      )}
    </div>
  );
}; 