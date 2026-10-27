// ============================================================
// src/screens/organization/OrgDashboardScreen.tsx
// Organization Home Dashboard with Active Emergency Crises Alerts
// Automatically prompts NGOs to create volunteer needs for live crises
// ============================================================

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { TopBar } from '../../components/home/TopBar';
import { NeedItem } from '../../types/need.types';
import { MapMarker } from '../../types/home.types';
import { subscribeToOrgNeeds } from '../../services/needsService';
import { subscribeToLiveCrises } from '../../services/crisesService';
import { subscribeToUserNotifications } from '../../services/notificationsService';

export default function OrgDashboardScreen({ navigation }: any) {
  const { colors: Colors, isDarkMode } = useTheme();
  const { user } = useAuthStore();
  const styles = React.useMemo(() => getStyles(Colors, isDarkMode), [Colors, isDarkMode]);

  const orgUser = user as any;
  const wilaya = orgUser?.wilaya || 'الجزائر العاصمة';
  const orgIdentifier = orgUser?.id || orgUser?.phone || orgUser?.phoneNumber || 'org_default';

  const [needs, setNeeds] = useState<NeedItem[]>([]);
  const [activeCrises, setActiveCrises] = useState<MapMarker[]>([]);
  const [notificationCount, setNotificationCount] = useState<number>(0);

  // 1. Subscribe to Organization's Needs
  useEffect(() => {
    const unsubscribe = subscribeToOrgNeeds(orgIdentifier, (list) => {
      setNeeds(list);
    });
    return () => unsubscribe();
  }, [orgIdentifier]);

  // 2. Subscribe to Live Active Crises from Dashboard
  useEffect(() => {
    const unsubCrises = subscribeToLiveCrises((crises) => {
      setActiveCrises(crises);
    });
    return () => {
      if (typeof unsubCrises === 'function') unsubCrises();
    };
  }, []);

  // 3. Subscribe to Notifications
  useEffect(() => {
    const unsubNotifs = subscribeToUserNotifications(
      'organization',
      orgUser?.phone,
      (notifs) => {
        setNotificationCount(notifs.length);
      }
    );
    return () => {
      if (typeof unsubNotifs === 'function') unsubNotifs();
    };
  }, [orgUser?.phone]);

  const totalVolunteers = needs.reduce((acc, curr) => acc + (curr.volunteersCount || 0), 0);
  const activeNeeds = needs.filter((n) => n.status === 'active');

  const handleRespondToCrisis = (crisis: MapMarker) => {
    navigation?.navigate('CreateNeed', {
      crisisId: crisis.id,
      crisisTitle: crisis.title || crisis.city,
      wilaya: crisis.wilayaCode || '',
      wilayaName: crisis.wilayaName || crisis.city,
      crisisDescription: crisis.description || '',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar 
        wilaya={wilaya}
        notificationCount={notificationCount}
        onNotificationPress={() => navigation?.navigate('Notifications')}
        onLocationPress={() => navigation?.navigate('OrgMap')}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* ============================================================ */}
        {/* 🚨 ACTIVE CRISES EMERGENCY SECTION (If any crisis is active)  */}
        {/* ============================================================ */}
        {activeCrises.length > 0 && (
          <View style={styles.crisesSection}>
            <View style={styles.crisesHeader}>
              <View style={styles.crisisBadgePill}>
                <View style={styles.pulseDot} />
                <Text style={styles.crisisBadgePillText}>{activeCrises.length} بؤرة أزمة نشطة</Text>
              </View>
              <Text style={styles.crisesTitle}>🚨 تنبيه طوارئ وطني</Text>
            </View>
            <Text style={styles.crisesSubtitle}>
              تم تسجيل أزمات طارئة تستدعي تدخل الجمعيات لإضافة احتياجات ميدانية للمتطوعين:
            </Text>

            {activeCrises.map((c) => {
              const pct = c.severityPercentage || 50;
              const isUrgent = pct >= 75 || c.severityLevel === 'urgent';
              const isMedium = (!isUrgent && pct >= 40) || c.severityLevel === 'medium';
              const tierColor = isUrgent ? '#DC2626' : isMedium ? '#EA580C' : '#16A34A';
              const tierBadgeBg = isUrgent ? '#FEE2E2' : isMedium ? '#FFEDD5' : '#DCFCE7';
              const tierText = isUrgent ? 'عاجل (بطاقة حمراء)' : isMedium ? 'متوسط (بطاقة برتقالية)' : 'عادي (بطاقة خضراء)';

              return (
                <View key={c.id} style={styles.crisisCard}>
                  <View style={styles.crisisCardTop}>
                    <View style={[styles.tierBadge, { backgroundColor: tierBadgeBg }]}>
                      <Text style={[styles.tierBadgeText, { color: tierColor }]}>
                        {tierText} {pct}%
                      </Text>
                    </View>
                    <Text style={styles.crisisCardTitle}>{c.title}</Text>
                  </View>

                  <View style={styles.crisisLocationRow}>
                    <Ionicons name="location-sharp" size={14} color="#DC2626" />
                    <Text style={styles.crisisLocationText}>
                      ولاية {c.wilayaName || c.city} {c.locationDetails ? `• ${c.locationDetails}` : ''}
                    </Text>
                  </View>

                  {c.description ? (
                    <Text style={styles.crisisDesc} numberOfLines={2}>
                      {c.description}
                    </Text>
                  ) : null}

                  {/* CTA to Create Need for this Crisis */}
                  <TouchableOpacity
                    style={styles.respondBtn}
                    onPress={() => handleRespondToCrisis(c)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.respondBtnText}>استجابة وإضافة احتياج ميداني للمتطوعين ←</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>نظرة عامة على الميدان</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{activeNeeds.length}</Text>
              <Text style={styles.statLabel}>إعلان نشط</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalVolunteers}</Text>
              <Text style={styles.statLabel}>متطوع مسجل</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{needs.length}</Text>
              <Text style={styles.statLabel}>إجمالي الاحتياجات</Text>
            </View>
          </View>
        </View>

        {/* Quick Action to Post */}
        <View style={styles.actionBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionBannerTitle}>هل تحتاج يد عاملة أو شاحنة؟</Text>
            <Text style={styles.actionBannerSub}>انشر احتياجك الآن ليصل إلى آلاف المتطوعين في ولايتك.</Text>
          </View>
          <TouchableOpacity
            style={styles.postBtn}
            onPress={() => navigation?.navigate('CreateNeed')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.postBtnText}>نشر إعلان</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Needs / Tasks */}
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>آخر الإعلانات المنشورة</Text>
          {needs.length === 0 ? (
            <View style={styles.placeholderCard}>
              <Ionicons name="megaphone-outline" size={32} color={Colors.placeholder} />
              <Text style={styles.placeholderText}>لا توجد إعلانات منشورة بعد.</Text>
            </View>
          ) : (
            needs.slice(0, 3).map((item) => (
              <View key={item.id} style={styles.miniNeedCard}>
                <View style={styles.miniTopRow}>
                  <Text style={styles.miniBadge}>{item.needType}</Text>
                  <Text style={styles.miniCount}>
                    {item.volunteersCount}/{item.quantity} متطوع
                  </Text>
                </View>
                <Text style={styles.miniTitle} numberOfLines={1}>{item.title}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (Colors: any, isDarkMode: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.pageBackground,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80,
  },

  // Crises Section Styles
  crisesSection: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    backgroundColor: isDarkMode ? '#201214' : '#FEF2F2',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#F87171',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  crisesHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  crisesTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#DC2626',
  },
  crisisBadgePill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: isDarkMode ? '#3B181C' : '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#DC2626',
  },
  crisisBadgePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  crisesSubtitle: {
    fontSize: 12,
    color: isDarkMode ? '#FCA5A5' : '#7F1D1D',
    textAlign: 'right',
    lineHeight: 18,
    marginBottom: 12,
  },
  crisisCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: isDarkMode ? '#372023' : '#FEE2E2',
  },
  crisisCardTop: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  crisisCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primaryText,
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tierBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  crisisLocationRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  crisisLocationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  crisisDesc: {
    fontSize: 12,
    color: isDarkMode ? '#A1A1AA' : '#52525B',
    textAlign: 'right',
    lineHeight: 17,
    marginBottom: 10,
  },
  respondBtn: {
    backgroundColor: '#DC2626',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  respondBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },

  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primaryText,
    marginBottom: 12,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0EBE1',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primaryNavy,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  actionBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#EBF5FB',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    gap: 12,
  },
  actionBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primaryNavy,
    textAlign: 'right',
  },
  actionBannerSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  postBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: Colors.primaryNavy,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  postBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  recentContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  placeholderCard: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0EBE1',
    gap: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.placeholder,
    fontWeight: '600',
  },
  miniNeedCard: {
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0EBE1',
  },
  miniTopRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  miniBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryNavy,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  miniCount: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.mainBlue,
  },
  miniTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryText,
    textAlign: 'right',
  },
});
