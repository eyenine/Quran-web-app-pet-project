// Floating Action Button (FAB) Component
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface FABProps {
  className?: string;
}

export const FAB: React.FC<FABProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { language } = useLanguage();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle scroll to show/hide FAB
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide FAB when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Quick action items
  const quickActions = [
    {
      label: language === 'bangla' ? 'অনুসন্ধান' : 'Search',
      icon: '🔍',
      path: '/search',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: language === 'bangla' ? 'সেটিংস' : 'Settings',
      icon: '⚙️',
      path: '/settings',
      color: 'bg-gray-500 hover:bg-gray-600',
    },
    {
      label: language === 'bangla' ? 'দৈনিক আয়াত' : 'Daily Ayah',
      icon: '📅',
      path: '/?daily=true',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      label: language === 'bangla' ? 'বুকমার্ক' : 'Bookmarks',
      icon: '🔖',
      path: '/bookmarks',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  const handleActionClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
      {/* Quick Actions Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 space-y-2">
          {quickActions.map((action, index) => (
            <div
              key={action.path}
              className="flex items-center justify-end"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <button
                onClick={() => handleActionClick(action.path)}
                className={`
                  ${action.color} text-white rounded-full p-3 shadow-lg
                  transform transition-all duration-200 ease-out
                  hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800
                  animate-in slide-in-from-bottom-2 fade-in
                `}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
                aria-label={action.label}
              >
                <span className="text-xl">{action.icon}</span>
              </button>
              <span className="mr-3 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium rounded-lg shadow-lg whitespace-nowrap">
                {action.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <div className="flex flex-col items-end space-y-2">
        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className="bg-primary-500 hover:bg-primary-600 text-white rounded-full p-3 shadow-lg transform transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800"
          aria-label={language === 'bangla' ? 'উপরে যান' : 'Scroll to top'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>

        {/* Main Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg
            transform transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800
            ${isOpen ? 'rotate-45' : 'rotate-0'}
          `}
          aria-label={isOpen ? (language === 'bangla' ? 'মেনু বন্ধ করুন' : 'Close menu') : (language === 'bangla' ? 'মেনু খুলুন' : 'Open menu')}
          aria-expanded={isOpen}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
