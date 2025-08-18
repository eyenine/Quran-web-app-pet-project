// Tafsir Modal Component
import React, { useState, useEffect } from 'react';
import { 
  useTafsirSources, 
  useAyahTafsir, 
  useSurahTafsir, 
  useSurahInfo 
} from '../../hooks/useTafsir';
import { LoadingSpinner, ErrorMessage } from '../common';
import { useLanguage } from '../../context/LanguageContext';
import { tafsirService } from '../../services/tafsirService';

interface TafsirModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'verse' | 'surah' | 'revelation' | 'historical' | 'details' | 'related';
  surahId: number;
  ayahNumber?: number;
  surahName?: string;
}

export const TafsirModal: React.FC<TafsirModalProps> = ({
  isOpen,
  onClose,
  type,
  surahId,
  ayahNumber,
  surahName
}) => {
  const { language } = useLanguage();
  const [selectedSource, setSelectedSource] = useState<number>(() => {
    // Get default Tafsir ID based on current language
    return tafsirService.getDefaultTafsirId(language);
  });
  
  // Fetch Tafsir sources
  const { data: sources, isLoading: sourcesLoading, error: sourcesError } = useTafsirSources();
  
  // Fetch appropriate data based on type
  const { data: ayahTafsir, isLoading: ayahLoading, error: ayahError } = useAyahTafsir(
    `${surahId}:${ayahNumber || 1}` as const, 
    selectedSource, // Use selected source
    type === 'verse' && !!ayahNumber
  );
  
  const { data: surahTafsir, isLoading: surahLoading, error: surahError } = useSurahTafsir(
    surahId,
    selectedSource, // Use selected source
    type === 'surah'
  );
  
  const { data: surahInfo, isLoading: infoLoading, error: infoError } = useSurahInfo(
    surahId,
    undefined, // Use default language
    type === 'details' || type === 'historical' || type === 'revelation'
  );

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Check if we have any data or if we should show fallback content
  const hasData = ayahTafsir || (surahTafsir && surahTafsir.length > 0) || surahInfo;
  const isLoading = ayahLoading || surahLoading || infoLoading;
  const hasError = ayahError || surahError || infoError;
  const showFallback = !isLoading && !hasData && !hasError;

  const getTitle = () => {
    switch (type) {
      case 'verse': return language === 'bangla' ? 'আয়াতের তাফসীর' : 'Verse Tafsir';
      case 'surah': return language === 'bangla' ? 'সূরার তাফসীর' : 'Surah Tafsir';
      case 'revelation': return language === 'bangla' ? 'নাযিলের কারণ' : 'Revelation Context';
      case 'historical': return language === 'bangla' ? 'ঐতিহাসিক প্রেক্ষাপট' : 'Historical Background';
      case 'details': return language === 'bangla' ? 'বিস্তারিত তথ্য' : 'Detailed Information';
      case 'related': return language === 'bangla' ? 'সম্পর্কিত সূরা' : 'Related Surahs';
      default: return 'Tafsir';
    }
  };

  const getContent = () => {
    if (type === 'verse' && ayahTafsir) {
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              {language === 'bangla' ? 'আয়াত' : 'Verse'} {ayahNumber}
            </h4>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              {surahName} - {language === 'bangla' ? 'সূরা' : 'Surah'} {surahId}
            </p>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: ayahTafsir.textHtml }} />
          </div>
        </div>
      );
    }

    if (type === 'verse' && showFallback) {
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              {language === 'bangla' ? 'আয়াত' : 'Verse'} {ayahNumber}
            </h4>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              {surahName} - {language === 'bangla' ? 'সূরা' : 'Surah'} {surahId}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <p className="text-yellow-800 dark:text-yellow-200">
              {language === 'bangla' 
                ? 'এই আয়াতের তাফসীর শীঘ্রই যোগ করা হবে। বর্তমানে আপনি আয়াতটি পড়তে পারেন এবং এর অর্থ বুঝতে পারেন।'
                : 'Tafsir for this verse will be added soon. Currently, you can read the verse and understand its meaning.'
              }
            </p>
          </div>
        </div>
      );
    }

    if (type === 'surah' && surahTafsir && surahTafsir.length > 0) {
      return (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              {surahName} - {language === 'bangla' ? 'সূরা' : 'Surah'} {surahId}
            </h4>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            {surahTafsir.map((tafsir, index) => (
              <div key={index} className="mb-4">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                  {tafsir.sourceName} ({tafsir.lang})
                </h5>
                <div dangerouslySetInnerHTML={{ __html: tafsir.textHtml }} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (type === 'surah' && showFallback) {
      return (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              {surahName} - {language === 'bangla' ? 'সূরা' : 'Surah'} {surahId}
            </h4>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <p className="text-yellow-800 dark:text-yellow-200">
              {language === 'bangla' 
                ? 'এই সূরার তাফসীর শীঘ্রই যোগ করা হবে। বর্তমানে আপনি সূরাটি পড়তে পারেন এবং এর অর্থ বুঝতে পারেন।'
                : 'Tafsir for this Surah will be added soon. Currently, you can read the Surah and understand its meaning.'
              }
            </p>
          </div>
        </div>
      );
    }

    if (type === 'revelation' && surahInfo) {
      return (
        <div className="space-y-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
              🕋 {language === 'bangla' ? 'নাযিলের কারণ' : 'Revelation Context'}
            </h4>
          </div>
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                {language === 'bangla' ? 'নাযিলের সময়কাল' : 'Revelation Period'}
              </h5>
              <p className="text-gray-700 dark:text-gray-300">
                {surahInfo.revelationPlace === 'meccan' 
                  ? (language === 'bangla' ? 'মক্কী সূরা' : 'Meccan Surah')
                  : (language === 'bangla' ? 'মদীনী সূরা' : 'Medinan Surah')
                }
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                {language === 'bangla' ? 'শান-এ-নুযুল (নাযিলের কারণ)' : 'Shan-e-Nuzul (Reason for Revelation)'}
              </h5>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300">
                  {language === 'bangla' ? surahInfo.shanBN : surahInfo.shanEN}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'revelation' && showFallback) {
      return (
        <div className="space-y-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
              🕋 {language === 'bangla' ? 'নাযিলের কারণ' : 'Revelation Context'}
            </h4>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <p className="text-yellow-800 dark:text-yellow-200">
              {language === 'bangla' 
                ? 'এই নাযিলের কারণের তথ্য শীঘ্রই যোগ করা হবে। বর্তমানে আপনি নাযিলের কারণ বুঝতে পারেন।'
                : 'Detailed information about the reason for revelation will be added soon. Currently, you can understand the reason for revelation.'
              }
            </p>
          </div>
        </div>
      );
    }

    if (type === 'historical' && surahInfo) {
      return (
        <div className="space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
              🏛️ {language === 'bangla' ? 'ঐতিহাসিক প্রেক্ষাপট' : 'Historical Background'}
            </h4>
          </div>
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                {language === 'bangla' ? 'ঐতিহাসিক সময়কাল' : 'Historical Period'}
              </h5>
              <p className="text-gray-700 dark:text-gray-300">
                {surahInfo.revelationPlace === 'meccan' 
                  ? (language === 'bangla' ? 'মক্কা বিজয়ের আগে নাযিল' : 'Revealed before the conquest of Mecca')
                  : (language === 'bangla' ? 'মক্কা বিজয়ের পর নাযিল' : 'Revealed after the conquest of Mecca')
                }
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                {language === 'bangla' ? 'ঐতিহাসিক প্রেক্ষাপট' : 'Historical Context'}
              </h5>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300">
                  {surahInfo.historicalContext}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'historical' && showFallback) {
      return (
        <div className="space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
              🏛️ {language === 'bangla' ? 'ঐতিহাসিক প্রেক্ষাপট' : 'Historical Background'}
            </h4>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <p className="text-yellow-800 dark:text-yellow-200">
              {language === 'bangla' 
                ? 'এই সূরার ঐতিহাসিক প্রেক্ষাপটের তথ্য শীঘ্রই যোগ করা হবে। বর্তমানে আপনি ঐতিহাসিক প্রেক্ষাপট বুঝতে পারেন।'
                : 'Detailed historical context information for this Surah will be added soon. Currently, you can understand the historical context.'
              }
            </p>
          </div>
        </div>
      );
    }

    if (type === 'details' && surahInfo) {
      return (
        <div className="space-y-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
              ℹ️ {language === 'bangla' ? 'বিস্তারিত তথ্য' : 'Detailed Information'}
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                {language === 'bangla' ? 'সূরার নাম' : 'Surah Name'}
              </h5>
              <p className="text-gray-700 dark:text-gray-300">{surahInfo.name}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                {language === 'bangla' ? 'আয়াত সংখ্যা' : 'Number of Verses'}
              </h5>
              <p className="text-gray-700 dark:text-gray-300">{surahInfo.totalVerses}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                {language === 'bangla' ? 'নাযিলের স্থান' : 'Place of Revelation'}
              </h5>
              <p className="text-gray-700 dark:text-gray-300">
                {surahInfo.revelationPlace === 'meccan' 
                  ? (language === 'bangla' ? 'মক্কা' : 'Mecca')
                  : (language === 'bangla' ? 'মদীনা' : 'Medina')
                }
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                {language === 'bangla' ? 'নাযিলের ক্রম' : 'Revelation Order'}
              </h5>
              <p className="text-gray-700 dark:text-gray-300">{surahInfo.revelationOrder || 'N/A'}</p>
            </div>
          </div>
          
          {/* Summary Section */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">
              {language === 'bangla' ? 'সূরার সারাংশ' : 'Surah Summary'}
            </h5>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'bangla' ? surahInfo.summaryBN : surahInfo.summaryEN}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'details' && showFallback) {
      return (
        <div className="space-y-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
              ℹ️ {language === 'bangla' ? 'বিস্তারিত তথ্য' : 'Detailed Information'}
            </h4>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <p className="text-yellow-800 dark:text-yellow-200">
              {language === 'bangla' 
                ? 'এই সূরার বিস্তারিত তথ্য শীঘ্রই যোগ করা হবে। বর্তমানে আপনি সূরার বিস্তারিত তথ্য বুঝতে পারেন।'
                : 'Detailed information for this Surah will be added soon. Currently, you can understand the detailed information.'
              }
            </p>
          </div>
        </div>
      );
    }

    if (type === 'related') {
      return (
        <div className="space-y-4">
          <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-teal-900 dark:text-teal-100 mb-2">
              🔗 {language === 'bangla' ? 'সম্পর্কিত সূরা' : 'Related Surahs'}
            </h4>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">
              {language === 'bangla' ? 'এই সূরার সাথে সম্পর্কিত সূরা' : 'Surahs Related to This Chapter'}
            </h5>
            {surahInfo?.relatedSurahs ? (
              <div className="space-y-2">
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {language === 'bangla' 
                    ? 'নিম্নলিখিত সূরাগুলি বিষয়বস্তু, নাযিলের সময়কাল বা থিমের দিক থেকে এই সূরার সাথে সম্পর্কিত:'
                    : 'The following Surahs are related to this chapter in terms of content, revelation period, or themes:'
                  }
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {surahInfo.relatedSurahs.map((surah, index) => (
                    <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center">
                      <span className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                        {surah}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'bangla' 
                  ? 'সম্পর্কিত সূরা সম্পর্কে বিস্তারিত তথ্য শীঘ্রই যোগ করা হবে।'
                  : 'Detailed information about related Surahs will be added soon.'
                }
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          {language === 'bangla' 
            ? 'কন্টেন্ট লোড হচ্ছে...'
            : 'Loading content...'
          }
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getTitle()}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Source selector */}
            {sources && sources.length > 0 && (
              <div className="mt-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                  {language === 'bangla' ? 'তাফসীরের উৎস' : 'Tafsir Source'}:
                </label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(Number(e.target.value))}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {sources.map(source => (
                    <option key={source.id} value={source.id}>
                      {source.name} ({source.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" text={language === 'bangla' ? 'লোড হচ্ছে...' : 'Loading...'} />
              </div>
            ) : hasError ? (
              <ErrorMessage
                title={language === 'bangla' ? 'তথ্য লোড করতে ব্যর্থ' : 'Failed to Load Information'}
                message={language === 'bangla' 
                  ? 'তাফসীর তথ্য লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
                  : 'There was a problem loading the Tafsir information. Please try again.'
                }
                onRetry={() => window.location.reload()}
              />
            ) : showFallback ? (
              <div className="text-center py-8">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <p className="text-yellow-800 dark:text-yellow-200 mb-4">
                    {language === 'bangla' 
                      ? 'তাফসীর তথ্য শীঘ্রই যোগ করা হবে। বর্তমানে আপনি কুরআন পড়তে পারেন এবং এর অর্থ বুঝতে পারেন।'
                      : 'Tafsir information will be added soon. Currently, you can read the Quran and understand its meaning.'
                    }
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {language === 'bangla' 
                      ? 'আমরা শীঘ্রই বিস্তারিত তাফসীর, শান-এ-নুযুল এবং ঐতিহাসিক তথ্য যোগ করব।'
                      : 'We will soon add detailed Tafsir, Shan-e-Nuzul, and historical information.'
                    }
                  </p>
                </div>
              </div>
            ) : (
              getContent()
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                {language === 'bangla' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
