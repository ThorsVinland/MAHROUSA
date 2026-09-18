// ============================================================
// src/components/home/NextTaskCard.tsx
// Next assigned task card with attendance confirmation
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { NextTask } from '../../types/home.types';

interface NextTaskCardProps {
  task: NextTask;
  onConfirm?: () => void;
  onViewDetails?: () => void;
  isConfirmed?: boolean;
}

export const NextTaskCard: React.FC<NextTaskCardProps> = ({
  task,
  onConfirm,
  onViewDetails,
  isConfirmed = false,
}) => {
  const { colors: Colors } = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  return (
    <View style={styles.card}>
      {/* ROW 1: Badge + View Details */}
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>📅 مهمتك القادمة</Text>
        </View>
        <TouchableOpacity onPress={onViewDetails} activeOpacity={0.7}>
          <Text style={styles.detailsLink}>عرض التفاصيل</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.title}>{task.title}</Text>

      {/* Meta info */}
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>📅 {task.date} – {task.time}</Text>
        <Text style={styles.separator}>|</Text>
        <Text style={styles.metaText}>⏱️ {task.duration}</Text>
      </View>

      {/* Confirm Attendance Button */}
      <TouchableOpacity
        style={[styles.confirmBtn, isConfirmed && styles.confirmedBtn]}
        onPress={onConfirm}
        activeOpacity={0.85}
        disabled={isConfirmed}
      >
        <Text style={styles.confirmText}>
          {isConfirmed ? '✓ تم تأكيد الحضور' : '✓ تأكيد الحضور'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderRightWidth: 5,
    borderRightColor: Colors.mainBlue,
    padding: 16,
    marginHorizontal: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0EBE1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: Colors.lightBlue,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.mainBlue,
  },
  detailsLink: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'right',
    marginTop: 10,
  },
  metaRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  separator: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  confirmBtn: {
    backgroundColor: Colors.success,
    borderRadius: 14,
    height: 46,
    marginTop: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmedBtn: {
    backgroundColor: '#1E8449',
    opacity: 0.9,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
