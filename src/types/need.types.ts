// ============================================================
// src/types/need.types.ts
// Strict TypeScript types for Mahrousa Needs & Announcements
// ============================================================

export type NeedType = 'يد عاملة' | 'مقر تخزين' | 'شاحنة' | 'خبرة';

export type PriorityLevel = 'urgent' | 'medium' | 'normal';

export interface NeedItem {
  id: string;
  title: string;
  needType: NeedType;
  quantity: number; // عدد الأشخاص المطلوب
  volunteersCount: number; // عدد المتطوعين الحاليين
  volunteers: string[]; // معرّفات أو أرقام هواتف المتطوعين المسجلين
  wilaya: string; // كود الولاية (مثال: '16' أو '31')
  wilayaName: string; // اسم الولاية (مثال: 'الجزائر العاصمة' أو 'وهران')
  locationDetails: string; // تفاصيل العنوان أو البلدية
  coordinates?: {
    lat: number;
    lng: number;
  } | null;
  destinationWilaya?: string; // كود ولاية الوصول (اختياري)
  destinationWilayaName?: string; // اسم ولاية الوصول (اختياري)
  destinationDetails?: string; // تفاصيل أو عنوان موقع الوصول (اختياري)
  destinationCoordinates?: {
    lat: number;
    lng: number;
  } | null;
  startDate: string; // من تاريخ (مثال: '2025-05-01')
  endDate: string; // إلى تاريخ (مثال: '2025-05-10')
  priority: PriorityLevel; // 'urgent' (عاجل - أحمر), 'medium' (متوسط - أصفر), 'normal' (عادي - أخضر)
  description?: string;
  organizationId: string; // معرّف أو هاتف الجمعية الناشرة
  organizationName: string; // اسم الجمعية الناشرة
  organizationPhone: string; // رقم هاتف التواصل للجمعية
  completedVolunteers?: string[]; // معرّفات المتطوعين الذين أتموا المهمة
  confirmedAttendance?: string[]; // معرّفات المتطوعين الذين أكدوا الحضور
  backupVolunteers?: string[]; // قائمة المتطوعين الاحتياطيين
  volunteerRegisteredAt?: Record<string, number>; // توقيت تسجيل كل متطوع أساسي لحساب مهلة التأكيد (ساعة)
  status: 'active' | 'completed' | 'cancelled';
  createdAt?: any;
}

export type SortFilterOption = 'my_wilaya' | 'priority' | 'newest' | 'all';
