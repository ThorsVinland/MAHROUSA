// ============================================================
// src/screens/common/NotificationsScreen.tsx
// Notifications Screen for Volunteers & Organizations
// Real-time crises alerts, resolved announcements, and personal updates
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import {
  subscribeToUserNotifications,
  AppNotification,
} from '../../services/notificationsService';

export default function NotificationsScreen({ navigation }: any) {
  const { colors: Colors, isDarkMode } = useTheme();
  const styles = React.useMemo(() => getStyles(Colors, isDarkMode), [Colors, isDarkMode]);
  const user = useAuthStore((s) => s.user);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToUserNotifications(
      user?.role || 'volunteer',
      user?.phone,
      (list) => {
        setNotifications(list);
        setLoading(false);
      }
    );

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [user?.role, user?.phone]);

  const formatTime = (ts: any) => {
    if (!ts) return 'الآن';
    try {
      const date = ts.toDate ? ts.toDate() : (ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts));
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 2) return 'الآن';
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      return date.toLocaleDateString('ar-DZ', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  const renderItem = ({ item }: { item: AppNotification }) => {
    const isCrisisAlert = item.type === 'crisis_alert';
    const isCrisisResolved = item.type === 'crisis_resolved';

    let iconName: any = 'notifications';
    let iconBg = '#EFF6FF';
    let iconColor = '#2563EB';
    let badgeText = 'إشعار';
    let badgeBg = '#EFF6FF';
    let badgeColor = '#2563EB';

    if (isCrisisAlert) {
      iconName = 'alert-circle';
      iconBg = '#FEE2E2';
      iconColor = '#DC2626';
      badgeText = '🚨 أزمة طارئة';
      badgeBg = '#FEE2E2';
      badgeColor = '#DC2626';
    } else if (isCrisisResolved) {
      iconName = 'checkmark-circle';
      iconBg = '#DCFCE7';
      iconColor = '#16A34A';
      badgeText = '✅ تم حل الأزمة';
      badgeBg = '#DCFCE7';
      badgeColor = '#16A34A';
    }

    return (
      <View
        style={[
          styles.notifCard,
          isCrisisAlert && styles.crisisCardBorder,
          isCrisisResolved && styles.resolvedCardBorder,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeText}</Text>
          </View>
          <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
        </View>

        <View style={styles.contentRow}>
          <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
            <Ionicons name={iconName} size={22} color={iconColor} />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.titleText}>{item.title}</Text>
            <Text style={styles.bodyText}>{item.body}</Text>
          </View>
        </View>

        {isCrisisAlert && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              const targetTab = user?.role === 'organization' ? 'OrgMap' : 'VolunteerMap';
              navigation.navigate(targetTab);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="map-outline" size={16} color="#DC2626" />
            <Text style={styles.actionBtnText}>عرض موقع الأزمة على الخريطة ←</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={24} color={Colors.primaryText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>مركز الإشعارات والتنبيهات</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.mainBlue} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="notifications-off-outline" size={36} color={Colors.placeholder} />
          </View>
          <Text style={styles.emptyTitle}>لا توجد إشعارات جديدة</Text>
          <Text style={styles.emptySub}>
            ستصلك هنا تنبيهات فورية عند حدوث أي أزمة طارئة أو تحديثات ميدانية.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (Colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.pageBackground,
    },
    header: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#27272A' : '#F1EFE9',
      backgroundColor: Colors.surface,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode ? '#27272A' : '#F4F2EC',
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: Colors.primaryText,
      fontFamily: 'Cairo-Bold',
    },
    listContent: {
      padding: 16,
      paddingBottom: 40,
      gap: 12,
    },
    notifCard: {
      backgroundColor: Colors.surface,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: isDarkMode ? '#27272A' : '#EAE6DC',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    crisisCardBorder: {
      borderColor: '#FCA5A5',
      backgroundColor: isDarkMode ? '#1F1315' : '#FFFBFB',
    },
    resolvedCardBorder: {
      borderColor: '#86EFAC',
      backgroundColor: isDarkMode ? '#131F16' : '#FBFFFC',
    },
    cardHeader: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '800',
    },
    timeText: {
      fontSize: 11,
      color: Colors.placeholder,
      fontWeight: '600',
    },
    contentRow: {
      flexDirection: 'row-reverse',
      alignItems: 'flex-start',
      gap: 12,
    },
    iconCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    textCol: {
      flex: 1,
    },
    titleText: {
      fontSize: 14.5,
      fontWeight: '800',
      color: Colors.primaryText,
      textAlign: 'right',
      marginBottom: 4,
      lineHeight: 20,
    },
    bodyText: {
      fontSize: 12.5,
      color: isDarkMode ? '#A1A1AA' : '#52525B',
      textAlign: 'right',
      lineHeight: 18,
    },
    actionBtn: {
      marginTop: 10,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: '#FEE2E2',
      borderRadius: 8,
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    actionBtnText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#DC2626',
    },
    centerContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    emptyIconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: isDarkMode ? '#27272A' : '#F4F2EC',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: Colors.primaryText,
      marginBottom: 6,
    },
    emptySub: {
      fontSize: 13,
      color: Colors.placeholder,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
