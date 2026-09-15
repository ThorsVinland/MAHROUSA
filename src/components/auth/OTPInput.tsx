// ============================================================
// src/components/auth/OTPInput.tsx
// 4-Digit OTP Box with Auto-Focus and Shake Animation
// ============================================================

import React, { useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChange,
  length = 4,
  error,
}) => {
  const inputsRef = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Trigger shake animation when error occurs
  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [error, shakeAnim]);

  const handleChangeText = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const currentDigits = value.split('');

    if (cleanText.length > 0) {
      currentDigits[index] = cleanText[cleanText.length - 1];
      const nextValue = currentDigits.join('');
      onChange(nextValue);

      // Auto-focus next box
      if (index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    } else {
      currentDigits[index] = '';
      onChange(currentDigits.join(''));
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: shakeAnim }] },
      ]}
    >
      <View style={styles.boxesRow}>
        {Array.from({ length }).map((_, index) => {
          const digit = value[index] || '';
          const isFilled = !!digit;
          return (
            <TextInput
              key={index}
              ref={(ref) => {
                inputsRef.current[index] = ref;
              }}
              style={[
                styles.otpBox,
                isFilled && styles.otpBoxFilled,
                error ? styles.otpBoxError : null,
              ]}
              value={digit}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
            />
          );
        })}
      </View>

      <Text style={styles.hintText}>رمز التحقق التجريبي الافتراضي: 1245</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  otpBox: {
    width: 60,
    height: 60,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.borderDefault,
    backgroundColor: Colors.surface,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  otpBoxFilled: {
    borderColor: Colors.mainBlue,
    backgroundColor: Colors.lightBlue,
  },
  otpBoxError: {
    borderColor: Colors.borderError,
  },
  hintText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.error,
    marginTop: 6,
    fontWeight: '500',
  },
});
