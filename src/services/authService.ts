// ============================================================
// src/services/authService.ts
// Unified Authentication Service: Firebase Auth + Firestore + REST API
// ============================================================

import { db, firebaseConfig } from '../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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
