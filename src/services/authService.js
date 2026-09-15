import { db } from '../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * يتحقق مما إذا كان رقم الهاتف مسجلاً بالفعل في قاعدة البيانات.
 * يعيد كائن يحتوي على حالة وجود المستخدم والدور الخاص به.
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
 * يقوم بإنشاء حساب جديد في مجموعة users والمجموعة الخاصة بالدور.
 */
export const registerNewUser = async (phoneNumber, fullName, role) => {
  try {
    // 1. إنشاء المستند في مجموعة users
    const userRef = doc(db, 'users', phoneNumber);
    await setDoc(userRef, {
      role: role,
      createdAt: serverTimestamp()
    });

    // 2. إنشاء المستند في المجموعة الخاصة بالدور
    const collectionName = role === 'volunteer' ? 'volunteers' : 'organizations';
    const roleRef = doc(db, collectionName, phoneNumber);
    
    await setDoc(roleRef, {
      fullName: fullName,
      phoneNumber: phoneNumber,
      role: role,
      createdAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error registering new user:', error);
    throw error;
  }
};
