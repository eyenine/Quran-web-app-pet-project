// Surah Info Panel Component
import React from 'react';
import { useSurahInfo } from '../../hooks/useTafsir';
import { useLanguage } from '../../context/LanguageContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface SurahInfoPanelProps {
  surahId: number;
  isVisible: boolean;
}

export const SurahInfoPanel: React.FC<SurahInfoPanelProps> = ({
  surahId,
  isVisible,
}) => {
  const { language } = useLanguage();
  
  const { 
    data: surahInfo, 
    isLoading, 
    error, 
    isFetching 
  } = useSurahInfo(surahId, language, isVisible);

  if (!isVisible) return null;

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">
          Loading Surah information...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        message="Failed to load Surah information. Please try again." 
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!surahInfo) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        No information available for this Surah.
      </div>
    );
  }

  const getRevelationIcon = (place: string) => {
    return place === 'meccan' ? '🕌' : '🕌';
  };

  const getRevelationColor = (place: string) => {
    return place === 'meccan' 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-blue-600 dark:text-blue-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {surahInfo.name}
        </h2>
        <div className="text-4xl text-right text-gray-700 dark:text-gray-300 mb-4">
          {surahInfo.nameArabic}
        </div>
        
        {/* Basic Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {surahInfo.id}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Surah Number
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {surahInfo.totalVerses}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Verses
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {surahInfo.totalPages}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Pages
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {surahInfo.revelationOrder}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Revelation Order
            </div>
          </div>
        </div>
      </div>

      {/* Revelation Details */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Revelation Details
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">Place of Revelation</span>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getRevelationIcon(surahInfo.revelationPlace)}</span>
              <span className={`font-medium ${getRevelationColor(surahInfo.revelationPlace)}`}>
                {surahInfo.revelationPlace.charAt(0).toUpperCase() + surahInfo.revelationPlace.slice(1)}
              </span>
            </div>
          </div>
          
          {surahInfo.bismillahPre && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Bismillah</span>
              <span className="text-green-600 dark:text-green-400 font-medium">
                ✓ Included
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Shan-e-Nuzul (Asbāb al-Nuzūl) */}
      {(surahInfo.shanEN || surahInfo.shanBN) && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Shan-e-Nuzul (Asbāb al-Nuzūl)
          </h3>
          <div className="space-y-4">
            {surahInfo.shanEN && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  English
                </h4>
                <div 
                  className="text-blue-800 dark:text-blue-200 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: surahInfo.shanEN }}
                />
              </div>
            )}
            
            {surahInfo.shanBN && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  বাংলা (Bengali)
                </h4>
                <div 
                  className="text-green-800 dark:text-green-200 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: surahInfo.shanBN }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      {surahInfo.summaryEN && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {language === 'bangla' ? 'সারাংশ' : 'Summary'}
          </h3>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <p className="text-gray-700 dark:text-gray-300">
              {language === 'bangla' ? surahInfo.summaryBN : surahInfo.summaryEN}
            </p>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
        <p>
          Information provided by Quran.com API v4
        </p>
        <p className="mt-1">
          Note: Shan-e-Nuzul information may not be available for all Surahs
        </p>
      </div>
    </div>
  );
};

