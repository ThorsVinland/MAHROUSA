// ============================================================
// src/theme/index.js
// نقطة التصدير الموحدة لنظام تصميم محروسة | MAHROUSA
// ============================================================

import theme, { lightColors, darkColors } from './colors.js';
import spacing from './spacing.js';
import typography, { fontFamily } from './typography.js';
import radius from './radius.js';
import shadows from './shadows.js';

export {
  theme,
  lightColors,
  darkColors,
  lightColors as colors,
  spacing,
  typography,
  fontFamily,
  radius,
  shadows,
};

export default {
  colors: lightColors,
  theme,
  lightColors,
  darkColors,
  spacing,
  typography,
  fontFamily,
  radius,
  shadows,
};
