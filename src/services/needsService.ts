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
import { sendNotificationToUser } from './notificationService';

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
  destinationWilaya?: string;
  destinationWilayaName?: string;
  destinationDetails?: string;
  destinationCoordinates?: {
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
    
    const needData = {
      title: input.title.trim(),
      needType: input.needType,
      quantity: Number(input.quantity) || 1,
      volunteersCount: 0,
      volunteers: [],
      wilaya: input.wilaya,
      wilayaName: input.wilayaName,
      locationDetails: input.locationDetails.trim(),
      coordinates: input.coordinates || null,
      destinationWilaya: input.destinationWilaya || '',
      destinationWilayaName: input.destinationWilayaName || '',
      destinationDetails: input.destinationDetails?.trim() || '',
      destinationCoordinates: input.destinationCoordinates || null,
      startDate: input.startDate,
      endDate: input.endDate,
      priority: input.priority,
      description: input.description?.trim() || '',
      organizationId: input.organizationId,
      organizationName: input.organizationName || 'جمعية محروسة',
      organizationPhone: input.organizationPhone,
      status: 'active',
      createdAt: serverTimestamp(),
    };

    console.log('Publishing need to Firestore...');
    
    // Use Promise.race to timeout after 15 seconds if network is unresponsive
    const docRef: any = await Promise.race([
      addDoc(needsRef, needData),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('انتهى وقت الاتصال. يرجى التحقق من اتصالك بالإنترنت.')), 15000)
      )
    ]);

    console.log('Need published successfully with ID:', docRef.id);
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
            completedVolunteers: data.completedVolunteers || [],
            confirmedAttendance: data.confirmedAttendance || [],
            backupVolunteers: data.backupVolunteers || [],
            volunteerRegisteredAt: data.volunteerRegisteredAt || {},
            wilaya: data.wilaya || '',
            wilayaName: data.wilayaName || '',
            locationDetails: data.locationDetails || '',
            coordinates: data.coordinates || null,
            destinationWilaya: data.destinationWilaya || '',
            destinationWilayaName: data.destinationWilayaName || '',
            destinationDetails: data.destinationDetails || '',
            destinationCoordinates: data.destinationCoordinates || null,
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
            completedVolunteers: data.completedVolunteers || [],
            confirmedAttendance: data.confirmedAttendance || [],
            backupVolunteers: data.backupVolunteers || [],
            volunteerRegisteredAt: data.volunteerRegisteredAt || {},
            wilaya: data.wilaya || '',
            wilayaName: data.wilayaName || '',
            locationDetails: data.locationDetails || '',
            coordinates: data.coordinates || null,
            destinationWilaya: data.destinationWilaya || '',
            destinationWilayaName: data.destinationWilayaName || '',
            destinationDetails: data.destinationDetails || '',
            destinationCoordinates: data.destinationCoordinates || null,
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
 * فحص تلقائي: إذا مرت ساعة (60 دقيقة) دون تأكيد حضور المتطوع الأساسي،
 * يتم حذفه تلقائياً وترقية أول متطوع من القائمة الاحتياطية
 */
