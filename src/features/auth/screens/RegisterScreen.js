import { SafeAreaView } from 'react-native-safe-area-context';
// ============================================================
// src/features/auth/screens/RegisterScreen.js
// واجهة إنشاء حساب جديد بتصميم عصري ومفتوح (Open Space) مستوحى من النموذج الأول
// ============================================================

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
   
  TouchableOpacity, 
  StatusBar, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Image,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../../hooks/useTheme';
import useAuth from '../../../hooks/useAuth';
import { spacing, typography, radius, shadows } from '../../../theme';
import { validatePhone, validatePassword, validateName } from '../../../utils/validators';

export default function RegisterScreen({ role, onBack, onGoToLogin, navigation, route }) {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { register } = useAuth();

  const [activeRole, setActiveRole] = useState(role || route?.params?.role || 'volunteer');
  const isVolunteer = activeRole === 'volunteer';
  const roleColor = isVolunteer ? colors.volunteer : (colors.organization || '#8B5CF6');
  const roleText = isVolunteer ? 'متطوع' : 'جمعية / مؤسسة';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate('Login');
    }
  };

  const handleGoToLogin = () => {
    if (onGoToLogin) {
      onGoToLogin();
    } else if (navigation?.navigate) {
      navigation.navigate('Login', { initialRole: activeRole });
    }
  };

  const handleRegister = async () => {
    let isValid = true;
    setNameError('');
    setPhoneError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!validateName(name)) {
      setNameError('يرجى إدخال الاسم بشكل صحيح (أكثر من حرفين)');
      isValid = false;
    }

    if (!validatePhone(phone)) {
      setPhoneError('يرجى إدخال رقم هاتف جزائري صحيح (مثال: 0555123456)');
      isValid = false;
    }

    if (!validatePassword(password)) {
      setPasswordError('كلمة المرور يجب ألا تقل عن 6 خانات');
      isValid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('كلمتا المرور غير متطابقتين');
      isValid = false;
    }

    if (!isValid) return;

    try {
      setLoading(true);
      await register({
        name,
        phone,
        password,
        role: activeRole,
      });
    } catch (error) {
      Alert.alert('خطأ في التسجيل', 'تعذر إنشاء الحساب، يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom", "left", "right"]} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background}
      />
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Actions: Theme Toggle & Back Button */}
          <View style={styles.topActionsContainer}>
            <TouchableOpacity 
              style={[styles.topBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isDarkMode ? 'sunny-outline' : 'moon-outline'} 
                size={20} 
                color={colors.text} 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.topBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Hero Branding Section (Create Account) */}
          <View style={styles.heroContainer}>
            <View style={[styles.avatarCircleOuter, { backgroundColor: isDarkMode ? colors.surfaceSecondary : '#EEF2F6' }]}>
              <View style={[styles.avatarCircleInner, { backgroundColor: colors.surface }]}>
                <Image 
                  source={isVolunteer ? require('../../../assets/images/volunteer_card.jpg') : require('../../../assets/images/org_card.jpg')}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>
              {/* شارة الدور الصغيرة المستوحاة من الصورة الأولى */}
              <View style={[styles.roleMiniBadge, { backgroundColor: roleColor }]}>
                <Ionicons name={isVolunteer ? 'person' : 'business'} size={12} color="#FFFFFF" />
              </View>
            </View>

            <Text style={[styles.heroTitle, { color: colors.text }]}>إنشاء حساب جديد</Text>
            
            {/* مؤشر الدور مع إمكانية التبديل بنقرة */}
            <View style={styles.roleToggleRow}>
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                التسجيل كـ:
              </Text>
              <TouchableOpacity 
                style={[styles.roleBadgeBtn, { backgroundColor: roleColor + '20', borderColor: roleColor }]}
                onPress={() => setActiveRole(isVolunteer ? 'organization' : 'volunteer')}
                activeOpacity={0.7}
              >
                <Text style={[styles.roleBadgeText, { color: roleColor }]}>{roleText}</Text>
                <Ionicons name="swap-horizontal" size={14} color={roleColor} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {isVolunteer ? 'الاسم الكامل' : 'اسم الجمعية أو المنظمة'}
              </Text>
              <View style={[
                styles.pillInputBox, 
                { backgroundColor: colors.surface, borderColor: nameError ? colors.error : colors.border }
              ]}>
                <Ionicons name="person-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInputStyle, { color: colors.text }]}
                  placeholder={isVolunteer ? "مثال: يوسف بن عيسى" : "مثال: جمعية الأمل الخيرية"}
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (nameError) setNameError('');
                  }}
                />
              </View>
              {nameError ? <Text style={[styles.errorText, { color: colors.error }]}>{nameError}</Text> : null}
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>رقم الهاتف</Text>
              <View style={[
                styles.pillInputBox, 
                { backgroundColor: colors.surface, borderColor: phoneError ? colors.error : colors.border }
              ]}>
                <View style={[styles.flagBadgeBox, { borderLeftColor: colors.border }]}>
                  <Text style={styles.flagEmoji}>🇩🇿</Text>
                  <Text style={[styles.countryCode, { color: colors.textSecondary }]}>+213</Text>
                </View>
                <TextInput
                  style={[styles.textInputStyle, { color: colors.text }]}
                  placeholder="05 / 06 / 07 ..."
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    if (phoneError) setPhoneError('');
                  }}
                />
              </View>
              {phoneError ? <Text style={[styles.errorText, { color: colors.error }]}>{phoneError}</Text> : null}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>كلمة المرور</Text>
              <View style={[
                styles.pillInputBox, 
                { backgroundColor: colors.surface, borderColor: passwordError ? colors.error : colors.border }
              ]}>
                <TouchableOpacity 
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)} 
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
                <TextInput
                  style={[styles.textInputStyle, { color: colors.text }]}
                  placeholder="6 أحرف أو أرقام على الأقل"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError('');
                  }}
                />
              </View>
              {passwordError ? <Text style={[styles.errorText, { color: colors.error }]}>{passwordError}</Text> : null}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>تأكيد كلمة المرور</Text>
              <View style={[
                styles.pillInputBox, 
                { backgroundColor: colors.surface, borderColor: confirmPasswordError ? colors.error : colors.border }
              ]}>
                <TouchableOpacity 
                  onPress={() => setIsConfirmVisible(!isConfirmVisible)} 
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={isConfirmVisible ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
                <TextInput
                  style={[styles.textInputStyle, { color: colors.text }]}
                  placeholder="أعد إدخال كلمة المرور"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!isConfirmVisible}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (confirmPasswordError) setConfirmPasswordError('');
                  }}
                />
              </View>
              {confirmPasswordError ? <Text style={[styles.errorText, { color: colors.error }]}>{confirmPasswordError}</Text> : null}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.mainSubmitBtn,
                { backgroundColor: roleColor },
                loading && { opacity: 0.7 }
              ]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.88}
            >
              <Text style={styles.mainSubmitBtnText}>
                {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
              </Text>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerBox}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>أو</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Google Sign-Up Pill Button */}
            <TouchableOpacity 
              style={[styles.googlePillBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => Alert.alert('Google Sign-Up', 'جاري تجهيز التسجيل المباشر بحساب Google')}
              activeOpacity={0.8}
            >
              <Image 
                source={require('../../../assets/icons/google.png')} 
                style={styles.googleIcon} 
                resizeMode="contain" 
              />
              <Text style={[styles.googlePillText, { color: colors.text }]}>
                التسجيل باستخدام Google
              </Text>
            </TouchableOpacity>

          </View>

          {/* Footer Section */}
          <View style={styles.footerContainer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              لديك حساب بالفعل؟
            </Text>
            <TouchableOpacity onPress={handleGoToLogin} activeOpacity={0.7}>
              <Text style={[styles.loginLinkText, { color: roleColor }]}>
                {' '}تسجيل الدخول
              </Text>
            </TouchableOpacity>
          </View>

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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },

  /* Top Actions */
  topActionsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  topBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  /* Hero */
  heroContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.xs,
  },
  avatarCircleOuter: {
    position: 'relative',
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarCircleInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  roleMiniBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...shadows.xs,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'center',
  },
  roleToggleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  heroSubtitle: {
    fontSize: 14,
  },
  roleBadgeBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* Form */
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'right',
  },
  pillInputBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1.2,
    borderRadius: 20,
    height: 54,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  inputIcon: {
    marginLeft: 8,
  },
  flagBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    borderLeftWidth: 1,
    height: '100%',
  },
  flagEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '700',
  },
  textInputStyle: {
    flex: 1,
    fontSize: 15,
    textAlign: 'right',
    paddingHorizontal: 10,
    height: '100%',
  },
  eyeBtn: {
    paddingHorizontal: 6,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },

  /* Submit Button */
  mainSubmitBtn: {
    height: 56,
    borderRadius: 30,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.md,
  },
  mainSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  /* Divider */
  dividerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: 13,
    fontWeight: '600',
  },

  /* Google Button */
  googlePillBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 30,
    borderWidth: 1.2,
    ...shadows.xs,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  googlePillText: {
    fontSize: 14,
    fontWeight: '700',
  },

  /* Footer */
  footerContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  footerText: {
    fontSize: 14,
  },
  loginLinkText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
