// ============================================================
// src/components/auth/AppInput.tsx
// Standard Animated Form Input for MAHROUSA Design System
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardTypeOptions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface AppInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureText?: boolean;
  keyboardType?: KeyboardTypeOptions;
  icon?: keyof typeof Ionicons.glyphMap;
  editable?: boolean;
  helperText?: string;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureText = false,
  keyboardType = 'default',
  icon,
  editable = true,
  helperText,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Animated floating label
  const animatedFocus = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedFocus, {
      toValue: isFocused || value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, animatedFocus]);

  const labelTop = animatedFocus.interpolate({
    inputRange: [0, 1],
    outputRange: [16, -10],
  });

  const labelFontSize = animatedFocus.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 12],
  });

  const getBorderColor = (): string => {
    if (error) return Colors.borderError;
    if (isFocused) return Colors.borderFocus;
    return Colors.borderDefault;
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: getBorderColor(),
            backgroundColor: editable ? Colors.surface : Colors.background,
          },
        ]}
      >
        {/* Animated Floating Label */}
        <Animated.Text
          style={[
            styles.floatingLabel,
            {
              top: labelTop,
              fontSize: labelFontSize,
              color: error ? Colors.error : isFocused ? Colors.mainBlue : Colors.textSecondary,
              backgroundColor: isFocused || value ? Colors.surface : 'transparent',
            },
          ]}
        >
          {label}
        </Animated.Text>

        {/* Right Icon (Ionicons) */}
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? Colors.mainBlue : Colors.textSecondary}
            style={styles.rightIcon}
          />
        )}

        {/* Text Input */}
        <TextInput
          style={[styles.input, { color: editable ? Colors.textPrimary : Colors.textDisabled }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={isFocused ? placeholder : ''}
          placeholderTextColor={Colors.placeholder}
          secureTextEntry={secureText && !isPasswordVisible}
          keyboardType={keyboardType}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Password Eye Toggle */}
        {secureText && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeToggle}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Helper Text */}
      {helperText && !error ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}

      {/* Error Message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    height: 54,
    paddingHorizontal: 12,
  },
  floatingLabel: {
    position: 'absolute',
    right: 14,
    paddingHorizontal: 4,
    fontWeight: '500',
    zIndex: 1,
  },
  rightIcon: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    textAlign: 'right',
    fontSize: Typography.body.fontSize,
    paddingHorizontal: 8,
  },
  eyeToggle: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
    marginRight: 4,
  },
  errorText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.error,
    textAlign: 'right',
    marginTop: 4,
    marginRight: 4,
    fontWeight: '500',
  },
});
