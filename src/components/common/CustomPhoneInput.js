import React, { useState, useRef } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Text,
  useColorScheme,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme/colors';

export default function CustomPhoneInput({
  label,
  iconName = "call-outline",
  error,
  style,
  themeMode,
  countryCode = "+213",
  value = "",
  onChangeText,
  ...props
}) {
  const systemColorScheme = useColorScheme();
  const currentMode = themeMode || systemColorScheme;
  const isDarkMode = currentMode === 'dark';
  const colors = isDarkMode ? theme.dark : theme.light;

  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const textColor = colors.primaryText || (isDarkMode ? '#fff' : '#2C3E50');
  const bgColor = colors.cardBackground || (isDarkMode ? '#1e1e1e' : '#FDFEFE');
  const borderColor = error ? (colors.urgentRed || '#E74C3C') : (isFocused ? (colors.mainBlue || '#2E86C1') : (isDarkMode ? '#333' : '#E0E0E0'));
  const placeholderColor = isDarkMode ? '#888' : '#A6ACAF';

  // تنظيف النص ليبقى أرقام فقط، وبحد أقصى 9 أرقام
  const digits = value.replace(/\D/g, '').substring(0, 9);

  const handleTextChange = (text) => {
    let formatted = text.replace(/\D/g, '');
    // إذا كتب المستخدم 0 في البداية، نحذفه فوراً لأن رمز البلد موجود
    if (formatted.startsWith('0')) {
      formatted = formatted.substring(1);
    }
    formatted = formatted.substring(0, 9);
    if (onChangeText) {
      onChangeText(formatted);
    }
  };

  const renderSlot = (index) => {
    const isFilled = digits.length > index;
    const isCurrent = digits.length === index && isFocused; // Slot that will receive next input
    
    return (
      <View key={index} style={[styles.slot, isCurrent && { borderBottomColor: colors.mainBlue || '#2E86C1', borderBottomWidth: 2 }]}>
        <Text style={[styles.slotText, { color: isFilled ? textColor : placeholderColor }]}>
          {isFilled ? digits[index] : '_'}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: textColor }]}>{label}</Text>}
      
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={() => inputRef.current?.focus()}
        style={[
          styles.inputContainer, 
          { 
            backgroundColor: bgColor,
            borderColor: borderColor
          }
        ]}
      >
        {/* أيقونة الهاتف */}
        <Ionicons 
          name={iconName} 
          size={20} 
          color={isFocused ? (colors.mainBlue || '#2E86C1') : placeholderColor} 
          style={styles.iconStyle} 
        />

        {/* رمز البلد */}
        <View style={styles.countryCodeContainer}>
          <Text style={[styles.countryCodeText, { color: textColor }]}>{countryCode}</Text>
        </View>

        {/* خط فاصل */}
        <View style={[styles.separator, { backgroundColor: isDarkMode ? '#333' : '#E0E0E0' }]} />
        
        {/* العرض البصري للأرقام (Masked Input) */}
        <View style={styles.slotsContainer}>
          <View style={styles.slotGroup}>{[0, 1, 2].map(renderSlot)}</View>
          <View style={styles.slotGroup}>{[3, 4].map(renderSlot)}</View>
          <View style={styles.slotGroup}>{[5, 6].map(renderSlot)}</View>
          <View style={styles.slotGroup}>{[7, 8].map(renderSlot)}</View>
        </View>

        {/* إدخال رقم الهاتف الفعلي (مخفي) */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          keyboardType="number-pad"
          maxLength={9}
          value={digits}
          onChangeText={handleTextChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          caretHidden={true}
          {...props}
        />
      </TouchableOpacity>
      
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
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 55,
    position: 'relative',
  },
  iconStyle: {
    marginRight: 10,
  },
  countryCodeContainer: {
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '700',
    direction: 'ltr',
  },
  separator: {
    width: 1,
    height: '60%',
    marginHorizontal: 10,
  },
  slotsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  slotGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slot: {
    width: 12, // Reduced slightly to ensure it fits small screens
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  slotText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});
