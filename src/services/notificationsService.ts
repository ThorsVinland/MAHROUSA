// ============================================================
// src/services/notificationsService.ts
// Real-time notifications service for Volunteers & Organizations
// Listens to both public broadcast notifications (crises) and personal notifications
// ============================================================

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: string; // 'crisis_alert' | 'crisis_resolved' | 'supervisor_upgrade_approved' | 'task_assigned' | 'general'
  isRead?: boolean;
  crisisId?: string | null;
  createdAt?: any;
  wilayaName?: string;
  severityPercentage?: number;
}

const PUBLIC_NOTIFICATIONS_COLLECTION = 'public_notifications';

/**
 * Subscribe to all notifications for the current user in real-time.
 * Automatically merges public crisis alerts with personal notifications.
 */
export function subscribeToUserNotifications(
  role: 'volunteer' | 'organization' | string,
  phoneNumber: string | undefined | null,
  callback: (notifications: AppNotification[]) => void
): () => void {
  try {
    let publicNotifs: AppNotification[] = [];
    let personalNotifs: AppNotification[] = [];

    const mergeAndNotify = () => {
      const seenSignatures = new Set<string>();
      const result: AppNotification[] = [];

      // نجمع الإشعارات الشخصية والعامة
      const combined = [...personalNotifs, ...publicNotifs];

      // ترتيب تنازلي حسب تاريخ الإنشاء (الأحدث أولاً)
      combined.sort((a, b) => {
        const timeA = a.createdAt?.toMillis
          ? a.createdAt.toMillis()
          : a.createdAt?.seconds
          ? a.createdAt.seconds * 1000
          : 0;
        const timeB = b.createdAt?.toMillis
          ? b.createdAt.toMillis()
          : b.createdAt?.seconds
          ? b.createdAt.seconds * 1000
          : 0;
        return timeB - timeA;
      });

      // إزالة أي إشعار مكرر (بنفس العنوان والنص في نفس التوقيت أو بنفس المعرف)
      for (const n of combined) {
        const time = n.createdAt?.toMillis
          ? n.createdAt.toMillis()
          : n.createdAt?.seconds
          ? n.createdAt.seconds * 1000
          : 0;

        // نافذة زمنية مدتها 5 دقائق لدمج الإشعارات المتطابقة
        const timeBucket = Math.floor(time / 300000);
        const signature = `${(n.title || '').trim()}::${(n.body || '').trim()}::${timeBucket}`;

        if (seenSignatures.has(n.id) || (time > 0 && seenSignatures.has(signature))) {
          continue; // عنصر مكرر، نتخطاه
        }

        seenSignatures.add(n.id);
        if (time > 0) seenSignatures.add(signature);
        result.push(n);
      }

      callback(result);
    };

    // 1. Subscribe to public broadcast notifications (crises alerts & resolutions)
    const publicQ = query(
      collection(db, PUBLIC_NOTIFICATIONS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const unsubPublic = onSnapshot(
      publicQ,
      (snapshot) => {
        publicNotifs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as AppNotification[];
        mergeAndNotify();
      },
      (err) => {
        console.warn('Public notifications listener fallback:', err);
        // Fallback without orderBy
        onSnapshot(collection(db, PUBLIC_NOTIFICATIONS_COLLECTION), (snap) => {
          publicNotifs = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as AppNotification[];
          mergeAndNotify();
        });
      }
    );

    // 2. Subscribe to user personal notifications if logged in
    let unsubPersonal = () => {};
    if (phoneNumber) {
      const parentCol = role === 'organization' ? 'organizations' : 'volunteers';
      const personalRef = collection(db, parentCol, phoneNumber, 'notifications');
      const personalQ = query(personalRef, orderBy('createdAt', 'desc'));

      unsubPersonal = onSnapshot(
        personalQ,
        (snapshot) => {
          personalNotifs = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as AppNotification[];
          mergeAndNotify();
        },
        () => {
          // Fallback without orderBy
          onSnapshot(personalRef, (snap) => {
            personalNotifs = snap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })) as AppNotification[];
            mergeAndNotify();
          });
        }
      );
    }

    return () => {
      unsubPublic();
      unsubPersonal();
    };
  } catch (e) {
    console.warn('Failed to subscribe to notifications:', e);
    callback([]);
    return () => {};
  }
}
