// ============================================================
// src/components/map/ZoneDetailCard.tsx
// Detailed card for selected crisis or resource zone on map
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MapMarker } from '../../types/home.types';

interface ZoneDetailCardProps {
  marker: MapMarker;
  onClose?: () => void;
  onViewNeeds?: (marker: MapMarker) => void;
}

export const ZoneDetailCard: React.FC<ZoneDetailCardProps> = ({
  marker,
  onClose,
  onViewNeeds,
}) => {
  const isCrisis = marker.type === 'crisis';

  return (
    <View style={styles.card}>
      {/* Header: Title + Badge + Close */}
      <View style={styles.topRow}>
        <View style={styles.titleCol}>
          <Text style={styles.cityName}>ولاية {marker.city}</Text>
          <View
            style={[
              styles.badge,
              isCrisis ? styles.crisisBadge : styles.resourceBadge,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isCrisis ? styles.crisisText : styles.resourceText,
              ]}
            >
              {isCrisis ? '🔴 منطقة أزمة نشطة' : '🟢 نقطة إمداد لوجستي'}
            </Text>
          </View>
        </View>

        {onClose && (
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Info Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={16} color={Colors.mainBlue} />
          <Text style={styles.statText}>
            {isCrisis ? '20 متطوع مطلوب' : 'جاهزية الإمدادات'}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="alert-circle-outline" size={16} color={Colors.urgent} />
          <Text style={styles.statText}>
            {isCrisis ? 'شاحنات نقل ومؤن' : 'مركز وهران الميداني'}
          </Text>
        </View>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => onViewNeeds?.(marker)}
        activeOpacity={0.85}
      >
        <Text style={styles.ctaText}>
          {isCrisis
            ? `عرض الاحتياجات في ${marker.city} ←`
            : `تصفح الموارد في ${marker.city} ←`}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0EBE1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleCol: {
    alignItems: 'flex-end',
  },
  cityName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  crisisBadge: {
    backgroundColor: Colors.badgeUrgentBg,
  },
  resourceBadge: {
    backgroundColor: Colors.badgeSummerBg,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  crisisText: {
    color: Colors.urgent,
  },
  resourceText: {
    color: Colors.success,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0EBE1',
  },
  statItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  ctaButton: {
    backgroundColor: Colors.primaryNavy,
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
