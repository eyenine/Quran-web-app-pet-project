// Analytics service for tracking user interactions and app performance

interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

interface PageView {
  path: string;
  title: string;
  timestamp: number;
  sessionId: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  sessionId: string;
}

class Analytics {
  private sessionId: string;
  private userId?: string;
  private events: AnalyticsEvent[] = [];
  private pageViews: PageView[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadUserId();
    this.setupPerformanceMonitoring();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadUserId(): void {
    try {
      const stored = localStorage.getItem('quran_analytics_user_id');
      if (stored) {
        this.userId = stored;
      } else {
        this.userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('quran_analytics_user_id', this.userId);
      }
    } catch (error) {
      console.warn('Failed to load/save user ID:', error);
    }
  }

  private setupPerformanceMonitoring(): void {
    if ('performance' in window) {
      // Monitor page load performance
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            this.trackPerformance('page_load_time', navigation.loadEventEnd - navigation.loadEventStart);
            this.trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
          }
        }, 0);
      });

      // Monitor long tasks
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.trackPerformance('long_task', entry.duration);
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      }
    }
  }

  // Track custom events
  trackEvent(category: string, action: string, label?: string, value?: number): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      event: 'interaction',
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  // Track page views
  trackPageView(path: string, title: string): void {
    if (!this.isEnabled) return;

    const pageView: PageView = {
      path,
      title,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.pageViews.push(pageView);
    this.sendPageView(pageView);
  }

  // Track performance metrics
  trackPerformance(name: string, value: number): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.performanceMetrics.push(metric);
    this.sendPerformanceMetric(metric);
  }

  // Track Quran-specific events
  trackSurahView(surahId: number, surahName: string): void {
    this.trackEvent('quran', 'surah_view', surahName, surahId);
  }

  trackAyahPlay(surahId: number, ayahNumber: number): void {
    this.trackEvent('audio', 'ayah_play', `${surahId}:${ayahNumber}`);
  }

  trackBookmarkAdd(surahId: number, ayahNumber: number): void {
    this.trackEvent('bookmarks', 'add', `${surahId}:${ayahNumber}`);
  }

  trackSearch(query: string, resultCount: number): void {
    this.trackEvent('search', 'query', query, resultCount);
  }

  trackThemeChange(theme: 'light' | 'dark'): void {
    this.trackEvent('preferences', 'theme_change', theme);
  }

  trackLanguageChange(language: string): void {
    this.trackEvent('preferences', 'language_change', language);
  }

  trackError(error: Error, context?: string): void {
    this.trackEvent('error', 'app_error', context || error.message);
  }

  // Send data to analytics endpoint
  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // In a real app, you would send this to your analytics service
      // For now, we'll just log it and store locally
      console.log('Analytics Event:', event);
      
      // Store in localStorage for debugging
      const stored = JSON.parse(localStorage.getItem('quran_analytics_events') || '[]');
      stored.push(event);
      localStorage.setItem('quran_analytics_events', JSON.stringify(stored.slice(-100))); // Keep last 100 events
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }

  private async sendPageView(pageView: PageView): Promise<void> {
    try {
      console.log('Page View:', pageView);
      
      const stored = JSON.parse(localStorage.getItem('quran_analytics_pageviews') || '[]');
      stored.push(pageView);
      localStorage.setItem('quran_analytics_pageviews', JSON.stringify(stored.slice(-50))); // Keep last 50 page views
    } catch (error) {
      console.warn('Failed to send page view:', error);
    }
  }

  private async sendPerformanceMetric(metric: PerformanceMetric): Promise<void> {
    try {
      console.log('Performance Metric:', metric);
      
      const stored = JSON.parse(localStorage.getItem('quran_analytics_performance') || '[]');
      stored.push(metric);
      localStorage.setItem('quran_analytics_performance', JSON.stringify(stored.slice(-50))); // Keep last 50 metrics
    } catch (error) {
      console.warn('Failed to send performance metric:', error);
    }
  }

  // Get analytics data for debugging
  getAnalyticsData(): {
    events: AnalyticsEvent[];
    pageViews: PageView[];
    performanceMetrics: PerformanceMetric[];
  } {
    return {
      events: [...this.events],
      pageViews: [...this.pageViews],
      performanceMetrics: [...this.performanceMetrics]
    };
  }

  // Enable/disable analytics
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Clear stored data
  clearData(): void {
    this.events = [];
    this.pageViews = [];
    this.performanceMetrics = [];
    localStorage.removeItem('quran_analytics_events');
    localStorage.removeItem('quran_analytics_pageviews');
    localStorage.removeItem('quran_analytics_performance');
  }
}

// Create singleton instance
export const analytics = new Analytics();

// Export convenience functions
export const trackEvent = (category: string, action: string, label?: string, value?: number) => 
  analytics.trackEvent(category, action, label, value);

export const trackPageView = (path: string, title: string) => 
  analytics.trackPageView(path, title);

export const trackSurahView = (surahId: number, surahName: string) => 
  analytics.trackSurahView(surahId, surahName);

export const trackAyahPlay = (surahId: number, ayahNumber: number) => 
  analytics.trackAyahPlay(surahId, ayahNumber);

export const trackBookmarkAdd = (surahId: number, ayahNumber: number) => 
  analytics.trackBookmarkAdd(surahId, ayahNumber);

export const trackSearch = (query: string, resultCount: number) => 
  analytics.trackSearch(query, resultCount);

export const trackThemeChange = (theme: 'light' | 'dark') => 
  analytics.trackThemeChange(theme);

export const trackLanguageChange = (language: string) => 
  analytics.trackLanguageChange(language);

export const trackError = (error: Error, context?: string) => 
  analytics.trackError(error, context); 