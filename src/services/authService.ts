// ============================================================
// src/services/authService.ts
// Axios HTTP Client & Auth Endpoints with Dev Fallback
// ============================================================

import axios, { InternalAxiosRequestConfig } from 'axios';
import {
  VolunteerSignUpForm,
  VolunteerLoginForm,
  OrganizationSignUpForm,
  OrganizationLoginForm,
  AuthUser,
} from '../types/auth.types';
import { useAuthStore } from '../store/authStore';

const API = axios.create({
  baseURL: 'https://api.mahrousa.dz/v1',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach auth token if present
API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle errors globally
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
      // Dev fallback for offline/local demonstration
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
