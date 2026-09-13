import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MyTasksScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>MyTasksScreen</Text>
      <Text style={styles.title}>مهامي</Text>
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
