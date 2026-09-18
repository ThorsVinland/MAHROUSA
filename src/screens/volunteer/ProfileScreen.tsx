// ============================================================
// src/screens/volunteer/ProfileScreen.tsx
// Volunteer Profile Screen with user info and logout
// ============================================================

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';
import { getWilayaInfo } from '../../utils/wilayaHelper';
import CustomAlert from '../../components/common/CustomAlert';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme, colors: Colors } = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);
  const [isLogoutAlertVisible, setIsLogoutAlertVisible] = useState(false);

  const handleLogout = () => {
    setIsLogoutAlertVisible(true);
  };

  const userWilayaInfo = useMemo(() => {
    return getWilayaInfo(user?.wilaya);
  }, [user?.wilaya]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'م'}
            </Text>
          </View>
          
          <Text style={styles.name}>{user?.name || 'مستخدم غير معروف'}</Text>
          <Text style={styles.role}>
            {user?.role === 'volunteer' ? 'متطوع' : user?.role || 'دور غير محدد'}
          </Text>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>رقم الهاتف</Text>
              <Text style={styles.infoValue}>{user?.phone || '—'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>الولاية</Text>
              <Text style={styles.infoValue}>{userWilayaInfo.name} ({userWilayaInfo.code})</Text>
            </View>
          </View>
        </View>

        <View style={styles.themeToggleContainer}>
          <Text style={styles.themeToggleText}>الوضع الليلي</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: Colors.mainBlue }}
            thumbColor={isDarkMode ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={isLogoutAlertVisible}
        title="تسجيل الخروج"
        message="هل أنت متأكد أنك تريد تسجيل الخروج؟"
        onClose={() => setIsLogoutAlertVisible(false)}
        buttons={[
          {
            text: 'إلغاء',
            style: 'cancel',
          },
          {
            text: 'تأكيد',
            style: 'destructive',
            onPress: () => logout(),
          },
        ]}
      />
    </SafeAreaView>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primaryNavy,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: Colors.mainBlue,
    marginBottom: 24,
  },
  infoSection: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row-reverse', // RTL
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderDefault,
    marginVertical: 8,
  },
  themeToggleContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  themeToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  logoutButton: {
    backgroundColor: Colors.error,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
