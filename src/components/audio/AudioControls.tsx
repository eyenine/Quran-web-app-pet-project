import React from 'react';

interface AudioControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop?: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
  isBuffering?: boolean;
  disabled?: boolean;
  showStop?: boolean;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  onPlay,
  onPause,
  onStop,
  onNext,
  onPrevious,
  isLoading = false,
  isBuffering = false,
  disabled = false,
  showStop = false,
  canGoNext = true,
  canGoPrevious = true
}) => {
  const isProcessing = isLoading || isBuffering;

  const renderPlayPauseIcon = () => {
    if (isProcessing) {
      return (
        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    }
    
    if (isPlaying) {
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      );
    }
    
    return (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>
    );
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Previous button */}
      <button
        onClick={onPrevious}
        disabled={disabled || isProcessing || !canGoPrevious}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        aria-label="Previous verse"
        title="Previous verse"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {/* Play/Pause button */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        disabled={disabled || (isProcessing && !isPlaying)}
        className="p-3 rounded-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-lg"
        aria-label={isProcessing ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
        title={isProcessing ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
      >
        {renderPlayPauseIcon()}
      </button>
      
      {/* Stop button */}
      {showStop && onStop && (
        <button
          onClick={onStop}
          disabled={disabled}
          className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label="Stop audio"
          title="Stop audio"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z"/>
          </svg>
        </button>
      )}
      
      {/* Next button */}
      <button
        onClick={onNext}
        disabled={disabled || isProcessing || !canGoNext}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        aria-label="Next verse"
        title="Next verse"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* Status indicator */}
      {isBuffering && (
        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span>Buffering</span>
        </div>
      )}
    </div>
  );
}; 