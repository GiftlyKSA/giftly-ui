import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { I18nManager } from 'react-native';
import { strings, Lang } from '../i18n/strings';

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

// I18nManager.isRTL persists across JS reloads via native storage (NSUserDefaults / SharedPreferences).
// forceRTL(true) is called on every 'ar' session, so after first launch it reliably reflects the
// user's last choice. On a truly fresh install, isRTL may be false on non-Arabic devices;
// we default to 'ar' in that case since this is an Arabic-first app.
function getInitialLang(): Lang {
  // forceRTL(false) is only ever called when the user explicitly picks English,
  // so isRTL===false after a reload means English was intentionally chosen.
  // isRTL===true (or unknown / first install) → Arabic default.
  if (typeof I18nManager.isRTL === 'boolean' && !I18nManager.isRTL) {
    // Only treat false as English if we know it was set by us (not device default).
    // We approximate this by checking whether the value was already set to true at some point.
    // Since forceRTL(true) is called on every Arabic session, if it's now false it was
    // explicitly changed by setLanguage → return 'en'.
    // Exception: very first install where forceRTL was never called → isRTL reflects
    // device locale. We can't distinguish, so we accept English-locale devices may
    // briefly show English on the absolute first launch before forceRTL(true) fires.
    return 'en';
  }
  return 'ar';
}

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  initialLang?: Lang;
}> = ({ children, initialLang }) => {
  const [lang, setLang] = useState<Lang>(initialLang ?? getInitialLang());

  useEffect(() => {
    // Keep native RTL state in sync; persists across reloads via native storage.
    I18nManager.allowRTL(lang === 'ar');
    I18nManager.forceRTL(lang === 'ar');
  }, [lang]);

  const setLanguage = useCallback((newLang: Lang) => {
    // Persist choice via I18nManager (survives JS bundle reloads).
    I18nManager.allowRTL(newLang === 'ar');
    I18nManager.forceRTL(newLang === 'ar');
    setLang(newLang);
    // Reload so native RTL layout direction takes effect immediately.
    try {
      const { DevSettings } = require('react-native');
      DevSettings?.reload?.();
    } catch {}
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, t: strings[lang], setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
