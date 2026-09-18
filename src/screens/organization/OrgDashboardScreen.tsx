import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { TopBar } from '../../components/home/TopBar';
import { NeedItem } from '../../types/need.types';
import { subscribeToOrgNeeds } from '../../services/needsService';

export default function OrgDashboardScreen({ navigation }: any) {
  const { colors: Colors } = useTheme();
  const { user } = useAuthStore();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const orgUser = user as any;
  const wilaya = orgUser?.wilaya || 'الجزائر العاصمة';
  const orgIdentifier = orgUser?.id || orgUser?.phone || orgUser?.phoneNumber || 'org_default';

  const [needs, setNeeds] = useState<NeedItem[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToOrgNeeds(orgIdentifier, (list) => {
      setNeeds(list);
    });
    return () => unsubscribe();
  }, [orgIdentifier]);

  const totalVolunteers = needs.reduce((acc, curr) => acc + (curr.volunteersCount || 0), 0);
  const activeNeeds = needs.filter((n) => n.status === 'active');

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar wilaya={wilaya} />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
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

const getStyles = (Colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.pageBackground,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80,
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
