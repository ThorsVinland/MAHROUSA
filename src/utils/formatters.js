// ============================================================
// src/utils/formatters.js
// دوال معالجة وتنسيق النصوص والأرقام لتطبيق محروسة
// ============================================================

/**
 * تنظيف رقم الهاتف وإرجاع الصيغة الموحدة (10 أرقام تبدأ بـ 0)
 */
export const normalizePhone = (phone) => {
  if (!phone) return '';
  let cleaned = phone.trim().replace(/[\s-]/g, '');
  if (cleaned.startsWith('+213')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('00213')) {
    cleaned = '0' + cleaned.slice(5);
  }
  return cleaned;
};

/**
 * تنسيق رقم الهاتف للعرض (مثال: 0555 12 34 56)
 */
export const formatPhoneDisplay = (phone) => {
  const norm = normalizePhone(phone);
  if (norm.length !== 10) return phone;
  return `${norm.slice(0, 4)} ${norm.slice(4, 6)} ${norm.slice(6, 8)} ${norm.slice(8, 10)}`;
};

export default {
  normalizePhone,
  formatPhoneDisplay,
};
