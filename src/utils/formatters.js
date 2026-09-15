/**
 * تحويل الأرقام العربية والفارسية (مثل ١٢٣ أو ۱۲۳) إلى أرقام قياسية (123)
 * وحذف أي حروف غير رقمية.
 */
export const normalizeDigits = (input) => {
  if (!input) return '';
  return String(input)
    .replace(/[٠۰]/g, '0')
    .replace(/[١۱]/g, '1')
    .replace(/[٢۲]/g, '2')
    .replace(/[٣۳]/g, '3')
    .replace(/[٤۴]/g, '4')
    .replace(/[٥۵]/g, '5')
    .replace(/[٦۶]/g, '6')
    .replace(/[٧۷]/g, '7')
    .replace(/[٨۸]/g, '8')
    .replace(/[٩۹]/g, '9')
    .replace(/[^0-9]/g, '');
};

/**
 * تنسيق رقم الهاتف الجزائري بالشكل المطلوب:
 * +213 557 20 20 20
 */
export const formatPhoneNumberDisplay = (phone) => {
  if (!phone) return '';
  
  let cleaned = normalizeDigits(phone);
  
  // إذا كان يبدأ برمز الدولة 213 نقوم باقتطاعه لمعالجة الأرقام التسعة
  if (cleaned.startsWith('213')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  const localDigits = cleaned.substring(0, 9);
  
  const part1 = localDigits.substring(0, 3);
  const part2 = localDigits.substring(3, 5);
  const part3 = localDigits.substring(5, 7);
  const part4 = localDigits.substring(7, 9);
  
  let formatted = '+213';
  if (part1) formatted += ` ${part1}`;
  if (part2) formatted += ` ${part2}`;
  if (part3) formatted += ` ${part3}`;
  if (part4) formatted += ` ${part4}`;
  
  return formatted;
};

export const formatDate = (date) => date;
