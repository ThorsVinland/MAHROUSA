import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../theme/colors';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('light');
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme) {
          setThemeMode(savedTheme);
        } else if (systemColorScheme) {
          setThemeMode(systemColorScheme);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsThemeLoaded(true);
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
    try {
      await AsyncStorage.setItem('appTheme', newMode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const isDarkMode = themeMode === 'dark';
  const colors = isDarkMode ? theme.dark : theme.light;

  if (!isThemeLoaded) return null; // Prevent flash of unstyled content while loading theme

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, isDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
