import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import CustomAlert from '../../components/common/CustomAlert';

export default function OrgProfileScreen() {
  const { isDarkMode, toggleTheme, colors: Colors } = useTheme();
  const { user, logout } = useAuthStore();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const [isLogoutAlertVisible, setIsLogoutAlertVisible] = useState(false);

  const orgUser = user as any;

  const handleLogout = () => {
    setIsLogoutAlertVisible(true);
  };

  const confirmLogout = () => {
    setIsLogoutAlertVisible(false);
    logout();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="business" size={40} color={Colors.mainBlue} />
          </View>
          <Text style={styles.nameText}>{orgUser?.organizationName || 'اسم الجمعية'}</Text>
          <Text style={styles.roleText}>حساب جمعية</Text>
        </View>

        {/* Info Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الجمعية</Text>
          
          <View style={styles.infoCard}>
            <Ionicons name="call-outline" size={20} color={Colors.placeholder} />
            <Text style={styles.infoText}>{orgUser?.phoneNumber || '---'}</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="document-text-outline" size={20} color={Colors.placeholder} />
            <Text style={styles.infoText}>الاعتماد: {orgUser?.registrationNumber || 'غير محدد'}</Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإعدادات</Text>
          
          <TouchableOpacity style={styles.actionCard} onPress={toggleTheme}>
            <View style={styles.actionLeft}>
              <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={20} color={Colors.mainBlue} />
              <Text style={styles.actionText}>{isDarkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}</Text>
            </View>
            <Ionicons name="chevron-back" size={20} color={Colors.placeholder} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionCard, { marginTop: 12 }]} onPress={handleLogout}>
            <View style={styles.actionLeft}>
              <Ionicons name="log-out-outline" size={20} color={Colors.error} />
              <Text style={[styles.actionText, { color: Colors.error }]}>تسجيل الخروج</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
            onPress: () => confirmLogout(),
          },
        ]}
      />
    </SafeAreaView>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.pageBackground,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0EBE1',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primaryText,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primaryText,
    marginBottom: 16,
    textAlign: 'right',
  },
  infoCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0EBE1',
  },
  infoText: {
    fontSize: 15,
    color: Colors.primaryText,
    marginRight: 12,
    fontWeight: '600',
  },
  actionCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0EBE1',
  },
  actionLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    color: Colors.primaryText,
    fontWeight: '700',
    marginRight: 12,
  },
});
