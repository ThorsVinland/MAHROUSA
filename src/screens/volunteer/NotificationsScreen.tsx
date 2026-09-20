// ============================================================
// src/screens/volunteer/NotificationsScreen.tsx
// In-App Notifications Screen with Real-time Firestore Sync,
// Unread Highlight Badges, Filter Tabs, and Action Navigation
// ============================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { AppNotification, NotificationType } from '../../types/notification.types';
import {
  subscribeToUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from '../../services/notificationService';

interface Props {
  navigation: any;
}

export default function NotificationsScreen({ navigation }: Props) {
  const { colors: Colors, isDarkMode } = useTheme();
  const styles = useMemo(() => getStyles(Colors, isDarkMode), [Colors, isDarkMode]);
  const user = useAuthStore((state) => state.user);
  const userPhone = user?.phone || user?.id || '';

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  // Real-time Firestore Subscription
  useEffect(() => {
    if (!userPhone) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToUserNotifications(
      userPhone,
      (list) => {
        setNotifications(list);
        setIsLoading(false);
        setIsRefreshing(false);
      },
      () => {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [userPhone]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const displayedNotifications = useMemo(() => {
    if (activeFilter === 'unread') {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, activeFilter]);

  // Handle click on notification card
  const handleNotificationPress = async (item: AppNotification) => {
    if (!item.isRead && userPhone) {
      await markNotificationAsRead(userPhone, item.id);
    }

    // Navigation logic based on notification data/type
    if (
      item.data?.screen === 'SupervisorDashboard' ||
      item.type === 'supervisor_upgrade_approved'
    ) {
      try {
        navigation.navigate('SupervisorDashboard');
      } catch {
        navigation.navigate('VolunteerMain', { screen: 'SupervisorDashboard' });
      }
    } else if (item.data?.screen === 'NeedDetails' || item.data?.needId || item.type === 'backup_promoted') {
      const needId = item.data?.needId;
      if (needId) {
        navigation.navigate('NeedDetails', { id: needId });
      }
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!userPhone || unreadCount === 0) return;
    await markAllNotificationsAsRead(userPhone);
  };

  // Delete single notification
  const handleDelete = (item: AppNotification) => {
    if (!userPhone) return;
    deleteNotification(userPhone, item.id);
  };

  // Clear all
  const handleClearAll = () => {
    if (!userPhone || notifications.length === 0) return;
    Alert.alert(
      'مسح جميع الإشعارات',
      'هل أنت متأكد من رغبتك في حذف كافة الإشعارات؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'مسح الكل',
          style: 'destructive',
          onPress: () => clearAllNotifications(userPhone),
        },
      ]
    );
  };

  // Format relative time helper
  const formatTime = (createdAt: any) => {
    if (!createdAt) return 'الآن';
    let timeMs = 0;
    if (createdAt.seconds) {
      timeMs = createdAt.seconds * 1000;
    } else if (typeof createdAt === 'number') {
      timeMs = createdAt;
    } else if (typeof createdAt === 'string') {
      timeMs = new Date(createdAt).getTime();
    }
    if (!timeMs) return 'الآن';

    const diffMs = Date.now() - timeMs;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays === 1) return 'أمس';
    return `منذ ${diffDays} أيام`;
  };

  // Icon & Theme Configuration per Notification Type
  const getTypeConfig = (type: NotificationType) => {
    switch (type) {
      case 'supervisor_upgrade_approved':
        return {
          icon: 'ribbon',
          color: '#8B5CF6',
          bg: isDarkMode ? '#2D1B4E' : '#F5F3FF',
          badgeText: 'ترقية مشرف 🌟',
        };
      case 'backup_promoted':
        return {
          icon: 'shield-checkmark',
          color: '#10B981',
          bg: isDarkMode ? '#133829' : '#ECFDF5',
          badgeText: 'ترقية من الاحتياط 🛡️',
        };
      case 'attendance_reminder':
        return {
          icon: 'time',
          color: '#F59E0B',
          bg: isDarkMode ? '#3B2D12' : '#FFFBEB',
          badgeText: 'تأكيد الحضور ⏳',
        };
      case 'urgent_need':
        return {
          icon: 'alert-circle',
          color: '#EF4444',
          bg: isDarkMode ? '#3B1717' : '#FEF2F2',
          badgeText: 'نداء عاجل 🔴',
        };
      case 'need_registered':
        return {
          icon: 'checkmark-circle',
          color: '#3B82F6',
          bg: isDarkMode ? '#172554' : '#EFF6FF',
          badgeText: 'تسجيل تطوع ✓',
        };
      case 'system':
      default:
        return {
          icon: 'notifications',
          color: '#0284C7',
          bg: isDarkMode ? '#082F49' : '#F0F9FF',
          badgeText: 'تنبيه نظام 📢',
        };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-forward" size={20} color={Colors.primaryText} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>الإشعارات والتنبيهات</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount} جديد</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 ? (
          <TouchableOpacity
            style={styles.markReadBtn}
            onPress={handleMarkAllAsRead}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-done" size={18} color={Colors.mainBlue || '#2563EB'} />
            <Text style={styles.markReadBtnText}>قراءة الكل</Text>
          </TouchableOpacity>
        ) : notifications.length > 0 ? (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClearAll}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabChip, activeFilter === 'all' && styles.tabChipActive]}
          onPress={() => setActiveFilter('all')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabChipText, activeFilter === 'all' && styles.tabChipTextActive]}>
            الكل ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabChip, activeFilter === 'unread' && styles.tabChipActive]}
          onPress={() => setActiveFilter('unread')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabChipText, activeFilter === 'unread' && styles.tabChipTextActive]}>
            غير مقروءة ({unreadCount})
          </Text>
          {unreadCount > 0 && <View style={styles.tabDot} />}
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.mainBlue}
            colors={[Colors.mainBlue]}
          />
        }
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primaryNavy} />
            <Text style={styles.loadingText}>جارِ تحميل الإشعارات...</Text>
          </View>
        ) : displayedNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="notifications-off-outline"
                size={44}
                color={Colors.placeholder || '#9CA3AF'}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {activeFilter === 'unread'
                ? 'لا توجد إشعارات غير مقروءة'
                : 'لا توجد إشعارات حالياً'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'unread'
                ? 'لقد قمت بقراءة جميع الإشعارات والتنبيهات الميدانية.'
                : 'ستصلك هنا كافة التنبيهات المباشرة وترقيات المهام وتأكيدات الحضور.'}
            </Text>
          </View>
        ) : (
          displayedNotifications.map((item) => {
            const config = getTypeConfig(item.type);
            const isUnread = !item.isRead;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  isUnread ? styles.cardUnread : styles.cardRead,
                ]}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.85}
              >
                {/* Visual Indicator on the Side for Unread */}
                {isUnread && <View style={[styles.unreadStripe, { backgroundColor: config.color }]} />}

                <View style={styles.cardInner}>
                  {/* Top Row: Type Pill + Timestamp + Delete */}
                  <View style={styles.cardHeaderRow}>
                    <TouchableOpacity
                      style={styles.cardDeleteBtn}
                      onPress={() => handleDelete(item)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close" size={16} color={Colors.placeholder || '#9CA3AF'} />
                    </TouchableOpacity>

                    <Text style={styles.cardTimeText}>{formatTime(item.createdAt)}</Text>

                    <View style={[styles.typePill, { backgroundColor: config.bg }]}>
                      <Ionicons name={config.icon as any} size={13} color={config.color} />
                      <Text style={[styles.typePillText, { color: config.color }]}>
                        {config.badgeText}
                      </Text>
                    </View>
                  </View>

                  {/* Body Content */}
                  <View style={styles.cardContentRow}>
                    <View style={styles.textColumn}>
                      <View style={styles.titleRow}>
                        {isUnread && <View style={styles.unreadDot} />}
                        <Text
                          style={[
                            styles.cardTitle,
                            isUnread ? styles.cardTitleUnread : styles.cardTitleRead,
                          ]}
                        >
                          {item.title}
                        </Text>
                      </View>
                      <Text style={styles.cardBody} numberOfLines={3}>
                        {item.body}
                      </Text>
                    </View>

                    {/* Icon Box */}
                    <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
                      <Ionicons name={config.icon as any} size={22} color={config.color} />
                    </View>
                  </View>

                  {/* Action Link Footer if applicable */}
                  {(item.data?.screen || item.data?.needId || item.type === 'supervisor_upgrade_approved' || item.type === 'backup_promoted') && (
                    <View style={styles.cardFooterRow}>
                      <Ionicons name="chevron-back" size={14} color={Colors.mainBlue || '#2563EB'} />
                      <Text style={styles.cardActionText}>
                        {item.type === 'supervisor_upgrade_approved'
                          ? 'فتح لوحة تحكم المشرف'
                          : item.type === 'backup_promoted'
                          ? 'عرض المهمة وتأكيد الحضور'
                          : 'عرض التفاصيل الميدانية'}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (Colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: Colors.pageBackground || Colors.background,
    },
    header: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingVertical: 12,
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
      borderColor: isDarkMode ? '#2D3748' : '#E5E7EB',
    },
    headerTitleContainer: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: Colors.primaryText,
    },
    headerBadge: {
      backgroundColor: '#EF4444',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    headerBadgeText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '800',
    },
    markReadBtn: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: isDarkMode ? '#1E293B' : '#EFF6FF',
    },
    markReadBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: Colors.mainBlue || '#2563EB',
    },
    clearBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tabsRow: {
      flexDirection: 'row-reverse',
      paddingHorizontal: 18,
      paddingVertical: 10,
      gap: 10,
      backgroundColor: Colors.surface,
    },
    tabChip: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 16,
      backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6',
      gap: 6,
    },
    tabChipActive: {
      backgroundColor: Colors.primaryNavy || '#1E3A8A',
    },
    tabChipText: {
      fontSize: 13,
      fontWeight: '700',
      color: Colors.textSecondary,
    },
    tabChipTextActive: {
      color: '#FFFFFF',
    },
    tabDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#EF4444',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 36,
    },
    centerContainer: {
      paddingVertical: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      fontSize: 14,
      color: Colors.textSecondary,
      marginTop: 12,
      fontWeight: '600',
    },
    emptyContainer: {
      paddingVertical: 60,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: Colors.primaryText,
      textAlign: 'center',
      marginBottom: 6,
    },
    emptySubtitle: {
      fontSize: 13,
      color: Colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    card: {
      borderRadius: 18,
      marginBottom: 12,
      overflow: 'hidden',
      borderWidth: 1.5,
      position: 'relative',
    },
    cardUnread: {
      backgroundColor: isDarkMode ? '#172033' : '#F8FAFC',
      borderColor: isDarkMode ? '#2563EB' : '#93C5FD',
      shadowColor: '#2563EB',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    cardRead: {
      backgroundColor: Colors.surface,
      borderColor: isDarkMode ? '#2D3748' : '#F0EBE1',
      opacity: 0.9,
    },
    unreadStripe: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      width: 5,
    },
    cardInner: {
      padding: 14,
      paddingRight: 16,
    },
    cardHeaderRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    typePill: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      paddingHorizontal: 9,
      paddingVertical: 3.5,
      borderRadius: 10,
      gap: 5,
    },
    typePillText: {
      fontSize: 11,
      fontWeight: '800',
    },
    cardTimeText: {
      fontSize: 11,
      color: Colors.placeholder || '#9CA3AF',
      fontWeight: '600',
      marginRight: 'auto',
      marginLeft: 10,
    },
    cardDeleteBtn: {
      padding: 4,
    },
    cardContentRow: {
      flexDirection: 'row-reverse',
      alignItems: 'flex-start',
      gap: 12,
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
    },
    textColumn: {
      flex: 1,
      alignItems: 'flex-end',
    },
    titleRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#2563EB',
    },
    cardTitle: {
      fontSize: 15,
      color: Colors.primaryText,
      textAlign: 'right',
    },
    cardTitleUnread: {
      fontWeight: '900',
      color: Colors.primaryText,
    },
    cardTitleRead: {
      fontWeight: '700',
      color: Colors.textSecondary,
    },
    cardBody: {
      fontSize: 13,
      color: Colors.textSecondary,
      textAlign: 'right',
      lineHeight: 19,
    },
    cardFooterRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 4,
      marginTop: 10,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? '#2D3748' : '#F1F5F9',
    },
    cardActionText: {
      fontSize: 12,
      fontWeight: '800',
      color: Colors.mainBlue || '#2563EB',
    },
  });
