import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer 
      className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4"
      role="contentinfo"
      aria-label="App footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 Quran Web App. All rights reserved.
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Made with ❤️ for the Muslim community
          </div>
        </div>
      </div>
    </footer>
  );
};