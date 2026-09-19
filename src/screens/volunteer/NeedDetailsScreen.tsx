// ============================================================
// src/screens/volunteer/NeedDetailsScreen.tsx
// Comprehensive Need Details Screen with Live Firestore Sync,
// Map Preview, Direct Call, and Real-time Volunteering
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { NeedItem } from '../../types/need.types';
import { volunteerToNeed, cancelVolunteerForNeed } from '../../services/needsService';
import { SolidarityMap } from '../../components/map/SolidarityMap';

interface Props {
  navigation: any;
  route: {
    params: {
      need?: NeedItem;
      id?: string;
    };
  };
}

export default function NeedDetailsScreen({ navigation, route }: Props) {
  const { colors: Colors } = useTheme();
  const styles = useMemo(() => getStyles(Colors), [Colors]);
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id || user?.phone || 'user_guest';

  const initialNeed = route.params?.need;
  const needId = initialNeed?.id || route.params?.id;

  const [need, setNeed] = useState<NeedItem | null>(initialNeed || null);
  const [isLoading, setIsLoading] = useState(!initialNeed);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Subscribe to real-time updates for this specific need document
  useEffect(() => {
    if (!needId) return;

    const needDocRef = doc(db, 'needs', needId);
    const unsubscribe = onSnapshot(
      needDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNeed({
            id: docSnap.id,
            title: data.title || '',
            needType: data.needType || 'يد عاملة',
            quantity: data.quantity || 1,
            volunteersCount: data.volunteersCount ?? (data.volunteers?.length || 0),
            volunteers: data.volunteers || [],
            wilaya: data.wilaya || '',
            wilayaName: data.wilayaName || '',
            locationDetails: data.locationDetails || '',
            coordinates: data.coordinates || null,
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            priority: data.priority || 'normal',
            description: data.description || '',
            organizationId: data.organizationId || '',
            organizationName: data.organizationName || '',
            organizationPhone: data.organizationPhone || '',
            status: data.status || 'active',
            createdAt: data.createdAt,
          });
        }
        setIsLoading(false);
      },
      (error) => {
        console.warn('Need details listener error:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [needId]);

  const volunteersCount = need?.volunteersCount ?? 0;
  const quantity = need?.quantity ?? 1;
  const isFull = volunteersCount >= quantity;

  const isUserVolunteered = useMemo(() => {
    if (!currentUserId || !need?.volunteers) return false;
    return Array.isArray(need.volunteers) && need.volunteers.includes(currentUserId);
  }, [currentUserId, need?.volunteers]);

  const progressRatio = Math.min(volunteersCount / Math.max(quantity, 1), 1);
  const progressPercent = `${Math.round(progressRatio * 100)}%` as const;

  // Priority badge config
  const priorityConfig = useMemo(() => {
    switch (need?.priority) {
      case 'urgent':
        return {
          label: '🔴 عاجل جداً',
          badgeText: 'بطاقة حمراء',
          color: '#E74C3C',
          bg: '#FEE2E2',
          borderColor: '#FCA5A5',
        };
      case 'medium':
        return {
          label: '🟡 أولوية متوسطة',
          badgeText: 'بطاقة صفراء',
          color: '#D97706',
          bg: '#FEF3C7',
          borderColor: '#FCD34D',
        };
      case 'normal':
      default:
        return {
          label: '🟢 أولوية عادية',
          badgeText: 'بطاقة خضراء',
          color: '#27AE60',
          bg: '#DCFCE7',
          borderColor: '#86EFAC',
        };
    }
  }, [need?.priority]);

  // Handle direct call
  const handleCallOrg = () => {
    if (need?.organizationPhone) {
      let phoneUrl = need.organizationPhone;
      if (phoneUrl.startsWith('+213+213')) {
        phoneUrl = phoneUrl.replace('+213+213', '+213');
      }
      Linking.openURL(`tel:${phoneUrl}`);
    } else {
      Alert.alert('تنبيه', 'رقم الهاتف غير متوفر.');
    }
  };

  // Handle volunteer toggle
  const handleVolunteerToggle = async () => {
    if (!needId) return;

    if (isUserVolunteered) {
      Alert.alert('إلغاء التطوع', 'هل تريد بالفعل إلغاء تطوعك في هذا الاحتياج؟', [
        { text: 'تراجع', style: 'cancel' },
        {
          text: 'تأكيد الإلغاء',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsActionLoading(true);
              await cancelVolunteerForNeed(needId, currentUserId);
              setIsActionLoading(false);
              Alert.alert('تم', 'تم إلغاء تطوعك بنجاح.');
            } catch (err: any) {
              setIsActionLoading(false);
              Alert.alert('خطأ', err?.message || 'تعذر إلغاء التطوع.');
            }
          },
        },
      ]);
      return;
    }

    if (isFull) {
      Alert.alert('عذراً', 'العدد المطلوب لهذا الاحتياج قد اكتمل بالفعل.');
      return;
    }

    try {
      setIsActionLoading(true);
      await volunteerToNeed(needId, currentUserId);
      setIsActionLoading(false);
      Alert.alert('تم بنجاح ✓', 'شكراً لتطوعك ومساهمتك! تم تسجيلك بنجاح.');
    } catch (err: any) {
      setIsActionLoading(false);
      Alert.alert('تنبيه', err?.message || 'فشلت عملية التطوع.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primaryNavy} />
        <Text style={styles.loadingText}>جارِ تحميل تفاصيل الاحتياج...</Text>
      </SafeAreaView>
    );
  }

  if (!need) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={50} color={Colors.error} />
        <Text style={styles.errorText}>لم يتم العثور على هذا الاحتياج.</Text>
        <TouchableOpacity style={styles.backButtonSimple} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonSimpleText}>العودة للرئيسية</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-forward" size={20} color={Colors.primaryNavy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تفاصيل الاحتياج</Text>
        <TouchableOpacity style={styles.shareBtn} onPress={handleCallOrg} activeOpacity={0.7}>
          <Ionicons name="call-outline" size={20} color={Colors.primaryNavy} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Priority & Category Top Banner */}
        <View
          style={[
            styles.priorityBanner,
            { backgroundColor: priorityConfig.bg, borderColor: priorityConfig.borderColor },
          ]}
        >
          <View style={styles.bannerRow}>
            <View style={[styles.priorityPill, { backgroundColor: priorityConfig.color }]}>
              <Text style={styles.priorityPillText}>{priorityConfig.badgeText}</Text>
            </View>
            <Text style={[styles.priorityTitle, { color: priorityConfig.color }]}>
              {priorityConfig.label}
            </Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{need.needType}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{need.title}</Text>

        {/* Volunteers Counter Card (5/40) */}
        <View style={styles.counterCard}>
          <View style={styles.counterRow}>
            <View style={styles.counterNumbers}>
              <Text style={styles.counterRatio}>
                {volunteersCount} <Text style={styles.counterTotal}>/ {quantity}</Text>
              </Text>
              <Text style={styles.counterLabel}>متطوع مسجل</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                isFull ? styles.statusBadgeFull : styles.statusBadgeActive,
              ]}
            >
              <Text style={[styles.statusBadgeText, isFull && { color: '#E74C3C' }]}>
                {isFull ? 'العدد مكتمل 🔒' : 'متاح للتطوع 🟢'}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: progressPercent, backgroundColor: priorityConfig.color },
              ]}
            />
          </View>
          <Text style={styles.remainingText}>
            {isFull
              ? 'تم استيفاء العدد المطلوب بالكامل'
              : `متبقي ${quantity - volunteersCount} شخص لاكتمال العدد`}
          </Text>
        </View>

        {/* Details Section */}
        <View style={styles.detailsCard}>
          {/* Organization */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Ionicons name="business" size={20} color={Colors.primaryNavy} />
            </View>
            <View style={styles.detailTextBox}>
              <Text style={styles.detailLabel}>الجهة المنظمة</Text>
              <Text style={styles.detailValue}>{need.organizationName || 'جمعية محروسة'}</Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Ionicons name="location" size={20} color={Colors.urgent} />
            </View>
            <View style={styles.detailTextBox}>
              <Text style={styles.detailLabel}>الموقع والولاية</Text>
              <Text style={styles.detailValue}>
                {need.wilayaName || need.wilaya} – {need.locationDetails}
              </Text>
            </View>
          </View>

          {/* Duration */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Ionicons name="calendar" size={20} color={Colors.mainBlue} />
            </View>
            <View style={styles.detailTextBox}>
              <Text style={styles.detailLabel}>المدة الزمنية</Text>
              <Text style={styles.detailValue}>
                من {need.startDate} إلى غاية {need.endDate}
              </Text>
            </View>
          </View>

          {/* Contact Phone */}
          {need.organizationPhone ? (
            <TouchableOpacity style={styles.phoneActionRow} onPress={handleCallOrg} activeOpacity={0.7}>
              <View style={styles.phoneIconBox}>
                <Ionicons name="call" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>رقم هاتف الجمعية</Text>
                <Text style={styles.phoneText}>{need.organizationPhone}</Text>
              </View>
              <Text style={styles.callNowText}>اتصال الآن</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Description Section */}
        {need.description ? (
          <View style={styles.descCard}>
            <Text style={styles.descTitle}>تفاصيل إضافية وشروط</Text>
            <Text style={styles.descText}>{need.description}</Text>
          </View>
        ) : null}

        {/* Map Preview if coordinates available */}
        {need.coordinates && (
          <View style={styles.mapSection}>
            <Text style={styles.mapSectionTitle}>الموقع الجغرافي المحدد</Text>
            <View style={styles.mapBox}>
              <SolidarityMap pickedLocation={need.coordinates} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Sticky CTA */}
      <View style={styles.bottomBar}>
        {isFull && !isUserVolunteered ? (
          <View style={styles.fullDisabledBtn}>
            <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
            <Text style={styles.fullDisabledText}>العدد مكتمل (غير متاح للتطوع)</Text>
          </View>
        ) : isUserVolunteered ? (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleVolunteerToggle}
            disabled={isActionLoading}
            activeOpacity={0.8}
          >
            {isActionLoading ? (
              <ActivityIndicator color="#E74C3C" />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={20} color="#E74C3C" />
                <Text style={styles.cancelBtnText}>أنت مسجل في هذا الاحتياج (إلغاء التطوع)</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.volunteerBtn}
            onPress={handleVolunteerToggle}
            disabled={isActionLoading}
            activeOpacity={0.8}
          >
            {isActionLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="hand-right-outline" size={20} color="#FFFFFF" />
                <Text style={styles.volunteerBtnText}>تطوع الآن في هذا الاحتياج</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: Colors.pageBackground,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      backgroundColor: Colors.pageBackground,
    },
    loadingText: {
      fontSize: 15,
      color: Colors.textSecondary,
      marginTop: 12,
      fontWeight: '600',
    },
    errorText: {
      fontSize: 16,
      color: Colors.primaryText,
      marginTop: 12,
      fontWeight: '700',
    },
    backButtonSimple: {
      marginTop: 20,
      backgroundColor: Colors.primaryNavy,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 12,
    },
    backButtonSimpleText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    header: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: '#F0EBE1',
      backgroundColor: Colors.surface,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: Colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#F0EBE1',
    },
    shareBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: Colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#F0EBE1',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: Colors.primaryText,
    },
    scrollContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    priorityBanner: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 16,
      borderWidth: 1.5,
      padding: 14,
      marginBottom: 16,
    },
    bannerRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 8,
    },
    priorityPill: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    priorityPillText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '800',
    },
    priorityTitle: {
      fontSize: 14,
      fontWeight: '800',
    },
    categoryBadge: {
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    categoryBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: Colors.primaryNavy,
    },
    title: {
      fontSize: 22,
      fontWeight: '900',
      color: Colors.primaryText,
      textAlign: 'right',
      marginBottom: 16,
      lineHeight: 30,
    },
    counterCard: {
      backgroundColor: Colors.surface,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
    },
    counterRow: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    counterNumbers: {
      alignItems: 'flex-end',
    },
    counterRatio: {
      fontSize: 28,
      fontWeight: '900',
      color: Colors.primaryNavy,
    },
    counterTotal: {
      fontSize: 18,
      color: Colors.textSecondary,
      fontWeight: '600',
    },
    counterLabel: {
      fontSize: 12,
      color: Colors.textSecondary,
      fontWeight: '600',
      marginTop: 2,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    statusBadgeActive: {
      backgroundColor: '#DCFCE7',
    },
    statusBadgeFull: {
      backgroundColor: '#FEE2E2',
    },
    statusBadgeText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#27AE60',
    },
    progressTrack: {
      height: 8,
      backgroundColor: '#F1F5F9',
      borderRadius: 4,
      width: '100%',
      alignItems: 'flex-end',
      overflow: 'hidden',
    },
    progressFill: {
      height: 8,
      borderRadius: 4,
    },
    remainingText: {
      fontSize: 12,
      color: Colors.textSecondary,
      textAlign: 'right',
      marginTop: 8,
      fontWeight: '600',
    },
    detailsCard: {
      backgroundColor: Colors.surface,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      marginBottom: 16,
      gap: 16,
    },
    detailRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 12,
    },
    detailIconBox: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    detailTextBox: {
      flex: 1,
      alignItems: 'flex-end',
    },
    detailLabel: {
      fontSize: 12,
      color: Colors.textSecondary,
      fontWeight: '600',
      marginBottom: 2,
    },
    detailValue: {
      fontSize: 15,
      fontWeight: '700',
      color: Colors.primaryText,
      textAlign: 'right',
    },
    phoneActionRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      backgroundColor: '#F0F9FF',
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: '#BAE6FD',
      gap: 10,
    },
    phoneIconBox: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: Colors.mainBlue,
      justifyContent: 'center',
      alignItems: 'center',
    },
    phoneText: {
      fontSize: 15,
      fontWeight: '800',
      color: Colors.primaryNavy,
      textAlign: 'right',
    },
    callNowText: {
      fontSize: 13,
      fontWeight: '800',
      color: Colors.mainBlue,
    },
    descCard: {
      backgroundColor: Colors.surface,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      marginBottom: 16,
    },
    descTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: Colors.primaryText,
      marginBottom: 8,
      textAlign: 'right',
    },
    descText: {
      fontSize: 14,
      color: Colors.textSecondary,
      lineHeight: 22,
      textAlign: 'right',
    },
    mapSection: {
      marginBottom: 20,
    },
    mapSectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: Colors.primaryText,
      marginBottom: 10,
      textAlign: 'right',
    },
    mapBox: {
      height: 200,
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    bottomBar: {
      padding: 18,
      backgroundColor: Colors.surface,
      borderTopWidth: 1,
      borderTopColor: '#F0EBE1',
    },
    volunteerBtn: {
      flexDirection: 'row-reverse',
      backgroundColor: Colors.primaryNavy,
      borderRadius: 16,
      paddingVertical: 16,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      elevation: 3,
    },
    volunteerBtnText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
    cancelBtn: {
      flexDirection: 'row-reverse',
      backgroundColor: '#FEE2E2',
      borderWidth: 1.5,
      borderColor: '#FCA5A5',
      borderRadius: 16,
      paddingVertical: 14,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    cancelBtnText: {
      color: '#E74C3C',
      fontSize: 14,
      fontWeight: '800',
    },
    fullDisabledBtn: {
      flexDirection: 'row-reverse',
      backgroundColor: '#F3F4F6',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 16,
      paddingVertical: 16,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    fullDisabledText: {
      color: '#9CA3AF',
      fontSize: 15,
      fontWeight: '700',
    },
  });
