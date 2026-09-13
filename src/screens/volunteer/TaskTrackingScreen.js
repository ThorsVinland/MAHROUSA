import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TaskTrackingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>TaskTrackingScreen</Text>
      <Text style={styles.title}>تتبع المهمة</Text>
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
