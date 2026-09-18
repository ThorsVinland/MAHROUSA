// ============================================================
// src/components/home/NeedCard.tsx
// Volunteer Need Card with dynamic priority badges, count (e.g. 5/40),
// and Firestore volunteer action (disabled when full)
// ============================================================

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { NeedItem } from '../../types/need.types';

interface NeedCardProps {
  need: NeedItem | any;
  currentUserId?: string;
  onPress?: () => void;
  onVolunteerPress?: () => void;
  isActionLoading?: boolean;
}

const getBadgeConfig = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return {
        label: '🔴 عاجل',
        bg: '#FEE2E2',
        text: '#E74C3C',
        borderColor: '#FCA5A5',
        cardBg: '#FFFFFF',
        progressColor: '#E74C3C',
      };
    case 'medium':
    case 'high':
      return {
        label: '🟡 متوسط',
        bg: '#FEF3C7',
        text: '#D97706',
        borderColor: '#FCD34D',
        cardBg: '#FFFFFF',
        progressColor: '#F59E0B',
      };
    case 'normal':
    default:
      return {
        label: '🟢 عادي',
        bg: '#DCFCE7',
        text: '#27AE60',
        borderColor: '#86EFAC',
        cardBg: '#FFFFFF',
        progressColor: '#27AE60',
      };
  }
};

const getNeedTypeIcon = (type: string): { name: any; label: string } => {
  switch (type) {
    case 'مقر تخزين':
      return { name: 'home-outline', label: 'مقر تخزين' };
    case 'شاحنة':
      return { name: 'bus-outline', label: 'شاحنة نقل' };
    case 'خبرة':
      return { name: 'school-outline', label: 'خبرة واستشارة' };
    case 'يد عاملة':
    default:
      return { name: 'people-outline', label: 'يد عاملة' };
  }
};

