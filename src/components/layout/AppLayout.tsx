import React, { useState, useRef } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

import { Surah } from '../../types';

interface AppLayoutProps {
  children: React.ReactNode;
  onSurahSelect?: (surah: Surah) => void;
  selectedSurahId?: number;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  onSurahSelect,
  selectedSurahId 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const appRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div 
      ref={appRef}
      className={`min-h-screen bg-gray-50 dark:bg-primary-500 flex flex-col relative overflow-hidden ${isFocused ? 'ring-2 ring-primary-500 dark:ring-accent-400' : ''}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsFocused(false);
          if (sidebarOpen) {
            closeSidebar();
          }
        }
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="application"
      aria-label="Quran Web App"
    >
      {/* Header */}
      <Header 
        onMenuToggle={toggleSidebar} 
        showMenuButton={true}
        aria-label="Quran Web App header"
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        <div 
          className={`fixed inset-0 bg-black bg-opacity-50 z-20 ${sidebarOpen ? 'block' : 'hidden'} sm:hidden`}
          onClick={closeSidebar}
        />
        
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={closeSidebar}
          onSurahSelect={onSurahSelect}
          selectedSurahId={selectedSurahId}
          className="sm:w-64 sm:fixed sm:inset-y-0 sm:left-0 sm:z-30"
        />

        {/* Main Content */}
        <main 
          className="flex-1 overflow-auto focus:outline-none" 
          tabIndex={0}
          role="main"
          aria-label="Main content area"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer 
        aria-label="App footer"
      />

      {/* Audio Player - Will be implemented when audio functionality is added */}
    </div>
  );
};