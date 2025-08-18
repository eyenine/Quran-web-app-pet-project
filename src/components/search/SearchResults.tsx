import React from 'react';
import { SearchResult } from '../../types';
import { AyahDisplay } from '../quran';
import { LoadingSpinner } from '../common';

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  query: string;
  onResultClick?: (surahId: number, ayahNumber: number) => void;
  className?: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  query,
  onResultClick,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`flex justify-center py-8 ${className}`}>
        <LoadingSpinner size="md" text="Searching..." />
      </div>
    );
  }

  if (!query) {
    return (
      <div className={`text-center py-8 text-gray-500 dark:text-gray-400 ${className}`}>
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p>Enter a search term to find verses</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          No results found for "{query}"
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Try different keywords or check your spelling
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
      </div>
      
      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={`${result.ayah.id}-${index}`}
            className="cursor-pointer"
            onClick={() => onResultClick?.(result.ayah.surahId, result.ayah.ayahNumber)}
          >
            <AyahDisplay
              ayah={result.ayah}
              surahName={result.surah.englishName}
              showSurahInfo={true}
              className="hover:shadow-md transition-shadow"
            />
            
            {/* Match type indicator */}
            <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <span className={`px-2 py-1 rounded-full ${
                result.matchType === 'arabic' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                result.matchType === 'english' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                result.matchType === 'bangla' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                Match in {result.matchType === 'surah_name' ? 'Surah name' : `${result.matchType} text`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};