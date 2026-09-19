// ============================================================
// src/screens/volunteer/HomeScreen.tsx
// Dynamic Volunteer Home Screen with Real-time Firestore Needs,
// Smart Sorting (My Wilaya First / By Priority / Newest),
// and Live Volunteer Counter (5/40) Sync
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
import { MapMarker } from '../../types/home.types';
import { AuthUser } from '../../types/auth.types';
import { NeedItem, NeedType, SortFilterOption } from '../../types/need.types';
import {
  VOLUNTEER_NAME,
  CURRENT_WILAYA,
  STATS,
  NEXT_TASK,
  MAP_MARKERS,
} from '../../data/homeMockData';
import { useAuthStore } from '../../store/authStore';
import { getWilayaInfo } from '../../utils/wilayaHelper';
import { WILAYAS } from '../../constants/algeria';
import { TopBar } from '../../components/home/TopBar';
import { GreetingSection } from '../../components/home/GreetingSection';
import { UrgentBanner } from '../../components/home/UrgentBanner';
import { StatsRow } from '../../components/home/StatsRow';
import { SectionHeader } from '../../components/home/SectionHeader';
import { NeedCard } from '../../components/home/NeedCard';
import { MapPreview } from '../../components/home/MapPreview';
import { NextTaskCard } from '../../components/home/NextTaskCard';
import {
  subscribeToAllNeeds,
  volunteerToNeed,
  cancelVolunteerForNeed,
} from '../../services/needsService';

interface NavigationProp {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
}

interface HomeScreenProps {
  navigation?: NavigationProp;
}

