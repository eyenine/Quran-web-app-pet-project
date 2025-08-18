import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { NoteEntry } from '../types';
import { getNote, saveNote, deleteNote, listAllNotes } from '../utils/localStorage';

interface NotesContextType {
	notes: NoteEntry[];
	get: (surahId: number, ayahNumber: number) => NoteEntry | null;
	save: (entry: Omit<NoteEntry, 'createdAt' | 'updatedAt'>) => boolean;
	remove: (surahId: number, ayahNumber: number) => boolean;
	refresh: () => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

interface NotesProviderProps {
	children: ReactNode;
}

export const NotesProvider: React.FC<NotesProviderProps> = ({ children }) => {
	const [notes, setNotes] = useState<NoteEntry[]>(() => listAllNotes());

	const refresh = () => setNotes(listAllNotes());

	const get = (surahId: number, ayahNumber: number): NoteEntry | null => {
		return getNote(surahId, ayahNumber);
	};

	const save = (entry: Omit<NoteEntry, 'createdAt' | 'updatedAt'>): boolean => {
		const existing = get(entry.surahId, entry.ayahNumber);
		const now = Date.now();
		const full: NoteEntry = {
			...entry,
			content: entry.content.trim(),
			createdAt: existing?.createdAt ?? now,
			updatedAt: now,
			tags: entry.tags || existing?.tags || []
		};
		const ok = saveNote(full);
		if (ok) refresh();
		return ok;
	};

	const remove = (surahId: number, ayahNumber: number): boolean => {
		const ok = deleteNote(surahId, ayahNumber);
		if (ok) refresh();
		return ok;
	};

	const value = useMemo<NotesContextType>(() => ({ notes, get, save, remove, refresh }), [notes]);

	return (
		<NotesContext.Provider value={value}>
			{children}
		</NotesContext.Provider>
	);
};

export const useNotes = (): NotesContextType => {
	const ctx = useContext(NotesContext);
	if (!ctx) throw new Error('useNotes must be used within a NotesProvider');
	return ctx;
};
