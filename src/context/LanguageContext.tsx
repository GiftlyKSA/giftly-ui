import React, { createContext, useContext, useState, useCallback } from 'react';
import { I18nManager, Alert } from 'react-native';
import { strings, Lang } from '../i18n/strings';

const LANG_KEY = 'giftly_lang';

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

// Read initial language synchronously from I18nManager direction
// (set on previous launch via forceRTL). Defaults to Arabic.
function getInitialLang(): Lang {
  try {
    const stored = (globalThis as any).__giftly_lang as Lang | undefined;
    if (stored === 'ar' || stored === 'en') return stored;
  } catch {}
  return I18nManager.isRTL ? 'ar' : 'en';
}

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  initialLang?: Lang;
}> = ({ children, initialLang }) => {
  const [lang, setLang] = useState<Lang>(initialLang ?? getInitialLang());

  const setLanguage = useCallback((newLang: Lang) => {
    setLang(newLang);
    (globalThis as any).__giftly_lang = newLang;
    I18nManager.forceRTL(newLang === 'ar');

    const t = strings[newLang];
    Alert.alert(
      t.lang_restart_title,
      t.lang_restart_msg,
      [{
        text: t.lang_ok,
        onPress: () => {
          // Attempt dev reload; in production the user restarts manually
          try {
            const { DevSettings } = require('react-native');
            if (DevSettings?.reload) DevSettings.reload();
          } catch {}
        },
      }],
    );
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, t: strings[lang], setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
