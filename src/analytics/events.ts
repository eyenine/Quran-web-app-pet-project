// Analytics Events Utility
import { analytics } from '../services/analytics';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

export interface PageViewEvent extends AnalyticsEvent {
  name: 'page_view';
  properties: {
    path: string;
    title?: string;
    referrer?: string;
  };
}

export interface SearchEvent extends AnalyticsEvent {
  name: 'search';
  properties: {
    query: string;
    resultsCount: number;
    filters?: Record<string, any>;
  };
}

export interface AudioEvent extends AnalyticsEvent {
  name: 'audio_play' | 'audio_pause' | 'audio_stop' | 'audio_seek';
  properties: {
    surahId: number;
    ayah?: number;
    duration?: number;
    position?: number;
    qariId?: number;
    playbackRate?: number;
  };
}

export interface TafsirEvent extends AnalyticsEvent {
  name: 'tafsir_open' | 'tafsir_close';
  properties: {
    ayahKey: string;
    sourceId: number;
    sourceName: string;
    language: string;
  };
}

export interface BookmarkEvent extends AnalyticsEvent {
  name: 'bookmark_add' | 'bookmark_remove';
  properties: {
    ayahKey: string;
    surahId: number;
    ayahNumber: number;
    folderId?: string;
  };
}

export interface NoteEvent extends AnalyticsEvent {
  name: 'note_save' | 'note_delete';
  properties: {
    ayahKey: string;
    surahId: number;
    ayahNumber: number;
    contentLength: number;
    tags?: string[];
  };
}

export interface ErrorEvent extends AnalyticsEvent {
  name: 'error';
  properties: {
    code: string;
    message: string;
    stack?: string;
    context?: Record<string, any>;
  };
}

export interface UserPreferenceEvent extends AnalyticsEvent {
  name: 'preference_change';
  properties: {
    category: 'theme' | 'language' | 'audio' | 'reader' | 'tafsir';
    key: string;
    oldValue?: any;
    newValue: any;
  };
}

export interface CacheEvent extends AnalyticsEvent {
  name: 'cache_hit' | 'cache_miss' | 'cache_clear';
  properties: {
    type: 'surah' | 'tafsir' | 'info' | 'audio';
    key: string;
    size?: number;
  };
}

export type AnalyticsEventType = 
  | PageViewEvent
  | SearchEvent
  | AudioEvent
  | TafsirEvent
  | BookmarkEvent
  | NoteEvent
  | ErrorEvent
  | UserPreferenceEvent
  | CacheEvent;

// Event tracking functions
export const trackPageView = (path: string, title?: string, referrer?: string) => {
  const event: PageViewEvent = {
    name: 'page_view',
    properties: {
      path,
      title,
      referrer: referrer || document.referrer,
    },
    timestamp: Date.now(),
  };
  
  analytics.track(event.name, event.properties);
  console.log('📊 Analytics: Page View', event);
};

export const trackSearch = (query: string, resultsCount: number, filters?: Record<string, any>) => {
  const event: SearchEvent = {
    name: 'search',
    properties: {
      query,
      resultsCount,
      filters,
    },
    timestamp: Date.now(),
  };
  
  analytics.track(event.name, event.properties);
  console.log('📊 Analytics: Search', event);
};

export const trackAudioPlay = (surahId: number, ayah?: number, duration?: number, qariId?: number, playbackRate?: number) => {
  const event: AudioEvent = {
    name: 'audio_play',
    properties: {
      surahId,
      ayah,
      duration,
      qariId,
      playbackRate,
    },
    timestamp: Date.now(),
  };
  
  analytics.track(event.name, event.properties);
  console.log('📊 Analytics: Audio Play', event);
};

export const trackAudioPause = (surahId: number, ayah?: number, position?: number, duration?: number) => {
  const event: AudioEvent = {
    name: 'audio_pause',
    properties: {
      surahId,
      ayah,
      position,
      duration,
    },
    timestamp: Date.now(),
  };
  
  analytics.track(event.name, event.properties);
  console.log('📊 Analytics: Audio Pause', event);
};

