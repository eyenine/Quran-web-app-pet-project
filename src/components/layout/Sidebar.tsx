import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookmarks } from '../../context';
import { SurahList } from '../quran';
import { Surah, Ayah } from '../../types';
import { fetchJuzVerses } from '../../services/quranApi';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSurahSelect?: (surah: Surah) => void;
  selectedSurahId?: number;
  className?: string;
}

type SidebarTab = 'surahs' | 'juz' | 'bookmarks';

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onSurahSelect,
  selectedSurahId,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('surahs');
  const [isFocused, setIsFocused] = useState(false);
  const [juzVerses, setJuzVerses] = useState<Record<number, Ayah[]>>({ });
  const [loadingJuz, setLoadingJuz] = useState<number | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { bookmarks, bookmarkCount } = useBookmarks();
  const navigate = useNavigate();

  const tabs = [
    { id: 'surahs' as SidebarTab, label: 'Surahs', icon: '📖', count: 114 },
    { id: 'juz' as SidebarTab, label: 'Juz', icon: '📚', count: 30 },
    { id: 'bookmarks' as SidebarTab, label: 'Bookmarks', icon: '🔖', count: bookmarkCount },
  ];

  const handleSurahSelect = (surah: Surah) => {
    navigate(`/surah/${surah.id}`);
    onSurahSelect?.(surah);
    onClose(); // Close sidebar on mobile after selection
  };

  const renderSurahs = () => (
    <SurahList 
      onSurahSelect={handleSurahSelect}
      selectedSurahId={selectedSurahId}
    />
  );

  const renderJuz = () => {
    const loadJuzData = async (juzNumber: number) => {
      try {
        setLoadingJuz(juzNumber);
        const verses = await fetchJuzVerses(juzNumber);
        setJuzVerses(prev => ({ ...prev, [juzNumber]: verses }));
      } catch (error) {
        console.error('Error loading Juz data:', error);
      } finally {
        setLoadingJuz(null);
      }
    };

    return (
      <div className="space-y-4">
        {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNumber) => {
          const verses = juzVerses[juzNumber];
          const isLoading = loadingJuz === juzNumber;
          const firstVerse = verses?.[0];
          const lastVerse = verses?.[verses.length - 1];

          return (
            <div
              key={juzNumber}
              onClick={() => {
                if (!firstVerse) return;
                navigate(`/surah/${firstVerse.surahId}`);
                onClose();
              }}
              className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Juz {juzNumber}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Para {juzNumber}
                    </p>
                  </div>
                  <div className="text-2xl">
                    {juzNumber}
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 dark:border-accent-400"></div>
                  </div>
                ) : !verses ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      loadJuzData(juzNumber);
                    }}
                    className="text-sm text-primary-500 dark:text-accent-400 hover:text-primary-600 dark:hover:text-accent-300"
                  >
                    Load verses
                  </button>
                ) : (
                  <div className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
                    <p>
                      <span className="text-gray-900 dark:text-white">Starts:</span> Surah {firstVerse.surahId}:{firstVerse.ayahNumber}
                    </p>
                    <p>
                      <span className="text-gray-900 dark:text-white">Ends:</span> Surah {lastVerse.surahId}:{lastVerse.ayahNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderBookmarks = () => (
    <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
      {bookmarks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔖</div>
          <p className="text-gray-500 dark:text-gray-400">
            No bookmarks yet
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Bookmark verses to see them here
          </p>
        </div>
      ) : (
        bookmarks.map((bookmark) => (
          <div
            key={bookmark.ayahId}
            onClick={() => {
              navigate(`/surah/${bookmark.surahId}`);
              onClose();
            }}
            className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors group"
          >
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Surah {bookmark.surahId}:{bookmark.ayahNumber}
                  </h3>
                  {bookmark.note && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {bookmark.note}
                    </p>
                  )}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-200">
                    {new Date(bookmark.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Surah {bookmark.surahId}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Ayah {bookmark.ayahNumber}</span>
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isFocused ? 'ring-2 ring-primary-500 dark:ring-accent-400' : ''} overflow-y-auto custom-scrollbar`}
        tabIndex={0}
        onKeyDown={(e) => {
          const focusableElements = sidebarRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') || [];
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.key === 'Tab' && !e.shiftKey) {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          } else if (e.key === 'Tab' && e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        role="navigation"
        aria-label="Quran navigation sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors group ${
                  activeTab === tab.id
                    ? 'text-primary-500 dark:text-accent-400 border-b-2 border-primary-500 dark:border-accent-400 bg-gray-50 dark:bg-gray-700'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-content`}
                aria-label={`${tab.label} (${tab.count})`}
                tabIndex={0}
              >
                <div className="flex items-center justify-center space-x-1 group-hover:scale-105 transition-transform duration-200">
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="text-xs bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded-full ml-2">
                    {tab.count}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'surahs' && renderSurahs()}
            {activeTab === 'juz' && renderJuz()}
            {activeTab === 'bookmarks' && renderBookmarks()}
          </div>
        </div>
      </div>
    </>
  );
};