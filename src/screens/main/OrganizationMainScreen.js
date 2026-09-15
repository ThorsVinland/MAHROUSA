import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function OrganizationMainScreen({ onLogout }) {
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
        <Ionicons name="business" size={80} color={colors.purpleOrganizations || '#8E44AD'} />
        <Text style={[styles.title, { color: primaryTextColor }]}>مرحباً، بوابة الجمعية!</Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#AAAAAA' : '#7F8C8D' }]}>
          هذه واجهة تجريبية للجمعية/المؤسسة (Organization Main Screen)
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
