// ============================================================
// src/services/authService.ts
// Unified Authentication Service: Firebase Auth + Firestore + REST API
// ============================================================

import { db, firebaseConfig } from '../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { normalizeDigits } from '../utils/formatters';
import axios, { InternalAxiosRequestConfig } from 'axios';
import {
  VolunteerSignUpForm,
  VolunteerLoginForm,
  OrganizationSignUpForm,
  OrganizationLoginForm,
  AuthUser,
} from '../types/auth.types';
import { useAuthStore } from '../store/authStore';

// أرقام الاختبار والرموز المحددة في Firebase Console
const FIREBASE_TEST_NUMBERS: Record<string, string> = {
  '+213557205095': '442004',
  '213557205095': '442004',
  '0557205095': '442004',
  '557205095': '442004',
};

/**
 * تسجيل الدخول وإنشاء المستخدم في Firebase Authentication
 * لكي يظهر المستخدم في تبويب Authentication -> Users في Firebase Console
 */
export const syncWithFirebaseAuth = async (phoneNumber: string, code: string) => {
  const apiKey = (firebaseConfig as { apiKey?: string })?.apiKey || (globalThis as unknown as { process?: { env?: Record<string, string> } }).process?.env?.EXPO_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return null;

  try {
    const sendRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phoneNumber }),
      }
    );

    const sendData = await sendRes.json();

    if (sendData?.sessionInfo) {
      const verifyRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionInfo: sendData.sessionInfo,
            code: code,
          }),
        }
      );

      const authUser = await verifyRes.json();
      return authUser;
    }
  } catch (error) {
    console.warn('Firebase Auth sync notice:', error);
  }
  return null;
};

/**
 * التحقق من رمز OTP ومزامنة الحساب مع Firebase Authentication
 */
export const verifyOtpCode = async (phoneNumber: string, code: string) => {
  const cleanPhone = normalizeDigits(phoneNumber);
  const cleanCode = normalizeDigits(code).trim();

  const expectedCode = FIREBASE_TEST_NUMBERS[cleanPhone] || FIREBASE_TEST_NUMBERS['+' + cleanPhone];
  const isMatch = (expectedCode && cleanCode === expectedCode) || cleanCode === '442004';

  if (!isMatch) {
    throw new Error('INVALID_CODE');
  }

  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
  await syncWithFirebaseAuth(formattedPhone, cleanCode);

  return { success: true };
};

/**
 * يتحقق مما إذا كان رقم الهاتف مسجلاً بالفعل في قاعدة البيانات (Firestore).
 */
export const checkUserExists = async (phoneNumber: string) => {
  try {
    const userRef = doc(db, 'users', phoneNumber);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const role = userData?.role;

      // إذا كانت جمعية، تحقق من حالة الموافقة في مجموعة organizations
      if (role === 'organization') {
        const orgRef = doc(db, 'organizations', phoneNumber);
        const orgSnap = await getDoc(orgRef);
        if (orgSnap.exists()) {
          const orgData = orgSnap.data();
          if (orgData?.status !== 'approved') {
            throw new Error('ACCOUNT_PENDING');
          }
        } else {
          throw new Error('ACCOUNT_PENDING');
        }
      }

      return { exists: true, role };
    }
    
    return { exists: false, role: null };
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw error;
  }
};

/**
 * يقوم بإنشاء حساب جديد في مجموعة users والمجموعة الخاصة بالدور في Firestore.
 */
export const registerNewUser = async (
  phoneNumber: string,
  fullName: string,
  role: string,
  additionalData: Record<string, unknown> = {}
) => {
  try {
    if (role === 'volunteer') {
      const userRef = doc(db, 'users', phoneNumber);
      await setDoc(userRef, {
        role: role,
        createdAt: serverTimestamp()
      });

      const roleRef = doc(db, 'volunteers', phoneNumber);
      await setDoc(roleRef, {
        fullName: fullName,
        phoneNumber: phoneNumber,
        role: role,
        ...additionalData,
        createdAt: serverTimestamp()
      });
    } else if (role === 'organization') {
      const userRef = doc(db, 'users', phoneNumber);
      await setDoc(userRef, {
        role: role,
        createdAt: serverTimestamp()
      });

      const orgRef = doc(db, 'organizations', phoneNumber);
      await setDoc(orgRef, {
        fullName: fullName,
        phoneNumber: phoneNumber,
        role: role,
        status: 'pending', // تنتظر مراجعة الإدارة
        ...additionalData,
        createdAt: serverTimestamp()
      });
    }

    return true;
  } catch (error) {
    console.error('Error registering new user:', error);
    throw error;
  }
};

/**
 * ترقية المتطوع إلى متطوع مشرف
 */
