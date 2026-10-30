import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform, LogBox } from 'react-native';
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// إخفاء تحذيرات بيئة التطوير غير المؤثرة
LogBox.ignoreLogs([
  '[expo-notifications]',
  '`expo-notifications` functionality is not fully supported in Expo Go',
  'Notification channel skipped',
  'ExpoNotificationChannelManager',
  'Call to function',
]);

// فحص هل التطبيق يعمل داخل Expo Go
export const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// إعداد معالج الإشعارات المنبثقة للظهور في شريط الإشعارات والصوت والاهتزاز حتى والتطبيق مفتوح
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    } as any),
  });
} catch (_e) {}

/**
 * إنشاء قناة الإشعارات في الأندرويد بأعلى درجة أولوية (MAX) لإظهار الإشعار في شريط الحالة
 */
export async function ensureNotificationChannel() {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'تنبيهات المحروسة العاجلة',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#208AEF',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });
    } catch (channelErr) {
      console.warn('Notification channel setup:', channelErr);
    }
  }
}

/**
 * طلب إذن إرسال الإشعارات على أجهزة أندرويد 13+ و iOS
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync().catch(() => ({
      status: 'undetermined',
    }));
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync().catch(() => ({
        status: 'denied',
      }));
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (e) {
    console.warn('Error requesting permissions:', e);
    return false;
  }
}

// مجموعة لحفظ توقيعات الإشعارات التي تم إظهارها لمنع تكرار الإشعار الواحد مرتين
const seenNotificationSignatures = new Set<string>();
const listenerStartTime = Date.now() - 15000; // عدم إشعار العناصر القديمة جداً، فقط الجديدة

// الاستماع لأي إشعار وارد عن بُعد (Push) لتسجيل توقيعه فوراً ومنع عرضه محلياً مرة ثانية
try {
  Notifications.addNotificationReceivedListener((notification) => {
    const t = (notification.request?.content?.title || '').trim();
    const b = (notification.request?.content?.body || '').trim();
    if (t || b) {
      const timeBucket = Math.floor(Date.now() / 25000);
      seenNotificationSignatures.add(`${t}::${b}::${timeBucket}`);
    }
  });
} catch (_listenerErr) {}

/**
 * إظهار إشعار محلي فوري ومباشر في شريط إشعارات الهاتف العلوي بدون تكرار
 */
export async function showLocalNotification({
  title,
  body,
  data = {},
  type = 'system',
}: {
  title: string;
  body: string;
  data?: any;
  type?: string;
}) {
  const cleanTitle = (title || '').trim();
  const cleanBody = (body || '').trim();
  if (!cleanTitle && !cleanBody) return;

  // فحص منع التكرار خلال 25 ثانية بنفس العنوان والمحتوى
  const now = Date.now();
  const timeBucket = Math.floor(now / 25000);
  const signature = `${cleanTitle}::${cleanBody}::${timeBucket}`;

  if (seenNotificationSignatures.has(signature)) {
    return; // تم عرض هذا الإشعار بالفعل مؤخراً
  }
  seenNotificationSignatures.add(signature);

  try {
    await ensureNotificationChannel();

    // نستخدم identifier فريد وثابت لنفس الإشعار حتى يستبدل الإشعار القديم ولا يتكرر في أندرويد
    const notifId = `mahrousa_${cleanTitle.slice(0, 15)}_${timeBucket}`;

    await Notifications.scheduleNotificationAsync({
      identifier: notifId,
      content: {
        title: cleanTitle || 'تنبيه المحروسة 🇩🇿',
        body: cleanBody || '',
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: [0, 250, 250, 250],
        channelId: 'default',
        color: '#208AEF',
        data: { ...data, type },
      } as any,
      trigger: null, // إظهار فوري ومباشر في شريط الإشعارات
    });
  } catch (err) {
    console.warn('Failed to schedule local notification in notification bar:', err);
  }
}

/**
 * الاستماع اللحظي إلى قاعدة بيانات فيربيز وإظهار أي إشعار جديد في شريط إشعارات الهاتف مباشرةً
 */