export const checkAndPromoteBackupVolunteers = async (needId: string): Promise<boolean> => {
  if (!needId) return false;
  const needDocRef = doc(db, 'needs', needId);

  try {
    return await runTransaction(db, async (transaction) => {
      const needSnap = await transaction.get(needDocRef);
      if (!needSnap.exists()) return false;

      const data = needSnap.data();
      const volunteers: string[] = data.volunteers || [];
      const backupVolunteers: string[] = data.backupVolunteers || [];
      const confirmedAttendance: string[] = data.confirmedAttendance || [];
      const registeredAtMap: Record<string, number> = data.volunteerRegisteredAt || {};

      if (backupVolunteers.length === 0 || volunteers.length === 0) {
        return false;
      }

      const ONE_HOUR_MS = 60 * 60 * 1000; // ساعة واحدة بالملي ثانية (3600000)
      const now = Date.now();

      // البحث عن متطوع أساسي مسجل لأكثر من ساعة ولم يؤكد الحضور
      const expiredIndex = volunteers.findIndex((volId) => {
        const regTime = registeredAtMap[volId] || (data.createdAt?.seconds ? data.createdAt.seconds * 1000 : 0);
        const isExpired = regTime > 0 && (now - regTime > ONE_HOUR_MS);
        const isNotConfirmed = !confirmedAttendance.includes(volId);
        return isExpired && isNotConfirmed;
      });

      if (expiredIndex === -1) {
        return false;
      }

      const expiredVolunteerId = volunteers[expiredIndex];
      const promotedVolunteerId = backupVolunteers[0];
      const newBackupList = backupVolunteers.slice(1);

      const newVolunteers = [...volunteers];
      newVolunteers[expiredIndex] = promotedVolunteerId;

      const newRegisteredAtMap = { ...registeredAtMap };
      delete newRegisteredAtMap[expiredVolunteerId];
      newRegisteredAtMap[promotedVolunteerId] = now;

      transaction.update(needDocRef, {
        volunteers: newVolunteers,
        backupVolunteers: newBackupList,
        volunteerRegisteredAt: newRegisteredAtMap,
      });

      const needTitle = data.title || 'احتياج ميداني';

      // Send in-app notification to promoted volunteer
      sendNotificationToUser(promotedVolunteerId, {
        title: 'تم اعتمادك كمتطوع أساسي! 🛡️',
        body: `تمت ترقيتك تلقائياً من قائمة الاحتياط لتصبح متطوعاً أساسياً في "${needTitle}". يرجى تأكيد حضورك الميداني خلال مهلة ساعة لتثبيت مقعدك.`,
        type: 'backup_promoted',
        data: {
          needId,
          screen: 'NeedDetails',
        },
      }).catch(() => {});

      // Send in-app notification to expired volunteer
      sendNotificationToUser(expiredVolunteerId, {
        title: 'انتهاء مهلة تأكيد الحضور ⚠️',
        body: `نظراً لعدم تأكيد الحضور الميداني في مهمة "${needTitle}" خلال مهلة الساعة، تم إتاحة المقعد لمتطوع من قائمة الاحتياط. يمكنك التسجيل مجدداً في أي وقت.`,
        type: 'attendance_reminder',
        data: {
          needId,
          screen: 'NeedDetails',
        },
      }).catch(() => {});

      console.log(`Auto-promoted backup volunteer ${promotedVolunteerId} to replace unconfirmed ${expiredVolunteerId}`);
      return true;
    });
  } catch (error) {
    console.error('checkAndPromoteBackupVolunteers error:', error);
    return false;
  }
};

/**
 * تسجيل التطوع في الاحتياج:
 * - إذا كان هناك شواغر: يُسجل كمتطوع أساسي مع بدء مهلة التأكيد (ساعة).
 * - إذا اكتمل العدد: يُسجل في القائمة الاحتياطية ليتم إدراجه تلقائياً عند غياب تأكيد أي متطوع.
 */