export const NeedCard: React.FC<NeedCardProps> = ({
  need,
  currentUserId,
  onPress,
  onVolunteerPress,
  isActionLoading = false,
}) => {
  const { colors: Colors } = useTheme();
  const styles = useMemo(() => getStyles(Colors), [Colors]);

  const badge = useMemo(() => getBadgeConfig(need.priority), [need.priority]);
  const typeConfig = useMemo(() => getNeedTypeIcon(need.needType), [need.needType]);

  const volunteersCount = need.volunteersCount ?? need.volunteersJoined ?? 0;
  const quantity = need.quantity ?? need.volunteersNeeded ?? 1;
  const isFull = volunteersCount >= quantity;

  const isUserVolunteered = useMemo(() => {
    if (!currentUserId || !need.volunteers) return false;
    return Array.isArray(need.volunteers) && need.volunteers.includes(currentUserId);
  }, [currentUserId, need.volunteers]);

  const progressRatio = Math.min(volunteersCount / Math.max(quantity, 1), 1);
  const progressPercent = `${Math.round(progressRatio * 100)}%` as const;

  // Formatting date string
  const dateDisplay = useMemo(() => {
    if (need.startDate && need.endDate) {
      return `${need.startDate} ⟵ ${need.endDate}`;
    }
    return need.date || 'فوري';
  }, [need.startDate, need.endDate, need.date]);

  // Location display
  const locationDisplay = need.wilayaName || need.location || 'الجزائر';
  const orgName = need.organizationName || need.organization || 'جمعية محروسة';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderColor: badge.borderColor, backgroundColor: badge.cardBg },
        need.priority === 'urgent' && styles.cardUrgentShadow,
      ]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {/* ROW 1: Priority Badge + Need Type + Organization */}
      <View style={styles.topRow}>
        <View style={styles.leftBadges}>
          <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.borderColor }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>
              {badge.label}
            </Text>
          </View>
          <View style={styles.typeBadge}>
            <Ionicons name={typeConfig.name} size={13} color={Colors.primaryNavy} />
            <Text style={styles.typeBadgeText}>{need.needType || typeConfig.label}</Text>
          </View>
        </View>

        <View style={styles.orgRow}>
          <View style={styles.orgDot} />
          <Text style={styles.orgText} numberOfLines={1}>
            {orgName}
          </Text>
        </View>
      </View>

      {/* ROW 2: Need Title */}
      <Text style={styles.title} numberOfLines={2}>
        {need.title}
      </Text>

      {/* ROW 3: Meta Info (Location, Date, Volunteers Count) */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="location-sharp" size={14} color={Colors.urgent} />
          <Text style={styles.metaText} numberOfLines={1}>
            {locationDisplay}
          </Text>
        </View>

        <Text style={styles.separator}>•</Text>

        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{dateDisplay}</Text>
        </View>

        <Text style={styles.separator}>•</Text>

        <View style={styles.metaItem}>
          <Ionicons name="people" size={14} color={Colors.mainBlue} />
          <Text style={[styles.metaText, { fontWeight: '800', color: Colors.primaryNavy }]}>
            {volunteersCount}/{quantity}
          </Text>
        </View>
      </View>

      {/* PROGRESS BAR (Right to Left fill) */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: progressPercent, backgroundColor: badge.progressColor },
          ]}
        />
      </View>

      {/* ROW 4: Counter Details + Action Button */}
      <View style={styles.bottomRow}>
        <Text style={styles.counterText}>
          {isFull ? (
            <Text style={{ color: '#E74C3C', fontWeight: '800' }}>مكتمل ({volunteersCount}/{quantity})</Text>
          ) : (
            `تم تسجيل ${volunteersCount} من أصل ${quantity} متطوع`
          )}
        </Text>

        {/* Action Button */}
        {isFull && !isUserVolunteered ? (
          <View style={styles.fullButton}>
            <Ionicons name="lock-closed" size={13} color="#9CA3AF" />
            <Text style={styles.fullButtonText}>العدد مكتمل</Text>
          </View>
        ) : isUserVolunteered ? (
          <TouchableOpacity
            style={styles.joinedButton}
            onPress={onVolunteerPress || onPress}
            disabled={isActionLoading}
            activeOpacity={0.8}
          >
            {isActionLoading ? (
              <ActivityIndicator size="small" color="#27AE60" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={15} color="#27AE60" />
                <Text style={styles.joinedButtonText}>أنت مسجل ✓</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.readyButton}
            onPress={onVolunteerPress || onPress}
            disabled={isActionLoading}
            activeOpacity={0.8}
          >
            {isActionLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="hand-right-outline" size={14} color="#FFFFFF" />
                <Text style={styles.readyButtonText}>تطوع الآن</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (Colors: any) =>
  StyleSheet.create({
    card: {
      borderRadius: 18,
      padding: 16,
      marginHorizontal: 18,
      marginBottom: 14,
      borderWidth: 1.5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    cardUrgentShadow: {
      shadowColor: '#E74C3C',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 3,
    },
    topRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftBadges: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 6,
    },
    badge: {
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderWidth: 1,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '800',
    },
    typeBadge: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      backgroundColor: '#F3F4F6',
      borderRadius: 14,
      paddingHorizontal: 8,
      paddingVertical: 4,
      gap: 4,
    },
    typeBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: Colors.primaryNavy,
    },
    orgRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 6,
      flexShrink: 1,
    },
    orgDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
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
      color: Colors.primaryText,
      textAlign: 'right',
      marginTop: 10,
      marginBottom: 8,
      lineHeight: 22,
    },
    metaRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 8,
      marginBottom: 12,
      flexWrap: 'wrap',
    },
    metaItem: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: 12,
      fontWeight: '600',
      color: Colors.textSecondary,
    },
    separator: {
      fontSize: 12,
      color: '#CBD5E1',
    },
    progressTrack: {
      height: 6,
      backgroundColor: '#F1F5F9',
      borderRadius: 3,
      width: '100%',
      alignItems: 'flex-end',
      overflow: 'hidden',
    },
    progressFill: {
      height: 6,
      borderRadius: 3,
    },
    bottomRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    counterText: {
      fontSize: 12,
      fontWeight: '600',
      color: Colors.textSecondary,
    },
    readyButton: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      backgroundColor: Colors.primaryNavy,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 9,
      gap: 6,
    },
    readyButtonText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    joinedButton: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      backgroundColor: '#DCFCE7',
      borderWidth: 1,
      borderColor: '#86EFAC',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 8,
      gap: 5,
    },
    joinedButtonText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#27AE60',
    },
    fullButton: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      backgroundColor: '#F3F4F6',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 5,
    },
    fullButtonText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#9CA3AF',
    },
  });
