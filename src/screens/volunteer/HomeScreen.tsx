// ============================================================
// src/screens/volunteer/HomeScreen.tsx
// Dynamic Volunteer Home Screen with Real-time Firestore Needs,
// Real Dynamic Announcements (Supervisor Upgrade, Crises, Backup Promotions),
// In-App Notifications Badge, and Real Live Stats & Tasks
// ============================================================

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAlert } from '../../context/AlertContext';
import { MapMarker, VolunteerStats, NextTask } from '../../types/home.types';
import { AuthUser } from '../../types/auth.types';
import { NeedItem, SortFilterOption } from '../../types/need.types';
import { HomeAnnouncement, AppNotification } from '../../types/notification.types';
import { VolunteerTaskItem } from '../../types/task.types';
import { MAP_MARKERS } from '../../data/homeMockData';
import { useAuthStore } from '../../store/authStore';
import { getWilayaInfo } from '../../utils/wilayaHelper';
import { WILAYAS } from '../../constants/algeria';
import { TopBar } from '../../components/home/TopBar';
import { GreetingSection } from '../../components/home/GreetingSection';
import { DynamicAnnouncementsBanner } from '../../components/home/DynamicAnnouncementsBanner';
import { StatsRow } from '../../components/home/StatsRow';
import { SectionHeader } from '../../components/home/SectionHeader';
import { NeedCard } from '../../components/home/NeedCard';
import { MapPreview } from '../../components/home/MapPreview';
import { NextTaskCard } from '../../components/home/NextTaskCard';
import {
  subscribeToAllNeeds,
  volunteerToNeed,
  cancelVolunteerForNeed,
  confirmAttendanceForNeed,
  checkAndPromoteBackupVolunteers,
} from '../../services/needsService';
import {
  subscribeToUserNotifications,
  checkAndCreateSupervisorNotification,
} from '../../services/notificationService';
import { subscribeToVolunteerTasks } from '../../services/tasksService';

interface NavigationProp {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
}

interface HomeScreenProps {
  navigation?: NavigationProp;
}

