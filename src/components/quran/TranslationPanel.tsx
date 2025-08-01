import React, { useState, useRef } from 'react';
import { Ayah } from '../../types';
import { useLanguage } from '../../context';

interface TranslationPanelProps {
  ayah: Ayah;
  className?: string;
}

export const TranslationPanel: React.FC<TranslationPanelProps> = ({
  ayah,
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { language, isEnglishEnabled, isBanglaEnabled } = useLanguage();

  // Don't render if no translations are enabled
  if (!isEnglishEnabled && !isBanglaEnabled) {
    return null;
  }

  return (
    <div 
      ref={panelRef}
      className={`space-y-4 ${className} ${isFocused ? 'ring-2 ring-primary-500 dark:ring-accent-400' : ''}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsFocused(false);
        }
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="region"
      aria-label="Translation panel"
    >
      {/* English Translation */}
      {isEnglishEnabled && ayah.english && (
        <div 
          className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 rounded-r-lg"
          role="article"
          aria-label="English translation"
          tabIndex={0}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div 
                className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                role="img"
                aria-label="English translation icon"
              >
                <span className="text-white text-xs font-semibold">EN</span>
              </div>
            </div>
            <div className="flex-1">
              <p 
                className="text-gray-800 dark:text-gray-200 leading-relaxed"
                role="heading"
                aria-level={2}
              >
                {ayah.english}
              </p>
              <p 
                className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium"
                aria-label="Language indicator"
              >
                English Translation
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bengali Translation */}
      {isBanglaEnabled && ayah.bangla && (
        <div 
          className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 p-4 rounded-r-lg"
          role="article"
          aria-label="Bangla translation"
          tabIndex={0}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div 
                className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                role="img"
                aria-label="Bangla translation icon"
              >
                <span className="text-white text-xs font-semibold">বা</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-bengali">
                {ayah.bangla}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                বাংলা অনুবাদ
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-side view for both languages */}
      {language === 'both' && isEnglishEnabled && isBanglaEnabled && ayah.english && ayah.bangla && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          {/* English side */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">EN</span>
              </div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                English
              </span>
            </div>
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm">
              {ayah.english}
            </p>
          </div>

          {/* Bengali side */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">বা</span>
              </div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                বাংলা
              </span>
            </div>
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm font-bengali">
              {ayah.bangla}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};