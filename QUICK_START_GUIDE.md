# 🚀 Quick Start Guide - Verse-by-Verse Audio Playback

## 🎯 Getting Started with Feature Implementation

This guide will help you implement the **Verse-by-Verse Audio Playback** feature, which is the first priority feature in our roadmap.

---

## 📋 Prerequisites

1. **Current Project Status:** ✅ Ready
2. **Dependencies:** None (can start immediately)
3. **Estimated Time:** 3-4 days
4. **Difficulty:** Medium

---

## 🛠️ Step-by-Step Implementation

### **Step 1: Set Up Dependencies**

First, add the required dependencies to your project:

```bash
npm install html2canvas qrcode.react react-hook-form react-query framer-motion react-hotkeys-hook react-intersection-observer
```

### **Step 2: Create Audio Context**

Create the audio context to manage global audio state:

```typescript
// src/context/AudioContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface AudioState {
  isPlaying: boolean;
  currentVerse: { surahId: number; ayahNumber: number } | null;
  audioUrl: string | null;
  progress: number;
  duration: number;
  volume: number;
  playbackRate: number;
}

interface AudioContextType {
  state: AudioState;
  playVerse: (surahId: number, ayahNumber: number) => void;
  pauseAudio: () => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  updateProgress: (progress: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Implementation here
};
```

### **Step 3: Create Audio Service**

Create the audio service to handle API calls and audio file management:

```typescript
// src/services/audioService.ts
export class AudioService {
  private audioElement: HTMLAudioElement | null = null;
  
  constructor() {
    this.audioElement = new Audio();
    this.setupAudioEventListeners();
  }
  
  private setupAudioEventListeners() {
    if (!this.audioElement) return;
    
    this.audioElement.addEventListener('timeupdate', this.handleTimeUpdate);
    this.audioElement.addEventListener('ended', this.handleAudioEnded);
    this.audioElement.addEventListener('error', this.handleAudioError);
  }
  
  public getAudioUrl(surahId: number, ayahNumber: number): string {
    // Format: https://verses.quran.com/Alafasy/mp3/001001.mp3
    const paddedSurah = surahId.toString().padStart(3, '0');
    const paddedAyah = ayahNumber.toString().padStart(3, '0');
    return `https://verses.quran.com/Alafasy/mp3/${paddedSurah}${paddedAyah}.mp3`;
  }
  
  public async playVerse(surahId: number, ayahNumber: number): Promise<void> {
    if (!this.audioElement) return;
    
    const audioUrl = this.getAudioUrl(surahId, ayahNumber);
    this.audioElement.src = audioUrl;
    
    try {
      await this.audioElement.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }
  
  public pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }
  
  public setVolume(volume: number): void {
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, volume));
    }
  }
  
  public setPlaybackRate(rate: number): void {
    if (this.audioElement) {
      this.audioElement.playbackRate = Math.max(0.5, Math.min(2, rate));
    }
  }
  
  private handleTimeUpdate = () => {
    if (!this.audioElement) return;
    // Update progress in context
  };
  
  private handleAudioEnded = () => {
    // Auto-play next verse or stop
  };
  
  private handleAudioError = (error: Event) => {
    console.error('Audio playback error:', error);
  };
}

export const audioService = new AudioService();
```

### **Step 4: Create Audio Player Component**

Create the main audio player component:

```typescript
// src/components/audio/AudioPlayer.tsx
import React from 'react';
import { useAudio } from '../../context/AudioContext';
import { AudioControls } from './AudioControls';
import { AudioProgress } from './AudioProgress';

