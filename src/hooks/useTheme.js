// ============================================================
// src/hooks/useTheme.js
// خطاف مخصص لاستهلاك سياق الثيم ورموز التصميم في المكونات والشاشات
// ============================================================

import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { lightColors } from '../theme/colors';
import spacing from '../theme/spacing';
import typography from '../theme/typography';
import radius from '../theme/radius';
import shadows from '../theme/shadows';

export default function useTheme() {
  const context = useContext(ThemeContext);

  // تأمين قيم افتراضية في حال تم الاستدعاء خارج الـ Provider
  if (!context) {
    return {
      themeMode: 'light',
      isDarkMode: false,
      colors: lightColors,
      spacing,
      typography,
      radius,
      shadows,
      toggleTheme: () => {},
      setThemeMode: () => {},
    };
  }

  return context;
}