const CATEGORY_TABS: { id: string; label: string; icon?: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'يد عاملة', label: 'يد عاملة 👷' },
  { id: 'مقر تخزين', label: 'مقر تخزين 🏬' },
  { id: 'شاحنة', label: 'شاحنة 🚚' },
  { id: 'خبرة', label: 'خبرة 💡' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colors: Colors } = useTheme();
  const styles = useMemo(() => getStyles(Colors), [Colors]);
  const { showAlert } = useAlert();

  // Dynamic user data
  const user = useAuthStore((state) => state.user);
  const volunteerName = user?.name || VOLUNTEER_NAME;
  const userWilayaCode = user?.wilaya ? String(user.wilaya).padStart(2, '0') : CURRENT_WILAYA;
  const userWilayaInfo = useMemo(() => getWilayaInfo(userWilayaCode), [userWilayaCode]);
  const currentUserId = user?.id || user?.phone || 'user_guest';

  // State: Firestore Needs
  const [liveNeeds, setLiveNeeds] = useState<NeedItem[]>([]);
  const [isLoadingNeeds, setIsLoadingNeeds] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState<SortFilterOption>('my_wilaya');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedWilayaFilter, setSelectedWilayaFilter] = useState<string>('all');
  const [isWilayaModalVisible, setIsWilayaModalVisible] = useState(false);
  const [wilayaSearch, setWilayaSearch] = useState('');

  const [isAttendanceConfirmed, setIsAttendanceConfirmed] = useState(false);

  // 1. Subscribe to Firestore in real-time
  useEffect(() => {
    setIsLoadingNeeds(true);
    const unsubscribe = subscribeToAllNeeds(
      (items) => {
        setLiveNeeds(items);
        setIsLoadingNeeds(false);
      },
      (error) => {
        console.warn('Failed to fetch live needs:', error);
        setIsLoadingNeeds(false);
      }
    );
    return () => unsubscribe && unsubscribe();
  }, []);

  // 2. Dynamic map preview markers
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

  // 3. Priority weight for sorting: urgent (3) > medium (2) > normal (1)
  const getPriorityWeight = (priority: string): number => {
    if (priority === 'urgent') return 3;
    if (priority === 'medium' || priority === 'high') return 2;
    return 1;
  };

  // 4. Filter & Sort Logic as requested:
  // - Category filter
  // - Wilaya filter
  // - my_wilaya: user's wilaya first, then others underneath
  // - priority: Urgent (Red) -> Medium (Yellow) -> Normal (Green), regardless of wilaya
  // - newest: createdAt descending
  const displayedNeeds = useMemo(() => {
    let result = [...liveNeeds];

    // Filter by Category
    if (categoryFilter !== 'all') {
      result = result.filter((item) => item.needType === categoryFilter);
    }

    // Filter by specific Wilaya if selected
    if (selectedWilayaFilter !== 'all') {
      result = result.filter(
        (item) =>
          item.wilaya === selectedWilayaFilter ||
          item.wilaya?.padStart(2, '0') === selectedWilayaFilter.padStart(2, '0')
      );
    }

    // Sorting Modes
    if (sortBy === 'priority') {
      // فرز حسب الأولوية: الحمراء أولاً ثم الصفراء ثم الخضراء ولا يهم الولايات
      result.sort((a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority));
    } else if (sortBy === 'newest') {
      // فرز حسب الجديدة: الأحدث في الأعلى
      result.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
    } else {
      // Default: ولايتي أولاً ثم الولايات الأخرى تحتها
      result.sort((a, b) => {
        const aIsMyWilaya =
          a.wilaya === userWilayaCode ||
          a.wilaya?.padStart(2, '0') === userWilayaCode.padStart(2, '0');
        const bIsMyWilaya =
          b.wilaya === userWilayaCode ||
          b.wilaya?.padStart(2, '0') === userWilayaCode.padStart(2, '0');

        if (aIsMyWilaya && !bIsMyWilaya) return -1;
        if (!aIsMyWilaya && bIsMyWilaya) return 1;

        // If both in my wilaya or both outside, sort by priority
        return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
      });
    }

    return result;
  }, [liveNeeds, categoryFilter, selectedWilayaFilter, sortBy, userWilayaCode]);

  // Urgent item for the top banner
  const mostUrgentNeed = useMemo(() => {
    return liveNeeds.find((n) => n.priority === 'urgent');
  }, [liveNeeds]);

  // 5. Handle Volunteering directly from the card
  const handleVolunteerAction = async (need: NeedItem) => {
    const isVolunteered =
      Array.isArray(need.volunteers) && need.volunteers.includes(currentUserId);

    if (isVolunteered) {
      // Already volunteered -> prompt to cancel
      showAlert(
        'إلغاء التطوع',
        'هل تريد إلغاء تطوعك في هذا الاحتياج؟',
        [
          { text: 'تراجع', style: 'cancel' },
          {
            text: 'نعم، إلغاء التطوع',
            style: 'destructive',
            onPress: async () => {
              try {
                setActionLoadingId(need.id);
                await cancelVolunteerForNeed(need.id, currentUserId);
                setActionLoadingId(null);
                showAlert('تم', 'تم إلغاء تطوعك في هذه المهمة.');
              } catch (err: any) {
                setActionLoadingId(null);
                showAlert('خطأ', err?.message || 'تعذر إلغاء التطوع.');
              }
            },
          },
        ]
      );
      return;
    }

    // Checking if full
    if (need.volunteersCount >= need.quantity) {
      showAlert('عذراً', 'العدد المطلوب لهذا الاحتياج قد اكتمل بالفعل.');
      return;
    }

    // Register Volunteer
    try {
      setActionLoadingId(need.id);
      await volunteerToNeed(need.id, currentUserId);
      setActionLoadingId(null);
      showAlert('تم بنجاح ✓', 'شكراً لتطوعك! تم تسجيل اسمك وزيادة العدد.');
    } catch (err: any) {
      setActionLoadingId(null);
      showAlert('تنبيه', err?.message || 'تعذر إتمام عملية التطوع.');
    }
  };

  const handleConfirmAttendance = useCallback(() => {
    showAlert('تأكيد الحضور', 'هل أنت متأكد من حضورك لهذه المهمة؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'تأكيد ✓',
        onPress: () => {
          setIsAttendanceConfirmed(true);
          showAlert('تم بنجاح', 'تم تأكيد حضورك للمهمة. شكراً لتطوعك!');
        },
      },
    ]);
  }, [showAlert]);

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
      <TopBar
        notificationCount={3}
        wilaya={userWilayaInfo.name}
        onNotificationPress={() => navigation?.navigate('Notifications')}
        onLocationPress={handleLocationPress}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <GreetingSection name={volunteerName} newNeedsCount={liveNeeds.length} />

        {/* Urgent Banner from Real Firestore if exists */}
        {mostUrgentNeed && (
          <UrgentBanner
            title="احتياج عاجل 🔴"
            description={`${mostUrgentNeed.title} – ${mostUrgentNeed.wilayaName || mostUrgentNeed.wilaya}`}
            onPress={() => navigation?.navigate('NeedDetails', { need: mostUrgentNeed })}
          />
        )}

        <StatsRow stats={STATS} />

        {/* Needs Header */}
        <SectionHeader
          title="الاحتياجات والإعلانات المتاحة"
          actionLabel={`${displayedNeeds.length} احتياج`}
          onAction={() => {}}
        />

        {/* 1. Sorting Control Tabs (ولايتي أولاً / حسب الأولوية / الأحدث) */}
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

        {/* 2. Need Type Category Tabs (يد عاملة، مقر تخزين، شاحنة، خبرة) */}
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
              جرب تغيير خيارات التصفية أو قم بإضافة احتياج جديد من حساب الجمعية.
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
              onPress={() => navigation?.navigate('NeedDetails', { need })}
              onVolunteerPress={() => handleVolunteerAction(need)}
            />
          ))
        )}

        <MapPreview
          markers={dynamicMarkers}
          onPress={() => navigation?.navigate('VolunteerMap')}
        />

        <NextTaskCard
          task={NEXT_TASK}
          isConfirmed={isAttendanceConfirmed}
          onConfirm={handleConfirmAttendance}
          onViewDetails={() =>
            navigation?.navigate('TaskDetails', { id: NEXT_TASK.id })
          }
        />

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

