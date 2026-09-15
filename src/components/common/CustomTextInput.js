// ============================================================
// src/components/common/CustomTextInput.js
// حقل إدخال قياسي يستهلك رموز نظام التصميم ويدعم RTL
// ============================================================

import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Text 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';
import { radius, spacing, typography } from '../../theme';

export default function CustomTextInput({
  label,
  isPassword = false,
  iconName,
  error,
  style,
  themeMode, // خيار تجاوز الثيم الاختياري
  ...props
}) {
  const themeContext = useTheme();
  const colors = themeMode 
    ? (themeMode === 'dark' ? themeContext.darkColors || themeContext.colors : themeContext.lightColors || themeContext.colors)
    : themeContext.colors;

  const [isSecure, setIsSecure] = useState(isPassword);
  const [isFocused, setIsFocused] = useState(false);

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  const textColor = colors.text;
  const bgColor = colors.surface;
  const borderColor = error ? colors.error : (isFocused ? colors.primary : colors.border);
  const placeholderColor = colors.textMuted;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: textColor }]}>{label}</Text>}
      
      <View style={[
        styles.inputContainer, 
        { 
          backgroundColor: bgColor,
          borderColor: borderColor,
        }
      ]}>
        {/* أيقونة جانبية اختيارية */}
        {iconName && (
          <Ionicons 
            name={iconName} 
            size={20} 
            color={isFocused ? colors.primary : placeholderColor} 
            style={styles.iconStyle} 
          />
        )}
        
        <TextInput
          style={[styles.input, { color: textColor }]}
          secureTextEntry={isSecure}
          placeholderTextColor={placeholderColor}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {/* أيقونة إظهار / إخفاء كلمة المرور */}
        {isPassword && (
          <TouchableOpacity onPress={toggleSecureEntry} style={styles.eyeIcon} activeOpacity={0.7}>
            <Ionicons 
              name={isSecure ? 'eye-off' : 'eye'} 
              size={22} 
              color={placeholderColor} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: '100%',
  },
  label: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    marginBottom: spacing.sm,
    textAlign: 'right', // متوافق مع الاتجاه العربي
  },
  inputContainer: {
    flexDirection: 'row-reverse', // أيقونة اليمين والنص إلى اليسار
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm + 4,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: typography.body.fontSize,
    textAlign: 'right',
    paddingVertical: spacing.sm,
    fontFamily: typography?.fontFamily?.regular || undefined,
  },
  iconStyle: {
    marginLeft: spacing.sm + 2,
  },
  eyeIcon: {
    marginRight: spacing.sm + 2,
    padding: spacing.xs,
  },
  errorText: {
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
});
