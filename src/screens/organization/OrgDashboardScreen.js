import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OrgDashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>OrgDashboardScreen</Text>
      <Text style={styles.title}>لوحة التحكم</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    color: '#666',
  },
});
