// ============================================================
// src/validation/authSchemas.ts
// Zod Validation Schemas for MAHROUSA Auth Flow
// ============================================================

import { z } from 'zod';

const phoneRegex = /^(05|06|07)[0-9]{8}$/;

export const volunteerSignUpSchema = z.object({
  fullName: z
    .string()
    .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل')
    .max(50, 'الاسم طويل جداً'),
  phone: z
    .string()
    .regex(phoneRegex, 'رقم الهاتف غير صحيح (مثال: 0512345678)'),
  wilaya: z
    .string()
    .min(1, 'الرجاء اختيار الولاية'),
  commune: z
    .string()
    .min(1, 'الرجاء اختيار البلدية'),
  skill: z
    .enum(
      ['medical', 'logistics', 'construction', 'cooking', 'teaching', 'driving', 'other'],
      { errorMap: () => ({ message: 'الرجاء اختيار مهارة' }) }
    ),
  password: z
    .string()
    .min(6, 'كلمة السر يجب أن تكون 6 أحرف على الأقل'),
});

export const volunteerLoginSchema = z.object({
  phone: z
    .string()
    .regex(phoneRegex, 'رقم الهاتف غير صحيح'),
  password: z
    .string()
    .min(1, 'أدخل كلمة السر'),
});

export const organizationSignUpSchema = z.object({
  orgName: z
    .string()
    .min(3, 'اسم الجمعية يجب أن يكون 3 أحرف على الأقل'),
  orgType: z
    .enum(
      ['charity', 'red_crescent', 'youth_club', 'sports_club', 'municipality', 'other'],
      { errorMap: () => ({ message: 'الرجاء اختيار نوع الهيئة' }) }
    ),
  legalNumber: z
    .string()
    .min(5, 'رقم الاعتماد غير صحيح (5 أرقام على الأقل)'),
  wilaya: z
    .string()
    .min(1, 'الرجاء اختيار الولاية'),
  commune: z
    .string()
    .min(1, 'الرجاء اختيار البلدية'),
  managerName: z
    .string()
    .min(3, 'أدخل اسم المسؤول المعتمد'),
  managerPhone: z
    .string()
    .regex(phoneRegex, 'رقم هاتف المسؤول غير صحيح'),
});

export const organizationLoginSchema = z.object({
  phone: z
    .string()
    .regex(phoneRegex, 'رقم الهاتف غير صحيح'),
  otp: z
    .string()
    .length(4, 'رمز التحقق يتكون من 4 أرقام'),
});

export type VolunteerSignUpSchemaType = z.infer<typeof volunteerSignUpSchema>;
export type VolunteerLoginSchemaType = z.infer<typeof volunteerLoginSchema>;
export type OrganizationSignUpSchemaType = z.infer<typeof organizationSignUpSchema>;
export type OrganizationLoginSchemaType = z.infer<typeof organizationLoginSchema>;
