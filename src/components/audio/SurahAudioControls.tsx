import React, { useState } from 'react';
import { useAudio } from '../../context/AudioContext';

interface SurahAudioControlsProps {
  surahId: number;
  totalAyahs: number;
  className?: string;
}

export const SurahAudioControls: React.FC<SurahAudioControlsProps> = ({
  surahId,
  totalAyahs,
  className = ''
}) => {
  const { state, playSurah, pauseAudio, stopAudio, setLooping } = useAudio();
  const [startFromVerse, setStartFromVerse] = useState(1);
  const [showOptions, setShowOptions] = useState(false);

  const isSurahMode = state.playMode === 'surah' && state.surahData?.surahId === surahId;
  const isPlaying = isSurahMode && state.isPlaying;
  const isLoading = isSurahMode && (state.isLoading || state.isBuffering);
  const hasError = isSurahMode && state.error;

  const handlePlaySurah = async () => {
    try {
      if (isPlaying) {
        pauseAudio();
      } else {
        playSurah(surahId, totalAyahs, startFromVerse);
        setShowOptions(false);
      }
    } catch (error) {
      console.error('Error playing surah:', error);
    }
  };

  const handleStop = () => {
    stopAudio();
    setShowOptions(false);
  };

  const getProgressPercentage = () => {
    if (!isSurahMode || !state.currentVerse) return 0;
    return (state.currentVerse.ayahNumber / totalAyahs) * 100;
  };

  const renderPlayButton = () => {
    const buttonClass = `flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
      hasError
        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
        : isPlaying
        ? 'bg-primary-500 text-white shadow-lg hover:bg-primary-600 active:bg-primary-700'
        : 'bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-700'
    } ${isLoading ? 'cursor-wait' : 'cursor-pointer'} disabled:opacity-50`;

    const getButtonText = () => {
      if (hasError) return 'Retry Surah';
      if (isLoading) return 'Loading...';
      if (isPlaying) return 'Pause Surah';
      return 'Play Entire Surah';
    };

    const renderIcon = () => {
      if (isLoading) {
        return <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />;
      }
      
      if (hasError) {
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      }
      
      if (isPlaying) {
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        );
      }
      
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      );
    };

    return (
      <button
        onClick={handlePlaySurah}
        disabled={isLoading && !hasError}
        className={buttonClass}
        aria-label={getButtonText()}
        title={getButtonText()}
      >
        {renderIcon()}
        <span className="text-sm font-medium">{getButtonText()}</span>
      </button>
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-center space-x-3 flex-wrap">
        {renderPlayButton()}
        
        {/* Options toggle */}
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="p-2 rounded-lg transition-all duration-200 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          aria-label="Surah playback options"
          title="Playback options"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
        
        {/* Stop button */}
        {(isPlaying || isSurahMode) && (
          <button
            onClick={handleStop}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Stop surah playback"
            title="Stop playback"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z"/>
            </svg>
            <span className="text-sm font-medium">Stop</span>
          </button>
        )}

        {/* Loop toggle */}
        <button
          onClick={() => setLooping(!state.isLooping)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${state.isLooping ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
          aria-label="Toggle loop"
          title={state.isLooping ? 'Disable loop' : 'Enable loop'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 00-15.5-2M4 16a8 8 0 0015.5 2" />
          </svg>
          <span className="text-sm font-medium">Loop</span>
        </button>
      </div>

      {/* Options panel */}
      {showOptions && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Start from verse:
            </label>
            <select
              value={startFromVerse}
              onChange={(e) => setStartFromVerse(parseInt(e.target.value))}
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isPlaying}
            >
              {Array.from({ length: totalAyahs }, (_, i) => i + 1).map((verse) => (
                <option key={verse} value={verse}>
                  Verse {verse}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Progress indicator */}
      {isSurahMode && state.currentVerse && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Playing verse {state.currentVerse.ayahNumber} of {totalAyahs}</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          
          {/* Status indicators */}
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            {state.isBuffering && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Buffering...</span>
              </div>
            )}
            
            {isPlaying && !state.isBuffering && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Playing</span>
              </div>
            )}
            
            {hasError && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Error: {state.error}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};