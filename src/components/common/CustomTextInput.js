import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  useColorScheme 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme/colors';

export default function CustomTextInput({
  label,
  isPassword = false,
  iconName,
  error,
  style,
  themeMode, // Prop to override system theme
  ...props
}) {
  const systemColorScheme = useColorScheme();
  // إذا تم تمرير themeMode استخدمه، وإلا استخدم إعداد النظام
  const currentMode = themeMode || systemColorScheme;
  const isDarkMode = currentMode === 'dark';
  const colors = isDarkMode ? theme.dark : theme.light;

  const [isSecure, setIsSecure] = useState(isPassword);
  const [isFocused, setIsFocused] = useState(false);

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  // تأمين ألوان افتراضية لتجنب الأخطاء في حال كان الوضع الداكن فارغاً
  const textColor = colors.primaryText || (isDarkMode ? '#fff' : '#2C3E50');
  const bgColor = colors.cardBackground || (isDarkMode ? '#1e1e1e' : '#FDFEFE');
  const borderColor = error ? (colors.urgentRed || '#E74C3C') : (isFocused ? (colors.mainBlue || '#2E86C1') : (isDarkMode ? '#333' : '#E0E0E0'));
  const placeholderColor = isDarkMode ? '#888' : '#A6ACAF';

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: textColor }]}>{label}</Text>}
      
      <View style={[
        styles.inputContainer, 
        { 
          backgroundColor: bgColor,
          borderColor: borderColor
        }
      ]}>
        {/* أيقونة اختيارية تظهر في الجانب (حسب اتجاه النص ستكون يسار أو يمين) */}
        {iconName && (
          <Ionicons 
            name={iconName} 
            size={20} 
            color={isFocused ? (colors.mainBlue || '#2E86C1') : placeholderColor} 
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
        
        {/* أيقونة العين تظهر فقط إذا كان الحقل مخصصاً لكلمة المرور */}
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
      
      {error && <Text style={[styles.errorText, { color: colors.urgentRed || '#E74C3C' }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right', // متوافق مع اللغة العربية
  },
  inputContainer: {
    flexDirection: 'row-reverse', // يجعل الأيقونات والنص تتماشى مع العربية من اليمين لليسار
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right', // الكتابة تبدأ من اليمين
    paddingVertical: 8,
    fontFamily: 'System',
  },
  iconStyle: {
    marginLeft: 10,
  },
  eyeIcon: {
    marginRight: 10,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});
