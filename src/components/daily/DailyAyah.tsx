import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ayah } from '../../types';
import { getRandomVerse } from '../../services';
import { getDailyAyah, setDailyAyah } from '../../utils/localStorage';
import { LoadingSpinner } from '../common';
import { AyahDisplay } from '../quran';
import { getTodayDateString } from '../../utils';

interface DailyAyahProps {
  className?: string;
}

export const DailyAyah: React.FC<DailyAyahProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const [ayah, setAyah] = useState<Ayah | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDailyAyah = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if we have today's daily Ayah cached
        const cachedDailyAyah = getDailyAyah();
        
        if (cachedDailyAyah) {
          setAyah(cachedDailyAyah.ayah);
        } else {
          // Get a new random verse for today
          const randomAyah = await getRandomVerse();
          
          if (randomAyah) {
            const dailyAyahData = {
              date: getTodayDateString(),
              ayah: randomAyah
            };
            
            setDailyAyah(dailyAyahData);
            setAyah(randomAyah);
          } else {
            setError('Unable to load daily Ayah');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load daily Ayah');
      } finally {
        setLoading(false);
      }
    };

    loadDailyAyah();
  }, []);

  if (loading) {
    return (
      <div className={`bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-800 dark:to-accent-800 rounded-lg p-6 ${className}`}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="text-2xl mr-2">🌟</span>
          Daily Ayah
        </h2>
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" text="Loading today's verse..." />
        </div>
      </div>
    );
  }

  if (error || !ayah) {
    return (
      <div className={`bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-800 dark:to-accent-800 rounded-lg p-6 ${className}`}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="text-2xl mr-2">🌟</span>
          Daily Ayah
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error || 'Unable to load daily Ayah'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-800 dark:to-accent-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <span className="text-2xl mr-2">🌟</span>
          Daily Ayah
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      <div onClick={() => navigate(`/surah/${ayah.surahId}`)} className="cursor-pointer">
        <AyahDisplay 
          ayah={ayah} 
          showSurahInfo={true}
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors"
        />
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          "And it is He who sends down rain from heaven, and We produce thereby the vegetation of every kind."
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          - Qur'an 6:99
        </p>
      </div>
    </div>
  );
};