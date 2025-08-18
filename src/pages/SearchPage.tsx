import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar, SearchResults } from '../components';
import { SearchResult, Ayah, Surah } from '../types';
import { fetchSurahs, fetchSurahVerses } from '../services';
import { useLanguage } from '../context';
import { getSearchHistory, clearSearchHistory } from '../utils/localStorage';
import Fuse from 'fuse.js';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [allData, setAllData] = useState<{ surahs: Surah[]; ayahs: Ayah[] }>({ surahs: [], ayahs: [] });
  const [history, setHistory] = useState<string[]>([]);
  const { language, isEnglishEnabled, isBanglaEnabled } = useLanguage();
  const [rawResults, setRawResults] = useState<SearchResult[]>([]);
  const [selectedSurahId, setSelectedSurahId] = useState<number | 'all'>('all');
  const [selectedJuz, setSelectedJuz] = useState<number | 'all'>('all');
  const THEME_TAGS = useMemo(() => [
    'mercy', 'patience', 'forgiveness', 'justice', 'gratitude', 'guidance', 'faith', 'charity'
  ], []);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(20);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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
    setHistory(getSearchHistory());
  }, []);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setRawResults([]);
      setSearchResults([]);
      setVisibleCount(20);
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

      // Remove duplicates first
      const uniqueResults = results.filter((result, index, self) => 
        index === self.findIndex(r => r.ayah.id === result.ayah.id)
      );

      setRawResults(uniqueResults);
      // Apply filters, tags and limit
      let filtered = uniqueResults;
      if (selectedSurahId !== 'all') {
        filtered = filtered.filter(r => r.ayah.surahId === selectedSurahId);
      }
      if (selectedJuz !== 'all') {
        filtered = filtered.filter(r => r.ayah.juzNumber === selectedJuz);
      }
      if (selectedTags.length > 0) {
        filtered = filtered.filter(r => {
          const text = `${r.ayah.english} ${r.ayah.bangla}`.toLowerCase();
          return selectedTags.some(tag => text.includes(tag.toLowerCase()));
        });
      }
      setVisibleCount(20);
      setSearchResults(filtered.slice(0, 20));
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
    setHistory(getSearchHistory());
  };

  // Re-apply filters and tags when state changes
  useEffect(() => {
    let filtered = rawResults;
    if (selectedSurahId !== 'all') {
      filtered = filtered.filter(r => r.ayah.surahId === selectedSurahId);
    }
    if (selectedJuz !== 'all') {
      filtered = filtered.filter(r => r.ayah.juzNumber === selectedJuz);
    }
    if (selectedTags.length > 0) {
      filtered = filtered.filter(r => {
        const text = `${r.ayah.english} ${r.ayah.bangla}`.toLowerCase();
        return selectedTags.some(tag => text.includes(tag.toLowerCase()));
      });
    }
    setVisibleCount(20);
    setSearchResults(filtered.slice(0, 20));
  }, [selectedSurahId, selectedJuz, selectedTags, rawResults]);

  // Infinite scroll via intersection observer
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 20, rawResults.length));
        }
      });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [rawResults.length]);

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
        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Surah</label>
            <select
              value={selectedSurahId}
              onChange={(e) => setSelectedSurahId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
            >
              <option value="all">All</option>
              {allData.surahs.map(s => (
                <option key={s.id} value={s.id}>{s.id}. {s.englishName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Juz</label>
            <select
              value={selectedJuz}
              onChange={(e) => setSelectedJuz(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
            >
              <option value="all">All</option>
              {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
                <option key={j} value={j}>Juz {j}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Themes</label>
            <div className="flex flex-wrap gap-2">
              {THEME_TAGS.map(tag => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTags(prev => active ? prev.filter(t => t !== tag) : [...prev, tag])}
                    className={`px-2 py-1 text-xs rounded-full border ${active ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200'}`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {history.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Recent searches</span>
              <button
                onClick={() => { clearSearchHistory(); setHistory([]); }}
                className="text-xs text-red-600 dark:text-red-400 hover:underline"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((term, i) => (
                <button
                  key={`${term}-${i}`}
                  onClick={() => handleSearch(term)}
                  className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      <SearchResults
        results={searchResults.slice(0, visibleCount)}
        loading={loading}
        query={query}
        onResultClick={handleResultClick}
      />

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-8" />

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