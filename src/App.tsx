import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './context';
import { AudioProvider } from './context/AudioContext';
import { AppLayout, ErrorBoundary, LoadingSpinner } from './components';
import { preloadCriticalData } from './services';
import { Surah } from './types';
import './App.css';

// Dynamic imports with prefetching
const HomePage = React.lazy(() => 
  import('./pages/HomePage').then(module => ({ default: module.HomePage }))
);

const SurahPage = React.lazy(() => 
  import('./pages/SurahPage').then(module => ({ default: module.SurahPage }))
);

const SurahsPage = React.lazy(() => 
  import('./pages/SurahsPage').then(module => ({ default: module.SurahsPage }))
);

const SearchPage = React.lazy(() => 
  import('./pages/SearchPage').then(module => ({ default: module.SearchPage }))
);

const BookmarksPage = React.lazy(() => 
  import('./pages/BookmarksPage').then(module => ({ default: module.BookmarksPage }))
);

const SettingsPage = React.lazy(() => 
  import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage }))
);

const JuzPage = React.lazy(() => 
  import('./pages/JuzPage').then(module => ({ default: module.JuzPage }))
);

// Prefetch routes when visible in viewport
const prefetchRoute = (path: string) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = path;
  document.head.appendChild(link);
  return () => document.head.removeChild(link);
};

const AppContent: React.FC = () => {
  // Prefetch routes when they come into viewport
  const handleScroll = React.useCallback(() => {
    const routes = [
      { path: '/surah', component: SurahPage },
      { path: '/search', component: SearchPage },
      { path: '/bookmarks', component: BookmarksPage }
    ];

    routes.forEach(({ path, component }) => {
      const routeElement = document.querySelector(`[to="${path}"]`);
      if (routeElement && isElementInViewport(routeElement)) {
        prefetchRoute(path);
        // Handle React.lazy component preloading
        if (typeof component === 'function' && component.constructor.name === 'Lazy') {
          // @ts-ignore - Accessing private property for lazy loading
          const lazyComponent = component as any;
          if (lazyComponent._result?.then) {
            lazyComponent._result.then(() => {});
          }
        }
      }
    });
  }, []);

  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Check if element is in viewport
  const isElementInViewport = (el: Element) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Clear cache to ensure fresh data with translations
        sessionStorage.clear();
        await preloadCriticalData();
      } catch (err) {
        console.error('Failed to preload data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSurahSelect = (surah: Surah) => {
    setSelectedSurah(surah);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading Qur'an data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      onSurahSelect={handleSurahSelect}
      selectedSurahId={selectedSurah?.id}
    >
      <Suspense fallback={
        <div className="flex justify-center py-12">
          <LoadingSpinner size="xl" text="Loading page..." />
        </div>
      }>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/surahs" element={<SurahsPage />} />
          <Route path="/surah/:surahId" element={<SurahPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/juz" element={<JuzPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};

function App() {
  const basename = process.env.NODE_ENV === 'production' ? '/Quran-web-app-pet-project' : '/';
  return (
    <ErrorBoundary>
      <QueryClientProvider client={new QueryClient()}>
        <AppProvider>
          <Router basename={basename}>
            <AudioProvider>
              <AppContent />
            </AudioProvider>
          </Router>
        </AppProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
