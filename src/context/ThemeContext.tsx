import React, { createContext, useContext, useState, useCallback } from 'react';
import { lightColors, darkColors, ThemeColors } from '../constants/colors';

interface ThemeCtx {
  isDark: boolean;
  C: ThemeColors;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx>({
  isDark: false,
  C: lightColors,
  toggle: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggle = useCallback(() => setIsDark(d => !d), []);

  return (
    <ThemeContext.Provider value={{ isDark, C: isDark ? darkColors : lightColors, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
