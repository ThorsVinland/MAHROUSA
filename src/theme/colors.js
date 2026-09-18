// ============================================================
// src/theme/colors.js
// نظام الألوان الخاص بتطبيق محروسة | MAHROUSA
// ============================================================
// - الألوان أدناه مستخرجة من وثيقة مواصفات المنتج (Design Spec)
//   وهي مخصصة حالياً للوضع الفاتح (Light Mode).
// - تم ترك "darkColors" فارغة عمداً بنفس المفاتيح (keys) ليتم
//   تعبئتها لاحقاً دون الحاجة لتعديل باقي الكود الذي يستدعيها.
// ============================================================

export const lightColors = {
  // Old Theme Colors (Legacy)
  primaryDarkBlue: '#1A5276',
  mainBlue: '#2E86C1',
  lightBlueBg: '#EBF5FB',
  successGreen: '#27AE60',
  urgentRed: '#E74C3C',
  orangeHighPriority: '#E67E22',
  purpleOrganizations: '#8E44AD',
  pageBackground: '#F4F6F7',
  cardBackground: '#FDFEFE',
  primaryText: '#2C3E50',

  // New Design System Colors
  background: '#F8F4EE',
  surface: '#FFFFFF',
  primaryNavy: '#1A5276',
  lightBlue: '#EBF5FB',
  gold: '#D4A017',
  success: '#27AE60',
  warning: '#E67E22',
  error: '#E74C3C',
  urgent: '#E74C3C',
  organization: '#8E44AD',
  badgeUrgentBg: '#FEE2E2',
  badgeUrgentText: '#E74C3C',
  badgeHighBg: '#FEF3C7',
  badgeHighText: '#E67E22',
  badgeSummerBg: '#DCFCE7',
  badgeSummerText: '#27AE60',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textDisabled: '#9CA3AF',
  placeholder: '#9CA3AF',
  borderDefault: '#E5E7EB',
  borderFocus: '#2E86C1',
  borderError: '#E74C3C',
};

export const darkColors = {
  // Old Theme Colors (Legacy)
  primaryDarkBlue: '#2E86C1',
  mainBlue: '#3498DB',
  lightBlueBg: '#1C2833',
  successGreen: '#27AE60',
  urgentRed: '#E74C3C',
  orangeHighPriority: '#E67E22',
  purpleOrganizations: '#9B59B6',
  pageBackground: '#121212',
  cardBackground: '#1E1E1E',
  primaryText: '#ECF0F1',

  // New Design System Colors (Dark variants)
  background: '#121212',
  surface: '#1E1E1E',
  primaryNavy: '#2E86C1', // Lighter for dark mode
  lightBlue: '#1C2833',
  gold: '#F1C40F',
  success: '#2ecc71',
  warning: '#f39c12',
  error: '#e74c3c',
  urgent: '#e74c3c',
  organization: '#9b59b6',
  badgeUrgentBg: '#3b1c1c',
  badgeUrgentText: '#ff6b6b',
  badgeHighBg: '#3b2f15',
  badgeHighText: '#f39c12',
  badgeSummerBg: '#1c3b24',
  badgeSummerText: '#2ecc71',
  textPrimary: '#ECF0F1',
  textSecondary: '#9CA3AF',
  textDisabled: '#4B5563',
  placeholder: '#4B5563',
  borderDefault: '#374151',
  borderFocus: '#3498db',
  borderError: '#e74c3c',
};

// تجميع الثيمين معاً — يُستخدم مع useColorScheme() أو Context الخاص بالثيم
const theme = {
  light: lightColors,
  dark: darkColors,
};

export default theme;