export const AudioPlayer: React.FC = () => {
  const { state, playVerse, pauseAudio, setVolume, setPlaybackRate } = useAudio();
  
  if (!state.currentVerse) {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Surah {state.currentVerse.surahId}:{state.currentVerse.ayahNumber}
            </div>
          </div>
          
          <AudioControls 
            isPlaying={state.isPlaying}
            onPlay={() => playVerse(state.currentVerse!.surahId, state.currentVerse!.ayahNumber)}
            onPause={pauseAudio}
            onNext={() => {/* Implement next verse */}}
            onPrevious={() => {/* Implement previous verse */}}
          />
          
          <div className="flex items-center space-x-4">
            <AudioProgress 
              progress={state.progress}
              duration={state.duration}
              onSeek={(progress) => {/* Implement seek */}}
            />
            
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={state.volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(state.volume * 100)}%
              </span>
            </div>
            
            <select
              value={state.playbackRate}
              onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
              className="text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
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
  );
};
```

### **Step 5: Create Audio Controls Component**

```typescript
// src/components/audio/AudioControls.tsx
import React from 'react';

interface AudioControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onPrevious}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Previous verse"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="p-3 rounded-full bg-primary-600 hover:bg-primary-700 text-white transition-colors"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>
      
      <button
        onClick={onNext}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Next verse"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};
```

### **Step 6: Create Audio Progress Component**

```typescript
// src/components/audio/AudioProgress.tsx
import React from 'react';

interface AudioProgressProps {
  progress: number;
  duration: number;
  onSeek: (progress: number) => void;
}

export const AudioProgress: React.FC<AudioProgressProps> = ({
  progress,
  duration,
  onSeek
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
        {formatTime(progress)}
      </span>
      
      <div className="flex-1 relative">
        <input
          type="range"
          min="0"
          max={duration}
          value={progress}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
      
      <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
        {formatTime(duration)}
      </span>
    </div>
  );
};
```

### **Step 7: Integrate with AyahDisplay Component**

Update the AyahDisplay component to include audio controls:

```typescript
// src/components/quran/AyahDisplay.tsx
// Add to existing imports:
import { useAudio } from '../../context/AudioContext';

// Add inside the component:
const { playVerse, pauseAudio } = useAudio();

// Add audio button to each verse:
<button
  onClick={() => playVerse(ayah.surahId, ayah.ayahNumber)}
  className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-800/20 rounded-md transition-colors"
  aria-label="Play audio"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
</button>
```

### **Step 8: Add Audio Provider to App**

Update your App.tsx to include the AudioProvider:

```typescript
// src/App.tsx
// Add to imports:
import { AudioProvider } from './context/AudioContext';

// Wrap your app with AudioProvider:
function App() {
  return (
    <AudioProvider>
      {/* Your existing providers and components */}
    </AudioProvider>
  );
}
```

### **Step 9: Add Audio Player to Layout**

Add the AudioPlayer component to your main layout:

```typescript
// src/components/layout/AppLayout.tsx
// Add to imports:
import { AudioPlayer } from '../audio/AudioPlayer';

// Add at the bottom of your layout:
<AudioPlayer />
```

---

## 🧪 Testing Your Implementation

1. **Test basic playback:**
   - Click the play button on any verse
   - Verify audio starts playing
   - Check that the audio player appears at the bottom

2. **Test controls:**
   - Pause/play functionality
   - Volume control
   - Playback speed control
   - Progress bar seeking

3. **Test mobile compatibility:**
   - Touch controls work properly
   - Audio player is responsive
   - No layout issues on small screens

---

## 🎯 Next Steps

After completing this feature:

1. **Update the project board** - Move this feature to "Done"
2. **Start the next feature** - Aesthetic Enhancements
3. **Gather user feedback** on the audio playback
4. **Document any issues** for future improvements

---

## 📝 Notes

- The audio URLs used are from mp3quran.net (Alafasy recitation)
- Consider adding error handling for failed audio loads
- Implement audio caching for better performance
- Add keyboard shortcuts for audio controls
- Consider adding a playlist feature for continuous playback

---

*This guide provides the foundation for implementing verse-by-verse audio playback. You can extend it with additional features like auto-play next verse, playlist management, and more advanced controls.* 