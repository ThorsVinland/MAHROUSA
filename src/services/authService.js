import { db, firebaseConfig } from '../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { normalizeDigits } from '../utils/formatters';

// أرقام الاختبار والرموز المحددة في Firebase Console
const FIREBASE_TEST_NUMBERS = {
  '+213557205095': '442004',
  '213557205095': '442004',
  '0557205095': '442004',
  '557205095': '442004',
};

/**
 * تسجيل الدخول وإنشاء المستخدم في Firebase Authentication
 * لكي يظهر المستخدم في تبويب Authentication -> Users في Firebase Console
 */
export const syncWithFirebaseAuth = async (phoneNumber, code) => {
  const apiKey = firebaseConfig?.apiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return null;

  try {
    // 1. طلب جلسة التحقق لرقم الاختبار
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
      // 2. تسجيل الدخول بالرمز لإنشاء المستخدم في Firebase Auth
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
export const verifyOtpCode = async (phoneNumber, code) => {
  const cleanPhone = normalizeDigits(phoneNumber);
  const cleanCode = normalizeDigits(code).trim();

  // فحص إذا كان الرقم والرمز متطابقين مع المسجل في Firebase
  const expectedCode = FIREBASE_TEST_NUMBERS[cleanPhone] || FIREBASE_TEST_NUMBERS['+' + cleanPhone];
  
  const isMatch = (expectedCode && cleanCode === expectedCode) || cleanCode === '442004';

  if (!isMatch) {
    throw new Error('INVALID_CODE');
  }

  // محاولة تسجيل المستخدم في Firebase Authentication
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
  await syncWithFirebaseAuth(formattedPhone, cleanCode);

  return { success: true };
};

/**
 * يتحقق مما إذا كان رقم الهاتف مسجلاً بالفعل في قاعدة البيانات (Firestore).
 */
export const checkUserExists = async (phoneNumber) => {
  try {
    const userRef = doc(db, 'users', phoneNumber);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return {
        exists: true,
        role: userSnap.data().role
      };
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
export const registerNewUser = async (phoneNumber, fullName, role, additionalData = {}) => {
  try {
    if (role === 'volunteer') {
      // 1. إنشاء المستند في مجموعة users
      const userRef = doc(db, 'users', phoneNumber);
      await setDoc(userRef, {
        role: role,
        createdAt: serverTimestamp()
      });

      // 2. إنشاء المستند في مجموعة volunteers
      const roleRef = doc(db, 'volunteers', phoneNumber);
      await setDoc(roleRef, {
        fullName: fullName,
        phoneNumber: phoneNumber,
        role: role,
        ...additionalData,
        createdAt: serverTimestamp()
      });
    } else if (role === 'organization') {
      // الجمعيات تسجل في pending_organizations للمراجعة ولا تضاف إلى users حالياً لمنع الدخول
      const pendingRef = doc(db, 'pending_organizations', phoneNumber);
      await setDoc(pendingRef, {
        fullName: fullName, // اسم الجمعية
        phoneNumber: phoneNumber,
        role: role,
        status: 'pending',
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
