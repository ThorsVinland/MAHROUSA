// ============================================================
// src/components/tasks/TasksEmptyState.tsx
// Visual empty state component for MyTasksScreen
// ============================================================

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { TaskTabType } from "../../types/task.types";

interface Props {
  tab: TaskTabType;
  onExplore: () => void;
}

export const TasksEmptyState: React.FC<Props> = ({ tab, onExplore }) => {
  const { colors: Colors, isDarkMode } = useTheme();
  const styles = React.useMemo(() => getStyles(Colors, isDarkMode), [Colors, isDarkMode]);

  const config = React.useMemo(() => {
    switch (tab) {
      case "active":
        return {
          icon: "calendar-outline" as const,
          title: "لا توجد مهام جارية حالياً",
          desc: "إخوانك في الميدان بانتظار مساهمتك! استكشف الاحتياجات العاجلة وانضم لفريق المتطوعين.",
          btnText: "استكشف الاحتياجات وتطوع الآن 🚀",
        };
      case "completed":
        return {
          icon: "trophy-outline" as const,
          title: "سجل المهام المنجزة فارغ",
          desc: "أنجز مهامك التطوعية الجارية واضغط على تم الإنجاز لتخليد أثرك وساعاتك التطوعية هنا.",
          btnText: "الانتقال إلى المهام الجارية",
        };
      default:
        return {
          icon: "hand-left-outline" as const,
          title: "لم تنضم لأي مهمة تطوعية بعد",
          desc: "تطبيق محروسة يربطك بأقرب الجمعيات وحملات الإغاثة في ولايتك. ابدأ أثرك اليوم!",
          btnText: "تصفح الخريطة والاحتياجات 📍",
        };
    }
  }, [tab]);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={config.icon} size={44} color={Colors.mainBlue || "#2E86C1"} />
      </View>
      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.desc}>{config.desc}</Text>

      <TouchableOpacity
        style={styles.actionBtn}
        onPress={onExplore}
        activeOpacity={0.85}
      >
        <Text style={styles.actionBtnText}>{config.btnText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (Colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 28,
      paddingVertical: 45,
    },
    iconCircle: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: isDarkMode ? "#1C2F3D" : "#EBF5FB",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18,
    },
    title: {
      fontSize: 18,
      fontWeight: "800",
      color: Colors.textPrimary,
      textAlign: "center",
      marginBottom: 8,
    },
    desc: {
      fontSize: 13,
      fontWeight: "500",
      color: Colors.textSecondary,
      textAlign: "center",
      lineHeight: 21,
      marginBottom: 24,
    },
    actionBtn: {
      backgroundColor: Colors.mainBlue || "#2E86C1",
      borderRadius: 14,
      paddingHorizontal: 22,
      paddingVertical: 13,
      shadowColor: Colors.mainBlue,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 3,
    },
    actionBtnText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "800",
      textAlign: "center",
    },
  });
