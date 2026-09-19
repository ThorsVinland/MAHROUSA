// ============================================================
// src/screens/organization/OrgNeedsScreen.tsx
// Organization Screen for Managing Posted Needs & Real-time Volunteers
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAlert } from '../../context/AlertContext';
import { useAuthStore } from '../../store/authStore';
import { TopBar } from '../../components/home/TopBar';
import { NeedItem } from '../../types/need.types';
import { subscribeToOrgNeeds, deleteNeed } from '../../services/needsService';

interface OrgNeedsScreenProps {
  navigation?: any;
}

export default function OrgNeedsScreen({ navigation }: OrgNeedsScreenProps) {
  const { colors: Colors } = useTheme();
  const { user } = useAuthStore();
  const styles = useMemo(() => getStyles(Colors), [Colors]);
  const { showAlert } = useAlert();

  const orgUser = user as any;
  const orgIdentifier = orgUser?.id || orgUser?.phone || orgUser?.phoneNumber || 'org_default';

  const [needs, setNeeds] = useState<NeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToOrgNeeds(orgIdentifier, (list) => {
      setNeeds(list);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [orgIdentifier]);

  const handleDeleteNeed = (need: NeedItem) => {
    showAlert('حذف الإعلان', `هل أنت متأكد من حذف إعلان "${need.title}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteNeed(need.id);
            showAlert('تم', 'تم حذف الإعلان بنجاح.');
          } catch (err: any) {
            showAlert('خطأ', err?.message || 'تعذر حذف الإعلان.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <TopBar />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Stats */}
        <View style={styles.headerBox}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>إدارة إعلانات الجمعية</Text>
          </View>

          <View style={styles.headerStatsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{needs.length}</Text>
              <Text style={styles.statLabel}>إعلانات منشورة</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>
                {needs.reduce((acc, curr) => acc + (curr.volunteersCount || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>إجمالي المتطوعين</Text>
            </View>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primaryNavy} />
            <Text style={styles.loadingText}>جارِ جلب إعلانات الجمعية...</Text>
          </View>
        ) : needs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="folder-open-outline" size={48} color={Colors.placeholder} />
            </View>
            <Text style={styles.emptyTitle}>لا توجد إعلانات منشورة حالياً</Text>
            <Text style={styles.emptySubtitle}>
              ابدأ الآن بإضافة احتياجات جمعيتك (يد عاملة، شاحنات، مقر تخزين، خبرة) لتظهر فوراً للمتطوعين.
            </Text>
            <TouchableOpacity
              style={styles.createFirstBtn}
              onPress={() => navigation?.navigate('CreateNeed')}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.createFirstBtnText}>نشر أول احتياج الآن</Text>
            </TouchableOpacity>
          </View>
        ) : (
          needs.map((item) => {
            const isFull = item.volunteersCount >= item.quantity;
            const progressRatio = Math.min(
              item.volunteersCount / Math.max(item.quantity, 1),
              1
            );
            const progressPercent = `${Math.round(progressRatio * 100)}%` as const;

            return (
              <View key={item.id} style={styles.needCard}>
                {/* Top Row: Type & Priority & Delete */}
                <View style={styles.cardHeader}>
                  <View style={styles.badgesRow}>
                    <View
                      style={[
                        styles.priorityBadge,
                        item.priority === 'urgent' && { backgroundColor: '#FEE2E2' },
                        item.priority === 'medium' && { backgroundColor: '#FEF3C7' },
                        item.priority === 'normal' && { backgroundColor: '#DCFCE7' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityBadgeText,
                          item.priority === 'urgent' && { color: '#E74C3C' },
                          item.priority === 'medium' && { color: '#D97706' },
                          item.priority === 'normal' && { color: '#27AE60' },
                        ]}
                      >
                        {item.priority === 'urgent'
                          ? '🔴 عاجل'
                          : item.priority === 'medium'
                          ? '🟡 متوسط'
                          : '🟢 عادي'}
                      </Text>
                    </View>

                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{item.needType}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDeleteNeed(item)}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                {/* Title */}
                <Text style={styles.needTitle}>{item.title}</Text>

                {/* Meta details */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-sharp" size={13} color={Colors.urgent} />
                    <Text style={styles.metaText}>{item.wilayaName || item.wilaya}</Text>
                  </View>
                  <Text style={styles.dot}>•</Text>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
                    <Text style={styles.metaText}>
                      {item.startDate} إلى {item.endDate}
                    </Text>
                  </View>
                </View>

                {/* Volunteers Counter & Progress Bar */}
                <View style={styles.counterBox}>
                  <View style={styles.counterHeader}>
                    <Text style={styles.counterCount}>
                      {item.volunteersCount} <Text style={styles.counterTotal}>/ {item.quantity} متطوع</Text>
                    </Text>
                    <Text style={[styles.statusText, isFull && { color: '#E74C3C' }]}>
                      {isFull ? 'العدد مكتمل 🔒' : 'جارِ التسجيل 🟢'}
                    </Text>
                  </View>

                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: progressPercent,
                          backgroundColor: isFull ? '#27AE60' : Colors.mainBlue,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation?.navigate('CreateNeed')}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
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
      padding: 18,
      paddingBottom: 90,
    },
    headerBox: {
      marginBottom: 16,
    },
    sectionTitleRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      marginBottom: 12,
      paddingHorizontal: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: Colors.primaryNavy,
      textAlign: 'right',
    },
    headerStatsRow: {
      flexDirection: 'row-reverse',
      gap: 12,
    },
    statBox: {
      flex: 1,
      backgroundColor: Colors.surface,
      borderRadius: 16,
      padding: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#F0EBE1',
      elevation: 1,
    },
    statNum: {
      fontSize: 22,
      fontWeight: '900',
      color: Colors.primaryNavy,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: Colors.textSecondary,
      marginTop: 2,
    },
    loadingBox: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      color: Colors.textSecondary,
      fontWeight: '600',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 30,
      backgroundColor: Colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      marginTop: 20,
    },
    emptyIconBox: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: Colors.primaryText,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 13,
      color: Colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 20,
    },
    createFirstBtn: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      backgroundColor: Colors.primaryNavy,
      borderRadius: 14,
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 8,
    },
    createFirstBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },
    needCard: {
      backgroundColor: Colors.surface,
      borderRadius: 18,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    badgesRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 6,
    },
    priorityBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    priorityBadgeText: {
      fontSize: 11,
      fontWeight: '800',
    },
    typeBadge: {
      backgroundColor: '#F3F4F6',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    typeBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: Colors.primaryNavy,
    },
    deleteBtn: {
      padding: 6,
    },
    needTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: Colors.primaryText,
      textAlign: 'right',
      marginBottom: 8,
      lineHeight: 22,
    },
    metaRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    metaItem: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: 12,
      color: Colors.textSecondary,
      fontWeight: '600',
    },
    dot: {
      color: '#CBD5E1',
    },
    counterBox: {
      backgroundColor: '#F8FAFC',
      padding: 12,
      borderRadius: 12,
    },
    counterHeader: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    counterCount: {
      fontSize: 15,
      fontWeight: '900',
      color: Colors.primaryNavy,
    },
    counterTotal: {
      fontSize: 12,
      color: Colors.textSecondary,
      fontWeight: '600',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#27AE60',
    },
    progressTrack: {
      height: 6,
      backgroundColor: '#E2E8F0',
      borderRadius: 3,
      overflow: 'hidden',
      alignItems: 'flex-end',
    },
    progressFill: {
      height: 6,
      borderRadius: 3,
    },
    fab: {
      position: 'absolute',
      bottom: 24,
      left: 24,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: Colors.primaryNavy,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
  });
