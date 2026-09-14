import React, { useState, useEffect } from 'react';
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
  useColorScheme,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme/colors';
import { useTheme } from '../../context/ThemeContext';
import CustomPhoneInput from '../../components/common/CustomPhoneInput';
import CustomButton from '../../components/common/CustomButton';

export default function LoginScreen({ onGoToRegister, onBack }) {
  const { themeMode, toggleTheme, isDarkMode, colors } = useTheme();
  
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleLogin = () => {
    const finalNumberToSend = '+213' + phoneNumber;
    
    console.log("رقم الهاتف الذي سيتم إرساله:", finalNumberToSend);
    // TODO: Send to Database
  };

  // تأمين ألوان افتراضية للوضع الداكن إذا كانت فارغة في ملف theme
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
            
            {/* التسجيل الجديد برقم الهاتف */}
            <CustomPhoneInput
              label="رقم الهاتف"
              placeholder="أدخل رقم الهاتف"
              themeMode={themeMode}
              countryCode="+213"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />

            <CustomButton 
              title="تسجيل الدخول" 
              onPress={handleLogin}
              iconName="log-in-outline"
              style={styles.loginButton}
              themeMode={themeMode}
              disabled={phoneNumber.length !== 9}
            />
          </View>

          {/* Footer Section */}
          <View style={styles.footerContainer}>
            <Text style={[styles.footerText, { color: subtitleColor }]}>ليس لديك حساب؟</Text>
            <TouchableOpacity onPress={onGoToRegister}>
              <Text style={[styles.registerText, { color: iconColor }]}> إنشاء حساب جديد</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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
    justifyContent: 'center',
    paddingVertical: 40,
  },
  
  /* Top Actions */
  topActionsContainer: {
    flexDirection: 'row-reverse', // الزرار اليمين على اليمين واليسار على اليسار
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

  /* Header */
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

  /* Form */
  formContainer: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-start', 
    marginTop: -4,
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: theme.light.mainBlue,
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 8,
  },


  /* Footer */
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
