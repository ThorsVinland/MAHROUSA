// ============================================================
// src/screens/organization/OrgProfileScreen.tsx
// Organization Profile Screen with live Firestore Data,
// Verification Status, Statistics, and Theme/Logout Controls
// ============================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { useAlert } from '../../context/AlertContext';
import { getWilayaInfo } from '../../utils/wilayaHelper';

export default function OrgProfileScreen() {
  const { isDarkMode, toggleTheme, colors: Colors } = useTheme();
  const { user, logout } = useAuthStore();
  const { showAlert } = useAlert();
  const styles = useMemo(() => getStyles(Colors), [Colors]);

  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Stored org user
  const orgUser = (user || {}) as any;
  const phoneNumber = orgUser?.phoneNumber || orgUser?.phone || orgUser?.id;

  // Real-time fetched state from Firestore
  const [orgData, setOrgData] = useState<any>({
    fullName: orgUser?.organizationName || orgUser?.fullName || orgUser?.name || 'جمعية محروسة',
    orgType: orgUser?.orgType || 'جمعية خيرية',
    legalNumber: orgUser?.legalNumber || orgUser?.registrationNumber || '1420 / 2023',
    phoneNumber: phoneNumber || '---',
    wilaya: orgUser?.wilaya || '16',
    commune: orgUser?.commune || 'الجزائر الوسطى',
    repName: orgUser?.repName || orgUser?.managerName || 'مسؤول معتمد',
    repPhone: orgUser?.repPhone || orgUser?.managerPhone || phoneNumber || '---',
    status: orgUser?.status || 'approved',
  });

  const [publishedNeedsCount, setPublishedNeedsCount] = useState(0);

  // Fetch Firestore Organization Profile & Published Needs Count
  const fetchOrgProfileFromFirestore = useCallback(async () => {
    if (!phoneNumber) return;

    try {
      // 1. Fetch organization document
      const orgRef = doc(db, 'organizations', phoneNumber);
      const orgSnap = await getDoc(orgRef);

      if (orgSnap.exists()) {
        const data = orgSnap.data();
        setOrgData((prev: any) => ({
          ...prev,
          fullName: data.fullName || data.organizationName || prev.fullName,
          orgType: data.orgType || prev.orgType,
          legalNumber: data.legalNumber || data.registrationNumber || prev.legalNumber,
          phoneNumber: data.phoneNumber || prev.phoneNumber,
          wilaya: data.wilaya ? String(data.wilaya) : prev.wilaya,
          commune: data.commune || prev.commune,
          repName: data.repName || data.managerName || prev.repName,
          repPhone: data.repPhone || data.managerPhone || prev.repPhone,
          status: data.status || prev.status,
        }));
      }

      // 2. Query published needs count for this organization
      const needsRef = collection(db, 'needs');
      const q = query(needsRef, where('organizationId', '==', phoneNumber));
      const needsSnap = await getDocs(q);
      setPublishedNeedsCount(needsSnap.size);
    } catch (error) {
      console.warn('Error fetching org profile from Firestore:', error);
    }
  }, [phoneNumber]);

  useEffect(() => {
    setIsLoading(true);
    fetchOrgProfileFromFirestore().finally(() => setIsLoading(false));
  }, [fetchOrgProfileFromFirestore]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrgProfileFromFirestore();
    setRefreshing(false);
  }, [fetchOrgProfileFromFirestore]);

  const wilayaInfo = useMemo(() => getWilayaInfo(orgData.wilaya), [orgData.wilaya]);

  const handleLogout = () => {
    showAlert(
      'تسجيل الخروج',
      'هل أنت متأكد أنك تريد تسجيل الخروج من حساب الجمعية؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تأكيد الخروج', style: 'destructive', onPress: () => logout() }
      ]
    );
  };

  const isApproved = orgData.status === 'approved';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.mainBlue]} />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="business" size={42} color={Colors.primaryNavy} />
          </View>

          <Text style={styles.nameText}>{orgData.fullName}</Text>
          <Text style={styles.roleText}>{orgData.orgType || 'جمعية وهيئة معتمدة'}</Text>

          {/* Account Status Badge */}
          <View
            style={[
              styles.statusBadge,
              isApproved ? styles.statusBadgeApproved : styles.statusBadgePending,
            ]}
          >
            <Ionicons
              name={isApproved ? 'shield-checkmark' : 'time-outline'}
              size={15}
              color={isApproved ? '#27AE60' : '#D97706'}
            />
            <Text
              style={[
                styles.statusBadgeText,
                { color: isApproved ? '#27AE60' : '#D97706' },
              ]}
            >
              {isApproved ? 'حساب معتمد ومفعل في محروسة ✓' : 'الحساب قيد المراجعة والتدقيق'}
            </Text>
          </View>
        </View>

        {isLoading && !refreshing ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="small" color={Colors.primaryNavy} />
            <Text style={styles.loadingText}>جارِ جلب بيانات الجمعية من Firestore...</Text>
          </View>
        ) : null}

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="megaphone-outline" size={24} color={Colors.primaryNavy} />
            <Text style={styles.statValue}>{publishedNeedsCount}</Text>
            <Text style={styles.statLabel}>إعلان منشور</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="location-outline" size={24} color={Colors.urgent} />
            <Text style={styles.statValue}>{wilayaInfo.name}</Text>
            <Text style={styles.statLabel}>المقر الولائي</Text>
          </View>
        </View>

        {/* Section 1: Official Organization Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الاعتماد والمنظمة</Text>

          <View style={styles.infoCard}>
            <Ionicons name="document-text-outline" size={22} color={Colors.mainBlue} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>رقم الاعتماد القانوني</Text>
              <Text style={styles.infoValue}>{orgData.legalNumber || 'غير محدد'}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="call-outline" size={22} color={Colors.mainBlue} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>رقم هاتف التواصل الرسمي</Text>
              <Text style={styles.infoValue}>{orgData.phoneNumber || '---'}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="map-outline" size={22} color={Colors.mainBlue} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>الولاية والبلدية</Text>
              <Text style={styles.infoValue}>
                {wilayaInfo.name} {orgData.commune ? `– ${orgData.commune}` : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Section 2: Representative Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المسؤول المعتمد</Text>

          <View style={styles.infoCard}>
            <Ionicons name="person-outline" size={22} color={Colors.organization} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>اسم الممثل المعتمد</Text>
              <Text style={styles.infoValue}>{orgData.repName || 'مسؤول الجمعية'}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="phone-portrait-outline" size={22} color={Colors.organization} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>رقم هاتف المسؤول</Text>
              <Text style={styles.infoValue}>{orgData.repPhone || '---'}</Text>
            </View>
          </View>
        </View>

        {/* Section 3: Settings & Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإعدادات والحساب</Text>

          <TouchableOpacity style={styles.actionCard} onPress={toggleTheme} activeOpacity={0.7}>
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
    </SafeAreaView>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: Colors.pageBackground,
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
    statusBadgePending: {
      backgroundColor: '#FEF3C7',
      borderWidth: 1,
      borderColor: '#FCD34D',
    },
    statusBadgeText: {
      fontSize: 12,
      fontWeight: '800',
    },
    centerLoading: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 16,
    },
    loadingText: {
      fontSize: 13,
      color: Colors.textSecondary,
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
      fontSize: 20,
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
  });
