// ============================================================
// src/theme/colors.js
// نظام الألوان الخاص بتطبيق محروسة | MAHROUSA
// ============================================================
// - الألوان أدناه مستخرجة من وثيقة مواصفات المنتج (Design Spec)
//   وهي مخصصة حالياً للوضع الفاتح (Light Mode).
// - تم ترك "darkColors" فارغة عمداً بنفس المفاتيح (keys) ليتم
//   تعبئتها لاحقاً دون الحاجة لتعديل باقي الكود الذي يستدعيها.
// ============================================================

export const lightColors = {
  // الألوان الأساسية
  primaryDarkBlue: '#1A5276',      // اللون الأساسي الداكن (Headers, أزرار رئيسية)
  mainBlue: '#2E86C1',             // اللون الأساسي (روابط، أزرار ثانوية)
  lightBlueBg: '#EBF5FB',          // خلفية فاتحة (بطاقات، أقسام مميزة)

  // ألوان الحالة (Status)
  successGreen: '#27AE60',         // نجاح / مهمة مكتملة
  urgentRed: '#E74C3C',            // عاجل / تنبيه / خطر
  orangeHighPriority: '#E67E22',   // أولوية عالية

  // لون خاص بدور الجمعيات
  purpleOrganizations: '#8E44AD',  // كل ما يخص الجمعيات والهيئات

  // الخلفيات والنصوص
  pageBackground: '#F4F6F7',       // خلفية الصفحة العامة
  cardBackground: '#FDFEFE',       // خلفية البطاقات (Cards)
  primaryText: '#2C3E50',          // اللون الأساسي للنصوص
};

// TODO (لاحقاً): عبّئ نفس المفاتيح بألوان الوضع الداكن
export const darkColors = {
  primaryDarkBlue: '',
  mainBlue: '',
  lightBlueBg: '',

  successGreen: '',
  urgentRed: '',
  orangeHighPriority: '',

  purpleOrganizations: '',

  pageBackground: '',
  cardBackground: '',
  primaryText: '',
};

// تجميع الثيمين معاً — يُستخدم مع useColorScheme() أو Context الخاص بالثيم
const theme = {
  light: lightColors,
  dark: darkColors,
};

export default theme;