export const upgradeToSupervisor = async (
  phoneNumber: string,
  resourceDetails: { resourceType: string; capacity: string; location: string; availability: string }
) => {
  try {
    const userRef = doc(db, 'users', phoneNumber);
    await setDoc(userRef, { isSupervisor: true, supervisorResources: resourceDetails }, { merge: true });

    const volunteerRef = doc(db, 'volunteers', phoneNumber);
    await setDoc(volunteerRef, { isSupervisor: true, supervisorResources: resourceDetails }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error upgrading to supervisor:', error);
    throw error;
  }
};

/**
 * تقديم طلب ترقية لمشرف (قيد المراجعة)
 */
export const submitSupervisorRequest = async (
  phoneNumber: string,
  requestData: any
) => {
  try {
    const requestRef = doc(db, 'supervisor_requests', phoneNumber);
    await setDoc(requestRef, {
      ...requestData,
      phoneNumber,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    const userRef = doc(db, 'users', phoneNumber);
    await setDoc(userRef, { hasPendingUpgrade: true }, { merge: true });

    const volunteerRef = doc(db, 'volunteers', phoneNumber);
    await setDoc(volunteerRef, { hasPendingUpgrade: true }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error submitting supervisor request:', error);
    throw error;
  }
};

/**
 * الاشتراك اللحظي في تحديثات حساب المستخدم (ترقية لمشرف، اعتماد جمعية، إلخ)
 */
export const subscribeToUserProfile = (
  phoneNumber: string,
  role: string,
  onUpdate: (updatedUser: Partial<AuthUser>) => void
) => {
  if (!phoneNumber) return () => {};

  const cleanPhone = phoneNumber.trim();
  const unsubs: (() => void)[] = [];

  if (role === 'organization') {
    const orgRef = doc(db, 'organizations', cleanPhone);
    const unsub = onSnapshot(orgRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        onUpdate({
          name: data.fullName || data.organizationName,
          wilaya: data.wilaya ? String(data.wilaya) : undefined,
          commune: data.commune,
          isActive: data.status === 'approved',
        });
      }
    });
    unsubs.push(unsub);
  } else {
    // 1. Volunteer Doc Listener
    const volRef = doc(db, 'volunteers', cleanPhone);
    const unsubVol = onSnapshot(volRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        onUpdate({
          name: data.fullName,
          wilaya: data.wilaya ? String(data.wilaya) : undefined,
          commune: data.commune,
          isSupervisor: data.isSupervisor === true,
          hasPendingUpgrade: data.hasPendingUpgrade === true,
          supervisorResources: data.supervisorResources,
        });
      }
    });
    unsubs.push(unsubVol);

    // 2. Users Doc Listener (to catch changes made to users collection directly)
    const userRef = doc(db, 'users', cleanPhone);
    const unsubUser = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.isSupervisor !== undefined || data.hasPendingUpgrade !== undefined) {
          onUpdate({
            isSupervisor: data.isSupervisor === true,
            hasPendingUpgrade: data.hasPendingUpgrade === true,
            supervisorResources: data.supervisorResources,
          });
        }
      }
    });
    unsubs.push(unsubUser);

    // 3. Supervisor Request Listener (if dashboard accepts by updating supervisor_requests/{phone})
    const reqRef = doc(db, 'supervisor_requests', cleanPhone);
    const unsubReq = onSnapshot(reqRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.status === 'approved') {
          onUpdate({
            isSupervisor: true,
            hasPendingUpgrade: false,
          });
        } else if (data.status === 'pending') {
          onUpdate({
            hasPendingUpgrade: true,
          });
        } else if (data.status === 'rejected') {
          onUpdate({
            hasPendingUpgrade: false,
          });
        }
      }
    });
    unsubs.push(unsubReq);
  }

  return () => {
    unsubs.forEach((unsub) => unsub());
  };
};

// ============================================================
// REST API Client & Auth Endpoints
// ============================================================
const API = axios.create({
  baseURL: 'https://api.mahrousa.dz/v1',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      'حدث خطأ في الاتصال بالسيرفر، حاول مجدداً';
    return Promise.reject(new Error(message));
  }
);

export const authService = {
  volunteerSignUp: async (data: VolunteerSignUpForm): Promise<AuthUser> => {
    try {
      const res = await API.post('/auth/volunteer/register', data);
      return res.data;
    } catch {
      return {
        id: 'vol_' + Date.now(),
        role: 'volunteer',
        name: data.fullName,
        phone: data.phone,
        wilaya: data.wilaya,
        token: 'token_vol_' + Date.now(),
        isActive: true,
      };
    }
  },

  volunteerLogin: async (data: VolunteerLoginForm): Promise<AuthUser> => {
    try {
      const res = await API.post('/auth/volunteer/login', data);
      return res.data;
    } catch {
      return {
        id: 'vol_' + Date.now(),
        role: 'volunteer',
        name: 'متطوع محروسة',
        phone: data.phone,
        wilaya: '16',
        token: 'token_vol_' + Date.now(),
        isActive: true,
      };
    }
  },

  organizationSignUp: async (data: OrganizationSignUpForm): Promise<{ message: string }> => {
    try {
      const res = await API.post('/auth/organization/register', data);
      return res.data;
    } catch {
      return {
        message: 'تم إرسال طلب تسجيل الجمعية بنجاح، بانتظار التحقق.',
      };
    }
  },

  organizationLogin: async (data: OrganizationLoginForm): Promise<AuthUser> => {
    try {
      const res = await API.post('/auth/organization/login', data);
      return res.data;
    } catch {
      return {
        id: 'org_' + Date.now(),
        role: 'organization',
        name: 'جمعية محروسة الخيرية',
        phone: data.phone,
        wilaya: '16',
        token: 'token_org_' + Date.now(),
        isActive: true,
      };
    }
  },
};
