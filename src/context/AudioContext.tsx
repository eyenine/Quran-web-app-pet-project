import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

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
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

const initialState: AudioState = {
  isPlaying: false,
  currentVerse: null,
  audioUrl: null,
  progress: 0,
  duration: 0,
  volume: 1,
  playbackRate: 1,
  isLoading: false,
  error: null,
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
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface AudioContextType {
  state: AudioState;
  playVerse: (surahId: number, ayahNumber: number) => void;
  pauseAudio: () => void;
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

  const playVerse = useCallback((surahId: number, ayahNumber: number) => {
    dispatch({ type: 'SET_CURRENT_VERSE', payload: { surahId, ayahNumber } });
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    // Generate audio URL
    const paddedSurah = surahId.toString().padStart(3, '0');
    const paddedAyah = ayahNumber.toString().padStart(3, '0');
    const audioUrl = `https://verses.quran.com/Alafasy/mp3/${paddedSurah}${paddedAyah}.mp3`;
    
    dispatch({ type: 'SET_AUDIO_URL', payload: audioUrl });
    
    // Create and play audio
    const audio = new Audio(audioUrl);
    audio.volume = state.volume;
    audio.playbackRate = state.playbackRate;
    
    audio.addEventListener('loadedmetadata', () => {
      dispatch({ type: 'SET_DURATION', payload: audio.duration });
      dispatch({ type: 'SET_LOADING', payload: false });
    });
    
    audio.addEventListener('timeupdate', () => {
      dispatch({ type: 'SET_PROGRESS', payload: audio.currentTime });
    });
    
    audio.addEventListener('ended', () => {
      dispatch({ type: 'SET_PLAYING', payload: false });
      dispatch({ type: 'SET_PROGRESS', payload: 0 });
    });
    
    audio.addEventListener('error', () => {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load audio' });
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_PLAYING', payload: false });
    });
    
    audio.play()
      .then(() => {
        dispatch({ type: 'SET_PLAYING', payload: true });
      })
      .catch((error) => {
        console.error('Error playing audio:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to play audio' });
        dispatch({ type: 'SET_LOADING', payload: false });
      });
  }, [state.volume, state.playbackRate]);

  const pauseAudio = useCallback(() => {
    dispatch({ type: 'SET_PLAYING', payload: false });
  }, []);

  const setVolume = useCallback((volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: Math.max(0, Math.min(1, volume)) });
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    dispatch({ type: 'SET_PLAYBACK_RATE', payload: Math.max(0.5, Math.min(2, rate)) });
  }, []);

  const updateProgress = useCallback((progress: number) => {
    dispatch({ type: 'SET_PROGRESS', payload: progress });
  }, []);

  const seekTo = useCallback((time: number) => {
    dispatch({ type: 'SET_PROGRESS', payload: time });
  }, []);

  const playNextVerse = useCallback(() => {
    if (state.currentVerse) {
      const { surahId, ayahNumber } = state.currentVerse;
      playVerse(surahId, ayahNumber + 1);
    }
  }, [state.currentVerse, playVerse]);

  const playPreviousVerse = useCallback(() => {
    if (state.currentVerse) {
      const { surahId, ayahNumber } = state.currentVerse;
      if (ayahNumber > 1) {
        playVerse(surahId, ayahNumber - 1);
      }
    }
  }, [state.currentVerse, playVerse]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const value: AudioContextType = {
    state,
    playVerse,
    pauseAudio,
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