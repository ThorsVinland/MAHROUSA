// ============================================================
// src/screens/volunteer/NeedDetailsScreen.tsx
// Comprehensive Need Details Screen with Live Firestore Sync,
// Map Preview, Direct Call, Backup Volunteers, & 1-Hour Auto-Promotion
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { NeedItem } from '../../types/need.types';
import {
  volunteerToNeed,
  cancelVolunteerForNeed,
  confirmAttendanceForNeed,
  checkAndPromoteBackupVolunteers,
} from '../../services/needsService';
import { SolidarityMap } from '../../components/map/SolidarityMap';
import { useAlert } from '../../context/AlertContext';

interface Props {
  navigation: any;
  route: {
    params: {
      need?: NeedItem;
      id?: string;
    };
  };
}

const ONE_HOUR_MS = 60 * 60 * 1000;

export default function NeedDetailsScreen({ navigation, route }: Props) {
  const { colors: Colors, isDarkMode } = useTheme();
  const styles = useMemo(() => getStyles(Colors, isDarkMode), [Colors, isDarkMode]);
  const user = useAuthStore((state) => state.user);
  const { showAlert } = useAlert();
  const currentUserId = user?.id || user?.phone || 'user_guest';
  const userPhone = user?.phone;

  const initialNeed = route.params?.need;
  const needId = initialNeed?.id || route.params?.id;

  const [need, setNeed] = useState<NeedItem | null>(initialNeed || null);
  const [isLoading, setIsLoading] = useState(!initialNeed);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Real-time minute ticker for attendance countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Subscribe to real-time updates for this specific need document
  useEffect(() => {
    if (!needId) return;

    // Check backup promotions whenever viewing details
    checkAndPromoteBackupVolunteers(needId).catch(() => {});

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
            backupVolunteers: data.backupVolunteers || [],
            completedVolunteers: data.completedVolunteers || [],
            confirmedAttendance: data.confirmedAttendance || [],
            volunteerRegisteredAt: data.volunteerRegisteredAt || {},
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

  const volunteersCount = need?.volunteersCount ?? (need?.volunteers?.length || 0);
  const quantity = need?.quantity ?? 1;
  const isFull = volunteersCount >= quantity;

  // Check user registration status (Primary vs Backup)
  const isPrimaryVolunteer = useMemo(() => {
    if (!need?.volunteers) return false;
    return (
      (currentUserId && need.volunteers.includes(currentUserId)) ||
      (userPhone && need.volunteers.includes(userPhone))
    );
  }, [currentUserId, userPhone, need?.volunteers]);

  const backupIndex = useMemo(() => {
    if (!need?.backupVolunteers) return -1;
    if (currentUserId && need.backupVolunteers.includes(currentUserId)) {
      return need.backupVolunteers.indexOf(currentUserId);
    }
    if (userPhone && need.backupVolunteers.includes(userPhone)) {
      return need.backupVolunteers.indexOf(userPhone);
    }
    return -1;
  }, [currentUserId, userPhone, need?.backupVolunteers]);

  const isBackupVolunteer = backupIndex !== -1;
  const backupRank = isBackupVolunteer ? backupIndex + 1 : 0;

  const isConfirmedAttendance = useMemo(() => {
    if (!need?.confirmedAttendance) return false;
    return (
      (currentUserId && need.confirmedAttendance.includes(currentUserId)) ||
      (userPhone && need.confirmedAttendance.includes(userPhone))
    );
  }, [currentUserId, userPhone, need?.confirmedAttendance]);

  // Registered timestamp for primary volunteer
  const registeredAtMs = useMemo(() => {
    if (!need?.volunteerRegisteredAt) return 0;
    const reg =
      need.volunteerRegisteredAt[currentUserId] ||
      (userPhone ? need.volunteerRegisteredAt[userPhone] : 0) ||
      (need.createdAt?.seconds ? need.createdAt.seconds * 1000 : 0);
    return Number(reg) || 0;
  }, [need?.volunteerRegisteredAt, need?.createdAt, currentUserId, userPhone]);

  // Remaining minutes to confirm attendance
  const remainingMinutes = useMemo(() => {
    if (!isPrimaryVolunteer || isConfirmedAttendance || registeredAtMs === 0) return 60;
    const elapsed = currentTime - registeredAtMs;
    const remainingMs = Math.max(0, ONE_HOUR_MS - elapsed);
    return Math.ceil(remainingMs / 60000);
  }, [isPrimaryVolunteer, isConfirmedAttendance, registeredAtMs, currentTime]);

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
          bg: isDarkMode ? '#3D1B1B' : '#FEE2E2',
          borderColor: '#FCA5A5',
        };
      case 'medium':
        return {
          label: '🟡 أولوية متوسطة',
          badgeText: 'بطاقة صفراء',
          color: '#D97706',
          bg: isDarkMode ? '#3D2E14' : '#FEF3C7',
          borderColor: '#FCD34D',
        };
      case 'normal':
      default:
        return {
          label: '🟢 أولوية عادية',
          badgeText: 'بطاقة خضراء',
          color: '#27AE60',
          bg: isDarkMode ? '#1A3826' : '#DCFCE7',
          borderColor: '#86EFAC',
        };
    }
  }, [need?.priority, isDarkMode]);

  // Handle direct call
  const handleCallOrg = () => {
    if (need?.organizationPhone) {
      let phoneUrl = need.organizationPhone;
      if (phoneUrl.startsWith('+213+213')) {
        phoneUrl = phoneUrl.replace('+213+213', '+213');
      }
      Linking.openURL(`tel:${phoneUrl}`);
    } else {
      showAlert('تنبيه', 'رقم الهاتف غير متوفر.');
    }
  };

  // Handle Attendance Confirmation
  const handleConfirmAttendance = async () => {
    if (!needId) return;
    try {
      setIsActionLoading(true);
      await confirmAttendanceForNeed(needId, currentUserId);
      if (userPhone && userPhone !== currentUserId) {
        await confirmAttendanceForNeed(needId, userPhone).catch(() => {});
      }
      setIsActionLoading(false);
      showAlert('تم تأكيد الحضور ✓', 'تم تثبيت حضورك الميداني في هذا الاحتياج بنجاح!');
    } catch (err: any) {
      setIsActionLoading(false);
      showAlert('خطأ', err?.message || 'تعذر تأكيد الحضور.');
    }
  };

  // Handle volunteer or withdraw
  const handleVolunteerAction = async () => {
    if (!needId) return;

    // حالة 1: المستخدم مسجل في الاحتياط أو الأساسي -> إلغاء التطوع
    if (isPrimaryVolunteer || isBackupVolunteer) {
      const title = isBackupVolunteer ? 'إلغاء التسجيل من الاحتياط' : 'إلغاء التطوع';
      const message = isBackupVolunteer
        ? 'هل تريد إزالة اسمك من القائمة الاحتياطية لهذا الاحتياج؟'
        : 'هل تريد بالفعل إلغاء تطوعك الأساسي في هذا الاحتياج؟ سيتم ترقية أول متطوع من القائمة الاحتياطية فوراً.';

      showAlert(title, message, [
        { text: 'تراجع', style: 'cancel' },
        {
          text: 'تأكيد الإلغاء',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsActionLoading(true);
              await cancelVolunteerForNeed(needId, currentUserId);
              if (userPhone && userPhone !== currentUserId) {
                await cancelVolunteerForNeed(needId, userPhone).catch(() => {});
              }
              setIsActionLoading(false);
              showAlert('تم بنجاح', 'تم إلغاء تسجيلك في هذا الاحتياج.');
            } catch (err: any) {
              setIsActionLoading(false);
              showAlert('خطأ', err?.message || 'تعذر إلغاء التسجيل.');
            }
          },
        },
      ]);
      return;
    }

    // حالة 2: غير مسجل والعدد مكتمل -> التسجيل كاحتياطي
    if (isFull) {
      showAlert(
        'التسجيل في قائمة الاحتياط 🛡️',
        'اكتمل العدد المطلوب من المتطوعين الأساسيين. يمكنك التسجيل الآن في القائمة الاحتياطية ليتم إدراجك تلقائياً إذا لم يؤكد أحد المتطوعين حضوره خلال ساعة أو في حال اعتذاره. هل تود المتابعة؟',
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'تسجيل كمتطوع احتياطي',
            style: 'default',
            onPress: async () => {
              try {
                setIsActionLoading(true);
                const res = await volunteerToNeed(needId, currentUserId);
                setIsActionLoading(false);
                showAlert('تم بنجاح ✓', res.message);
              } catch (err: any) {
                setIsActionLoading(false);
                showAlert('تنبيه', err?.message || 'فشلت عملية التسجيل.');
              }
            },
          },
        ]
      );
      return;
    }

    // حالة 3: غير مسجل ويوجد شواغر -> تسجيل أساسي
    try {
      setIsActionLoading(true);
      const res = await volunteerToNeed(needId, currentUserId);
      setIsActionLoading(false);
      showAlert('تم بنجاح ✓', res.message);
    } catch (err: any) {
      setIsActionLoading(false);
      showAlert('تنبيه', err?.message || 'فشلت عملية التطوع.');
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
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
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

        {/* 1. Backup Status Banner if user is Backup */}
        {isBackupVolunteer && (
          <View style={styles.backupCard}>
            <View style={styles.backupCardHeader}>
              <View style={styles.backupBadgePill}>
                <Ionicons name="shield-checkmark" size={16} color="#8B5CF6" />
                <Text style={styles.backupBadgePillText}>قائمة الاحتياط (رقم {backupRank})</Text>
              </View>
              <Text style={styles.backupCardTitle}>أنت مسجل كمتطوع احتياطي 🛡️</Text>
            </View>
            <Text style={styles.backupCardBody}>
              ترتيبك في قائمة الانتظار: <Text style={{ fontWeight: '800' }}>رقم {backupRank}</Text> من أصل{' '}
              {need.backupVolunteers?.length || 1} متطوعين في الاحتياط.
            </Text>
            <View style={styles.backupCardNotice}>
              <Ionicons name="information-circle" size={16} color="#8B5CF6" />
              <Text style={styles.backupCardNoticeText}>
                سيتم إدراجك تلقائياً كمتطوع أساسي في حال لم يؤكد أي متطوع أساسي حضوره خلال مهلة الساعة المحددة له، أو في حال اعتذاره.
              </Text>
            </View>
          </View>
        )}

        {/* 2. Primary Volunteer Attendance Status Banner */}
        {isPrimaryVolunteer && (
          <View
            style={[
              styles.attendanceStatusCard,
              isConfirmedAttendance ? styles.attendanceCardConfirmed : styles.attendanceCardPending,
            ]}
          >
            <View style={styles.attendanceCardHeader}>
              <Ionicons
                name={isConfirmedAttendance ? 'checkmark-circle' : 'time'}
                size={22}
                color={isConfirmedAttendance ? '#27AE60' : '#D97706'}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.attendanceCardTitle,
                    { color: isConfirmedAttendance ? '#27AE60' : '#D97706' },
                  ]}
                >
                  {isConfirmedAttendance ? 'تم تأكيد حضورك الميداني بنجاح ✓' : 'يرجى تأكيد الحضور الميداني ⚠️'}
                </Text>
                {!isConfirmedAttendance && (
                  <Text style={styles.attendanceCardSubtitle}>
                    متبقي حوالي {remainingMinutes} دقيقة لتأكيد الحضور وتجنب الاستبدال بمتطوع من القائمة الاحتياطية.
                  </Text>
                )}
              </View>
            </View>

            {!isConfirmedAttendance && (
              <TouchableOpacity
                style={styles.confirmNowBtn}
                onPress={handleConfirmAttendance}
                disabled={isActionLoading}
                activeOpacity={0.8}
              >
                <Ionicons name="checkbox" size={18} color="#FFFFFF" />
                <Text style={styles.confirmNowBtnText}>تأكيد الحضور الآن بنقرة واحدة</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Volunteers Counter Card */}
        <View style={styles.counterCard}>
          <View style={styles.counterRow}>
            <View style={styles.counterNumbers}>
              <Text style={styles.counterRatio}>
                {volunteersCount} <Text style={styles.counterTotal}>/ {quantity}</Text>
              </Text>
              <Text style={styles.counterLabel}>متطوع أساسي مسجل</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                isFull ? styles.statusBadgeFull : styles.statusBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isFull ? { color: '#8B5CF6' } : { color: '#27AE60' },
                ]}
              >
                {isFull ? 'مكتمل (الاحتياط متاح 🛡️)' : 'متاح للتطوع 🟢'}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: progressPercent,
                  backgroundColor: isFull ? '#8B5CF6' : priorityConfig.color,
                },
              ]}
            />
          </View>
          <View style={styles.counterFooterRow}>
            <Text style={styles.remainingText}>
              {isFull
                ? `اكتمل العدد المطلوب (${need.backupVolunteers?.length || 0} في قائمة الاحتياط)`
                : `متبقي ${quantity - volunteersCount} شخص لاكتمال العدد الأساسي`}
            </Text>
          </View>
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
        {isPrimaryVolunteer ? (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleVolunteerAction}
            disabled={isActionLoading}
            activeOpacity={0.8}
          >
            {isActionLoading ? (
              <ActivityIndicator color="#E74C3C" />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={20} color="#E74C3C" />
                <Text style={styles.cancelBtnText}>أنت مسجل كمتطوع أساسي (إلغاء التطوع)</Text>
              </>
            )}
          </TouchableOpacity>
        ) : isBackupVolunteer ? (
          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: '#DDD6FE', backgroundColor: '#F5F3FF' }]}
            onPress={handleVolunteerAction}
            disabled={isActionLoading}
            activeOpacity={0.8}
          >
            {isActionLoading ? (
              <ActivityIndicator color="#8B5CF6" />
            ) : (
              <>
                <Ionicons name="shield-outline" size={20} color="#8B5CF6" />
                <Text style={[styles.cancelBtnText, { color: '#8B5CF6' }]}>
                  أنت في القائمة الاحتياطية (إلغاء التسجيل)
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : isFull ? (
          <TouchableOpacity
            style={[styles.volunteerBtn, styles.backupRegisterBtn]}
            onPress={handleVolunteerAction}
            disabled={isActionLoading}
            activeOpacity={0.8}
          >
            {isActionLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
                <Text style={styles.volunteerBtnText}>تسجيل كمتطوع احتياطي 🛡️</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.volunteerBtn}
            onPress={handleVolunteerAction}
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

const getStyles = (Colors: any, isDarkMode: boolean) =>
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
      borderBottomColor: isDarkMode ? '#2D3748' : '#F0EBE1',
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
      borderColor: isDarkMode ? '#2D3748' : '#F0EBE1',
    },
    shareBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: Colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDarkMode ? '#2D3748' : '#F0EBE1',
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
      backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
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
    backupCard: {
      backgroundColor: isDarkMode ? '#25173B' : '#F5F3FF',
      borderRadius: 18,
      padding: 16,
      borderWidth: 1.5,
      borderColor: isDarkMode ? '#4C1D95' : '#DDD6FE',
      marginBottom: 16,
      gap: 8,
    },
    backupCardHeader: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    backupBadgePill: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#3B186B' : '#EDE9FE',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    backupBadgePillText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#8B5CF6',
    },
    backupCardTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: '#8B5CF6',
      textAlign: 'right',
    },
    backupCardBody: {
      fontSize: 13,
      color: Colors.textPrimary,
      textAlign: 'right',
      lineHeight: 20,
    },
    backupCardNotice: {
      flexDirection: 'row-reverse',
      alignItems: 'flex-start',
      backgroundColor: isDarkMode ? '#1C1330' : '#EDE9FE',
      borderRadius: 10,
      padding: 10,
      gap: 6,
      marginTop: 4,
    },
    backupCardNoticeText: {
      fontSize: 12,
      color: '#7C3AED',
      flex: 1,
      textAlign: 'right',
      lineHeight: 18,
    },
    attendanceStatusCard: {
      borderRadius: 18,
      padding: 16,
      borderWidth: 1.5,
      marginBottom: 16,
      gap: 12,
    },
    attendanceCardConfirmed: {
      backgroundColor: isDarkMode ? '#142E20' : '#F0FDF4',
      borderColor: isDarkMode ? '#22543D' : '#86EFAC',
    },
    attendanceCardPending: {
      backgroundColor: isDarkMode ? '#382A12' : '#FFFBEB',
      borderColor: isDarkMode ? '#6B4E12' : '#FCD34D',
    },
    attendanceCardHeader: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 10,
    },
    attendanceCardTitle: {
      fontSize: 14,
      fontWeight: '800',
      textAlign: 'right',
    },
    attendanceCardSubtitle: {
      fontSize: 12,
      color: Colors.textSecondary,
      textAlign: 'right',
      marginTop: 2,
      lineHeight: 18,
    },
    confirmNowBtn: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#27AE60',
      borderRadius: 12,
      paddingVertical: 12,
      gap: 8,
    },
    confirmNowBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },
    counterCard: {
      backgroundColor: Colors.surface,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: isDarkMode ? '#2D3748' : '#E5E7EB',
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
      backgroundColor: isDarkMode ? '#1A3826' : '#DCFCE7',
    },
    statusBadgeFull: {
      backgroundColor: isDarkMode ? '#2D1B4E' : '#F3E8FF',
    },
    statusBadgeText: {
      fontSize: 13,
      fontWeight: '800',
    },
    progressTrack: {
      height: 8,
      backgroundColor: isDarkMode ? '#2D3748' : '#F1F5F9',
      borderRadius: 4,
      width: '100%',
      alignItems: 'flex-end',
      overflow: 'hidden',
    },
    progressFill: {
      height: 8,
      borderRadius: 4,
    },
    counterFooterRow: {
      marginTop: 8,
    },
    remainingText: {
      fontSize: 12,
      color: Colors.textSecondary,
      textAlign: 'right',
      fontWeight: '600',
    },
    detailsCard: {
      backgroundColor: Colors.surface,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: isDarkMode ? '#2D3748' : '#E5E7EB',
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
      backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6',
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
      backgroundColor: isDarkMode ? '#172554' : '#F0F9FF',
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? '#1E3A8A' : '#BAE6FD',
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
      borderColor: isDarkMode ? '#2D3748' : '#E5E7EB',
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
      borderColor: isDarkMode ? '#2D3748' : '#E5E7EB',
    },
    bottomBar: {
      padding: 18,
      backgroundColor: Colors.surface,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? '#2D3748' : '#F0EBE1',
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
    backupRegisterBtn: {
      backgroundColor: '#8B5CF6',
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
  });
