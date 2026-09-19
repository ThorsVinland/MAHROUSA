// ============================================================
// src/components/home/BottomNavBar.tsx
// Fixed Bottom Navigation Bar matching MAHROUSA design
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { HomeTabType } from '../../types/home.types';

interface BottomNavBarProps {
  activeTab: HomeTabType;
  onTabChange?: (tab: HomeTabType) => void;
  tasksBadgeCount?: number;
  isSupervisor?: boolean;
  labels?: {
    home: string;
    map: string;
    tasks: string;
    supervisor: string;
    profile: string;
  };
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  tasksBadgeCount = 0,
  isSupervisor = false,
  labels = {
    home: 'الرئيسية',
    map: 'الخريطة',
    tasks: 'مهامي',
    supervisor: 'لوحتي',
    profile: 'حسابي',
  },
}) => {
  const { colors: Colors } = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      <View style={styles.container}>
        {/* TAB 1: Home / الرئيسية (Rightmost in RTL) */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onTabChange?.('home')}
          activeOpacity={0.8}
        >
          {activeTab === 'home' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeTab === 'home' ? 'home' : 'home-outline'}
            size={23}
            color={activeTab === 'home' ? Colors.mainBlue : Colors.placeholder}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'home' && styles.activeTabLabel,
            ]}
          >
            {labels.home}
          </Text>
        </TouchableOpacity>

        {/* TAB 2: Map / الخريطة */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onTabChange?.('map')}
          activeOpacity={0.8}
        >
          {activeTab === 'map' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeTab === 'map' ? 'map' : 'map-outline'}
            size={23}
            color={activeTab === 'map' ? Colors.mainBlue : Colors.placeholder}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'map' && styles.activeTabLabel,
            ]}
          >
            {labels.map}
          </Text>
        </TouchableOpacity>

        {/* TAB 3: Tasks / مهامي (With Badge) */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onTabChange?.('tasks')}
          activeOpacity={0.8}
        >
          {activeTab === 'tasks' && <View style={styles.activeIndicator} />}
          <View style={styles.iconWrapper}>
            <Ionicons
              name={
                activeTab === 'tasks'
                  ? 'checkmark-circle'
                  : 'checkmark-circle-outline'
              }
              size={23}
              color={
                activeTab === 'tasks' ? Colors.mainBlue : Colors.placeholder
              }
            />
            {tasksBadgeCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{tasksBadgeCount}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'tasks' && styles.activeTabLabel,
            ]}
          >
            {labels.tasks}
          </Text>
        </TouchableOpacity>

        {/* TAB 4: Supervisor (Optional) */}
        {isSupervisor && (
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => onTabChange?.('supervisor')}
            activeOpacity={0.8}
          >
            {activeTab === 'supervisor' && <View style={styles.activeIndicator} />}
            <Ionicons
              name={activeTab === 'supervisor' ? 'speedometer' : 'speedometer-outline'}
              size={23}
              color={activeTab === 'supervisor' ? Colors.mainBlue : Colors.placeholder}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'supervisor' && styles.activeTabLabel,
              ]}
            >
              {labels.supervisor}
            </Text>
          </TouchableOpacity>
        )}

        {/* TAB 5: Profile / حسابي (Leftmost in RTL) */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onTabChange?.('profile')}
          activeOpacity={0.8}
        >
          {activeTab === 'profile' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeTab === 'profile' ? 'person' : 'person-outline'}
            size={23}
            color={
              activeTab === 'profile' ? Colors.mainBlue : Colors.placeholder
            }
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'profile' && styles.activeTabLabel,
            ]}
          >
            {labels.profile}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#F0EBE1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  container: {
    flexDirection: 'row-reverse',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    gap: 3,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 44,
    height: 3,
    backgroundColor: Colors.mainBlue,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -7,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: Colors.primaryNavy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.placeholder,
  },
  activeTabLabel: {
    color: Colors.mainBlue,
    fontWeight: '800',
  },
});
