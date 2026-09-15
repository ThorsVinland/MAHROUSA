// ============================================================
// src/hooks/useAuth.js
// خطاف مخصص لاستهلاك سياق المصادقة وبيانات المستخدم
// ============================================================

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
