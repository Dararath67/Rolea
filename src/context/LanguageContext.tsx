'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { km } from '@/locales/km';
import { en } from '@/locales/en';
import { zh } from '@/locales/zh';

export type Language = 'km' | 'en' | 'zh';
export type Currency = 'USD' | 'KHR';

export const EXCHANGE_RATE = 4100;

interface LanguageContextType {
  language: Language;
  currency: Currency;
  t: typeof km;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  toggleLanguage: () => void;
  toggleCurrency: () => void;
  formatPrice: (amountUsd: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('km');
  const currency: Currency = 'USD';

  // Load from localStorage on client mount if available
  useEffect(() => {
    const savedLang = localStorage.getItem('rolea_lang') as Language;
    if (savedLang === 'km' || savedLang === 'en' || savedLang === 'zh') setLanguageState(savedLang);
    localStorage.setItem('rolea_curr', 'USD');
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('rolea_lang', lang);
  };

  const setCurrency = (_curr: Currency) => {
    localStorage.setItem('rolea_curr', 'USD');
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'km' ? 'en' : language === 'en' ? 'zh' : 'km';
    setLanguage(nextLang);
  };

  const toggleCurrency = () => {
    localStorage.setItem('rolea_curr', 'USD');
  };

  const formatPrice = (amountUsd: number): string => {
    return `$${amountUsd.toFixed(2)}`;
  };

  const t = language === 'km' ? km : language === 'zh' ? (zh as unknown as typeof km) : en;

  return (
    <LanguageContext.Provider
      value={{
        language,
        currency,
        t,
        setLanguage,
        setCurrency,
        toggleLanguage,
        toggleCurrency,
        formatPrice,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
