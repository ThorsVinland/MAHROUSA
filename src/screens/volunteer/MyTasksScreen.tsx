// ============================================================
// src/screens/volunteer/MyTasksScreen.tsx
// Complete Volunteer Tasks Screen with Live Firestore Sync,
// Stats, Tabs, Actions, and Clean Architecture
// ============================================================

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAlert } from "../../context/AlertContext";
import { useAuthStore } from "../../store/authStore";
import { TaskTabType, VolunteerTaskItem, TaskStatsData } from "../../types/task.types";
import {
  subscribeToVolunteerTasks,
  markTaskAsCompleted,
  toggleTaskAttendance,
  withdrawFromTask,
} from "../../services/tasksService";
import { TaskStatsHeader } from "../../components/tasks/TaskStatsHeader";
import { VolunteerTaskCard } from "../../components/tasks/VolunteerTaskCard";
import { TasksEmptyState } from "../../components/tasks/TasksEmptyState";

interface Props {
  navigation: any;
}

export default function MyTasksScreen({ navigation }: Props) {
  const { colors: Colors, isDarkMode } = useTheme();
  const styles = useMemo(() => getStyles(Colors, isDarkMode), [Colors, isDarkMode]);
  const { showAlert } = useAlert();

  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id || user?.phone || "user_guest";
  const userPhone = user?.phone;

  const [tasks, setTasks] = useState<VolunteerTaskItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TaskTabType>("active");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // 1. الاشتراك اللحظي في مهام المتطوع من Firestore
  useEffect(() => {
    setIsLoading(true);

    const unsubscribe = subscribeToVolunteerTasks(
      currentUserId,
      userPhone,
      (fetchedTasks) => {
        setTasks(fetchedTasks);
        setIsLoading(false);
        setIsRefreshing(false);
      },
      (_err) => {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [currentUserId, userPhone]);

  // 2. تحديث السحب اليدوي
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // الاشتراك اللحظي يعيد التحديث تلقائياً، نضبط المؤقت لإنهاء المؤشر
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  // 3. حساب الإحصائيات (Stats)
  const stats: TaskStatsData = useMemo(() => {
    const activeTasks = tasks.filter((t) => !t.isCompletedByMe);
    const completedTasks = tasks.filter((t) => t.isCompletedByMe);
    const totalHours = completedTasks.reduce((acc, t) => acc + (t.estimatedHours || 3), 0);

    return {
      activeCount: activeTasks.length,
      completedCount: completedTasks.length,
      totalHours,
    };
  }, [tasks]);

  // 4. تصفية المهام حسب التبويب النشط
  const filteredTasks = useMemo(() => {
    switch (activeTab) {
      case "active":
        return tasks.filter((t) => !t.isCompletedByMe);
      case "completed":
        return tasks.filter((t) => t.isCompletedByMe);
      default:
        return tasks;
    }
  }, [tasks, activeTab]);

  // 5. إجراء إتمام المهمة
  const handleCompleteTask = useCallback(
    (task: VolunteerTaskItem) => {
      showAlert(
        "تأكيد إنجاز المهمة",
        `هل أتممت مهمة "${task.title}" الميدانية بنجاح؟`,
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "نعم، تم الإنجاز ✓",
            style: "default",
            onPress: async () => {
              try {
                setActionLoadingId(task.id);
                await markTaskAsCompleted(task.id, currentUserId, userPhone);
                setActionLoadingId(null);
                showAlert(
                  "بارك الله في جهودك 🌟",
                  "تم تسجيل إنجاز المهمة وتوثيق ساعاتك التطوعية في رصيد الأثر!"
                );
              } catch (err: any) {
                setActionLoadingId(null);
                showAlert("خطأ", err?.message || "تعذر إتمام المهمة، حاول مجدداً.");
              }
            },
          },
        ]
      );
    },
    [currentUserId, userPhone, showAlert]
  );

  // 6. إجراء تأكيد الحضور
  const handleToggleAttendance = useCallback(
    async (task: VolunteerTaskItem) => {
      try {
        const nextState = !task.isAttendanceConfirmed;
        await toggleTaskAttendance(task.id, currentUserId, nextState, userPhone);
      } catch (err: any) {
        showAlert("تنبيه", "تعذر تحديث حالة الحضور.");
      }
    },
    [currentUserId, userPhone, showAlert]
  );

  // 7. إجراء الاعتذار والانسحاب من المهمة
  const handleWithdrawTask = useCallback(
    (task: VolunteerTaskItem) => {
      showAlert(
        "اعتذار عن المهمة",
        `هل أنت متأكد من الاعتذار عن مهمة "${task.title}"؟ سيتم إتاحة مقعدك الميداني لمتطوع آخر.`,
        [
          { text: "تراجع", style: "cancel" },
          {
            text: "نعم، اعتذر",
            style: "destructive",
            onPress: async () => {
              try {
                setActionLoadingId(task.id);
                const res = await withdrawFromTask(task.id, currentUserId, userPhone);
                setActionLoadingId(null);
                showAlert("تم الإلغاء", res.message);
              } catch (err: any) {
                setActionLoadingId(null);
                showAlert("خطأ", err?.message || "تعذر الاعتذار عن المهمة.");
              }
            },
          },
        ]
      );
    },
    [currentUserId, userPhone, showAlert]
  );

  // 8. الانتقال للتفاصيل
  const handleViewDetails = useCallback(
    (task: VolunteerTaskItem) => {
      navigation?.navigate("NeedDetails", { need: task, id: task.id });
    },
    [navigation]
  );

  // 9. الانتقال للاستكشاف
  const handleExplore = useCallback(() => {
    navigation?.navigate("VolunteerHome");
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitles}>
          <Text style={styles.mainTitle}>مهامي التطوعية</Text>
          <Text style={styles.subTitle}>
            أهلاً {user?.name || "بالمتطوع"} • التزامك يصنع الفرق
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshIconBtn}
          onPress={handleRefresh}
          activeOpacity={0.7}
        >
          <Ionicons
            name="refresh-outline"
            size={20}
            color={Colors.mainBlue || "#2E86C1"}
          />
        </TouchableOpacity>
      </View>

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
        {/* Summary Stats Header */}
        <TaskStatsHeader stats={stats} />

        {/* Filter Tabs */}
        <View style={styles.tabsContainer}>
          {/* Tab 1: الجارية */}
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "active" && styles.tabBtnActive]}
            onPress={() => setActiveTab("active")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === "active" && styles.tabBtnTextActive,
              ]}
            >
              الجارية ({stats.activeCount})
            </Text>
          </TouchableOpacity>

          {/* Tab 2: المكتملة */}
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "completed" && styles.tabBtnActive]}
            onPress={() => setActiveTab("completed")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === "completed" && styles.tabBtnTextActive,
              ]}
            >
              المكتملة ({stats.completedCount})
            </Text>
          </TouchableOpacity>

          {/* Tab 3: الكل */}
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "all" && styles.tabBtnActive]}
            onPress={() => setActiveTab("all")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === "all" && styles.tabBtnTextActive,
              ]}
            >
              الكل ({tasks.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tasks List Content */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.mainBlue || "#2E86C1"} />
            <Text style={styles.loadingText}>جاري تحميل مهامك التطوعية...</Text>
          </View>
        ) : filteredTasks.length === 0 ? (
          <TasksEmptyState tab={activeTab} onExplore={handleExplore} />
        ) : (
          filteredTasks.map((task) => (
            <VolunteerTaskCard
              key={task.id}
              task={task}
              onComplete={handleCompleteTask}
              onToggleAttendance={handleToggleAttendance}
              onWithdraw={handleWithdrawTask}
              onViewDetails={handleViewDetails}
              isLoading={actionLoadingId === task.id}
            />
          ))
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
      flexDirection: "row-reverse",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 14,
      backgroundColor: Colors.pageBackground,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#2D3748" : "#F0EBE1",
    },
    headerTitles: {
      alignItems: "flex-end",
    },
    mainTitle: {
      fontSize: 22,
      fontWeight: "900",
      color: Colors.textPrimary,
      textAlign: "right",
    },
    subTitle: {
      fontSize: 12,
      fontWeight: "600",
      color: Colors.textSecondary,
      textAlign: "right",
      marginTop: 2,
    },
    refreshIconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDarkMode ? "#1C2F3D" : "#EBF5FB",
      alignItems: "center",
      justifyContent: "center",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    tabsContainer: {
      flexDirection: "row-reverse",
      backgroundColor: Colors.pageBackground,
      borderRadius: 14,
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 4,
      gap: 4,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 9,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
    },
    tabBtnActive: {
      backgroundColor: Colors.surface,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    tabBtnText: {
      fontSize: 13,
      fontWeight: "700",
      color: Colors.textSecondary,
    },
    tabBtnTextActive: {
      color: Colors.mainBlue || "#2E86C1",
      fontWeight: "900",
    },
    loadingBox: {
      paddingVertical: 60,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      fontSize: 13,
      fontWeight: "600",
      color: Colors.textSecondary,
      marginTop: 12,
    },
  });
