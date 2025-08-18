// Search Filters Component
import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  surahOptions: Array<{ id: number; name: string; nameArabic: string }>;
  juzOptions: Array<{ id: number; name: string }>;
}

export interface SearchFiltersType {
  surahId?: number;
  juzId?: number;
  translationsOnly: boolean;
  includeArabic: boolean;
  includeTranslation: boolean;
  searchInTafsir: boolean;
  maxResults: number;
}

const DEFAULT_FILTERS: SearchFiltersType = {
  translationsOnly: false,
  includeArabic: true,
  includeTranslation: true,
  searchInTafsir: false,
  maxResults: 50,
};

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  surahOptions,
  juzOptions,
}) => {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof SearchFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onFiltersChange(DEFAULT_FILTERS);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    const filterKey = key as keyof SearchFiltersType;
    return value !== DEFAULT_FILTERS[filterKey];
  }).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {language === 'bangla' ? 'অনুসন্ধান ফিল্টার' : 'Search Filters'}
        </h3>
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full">
              {activeFiltersCount}
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
          >
            {isExpanded ? 'Hide' : 'Show'} {language === 'bangla' ? 'ফিল্টার' : 'Filters'}
          </button>
        </div>
      </div>

      {/* Basic Filters (Always Visible) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Surah Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {language === 'bangla' ? 'সূরা' : 'Surah'}
          </label>
          <select
            value={filters.surahId || ''}
            onChange={(e) => handleFilterChange('surahId', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
                          <option value="">{language === 'bangla' ? 'সব সূরা' : 'All Surahs'}</option>
            {surahOptions.map((surah) => (
              <option key={surah.id} value={surah.id}>
                {surah.id}. {surah.name} ({surah.nameArabic})
              </option>
            ))}
          </select>
        </div>

        {/* Juz Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {language === 'bangla' ? 'জুজ' : 'Juz'}
          </label>
          <select
            value={filters.juzId || ''}
            onChange={(e) => handleFilterChange('juzId', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
                          <option value="">{language === 'bangla' ? 'সব জুজ' : 'All Juz'}</option>
            {juzOptions.map((juz) => (
              <option key={juz.id} value={juz.id}>
                Juz {juz.id} - {juz.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters (Expandable) */}
      {isExpanded && (
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          {/* Search Options */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {language === 'bangla' ? 'অনুসন্ধান বিকল্প' : 'Search Options'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="translationsOnly"
                  checked={filters.translationsOnly}
                  onChange={(e) => handleFilterChange('translationsOnly', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="translationsOnly" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {language === 'bangla' ? 'শুধুমাত্র অনুবাদ' : 'Translations Only'}
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="searchInTafsir"
                  checked={filters.searchInTafsir}
                  onChange={(e) => handleFilterChange('searchInTafsir', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="searchInTafsir" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {language === 'bangla' ? 'তাফসীরে অনুসন্ধান' : 'Search in Tafsir'}
                </label>
              </div>
            </div>
          </div>

          {/* Content Types */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {language === 'bangla' ? 'কন্টেন্ট ধরন' : 'Content Types'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeArabic"
                  checked={filters.includeArabic}
                  onChange={(e) => handleFilterChange('includeArabic', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="includeArabic" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {language === 'bangla' ? 'আরবি পাঠ' : 'Arabic Text'}
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeTranslation"
                  checked={filters.includeTranslation}
                  onChange={(e) => handleFilterChange('includeTranslation', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="includeTranslation" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {language === 'bangla' ? 'অনুবাদ' : 'Translation'}
                </label>
              </div>
            </div>
          </div>

          {/* Max Results */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'bangla' ? 'সর্বোচ্চ ফলাফল' : 'Max Results'}
            </label>
            <select
              value={filters.maxResults}
              onChange={(e) => handleFilterChange('maxResults', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
        >
          {language === 'bangla' ? 'রিসেট করুন' : 'Reset'}
        </button>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          {activeFiltersCount > 0 && (
            <span>
              {activeFiltersCount} {language === 'bangla' ? 'সক্রিয় ফিল্টার' : 'active filters'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
