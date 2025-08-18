// Reader Settings Component
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface ReaderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReadingPreferences {
  fontScale: number;
  lineHeight: number;
  arabicFont: string;
  showTajweed: boolean;
  autoScroll: boolean;
}

const ARABIC_FONTS = [
  { value: 'kfgq', label: 'KFGQPC Uthman Taha Naskh', preview: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
  { value: 'uthmani', label: 'Uthmani Script', preview: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
  { value: 'tajweed', label: 'Tajweed Colored', preview: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
  { value: 'indopak', label: 'IndoPak Script', preview: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
];

const DEFAULT_PREFERENCES: ReadingPreferences = {
  fontScale: 1,
  lineHeight: 1.6,
  arabicFont: 'kfgq',
  showTajweed: false,
  autoScroll: false,
};

export const ReaderSettings: React.FC<ReaderSettingsProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  
  const [preferences, setPreferences] = useState<ReadingPreferences>(DEFAULT_PREFERENCES);
  const [isDirty, setIsDirty] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('quran_reader_preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } catch (error) {
        console.error('Error loading reader preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (isDirty) {
      localStorage.setItem('quran_reader_preferences', JSON.stringify(preferences));
      setIsDirty(false);
      
      // Apply preferences to CSS custom properties
      document.documentElement.style.setProperty('--font-scale', preferences.fontScale.toString());
      document.documentElement.style.setProperty('--line-height', preferences.lineHeight.toString());
      document.documentElement.style.setProperty('--arabic-font', preferences.arabicFont);
    }
  }, [preferences, isDirty]);

  // Apply preferences to CSS custom properties
  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', preferences.fontScale.toString());
    document.documentElement.style.setProperty('--line-height', preferences.lineHeight.toString());
    document.documentElement.style.setProperty('--arabic-font', preferences.arabicFont);
  }, [preferences]);

  const handlePreferenceChange = (key: keyof ReadingPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleReset = () => {
    setPreferences(DEFAULT_PREFERENCES);
    setIsDirty(true);
  };

  const handleClose = () => {
    if (isDirty) {
      // Save before closing
      localStorage.setItem('quran_reader_preferences', JSON.stringify(preferences));
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {language === 'bangla' ? 'পাঠক সেটিংস' : 'Reader Settings'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close settings"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'bangla' ? 'ফন্ট সাইজ' : 'Font Size'}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={preferences.fontScale}
                  onChange={(e) => handlePreferenceChange('fontScale', parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[3rem] text-center">
                  {Math.round(preferences.fontScale * 100)}%
                </span>
              </div>
            </div>

            {/* Line Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'bangla' ? 'লাইন উচ্চতা' : 'Line Height'}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1.2"
                  max="2.5"
                  step="0.1"
                  value={preferences.lineHeight}
                  onChange={(e) => handlePreferenceChange('lineHeight', parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[3rem] text-center">
                  {preferences.lineHeight.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Arabic Font */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'bangla' ? 'আরবি ফন্ট' : 'Arabic Font'}
              </label>
              <select
                value={preferences.arabicFont}
                onChange={(e) => handlePreferenceChange('arabicFont', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {ARABIC_FONTS.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
              
              {/* Font Preview */}
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div 
                  className={`text-right text-lg leading-relaxed ${getFontClass(preferences.arabicFont)}`}
                  style={{ 
                    fontSize: `${preferences.fontScale * 1.2}rem`,
                    lineHeight: preferences.lineHeight,
                  }}
                >
                  {ARABIC_FONTS.find(f => f.value === preferences.arabicFont)?.preview}
                </div>
              </div>
            </div>

            {/* Toggle Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'bangla' ? 'তাজবীদ রং দেখান' : 'Show Tajweed Colors'}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {language === 'bangla' ? 'আরবি পাঠে তাজবীদ রং প্রদর্শন করুন' : 'Display Tajweed colors in Arabic text'}
                  </p>
                </div>
                <button
                  onClick={() => handlePreferenceChange('showTajweed', !preferences.showTajweed)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    preferences.showTajweed ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      preferences.showTajweed ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'bangla' ? 'স্বয়ংক্রিয় স্ক্রল' : 'Auto Scroll'}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {language === 'bangla' ? 'অডিও প্লে করার সময় স্বয়ংক্রিয়ভাবে স্ক্রল করুন' : 'Auto-scroll during audio playback'}
                  </p>
                </div>
                <button
                  onClick={() => handlePreferenceChange('autoScroll', !preferences.autoScroll)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    preferences.autoScroll ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      preferences.autoScroll ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              {language === 'bangla' ? 'রিসেট করুন' : 'Reset'}
            </button>
            
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
            >
              {language === 'bangla' ? 'সংরক্ষণ করুন' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get font class
function getFontClass(fontValue: string): string {
  switch (fontValue) {
    case 'kfgq':
      return 'font-kfgq';
    case 'uthmani':
      return 'font-uthmani';
    case 'tajweed':
      return 'font-tajweed';
    case 'indopak':
      return 'font-indopak';
    default:
      return 'font-kfgq';
  }
}
