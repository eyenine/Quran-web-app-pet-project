import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SurahList } from '../components/quran';
import { Surah } from '../types';

export const SurahsPage: React.FC = () => {
	const navigate = useNavigate();

	const handleSurahSelect = (surah: Surah) => {
		navigate(`/surah/${surah.id}`);
	};

	return (
		<div className="space-y-6">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Browse Surahs</h1>
				<p className="text-gray-600 dark:text-gray-300">Explore all 114 Surahs. Use the filter or A–Z index to jump.</p>
			</div>

			<SurahList onSurahSelect={handleSurahSelect} className="bg-transparent" />
		</div>
	);
};


