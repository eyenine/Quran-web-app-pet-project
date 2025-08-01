import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getUserPreferences, updateUserPreference } from '../utils/localStorage';

type Language = 'english' | 'bangla' | 'both';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  isEnglishEnabled: boolean;
  isBanglaEnabled: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const preferences = getUserPreferences();
    return preferences.language;
  });

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    updateUserPreference('language', newLanguage);
  };

  const isEnglishEnabled = language === 'english' || language === 'both';
  const isBanglaEnabled = language === 'bangla' || language === 'both';

  const value: LanguageContextType = {
    language,
    setLanguage,
    isEnglishEnabled,
    isBanglaEnabled,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};