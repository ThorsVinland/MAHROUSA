// ============================================================
// src/screens/auth/VolunteerLoginScreen.tsx
// Volunteer Login Screen for MAHROUSA
// ============================================================

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAlert } from '../../context/AlertContext';
import { AuthStackParamList } from '../../types/auth.types';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { LogoHeader } from '../../components/auth/LogoHeader';
import { AppInput } from '../../components/auth/AppInput';
import { AppButton } from '../../components/auth/AppButton';
import { AuthErrorBoundary } from '../../components/auth/AuthErrorBoundary';
import { useVolunteerLogin } from '../../hooks/auth/useVolunteerLogin';

type ScreenProp = NativeStackNavigationProp<AuthStackParamList, 'VolunteerLogin'>;

interface Props {
  navigation: ScreenProp;
}

export const VolunteerLoginScreen: React.FC<Props> = ({ navigation }) => {
  const { showAlert } = useAlert();
  const { form, isLoading, errorMessage, onSubmit } = useVolunteerLogin(() => {
    // RootNavigator automatically reacts to Zustand isAuthenticated
  });

  const {
    watch,
    setValue,
    formState: { errors },
  } = form;

  const handleForgotPassword = () => {
    showAlert(
      'استرجاع كلمة السر',
      'سيتم إرسال رمز استرجاع الحساب عبر رسالة نصية قصيرة SMS لرقم هاتفك المسجل.'
    );
  };

  return (
    <AuthErrorBoundary>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <LogoHeader
              showBackButton={true}
              onBack={() => navigation.goBack()}
            />

            <View style={styles.headerBox}>
              <Text style={styles.title}>مرحباً بعودتك</Text>
              <Text style={styles.subtitle}>
                سجّل دخولك للمتابعة والمشاركة في الميدان
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate('VolunteerSignUp')}
                style={styles.signUpLinkRow}
              >
                <Text style={styles.signUpLinkText}>
                  ليس لديك حساب بعد؟ <Text style={styles.signUpLinkHighlight}>أنشئ حساباً</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Inputs */}
            <AppInput
              label="رقم الهاتف"
              placeholder="05 / 06 / 07 ..."
              icon="call-outline"
              keyboardType="phone-pad"
              value={watch('phone')}
              onChangeText={(val) => setValue('phone', val, { shouldValidate: true })}
              error={errors.phone?.message}
              editable={!isLoading}
            />

            <AppInput
              label="كلمة السر"
              placeholder="أدخل كلمة السر"
              icon="lock-closed-outline"
              secureText={true}
              value={watch('password')}
              onChangeText={(val) => setValue('password', val, { shouldValidate: true })}
              error={errors.password?.message}
              editable={!isLoading}
            />

            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordRow}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>نسيت كلمة السر؟</Text>
            </TouchableOpacity>

            <AppButton
              title="دخول"
              onPress={onSubmit}
              loading={isLoading}
              disabled={isLoading}
            />

            {errorMessage ? (
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AuthErrorBoundary>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: Typography.h1.fontSize,
    fontWeight: Typography.h1.fontWeight,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.caption.fontSize + 1,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  signUpLinkRow: {
    marginTop: 8,
    paddingVertical: 4,
  },
  signUpLinkText: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
  },
  signUpLinkHighlight: {
    color: Colors.mainBlue,
    fontWeight: '700',
  },
  forgotPasswordRow: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: Typography.caption.fontSize + 1,
    color: Colors.mainBlue,
    fontWeight: '600',
  },
  errorMessage: {
    fontSize: Typography.caption.fontSize,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600',
  },
});
