import React, { useEffect, useState, useMemo } from 'react';
import { JSX } from 'react/jsx-runtime';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSurah } from '../services';
import { Surah } from '../types';
import { SurahView, LoadingSpinner, ErrorMessage } from '../components';

export const SurahPage: React.FC = () => {
  // Memoize the page content to prevent unnecessary re-renders
  const [pageContent, setPageContent] = useState<JSX.Element | null>(null);
  const { surahId } = useParams<{ surahId: string }>();
  const navigate = useNavigate();
  const [surah, setSurah] = useState<Surah | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSurah = async () => {
      if (!surahId || isNaN(Number(surahId))) {
        setError('Invalid Surah ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const surahData = await fetchSurah(Number(surahId));
        
        if (!surahData) {
          setError('Surah not found');
        } else {
          // Create page content once and memoize it
          const content = <SurahView surah={surahData} />;
          setPageContent(content);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Surah');
      } finally {
        setLoading(false);
      }
    };

    loadSurah();
  }, [surahId]);

  // Memoize the loading spinner to prevent unnecessary re-renders
  const loadingSpinner = useMemo(() => (
    <div className="flex justify-center py-12">
      <LoadingSpinner size="large" text="Loading Surah..." />
    </div>
  ), []);

  const handleRetry = () => {
    setError(null);
    setSurah(null);
    setLoading(true);
    // Re-trigger the effect
    window.location.reload();
  };

  if (loading) {
    return loadingSpinner;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <ErrorMessage
          title="Failed to Load Surah"
          message={error}
          onRetry={handleRetry}
        />
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!pageContent) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Surah not found</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return pageContent;
};