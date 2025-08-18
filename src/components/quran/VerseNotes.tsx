import React, { useEffect, useState } from 'react';
import { useNotes } from '../../context';

interface VerseNotesProps {
	surahId: number;
	ayahNumber: number;
	isOpen: boolean;
	onClose: () => void;
}

export const VerseNotes: React.FC<VerseNotesProps> = ({ surahId, ayahNumber, isOpen, onClose }) => {
	const { get, save, remove } = useNotes();
	const [content, setContent] = useState('');
	const [tagsInput, setTagsInput] = useState('');

	useEffect(() => {
		if (isOpen) {
			const existing = get(surahId, ayahNumber);
			setContent(existing?.content || '');
			setTagsInput(existing?.tags?.join(', ') || '');
		}
	}, [isOpen, surahId, ayahNumber, get]);

	const handleSave = () => {
		const tags = tagsInput
			.split(',')
			.map(t => t.trim())
			.filter(Boolean);
		save({ surahId, ayahNumber, ayahId: Number(`${surahId}${String(ayahNumber).padStart(3,'0')}`), content, tags });
		onClose();
	};

	const handleDelete = () => {
		remove(surahId, ayahNumber);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-4 space-y-3">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-medium text-gray-900 dark:text-white">Notes — {surahId}:{ayahNumber}</h3>
					<button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				<textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					className="w-full h-40 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
					placeholder="Write your thoughts or reflections..."
				/>
				<div>
					<label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Tags (comma separated)</label>
					<input
						value={tagsInput}
						onChange={(e) => setTagsInput(e.target.value)}
						className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
						placeholder="hope, patience, mercy"
					/>
				</div>
				<div className="flex justify-between">
					<button onClick={handleDelete} className="px-3 py-1 text-sm rounded border border-red-300 text-red-600">Delete</button>
					<div className="space-x-2">
						<button onClick={onClose} className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600">Cancel</button>
						<button onClick={handleSave} className="px-3 py-1 text-sm rounded bg-primary-600 text-white">Save</button>
					</div>
				</div>
			</div>
		</div>
	);
};
