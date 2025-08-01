import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar, SearchResults } from '../components';
import { SearchResult, Ayah, Surah } from '../types';
import { fetchSurahs, fetchSurahVerses } from '../services';
import { useLanguage } from '../context';
import Fuse from 'fuse.js';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [allData, setAllData] = useState<{ surahs: Surah[]; ayahs: Ayah[] }>({ surahs: [], ayahs: [] });
  const { language, isEnglishEnabled, isBanglaEnabled } = useLanguage();

  // Load all data for search
  useEffect(() => {
    const loadSearchData = async () => {
      try {
        // Clear cache to ensure fresh data
        sessionStorage.clear();
        
        const surahs = await fetchSurahs();
        // Load first 10 surahs' verses for better search coverage
        const ayahsPromises = surahs.slice(0, 10).map(surah => fetchSurahVerses(surah.id));
        const ayahsArrays = await Promise.all(ayahsPromises);
        const ayahs = ayahsArrays.flat();
        
        console.log(`Loaded ${ayahs.length} verses from ${surahs.length} surahs for search`);
        setAllData({ surahs, ayahs });
      } catch (error) {
        console.error('Failed to load search data:', error);
      }
    };

    loadSearchData();
  }, []);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    
    try {
      const results: SearchResult[] = [];
      
      // Search in Surah names
      const surahFuse = new Fuse(allData.surahs, {
        keys: ['englishName', 'banglaName'],
        threshold: 0.3,
      });
      
      const surahMatches = surahFuse.search(searchQuery);
      surahMatches.forEach(match => {
        // For each matching surah, add its first verse as a result
        const firstAyah = allData.ayahs.find(ayah => ayah.surahId === match.item.id);
        if (firstAyah) {
          results.push({
            ayah: firstAyah,
            surah: match.item,
            matchType: 'surah_name',
            highlightedText: match.item.englishName
          });
        }
      });

      // Search in translations
      const searchKeys: string[] = [];
      if (isEnglishEnabled) searchKeys.push('english');
      if (isBanglaEnabled) searchKeys.push('bangla');

      if (searchKeys.length > 0) {
        const ayahFuse = new Fuse(allData.ayahs, {
          keys: searchKeys,
          threshold: 0.4,
        });

        const ayahMatches = ayahFuse.search(searchQuery);
        ayahMatches.forEach(match => {
          const surah = allData.surahs.find(s => s.id === match.item.surahId);
          if (surah) {
            const matchType = match.matches?.[0]?.key as 'english' | 'bangla' || 'english';
            results.push({
              ayah: match.item,
              surah,
              matchType,
              highlightedText: match.matches?.[0]?.value || ''
            });
          }
        });
      }

      // Remove duplicates and limit results
      const uniqueResults = results.filter((result, index, self) => 
        index === self.findIndex(r => r.ayah.id === result.ayah.id)
      ).slice(0, 20);

      setSearchResults(uniqueResults);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    performSearch(searchQuery);
  };

  const handleResultClick = (surahId: number, ayahNumber: number) => {
    navigate(`/surah/${surahId}`);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Search the Qur'an
        </h1>
        <SearchBar 
          onSearch={handleSearch}
          placeholder="Search for verses, keywords, or Surah names..."
        />
      </div>

      {/* Search Results */}
      <SearchResults
        results={searchResults}
        loading={loading}
        query={query}
        onResultClick={handleResultClick}
      />

      {/* Search Tips */}
      {!query && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-200 mb-3">
            Search Tips
          </h3>
          <ul className="text-blue-800 dark:text-blue-300 space-y-2 text-sm">
            <li>• Search for specific words or phrases in translations</li>
            <li>• Use Surah names to find specific chapters</li>
            <li>• Search works in both English and Bengali based on your language settings</li>
            <li>• Results are limited to the first 5 Surahs for demo purposes</li>
          </ul>
        </div>
      )}
    </div>
  );
};