export const trackTafsirOpen = (ayahKey: string, sourceId: number, sourceName: string, language: string) => {
  const event: TafsirEvent = {
    name: 'tafsir_open',
    properties: {
      ayahKey,
      sourceId,
      sourceName,
      language,
    },
    timestamp: Date.now(),
  };
  
  analytics.track(event.name, event.properties);
  console.log('📊 Analytics: Tafsir Open', event);
};

export const trackBookmarkAdd = (ayahKey: string, surahId: number, ayahNumber: number, folderId?: string) => {
  const event: BookmarkEvent = {
    name: 'bookmark_add',
    properties: {
      ayahKey,
      surahId,
      ayahNumber,
      folderId,
    },
    timestamp: Date.now(),
  };
  
  analytics.track(event.name, event.properties);
  console.log('📊 Analytics: Bookmark Add', event);
};

export const trackBookmarkRemove = (ayahKey: string, surahId: number, ayahNumber: number) => {
  const event: BookmarkEvent = {
    name: 'bookmark_remove',
    properties: {
      ayahKey,
      surahId,
      ayahNumber,
    },
    timestamp: Date.now(),
  };
  
  analytics.track(event.name, event.properties);
  console.log('📊 Analytics: Bookmark Remove', event);
};

export const trackNoteSave = (ayahKey: string, surahId: number, ayahNumber: number, contentLength: number, tags?: string[]) => {
  const event: NoteEvent = {
    name: 'note_save',
    properties: {
      ayahKey,
      surahId,
      ayahNumber,
      contentLength,
      tags,
    },
    timestamp: Date.now(),
  };
  
  analytics.track(event.name, event.properties);
  console.log('📊 Analytics: Note Save', event);
};

export const trackError = (code: string, message: string, stack?: string, context?: Record<string, any>) => {
  const event: ErrorEvent = {
    name: 'error',
    properties: {
      code,
      message,
      stack,
      context,
    },
    timestamp: Date.now(),
  };
  
  analytics.track(event.name, event.properties);
  console.error('📊 Analytics: Error', event);
};

export const trackPreferenceChange = (category: string, key: string, newValue: any, oldValue?: any) => {
  const event: UserPreferenceEvent = {
    name: 'preference_change',
    properties: {
      category: category as any,
      key,
      oldValue,
      newValue,
    },
    timestamp: Date.now(),
  };
  
  analytics.track(event.name, event.properties);
  console.log('📊 Analytics: Preference Change', event);
};

export const trackCacheHit = (type: string, key: string, size?: number) => {
  const event: CacheEvent = {
    name: 'cache_hit',
    properties: {
      type: type as any,
      key,
      size,
    },
    timestamp: Date.now(),
  };
  
  analytics.track(event.name, event.properties);
  console.log('📊 Analytics: Cache Hit', event);
};

export const trackCacheMiss = (type: string, key: string) => {
  const event: CacheEvent = {
    name: 'cache_miss',
    properties: {
      type: type as any,
      key,
    },
    timestamp: Date.now(),
  };
  
  analytics.track(event.name, event.properties);
  console.log('📊 Analytics: Cache Miss', event);
};

// Batch tracking for performance
export class AnalyticsBatch {
  private events: AnalyticsEventType[] = [];
  private batchSize: number;
  private flushInterval: number;
  private timer: NodeJS.Timeout | null = null;

  constructor(batchSize = 10, flushInterval = 5000) {
    this.batchSize = batchSize;
    this.flushInterval = flushInterval;
    this.startTimer();
  }

  add(event: AnalyticsEventType) {
    this.events.push(event);
    
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  flush() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    // Send events in batch
    eventsToSend.forEach(event => {
      analytics.track(event.name, event.properties);
    });

    console.log(`📊 Analytics: Batch sent ${eventsToSend.length} events`);
  }

  private startTimer() {
    this.timer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.flush();
  }
}

// Export batch instance
export const analyticsBatch = new AnalyticsBatch();

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    analyticsBatch.destroy();
  });
}