const CATEGORY_TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'يد عاملة', label: 'يد عاملة 👷' },
  { id: 'مقر تخزين', label: 'مقر تخزين 🏬' },
  { id: 'شاحنة', label: 'شاحنة 🚚' },
  { id: 'خبرة', label: 'خبرة 💡' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colors: Colors, isDarkMode } = useTheme();
  const styles = useMemo(() => getStyles(Colors, isDarkMode), [Colors, isDarkMode]);
  const { showAlert } = useAlert();

  // Dynamic user data
  const user = useAuthStore((state) => state.user);
  const volunteerName = user?.fullName || user?.name || 'متطوع المحروسة';
  const userPhone = user?.phone || '';
  const userWilayaCode = user?.wilaya ? String(user.wilaya).padStart(2, '0') : '16';
  const userWilayaInfo = useMemo(() => getWilayaInfo(userWilayaCode), [userWilayaCode]);
  const currentUserId = user?.id || userPhone || 'user_guest';
  const isSupervisor = user?.isSupervisor === true;

  // State: Firestore Needs & Tasks
  const [liveNeeds, setLiveNeeds] = useState<NeedItem[]>([]);
  const [userTasks, setUserTasks] = useState<VolunteerTaskItem[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoadingNeeds, setIsLoadingNeeds] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState<SortFilterOption>('my_wilaya');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedWilayaFilter, setSelectedWilayaFilter] = useState<string>('all');
  const [isWilayaModalVisible, setIsWilayaModalVisible] = useState(false);
  const [wilayaSearch, setWilayaSearch] = useState('');

  // 1. Check and Sync Supervisor Notifications on mount/user update
  useEffect(() => {
    if (userPhone && isSupervisor) {
      checkAndCreateSupervisorNotification(userPhone, true);
    }
  }, [userPhone, isSupervisor]);

  // 2. Subscribe to Notifications in Real-time
  useEffect(() => {
    if (!userPhone) return;
    const unsub = subscribeToUserNotifications(
      userPhone,
      (list) => {
        setNotifications(list);
      },
      () => {}
    );
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [userPhone]);

  // 3. Subscribe to Firestore Needs in real-time
  useEffect(() => {
    setIsLoadingNeeds(true);
    const unsubscribe = subscribeToAllNeeds(
      (items) => {
        setLiveNeeds(items);
        setIsLoadingNeeds(false);

        // Auto-check promotion for active needs
        items.slice(0, 5).forEach((need) => {
          checkAndPromoteBackupVolunteers(need.id).catch(() => {});
        });
      },
      (error) => {
        console.warn('Failed to fetch live needs:', error);
        setIsLoadingNeeds(false);
      }
    );
    return () => unsubscribe && unsubscribe();
  }, []);

  // 4. Subscribe to Volunteer's Tasks in Real-time (For Next Task & Live Stats)
  useEffect(() => {
    const unsub = subscribeToVolunteerTasks(
      currentUserId,
      userPhone,
      (tasks) => {
        setUserTasks(tasks);
      },
      () => {}
    );
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [currentUserId, userPhone]);

  // Real Unread Notifications Count
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Real Stats computed dynamically
  const liveStats: VolunteerStats = useMemo(() => {
    const completedTasks = userTasks.filter((t) => t.isCompletedByMe);
    const documentedHours = completedTasks.reduce(
      (acc, t) => acc + (t.estimatedHours || 3),
      0
    );
    return {
      rating: 5.0,
      documentedHours,
      completedTasks: completedTasks.length,
    };
  }, [userTasks]);

  // Real Next Upcoming Task
  const nextActiveTask = useMemo(() => {
    return userTasks.find((t) => !t.isCompletedByMe) || null;
  }, [userTasks]);

  // 5. Dynamic Real Announcements Generation
  const realAnnouncements = useMemo<HomeAnnouncement[]>(() => {
    const list: HomeAnnouncement[] = [];

    // A. Supervisor Upgrade Approval Announcement
    if (isSupervisor) {
      list.push({
        id: 'supervisor_upgrade_banner',
        type: 'upgrade_approved',
        badge: 'مشرف معتمد 🌟',
        badgeColor: '#8B5CF6',
        title: 'تهانينا! تمت ترقيتك إلى رتبة مشرف معتمد 🌟',
        description:
          'تم قبول طلبك كمشرف في المنصة. يمكنك الآن إدارة فريقك الميداني وتتبع مواردك واحتياجاتك اللوجستية.',
        actionText: 'لوحة التحكم 🚀',
        color: '#8B5CF6',
        bgColor: isDarkMode ? '#24143D' : '#F5F3FF',
        borderColor: isDarkMode ? '#5B21B6' : '#DDD6FE',
        iconName: 'ribbon',
        onPress: () => navigation?.navigate('SupervisorDashboard'),
      });
    }

    // B. Backup Promoted or Attendance Pending Reminder
    const pendingAttendanceNeed = liveNeeds.find(
      (n) =>
        ((currentUserId && n.volunteers?.includes(currentUserId)) ||
          (userPhone && n.volunteers?.includes(userPhone))) &&
        !n.confirmedAttendance?.includes(currentUserId) &&
        (!userPhone || !n.confirmedAttendance?.includes(userPhone))
    );

    if (pendingAttendanceNeed) {
      list.push({
        id: 'attendance_pending_' + pendingAttendanceNeed.id,
        type: 'attendance_pending',
        badge: 'تأكيد الحضور ⏳',
        badgeColor: '#F59E0B',
        title: `تأكيد الحضور الميداني مطلوب ⏳`,
        description: `أنت مسجل كمتطوع أساسي في "${pendingAttendanceNeed.title}". يرجى تأكيد حضورك الميداني لتجنب الاستبدال بمتطوع من الاحتياط.`,
        actionText: 'تأكيد الحضور الآن ✓',
        color: '#D97706',
        bgColor: isDarkMode ? '#36210A' : '#FFFBEB',
        borderColor: isDarkMode ? '#D97706' : '#FDE68A',
        iconName: 'time',
        onPress: () =>
          navigation?.navigate('NeedDetails', {
            need: pendingAttendanceNeed,
            id: pendingAttendanceNeed.id,
          }),
      });
    }

    // C. Urgent Crises / Priority Needs
    const urgentNeeds = liveNeeds.filter((n) => n.priority === 'urgent');
    urgentNeeds.slice(0, 2).forEach((urgent) => {
      list.push({
        id: 'urgent_crisis_' + urgent.id,
        type: 'urgent_crisis',
        badge: 'نداء طارئ عاجل 🔴',
        badgeColor: '#EF4444',
        title: `أزمة عاجلة: ${urgent.title}`,
        description: `${urgent.wilayaName || urgent.wilaya} – ${urgent.locationDetails || 'مطلوب استجابة وتدخل ميداني فوري'}`,
        actionText: 'استجابة وتطوع ⚡',
        color: '#DC2626',
        bgColor: isDarkMode ? '#3B1414' : '#FEF2F2',
        borderColor: isDarkMode ? '#EF4444' : '#FECACA',
        iconName: 'alert-circle',
        onPress: () => navigation?.navigate('NeedDetails', { need: urgent, id: urgent.id }),
      });
    });

    return list;
  }, [isSupervisor, liveNeeds, currentUserId, userPhone, isDarkMode, navigation]);

  // 6. Dynamic map preview markers
  const dynamicMarkers = useMemo<MapMarker[]>(() => {
    const crisis = MAP_MARKERS.filter((m) => m.type === 'crisis');
    return [
      {
        id: 'user_base',
        city: userWilayaInfo.name,
        latitude: userWilayaInfo.lat,
        longitude: userWilayaInfo.lng,
        type: 'resource',
      },
      ...crisis,
    ];
  }, [userWilayaInfo]);

  // Priority weight helper
  const getPriorityWeight = (priority: string): number => {
    if (priority === 'urgent') return 3;
    if (priority === 'medium' || priority === 'high') return 2;
    return 1;
  };

  // Filter & Sort Logic
  const displayedNeeds = useMemo(() => {
    let result = [...liveNeeds];

    // Filter by Category
    if (categoryFilter !== 'all') {
      result = result.filter((item) => item.needType === categoryFilter);
    }

    // Filter by specific Wilaya
    if (selectedWilayaFilter !== 'all') {
      result = result.filter(
        (item) =>
          item.wilaya === selectedWilayaFilter ||
          item.wilaya?.padStart(2, '0') === selectedWilayaFilter.padStart(2, '0')
      );
    }

    // Sorting Modes
    if (sortBy === 'priority') {
      result.sort((a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
    } else {
      // Default: ولايتي أولاً ثم الولايات الأخرى
      result.sort((a, b) => {
        const aIsMyWilaya =
          a.wilaya === userWilayaCode ||
          a.wilaya?.padStart(2, '0') === userWilayaCode.padStart(2, '0');
        const bIsMyWilaya =
          b.wilaya === userWilayaCode ||
          b.wilaya?.padStart(2, '0') === userWilayaCode.padStart(2, '0');

        if (aIsMyWilaya && !bIsMyWilaya) return -1;
        if (!aIsMyWilaya && bIsMyWilaya) return 1;
        return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
      });
    }

    return result;
  }, [liveNeeds, categoryFilter, selectedWilayaFilter, sortBy, userWilayaCode]);

  // Needs count in user's wilaya today
  const myWilayaNeedsCount = useMemo(() => {
    return liveNeeds.filter(
      (n) =>
        n.wilaya === userWilayaCode ||
        n.wilaya?.padStart(2, '0') === userWilayaCode.padStart(2, '0')
    ).length;
  }, [liveNeeds, userWilayaCode]);

  // Handle Volunteering directly from card
  const handleVolunteerAction = async (need: NeedItem) => {
    const isVolunteered =
      Array.isArray(need.volunteers) &&
      ((currentUserId && need.volunteers.includes(currentUserId)) ||
        (userPhone && need.volunteers.includes(userPhone)));

    if (isVolunteered) {
      showAlert('إلغاء التطوع', 'هل تريد إلغاء تطوعك في هذا الاحتياج؟', [
        { text: 'تراجع', style: 'cancel' },
        {
          text: 'نعم، إلغاء التطوع',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoadingId(need.id);
              await cancelVolunteerForNeed(need.id, currentUserId);
              if (userPhone && userPhone !== currentUserId) {
                await cancelVolunteerForNeed(need.id, userPhone).catch(() => {});
              }
              setActionLoadingId(null);
              showAlert('تم', 'تم إلغاء تطوعك في هذه المهمة.');
            } catch (err: any) {
              setActionLoadingId(null);
              showAlert('خطأ', err?.message || 'تعذر إلغاء التطوع.');
            }
          },
        },
      ]);
      return;
    }

    // Checking if full -> register backup or normal
    if (need.volunteersCount >= need.quantity) {
      showAlert(
        'التسجيل في قائمة الاحتياط 🛡️',
        'اكتمل العدد المطلوب. هل تود التسجيل في القائمة الاحتياطية لتتم ترقيتك تلقائياً إذا شغر مقعد؟',
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'تأكيد',
            onPress: async () => {
              try {
                setActionLoadingId(need.id);
                const res = await volunteerToNeed(need.id, currentUserId);
                setActionLoadingId(null);
                showAlert('تم بنجاح ✓', res.message);
              } catch (err: any) {
                setActionLoadingId(null);
                showAlert('تنبيه', err?.message || 'تعذر إتمام العملية.');
              }
            },
          },
        ]
      );
      return;
    }

    // Register Volunteer
    try {
      setActionLoadingId(need.id);
      const res = await volunteerToNeed(need.id, currentUserId);
      setActionLoadingId(null);
      showAlert('تم بنجاح ✓', res.message);
    } catch (err: any) {
      setActionLoadingId(null);
      showAlert('تنبيه', err?.message || 'تعذر إتمام عملية التطوع.');
    }
  };

  // Handle Attendance confirmation for Next Task
  const handleConfirmAttendanceForNextTask = useCallback(async () => {
    if (!nextActiveTask) return;
    try {
      await confirmAttendanceForNeed(nextActiveTask.id, currentUserId);
      if (userPhone && userPhone !== currentUserId) {
        await confirmAttendanceForNeed(nextActiveTask.id, userPhone).catch(() => {});
      }
      showAlert('تم تأكيد الحضور ✓', 'تم تثبيت حضورك الميداني لهذه المهمة بنجاح!');
    } catch (err: any) {
      showAlert('خطأ', err?.message || 'تعذر تأكيد الحضور.');
    }
  }, [nextActiveTask, currentUserId, userPhone, showAlert]);

  const updateWilaya = useCallback(
    (newWilaya: string) => {
      const baseUser: AuthUser = user || {
        id: 'vol_' + Date.now(),
        phone: '',
        role: 'volunteer',
        name: volunteerName,
        token: 'token_vol',
        isActive: true,
        wilaya: '16',
      };
      useAuthStore.getState().setUser({ ...baseUser, wilaya: newWilaya });
    },
    [user, volunteerName]
  );

  const handleLocationPress = useCallback(() => {
    showAlert(
      'ولايتك الحالية',
      `أنت مسجل حالياً في ولاية: ${userWilayaInfo.name}\n\nيمكنك تبديل ولايتك لمشاهدة الاحتياجات القريبة منك:`,
      [
        { text: 'الجزائر (16)', onPress: () => updateWilaya('16') },
        { text: 'وهران (31)', onPress: () => updateWilaya('31') },
        { text: 'سطيف (19)', onPress: () => updateWilaya('19') },
        { text: 'قسنطينة (25)', onPress: () => updateWilaya('25') },
        { text: 'إلغاء', style: 'cancel' },
      ]
    );
  }, [userWilayaInfo.name, updateWilaya, showAlert]);

  const filteredWilayasList = useMemo(() => {
    if (!wilayaSearch.trim()) return WILAYAS;
    return WILAYAS.filter(
      (w) =>
        w.label.toLowerCase().includes(wilayaSearch.toLowerCase()) ||
        w.value.includes(wilayaSearch)
    );
  }, [wilayaSearch]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* TopBar with Dynamic Unread Notifications Count */}
      <TopBar
        notificationCount={unreadNotificationsCount}
        wilaya={userWilayaInfo.name}
        onNotificationPress={() => navigation?.navigate('Notifications')}
        onLocationPress={handleLocationPress}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <GreetingSection name={volunteerName} newNeedsCount={myWilayaNeedsCount} />

        {/* Real Dynamic Announcements Banner (Supervisor Upgrade, Crises, Attendance Reminders) */}
        {realAnnouncements.length > 0 && (
          <DynamicAnnouncementsBanner announcements={realAnnouncements} />
        )}

        {/* Real-time Dynamic Stats Row */}
        <StatsRow stats={liveStats} />

        {/* Needs Header */}
        <SectionHeader
          title="الاحتياجات والإعلانات المتاحة"
          actionLabel={`${displayedNeeds.length} احتياج`}
          onAction={() => {}}
        />

        {/* Sorting Control Tabs */}
        <View style={styles.sortContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortScroll}
          >
            <TouchableOpacity
              style={[styles.sortPill, sortBy === 'my_wilaya' && styles.sortPillActive]}
              onPress={() => setSortBy('my_wilaya')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="location"
                size={14}
                color={sortBy === 'my_wilaya' ? '#FFFFFF' : Colors.mainBlue}
              />
              <Text style={[styles.sortPillText, sortBy === 'my_wilaya' && styles.sortPillTextActive]}>
                ولايتي أولاً ({userWilayaInfo.name})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortPill, sortBy === 'priority' && styles.sortPillActive]}
              onPress={() => setSortBy('priority')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="alert-circle"
                size={14}
                color={sortBy === 'priority' ? '#FFFFFF' : '#E74C3C'}
              />
              <Text style={[styles.sortPillText, sortBy === 'priority' && styles.sortPillTextActive]}>
                حسب الأولوية (🔴 🟡 🟢)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortPill, sortBy === 'newest' && styles.sortPillActive]}
              onPress={() => setSortBy('newest')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="time-outline"
                size={14}
                color={sortBy === 'newest' ? '#FFFFFF' : Colors.textSecondary}
              />
              <Text style={[styles.sortPillText, sortBy === 'newest' && styles.sortPillTextActive]}>
                الأحدث
              </Text>
            </TouchableOpacity>

            {/* Filter by Wilaya Button */}
            <TouchableOpacity
              style={[
                styles.sortPill,
                selectedWilayaFilter !== 'all' && styles.sortPillActive,
              ]}
              onPress={() => setIsWilayaModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="filter"
                size={14}
                color={selectedWilayaFilter !== 'all' ? '#FFFFFF' : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.sortPillText,
                  selectedWilayaFilter !== 'all' && styles.sortPillTextActive,
                ]}
              >
                {selectedWilayaFilter === 'all'
                  ? 'تصفية بالولاية'
                  : `ولاية: ${selectedWilayaFilter}`}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Need Type Category Tabs */}
        <View style={styles.categoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORY_TABS.map((tab) => {
              const isActive = categoryFilter === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.catChip, isActive && styles.catChipActive]}
                  onPress={() => setCategoryFilter(tab.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.catChipText, isActive && styles.catChipTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Live Needs List */}
        {isLoadingNeeds ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primaryNavy} />
            <Text style={styles.loadingText}>جارِ تحميل الاحتياجات من Firestore...</Text>
          </View>
        ) : displayedNeeds.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="document-text-outline" size={48} color={Colors.placeholder} />
            <Text style={styles.emptyTitle}>لا توجد إعلانات مطابقة حالياً</Text>
            <Text style={styles.emptyDesc}>
              جرب تغيير خيارات التصفية أو اختر ولاية أخرى لاستكشاف الفرص الميدانية.
            </Text>
            {selectedWilayaFilter !== 'all' && (
              <TouchableOpacity
                style={styles.resetFilterBtn}
                onPress={() => setSelectedWilayaFilter('all')}
              >
                <Text style={styles.resetFilterText}>عرض جميع الولايات</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          displayedNeeds.map((need) => (
            <NeedCard
              key={need.id}
              need={need}
              currentUserId={currentUserId}
              isActionLoading={actionLoadingId === need.id}
              onPress={() => navigation?.navigate('NeedDetails', { need, id: need.id })}
              onVolunteerPress={() => handleVolunteerAction(need)}
            />
          ))
        )}

        {/* Map Preview */}
        <MapPreview
          markers={dynamicMarkers}
          onPress={() => navigation?.navigate('VolunteerMap')}
        />

        {/* Real Next Task Card if user has an active task */}
        {nextActiveTask && (
          <NextTaskCard
            task={{
              id: nextActiveTask.id,
              title: nextActiveTask.title,
              date: nextActiveTask.startDate || 'قريباً',
              time: nextActiveTask.wilayaName || nextActiveTask.locationDetails || '',
              duration: `${nextActiveTask.estimatedHours || 3} ساعات`,
            }}
            isConfirmed={Boolean(nextActiveTask.isAttendanceConfirmed)}
            onConfirm={handleConfirmAttendanceForNextTask}
            onViewDetails={() =>
              navigation?.navigate('NeedDetails', { id: nextActiveTask.id })
            }
          />
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Wilaya Filter Modal */}
      <Modal
        visible={isWilayaModalVisible}
        animationType="slide"
        onRequestClose={() => setIsWilayaModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setIsWilayaModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseText}>إغلاق</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>تصفية الإعلانات حسب الولاية</Text>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={Colors.placeholder} />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث باسم الولاية أو رقمها..."
              placeholderTextColor={Colors.placeholder}
              value={wilayaSearch}
              onChangeText={setWilayaSearch}
              textAlign="right"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.allWilayasItem,
              selectedWilayaFilter === 'all' && styles.allWilayasItemActive,
            ]}
            onPress={() => {
              setSelectedWilayaFilter('all');
              setIsWilayaModalVisible(false);
            }}
          >
            <Text
              style={[
                styles.allWilayasText,
                selectedWilayaFilter === 'all' && styles.allWilayasTextActive,
              ]}
            >
              🌐 جميع الولايات (عرض الكل)
            </Text>
          </TouchableOpacity>

          <FlatList
            data={filteredWilayasList}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => {
              const isSelected = selectedWilayaFilter === item.value;
              return (
                <TouchableOpacity
                  style={[styles.wilayaItem, isSelected && styles.wilayaItemSelected]}
                  onPress={() => {
                    setSelectedWilayaFilter(item.value);
                    setIsWilayaModalVisible(false);
                  }}
                >
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.mainBlue} />
                  )}
                  <Text
                    style={[
                      styles.wilayaItemText,
                      isSelected && styles.wilayaItemTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeScreen;

const getStyles = (Colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.pageBackground || Colors.background,
    },
    scrollContent: {
      paddingBottom: 24,
    },
    sortContainer: {
      marginBottom: 10,
    },
    sortScroll: {
      flexDirection: 'row-reverse',
      paddingHorizontal: 18,
      gap: 8,
    },
    sortPill: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      backgroundColor: Colors.surface,
      borderWidth: 1.5,
      borderColor: isDarkMode ? '#2D3748' : '#E5E7EB',
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 7,
      gap: 6,
    },
    sortPillActive: {
      backgroundColor: Colors.primaryNavy,
      borderColor: Colors.primaryNavy,
    },
    sortPillText: {
      fontSize: 12,
      fontWeight: '700',
      color: Colors.textSecondary,
    },
    sortPillTextActive: {
      color: '#FFFFFF',
    },
    categoryContainer: {
      marginBottom: 16,
    },
    categoryScroll: {
      flexDirection: 'row-reverse',
      paddingHorizontal: 18,
      gap: 8,
    },
    catChip: {
      backgroundColor: Colors.surface,
      borderWidth: 1.5,
      borderColor: isDarkMode ? '#2D3748' : '#E5E7EB',
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    catChipActive: {
      backgroundColor: Colors.mainBlue || '#2563EB',
      borderColor: Colors.mainBlue || '#2563EB',
    },
    catChipText: {
      fontSize: 12,
      fontWeight: '700',
      color: Colors.textSecondary,
    },
    catChipTextActive: {
      color: '#FFFFFF',
    },
    loadingBox: {
      paddingVertical: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 13,
      fontWeight: '600',
      color: Colors.textSecondary,
    },
    emptyBox: {
      paddingVertical: 40,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.surface,
      borderRadius: 20,
      marginHorizontal: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? '#2D3748' : '#F0EBE1',
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: Colors.primaryText,
      marginTop: 12,
      marginBottom: 6,
    },
    emptyDesc: {
      fontSize: 13,
      color: Colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
    resetFilterBtn: {
      marginTop: 14,
      backgroundColor: Colors.mainBlue || '#2563EB',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
    },
    resetFilterText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    bottomSpacer: {
      height: 40,
    },
    modalSafeArea: {
      flex: 1,
      backgroundColor: Colors.pageBackground || Colors.background,
    },
    modalHeader: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#2D3748' : '#E5E7EB',
      backgroundColor: Colors.surface,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: Colors.primaryText,
    },
    modalCloseBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6',
    },
    modalCloseText: {
      fontSize: 13,
      fontWeight: '700',
      color: Colors.primaryNavy,
    },
    searchBox: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      backgroundColor: Colors.surface,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginHorizontal: 16,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? '#2D3748' : '#E5E7EB',
      gap: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: Colors.primaryText,
    },
    allWilayasItem: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      backgroundColor: isDarkMode ? '#1E293B' : '#F0F9FF',
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? '#334155' : '#BAE6FD',
    },
    allWilayasItemActive: {
      backgroundColor: Colors.mainBlue || '#2563EB',
      borderColor: Colors.mainBlue || '#2563EB',
    },
    allWilayasText: {
      fontSize: 14,
      fontWeight: '800',
      color: Colors.mainBlue || '#0284C7',
      textAlign: 'right',
    },
    allWilayasTextActive: {
      color: '#FFFFFF',
    },
    wilayaItem: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 13,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#1E293B' : '#F3F4F6',
      backgroundColor: Colors.surface,
    },
    wilayaItemSelected: {
      backgroundColor: isDarkMode ? '#1E293B' : '#F0F9FF',
    },
    wilayaItemText: {
      fontSize: 14,
      color: Colors.primaryText,
      fontWeight: '600',
    },
    wilayaItemTextSelected: {
      fontWeight: '800',
      color: Colors.mainBlue || '#2563EB',
    },
  });
