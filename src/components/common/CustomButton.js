// ============================================================
// src/components/common/CustomButton.js
// زر قياسي قابل لإعادة الاستخدام يستهلك رموز نظام التصميم
// ============================================================

import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';
import { radius, shadows, spacing, typography } from '../../theme';

export default function CustomButton({
  title,
  onPress,
  type = 'primary', // primary, secondary, outline
  style,
  textStyle,
  disabled = false,
  loading = false,
  iconName,
  themeMode, // خيار تجاوز الثيم الاختياري
  ...props
}) {
  const themeContext = useTheme();
  const colors = themeMode 
    ? (themeMode === 'dark' ? themeContext.darkColors || themeContext.colors : themeContext.lightColors || themeContext.colors)
    : themeContext.colors;

  // تحديد الألوان بناءً على نوع الزر ورموز الثيم
  let bgColor;
  let textColor;
  let borderColor;

  switch (type) {
    case 'secondary':
      bgColor = colors.primary;
      textColor = colors.textLight || '#FFFFFF';
      borderColor = 'transparent';
      break;
    case 'outline':
      bgColor = 'transparent';
      textColor = colors.primaryDark;
      borderColor = colors.primaryDark;
      break;
    case 'primary':
    default:
      bgColor = colors.primaryDark;
      textColor = colors.textLight || '#FFFFFF';
      borderColor = 'transparent';
      break;
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
          borderWidth: type === 'outline' ? 1.5 : 0,
          opacity: disabled || loading ? 0.6 : 1,
        },
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {iconName && (
            <Ionicons 
              name={iconName} 
              size={20} 
              color={textColor} 
              style={styles.iconStyle} 
            />
          )}
          <Text style={[styles.text, { color: textColor }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    borderRadius: radius.md,
    flexDirection: 'row-reverse', // متوافق مع الاتجاه العربي
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    width: '100%',
    ...shadows.md,
  },
  text: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    fontFamily: typography?.fontFamily?.bold || undefined,
  },
  iconStyle: {
    marginLeft: spacing.sm,
  },
});
