import { createContext, useState, ReactNode, useEffect } from 'react';
import viTranslations from '../locales/vi.json';
import enTranslations from '../locales/en.json';
import zhTranslations from '../locales/zh.json';

interface LanguageContextType {
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  vi: viTranslations,
  en: enTranslations,
  zh: zhTranslations,
} as Record<string, Record<string, string>>;

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    return localStorage.getItem("appLanguage") || "vi";
  });

  const t = (key: string, options?: Record<string, string | number>): string => {
    let translation = translations[selectedLanguage]?.[key] || key;

    if (options) {
      for (const optionKey in options) {
        const placeholder = `{${optionKey}}`;
        if (translation.includes(placeholder)) {
          translation = translation.replace(placeholder, String(options[optionKey]));
        }
      }
    }
    return translation;
  };

  useEffect(() => {
    localStorage.setItem("appLanguage", selectedLanguage);
  }, [selectedLanguage]);

  const value = { selectedLanguage, setSelectedLanguage, t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};