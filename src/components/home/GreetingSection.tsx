// ============================================================
// src/components/home/GreetingSection.tsx
// Greeting section with volunteer name and daily needs summary
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface GreetingSectionProps {
  name: string;
  newNeedsCount: number;
}

export const GreetingSection: React.FC<GreetingSectionProps> = ({
  name,
  newNeedsCount,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.greetingText}>أهلاً، {name} 👋</Text>
      <Text style={styles.subText}>
        {newNeedsCount} احتياجات جديدة في ولايتك اليوم
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    alignItems: 'flex-end',
  },
  greetingText: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'right',
    letterSpacing: -0.5,
  },
  subText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
});
