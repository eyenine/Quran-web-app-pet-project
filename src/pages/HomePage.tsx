import React from 'react';
import { Link } from 'react-router-dom';
import { DailyAyah } from '../components';
import { useBookmarks } from '../context';

export const HomePage: React.FC = () => {
  const { bookmarkCount } = useBookmarks();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-primary-600 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Welcome to the Qur'an Web App
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Read, listen, and reflect on the Holy Qur'an with beautiful Arabic text, translations, and audio recitations.
        </p>
      </div>

      {/* Daily Ayah */}
      <DailyAyah />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link 
          to="/surahs" 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow group"
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📖</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Browse Surahs
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Explore all 114 Surahs of the Holy Qur'an
          </p>
        </Link>

        <Link 
          to="/juz" 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow group"
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📚</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Juz Navigation
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Navigate through 30 Juz (Para) of the Quran
          </p>
        </Link>

        <Link 
          to="/search" 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow group"
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Search Verses
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Find specific verses by keywords
          </p>
        </Link>

        <Link 
          to="/bookmarks" 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow group"
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🔖</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            My Bookmarks
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {bookmarkCount} saved verse{bookmarkCount !== 1 ? 's' : ''}
          </p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Getting Started
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              📱 Mobile Friendly
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Optimized for reading on all devices with responsive design
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              🎧 Audio Recitation
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Listen to beautiful recitations with per-verse audio controls
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              🌍 Multiple Languages
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Read translations in English and Bengali
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              🌙 Dark Mode
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Comfortable reading experience in any lighting condition
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};