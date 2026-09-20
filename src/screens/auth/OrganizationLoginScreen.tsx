// ============================================================
// src/screens/auth/OrganizationLoginScreen.tsx
// Organization OTP Authentication Screen for MAHROUSA
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
import { AuthStackParamList } from '../../types/auth.types';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { LogoHeader } from '../../components/auth/LogoHeader';
import { AppInput } from '../../components/auth/AppInput';
import { AppButton } from '../../components/auth/AppButton';
import { OTPInput } from '../../components/auth/OTPInput';
import { AuthErrorBoundary } from '../../components/auth/AuthErrorBoundary';
import { useOrganizationLogin } from '../../hooks/auth/useOrganizationLogin';

type ScreenProp = NativeStackNavigationProp<AuthStackParamList, 'OrganizationLogin'>;

interface Props {
  navigation: ScreenProp;
}

export const OrganizationLoginScreen: React.FC<Props> = ({ navigation }) => {
  const {
    form,
    isLoading,
    errorMessage,
    countdown,
    resendOTP,
    onSubmit,
  } = useOrganizationLogin(() => {
    // Navigates automatically through RootNavigator reacting to Zustand auth state
  });

  const {
    watch,
    setValue,
    formState: { errors },
  } = form;

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
              <Text style={styles.title}>دخول الجمعية / الهيئة</Text>
              <Text style={styles.subtitle}>
                أدر احتياجاتك ونسق مع المتطوعين في الميدان
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate('OrganizationSignUp')}
                style={styles.signUpLinkRow}
              >
                <Text style={styles.signUpLinkText}>
                  جمعية جديدة؟ <Text style={styles.signUpLinkHighlight}>سجّل طلب اعتماد جديد</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Phone Input */}
            <AppInput
              label="رقم هاتف المسؤول المسجل"
              placeholder="05 / 06 / 07 ..."
              icon="call-outline"
              keyboardType="phone-pad"
              value={watch('phone')}
              onChangeText={(val) => setValue('phone', val, { shouldValidate: true })}
              error={errors.phone?.message}
              editable={!isLoading}
            />

            {/* 4-Digit OTP Box */}
            <OTPInput
              value={watch('otp')}
              onChange={(val) => setValue('otp', val, { shouldValidate: true })}
              error={errors.otp?.message}
            />

            <AppButton
              title="دخول لوحة القيادة"
              onPress={onSubmit}
              loading={isLoading}
              disabled={isLoading}
            />

            {errorMessage ? (
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            ) : null}

            {/* Resend Countdown */}
            <View style={styles.resendRow}>
              <Text style={styles.resendLabel}>لم يصلك رمز التحقق؟</Text>
              <TouchableOpacity
                onPress={resendOTP}
                disabled={countdown > 0}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.resendBtnText,
                    countdown > 0 && styles.resendBtnDisabled,
                  ]}
                >
                  {countdown > 0
                    ? `إعادة الإرسال بعد (${countdown} ث)`
                    : 'إعادة إرسال الرمز'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Spacer for keyboard scrolling */}
            <View style={{ height: 160 }} />
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
    paddingTop: 10,
    paddingBottom: 160,
    flexGrow: 1,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 24,
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
    color: Colors.organization,
    fontWeight: '700',
  },
  errorMessage: {
    fontSize: Typography.caption.fontSize,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600',
  },
  resendRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  resendLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  resendBtnText: {
    fontSize: Typography.caption.fontSize + 1,
    color: Colors.mainBlue,
    fontWeight: '700',
  },
  resendBtnDisabled: {
    color: Colors.textDisabled,
    fontWeight: '500',
  },
});
