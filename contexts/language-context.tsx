'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { translations, type Lang, type TranslationKey } from '@/data/translations';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang); // ← viene del servidor, sin flash

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    document.documentElement.lang = newLang; // sincroniza <html lang> con el contenido
    document.cookie = `lang=${newLang}; path=/; max-age=31536000; samesite=lax; secure`;
  };

  const t = (key: TranslationKey): string => translations[lang][key];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}