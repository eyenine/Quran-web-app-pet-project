import React, { createContext, useContext, useReducer, useCallback, ReactNode, useRef, useEffect } from 'react';

interface AudioState {
  isPlaying: boolean;
  currentVerse: { surahId: number; ayahNumber: number } | null;
  audioUrl: string | null;
  progress: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isLoading: boolean;
  error: string | null;
  playMode: 'single' | 'surah';
  surahData: { surahId: number; totalAyahs: number } | null;
  isBuffering: boolean;
}

type AudioAction =
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_CURRENT_VERSE'; payload: { surahId: number; ayahNumber: number } | null }
  | { type: 'SET_AUDIO_URL'; payload: string | null }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_PLAYBACK_RATE'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_BUFFERING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PLAY_MODE'; payload: 'single' | 'surah' }
  | { type: 'SET_SURAH_DATA'; payload: { surahId: number; totalAyahs: number } | null }
  | { type: 'RESET' };

const initialState: AudioState = {
  isPlaying: false,
  currentVerse: null,
  audioUrl: null,
  progress: 0,
  duration: 0,
  volume: 0.8,
  playbackRate: 1,
  isLoading: false,
  isBuffering: false,
  error: null,
  playMode: 'single',
  surahData: null,
};

function audioReducer(state: AudioState, action: AudioAction): AudioState {
  switch (action.type) {
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_CURRENT_VERSE':
      return { ...state, currentVerse: action.payload };
    case 'SET_AUDIO_URL':
      return { ...state, audioUrl: action.payload };
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'SET_PLAYBACK_RATE':
      return { ...state, playbackRate: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_BUFFERING':
      return { ...state, isBuffering: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PLAY_MODE':
      return { ...state, playMode: action.payload };
    case 'SET_SURAH_DATA':
      return { ...state, surahData: action.payload };
    case 'RESET':
      return { ...initialState, volume: state.volume, playbackRate: state.playbackRate };
    default:
      return state;
  }
}

interface AudioContextType {
  state: AudioState;
  playVerse: (surahId: number, ayahNumber: number) => void;
  playSurah: (surahId: number, totalAyahs: number, startFromAyah?: number) => void;
  pauseAudio: () => void;
  stopAudio: () => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  updateProgress: (progress: number) => void;
  seekTo: (time: number) => void;
  playNextVerse: () => void;
  playPreviousVerse: () => void;
  clearError: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(audioReducer, initialState);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);

  // Enhanced cleanup function
  const cleanupAudio = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (audioRef.current) {
      const audio = audioRef.current;
      
      // Remove all event listeners
      audio.removeEventListener('loadstart', () => {});
      audio.removeEventListener('loadeddata', () => {});
      audio.removeEventListener('loadedmetadata', () => {});
      audio.removeEventListener('canplay', () => {});
      audio.removeEventListener('canplaythrough', () => {});
      audio.removeEventListener('timeupdate', () => {});
      audio.removeEventListener('ended', () => {});
      audio.removeEventListener('error', () => {});
      audio.removeEventListener('waiting', () => {});
      audio.removeEventListener('playing', () => {});
      audio.removeEventListener('pause', () => {});
      
      // Stop and reset audio
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
      audioRef.current = null;
    }
  }, []);

  // Enhanced audio creation with better error handling
  const createAudioElement = useCallback((audioUrl: string) => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    audio.volume = state.volume;
    audio.playbackRate = state.playbackRate;
    
    return audio;
  }, [state.volume, state.playbackRate]);

  // Forward declaration for recursive function
  const playAudioRef = useRef<((surahId: number, ayahNumber: number, mode?: 'single' | 'surah') => Promise<void>) | null>(null);

  // Main play function with improved error handling
  const playAudio = useCallback(async (surahId: number, ayahNumber: number, mode: 'single' | 'surah' = 'single') => {
    if (isUnmountedRef.current) return;

    // Clean up any existing audio
    cleanupAudio();
    
    dispatch({ type: 'SET_CURRENT_VERSE', payload: { surahId, ayahNumber } });
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_BUFFERING', payload: false });
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_PROGRESS', payload: 0 });
    dispatch({ type: 'SET_DURATION', payload: 0 });
    
    // Generate audio URL with better formatting
    const paddedSurah = surahId.toString().padStart(3, '0');
    const paddedAyah = ayahNumber.toString().padStart(3, '0');
    const audioUrl = `https://verses.quran.com/Alafasy/mp3/${paddedSurah}${paddedAyah}.mp3`;
    
    dispatch({ type: 'SET_AUDIO_URL', payload: audioUrl });
    
    try {
      const audio = createAudioElement(audioUrl);
      audioRef.current = audio;
      
      // Set up event listeners with proper cleanup
      const handleLoadStart = () => {
        if (!isUnmountedRef.current) {
          dispatch({ type: 'SET_LOADING', payload: true });
          dispatch({ type: 'SET_BUFFERING', payload: true });
        }
      };

      const handleLoadedData = () => {
        if (!isUnmountedRef.current) {
          dispatch({ type: 'SET_BUFFERING', payload: false });
        }
      };

      const handleLoadedMetadata = () => {
        if (!isUnmountedRef.current) {
          dispatch({ type: 'SET_DURATION', payload: audio.duration || 0 });
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      };

      const handleCanPlay = () => {
        if (!isUnmountedRef.current) {
          dispatch({ type: 'SET_LOADING', payload: false });
          dispatch({ type: 'SET_BUFFERING', payload: false });
        }
      };

      const handleTimeUpdate = () => {
        if (!isUnmountedRef.current && audio.currentTime) {
          dispatch({ type: 'SET_PROGRESS', payload: audio.currentTime });
        }
      };

      const handleWaiting = () => {
        if (!isUnmountedRef.current) {
          dispatch({ type: 'SET_BUFFERING', payload: true });
        }
      };

      const handlePlaying = () => {
        if (!isUnmountedRef.current) {
          dispatch({ type: 'SET_PLAYING', payload: true });
          dispatch({ type: 'SET_BUFFERING', payload: false });
        }
      };

      const handlePause = () => {
        if (!isUnmountedRef.current) {
          dispatch({ type: 'SET_PLAYING', payload: false });
        }
      };

      const handleEnded = () => {
        if (isUnmountedRef.current) return;
        
        dispatch({ type: 'SET_PLAYING', payload: false });
        dispatch({ type: 'SET_PROGRESS', payload: 0 });
        
        // Handle auto-play next verse in surah mode
        if (mode === 'surah' && state.surahData) {
          const nextAyah = ayahNumber + 1;
          if (nextAyah <= state.surahData.totalAyahs) {
            timeoutRef.current = setTimeout(() => {
              if (!isUnmountedRef.current && playAudioRef.current) {
                playAudioRef.current(surahId, nextAyah, 'surah');
              }
            }, 800); // Smooth transition delay
          } else {
            // End of surah
            dispatch({ type: 'SET_PLAY_MODE', payload: 'single' });
            dispatch({ type: 'SET_SURAH_DATA', payload: null });
          }
        }
      };

      const handleError = (e: Event) => {
        if (!isUnmountedRef.current) {
          console.error('Audio error:', e);
          dispatch({ type: 'SET_ERROR', payload: 'Failed to load audio. Please try again.' });
          dispatch({ type: 'SET_LOADING', payload: false });
          dispatch({ type: 'SET_BUFFERING', payload: false });
          dispatch({ type: 'SET_PLAYING', payload: false });
        }
      };

      // Add event listeners
      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('loadeddata', handleLoadedData);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('waiting', handleWaiting);
      audio.addEventListener('playing', handlePlaying);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      // Set source and load
      audio.src = audioUrl;
      audio.load();

      // Attempt to play
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
      }
      
    } catch (error) {
      if (!isUnmountedRef.current) {
        console.error('Error playing audio:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to play audio. Please check your connection.' });
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_BUFFERING', payload: false });
        dispatch({ type: 'SET_PLAYING', payload: false });
      }
    }
  }, [state.volume, state.playbackRate, state.surahData, cleanupAudio, createAudioElement]);

  // Set the ref after playAudio is defined
  useEffect(() => {
    playAudioRef.current = playAudio;
  }, [playAudio]);

  const playVerse = useCallback((surahId: number, ayahNumber: number) => {
    dispatch({ type: 'SET_PLAY_MODE', payload: 'single' });
    dispatch({ type: 'SET_SURAH_DATA', payload: null });
    playAudio(surahId, ayahNumber, 'single');
  }, [playAudio]);

  const playSurah = useCallback((surahId: number, totalAyahs: number, startFromAyah: number = 1) => {
    dispatch({ type: 'SET_PLAY_MODE', payload: 'surah' });
    dispatch({ type: 'SET_SURAH_DATA', payload: { surahId, totalAyahs } });
    playAudio(surahId, startFromAyah, 'surah');
  }, [playAudio]);

  const pauseAudio = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);

  const resumeAudio = useCallback(async () => {
    if (audioRef.current && audioRef.current.paused) {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('Error resuming audio:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to resume audio' });
      }
    }
  }, []);

  const stopAudio = useCallback(() => {
    cleanupAudio();
    dispatch({ type: 'RESET' });
  }, [cleanupAudio]);

  const setVolume = useCallback((volume: number) => {
    const newVolume = Math.max(0, Math.min(1, volume));
    dispatch({ type: 'SET_VOLUME', payload: newVolume });
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    const newRate = Math.max(0.5, Math.min(2, rate));
    dispatch({ type: 'SET_PLAYBACK_RATE', payload: newRate });
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current && !isNaN(time) && time >= 0) {
      audioRef.current.currentTime = Math.min(time, audioRef.current.duration || 0);
    }
  }, []);

  const playNextVerse = useCallback(() => {
    if (state.currentVerse) {
      const { surahId, ayahNumber } = state.currentVerse;
      const nextAyah = ayahNumber + 1;
      
      if (state.playMode === 'surah' && state.surahData) {
        if (nextAyah <= state.surahData.totalAyahs) {
          playAudio(surahId, nextAyah, 'surah');
        }
      } else {
        playVerse(surahId, nextAyah);
      }
    }
  }, [state.currentVerse, state.playMode, state.surahData, playVerse, playAudio]);

  const playPreviousVerse = useCallback(() => {
    if (state.currentVerse && state.currentVerse.ayahNumber > 1) {
      const { surahId, ayahNumber } = state.currentVerse;
      const prevAyah = ayahNumber - 1;
      
      if (state.playMode === 'surah' && state.surahData) {
        playAudio(surahId, prevAyah, 'surah');
      } else {
        playVerse(surahId, prevAyah);
      }
    }
  }, [state.currentVerse, state.playMode, state.surahData, playVerse, playAudio]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const updateProgress = useCallback((progress: number) => {
    dispatch({ type: 'SET_PROGRESS', payload: progress });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    isUnmountedRef.current = false;
    
    return () => {
      isUnmountedRef.current = true;
      cleanupAudio();
    };
  }, [cleanupAudio]);

  // Handle play/pause toggle
  const togglePlayPause = useCallback(() => {
    if (state.isPlaying) {
      pauseAudio();
    } else if (state.currentVerse && audioRef.current) {
      resumeAudio();
    }
  }, [state.isPlaying, state.currentVerse, pauseAudio, resumeAudio]);

  const value: AudioContextType = {
    state,
    playVerse,
    playSurah,
    pauseAudio,
    stopAudio,
    setVolume,
    setPlaybackRate,
    updateProgress,
    seekTo,
    playNextVerse,
    playPreviousVerse,
    clearError,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};