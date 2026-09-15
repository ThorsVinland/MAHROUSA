import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OrgReportsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>OrgReportsScreen</Text>
      <Text style={styles.title}>التقارير</Text>
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
