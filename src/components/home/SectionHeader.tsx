// ============================================================
// src/components/home/SectionHeader.tsx
// Reusable Section Header with RTL title and action button
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel = '← عرض الكل',
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.mainBlue,
  },
});
