import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function VolunteerMainScreen({ onLogout }) {
  const { isDarkMode, colors, toggleTheme } = useTheme();
  
  const pageBgColor = colors.pageBackground || (isDarkMode ? '#121212' : '#F8F9FA');
  const primaryTextColor = colors.primaryText || (isDarkMode ? '#FFFFFF' : '#2C3E50');
  const cardBgColor = colors.cardBackground || (isDarkMode ? '#1E1E1E' : '#FFFFFF');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: pageBgColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleTheme}>
           <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={24} color={primaryTextColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onLogout}>
           <Ionicons name="log-out-outline" size={24} color={colors.urgentRed || '#E74C3C'} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Ionicons name="person" size={80} color={colors.successGreen || '#27AE60'} />
        <Text style={[styles.title, { color: primaryTextColor }]}>مرحباً بك، أيها المتطوع!</Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#AAAAAA' : '#7F8C8D' }]}>
          هذه واجهة تجريبية للمتطوع (Volunteer Main Screen)
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  }
});
