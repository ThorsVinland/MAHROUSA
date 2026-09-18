// ============================================================
// src/screens/volunteer/HomeScreen.tsx
// Dynamic Volunteer Home Screen matching user registration profile
// ============================================================

import React, { useState, useMemo, useCallback } from 'react';
import { ScrollView, StyleSheet, Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { FilterType, MapMarker } from '../../types/home.types';
import { AuthUser } from '../../types/auth.types';
import {
  VOLUNTEER_NAME,
  NEW_NEEDS_COUNT,
  CURRENT_WILAYA,
  STATS,
  NEEDS,
  NEXT_TASK,
  MAP_MARKERS,
} from '../../data/homeMockData';
import { useAuthStore } from '../../store/authStore';
import { getWilayaInfo } from '../../utils/wilayaHelper';
import { TopBar } from '../../components/home/TopBar';
import { GreetingSection } from '../../components/home/GreetingSection';
import { UrgentBanner } from '../../components/home/UrgentBanner';
import { StatsRow } from '../../components/home/StatsRow';
import { SectionHeader } from '../../components/home/SectionHeader';
import { FilterChips } from '../../components/home/FilterChips';
import { NeedCard } from '../../components/home/NeedCard';
import { MapPreview } from '../../components/home/MapPreview';
import { NextTaskCard } from '../../components/home/NextTaskCard';

interface NavigationProp {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
}

interface HomeScreenProps {
  navigation?: NavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colors: Colors } = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isAttendanceConfirmed, setIsAttendanceConfirmed] = useState(false);

  // Dynamic user data from registration/auth store
  const user = useAuthStore((state) => state.user);
  const volunteerName = user?.name || VOLUNTEER_NAME;
  const userWilayaInfo = useMemo(
    () => getWilayaInfo(user?.wilaya || CURRENT_WILAYA),
    [user?.wilaya]
  );

  // Dynamic map preview markers reflecting volunteer's registered Wilaya
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

  const filteredNeeds = useMemo(() => {
    switch (activeFilter) {
      case 'urgent':
        return NEEDS.filter((n) => n.priority === 'urgent');
      case 'labor':
        return NEEDS.filter((n) => n.priority === 'high');
      case 'resources':
        return NEEDS.filter((n) => n.priority === 'summer_camp');
      default:
        return NEEDS;
    }
  }, [activeFilter]);

  const handleConfirmAttendance = useCallback(() => {
    Alert.alert('تأكيد الحضور', 'هل أنت متأكد من حضورك لهذه المهمة؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'تأكيد ✓',
        onPress: () => {
          setIsAttendanceConfirmed(true);
          Alert.alert('تم بنجاح', 'تم تأكيد حضورك للمهمة. شكراً لتطوعك!');
        },
      },
    ]);
  }, []);

  const updateWilaya = useCallback(
    (newWilaya: string) => {
      const baseUser: AuthUser = user || {
        id: 'vol_' + Date.now(),
        phone: '',
        role: 'volunteer',
        name: volunteerName,
        token: 'token_vol',
        isActive: true, wilaya: '31',
      };
      useAuthStore.getState().setUser({ ...baseUser, wilaya: newWilaya });
    },
    [user, volunteerName]
  );

  const handleLocationPress = useCallback(() => {
    Alert.alert(
      'ولايتك الحالية',
      `أنت مسجل حالياً في ولاية: ${userWilayaInfo.name}\n\nيمكنك تبديل الولاية للاستكشاف:`,
      [
        { text: 'الجزائر (16)', onPress: () => updateWilaya('16') },
        { text: 'وهران (31)', onPress: () => updateWilaya('31') },
        { text: 'سطيف (19)', onPress: () => updateWilaya('19') },
        { text: 'إلغاء', style: 'cancel' },
      ]
    );
  }, [userWilayaInfo, updateWilaya]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
        <GreetingSection
          name={volunteerName}
          newNeedsCount={NEW_NEEDS_COUNT}
        />

        <UrgentBanner
          title="احتياج عاجل"
          description="شاحنة نقل مطلوبة الآن – بجاية"
          onPress={() => navigation?.navigate('NeedDetails', { id: '1' })}
        />

        <StatsRow stats={STATS} />

        <SectionHeader
          title="الاحتياجات القريبة منك"
          actionLabel="← عرض الكل"
          onAction={() => navigation?.navigate('AllNeeds')}
        />

        <FilterChips
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {filteredNeeds.map((need) => (
          <NeedCard
            key={need.id}
            need={need}
            onPress={() => navigation?.navigate('NeedDetails', { id: need.id })}
          />
        ))}

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
    </SafeAreaView>
  );
};

export default HomeScreen;

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  bottomSpacer: {
    height: 10,
  },
});
