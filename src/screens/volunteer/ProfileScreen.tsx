// ============================================================
// src/screens/volunteer/ProfileScreen.tsx
// Volunteer Profile Screen with user info and logout
// ============================================================

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';
import { getWilayaInfo } from '../../utils/wilayaHelper';
import { useAlert } from '../../context/AlertContext';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme, colors: Colors } = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);
  const { showAlert } = useAlert();

  // Upgrade Modal State
  const [isUpgradeModalVisible, setIsUpgradeModalVisible] = useState(false);
  const [resourceType, setResourceType] = useState('');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('');

  const handleLogout = () => {
    showAlert(
      'تسجيل الخروج',
      'هل أنت متأكد أنك تريد تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تأكيد الخروج', style: 'destructive', onPress: () => logout() }
      ]
    );
  };

  const userWilayaInfo = useMemo(() => {
    return getWilayaInfo(user?.wilaya);
  }, [user?.wilaya]);

  const userName = user?.name || user?.fullName || 'مستخدم غير معروف';
  const roleName = user?.role === 'volunteer' ? 'متطوع مسجل' : user?.role || 'متطوع';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {userName ? userName.charAt(0).toUpperCase() : 'م'}
            </Text>
          </View>

          <Text style={styles.nameText}>{userName}</Text>
          <Text style={styles.roleText}>{roleName}</Text>

          {/* Account Status Badge */}
          <View style={[styles.statusBadge, styles.statusBadgeApproved]}>
            <Ionicons name="shield-checkmark" size={15} color="#27AE60" />
            <Text style={[styles.statusBadgeText, { color: '#27AE60' }]}>
              حساب مفعل في محروسة ✓
            </Text>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="location-outline" size={24} color={Colors.urgent || '#E74C3C'} />
            <Text style={styles.statValue}>{userWilayaInfo.name}</Text>
            <Text style={styles.statLabel}>الولاية</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="person-outline" size={24} color={Colors.primaryNavy} />
            <Text style={styles.statValue}>{roleName}</Text>
            <Text style={styles.statLabel}>نوع الحساب</Text>
          </View>
        </View>

        {/* Section 1: Official Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>

          <View style={styles.infoCard}>
            <Ionicons name="call-outline" size={22} color={Colors.mainBlue} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>رقم الهاتف</Text>
              <Text style={styles.infoValue}>{user?.phone || '---'}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="map-outline" size={22} color={Colors.mainBlue} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>الولاية</Text>
              <Text style={styles.infoValue}>
                {userWilayaInfo.name} ({userWilayaInfo.code})
              </Text>
            </View>
          </View>
        </View>

        {/* Section 2: Settings & Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإعدادات والحساب</Text>

          {user?.role === 'volunteer' && (
            <TouchableOpacity 
              style={[styles.actionCard, styles.upgradeCard]} 
              onPress={() => setIsUpgradeModalVisible(true)} 
              activeOpacity={0.7}
            >
              <View style={styles.actionLeft}>
                <View style={styles.upgradeIconBox}>
                  <Ionicons name="arrow-up-circle-outline" size={24} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={[styles.actionText, { color: Colors.mainBlue, fontWeight: '800' }]}>طلب ترقية لمشرف</Text>
                  <Text style={styles.actionSubText}>تطوع بمواردك (شاحنة، مقر تخزين...)</Text>
                </View>
              </View>
              <Ionicons name="chevron-back" size={20} color={Colors.placeholder} />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.actionCard, { marginTop: 12 }]} onPress={toggleTheme} activeOpacity={0.7}>
            <View style={styles.actionLeft}>
              <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={20} color={Colors.mainBlue} />
              <Text style={styles.actionText}>
                {isDarkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
              </Text>
            </View>
            <Ionicons name="chevron-back" size={20} color={Colors.placeholder} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { marginTop: 12 }]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <Ionicons name="log-out-outline" size={20} color={Colors.error} />
              <Text style={[styles.actionText, { color: Colors.error }]}>تسجيل الخروج</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Upgrade to Supervisor Modal */}
      <Modal
        visible={isUpgradeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsUpgradeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>طلب ترقية إلى متطوع مشرف</Text>
              <TouchableOpacity onPress={() => setIsUpgradeModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
              <Text style={styles.formDesc}>
                هل تملك موارد إضافية تود التطوع بها؟ املأ التفاصيل أدناه ليتم ترقيتك إلى مشرف وربطك مع الجمعيات التي تحتاج مواردك.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>نوع المورد (مثال: شاحنة، مقر تخزين، خبرة)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="أدخل نوع المورد..."
                  placeholderTextColor={Colors.placeholder}
                  value={resourceType}
                  onChangeText={setResourceType}
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>السعة والتفاصيل (مثال: شاحنة بوزن 10 طن)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="أدخل تفاصيل وسعة المورد..."
                  placeholderTextColor={Colors.placeholder}
                  value={capacity}
                  onChangeText={setCapacity}
                  textAlign="right"
                  multiline
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>الموقع (الولاية والبلدية)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="مثال: وهران - السانية..."
                  placeholderTextColor={Colors.placeholder}
                  value={location}
                  onChangeText={setLocation}
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>أوقات التفرغ (الفترة المتاحة)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="مثال: كل أيام الأسبوع صباحاً..."
                  placeholderTextColor={Colors.placeholder}
                  value={availability}
                  onChangeText={setAvailability}
                  textAlign="right"
                />
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={() => {}} activeOpacity={0.8}>
                <Text style={styles.submitBtnText}>تقديم الطلب</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: Colors.pageBackground || Colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 20,
      paddingBottom: 40,
    },
    header: {
      alignItems: 'center',
      marginBottom: 24,
      marginTop: 10,
    },
    avatarContainer: {
      width: 86,
      height: 86,
      borderRadius: 43,
      backgroundColor: '#EBF5FB',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
      borderWidth: 2,
      borderColor: Colors.mainBlue,
      shadowColor: Colors.mainBlue,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    avatarText: {
      fontSize: 34,
      fontWeight: 'bold',
      color: Colors.primaryNavy,
    },
    nameText: {
      fontSize: 22,
      fontWeight: '900',
      color: Colors.primaryText,
      marginBottom: 4,
      textAlign: 'center',
    },
    roleText: {
      fontSize: 14,
      color: Colors.textSecondary,
      fontWeight: '600',
      marginBottom: 10,
    },
    statusBadge: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      gap: 6,
    },
    statusBadgeApproved: {
      backgroundColor: '#DCFCE7',
      borderWidth: 1,
      borderColor: '#86EFAC',
    },
    statusBadgeText: {
      fontSize: 12,
      fontWeight: '800',
    },
    statsGrid: {
      flexDirection: 'row-reverse',
      gap: 12,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      backgroundColor: Colors.surface,
      borderRadius: 18,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#F0EBE1',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      gap: 4,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '900',
      color: Colors.primaryNavy,
      marginTop: 2,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: Colors.textSecondary,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: Colors.primaryText,
      marginBottom: 12,
      textAlign: 'right',
    },
    infoCard: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      backgroundColor: Colors.surface,
      padding: 14,
      borderRadius: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#F0EBE1',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
      gap: 12,
    },
    infoContent: {
      flex: 1,
      alignItems: 'flex-end',
    },
    infoLabel: {
      fontSize: 12,
      color: Colors.textSecondary,
      fontWeight: '600',
      marginBottom: 2,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '700',
      color: Colors.primaryText,
      textAlign: 'right',
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
      shadowOpacity: 0.04,
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
      fontSize: 15,
      color: Colors.primaryText,
      fontWeight: '700',
      marginRight: 12,
    },
    actionSubText: {
      fontSize: 11,
      color: Colors.textSecondary,
      fontWeight: '600',
      marginTop: 2,
      marginRight: 12,
    },
    upgradeCard: {
      backgroundColor: '#F0F8FF',
      borderColor: '#D6EAF8',
      borderWidth: 1.5,
    },
    upgradeIconBox: {
      backgroundColor: Colors.mainBlue,
      padding: 6,
      borderRadius: 12,
      marginLeft: 4,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: Colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#F0EBE1',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: Colors.primaryNavy,
    },
    closeBtn: {
      padding: 4,
    },
    formContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    formDesc: {
      fontSize: 13,
      color: Colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: Colors.primaryText,
      marginBottom: 8,
      textAlign: 'right',
    },
    input: {
      backgroundColor: Colors.background,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 14,
      color: Colors.primaryText,
    },
    submitBtn: {
      backgroundColor: Colors.primaryNavy,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 10,
    },
    submitBtnText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
  });
