import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJuzVerses } from '../services/quranApi';
import { Ayah } from '../types';
import { LoadingSpinner } from '../components/common';

export const JuzPage: React.FC = () => {
  const navigate = useNavigate();
  const [juzData, setJuzData] = useState<Record<number, Ayah[]>>({});
  const [loadingJuz, setLoadingJuz] = useState<number | null>(null);
  const [expandedJuz, setExpandedJuz] = useState<number | null>(null);

  const loadJuzData = async (juzNumber: number) => {
    if (juzData[juzNumber]) return; // Already loaded
    
    try {
      setLoadingJuz(juzNumber);
      const verses = await fetchJuzVerses(juzNumber);
      setJuzData(prev => ({ ...prev, [juzNumber]: verses }));
    } catch (error) {
      console.error('Error loading Juz data:', error);
    } finally {
      setLoadingJuz(null);
    }
  };

  const handleJuzClick = (juzNumber: number) => {
    if (expandedJuz === juzNumber) {
      setExpandedJuz(null);
    } else {
      setExpandedJuz(juzNumber);
      loadJuzData(juzNumber);
    }
  };

  const handleVerseClick = (surahId: number, ayahNumber: number) => {
    navigate(`/surah/${surahId}`);
  };

  const getJuzInfo = (juzNumber: number) => {
    // This is a simplified mapping - in a real app, you'd have the exact mapping
    const juzInfo = {
      1: { startSurah: 1, endSurah: 2, startAyah: 1, endAyah: 141 },
      2: { startSurah: 2, endSurah: 2, startAyah: 142, endAyah: 252 },
      3: { startSurah: 2, endSurah: 3, startAyah: 253, endAyah: 92 },
      4: { startSurah: 3, endSurah: 4, startAyah: 93, endAyah: 23 },
      5: { startSurah: 4, endSurah: 4, startAyah: 24, endAyah: 147 },
      6: { startSurah: 4, endSurah: 5, startAyah: 148, endAyah: 81 },
      7: { startSurah: 5, endSurah: 6, startAyah: 82, endAyah: 110 },
      8: { startSurah: 6, endSurah: 7, startAyah: 111, endAyah: 87 },
      9: { startSurah: 7, endSurah: 8, startAyah: 88, endAyah: 40 },
      10: { startSurah: 8, endSurah: 9, startAyah: 41, endAyah: 92 },
      11: { startSurah: 9, endSurah: 11, startAyah: 93, endAyah: 5 },
      12: { startSurah: 11, endSurah: 12, startAyah: 6, endAyah: 52 },
      13: { startSurah: 12, endSurah: 14, startAyah: 53, endAyah: 52 },
      14: { startSurah: 15, endSurah: 16, startAyah: 1, endAyah: 128 },
      15: { startSurah: 17, endSurah: 18, startAyah: 1, endAyah: 74 },
      16: { startSurah: 18, endSurah: 20, startAyah: 75, endAyah: 135 },
      17: { startSurah: 21, endSurah: 22, startAyah: 1, endAyah: 78 },
      18: { startSurah: 23, endSurah: 25, startAyah: 1, endAyah: 20 },
      19: { startSurah: 25, endSurah: 27, startAyah: 21, endAyah: 55 },
      20: { startSurah: 27, endSurah: 29, startAyah: 56, endAyah: 45 },
      21: { startSurah: 29, endSurah: 33, startAyah: 46, endAyah: 30 },
      22: { startSurah: 33, endSurah: 36, startAyah: 31, endAyah: 27 },
      23: { startSurah: 36, endSurah: 39, startAyah: 28, endAyah: 31 },
      24: { startSurah: 39, endSurah: 41, startAyah: 32, endAyah: 46 },
      25: { startSurah: 41, endSurah: 45, startAyah: 47, endAyah: 37 },
      26: { startSurah: 46, endSurah: 51, startAyah: 1, endAyah: 30 },
      27: { startSurah: 51, endSurah: 57, startAyah: 31, endAyah: 29 },
      28: { startSurah: 58, endSurah: 66, startAyah: 1, endAyah: 12 },
      29: { startSurah: 67, endSurah: 77, startAyah: 1, endAyah: 50 },
      30: { startSurah: 78, endSurah: 114, startAyah: 1, endAyah: 6 }
    };
    
    return juzInfo[juzNumber as keyof typeof juzInfo] || { startSurah: 1, endSurah: 1, startAyah: 1, endAyah: 1 };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">📚</span>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Juz (Para) Navigation
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Navigate through the 30 Juz of the Holy Quran
            </p>
          </div>
        </div>
      </div>

      {/* Juz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNumber) => {
          const verses = juzData[juzNumber];
          const isLoading = loadingJuz === juzNumber;
          const isExpanded = expandedJuz === juzNumber;
          const juzInfo = getJuzInfo(juzNumber);
          const firstVerse = verses?.[0];
          const lastVerse = verses?.[verses.length - 1];

          return (
            <div
              key={juzNumber}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200"
            >
              <div 
                className="cursor-pointer"
                onClick={() => handleJuzClick(juzNumber)}
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Juz {juzNumber}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Para {juzNumber}
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-primary-500 dark:text-accent-400">
                    {juzNumber}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <p>
                    <span className="font-medium text-gray-900 dark:text-white">Starts:</span> Surah {juzInfo.startSurah}:{juzInfo.startAyah}
                  </p>
                  <p>
                    <span className="font-medium text-gray-900 dark:text-white">Ends:</span> Surah {juzInfo.endSurah}:{juzInfo.endAyah}
                  </p>
                  {verses && (
                    <p>
                      <span className="font-medium text-gray-900 dark:text-white">Verses:</span> {verses.length}
                    </p>
                  )}
                </div>

                {isLoading && (
                  <div className="mt-4 flex justify-center">
                    <LoadingSpinner size="small" />
                  </div>
                )}

                {!verses && !isLoading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      loadJuzData(juzNumber);
                    }}
                    className="mt-4 w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
                  >
                    Load Verses
                  </button>
                )}
              </div>

              {/* Expanded View */}
              {isExpanded && verses && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    First and Last Verses
                  </h4>
                  <div className="space-y-3">
                    {firstVerse && (
                      <div 
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => handleVerseClick(firstVerse.surahId, firstVerse.ayahNumber)}
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          First: Surah {firstVerse.surahId}:{firstVerse.ayahNumber}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                          {firstVerse.arabic}
                        </p>
                      </div>
                    )}
                    {lastVerse && (
                      <div 
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => handleVerseClick(lastVerse.surahId, lastVerse.ayahNumber)}
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Last: Surah {lastVerse.surahId}:{lastVerse.ayahNumber}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                          {lastVerse.arabic}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleVerseClick(juzInfo.startSurah, juzInfo.startAyah)}
                    className="mt-4 w-full px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-md transition-colors"
                  >
                    Start Reading Juz {juzNumber}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-200 mb-3">
          About Juz (Para)
        </h3>
        <div className="text-blue-800 dark:text-blue-300 space-y-2 text-sm">
          <p>• The Quran is divided into 30 equal parts called Juz (جُزْء) or Para</p>
          <p>• Each Juz contains approximately 20 pages of the Quran</p>
          <p>• This division helps in reading the Quran over 30 days</p>
          <p>• Click on any Juz to see its verses and start reading</p>
        </div>
      </div>
    </div>
  );
}; 