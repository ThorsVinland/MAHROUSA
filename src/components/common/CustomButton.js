import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme/colors';

export default function CustomButton({
  title,
  onPress,
  type = 'primary', // primary, secondary, outline
  style,
  textStyle,
  disabled = false,
  loading = false,
  iconName,
  themeMode, // Prop to override system theme
  ...props
}) {
  const systemColorScheme = useColorScheme();
  const currentMode = themeMode || systemColorScheme;
  const isDarkMode = currentMode === 'dark';
  const colors = isDarkMode ? theme.dark : theme.light;

  // تحديد الألوان بناءً على نوع الزر
  let bgColor;
  let textColor;
  let borderColor;

  const fallbackPrimary = '#1A5276';
  const fallbackSecondary = '#2E86C1';

  switch (type) {
    case 'secondary':
      bgColor = colors.mainBlue || fallbackSecondary;
      textColor = '#FFFFFF';
      borderColor = 'transparent';
      break;
    case 'outline':
      bgColor = 'transparent';
      textColor = colors.primaryDarkBlue || fallbackPrimary;
      borderColor = colors.primaryDarkBlue || fallbackPrimary;
      break;
    case 'primary':
    default:
      bgColor = colors.primaryDarkBlue || fallbackPrimary;
      textColor = '#FFFFFF';
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
    borderRadius: 10,
    flexDirection: 'row-reverse', // للغة العربية
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, // For Android
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'System',
  },
  iconStyle: {
    marginLeft: 8,
  },
});
