// ============================================================
// src/utils/validators.js
// دوال التحقق من صحة المدخلات لتطبيق محروسة
// ============================================================

/**
 * التحقق من صحة رقم الهاتف الجزائري
 * يدعم الصيغ:
 * - المحلية: 05XXXXXXXX / 06XXXXXXXX / 07XXXXXXXX (10 أرقام)
 * - الدولية: +2135XXXXXXXX / +2136XXXXXXXX / +2137XXXXXXXX
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.trim().replace(/[\s-]/g, '');
  const localRegex = /^0(5|6|7)[0-9]{8}$/;
  const intlRegex = /^(\+213|00213)(5|6|7)[0-9]{8}$/;
  return localRegex.test(cleaned) || intlRegex.test(cleaned);
};

/**
 * التحقق من كلمة المرور (الحد الأدنى 6 خانات)
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
};

/**
 * التحقق من الاسم الكامل (خانة أو خانتين على الأقل)
 */
export const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  return name.trim().length >= 2;
};

/**
 * التحقق من البريد الإلكتروني (إن وجد كخيار إضافي)
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export default {
  validatePhone,
  validatePassword,
  validateName,
  validateEmail,
};
