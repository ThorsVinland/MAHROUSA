// ============================================================
// src/constants/colors.ts
// Strict Color Palette for MAHROUSA Design System
// ============================================================

export const Colors = {
  // Backgrounds
  background: '#F8F4EE', // warm cream — main canvas
  surface: '#FFFFFF', // white — cards & inputs

  // Brand
  primaryNavy: '#1A5276', // primary buttons, headers
  mainBlue: '#2E86C1', // links, active states
  lightBlue: '#EBF5FB', // subtle highlights
  gold: '#D4A017', // accent only — use sparingly

  // Status
  success: '#27AE60',
  warning: '#E67E22',
  error: '#E74C3C',
  urgent: '#E74C3C',
  organization: '#8E44AD',

  // Badges & Pastels
  badgeUrgentBg: '#FEE2E2',
  badgeUrgentText: '#E74C3C',
  badgeHighBg: '#FEF3C7',
  badgeHighText: '#E67E22',
  badgeSummerBg: '#DCFCE7',
  badgeSummerText: '#27AE60',

  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textDisabled: '#9CA3AF',
  placeholder: '#9CA3AF',

  // Borders
  borderDefault: '#E5E7EB',
  borderFocus: '#2E86C1',
  borderError: '#E74C3C',
} as const;

export type ColorToken = keyof typeof Colors;