const getStyles = (Colors: any) =>
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
      borderColor: '#E5E7EB',
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
      color: Colors.primaryText,
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
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    catChipActive: {
      backgroundColor: Colors.mainBlue,
      borderColor: Colors.mainBlue,
    },
    catChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: Colors.textSecondary,
    },
    catChipTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    loadingBox: {
      padding: 30,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      color: Colors.textSecondary,
      fontWeight: '600',
    },
    emptyBox: {
      backgroundColor: Colors.surface,
      marginHorizontal: 18,
      marginVertical: 14,
      padding: 24,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderStyle: 'dashed',
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: Colors.primaryText,
      marginTop: 10,
      marginBottom: 6,
    },
    emptyDesc: {
      fontSize: 13,
      color: Colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    resetFilterBtn: {
      marginTop: 14,
      backgroundColor: Colors.primaryNavy,
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 12,
    },
    resetFilterText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '700',
    },
    bottomSpacer: {
      height: 10,
    },
    modalSafeArea: {
      flex: 1,
      backgroundColor: '#F8F4EE',
    },
    modalHeader: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    modalCloseBtn: {
      padding: 6,
    },
    modalCloseText: {
      color: '#E74C3C',
      fontSize: 15,
      fontWeight: '700',
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: '#1A1A2E',
    },
    searchBox: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      margin: 14,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      gap: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 14,
    },
    allWilayasItem: {
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
      marginBottom: 4,
    },
    allWilayasItemActive: {
      backgroundColor: '#EBF5FB',
    },
    allWilayasText: {
      fontSize: 15,
      fontWeight: '700',
      color: Colors.primaryNavy,
      textAlign: 'right',
    },
    allWilayasTextActive: {
      color: Colors.mainBlue,
      fontWeight: '800',
    },
    wilayaItem: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: '#F0EBE1',
      backgroundColor: '#FFFFFF',
    },
    wilayaItemSelected: {
      backgroundColor: '#F0F8FF',
    },
    wilayaItemText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#1A1A2E',
    },
    wilayaItemTextSelected: {
      color: Colors.mainBlue,
      fontWeight: '800',
    },
  });
