// ============================================================
// src/components/tasks/TaskStatsHeader.tsx
// Header stats summary card matching MAHROUSA design system
// ============================================================

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { TaskStatsData } from "../../types/task.types";

interface Props {
  stats: TaskStatsData;
}

export const TaskStatsHeader: React.FC<Props> = ({ stats }) => {
  const { colors: Colors, isDarkMode } = useTheme();
  const styles = React.useMemo(() => getStyles(Colors, isDarkMode), [Colors, isDarkMode]);

  return (
    <View style={styles.container}>
      {/* Stat 1: المهام الجارية */}
      <View style={[styles.statCard, styles.activeStatCard]}>
        <View style={styles.iconCircleActive}>
          <Ionicons name="time-outline" size={20} color={Colors.warning || "#E67E22"} />
        </View>
        <Text style={styles.statNumber}>{stats.activeCount}</Text>
        <Text style={styles.statLabel}>مهام جارية</Text>
      </View>

      {/* Stat 2: المهام المنجزة */}
      <View style={[styles.statCard, styles.completedStatCard]}>
        <View style={styles.iconCircleCompleted}>
          <Ionicons name="checkmark-done" size={20} color={Colors.success || "#27AE60"} />
        </View>
        <Text style={styles.statNumber}>{stats.completedCount}</Text>
        <Text style={styles.statLabel}>مهام منجزة</Text>
      </View>

      {/* Stat 3: ساعات التطوع الموثقة */}
      <View style={[styles.statCard, styles.hoursStatCard]}>
        <View style={styles.iconCircleHours}>
          <Ionicons name="ribbon-outline" size={20} color={Colors.primaryNavy || "#1A5276"} />
        </View>
        <Text style={styles.statNumber}>{stats.totalHours} س</Text>
        <Text style={styles.statLabel}>ساعات الأثر</Text>
      </View>
    </View>
  );
};

const getStyles = (Colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: "row-reverse",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      marginVertical: 14,
      gap: 10,
    },
    statCard: {
      flex: 1,
      backgroundColor: Colors.surface,
      borderRadius: 18,
      paddingVertical: 14,
      paddingHorizontal: 8,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: isDarkMode ? "#2D3748" : "#F0EBE1",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDarkMode ? 0.2 : 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    activeStatCard: {
      borderTopWidth: 3,
      borderTopColor: Colors.warning || "#E67E22",
    },
    completedStatCard: {
      borderTopWidth: 3,
      borderTopColor: Colors.success || "#27AE60",
    },
    hoursStatCard: {
      borderTopWidth: 3,
      borderTopColor: Colors.primaryNavy || "#1A5276",
    },
    iconCircleActive: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDarkMode ? "#3E2914" : "#FEF3C7",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 6,
    },
    iconCircleCompleted: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDarkMode ? "#1A3826" : "#DCFCE7",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 6,
    },
    iconCircleHours: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDarkMode ? "#1C2F3D" : "#EBF5FB",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 6,
    },
    statNumber: {
      fontSize: 18,
      fontWeight: "800",
      color: Colors.textPrimary,
      textAlign: "center",
    },
    statLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: Colors.textSecondary,
      marginTop: 2,
      textAlign: "center",
    },
  });