export const volunteerToNeed = async (
  needId: string,
  userId: string
): Promise<{ success: boolean; isBackup?: boolean; message: string }> => {
  if (!needId || !userId) {
    throw new Error('بيانات التطوع غير مكتملة.');
  }

  const needDocRef = doc(db, 'needs', needId);

  // أولاً نقوم بفحص تلقائي لأي متطوعين انتهت مهلتهم
  await checkAndPromoteBackupVolunteers(needId).catch(() => {});

  try {
    const result = await runTransaction(db, async (transaction) => {
      const needSnap = await transaction.get(needDocRef);
      if (!needSnap.exists()) {
        throw new Error('هذا الاحتياج لم يعد متاحاً.');
      }

      const data = needSnap.data();
      const volunteers: string[] = data.volunteers || [];
      const backupVolunteers: string[] = data.backupVolunteers || [];
      const quantity: number = data.quantity || 1;
      const currentCount: number = volunteers.length;
      const registeredAtMap: Record<string, number> = data.volunteerRegisteredAt || {};

      // التحقق من التسجيل المسبق
      if (volunteers.includes(userId)) {
        return { success: false, message: 'أنت مسجل بالفعل في هذا الاحتياج كمتطوع أساسي.' };
      }
      if (backupVolunteers.includes(userId)) {
        return { success: false, isBackup: true, message: 'أنت مسجل بالفعل في القائمة الاحتياطية لهذا الاحتياج.' };
      }

      const now = Date.now();

      // الحالة 1: يوجد شواغر في القائمة الأساسية
      if (currentCount < quantity) {
        const newCount = currentCount + 1;
        const newVolunteers = [...volunteers, userId];
        const newMap = { ...registeredAtMap, [userId]: now };

        transaction.update(needDocRef, {
          volunteers: newVolunteers,
          volunteersCount: newCount,
          volunteerRegisteredAt: newMap,
          status: 'active',
        });

        return {
          success: true,
          isBackup: false,
          message: 'تم تسجيل تطوعك بنجاح! يرجى تأكيد حضورك الميداني خلال ساعة.',
        };
      }

      // الحالة 2: القائمة الأساسية مكتملة -> التسجيل في القائمة الاحتياطية
      transaction.update(needDocRef, {
        backupVolunteers: arrayUnion(userId),
      });

      return {
        success: true,
        isBackup: true,
        message: 'تم تسجيلك بنجاح في القائمة الاحتياطية! سيتم إضافتك تلقائياً كمتطوع أساسي إذا لم يؤكد أحد المتطوعين حضوره خلال ساعة.',
      };
    });

    return result;
  } catch (error) {
    console.error('volunteerToNeed error:', error);
    throw error;
  }
};

/**
 * إلغاء التطوع أو الانسحاب من الاحتياج:
 * مع ترقية أول متطوع من القائمة الاحتياطية فوراً
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
      const backupVolunteers: string[] = data.backupVolunteers || [];
      const registeredAtMap: Record<string, number> = data.volunteerRegisteredAt || {};

      // الحالة 1: المستخدم في القائمة الاحتياطية
      if (backupVolunteers.includes(userId)) {
        transaction.update(needDocRef, {
          backupVolunteers: arrayRemove(userId),
        });
        return;
      }

      // الحالة 2: المستخدم في القائمة الأساسية
      if (volunteers.includes(userId)) {
        let newVolunteers = volunteers.filter((id) => id !== userId);
        let newBackupList = [...backupVolunteers];
        const newRegisteredAtMap = { ...registeredAtMap };
        delete newRegisteredAtMap[userId];

        // ترقية فوري لأول متطوع احتياطي
        if (newBackupList.length > 0) {
          const promotedId = newBackupList.shift()!;
          newVolunteers.push(promotedId);
          newRegisteredAtMap[promotedId] = Date.now();
        }

        transaction.update(needDocRef, {
          volunteers: newVolunteers,
          backupVolunteers: newBackupList,
          confirmedAttendance: arrayRemove(userId),
          completedVolunteers: arrayRemove(userId),
          volunteerRegisteredAt: newRegisteredAtMap,
          volunteersCount: newVolunteers.length,
          status: 'active',
        });
      }
    });

    return { success: true, message: 'تم إلغاء التسجيل بنجاح.' };
  } catch (error) {
    console.error('cancelVolunteerForNeed error:', error);
    throw error;
  }
};

/**
 * تأكيد الحضور الميداني للاحتياج (لتجنب الاستبدال بمتطوع احتياطي بعد انقضاء مهلة الساعة)
 */
export const confirmAttendanceForNeed = async (
  needId: string,
  userId: string
): Promise<void> => {
  if (!needId || !userId) return;
  const needDocRef = doc(db, 'needs', needId);
  await updateDoc(needDocRef, {
    confirmedAttendance: arrayUnion(userId),
  });
};

/**
 * حذف إعلان احتياج (للجمعية)
 */
export const deleteNeed = async (needId: string): Promise<void> => {
  const needDocRef = doc(db, 'needs', needId);
  await deleteDoc(needDocRef);
};

