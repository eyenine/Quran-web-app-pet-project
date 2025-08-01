import React, { useState, useEffect, useRef } from 'react';
import { Surah } from '../../types';
import { fetchSurahs } from '../../services';
import { LoadingSpinner, ErrorMessage } from '../common';
import { useLanguage } from '../../context';

interface SurahListProps {
  onSurahSelect?: (surah: Surah) => void;
  selectedSurahId?: number;
  className?: string;
}

export const SurahList: React.FC<SurahListProps> = ({
  onSurahSelect,
  selectedSurahId,
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    const loadSurahs = async () => {
      try {
        setLoading(true);
        setError(null);
        const surahsData = await fetchSurahs();
        setSurahs(surahsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Surahs');
      } finally {
        setLoading(false);
      }
    };

    loadSurahs();
  }, []);

  const handleRetry = () => {
    setError(null);
    setSurahs([]);
    setLoading(true);
    // Re-trigger the effect
    window.location.reload();
  };

  const getSurahName = (surah: Surah): string => {
    switch (language) {
      case 'bangla':
        return surah.banglaName;
      case 'english':
        return surah.englishName;
      case 'both':
        return `${surah.englishName} • ${surah.banglaName}`;
      default:
        return surah.englishName;
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center py-8 ${className}`}>
        <LoadingSpinner size="medium" text="Loading Surahs..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <ErrorMessage
          title="Failed to Load Surahs"
          message={error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div 
      ref={listRef}
      className={`space-y-2 ${className} ${isFocused ? 'ring-2 ring-primary-500 dark:ring-accent-400' : ''}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          setIsFocused(!isFocused);
        }
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      aria-label="Surah list"
    >
      {surahs.map((surah) => (
        <div
          key={surah.id}
          onClick={() => onSurahSelect?.(surah)}
          className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
            selectedSurahId === surah.id
              ? 'bg-primary-50 dark:bg-primary-700 border-2 border-primary-200 dark:border-primary-500'
              : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
          } sm:p-6 sm:text-lg`}
          tabIndex={selectedSurahId === surah.id ? 0 : -1}
          aria-current={selectedSurahId === surah.id ? 'true' : undefined}
        >
          <div className="flex justify-between items-start">
            {/* Left side - Surah info */}
            <div className="flex-1 min-w-0 sm:pl-4">
              <div className="flex items-center space-x-3 mb-2">
                {/* Surah number */}
                <div className="flex-shrink-0 w-8 h-8 bg-primary-500 dark:bg-accent-400 text-white rounded-full flex items-center justify-center text-sm font-semibold sm:w-10 sm:h-10 sm:text-lg">
                  {surah.id}
                </div>
                
                {/* Arabic name */}
                <h3 
                  className="font-arabic text-xl text-gray-900 dark:text-white truncate"
                  role="heading"
                  aria-level={2}
                >
                  {surah.name}
                </h3>
              </div>
              
              {/* English/Bengali name */}
              <p 
                className="text-gray-600 dark:text-gray-300 sm:text-lg mb-1 truncate"
                aria-label={`Surah ${surah.id} name in ${language === 'both' ? 'both languages' : language}`}
              >
                {getSurahName(surah)}
              </p>
              
              {/* Revelation type */}
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

            {/* Right side - Stats */}
            <div className="flex-shrink-0 text-right ml-4">
              <h3 
                className="font-semibold text-gray-900 dark:text-white sm:text-xl"
                role="heading"
                aria-level={3}
              >
                {surah.ayahCount}
              </h3>
              <div 
                className="text-xs text-gray-500 dark:text-gray-400"
                aria-label={`${surah.ayahCount} verses`}
              >
                verses
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};