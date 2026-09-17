// ============================================================
// src/components/home/UrgentBanner.tsx
// Urgent Need Banner with Animated Pulsing Indicator
// ============================================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Colors } from '../../constants/colors';

interface UrgentBannerProps {
  title?: string;
  description?: string;
  actionText?: string;
  onPress?: () => void;
}

export const UrgentBanner: React.FC<UrgentBannerProps> = ({
  title = 'احتياج عاجل',
  description = 'شاحنة نقل مطلوبة الآن – بجاية',
  actionText = '← عرض التفاصيل',
  onPress,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.35,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {/* Right Side: Title + Subtitle */}
      <View style={styles.infoCol}>
        <View style={styles.headerRow}>
          <Animated.View
            style={[
              styles.pulseDot,
              { transform: [{ scale: pulseAnim }] },
            ]}
          />
          <Text style={styles.titleText}>{title}</Text>
        </View>
        <Text style={styles.descText} numberOfLines={1}>
          {description}
        </Text>
      </View>

      {/* Left Side: Action Pill */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.actionText}>{actionText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primaryNavy,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 18,
    marginBottom: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.primaryNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  infoCol: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Colors.urgent,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'right',
  },
  descText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.88)',
    textAlign: 'right',
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
