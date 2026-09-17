// ============================================================
// src/components/home/StatsRow.tsx
// Row of 3 Volunteer Stat Cards matching MAHROUSA design
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { VolunteerStats } from '../../types/home.types';

interface StatsRowProps {
  stats: VolunteerStats;
}

interface StatCardProps {
  value: string | number;
  label: string;
  hasStar?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, hasStar = false }) => (
  <View style={styles.card}>
    <View style={styles.valueRow}>
      {hasStar && (
        <Ionicons
          name="star"
          size={17}
          color={Colors.gold}
          style={styles.starIcon}
        />
      )}
      <Text style={styles.valueText}>{value}</Text>
    </View>
    <Text style={styles.labelText}>{label}</Text>
  </View>
);

export const StatsRow: React.FC<StatsRowProps> = ({ stats }) => {
  return (
    <View style={styles.container}>
      {/* Right: Completed Tasks */}
      <StatCard value={stats.completedTasks} label="مهمة مكتملة" />

      {/* Center: Documented Hours */}
      <StatCard value={stats.documentedHours} label="ساعة موثقة" />

      {/* Left: Volunteer Rating */}
      <StatCard value={stats.rating} label="تقييمك" hasStar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    marginHorizontal: 18,
    marginBottom: 20,
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0EBE1',
  },
  valueRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  starIcon: {
    marginTop: -1,
  },
  valueText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primaryNavy,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
