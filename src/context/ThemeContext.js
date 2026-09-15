// ============================================================
// src/context/ThemeContext.js
// سياق إدارة الثيم المركزي وتوفير رموز التصميم لتطبيق محروسة
// ============================================================

import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '../theme/colors';
import spacing from '../theme/spacing';
import typography from '../theme/typography';
import radius from '../theme/radius';
import shadows from '../theme/shadows';

export const ThemeContext = createContext({
  themeMode: 'light',
  isDarkMode: false,
  colors: lightColors,
  spacing,
  typography,
  radius,
  shadows,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState(systemColorScheme || 'light');

  // مزامنة مع وضع النظام إذا تغير
  useEffect(() => {
    if (systemColorScheme) {
      setThemeMode(systemColorScheme);
    }
  }, [systemColorScheme]);

  const isDarkMode = themeMode === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const value = {
    themeMode,
    isDarkMode,
    colors,
    spacing,
    typography,
    radius,
    shadows,
    toggleTheme,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
