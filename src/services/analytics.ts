// Analytics Service
// This is a simple analytics service that can be extended with actual analytics providers

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

export interface AnalyticsService {
  track(eventName: string, properties?: Record<string, any>): void;
  identify(userId: string, traits?: Record<string, any>): void;
  page(path: string, properties?: Record<string, any>): void;
  getAnalyticsData(): any;
}

// Simple console-based analytics service for development
class ConsoleAnalyticsService implements AnalyticsService {
  track(eventName: string, properties?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Analytics Event: ${eventName}`, properties);
    }
    
    // In production, you would send this to your analytics provider
    // Example: Google Analytics, Mixpanel, Amplitude, etc.
    this.sendToProvider(eventName, properties);
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Analytics Identify: ${userId}`, traits);
    }
    
    this.sendToProvider('identify', { userId, traits });
  }

  page(path: string, properties?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Analytics Page: ${path}`, properties);
    }
    
    this.sendToProvider('page', { path, ...properties });
  }

  private sendToProvider(eventName: string, properties?: Record<string, any>): void {
    // This is where you would integrate with actual analytics providers
    // For now, we'll just store events in localStorage for debugging
    
    try {
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      events.push({
        event: eventName,
        properties,
        timestamp: new Date().toISOString(),
      });
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
    }
  }

  getAnalyticsData(): any {
    try {
      return JSON.parse(localStorage.getItem('analytics_events') || '[]');
    } catch {
      return [];
    }
  }
}

// Google Analytics 4 integration (optional)
class GoogleAnalyticsService implements AnalyticsService {
  private gtag: any;

  constructor() {
    this.gtag = (window as any).gtag;
  }

  track(eventName: string, properties?: Record<string, any>): void {
    if (this.gtag) {
      this.gtag('event', eventName, properties);
    } else {
      console.warn('Google Analytics not loaded');
    }
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (this.gtag) {
      this.gtag('config', 'GA_MEASUREMENT_ID', {
        user_id: userId,
        custom_map: traits,
      });
    }
  }

  page(path: string, properties?: Record<string, any>): void {
    if (this.gtag) {
      this.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: path,
        ...properties,
      });
    }
  }

  getAnalyticsData(): any {
    try {
      return JSON.parse(localStorage.getItem('analytics_events') || '[]');
    } catch {
      return [];
    }
  }
}

// Mixpanel integration (optional)
class MixpanelService implements AnalyticsService {
  private mixpanel: any;

  constructor() {
    this.mixpanel = (window as any).mixpanel;
  }

  track(eventName: string, properties?: Record<string, any>): void {
    if (this.mixpanel) {
      this.mixpanel.track(eventName, properties);
    } else {
      console.warn('Mixpanel not loaded');
    }
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (this.mixpanel) {
      this.mixpanel.identify(userId);
      if (traits) {
        this.mixpanel.people.set(traits);
      }
    }
  }

  page(path: string, properties?: Record<string, any>): void {
    if (this.mixpanel) {
      this.mixpanel.track('Page View', { path, ...properties });
    }
  }

  getAnalyticsData(): any {
    try {
      return JSON.parse(localStorage.getItem('analytics_events') || '[]');
    } catch {
      return [];
    }
  }
}

// Analytics service factory
export function createAnalyticsService(provider: 'console' | 'ga' | 'mixpanel' = 'console'): AnalyticsService {
  switch (provider) {
    case 'ga':
      return new GoogleAnalyticsService();
    case 'mixpanel':
      return new MixpanelService();
    default:
      return new ConsoleAnalyticsService();
  }
}

// Default analytics instance
export const analytics: AnalyticsService = createAnalyticsService();

// Analytics configuration
export interface AnalyticsConfig {
  provider: 'console' | 'ga' | 'mixpanel';
  enabled: boolean;
  debug: boolean;
  userId?: string;
  sessionId?: string;
}

export const analyticsConfig: AnalyticsConfig = {
  provider: 'console',
  enabled: true,
  debug: process.env.NODE_ENV === 'development',
  userId: undefined,
  sessionId: undefined,
};

// Initialize analytics
export function initializeAnalytics(config: Partial<AnalyticsConfig> = {}): void {
  Object.assign(analyticsConfig, config);
  
  // Generate session ID if not provided
  if (!analyticsConfig.sessionId) {
    analyticsConfig.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Set user ID from localStorage if available
  if (!analyticsConfig.userId) {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      analyticsConfig.userId = storedUserId;
    }
  }
  
  // Identify user if available
  if (analyticsConfig.userId) {
    analytics.identify(analyticsConfig.userId, {
      sessionId: analyticsConfig.sessionId,
      appVersion: process.env.REACT_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV,
    });
  }
  
  if (analyticsConfig.debug) {
    console.log('📊 Analytics initialized:', analyticsConfig);
  }
}

// Utility functions
export function setUserId(userId: string): void {
  analyticsConfig.userId = userId;
  localStorage.setItem('user_id', userId);
  analytics.identify(userId);
}

export function getAnalyticsEvents(): any[] {
  try {
    return JSON.parse(localStorage.getItem('analytics_events') || '[]');
  } catch {
    return [];
  }
}

export function clearAnalyticsEvents(): void {
  localStorage.removeItem('analytics_events');
}

export function exportAnalyticsData(): string {
  const events = getAnalyticsEvents();
  const data = {
    exportDate: new Date().toISOString(),
    config: analyticsConfig,
    events,
  };
  return JSON.stringify(data, null, 2);
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  initializeAnalytics();
} 