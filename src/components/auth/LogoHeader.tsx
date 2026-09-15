// ============================================================
// src/components/auth/LogoHeader.tsx
// Header with App Logo (logo.png), Brand Title and Gold Divider
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface LogoHeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
}

export const LogoHeader: React.FC<LogoHeaderProps> = ({
  showBackButton = false,
  onBack,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {showBackButton && onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.primaryNavy} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.brandCenter}>
          <Image
            source={require('../../assets/icons/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>محروسة</Text>
          <Text style={styles.brandSubtitle}>MAHROUSA • الجزائر</Text>
        </View>

        <View style={styles.placeholder} />
      </View>

      {/* Thin Gold Line Divider */}
      <View style={styles.goldDivider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: 'center',
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  placeholder: {
    width: 40,
  },
  brandCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 74,
    height: 74,
    marginBottom: 6,
  },
  brandTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '800',
    color: Colors.primaryNavy,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  goldDivider: {
    width: 60,
    height: 2.5,
    backgroundColor: Colors.gold,
    borderRadius: 2,
    marginTop: 10,
  },
});