export function startLiveNotificationListener(user?: any): () => void {
  const unsubs: Array<() => void> = [];

  // التأكد من إعداد القناة والأذونات
  ensureNotificationChannel();
  requestNotificationPermissions();

  try {
    // 1. الاستماع إلى الإشعارات العامة (البث العام والأزمات)
    const pubQ = query(
      collection(db, 'public_notifications'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubPub = onSnapshot(
      pubQ,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            const createdAtMillis = data.createdAt?.toMillis
              ? data.createdAt.toMillis()
              : data.createdAt?.seconds
              ? data.createdAt.seconds * 1000
              : Date.now();

            // إذا أضيف الإشعار خلال الجلسة الحالية
            if (createdAtMillis >= listenerStartTime) {
              // فحص الاستهداف بالولاية
              if (data.targetType === 'wilaya' && data.targetWilayaCode) {
                const userWilaya = String(user?.wilaya || '').trim();
                const targetCode = String(data.targetWilayaCode).trim();
                const targetName = String(data.targetWilayaName || '').trim();
                const isMatch =
                  userWilaya === targetCode ||
                  userWilaya.includes(targetName) ||
                  (targetName && userWilaya && targetName.includes(userWilaya));

                if (!isMatch) return;
              }

              showLocalNotification({
                title: data.title,
                body: data.body,
                data: { ...data, id: change.doc.id },
                type: data.type || 'system',
              });
            }
          }
        });
      },
      (err) => console.warn('Public notification stream fallback:', err)
    );
    unsubs.push(unsubPub);

    // 2. الاستماع إلى الإشعارات الشخصية الخاصة بالمستخدم
    const phone = user?.phone ? String(user.phone).trim() : null;
    if (phone) {
      const parentCol = user?.role === 'organization' ? 'organizations' : 'volunteers';
      const personalQ = query(
        collection(db, parentCol, phone, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const unsubPersonal = onSnapshot(
        personalQ,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              const createdAtMillis = data.createdAt?.toMillis
                ? data.createdAt.toMillis()
                : data.createdAt?.seconds
                ? data.createdAt.seconds * 1000
                : Date.now();

              if (createdAtMillis >= listenerStartTime) {
                showLocalNotification({
                  title: data.title,
                  body: data.body,
                  data: { ...data, id: change.doc.id },
                  type: data.type || 'system',
                });
              }
            }
          });
        },
        (err) => console.warn('Personal notification stream fallback:', err)
      );
      unsubs.push(unsubPersonal);
    }
  } catch (e) {
    console.warn('Failed to start live notification listener:', e);
  }

  return () => {
    unsubs.forEach((unsub) => unsub());
  };
}

/**
 * تسجيل جهاز المستخدم لاستقبال الإشعارات وحفظ التوكن في Firestore
 */
export async function registerForPushNotificationsAsync(user?: any): Promise<string | null> {
  try {
    await ensureNotificationChannel();
    await requestNotificationPermissions();

    let expoToken: string | null = null;
    let deviceFcmToken: string | null = null;

    // محاولة الحصول على Expo Push Token
    try {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      );
      expoToken = tokenData?.data || null;
      console.log('✅ [Push] Expo token obtained:', expoToken);
    } catch (tokenErr) {
      console.warn('⚠️ [Push] Expo push token warning:', tokenErr);
    }

    // محاولة الحصول على Native FCM Device Token المباشر
    try {
      const deviceTokenData = await Notifications.getDevicePushTokenAsync();
      deviceFcmToken = deviceTokenData?.data || null;
      console.log('✅ [Push] Native FCM Device token obtained:', deviceFcmToken);
    } catch (fcmErr) {
      console.warn('⚠️ [Push] FCM device token warning:', fcmErr);
    }

    const token = expoToken || deviceFcmToken || (user?.phone ? `device_${String(user.phone).trim()}` : null);

    const docKey =
      (user?.phone && String(user.phone).trim()) ||
      (user?.id && String(user.id).trim()) ||
      (token ? token.replace(/[^a-zA-Z0-9]/g, '_') : 'guest_device');

    const payload: any = {
      token: token || `token_${docKey}`,
      expoToken: expoToken || null,
      fcmToken: deviceFcmToken || null,
      phone: user?.phone || '',
      role: user?.role || 'volunteer',
      name: user?.name || user?.fullName || user?.associationName || 'مستخدم محروسة',
      wilaya: user?.wilaya || '',
      platform: Platform.OS,
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'push_tokens', docKey), payload, { merge: true }).catch(() => {});

    if (user?.phone) {
      const col = user?.role === 'organization' ? 'organizations' : 'volunteers';
      await setDoc(
        doc(db, col, user.phone),
        {
          pushToken: token || payload.token,
          expoToken: expoToken || null,
          fcmToken: deviceFcmToken || null,
          wilaya: user.wilaya || '',
        },
        { merge: true }
      ).catch(() => {});
    }

    return token;
  } catch (_err) {
    return null;
  }
}
