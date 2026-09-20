import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableWithoutFeedback, 
  Keyboard, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  StatusBar,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme/colors';
import { useTheme } from '../../context/ThemeContext';
import CustomTextInput from '../../components/common/CustomTextInput';
import CustomPhoneInput from '../../components/common/CustomPhoneInput';
import CustomButton from '../../components/common/CustomButton';
import CustomDropdown from '../../components/common/CustomDropdown';
import { checkUserExists } from '../../services/authService';
import { normalizeDigits } from '../../utils/formatters';
import { useAlert } from '../../context/AlertContext';
import communesData from '../../utils/communes.json';

const WILAYAS = Array.from(new Set(communesData.map(c => parseInt(c.wilaya_code)))).map(code => {
  const commune = communesData.find(c => parseInt(c.wilaya_code) === code);
  return {
    label: `${code} - ${commune.name_ar}`,
    value: code.toString()
  };
}).sort((a, b) => parseInt(a.value) - parseInt(b.value));

const SKILLS = [
  { label: 'طب و اسعاف اولي', value: 'طب و اسعاف اولي' },
  { label: 'لوجيستيك و تخزين', value: 'لوجيستيك و تخزين' },
  { label: 'قيادة شاحنات', value: 'قيادة شاحنات' },
  { label: 'طبخ و تموين', value: 'طبخ و تموين' },
  { label: 'تعليم و دعم نفسي', value: 'تعليم و دعم نفسي' },
  { label: 'بناء و اصلاح', value: 'بناء و اصلاح' },
  { label: 'اخرى', value: 'other' }
];

const ORG_TYPES = [
  { label: 'جمعية خيرية', value: 'جمعية خيرية' },
  { label: 'الهلال الاحمر الجزائري', value: 'الهلال الاحمر الجزائري' },
  { label: 'نادي شبابي', value: 'نادي شبابي' },
  { label: 'نادي رياضي', value: 'نادي رياضي' },
  { label: 'ادارة بلدية', value: 'ادارة بلدية' },
  { label: 'اخرى', value: 'other' }
];

