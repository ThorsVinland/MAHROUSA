// ============================================================
// src/services/tasksService.ts
// Service for Volunteer Tasks Management & Realtime Firestore Sync
// ============================================================

import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { VolunteerTaskItem } from "../types/task.types";
import { checkAndPromoteBackupVolunteers, cancelVolunteerForNeed } from "./needsService";

/**
 * دالة مساعدة لحساب ساعات التطوع التقديرية بناءً على تاريخ البدء والانتهاء
 */
const calculateHours = (startDate?: string, endDate?: string): number => {
  if (!startDate || !endDate) return 3; // قيمة افتراضية مناسبة لمهمة ميدانية
  try {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const diffDays = Math.max(1, Math.round((end - start) / (1000 * 3600 * 24)) + 1);
    // تقدير 3 ساعات عمل تطوعي لكل يوم من أيام المهمة بحد أقصى 24 ساعة
    return Math.min(24, diffDays * 3);
  } catch {
    return 3;
  }
};

/**
 * الاشتراك اللحظي في مهام المتطوع المسجلة في Firestore (الأساسية والاحتياطية)
 */
export const subscribeToVolunteerTasks = (
  userId: string,
  userPhone?: string,
  callback?: (tasks: VolunteerTaskItem[]) => void,
  onError?: (error: any) => void
) => {
  try {
    const needsRef = collection(db, "needs");

    const unsubscribe = onSnapshot(
      needsRef,
      (snapshot) => {
        const tasks: VolunteerTaskItem[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const volunteers: string[] = data.volunteers || [];
          const backupVolunteers: string[] = data.backupVolunteers || [];
          const completedVolunteers: string[] = data.completedVolunteers || [];
          const confirmedAttendance: string[] = data.confirmedAttendance || [];

          // التحقق مما إذا كان المتطوع منضماً لهذه المهمة (أساسي أو احتياطي)
          const isPrimary =
            (userId && volunteers.includes(userId)) ||
            (userPhone && volunteers.includes(userPhone));

          let backupIndex = -1;
          if (!isPrimary) {
            if (userId && backupVolunteers.includes(userId)) {
              backupIndex = backupVolunteers.indexOf(userId);
            } else if (userPhone && backupVolunteers.includes(userPhone)) {
              backupIndex = backupVolunteers.indexOf(userPhone);
            }
          }
          const isBackup = backupIndex !== -1;

          // فحص ترقية دوري إذا وجد احتياطيون
          if (backupVolunteers.length > 0 && volunteers.length > 0) {
            checkAndPromoteBackupVolunteers(docSnap.id).catch(() => {});
          }

          if (isPrimary || isBackup) {
            const isCompletedByMe = isPrimary
              ? ((userId && completedVolunteers.includes(userId)) ||
                 (userPhone && completedVolunteers.includes(userPhone)) ||
                 data.status === "completed")
              : false;

            const isAttendanceConfirmed = isPrimary
              ? ((userId && confirmedAttendance.includes(userId)) ||
                 (userPhone && confirmedAttendance.includes(userPhone)))
              : false;

            const hours = calculateHours(data.startDate, data.endDate);

            tasks.push({
              id: docSnap.id,
              title: data.title || "",
              needType: data.needType || "يد عاملة",
              quantity: data.quantity || 1,
              volunteersCount: data.volunteersCount ?? volunteers.length,
              volunteers,
              backupVolunteers,
              completedVolunteers,
              confirmedAttendance,
              volunteerRegisteredAt: data.volunteerRegisteredAt || {},
              wilaya: data.wilaya || "",
              wilayaName: data.wilayaName || "",
              locationDetails: data.locationDetails || "",
              coordinates: data.coordinates || null,
              startDate: data.startDate || "",
              endDate: data.endDate || "",
              priority: data.priority || "normal",
              description: data.description || "",
              organizationId: data.organizationId || "",
              organizationName: data.organizationName || "جمعية محروسة",
              organizationPhone: data.organizationPhone || "",
              status: data.status || "active",
              createdAt: data.createdAt,
              isCompletedByMe: !!isCompletedByMe,
              isAttendanceConfirmed: !!isAttendanceConfirmed,
              isBackup,
              backupRank: isBackup ? backupIndex + 1 : undefined,
              estimatedHours: hours,
            });
          }
        });

        // ترتيب المهام: الأحدث أولاً، ثم الجارية قبل المكتملة
        tasks.sort((a, b) => {
          if (a.isCompletedByMe !== b.isCompletedByMe) {
            return a.isCompletedByMe ? 1 : -1;
          }
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        });

        if (callback) {
          callback(tasks);
        }
      },
      (error) => {
        console.error("Firestore subscribeToVolunteerTasks error:", error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up subscribeToVolunteerTasks:", error);
    throw error;
  }
};

/**
 * تحديد المهمة كـ "تم إنجازها بنجاح" من طرف المتطوع
 */
export const markTaskAsCompleted = async (
  needId: string,
  userId: string,
  userPhone?: string
): Promise<void> => {
  if (!needId || !userId) {
    throw new Error("بيانات المهمة غير مكتملة.");
  }

  const docRef = doc(db, "needs", needId);
  const updates: any = {
    completedVolunteers: arrayUnion(userId),
  };
  if (userPhone) {
    updates.completedVolunteers = arrayUnion(userId, userPhone);
  }

  await updateDoc(docRef, updates);
};

/**
 * تأكيد أو إلغاء تأكيد الحضور الميداني للمهمة
 */
export const toggleTaskAttendance = async (
  needId: string,
  userId: string,
  confirm: boolean,
  userPhone?: string
): Promise<void> => {
  if (!needId || !userId) return;

  const docRef = doc(db, "needs", needId);
  if (confirm) {
    await updateDoc(docRef, {
      confirmedAttendance: userPhone
        ? arrayUnion(userId, userPhone)
        : arrayUnion(userId),
    });
  } else {
    await updateDoc(docRef, {
      confirmedAttendance: userPhone
        ? arrayRemove(userId, userPhone)
        : arrayRemove(userId),
    });
  }
};

/**
 * الاعتذار والانسحاب من المهمة وترقية أول متطوع احتياطي فوراً
 */
export const withdrawFromTask = async (
  needId: string,
  userId: string,
  userPhone?: string
): Promise<{ success: boolean; message: string }> => {
  if (!needId || !userId) {
    throw new Error("بيانات غير مكتملة.");
  }

  try {
    const result = await cancelVolunteerForNeed(needId, userId);
    if (userPhone && userPhone !== userId) {
      await cancelVolunteerForNeed(needId, userPhone).catch(() => {});
    }
    return result;
  } catch (error) {
    console.error("withdrawFromTask error:", error);
    throw error;
  }
};

