// ============================================================
// src/screens/volunteer/SupervisorDashboardScreen.tsx
// Comprehensive Real-time Field Supervisor Dashboard for MAHROUSA
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { collection, onSnapshot, query, where, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { NeedItem } from '../../types/need.types';

export default function SupervisorDashboardScreen() {
  const { colors: Colors, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();

  const styles = useMemo(() => getStyles(Colors, isDarkMode), [Colors, isDarkMode]);
  const supervisorPhone = user?.phone || user?.id || '';

  const [teamCount, setTeamCount] = useState<number>(0);
  const [activeNeedsCount, setActiveNeedsCount] = useState<number>(0);
  const [recentNeeds, setRecentNeeds] = useState<NeedItem[]>([]);
  const [supervisorData, setSupervisorData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Sync Supervisor profile details from Firestore
  useEffect(() => {
    if (!supervisorPhone) return;

    const volRef = doc(db, 'volunteers', supervisorPhone);
    const unsubVol = onSnapshot(
      volRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSupervisorData(docSnap.data());
        }
      },
      (err) => console.warn('Supervisor profile sync error:', err)
    );

    return () => unsubVol();
  }, [supervisorPhone]);

  // 2. Real-time sync of team members count
  useEffect(() => {
    if (!supervisorPhone) {
      setIsLoading(false);
      return;
    }

    const teamRef = collection(db, 'volunteers', supervisorPhone, 'team');
    const unsubTeam = onSnapshot(
      teamRef,
      (snapshot) => {
        setTeamCount(snapshot.size);
        setIsLoading(false);
      },
      (err) => {
        console.warn('Team count listener error:', err);
        setIsLoading(false);
      }
    );

    return () => unsubTeam();
  }, [supervisorPhone]);

  // 3. Real-time sync of active needs in supervisor's wilaya
  useEffect(() => {
    const wilayaCode = user?.wilaya || supervisorData?.wilaya;
    const needsRef = collection(db, 'needs');

    const q = wilayaCode
      ? query(needsRef, where('wilaya', '==', String(wilayaCode)), where('status', '==', 'active'))
      : query(needsRef, where('status', '==', 'active'));

    const unsubNeeds = onSnapshot(
      q,
      (snapshot) => {
        const needsList: NeedItem[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          needsList.push({
            id: docSnap.id,
            title: d.title || '',
            needType: d.needType || 'يد عاملة',
            quantity: d.quantity || 1,
            volunteersCount: d.volunteersCount ?? (d.volunteers?.length || 0),
            volunteers: d.volunteers || [],
            backupVolunteers: d.backupVolunteers || [],
            wilaya: d.wilaya || '',
            wilayaName: d.wilayaName || '',
            locationDetails: d.locationDetails || '',
            startDate: d.startDate || '',
            endDate: d.endDate || '',
            priority: d.priority || 'normal',
            description: d.description || '',
            organizationId: d.organizationId || '',
            organizationName: d.organizationName || 'جمعية محروسة',
            organizationPhone: d.organizationPhone || '',
            status: d.status || 'active',
            createdAt: d.createdAt,
          });
        });
        setActiveNeedsCount(needsList.length);
        setRecentNeeds(needsList.slice(0, 3));
      },
      (err) => console.warn('Active needs sync error:', err)
    );

    return () => unsubNeeds();
  }, [user?.wilaya, supervisorData?.wilaya]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const resourcesList: string[] = useMemo(() => {
    return (
      user?.supervisorResources?.resources ||
      supervisorData?.supervisorResources?.resources || [
        'مركبة نقل ميداني',
        'معدات دعم لوجستي',
      ]
    );
  }, [user?.supervisorResources, supervisorData?.supervisorResources]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* 1. Header */}
      <View style={styles.header}>
        <View style={styles.headerRight}>
          <View style={styles.avatarBox}>
            <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.headerTextContainer}>
            <View style={styles.supervisorBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.supervisorBadgeText}>مشرف ميداني معتمد</Text>
            </View>
            <Text style={styles.supervisorName}>
              {user?.name || user?.fullName || supervisorData?.fullName || 'مشرف المحروسة'}
            </Text>
            <Text style={styles.supervisorPhone}>{user?.phone || supervisorPhone}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.teamShortcutBtn}
          onPress={() => navigation.navigate('SupervisorTeam')}
          activeOpacity={0.8}
        >
          <Ionicons name="people" size={20} color={Colors.primaryNavy} />
          {teamCount > 0 && (
            <View style={styles.badgeCountPill}>
              <Text style={styles.badgeCountText}>{teamCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primaryNavy]}
          />
        }
      >
        {/* 2. Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Card 1: Team Members */}
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('SupervisorTeam')}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconBox, { backgroundColor: isDarkMode ? '#1E293B' : '#EFF6FF' }]}>
              <Ionicons name="people" size={22} color="#2563EB" />
            </View>
            <Text style={styles.statNumber}>{teamCount}</Text>
            <Text style={styles.statLabel}>أعضاء الفريق</Text>
          </TouchableOpacity>

          {/* Card 2: Active Wilaya Needs */}
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('VolunteerHome')}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconBox, { backgroundColor: isDarkMode ? '#3D1B1B' : '#FEE2E2' }]}>
              <Ionicons name="flame" size={22} color="#DC2626" />
            </View>
            <Text style={styles.statNumber}>{activeNeedsCount}</Text>
            <Text style={styles.statLabel}>احتياجات الولاية</Text>
          </TouchableOpacity>

          {/* Card 3: Resources Count */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: isDarkMode ? '#2D1B4E' : '#F3E8FF' }]}>
              <Ionicons name="cube" size={22} color="#8B5CF6" />
            </View>
            <Text style={styles.statNumber}>{resourcesList.length}</Text>
            <Text style={styles.statLabel}>الموارد المعتمدة</Text>
          </View>

          {/* Card 4: Field Status */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: isDarkMode ? '#142E20' : '#DCFCE7' }]}>
              <Ionicons name="pulse" size={22} color="#16A34A" />
            </View>
            <Text style={[styles.statNumber, { fontSize: 14, color: '#16A34A', marginTop: 4 }]}>
              جاهز للتدخل
            </Text>
            <Text style={styles.statLabel}>الحالة الميدانية</Text>
          </View>
        </View>

        {/* 3. Primary Action Banner: Team Management */}
        <TouchableOpacity
          style={styles.teamBanner}
          onPress={() => navigation.navigate('SupervisorTeam')}
          activeOpacity={0.85}
        >
          <View style={styles.teamBannerContent}>
            <View style={styles.teamBannerText}>
              <Text style={styles.teamBannerTitle}>👥 إدارة الفريق الميداني</Text>
              <Text style={styles.teamBannerSub}>
                أضف متطوعين، سائقين ومسعفين إلى فريقك ونسّق استجابتكم للنداءات الميدانية.
              </Text>
            </View>
            <View style={styles.teamBannerAction}>
              <Text style={styles.teamBannerActionText}>فتح الفريق</Text>
              <Ionicons name="arrow-back" size={16} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>

        {/* 4. Secondary Action Cards: Map & Operations */}
        <View style={styles.actionsRow}>
          {/* Operations Map Card */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('VolunteerMap')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="map" size={24} color="#0284C7" />
            </View>
            <Text style={styles.actionCardTitle}>خريطة العمليات</Text>
            <Text style={styles.actionCardDesc}>متابعة بؤر الاحتياج ومواقع التدخل</Text>
          </TouchableOpacity>

          {/* My Tasks Card */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('VolunteerTasks')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="checkbox" size={24} color="#D97706" />
            </View>
            <Text style={styles.actionCardTitle}>مهام الفريق</Text>
            <Text style={styles.actionCardDesc}>المهام الميدانية الجارية وتأكيد الحضور</Text>
          </TouchableOpacity>
        </View>

        {/* 5. Approved Resources Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-outline" size={20} color={Colors.primaryNavy} />
            <Text style={styles.sectionTitle}>الموارد والعتاد المسجل تحت إشرافك</Text>
          </View>

          <View style={styles.resourcesList}>
            {resourcesList.map((res, index) => (
              <View key={index} style={styles.resourceChip}>
                <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                <Text style={styles.resourceChipText}>{res}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 6. Active Needs Requiring Field Coordination */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications-outline" size={20} color={Colors.urgent} />
            <Text style={styles.sectionTitle}>احتياجات عاجلة تتطلب التنسيق</Text>
          </View>

          {recentNeeds.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-done-circle-outline" size={40} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>لا توجد احتياجات حرجة في ولايتك حالياً.</Text>
            </View>
          ) : (
            recentNeeds.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.needCard}
                onPress={() => navigation.navigate('NeedDetails', { need: item, id: item.id })}
                activeOpacity={0.8}
              >
                <View style={styles.needCardTop}>
                  <View
                    style={[
                      styles.priorityPill,
                      item.priority === 'urgent' && { backgroundColor: '#FEE2E2' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityPillText,
                        item.priority === 'urgent' && { color: '#DC2626' },
                      ]}
                    >
                      {item.priority === 'urgent' ? '🔴 عاجل جداً' : '🟢 عادي'}
                    </Text>
                  </View>
                  <Text style={styles.needCardType}>{item.needType}</Text>
                </View>

                <Text style={styles.needCardTitle} numberOfLines={1}>
                  {item.title}
                </Text>

                <View style={styles.needCardMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.metaItemText}>
                      {item.wilayaName || item.wilaya} – {item.locationDetails}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="people-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.metaItemText}>
                      {item.volunteersCount} / {item.quantity} متطوع
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (Colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: Colors.pageBackground,
    },
    header: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: Colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#2D3748' : '#F0EBE1',
    },
    headerRight: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    avatarBox: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: Colors.primaryNavy,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: Colors.primaryNavy,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    headerTextContainer: {
      alignItems: 'flex-end',
      flex: 1,
    },
    supervisorBadge: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#3D2E14' : '#FEF3C7',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      gap: 4,
      marginBottom: 2,
    },
    supervisorBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#D97706',
    },
    supervisorName: {
      fontSize: 16,
      fontWeight: '900',
      color: Colors.textPrimary,
      textAlign: 'right',
    },
    supervisorPhone: {
      fontSize: 12,
      color: Colors.textSecondary,
      fontWeight: '600',
    },
    teamShortcutBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    badgeCountPill: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: Colors.urgent,
      borderRadius: 10,
      minWidth: 18,
      height: 18,
      paddingHorizontal: 4,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: Colors.surface,
    },
    badgeCountText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '900',
    },
    scrollContent: {
      padding: 18,
      paddingBottom: 40,
      gap: 16,
    },
    statsGrid: {
      flexDirection: 'row-reverse',
      flexWrap: 'wrap',
      gap: 12,
    },
    statCard: {
      width: '48%',
      backgroundColor: Colors.surface,
      borderRadius: 18,
      padding: 14,
      alignItems: 'flex-end',
      borderWidth: 1,
      borderColor: isDarkMode ? '#2D3748' : '#E5E7EB',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    statIconBox: {
      width: 38,
      height: 38,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    statNumber: {
      fontSize: 22,
      fontWeight: '900',
      color: Colors.textPrimary,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 12,
      color: Colors.textSecondary,
      fontWeight: '600',
    },
    teamBanner: {
      backgroundColor: Colors.primaryNavy,
      borderRadius: 20,
      padding: 18,
      shadowColor: Colors.primaryNavy,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    teamBannerContent: {
      flexDirection: 'column',
      gap: 12,
    },
    teamBannerText: {
      alignItems: 'flex-end',
    },
    teamBannerTitle: {
      fontSize: 17,
      fontWeight: '900',
      color: '#FFFFFF',
      marginBottom: 4,
      textAlign: 'right',
    },
    teamBannerSub: {
      fontSize: 13,
      color: '#E0E7FF',
      textAlign: 'right',
      lineHeight: 19,
    },
    teamBannerAction: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 12,
      paddingVertical: 10,
      gap: 6,
    },
    teamBannerActionText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '800',
    },
    actionsRow: {
      flexDirection: 'row-reverse',
      gap: 12,
    },
    actionCard: {
      flex: 1,
      backgroundColor: Colors.surface,
      borderRadius: 18,
      padding: 14,
      alignItems: 'flex-end',
      borderWidth: 1,
      borderColor: isDarkMode ? '#2D3748' : '#E5E7EB',
      gap: 4,
    },
    actionIconBox: {
      width: 40,
      height: 40,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    actionCardTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: Colors.textPrimary,
      textAlign: 'right',
    },
    actionCardDesc: {
      fontSize: 11,
      color: Colors.textSecondary,
      textAlign: 'right',
      lineHeight: 16,
    },
    sectionContainer: {
      backgroundColor: Colors.surface,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? '#2D3748' : '#E5E7EB',
      gap: 12,
    },
    sectionHeader: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 8,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#2D3748' : '#F3F4F6',
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: Colors.textPrimary,
      textAlign: 'right',
    },
    resourcesList: {
      flexDirection: 'row-reverse',
      flexWrap: 'wrap',
      gap: 8,
    },
    resourceChip: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#142E20' : '#F0FDF4',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDarkMode ? '#22543D' : '#DCFCE7',
      gap: 6,
    },
    resourceChipText: {
      fontSize: 12,
      fontWeight: '700',
      color: isDarkMode ? '#86EFAC' : '#16A34A',
    },
    emptyCard: {
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    emptyText: {
      fontSize: 13,
      color: Colors.textSecondary,
      fontWeight: '600',
      textAlign: 'center',
    },
    needCard: {
      backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC',
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? '#334155' : '#E2E8F0',
      gap: 6,
    },
    needCardTop: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    priorityPill: {
      backgroundColor: '#DCFCE7',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    priorityPillText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#16A34A',
    },
    needCardType: {
      fontSize: 11,
      fontWeight: '700',
      color: Colors.primaryNavy,
    },
    needCardTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: Colors.textPrimary,
      textAlign: 'right',
    },
    needCardMeta: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
    },
    metaItem: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 4,
    },
    metaItemText: {
      fontSize: 11,
      color: Colors.textSecondary,
      fontWeight: '600',
    },
  });
