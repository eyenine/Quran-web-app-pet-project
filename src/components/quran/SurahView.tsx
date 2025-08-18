import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Surah, Ayah } from '../../types';
import { fetchSurahVerses, getSurahAudioUrl } from '../../services';
import { AyahDisplay } from './AyahDisplay';
import { LoadingSpinner, ErrorMessage } from '../common';
import { SurahAudioControls } from '../audio';
import { useLanguage } from '../../context';

interface SurahViewProps {
  surah: Surah;
  className?: string;
}

export const SurahView: React.FC<SurahViewProps> = ({
  surah,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number>(0);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  // Memoize the Surah header content
  const headerContent = useMemo(() => {
    const getSurahName = (): string => {
      return surah.englishName;
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="text-center">
          {/* Arabic name */}
          <h1 className="font-arabic text-4xl text-gray-900 dark:text-white mb-2">
            {surah.name}
          </h1>
          
          {/* English name */}
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            {getSurahName()}
          </h2>
          
          {/* Surah info */}
          <div className="flex justify-center items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Surah {surah.id}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>{surah.ayahCount} verses</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                surah.revelationType === 'meccan'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                  : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
              }`}>
                {surah.revelationType === 'meccan' ? '🕋 Meccan' : '🕌 Medinan'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }, [surah, language]);

  useEffect(() => {
    const loadAyahs = async () => {
      try {
        setLoading(true);
        setError(null);
        const ayahsData = await fetchSurahVerses(surah.id);
        setAyahs(ayahsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load verses');
      } finally {
        setLoading(false);
      }
    };

    loadAyahs();
  }, [surah.id]);

  const handleRetry = () => {
    setError(null);
    setAyahs([]);
    setLoading(true);
    
    const loadAyahs = async () => {
      try {
        setLoading(true);
        setError(null);
        const ayahsData = await fetchSurahVerses(surah.id);
        setAyahs(ayahsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load verses');
      } finally {
        setLoading(false);
      }
    };
    loadAyahs();
  };

  return (
    <div
      className={`relative ${className}`}
      ref={containerRef}
      onKeyDown={(e) => {
        const focusableElements = containerRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') || [];
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.key === 'Tab' && !e.shiftKey) {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        } else if (e.key === 'Tab' && e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setIsFocused(false);
        } else if (e.key === 'ArrowDown' && ayahs.length > 0) {
          e.preventDefault();
          const nextIndex = Math.min(currentVerseIndex + 1, ayahs.length - 1);
          setCurrentVerseIndex(nextIndex);
          const nextVerse = containerRef.current?.querySelector(`[data-verse="${nextIndex}"]`) as HTMLElement | null;
          nextVerse?.focus();
        } else if (e.key === 'ArrowUp' && ayahs.length > 0) {
          e.preventDefault();
          const prevIndex = Math.max(currentVerseIndex - 1, 0);
          setCurrentVerseIndex(prevIndex);
          const prevVerse = containerRef.current?.querySelector(`[data-verse="${prevIndex}"]`) as HTMLElement | null;
          prevVerse?.focus();
        }
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="region"
      aria-label={`Surah ${surah.englishName}`}
      tabIndex={0}
    >
      {/* Surah Header */}
      <div role="banner" aria-label={`Surah ${surah.englishName} (${surah.id}) header`}>
        {headerContent}
      </div>
      
      {/* Full Surah Audio Section */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-lg shadow-sm p-6 mb-6">
        <>
          {console.log('DEBUG: SurahAudioControls rendered for surah', surah.id)}
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🎧 Full Surah Audio
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Listen to the complete recitation of {surah.englishName} ({surah.ayahCount} verses)
            </p>
          </div>
          <SurahAudioControls 
            surahId={surah.id}
            totalAyahs={surah.ayahCount}
            className="justify-center"
          />
          {/* Download full surah audio */}
          <div className="mt-4 flex justify-center">
            <a
              href={getSurahAudioUrl(surah.id)}
              download
              className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
              <span className="text-sm font-medium">Download Surah Audio</span>
            </a>
          </div>
        </>
      </div>

      {/* Loading state with skeleton loading */}
      {loading && (
        <div 
          className="space-y-4"
          role="status"
          aria-label="Loading verses"
        >
          {/* Skeleton for verses */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <div className="flex space-x-4">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div>
          <ErrorMessage
            title="Failed to Load Verses"
            message={error}
            onRetry={handleRetry}
            className="mb-6"
          />
          <div className="sr-only" role="alert" aria-live="assertive">
            {error}
          </div>
        </div>
      )}

      {/* Ayahs */}
      {!loading && !error && (
        <div 
          className="space-y-6"
          role="list"
          aria-label={`Verses of Surah ${surah.englishName}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const currentVerse = containerRef.current?.querySelector(`[data-verse="${currentVerseIndex}"]`) as HTMLElement | null;
              const clickEvent = new MouseEvent('click', { bubbles: true });
              currentVerse?.dispatchEvent(clickEvent);
            }
          }}
        >
          {ayahs.map((ayah, index) => (
            <AyahDisplay
              key={ayah.id}
              ayah={ayah}
              surahName={surah.englishName}
              showSurahInfo={false}
              className={`transition-all duration-200 ${
                index === currentVerseIndex ? 'bg-gray-50 dark:bg-gray-700' : ''
              }`}
              data-verse={index}
              role="listitem"
              aria-current={index === currentVerseIndex ? 'true' : undefined}
            />
          ))}
          
          {/* End of Surah indicator */}
          {ayahs.length > 0 && (
            <div 
              className="text-center py-8"
              role="status"
              aria-label="End of Surah"
              aria-live="polite"
            >
              <div className="inline-flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <div className="w-12 h-px bg-gray-300 dark:bg-gray-600"></div>
                <span className="text-sm font-medium">End of Surah {surah.englishName}</span>
                <div className="w-12 h-px bg-gray-300 dark:bg-gray-600"></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SurahView;