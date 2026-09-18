// ============================================================
// src/services/needsService.ts
// Real-time Firestore Service for Needs & Volunteer Opportunities
// ============================================================

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  runTransaction,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { NeedItem, NeedType, PriorityLevel } from '../types/need.types';

export interface CreateNeedInput {
  title: string;
  needType: NeedType;
  quantity: number;
  wilaya: string;
  wilayaName: string;
  locationDetails: string;
  coordinates?: {
    lat: number;
    lng: number;
  } | null;
  startDate: string;
  endDate: string;
  priority: PriorityLevel;
  description?: string;
  organizationId: string;
  organizationName: string;
  organizationPhone: string;
}

/**
 * إضافة إعلان احتياج جديد إلى مجموعة needs في Firestore
 */
export const createNeed = async (input: CreateNeedInput): Promise<string> => {
  try {
    const needsRef = collection(db, 'needs');
    const docRef = await addDoc(needsRef, {
      title: input.title.trim(),
      needType: input.needType,
      quantity: Number(input.quantity) || 1,
      volunteersCount: 0,
      volunteers: [],
      wilaya: input.wilaya,
      wilayaName: input.wilayaName,
      locationDetails: input.locationDetails.trim(),
      coordinates: input.coordinates || null,
      startDate: input.startDate,
      endDate: input.endDate,
      priority: input.priority,
      description: input.description?.trim() || '',
      organizationId: input.organizationId,
      organizationName: input.organizationName || 'جمعية محروسة',
      organizationPhone: input.organizationPhone,
      status: 'active',
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating need in Firestore:', error);
    throw error;
  }
};

/**
 * اشتراك لحظي بجميع الاحتياجات النشطة في Firestore (لكل الهواتف)
 */
export const subscribeToAllNeeds = (
  callback: (needs: NeedItem[]) => void,
  onError?: (error: any) => void
) => {
  try {
    const needsRef = collection(db, 'needs');
    const unsubscribe = onSnapshot(
      needsRef,
      (snapshot) => {
        const list: NeedItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            title: data.title || '',
            needType: data.needType || 'يد عاملة',
            quantity: data.quantity || 1,
            volunteersCount: data.volunteersCount ?? (data.volunteers?.length || 0),
            volunteers: data.volunteers || [],
            wilaya: data.wilaya || '',
            wilayaName: data.wilayaName || '',
            locationDetails: data.locationDetails || '',
            coordinates: data.coordinates || null,
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            priority: data.priority || 'normal',
            description: data.description || '',
            organizationId: data.organizationId || '',
            organizationName: data.organizationName || '',
            organizationPhone: data.organizationPhone || '',
            status: data.status || 'active',
            createdAt: data.createdAt,
          });
        });
        callback(list);
      },
      (error) => {
        console.error('Firestore subscribeToAllNeeds error:', error);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error('Error initiating subscribeToAllNeeds:', error);
    throw error;
  }
};

/**
 * اشتراك لحظي باحتياجات جمعية معينة
 */
export const subscribeToOrgNeeds = (
  orgIdentifier: string,
  callback: (needs: NeedItem[]) => void
) => {
  try {
    const needsRef = collection(db, 'needs');
    const q = query(needsRef, where('organizationId', '==', orgIdentifier));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: NeedItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            title: data.title || '',
            needType: data.needType || 'يد عاملة',
            quantity: data.quantity || 1,
            volunteersCount: data.volunteersCount ?? (data.volunteers?.length || 0),
            volunteers: data.volunteers || [],
            wilaya: data.wilaya || '',
            wilayaName: data.wilayaName || '',
            locationDetails: data.locationDetails || '',
            coordinates: data.coordinates || null,
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            priority: data.priority || 'normal',
            description: data.description || '',
            organizationId: data.organizationId || '',
            organizationName: data.organizationName || '',
            organizationPhone: data.organizationPhone || '',
            status: data.status || 'active',
            createdAt: data.createdAt,
          });
        });
        callback(list);
      },
      (err) => {
        console.error('Org needs subscription error:', err);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error('Error initiating subscribeToOrgNeeds:', error);
    throw error;
  }
};

/**
 * تسجيل التطوع في الاحتياج بواسطة العميل مع التأكد من عدم اكتمال العدد
 * يزيد العداد بواحد في Firestore لحظياً
 */
export const volunteerToNeed = async (
  needId: string,
  userId: string
): Promise<{ success: boolean; message: string }> => {
  if (!needId || !userId) {
    throw new Error('بيانات التطوع غير مكتملة.');
  }

  const needDocRef = doc(db, 'needs', needId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const needSnap = await transaction.get(needDocRef);
      if (!needSnap.exists()) {
        throw new Error('هذا الاحتياج لم يعد متاحاً.');
      }

      const data = needSnap.data();
      const volunteers: string[] = data.volunteers || [];
      const quantity: number = data.quantity || 1;
      const currentCount: number = data.volunteersCount ?? volunteers.length;

      // تحقق إن كان المستخدم مسجل بالفعل
      if (volunteers.includes(userId)) {
        return { success: false, message: 'أنت مسجل بالفعل في هذا الاحتياج.' };
      }

      // تحقق إن كان العدد قد اكتمل
      if (currentCount >= quantity) {
        throw new Error('عذراً، العدد المطلوب لهذا الاحتياج قد اكتمل بالفعل.');
      }

      const newCount = currentCount + 1;
      const isCompleted = newCount >= quantity;

      transaction.update(needDocRef, {
        volunteers: arrayUnion(userId),
        volunteersCount: increment(1),
        status: isCompleted ? 'completed' : 'active',
      });

      return { success: true, message: 'تم تسجيل تطوعك بنجاح! شكراً لك.' };
    });

    return result;
  } catch (error) {
    console.error('volunteerToNeed error:', error);
    throw error;
  }
};

/**
 * إلغاء التطوع في الاحتياج
 */
export const cancelVolunteerForNeed = async (
  needId: string,
  userId: string
): Promise<{ success: boolean; message: string }> => {
  if (!needId || !userId) {
    throw new Error('بيانات غير مكتملة.');
  }

  const needDocRef = doc(db, 'needs', needId);

  try {
    await runTransaction(db, async (transaction) => {
      const needSnap = await transaction.get(needDocRef);
      if (!needSnap.exists()) {
        throw new Error('الاحتياج غير موجود.');
      }

      const data = needSnap.data();
      const volunteers: string[] = data.volunteers || [];
      const currentCount: number = data.volunteersCount ?? volunteers.length;

      if (!volunteers.includes(userId)) {
        return;
      }

      const newCount = Math.max(0, currentCount - 1);

      transaction.update(needDocRef, {
        volunteers: arrayRemove(userId),
        volunteersCount: newCount,
        status: 'active',
      });
    });

    return { success: true, message: 'تم إلغاء التطوع بنجاح.' };
  } catch (error) {
    console.error('cancelVolunteerForNeed error:', error);
    throw error;
  }
};

/**
 * حذف إعلان احتياج (للجمعية)
 */
export const deleteNeed = async (needId: string): Promise<void> => {
  const needDocRef = doc(db, 'needs', needId);
  await deleteDoc(needDocRef);
};
