import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OrgRegistrationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>تسجيل الجمعية</Text>
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
