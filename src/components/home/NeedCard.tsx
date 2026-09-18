// ============================================================
// src/components/home/NeedCard.tsx
// Volunteer Need Card with RTL progress bar and priority badges
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { NeedCardItem, PriorityLevel } from '../../types/home.types';

interface NeedCardProps {
  need: NeedCardItem;
  onPress?: () => void;
  onReadyPress?: () => void;
}

const getBadgeConfig = (Colors: any): Record<
  PriorityLevel,
  { label: string; bg: string; text: string }
> => ({
  urgent: {
    label: '🔴 عاجل',
    bg: Colors.badgeUrgentBg,
    text: Colors.badgeUrgentText,
  },
  high: {
    label: '🟠 أولوية عالية',
    bg: Colors.badgeHighBg,
    text: Colors.badgeHighText,
  },
  normal: {
    label: '🟢 عادي',
    bg: Colors.badgeSummerBg,
    text: Colors.badgeSummerText,
  },
  summer_camp: {
    label: '🟢 مخيم صيفي',
    bg: Colors.badgeSummerBg,
    text: Colors.badgeSummerText,
  },
});

export const NeedCard: React.FC<NeedCardProps> = ({
  need,
  onPress,
  onReadyPress,
}) => {
  const { colors: Colors } = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const badgeConfig = React.useMemo(() => getBadgeConfig(Colors), [Colors]);
  const badge = badgeConfig[need.priority] || badgeConfig.normal;
  const progressRatio = Math.min(
    need.volunteersJoined / Math.max(need.volunteersNeeded, 1),
    1
  );
  const progressPercent = `${Math.round(progressRatio * 100)}%` as const;
  const dateTime = need.time ? `${need.date} ${need.time}` : need.date;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {/* ROW 1: Priority Badge + Organization */}
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>
            {badge.label}
          </Text>
        </View>
        <View style={styles.orgRow}>
          <View style={styles.orgDot} />
          <Text style={styles.orgText}>{need.organization}</Text>
        </View>
      </View>

      {/* ROW 2: Need Title */}
      <Text style={styles.title}>{need.title}</Text>

      {/* ROW 3: Meta Info (RTL) */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="location-sharp" size={13} color={Colors.urgent} />
          <Text style={styles.metaText}>{need.distanceKm} كم</Text>
        </View>
        <Text style={styles.separator}>|</Text>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{dateTime}</Text>
        </View>
        <Text style={styles.separator}>|</Text>
        <View style={styles.metaItem}>
          <Ionicons name="people" size={13} color={Colors.mainBlue} />
          <Text style={styles.metaText}>
            {need.volunteersJoined}/{need.volunteersNeeded}
          </Text>
        </View>
      </View>

      {/* PROGRESS BAR (Right to Left fill) */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: progressPercent }]} />
      </View>

      {/* ROW 4: Counter + Ready CTA */}
      <View style={styles.bottomRow}>
        <Text style={styles.counterText}>
          {need.volunteersJoined} من أصل {need.volunteersNeeded} متطوع
        </Text>
        <TouchableOpacity
          style={styles.readyButton}
          onPress={onReadyPress || onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.readyButtonText}>← أنا مستعد</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0EBE1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  orgRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  orgDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.organization,
  },
  orgText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'right',
    marginTop: 8,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  separator: {
    fontSize: 11,
    color: '#D1D5DB',
  },
  progressTrack: {
    height: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 4,
    width: '100%',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    backgroundColor: Colors.mainBlue,
    borderRadius: 4,
  },
  bottomRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  readyButton: {
    backgroundColor: Colors.primaryNavy,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  readyButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
