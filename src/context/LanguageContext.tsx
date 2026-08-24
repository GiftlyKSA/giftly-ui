import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { I18nManager } from 'react-native';
import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';
import { strings, Lang } from '../i18n/strings';

const LANGUAGE_PREFERENCE_KEY = 'giftly.language-preference';

interface LangCtx {
  lang: Lang;
  t: typeof strings.ar;
  setLanguage: (lang: Lang) => void;
}

const LanguageContext = createContext<LangCtx>({
  lang: 'ar',
  t: strings.ar,
  setLanguage: () => {},
});

export function resolveInitialLanguage(deviceLanguage: string | null | undefined, savedLanguage: Lang | null | undefined): Lang {
  if (savedLanguage === 'ar' || savedLanguage === 'en') return savedLanguage;
  return deviceLanguage?.toLowerCase().split(/[-_]/)[0] === 'ar' ? 'ar' : 'en';
}

const applyLayoutDirection = (language: Lang) => {
  const isArabic = language === 'ar';
  I18nManager.allowRTL(isArabic);
  I18nManager.forceRTL(isArabic);
};

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  initialLang?: Lang;
}> = ({ children, initialLang }) => {
  const [lang, setLang] = useState<Lang | null>(initialLang ?? null);

  useEffect(() => {
    if (initialLang) {
      applyLayoutDirection(initialLang);
      return;
    }

    let active = true;
    const initializeLanguage = async () => {
      let savedLanguage: Lang | null = null;
      try {
        const savedValue = await SecureStore.getItemAsync(LANGUAGE_PREFERENCE_KEY);
        savedLanguage = savedValue === 'ar' || savedValue === 'en' ? savedValue : null;
      } catch {}

      const language = resolveInitialLanguage(Localization.getLocales()[0]?.languageCode, savedLanguage);
      // Set native layout direction before the navigator is allowed to render.
      applyLayoutDirection(language);
      if (active) setLang(language);
    };

    void initializeLanguage();
    return () => { active = false; };
  }, [initialLang]);

  const setLanguage = useCallback(async (newLang: Lang) => {
    applyLayoutDirection(newLang);
    setLang(newLang);
    try {
      await SecureStore.setItemAsync(LANGUAGE_PREFERENCE_KEY, newLang);
    } catch {}
    // Reload so native RTL layout direction takes effect immediately.
    try {
      const { DevSettings } = require('react-native');
      DevSettings?.reload?.();
    } catch {}
  }, []);

  if (!lang) return null;

  return (
    <LanguageContext.Provider value={{ lang, t: strings[lang], setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
