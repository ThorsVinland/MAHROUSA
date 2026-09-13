import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MyTasksScreen() {
  return (
    <View style={styles.container}>
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
