import React, { ReactNode } from 'react';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import { BookmarkProvider } from './BookmarkContext';
import { AudioProvider } from './AudioContext';
import { NotesProvider } from './NotesContext';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BookmarkProvider>
          <AudioProvider>
            <NotesProvider>
              {children}
            </NotesProvider>
          </AudioProvider>
        </BookmarkProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};