import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme, useLanguage } from '../../context';

interface HeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onMenuToggle, 
  showMenuButton = true 
}) => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (newLanguage: 'english' | 'bangla' | 'both') => {
    setLanguage(newLanguage);
    setShowLanguageMenu(false);
  };

  return (
    <header 
      ref={headerRef}
      className={`bg-white dark:bg-primary-600 shadow-sm border-b border-gray-200 dark:border-gray-700 ${isFocused ? 'ring-2 ring-primary-500 dark:ring-accent-400' : ''}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsFocused(false);
        }
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="banner"
      aria-label="Quran Web App header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left side - Logo and Menu */}
          <div className="flex items-center space-x-4">
            {showMenuButton && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle navigation menu"
                aria-expanded={showLanguageMenu}
                tabIndex={0}
                role="button"
                aria-controls="main-menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            
            <Link 
              to="/" 
              className="flex items-center space-x-3"
              aria-label="Home"
            >
              <h1 className="text-2xl font-bold text-primary-500 dark:text-white font-arabic">
                القرآن الكريم
              </h1>
              <span className="hidden sm:block text-lg text-gray-600 dark:text-gray-300">
                Qur'an Web App
              </span>
            </Link>
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center space-x-3">
            {/* Navigation Links */}
            <nav 
              className="hidden md:flex items-center space-x-4"
              role="navigation"
              aria-label="Main navigation"
            >
              <Link 
                to="/search" 
                className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-accent-400 transition-colors"
                aria-label="Search Quran"
              >
                Search
              </Link>
              <Link 
                to="/juz" 
                className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-accent-400 transition-colors"
                aria-label="Juz navigation"
              >
                Juz
              </Link>
              <Link 
                to="/bookmarks" 
                className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-accent-400 transition-colors"
                aria-label="View bookmarks"
              >
                Bookmarks
              </Link>
              <Link 
                to="/settings" 
                className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-accent-400 transition-colors"
                aria-label="Settings"
              >
                Settings
              </Link>
            </nav>
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-haspopup="true"
                aria-expanded={showLanguageMenu}
                aria-controls="language-menu"
                aria-label="Select language"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span className="hidden sm:inline text-sm capitalize">
                  {language === 'both' ? 'Both' : language}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showLanguageMenu && (
                <div 
                  id="language-menu"
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                  role="menu"
                  aria-labelledby="language-selector"
                >
                  <div className="flex items-center space-x-2" role="group" aria-label="Language selection">
                    <button
                      onClick={() => handleLanguageChange('english')}
                      className={`px-3 py-1 rounded-md ${
                        language === 'english' ? 'bg-gray-100 dark:bg-gray-700' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      aria-label="English only"
                      tabIndex={0}
                      role="button"
                    >
                      EN
                    </button>
                    <button
                      onClick={() => handleLanguageChange('bangla')}
                      className={`px-3 py-1 rounded-md ${
                        language === 'bangla' ? 'bg-gray-100 dark:bg-gray-700' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      aria-label="Bengali only"
                      tabIndex={0}
                      role="button"
                    >
                      বাং
                    </button>
                    <button
                      onClick={() => handleLanguageChange('both')}
                      className={`px-3 py-1 rounded-md ${
                        language === 'both' ? 'bg-gray-100 dark:bg-gray-700' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      aria-label="Both languages"
                      tabIndex={0}
                      role="button"
                    >
                      Both
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Settings Button */}
            <Link
              to="/settings"
              className="md:hidden p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Close language menu when clicking outside */}
      {showLanguageMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowLanguageMenu(false)}
        />
      )}
    </header>
  );
};