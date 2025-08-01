import React from 'react';
import { useAudio } from '../../context/AudioContext';
import { AudioControls } from './AudioControls';
import { AudioProgress } from './AudioProgress';

export const AudioPlayer: React.FC = () => {
  const { 
    state, 
    playVerse, 
    pauseAudio,
    stopAudio,
    setVolume, 
    setPlaybackRate, 
    seekTo,
    playNextVerse,
    playPreviousVerse,
    clearError
  } = useAudio();

  if (!state.currentVerse) {
    return null;
  }

  const handlePlay = () => {
    if (state.currentVerse) {
      playVerse(state.currentVerse.surahId, state.currentVerse.ayahNumber);
    }
  };

  const handleSeek = (time: number) => {
    seekTo(time);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-50 shadow-lg">
      <div className="max-w-4xl mx-auto">
        {/* Error Message */}
        {state.error && (
          <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-700 dark:text-red-300">
                {state.error}
              </span>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          {/* Verse Info */}
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
              <span className="text-primary-600 dark:text-primary-300 font-semibold text-sm">
                {state.currentVerse.surahId}:{state.currentVerse.ayahNumber}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                Surah {state.currentVerse.surahId}, Verse {state.currentVerse.ayahNumber}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {state.isLoading ? 'Loading...' : state.isPlaying ? 'Playing' : 'Paused'}
              </p>
            </div>
          </div>
          
          {/* Audio Controls */}
          <div className="flex-shrink-0">
            <AudioControls 
              isPlaying={state.isPlaying}
              onPlay={handlePlay}
              onPause={pauseAudio}
              onStop={stopAudio}
              onNext={playNextVerse}
              onPrevious={playPreviousVerse}
              isLoading={state.isLoading}
              isBuffering={state.isBuffering}
              disabled={!!state.error}
              showStop={true}
              canGoNext={true}
              canGoPrevious={state.currentVerse ? state.currentVerse.ayahNumber > 1 : false}
            />
          </div>
          
          {/* Progress and Controls */}
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className="flex-1 min-w-0">
              <AudioProgress 
                progress={state.progress}
                duration={state.duration}
                onSeek={handleSeek}
                disabled={state.isLoading || !!state.error}
              />
            </div>
            
            {/* Volume Control */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={state.volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                disabled={state.isLoading}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
                {Math.round(state.volume * 100)}%
              </span>
            </div>
            
            {/* Playback Speed */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <select
                value={state.playbackRate}
                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                className="text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={state.isLoading}
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};