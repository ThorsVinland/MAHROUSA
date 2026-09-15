import { SafeAreaView } from 'react-native-safe-area-context';
// ============================================================
// src/features/auth/screens/LoginScreen.js
// واجهة تسجيل الدخول بتصميم عصري ومفتوح (Open Space) مستوحى من النموذج الأول
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
    ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import useAuth from '../../../hooks/useAuth';
import useTheme from '../../../hooks/useTheme';
import { radius, shadows, spacing } from '../../../theme';
import { validatePassword, validatePhone } from '../../../utils/validators';

export default function LoginScreen({ onGoToRegister, onGoToSelectRole, navigation, route }) {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { login, switchRole } = useAuth();

  // لا يوجد دور مشرف هنا - متطوع أو جمعية فقط
  const initialRole = route?.params?.initialRole || 'volunteer';
  const [selectedRole, setSelectedRole] = useState(initialRole); // 'volunteer' أو 'organization'
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route?.params?.initialRole) {
      setSelectedRole(route.params.initialRole);
    }
  }, [route?.params?.initialRole]);

  const isVolunteer = selectedRole === 'volunteer';
  const roleColor = isVolunteer ? colors.volunteer : (colors.organization || '#8B5CF6');
  const roleTitle = isVolunteer ? 'متطوع' : 'جمعية / مؤسسة';

  const handleLogin = async () => {
    let isValid = true;
    setPhoneError('');
    setPasswordError('');

    if (!validatePhone(phone)) {
      setPhoneError('يرجى إدخال رقم هاتف جزائري صحيح (مثال: 0555123456)');
      isValid = false;
    }

    if (!validatePassword(password)) {
      setPasswordError('كلمة المرور يجب ألا تقل عن 6 خانات');
      isValid = false;
    }

    if (!isValid) return;

    try {
      setLoading(true);
      await login({
        phone,
        password,
        role: selectedRole,
      });
      await switchRole(selectedRole);
    } catch (error) {
      Alert.alert('خطأ في تسجيل الدخول', 'تعذر تسجيل الدخول، يرجى التحقق من صحة البيانات المسجلة.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToRegister = () => {
    if (onGoToRegister) {
      onGoToRegister();
    } else if (navigation?.navigate) {
      navigation.navigate('Register', { role: selectedRole });
    }
  };

  const handleOpenSelectRole = () => {
    if (onGoToSelectRole) {
      onGoToSelectRole();
    } else if (navigation?.navigate) {
      navigation.navigate('SelectRole');
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
          {/* Top Bar: Theme Toggle & User Type Shortcut */}
          <View style={styles.topActionsContainer}>
            <TouchableOpacity
              style={[styles.topButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
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
              style={[styles.selectRolePill, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleOpenSelectRole}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles-outline" size={16} color={roleColor} style={{ marginLeft: 6 }} />
              <Text style={[styles.selectRolePillText, { color: colors.text }]}>
                تغيير نوع الحساب
              </Text>
            </TouchableOpacity>
          </View>

          {/* Hero Branding Section (مستوحى من النموذج الأول Finora) */}
          <View style={styles.heroContainer}>
            {/* الدائرة الرمزية الأنيقة */}
            <View style={[styles.avatarCircleOuter, { backgroundColor: isDarkMode ? colors.surfaceSecondary : '#EEF2F6' }]}>
              <View style={[styles.avatarCircleInner, { backgroundColor: colors.surface }]}>
                <Image
                  source={require('../../../assets/images/welcome_avatar.jpg')}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            <Text style={[styles.heroTitle, { color: colors.text }]}>
              مرحباً بك في محروسة
            </Text>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              المنصة الرقمية لإدارة وتنسيق جهود التضامن والعمل الميداني
            </Text>
          </View>

          {/* Modern 2-Option Role Segment (متطوع أو جمعية فقط) */}
          <View style={styles.roleSegmentContainer}>
            <View style={[styles.roleSegmentBg, { backgroundColor: isDarkMode ? colors.surface : '#EDF2F7' }]}>
              {/* خيار المتطوع */}
              <TouchableOpacity
                style={[
                  styles.roleSegmentOption,
                  isVolunteer && [styles.roleSegmentActive, { backgroundColor: colors.surface }]
                ]}
                onPress={() => setSelectedRole('volunteer')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="person"
                  size={17}
                  color={isVolunteer ? colors.volunteer : colors.textSecondary}
                  style={{ marginLeft: 6 }}
                />
                <Text style={[
                  styles.roleSegmentText,
                  { color: isVolunteer ? colors.text : colors.textSecondary },
                  isVolunteer && { fontWeight: '800' }
                ]}>
                  متطوع
                </Text>
              </TouchableOpacity>

              {/* خيار الجمعية */}
              <TouchableOpacity
                style={[
                  styles.roleSegmentOption,
                  !isVolunteer && [styles.roleSegmentActive, { backgroundColor: colors.surface }]
                ]}
                onPress={() => setSelectedRole('organization')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="business"
                  size={17}
                  color={!isVolunteer ? (colors.organization || '#8B5CF6') : colors.textSecondary}
                  style={{ marginLeft: 6 }}
                />
                <Text style={[
                  styles.roleSegmentText,
                  { color: !isVolunteer ? colors.text : colors.textSecondary },
                  !isVolunteer && { fontWeight: '800' }
                ]}>
                  جمعية / مؤسسة
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Fields: Minimalist Modern Inputs */}
          <View style={styles.formContainer}>
            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>رقم الهاتف</Text>
              <View style={[
                styles.pillInputBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: phoneError ? colors.error : colors.border
                }
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
              {phoneError ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{phoneError}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>كلمة المرور</Text>
              <View style={[
                styles.pillInputBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: passwordError ? colors.error : colors.border
                }
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
                  placeholder="أدخل كلمة المرور"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError('');
                  }}
                />
              </View>
              {passwordError ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{passwordError}</Text>
              ) : null}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => Alert.alert('استرجاع الحساب', 'سيتم إرسال رمز التحقق في رسالة نصية قصيرة SMS.')}
              activeOpacity={0.7}
            >
              <Text style={[styles.forgotBtnText, { color: colors.textSecondary }]}>
                نسيت كلمة المرور؟
              </Text>
            </TouchableOpacity>

            {/* Submit Button (Vibrant Pill Button) */}
            <TouchableOpacity
              style={[
                styles.mainSubmitBtn,
                { backgroundColor: roleColor },
                loading && { opacity: 0.7 }
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              <Text style={styles.mainSubmitBtnText}>
                {loading ? 'جاري التحقق...' : `تسجيل الدخول كـ ${roleTitle}`}
              </Text>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            </TouchableOpacity>

            {/* "Or" Divider */}
            <View style={styles.dividerBox}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>أو</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>
          </View>

          {/* Footer Section */}
          <View style={styles.footerContainer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              ليس لديك حساب بعد؟
            </Text>
            <TouchableOpacity onPress={handleGoToRegister} activeOpacity={0.7}>
              <Text style={[styles.registerLinkText, { color: roleColor }]}>
                {' '}إنشاء حساب جديد
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

  /* Top Bar */
  topActionsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  topButton: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  selectRolePill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  selectRolePillText: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* Hero Section */
  heroContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.xs,
  },
  avatarCircleOuter: {
    width: 104,
    height: 104,
    borderRadius: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarCircleInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 6,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },

  /* Modern 2-Segment Switcher */
  roleSegmentContainer: {
    marginBottom: spacing.xl,
  },
  roleSegmentBg: {
    flexDirection: 'row-reverse',
    borderRadius: 30,
    padding: 4,
  },
  roleSegmentOption: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 26,
  },
  roleSegmentActive: {
    ...shadows.sm,
  },
  roleSegmentText: {
    fontSize: 14,
    fontWeight: '600',
  },

  /* Form Container */
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

  /* Forgot Password */
  forgotBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
    paddingVertical: 4,
  },
  forgotBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },

  /* Submit Button */
  mainSubmitBtn: {
    height: 56,
    borderRadius: 30,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
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

  /* Google Pill Button */
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
  registerLinkText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
