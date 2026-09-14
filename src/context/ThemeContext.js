import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import theme from '../theme/colors';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState(systemColorScheme || 'light');

  // تحديث الوضع إذا تم تغييره من إعدادات النظام
  useEffect(() => {
    if (systemColorScheme) {
      setThemeMode(systemColorScheme);
    }
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setThemeMode(prevMode => (prevMode === 'dark' ? 'light' : 'dark'));
  };

  const isDarkMode = themeMode === 'dark';
  const colors = isDarkMode ? theme.dark : theme.light;

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, isDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
