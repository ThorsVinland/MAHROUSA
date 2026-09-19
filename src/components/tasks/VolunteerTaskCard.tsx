// ============================================================
// src/components/tasks/VolunteerTaskCard.tsx
// Comprehensive task card for volunteer with full action triggers
// ============================================================

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { VolunteerTaskItem } from "../../types/task.types";

interface Props {
  task: VolunteerTaskItem;
  onComplete: (task: VolunteerTaskItem) => void;
  onToggleAttendance: (task: VolunteerTaskItem) => void;
  onWithdraw: (task: VolunteerTaskItem) => void;
  onViewDetails: (task: VolunteerTaskItem) => void;
  isLoading?: boolean;
}

export const VolunteerTaskCard: React.FC<Props> = ({
  task,
  onComplete,
  onToggleAttendance,
  onWithdraw,
  onViewDetails,
  isLoading = false,
}) => {
  const { colors: Colors, isDarkMode } = useTheme();
  const styles = React.useMemo(() => getStyles(Colors, isDarkMode), [Colors, isDarkMode]);

  // الاتصال الهاتفي بالجمعية
  const handleCallOrg = () => {
    if (!task.organizationPhone) {
      Alert.alert("تنبيه", "رقم هاتف الجمعية غير متوفر حالياً.");
      return;
    }
    let phoneUrl = task.organizationPhone;
    if (phoneUrl.startsWith('+213+213')) {
      phoneUrl = phoneUrl.replace('+213+213', '+213');
    }
    Linking.openURL(`tel:${phoneUrl}`).catch(() => {
      Alert.alert("خطأ", "تعذر إجراء الاتصال الهاتفي.");
    });
  };

  // شارة الأولوية
  const priorityBadge = React.useMemo(() => {
    if (task.priority === "urgent") {
      return {
        label: "طارئ جداً",
        bgColor: isDarkMode ? "#3E1B1B" : "#FEE2E2",
        textColor: Colors.urgent || "#E74C3C",
      };
    }
    if (task.priority === "medium") {
      return {
        label: "متوسط الأولوية",
        bgColor: isDarkMode ? "#3D2E14" : "#FEF3C7",
        textColor: Colors.warning || "#E67E22",
      };
    }
    return {
      label: "عادي",
      bgColor: isDarkMode ? "#1A3826" : "#DCFCE7",
      textColor: Colors.success || "#27AE60",
    };
  }, [task.priority, Colors, isDarkMode]);

  const borderColor = task.isCompletedByMe
    ? (Colors.success || "#27AE60")
    : task.priority === "urgent"
    ? (Colors.urgent || "#E74C3C")
    : (Colors.mainBlue || "#2E86C1");

  return (
    <View style={[styles.card, { borderRightColor: borderColor }]}>
      {/* 1. Header Badges: Priority + Status + Need Type */}
      <View style={styles.headerRow}>
        <View style={styles.badgesContainer}>
          {/* Status Badge */}
          {task.isCompletedByMe ? (
            <View style={[styles.badge, styles.completedBadge]}>
              <Ionicons name="checkmark-circle" size={13} color="#27AE60" />
              <Text style={styles.completedBadgeText}>مكتملة بنجاح</Text>
            </View>
          ) : (
            <View style={[styles.badge, styles.inProgressBadge]}>
              <Ionicons name="time" size={13} color="#E67E22" />
              <Text style={styles.inProgressBadgeText}>قيد التنفيذ</Text>
            </View>
          )}

          {/* Priority Badge */}
          <View style={[styles.badge, { backgroundColor: priorityBadge.bgColor }]}>
            <Text style={[styles.badgeText, { color: priorityBadge.textColor }]}>
              {priorityBadge.label}
            </Text>
          </View>

          {/* Type Badge */}
          <View style={[styles.badge, styles.typeBadge]}>
            <Text style={styles.typeBadgeText}>{task.needType}</Text>
          </View>
        </View>

        {/* View Details Link */}
        <TouchableOpacity
          onPress={() => onViewDetails(task)}
          activeOpacity={0.7}
          style={styles.detailsBtn}
        >
          <Ionicons name="chevron-back" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* 2. Task Title */}
      <TouchableOpacity onPress={() => onViewDetails(task)} activeOpacity={0.85}>
        <Text style={styles.title}>{task.title}</Text>
      </TouchableOpacity>

      {/* 3. Organization Row */}
      <View style={styles.orgRow}>
        <View style={styles.orgInfo}>
          <View style={styles.orgIconBox}>
            <Ionicons name="business-outline" size={15} color={Colors.mainBlue} />
          </View>
          <Text style={styles.orgName} numberOfLines={1}>
            {task.organizationName || "جمعية معتمدة"}
          </Text>
        </View>

        {task.organizationPhone ? (
          <TouchableOpacity
            style={styles.callBtn}
            onPress={handleCallOrg}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={13} color="#FFFFFF" />
            <Text style={styles.callBtnText}>اتصال</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* 4. Location & Time Meta */}
      <View style={styles.metaBox}>
        {/* Location */}
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={15} color={Colors.textSecondary} />
          <Text style={styles.metaText} numberOfLines={1}>
            {task.wilayaName ? `${task.wilayaName} • ` : ""}
            {task.locationDetails || "المقر الميداني"}
          </Text>
        </View>

        {/* Time */}
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={15} color={Colors.textSecondary} />
          <Text style={styles.metaText}>
            {task.startDate ? `${task.startDate} ` : ""}
            {task.endDate ? `إلى ${task.endDate}` : ""}
            {task.estimatedHours ? ` (${task.estimatedHours} ساعات تطوعية)` : ""}
          </Text>
        </View>
      </View>

      {/* 5. Attendance Confirmation Toggle (Active tasks only) */}
      {!task.isCompletedByMe && (
        <TouchableOpacity
          style={[
            styles.attendanceToggle,
            task.isAttendanceConfirmed && styles.attendanceToggleActive,
          ]}
          onPress={() => onToggleAttendance(task)}
          activeOpacity={0.85}
        >
          <Ionicons
            name={task.isAttendanceConfirmed ? "checkmark-circle" : "ellipse-outline"}
            size={18}
            color={task.isAttendanceConfirmed ? "#27AE60" : Colors.textSecondary}
          />
          <Text
            style={[
              styles.attendanceToggleText,
              task.isAttendanceConfirmed && styles.attendanceToggleTextActive,
            ]}
          >
            {task.isAttendanceConfirmed
              ? "✓ تم تأكيد حضورك الميداني"
              : "اضغط لتأكيد جاهزيتك للحضور"}
          </Text>
        </TouchableOpacity>
      )}

      {/* 6. Footer Actions */}
      <View style={styles.footerRow}>
        {task.isCompletedByMe ? (
          <View style={styles.completedNoticeBox}>
            <Ionicons name="sparkles" size={16} color="#27AE60" />
            <Text style={styles.completedNoticeText}>
              بارك الله فيك! تم إنجاز المهمة وحساب الأثر
            </Text>
          </View>
        ) : (
          <>
            {/* Mark as Completed */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.completeBtn]}
              onPress={() => onComplete(task)}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
              <Text style={styles.completeBtnText}>تم الإنجاز ✓</Text>
            </TouchableOpacity>

            {/* Withdraw Button */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.withdrawBtn]}
              onPress={() => onWithdraw(task)}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <Ionicons name="close-circle-outline" size={15} color="#E74C3C" />
              <Text style={styles.withdrawBtnText}>اعتذار</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const getStyles = (Colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: Colors.surface,
      borderRadius: 20,
      borderRightWidth: 5,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? "#2D3748" : "#F0EBE1",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDarkMode ? 0.25 : 0.06,
      shadowRadius: 6,
      elevation: 3,
    },
    headerRow: {
      flexDirection: "row-reverse",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    badgesContainer: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 6,
      alignItems: "center",
    },
    badge: {
      flexDirection: "row-reverse",
      alignItems: "center",
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: "800",
    },
    completedBadge: {
      backgroundColor: isDarkMode ? "#1A3826" : "#DCFCE7",
    },
    completedBadgeText: {
      fontSize: 11,
      fontWeight: "800",
      color: "#27AE60",
    },
    inProgressBadge: {
      backgroundColor: isDarkMode ? "#3D2E14" : "#FEF3C7",
    },
    inProgressBadgeText: {
      fontSize: 11,
      fontWeight: "800",
      color: "#E67E22",
    },
    typeBadge: {
      backgroundColor: isDarkMode ? "#1C2F3D" : "#EBF5FB",
    },
    typeBadgeText: {
      fontSize: 11,
      fontWeight: "700",
      color: Colors.mainBlue || "#2E86C1",
    },
    detailsBtn: {
      padding: 4,
    },
    title: {
      fontSize: 16,
      fontWeight: "800",
      color: Colors.textPrimary,
      textAlign: "right",
      lineHeight: 23,
      marginBottom: 10,
    },
    orgRow: {
      flexDirection: "row-reverse",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 10,
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#2D3748" : "#F3EFE8",
    },
    orgInfo: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 8,
      flex: 1,
    },
    orgIconBox: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: isDarkMode ? "#1C2F3D" : "#EBF5FB",
      alignItems: "center",
      justifyContent: "center",
    },
    orgName: {
      fontSize: 13,
      fontWeight: "700",
      color: Colors.textPrimary,
      flex: 1,
      textAlign: "right",
    },
    callBtn: {
      flexDirection: "row-reverse",
      alignItems: "center",
      backgroundColor: Colors.mainBlue || "#2E86C1",
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
      gap: 4,
    },
    callBtnText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "800",
    },
    metaBox: {
      backgroundColor: isDarkMode ? "#171F2A" : "#FAF8F5",
      borderRadius: 12,
      padding: 10,
      gap: 6,
      marginBottom: 12,
    },
    metaRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 6,
    },
    metaText: {
      fontSize: 12,
      fontWeight: "600",
      color: Colors.textSecondary,
      flex: 1,
      textAlign: "right",
    },
    attendanceToggle: {
      flexDirection: "row-reverse",
      alignItems: "center",
      backgroundColor: isDarkMode ? "#1A222C" : "#F8F6F2",
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 9,
      gap: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? "#2A3644" : "#EBE6DC",
    },
    attendanceToggleActive: {
      backgroundColor: isDarkMode ? "#142E20" : "#EDFDF4",
      borderColor: isDarkMode ? "#215335" : "#B2F2D1",
    },
    attendanceToggleText: {
      fontSize: 12,
      fontWeight: "700",
      color: Colors.textSecondary,
    },
    attendanceToggleTextActive: {
      color: "#27AE60",
    },
    footerRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 10,
    },
    actionBtn: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      height: 42,
      gap: 6,
    },
    completeBtn: {
      flex: 2,
      backgroundColor: Colors.success || "#27AE60",
      shadowColor: "#27AE60",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    completeBtnText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "800",
    },
    withdrawBtn: {
      flex: 1,
      backgroundColor: isDarkMode ? "#3D1B1B" : "#FEE2E2",
      borderWidth: 1,
      borderColor: isDarkMode ? "#5A2626" : "#FCA5A5",
    },
    withdrawBtnText: {
      color: "#E74C3C",
      fontSize: 12,
      fontWeight: "800",
    },
    completedNoticeBox: {
      flex: 1,
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDarkMode ? "#163121" : "#EDFDF4",
      borderRadius: 12,
      paddingVertical: 10,
      gap: 6,
    },
    completedNoticeText: {
      fontSize: 12,
      fontWeight: "800",
      color: "#27AE60",
    },
  });
