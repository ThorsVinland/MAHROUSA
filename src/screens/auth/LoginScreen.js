import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme/colors';
import { useTheme } from '../../context/ThemeContext';
import CustomPhoneInput from '../../components/common/CustomPhoneInput';
import CustomButton from '../../components/common/CustomButton';
import { checkUserExists } from '../../services/authService';
import { normalizeDigits } from '../../utils/formatters';
import { useAlert } from '../../context/AlertContext';

export default function LoginScreen({ selectedRole, onGoToRegister, onBack, onGoToVerifyOtp }) {
  const { themeMode, toggleTheme, isDarkMode, colors } = useTheme();
  const { showAlert } = useAlert();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const cleanPhone = normalizeDigits(phoneNumber).replace(/^0+/, '');
    const finalNumberToSend = '+213' + cleanPhone;
    
    try {
      setIsLoading(true);
      
      // 1. التحقق من وجود المستخدم في Firestore
      const { exists, role } = await checkUserExists(finalNumberToSend);
      
      if (!exists) {
        setIsLoading(false);
        showAlert('خطأ', 'هذا الرقم غير مسجل، يرجى إنشاء حساب جديد أولاً.');
        return;
      }

      if (selectedRole && role !== selectedRole) {
        setIsLoading(false);
        const roleText = selectedRole === 'organization' ? 'جمعية' : 'متطوع';
        showAlert('خطأ', `هذا الرقم غير مسجل كـ ${roleText}، تأكد من اختيار نوع الحساب الصحيح.`);
        return;
      }

      setIsLoading(false);
      // الانتقال لشاشة التحقق
      if (onGoToVerifyOtp) {
        onGoToVerifyOtp(finalNumberToSend, { role, type: 'login' });
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Login error:', error);
      if (error?.message === 'ACCOUNT_PENDING') {
        showAlert('حساب قيد المراجعة', 'حساب الجمعية الخاص بك لا يزال قيد المراجعة ولم يتم تفعيله بعد.');
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
              <Ionicons name="shield-checkmark" size={45} color={iconColor} />
            </View>
            <Text style={[styles.headerTitle, { color: primaryTextColor }]}>مرحباً بعودتك</Text>
            <Text style={[styles.headerSubtitle, { color: subtitleColor }]}>قم بتسجيل الدخول للمتابعة</Text>
          </View>

          {/* Form Section */}
          <View style={[styles.formContainer, { backgroundColor: cardBgColor }]}>
            
            <CustomPhoneInput
              label="رقم الهاتف"
              placeholder="أدخل رقم الهاتف"
              themeMode={themeMode}
              countryCode="+213"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />

            <CustomButton 
              title={isLoading ? "جارِ التحقق..." : "تسجيل الدخول"} 
              onPress={handleLogin}
              iconName="log-in-outline"
              style={styles.loginButton}
              themeMode={themeMode}
              disabled={phoneNumber.length !== 9 || isLoading}
            />
          </View>

          {/* Footer Section */}
          <View style={styles.footerContainer}>
            <Text style={[styles.footerText, { color: subtitleColor }]}>ليس لديك حساب؟</Text>
            <TouchableOpacity onPress={onGoToRegister}>
              <Text style={[styles.registerText, { color: iconColor }]}> إنشاء حساب جديد</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Spacer for keyboard scrolling */}
          <View style={{ height: 160 }} />
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
    paddingBottom: 160,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 32,
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
  loginButton: {
    marginTop: 8,
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
  registerText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
