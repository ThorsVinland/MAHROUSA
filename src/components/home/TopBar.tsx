// ============================================================
// src/components/home/TopBar.tsx
// Top Bar matching MAHROUSA Home Screen design exactly
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface TopBarProps {
  notificationCount?: number;
  wilaya: string;
  onNotificationPress?: () => void;
  onLocationPress?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  notificationCount = 3,
  wilaya,
  onNotificationPress,
  onLocationPress,
}) => {
  const { colors: Colors } = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  return (
    <View style={styles.container}>
      {/* Right Side: Location Pill */}
      <TouchableOpacity
        style={styles.locationPill}
        onPress={onLocationPress}
        activeOpacity={0.8}
      >
        <Ionicons name="location-sharp" size={15} color={Colors.mainBlue} />
        <Text style={styles.locationText}>{wilaya}</Text>
        <Ionicons name="chevron-down" size={14} color={Colors.mainBlue} />
      </TouchableOpacity>

      {/* Center: Brand Logo + Name */}
      <View style={styles.brandRow}>
        <Image
          source={require('../../assets/icons/logo.png')}
          style={styles.brandIcon}
          resizeMode="contain"
        />
        <Text style={styles.brandText}>محروسة</Text>
      </View>

      {/* Left Side: Notification Bell with Badge */}
      <TouchableOpacity
        style={styles.bellButton}
        onPress={onNotificationPress}
        activeOpacity={0.8}
      >
        <Ionicons name="notifications-outline" size={21} color={Colors.textPrimary} />
        {notificationCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>{notificationCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 10,
    width: '100%',
  },
  locationPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0EBE1',
  },
  locationText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.mainBlue,
  },
  brandRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  brandIcon: {
    width: 32,
    height: 32,
  },
  brandText: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.primaryNavy,
    letterSpacing: -0.3,
  },
  bellButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0EBE1',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: Colors.urgent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
});
