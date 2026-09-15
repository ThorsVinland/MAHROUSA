// ============================================================
// src/components/auth/AppButton.tsx
// Standard Action Button with Variants for MAHROUSA
// ============================================================

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outlined' | 'text';
  style?: ViewStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}) => {
  const isInteractive = !loading && !disabled;

  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return styles.outlinedContainer;
      case 'text':
        return styles.textContainer;
      case 'primary':
      default:
        return styles.primaryContainer;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'outlined':
        return styles.outlinedText;
      case 'text':
        return styles.textVariantText;
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  const getSpinnerColor = (): string => {
    return variant === 'primary' ? Colors.surface : Colors.primaryNavy;
  };

  return (
    <TouchableOpacity
      style={[
        styles.baseContainer,
        getContainerStyle(),
        !isInteractive && styles.disabledContainer,
        style,
      ]}
      onPress={onPress}
      disabled={!isInteractive}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getSpinnerColor()} />
      ) : (
        <Text style={[styles.baseText, getTextStyle()]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
    marginVertical: 6,
  },
  primaryContainer: {
    backgroundColor: Colors.primaryNavy,
    shadowColor: Colors.primaryNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  outlinedContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primaryNavy,
  },
  textContainer: {
    backgroundColor: 'transparent',
    height: 44,
  },
  disabledContainer: {
    opacity: 0.55,
  },
  baseText: {
    fontSize: Typography.button.fontSize,
    fontWeight: Typography.button.fontWeight,
    textAlign: 'center',
  },
  primaryText: {
    color: Colors.surface,
  },
  outlinedText: {
    color: Colors.primaryNavy,
  },
  textVariantText: {
    color: Colors.mainBlue,
  },
});