export default function RegisterScreen({ role, onBack, onGoToLogin, onGoToVerifyOtp }) {
  const { themeMode, toggleTheme, isDarkMode, colors } = useTheme();
  const { showAlert } = useAlert();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [selectedWilaya, setSelectedWilaya] = useState(null);
  const [selectedCommune, setSelectedCommune] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [customSkill, setCustomSkill] = useState('');

  const [orgType, setOrgType] = useState(null);
  const [customOrgType, setCustomOrgType] = useState('');
  const [legalNumber, setLegalNumber] = useState('');
  const [repName, setRepName] = useState('');
  const [repPhone, setRepPhone] = useState('');

  const communesForWilaya = selectedWilaya 
    ? communesData
        .filter(c => parseInt(c.wilaya_code) === parseInt(selectedWilaya))
        .map(c => ({ label: c.name_ar, value: c.id.toString() }))
    : [];

  const handleRegister = () => {
    if (!fullName.trim()) {
      showAlert('تنبيه', 'يرجى إدخال اسمك الكامل أو اسم الجمعية.');
      return;
    }

    if (role === 'volunteer') {
      if (!selectedWilaya || !selectedCommune || !selectedSkill) {
        showAlert('تنبيه', 'يرجى تعبئة الحقول المطلوبة (الولاية، البلدية والمجال).');
        return;
      }
      if (selectedSkill === 'other' && !customSkill.trim()) {
        showAlert('تنبيه', 'يرجى إدخال المهارة الأخرى التي تجيدها.');
        return;
      }
    } else if (role === 'organization') {
      if (!orgType || !legalNumber.trim() || !selectedWilaya || !selectedCommune || !repName.trim() || !repPhone.trim()) {
        showAlert('تنبيه', 'يرجى تعبئة جميع الحقول المطلوبة للجمعية.');
        return;
      }
      if (orgType === 'other' && !customOrgType.trim()) {
        showAlert('تنبيه', 'يرجى إدخال نوع الهيئة/المنظمة.');
        return;
      }
    }

    showAlert(
      'تأكيد نوع الحساب',
      `أنت تقوم بإنشاء حساب كـ ${role === 'organization' ? 'جمعية / مؤسسة' : 'متطوع'}، هل أنت متأكد من هذا الاختيار؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تأكيد', onPress: proceedWithRegistration }
      ]
    );
  };

  const proceedWithRegistration = async () => {
    const cleanPhone = normalizeDigits(phoneNumber).replace(/^0+/, '');
    const finalNumberToSend = '+213' + cleanPhone;
    
    try {
      setIsLoading(true);
      
      // 1. التحقق من قاعدة البيانات (هل الرقم مسجل مسبقاً؟)
      const { exists, role: existingRole } = await checkUserExists(finalNumberToSend);
      
      if (exists) {
        setIsLoading(false);
        showAlert('خطأ', `هذا الرقم مسجل مسبقاً (كـ ${existingRole === 'organization' ? 'جمعية' : 'متطوع'})، يرجى تسجيل الدخول.`);
        return;
      }

      setIsLoading(false);
      // الانتقال لصفحة التحقق
      if (onGoToVerifyOtp) {
        onGoToVerifyOtp(finalNumberToSend, { 
          fullName, 
          role, 
          type: 'register',
          ...(role === 'volunteer' && {
            wilaya: selectedWilaya,
            commune: selectedCommune,
            skill: selectedSkill === 'other' ? customSkill : selectedSkill
          }),
          ...(role === 'organization' && {
            orgType: orgType === 'other' ? customOrgType : orgType,
            legalNumber,
            wilaya: selectedWilaya,
            commune: selectedCommune,
            repName,
            repPhone
          })
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Register error:', error);
      if (error?.message === 'ACCOUNT_PENDING') {
        showAlert('حساب قيد المراجعة', 'هذا الرقم مسجل مسبقاً كجمعية وهو قيد المراجعة حالياً.');
      } else {
        showAlert('خطأ', 'حدث خطأ أثناء الاتصال بقاعدة البيانات، يرجى المحاولة لاحقاً.');
      }
    }
  };

  const pageBgColor = colors.pageBackground || (isDarkMode ? '#121212' : theme.light.pageBackground);
  const cardBgColor = colors.cardBackground || (isDarkMode ? '#1E1E1E' : '#FFFFFF');
  const primaryTextColor = colors.primaryText || (isDarkMode ? '#FFFFFF' : theme.light.primaryDarkBlue);
  const subtitleColor = isDarkMode ? '#AAAAAA' : '#7F8C8D';
  const iconColor = colors.primaryDarkBlue || (isDarkMode ? '#4D96FF' : theme.light.primaryDarkBlue);

  const roleText = role === 'organization' ? 'جمعية / مؤسسة' : 'متطوع';
  const roleIcon = role === 'organization' ? 'business' : 'person';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: pageBgColor }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={pageBgColor}
      />
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : null}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Actions (Back Button & Theme Toggle) */}
          <View style={styles.topActionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: cardBgColor, shadowColor: iconColor }]}
              onPress={toggleTheme}
            >
              <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={24} color={iconColor} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: cardBgColor, shadowColor: iconColor }]}
              onPress={onBack}
            >
              <Ionicons name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>

          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={[styles.logoPlaceholder, { backgroundColor: cardBgColor, shadowColor: iconColor }]}>
              <Ionicons name={roleIcon} size={45} color={iconColor} />
            </View>
            <Text style={[styles.headerTitle, { color: primaryTextColor }]}>إنشاء حساب جديد</Text>
            <Text style={[styles.headerSubtitle, { color: subtitleColor }]}>
              التسجيل كـ: <Text style={{ fontWeight: 'bold', color: iconColor }}>{roleText}</Text>
            </Text>
          </View>

          {/* Form Section */}
          <View style={[styles.formContainer, { backgroundColor: cardBgColor }]}>
            
            <CustomTextInput 
              label="الاسم الكامل" 
              placeholder="أدخل اسمك الكامل" 
              iconName="person-outline"
              themeMode={themeMode}
              value={fullName}
              onChangeText={setFullName}
            />

            <CustomPhoneInput
              label="رقم الهاتف"
              placeholder="أدخل رقم الهاتف"
              themeMode={themeMode}
              countryCode="+213"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />

            {role === 'volunteer' && (
              <>
                <CustomDropdown
                  label="الولاية"
                  placeholder="اختر الولاية"
                  options={WILAYAS}
                  value={selectedWilaya}
                  onSelect={(val) => {
                    setSelectedWilaya(val);
                    setSelectedCommune(null);
                  }}
                  iconName="map-outline"
                  themeMode={themeMode}
                  searchable={true}
                  searchPlaceholder="ابحث عن ولاية..."
                />

                <CustomDropdown
                  label="البلدية"
                  placeholder="اختر البلدية"
                  options={communesForWilaya}
                  value={selectedCommune}
                  onSelect={setSelectedCommune}
                  iconName="location-outline"
                  themeMode={themeMode}
                  searchable={true}
                  searchPlaceholder="ابحث عن بلدية..."
                />

                <CustomDropdown
                  label="المجال / المهارة"
                  placeholder="اختر مجال التطوع"
                  options={SKILLS}
                  value={selectedSkill}
                  onSelect={setSelectedSkill}
                  iconName="briefcase-outline"
                  themeMode={themeMode}
                />

                {selectedSkill === 'other' && (
                  <CustomTextInput 
                    label="مهارة أخرى" 
                    placeholder="ما هي المهارات التي تجيدها؟" 
                    iconName="star-outline"
                    themeMode={themeMode}
                    value={customSkill}
                    onChangeText={setCustomSkill}
                  />
                )}
              </>
            )}

            {role === 'organization' && (
              <>
                <CustomDropdown
                  label="نوع الهيئة او المنظمة"
                  placeholder="اختر النوع"
                  options={ORG_TYPES}
                  value={orgType}
                  onSelect={setOrgType}
                  iconName="business-outline"
                  themeMode={themeMode}
                />
                
                {orgType === 'other' && (
                  <CustomTextInput 
                    label="نوع آخر" 
                    placeholder="اكتب نوع الهيئة" 
                    iconName="create-outline"
                    themeMode={themeMode}
                    value={customOrgType}
                    onChangeText={setCustomOrgType}
                  />
                )}

                <CustomTextInput 
                  label="رقم الاعتماد القانوني" 
                  placeholder="أدخل رقم الاعتماد" 
                  iconName="document-text-outline"
                  themeMode={themeMode}
                  value={legalNumber}
                  onChangeText={setLegalNumber}
                />

                <CustomDropdown
                  label="الولاية"
                  placeholder="اختر الولاية"
                  options={WILAYAS}
                  value={selectedWilaya}
                  onSelect={(val) => {
                    setSelectedWilaya(val);
                    setSelectedCommune(null);
                  }}
                  iconName="map-outline"
                  themeMode={themeMode}
                  searchable={true}
                  searchPlaceholder="ابحث عن ولاية..."
                />

                <CustomDropdown
                  label="البلدية"
                  placeholder="اختر البلدية"
                  options={communesForWilaya}
                  value={selectedCommune}
                  onSelect={setSelectedCommune}
                  iconName="location-outline"
                  themeMode={themeMode}
                  searchable={true}
                  searchPlaceholder="ابحث عن بلدية..."
                />

                <CustomTextInput 
                  label="اسم المسؤول المعتمد" 
                  placeholder="أدخل اسم المسؤول" 
                  iconName="person-outline"
                  themeMode={themeMode}
                  value={repName}
                  onChangeText={setRepName}
                />

                <CustomPhoneInput
                  label="رقم هاتف المسؤول"
                  placeholder="أدخل رقم هاتف المسؤول"
                  themeMode={themeMode}
                  countryCode="+213"
                  value={repPhone}
                  onChangeText={setRepPhone}
                />
              </>
            )}

            <CustomButton 
              title={isLoading ? "جارِ التحقق..." : "إنشاء حساب"} 
              onPress={handleRegister}
              iconName="person-add-outline"
              style={styles.registerButton}
              themeMode={themeMode}
              disabled={phoneNumber.length !== 9 || isLoading}
            />

          </View>

          {/* Footer Section */}
          <View style={styles.footerContainer}>
            <Text style={[styles.footerText, { color: subtitleColor }]}>لديك حساب بالفعل؟</Text>
            <TouchableOpacity onPress={onGoToLogin}>
              <Text style={[styles.loginText, { color: iconColor }]}> تسجيل الدخول</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Spacer for keyboard scrolling */}
          <View style={{ height: 180 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 180,
  },
  
  topActionsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 0,
    width: '100%',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
    fontFamily: 'System', 
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },

  formContainer: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  registerButton: {
    marginTop: 20,
  },

  footerContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 15,
  },
  loginText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
