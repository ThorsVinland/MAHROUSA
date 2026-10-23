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
  const pct = marker.severityPercentage !== undefined && marker.severityPercentage !== null ? Number(marker.severityPercentage) : null;

  return (
    <View style={styles.card}>
      {/* Header: Title + Badge + Close */}
      <View style={styles.topRow}>
        <View style={styles.titleCol}>
          <Text style={styles.cityName}>
            {marker.title || `ولاية ${marker.city}`}
          </Text>
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
              {isCrisis 
                ? (pct !== null ? `🔴 منطقة أزمة (${pct}%)` : '🔴 منطقة أزمة نشطة') 
                : '🟢 نقطة إمداد لوجستي'}
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

      {/* Severity Percentage Progress Bar if available */}
      {pct !== null && (
        <View style={styles.severityContainer}>
          <View style={styles.severityHeader}>
            <Text style={styles.severityLabel}>نسبة حدة المشكل:</Text>
            <Text style={[styles.severityValue, { color: pct >= 75 ? Colors.urgent : pct >= 50 ? '#EA580C' : '#D97706' }]}>
              {pct}% {pct >= 80 ? '• خطورة حرجة' : pct >= 50 ? '• خطورة مرتفعة' : '• خطورة متوسطة'}
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  width: `${pct}%`,
                  backgroundColor: pct >= 75 ? Colors.urgent : pct >= 50 ? '#EA580C' : '#D97706' 
                }
              ]} 
            />
          </View>
        </View>
      )}

      {/* Description if available */}
      {marker.description ? (
        <Text style={styles.descText} numberOfLines={2}>
          {marker.description}
        </Text>
      ) : null}

      {/* Info Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={16} color={Colors.mainBlue} />
          <Text style={styles.statText}>
            {isCrisis ? 'فرق تطوعية مطلوبة' : 'جاهزية الإمدادات'}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="location-outline" size={16} color={Colors.urgent} />
          <Text style={styles.statText}>
            ولاية {marker.city} {marker.locationDetails ? `(${marker.locationDetails})` : ''}
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
  severityContainer: {
    marginTop: 2,
    marginBottom: 6,
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  severityHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  severityLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  severityValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  descText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    textAlign: 'right',
    marginVertical: 4,
  },
});
