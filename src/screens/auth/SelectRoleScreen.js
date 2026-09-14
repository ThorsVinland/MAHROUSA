import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme/colors';
import { useTheme } from '../../context/ThemeContext';
import CustomButton from '../../components/common/CustomButton';

export default function SelectRoleScreen({ onSelect, onGoToLogin }) {
  const { themeMode, toggleTheme, isDarkMode, colors } = useTheme();

  const pageBgColor = colors.pageBackground || (isDarkMode ? '#121212' : theme.light.pageBackground);
  const cardBgColor = colors.cardBackground || (isDarkMode ? '#1E1E1E' : '#FFFFFF');
  const primaryTextColor = colors.primaryText || (isDarkMode ? '#FFFFFF' : theme.light.primaryDarkBlue);
  const subtitleColor = isDarkMode ? '#AAAAAA' : '#7F8C8D';
  const iconColor = colors.primaryDarkBlue || (isDarkMode ? '#4D96FF' : theme.light.primaryDarkBlue);
  const volunteerColor = colors.successGreen || '#27AE60';
  const orgColor = colors.purpleOrganizations || '#8E44AD';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: pageBgColor }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={pageBgColor}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Theme Toggle */}
        <View style={styles.topActionsContainer}>
          <TouchableOpacity 
            style={[styles.themeToggleButton, { backgroundColor: cardBgColor, shadowColor: iconColor }]}
            onPress={toggleTheme}
          >
            <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={24} color={iconColor} />
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={[styles.logoPlaceholder, { backgroundColor: cardBgColor, shadowColor: iconColor }]}>
            <Ionicons name="people" size={60} color={iconColor} />
          </View>
          <Text style={[styles.headerTitle, { color: primaryTextColor }]}>أهلاً بك في محروسة</Text>
          <Text style={[styles.headerSubtitle, { color: subtitleColor }]}>الرجاء تحديد نوع الحساب</Text>
        </View>

        {/* Role Selection Cards */}
        <View style={styles.rolesContainer}>
          
          {/* Volunteer Card */}
          <TouchableOpacity 
            style={[styles.roleCard, { backgroundColor: cardBgColor, borderColor: volunteerColor }]}
            onPress={() => onSelect && onSelect('volunteer')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: volunteerColor + '20' }]}>
              <Ionicons name="person" size={32} color={volunteerColor} />
            </View>
            <View style={styles.roleTextContainer}>
              <Text style={[styles.roleTitle, { color: primaryTextColor }]}>متطوع عادي</Text>
              <Text style={[styles.roleSubtitle, { color: subtitleColor }]}>للمشاركة في المبادرات والأعمال التطوعية</Text>
            </View>
            <Ionicons name="chevron-back" size={24} color={subtitleColor} />
          </TouchableOpacity>

          {/* Organization Card */}
          <TouchableOpacity 
            style={[styles.roleCard, { backgroundColor: cardBgColor, borderColor: orgColor }]}
            onPress={() => onSelect && onSelect('organization')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: orgColor + '20' }]}>
              <Ionicons name="business" size={32} color={orgColor} />
            </View>
            <View style={styles.roleTextContainer}>
              <Text style={[styles.roleTitle, { color: primaryTextColor }]}>جمعية / مؤسسة</Text>
              <Text style={[styles.roleSubtitle, { color: subtitleColor }]}>لإدارة المبادرات واستقطاب المتطوعين</Text>
            </View>
            <Ionicons name="chevron-back" size={24} color={subtitleColor} />
          </TouchableOpacity>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  topActionsContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: -20,
  },
  themeToggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
    fontFamily: 'System', 
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  rolesContainer: {
    width: '100%',
    marginBottom: 20,
  },
  roleCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  roleTextContainer: {
    flex: 1,
    alignItems: 'flex-end', // RTL
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  roleSubtitle: {
    fontSize: 13,
    textAlign: 'right',
  },
  footerContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 15,
  },
  loginText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
