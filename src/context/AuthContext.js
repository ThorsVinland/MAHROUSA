// ============================================================
// src/context/AuthContext.js
// سياق إدارة جلسة ومصادقة المستخدم برقم الهاتف لتطبيق محروسة
// ============================================================

import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizePhone } from '../utils/formatters';

const STORAGE_KEY = '@mahrousa_user_session';

export const AuthContext = createContext({
  user: null,
  userRole: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  switchRole: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // استعادة الجلسة المحفوظة عند فتح التطبيق
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedSession = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed?.user) {
            setUser(parsed.user);
            setUserRole(parsed.user.role || 'volunteer');
            setToken(parsed.token || 'mahrousa_token');
          }
        }
      } catch (error) {
        console.warn('فشل في استعادة جلسة المستخدم:', error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * تسجيل الدخول برقم الهاتف وكلمة المرور
   */
  const login = async ({ phone, password, role }) => {
    const cleanPhone = normalizePhone(phone);
    const targetRole = role || userRole || 'volunteer';
    
    // إنشاء مستخدم للجلسة الحالية
    const authenticatedUser = {
      id: 'usr_' + Date.now(),
      name: user?.name || (targetRole === 'organization' ? 'جمعية محروسة الخيرية' : 'متطوع محروسة'),
      phone: cleanPhone,
      role: targetRole,
    };

    const sessionData = {
      user: authenticatedUser,
      token: 'token_' + Date.now(),
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    setUser(authenticatedUser);
    setUserRole(targetRole);
    setToken(sessionData.token);

    return authenticatedUser;
  };

  /**
   * إنشاء حساب جديد برقم الهاتف
   */
  const register = async ({ name, phone, password, role = 'volunteer' }) => {
    const cleanPhone = normalizePhone(phone);
    
    const newUser = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      phone: cleanPhone,
      role: role,
      createdAt: new Date().toISOString(),
    };

    const sessionData = {
      user: newUser,
      token: 'token_' + Date.now(),
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    setUser(newUser);
    setUserRole(newUser.role);
    setToken(sessionData.token);

    return newUser;
  };

  /**
   * تسجيل الخروج ومسح الجلسة
   */
  const logout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('خطأ أثناء مسح الجلسة:', e);
    } finally {
      setUser(null);
      setUserRole(null);
      setToken(null);
    }
  };

  /**
   * تبديل الدور الفعال
   */
  const switchRole = async (newRole) => {
    if (!newRole) return;
    setUserRole(newRole);
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ user: updatedUser, token }));
    }
  };

  const value = {
    user,
    userRole,
    isAuthenticated: !!user,
    isLoading,
    token,
    login,
    register,
    logout,
    switchRole,
    setUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
