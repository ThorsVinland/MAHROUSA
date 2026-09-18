// ============================================================
// src/components/home/GreetingSection.tsx
// Greeting section with volunteer name and daily needs summary
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface GreetingSectionProps {
  name: string;
  newNeedsCount: number;
}

export const GreetingSection: React.FC<GreetingSectionProps> = ({
  name,
  newNeedsCount,
}) => {
  const { colors: Colors } = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.greetingText}>أهلاً، {name} 👋</Text>
      <Text style={styles.subText}>
        {newNeedsCount} احتياجات جديدة في ولايتك اليوم
      </Text>
    </View>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
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
