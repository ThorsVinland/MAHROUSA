import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableWithoutFeedback, 
  Keyboard, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme/colors';
import { useTheme } from '../../context/ThemeContext';
import CustomButton from '../../components/common/CustomButton';
import { registerNewUser } from '../../services/authService';
import { normalizeDigits, formatPhoneNumberDisplay } from '../../utils/formatters';

export default function VerifyOtpScreen({ phoneNumber, flowData, onVerifySuccess, onBack }) {
  const { themeMode, isDarkMode, colors } = useTheme();
  const [otp, setOtp] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  const pageBgColor = colors.pageBackground || (isDarkMode ? '#121212' : theme.light.pageBackground);
  const cardBgColor = colors.cardBackground || (isDarkMode ? '#1E1E1E' : '#FFFFFF');
  const primaryTextColor = colors.primaryText || (isDarkMode ? '#FFFFFF' : theme.light.primaryDarkBlue);
  const subtitleColor = isDarkMode ? '#AAAAAA' : '#7F8C8D';
  const iconColor = colors.primaryDarkBlue || (isDarkMode ? '#4D96FF' : theme.light.primaryDarkBlue);

  const OTP_LENGTH = 6;

  const handleOtpChange = (text) => {
    // تنظيف وتحويل أي أرقام عربية إلى أرقام إنجليزية وقصرها على 6 أرقام
    const cleaned = normalizeDigits(text).substring(0, OTP_LENGTH);
    setOtp(cleaned);
  };

  const handleVerify = async () => {
    const cleanOtp = normalizeDigits(otp).trim();

    // محاكاة للتحقق - حالياً نعتبر 123456 هو الرمز الصحيح
    if (cleanOtp === '123456') {
      try {
        setIsLoading(true);
        if (flowData?.type === 'register') {
          // إنشاء حساب جديد في قاعدة البيانات (users + المجموعة الخاصة بالدور)
          await registerNewUser(phoneNumber, flowData.fullName, flowData.role);
          setIsLoading(false);
          onVerifySuccess(flowData.role);
        } else if (flowData?.type === 'login') {
          // الدخول مباشرة
          setIsLoading(false);
          onVerifySuccess(flowData.role);
        }
      } catch (error) {
        setIsLoading(false);
        console.error('Firestore operation error:', error);
        Alert.alert(
          'خطأ في الحفظ', 
          'حدث مشكل أثناء تسجيل بياناتك في قاعدة البيانات. يرجى التأكد من اتصالك بالإنترنت ومن صلاحيات Firebase Rules.'
        );
      }
    } else {
      Alert.alert(
        'رمز غير صحيح', 
        'رمز التحقق المدخل غير صحيح. (رمز الاختبار هو: 123456)'
      );
    }
  };

  const renderSlot = (index) => {
    const isFilled = otp.length > index;
    const isCurrent = otp.length === index && isFocused;
    
    return (
      <View 
        key={index} 
        style={[
          styles.slot, 
          { borderColor: isDarkMode ? '#333' : '#E0E0E0' },
          isCurrent && { borderColor: iconColor, borderWidth: 2 },
          isFilled && { borderColor: iconColor }
        ]}
      >
        <Text style={[styles.slotText, { color: primaryTextColor }]}>
          {isFilled ? otp[index] : ''}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: pageBgColor }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={pageBgColor}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : null}
        >
          <View style={styles.container}>
            
            {/* زر الرجوع */}
            <View style={styles.topActionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: cardBgColor, shadowColor: iconColor }]}
                onPress={onBack}
              >
                <Ionicons name="arrow-back" size={24} color={iconColor} />
              </TouchableOpacity>
            </View>

            {/* أيقونة الشاشة */}
            <View style={styles.headerContainer}>
              <View style={[styles.logoPlaceholder, { backgroundColor: cardBgColor, shadowColor: iconColor }]}>
                <Ionicons name="chatbubbles" size={40} color={iconColor} />
              </View>
              <Text style={[styles.headerTitle, { color: primaryTextColor }]}>التحقق من رقم الهاتف</Text>
              <Text style={[styles.headerSubtitle, { color: subtitleColor }]}>
                لقد أرسلنا رمزاً مكوّناً من 6 أرقام إلى:
              </Text>
              <Text style={[styles.phoneNumberText, { color: primaryTextColor }]}>
                {formatPhoneNumberDisplay(phoneNumber)}
              </Text>
            </View>

            {/* إدخال الرمز (OTP) */}
            <View style={styles.otpContainer}>
              <TouchableOpacity 
                activeOpacity={1} 
                onPress={() => inputRef.current?.focus()}
                style={styles.slotsContainer}
              >
                {[0, 1, 2, 3, 4, 5].map(renderSlot)}
              </TouchableOpacity>
              
              <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                value={otp}
                onChangeText={handleOtpChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                caretHidden={true}
                autoComplete="sms-otp"
                textContentType="oneTimeCode"
              />
            </View>

            {/* زر المتابعة */}
            <CustomButton 
              title={isLoading ? "جارِ التحقق..." : "تأكيد الرمز"} 
              onPress={handleVerify}
              iconName="checkmark-circle-outline"
              style={styles.verifyButton}
              themeMode={themeMode}
              disabled={otp.length !== OTP_LENGTH || isLoading}
            />

            {/* خيار إعادة الإرسال */}
            <View style={styles.resendContainer}>
              <Text style={[styles.resendText, { color: subtitleColor }]}>لم تتلقَ الرمز؟ </Text>
              <TouchableOpacity onPress={() => console.log('Resend OTP')}>
                <Text style={[styles.resendAction, { color: iconColor }]}>إعادة إرسال</Text>
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  topActionsContainer: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 40,
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
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    fontFamily: 'System', 
  },
  headerSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 4,
  },
  phoneNumberText: {
    fontSize: 19,
    fontWeight: '700',
    direction: 'ltr',
    writingDirection: 'ltr',
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 1,
  },
  otpContainer: {
    width: '100%',
    marginBottom: 30,
    position: 'relative',
  },
  slotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  slot: {
    width: 45,
    height: 55,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotText: {
    fontSize: 24,
    fontWeight: '700',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  verifyButton: {
    marginTop: 10,
    width: '100%',
  },
  resendContainer: {
    flexDirection: 'row-reverse',
    marginTop: 30,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 15,
  },
  resendAction: {
    fontSize: 15,
    fontWeight: '700',
  }
});
