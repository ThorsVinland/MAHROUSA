// ============================================================
// src/types/notification.types.ts
// Strict TypeScript types for In-App Notifications & Announcements
// ============================================================

export type NotificationType =
  | 'supervisor_upgrade_approved' // تم قبول ترقية المشرف 🌟
  | 'supervisor_upgrade_rejected' // تم رفض طلب الترقية
  | 'backup_promoted'             // تم ترقيتك من الاحتياط إلى الأساسي 🛡️
  | 'attendance_reminder'         // تذكير بتأكيد الحضور خلال مهلة الساعة ⏳
  | 'urgent_need'                 // نداء طارئ أو أزمة عاجلة 🔴
  | 'need_registered'             // تأكيد التسجيل في احتياج
  | 'system';                     // إشعار نظام عام

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: any; // Timestamp or ISO string or number
  data?: {
    needId?: string;
    screen?: string;
    params?: Record<string, any>;
    priority?: string;
  };
}

export interface HomeAnnouncement {
  id: string;
  title: string;
  description: string;
  badge: string;
  badgeColor?: string;
  type: 'upgrade_approved' | 'urgent_crisis' | 'backup_promoted' | 'attendance_pending' | 'custom';
  actionText: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconName: string;
  onPress: () => void;
}
