// ============================================================
// src/services/notificationService.ts
// In-App Notifications Service for MAHROUSA
// Real-time Firestore Sync under /volunteers/{phoneNumber}/notifications
// ============================================================

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { AppNotification, NotificationType } from '../types/notification.types';

/**
 * الاشتراك اللحظي في إشعارات المتطوع
 */
export const subscribeToUserNotifications = (
  userPhone: string,
  callback: (notifications: AppNotification[]) => void,
  onError?: (error: any) => void
) => {
  if (!userPhone) {
    callback([]);
    return () => {};
  }

  try {
    const notifsRef = collection(db, 'volunteers', userPhone, 'notifications');
    const q = query(notifsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: AppNotification[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            title: data.title || '',
            body: data.body || '',
            type: data.type || 'system',
            isRead: Boolean(data.isRead),
            createdAt: data.createdAt,
            data: data.data || {},
          });
        });
        callback(list);
      },
      (error) => {
        console.warn('subscribeToUserNotifications error:', error);
        // If index is missing or first time, fallback to simple collection query
        const fallbackUnsub = onSnapshot(
          notifsRef,
          (snap) => {
            const list: AppNotification[] = [];
            snap.forEach((d) => {
              const data = d.data();
              list.push({
                id: d.id,
                title: data.title || '',
                body: data.body || '',
                type: data.type || 'system',
                isRead: Boolean(data.isRead),
                createdAt: data.createdAt,
                data: data.data || {},
              });
            });
            // Manual sort in JS
            list.sort((a, b) => {
              const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : Number(a.createdAt) || 0;
              const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : Number(b.createdAt) || 0;
              return timeB - timeA;
            });
            callback(list);
          },
          (fallbackErr) => {
            console.error('Fallback notifications error:', fallbackErr);
            if (onError) onError(fallbackErr);
          }
        );
        return fallbackUnsub;
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Failed to initiate notifications listener:', error);
    if (onError) onError(error);
    return () => {};
  }
};

/**
 * إرسال إشعار داخل التطبيق لمستخدم معين
 */
export const sendNotificationToUser = async (
  userPhone: string,
  notification: {
    title: string;
    body: string;
    type: NotificationType;
    data?: Record<string, any>;
  }
): Promise<string> => {
  if (!userPhone) return '';

  try {
    const notifsRef = collection(db, 'volunteers', userPhone, 'notifications');
    const newDoc = await addDoc(notifsRef, {
      title: notification.title,
      body: notification.body,
      type: notification.type,
      isRead: false,
      data: notification.data || {},
      createdAt: serverTimestamp(),
    });
    return newDoc.id;
  } catch (error) {
    console.error('sendNotificationToUser error:', error);
    return '';
  }
};

/**
 * تحديد إشعار معين كمقروء
 */
export const markNotificationAsRead = async (
  userPhone: string,
  notificationId: string
): Promise<void> => {
  if (!userPhone || !notificationId) return;

  try {
    const notifDocRef = doc(db, 'volunteers', userPhone, 'notifications', notificationId);
    await updateDoc(notifDocRef, {
      isRead: true,
    });
  } catch (error) {
    console.error('markNotificationAsRead error:', error);
  }
};

/**
 * تحديد جميع إشعارات المستخدم كمقروءة
 */
export const markAllNotificationsAsRead = async (
  userPhone: string,
  notificationIds?: string[]
): Promise<void> => {
  if (!userPhone) return;

  try {
    const notifsRef = collection(db, 'volunteers', userPhone, 'notifications');
    let ids = notificationIds;

    if (!ids || ids.length === 0) {
      const snap = await getDocs(notifsRef);
      ids = snap.docs.filter((d) => !d.data().isRead).map((d) => d.id);
    }

    if (!ids || ids.length === 0) return;

    const batch = writeBatch(db);
    ids.forEach((id) => {
      const ref = doc(db, 'volunteers', userPhone, 'notifications', id);
      batch.update(ref, { isRead: true });
    });

    await batch.commit();
  } catch (error) {
    console.error('markAllNotificationsAsRead error:', error);
  }
};

/**
 * حذف إشعار معين
 */
export const deleteNotification = async (
  userPhone: string,
  notificationId: string
): Promise<void> => {
  if (!userPhone || !notificationId) return;

  try {
    const notifDocRef = doc(db, 'volunteers', userPhone, 'notifications', notificationId);
    await deleteDoc(notifDocRef);
  } catch (error) {
    console.error('deleteNotification error:', error);
  }
};

/**
 * حذف جميع إشعارات المستخدم
 */
export const clearAllNotifications = async (
  userPhone: string
): Promise<void> => {
  if (!userPhone) return;

  try {
    const notifsRef = collection(db, 'volunteers', userPhone, 'notifications');
    const snap = await getDocs(notifsRef);
    if (snap.empty) return;

    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      batch.delete(d.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error('clearAllNotifications error:', error);
  }
};

/**
 * التحقق وإنشاء إشعار تلقائي عند قبول ترقية المشرف إذا لم يكن موجوداً
 */
export const checkAndCreateSupervisorNotification = async (
  userPhone: string,
  isSupervisor: boolean
) => {
  if (!userPhone || !isSupervisor) return;

  try {
    const notifsRef = collection(db, 'volunteers', userPhone, 'notifications');
    const snap = await getDocs(notifsRef);
    const hasUpgradeNotif = snap.docs.some(
      (d) => d.data().type === 'supervisor_upgrade_approved'
    );

    if (!hasUpgradeNotif) {
      await addDoc(notifsRef, {
        title: 'تهانينا! تمت ترقيتك إلى مشرف معتمد 🌟',
        body: 'تمت الموافقة على طلب ترقيتك بنجاح من طرف إدارة المنصة. يمكنك الآن الوصول إلى لوحة تحكم المشرف وإدارة فريقك ومواردك اللوجستية.',
        type: 'supervisor_upgrade_approved',
        isRead: false,
        data: {
          screen: 'SupervisorDashboard',
        },
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.warn('checkAndCreateSupervisorNotification error:', error);
  }
};
