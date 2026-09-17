// ============================================================
// src/screens/auth/VolunteerSignUpScreen.tsx
// Volunteer Registration Screen with Fully Reactive Form Controller
// ============================================================

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, useWatch } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/auth.types';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { WILAYAS, SKILLS, getCommunesByWilaya } from '../../constants/algeria';
import { LogoHeader } from '../../components/auth/LogoHeader';
import { AppInput } from '../../components/auth/AppInput';
import { AppDropdown } from '../../components/auth/AppDropdown';
import { AppButton } from '../../components/auth/AppButton';
import { AuthErrorBoundary } from '../../components/auth/AuthErrorBoundary';
import { useVolunteerSignUp } from '../../hooks/auth/useVolunteerSignUp';

type ScreenProp = NativeStackNavigationProp<AuthStackParamList, 'VolunteerSignUp'>;

interface Props {
  navigation: ScreenProp;
}

export const VolunteerSignUpScreen: React.FC<Props> = ({ navigation }) => {
  const { form, isLoading, errorMessage, onSubmit } = useVolunteerSignUp(() => {
    // Navigated via RootNavigator reacting to Zustand auth state
  });

  const selectedWilaya = useWatch({ control: form.control, name: 'wilaya' });
  const availableCommunes = useMemo(
    () => (selectedWilaya ? getCommunesByWilaya(selectedWilaya) : []),
    [selectedWilaya]
  );

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
              <Text style={styles.title}>إنشاء حساب متطوع</Text>
              <Text style={styles.subtitle}>
                انضم وكن جزءاً من التضامن الجزائري الميداني
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate('VolunteerLogin')}
                style={styles.loginLinkRow}
              >
                <Text style={styles.loginLinkText}>
                  لديك حساب بالفعل؟ <Text style={styles.loginLinkHighlight}>سجّل دخولك</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Full Name */}
            <Controller
              control={form.control}
              name="fullName"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <AppInput
                  label="الاسم الكامل"
                  placeholder="مثال: يوسف بن عيسى"
                  icon="person-outline"
                  value={value}
                  onChangeText={onChange}
                  error={error?.message}
                  editable={!isLoading}
                />
              )}
            />

            {/* Phone */}
            <Controller
              control={form.control}
              name="phone"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <AppInput
                  label="رقم الهاتف"
                  placeholder="05 / 06 / 07 ..."
                  icon="call-outline"
                  keyboardType="phone-pad"
                  value={value}
                  onChangeText={onChange}
                  error={error?.message}
                  editable={!isLoading}
                />
              )}
            />

            {/* Wilaya */}
            <Controller
              control={form.control}
              name="wilaya"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <AppDropdown
                  label="الولاية"
                  icon="map-outline"
                  value={value}
                  options={WILAYAS}
                  onChange={(val) => {
                    onChange(val);
                    form.setValue('commune', '');
                  }}
                  error={error?.message}
                />
              )}
            />

            {/* Commune */}
            <Controller
              control={form.control}
              name="commune"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <AppDropdown
                  label="البلدية"
                  icon="location-outline"
                  value={value}
                  options={availableCommunes}
                  onChange={onChange}
                  error={error?.message}
                />
              )}
            />

            {/* Volunteer Skill */}
            <Controller
              control={form.control}
              name="skill"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <AppDropdown
                  label="المجال / المهارة التطوعية"
                  icon="construct-outline"
                  value={value}
                  options={SKILLS}
                  onChange={onChange}
                  error={error?.message}
                />
              )}
            />

            {/* Password */}
            <Controller
              control={form.control}
              name="password"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <AppInput
                  label="كلمة السر"
                  placeholder="أدخل كلمة السر (6 خانات على الأقل)"
                  icon="lock-closed-outline"
                  secureText={true}
                  value={value}
                  onChangeText={onChange}
                  error={error?.message}
                  editable={!isLoading}
                />
              )}
            />

            <AppButton
              title="إنشاء الحساب"
              onPress={onSubmit}
              loading={isLoading}
              disabled={isLoading}
            />

            <Text style={styles.termsText}>
              بالتسجيل في محروسة، أنت توافق على ميثاق العمل التضامني وشروط الخدمة
            </Text>
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
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: Typography.h1.fontSize,
    fontWeight: Typography.h1.fontWeight,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  loginLinkRow: {
    marginTop: 8,
    paddingVertical: 4,
  },
  loginLinkText: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
  },
  loginLinkHighlight: {
    color: Colors.mainBlue,
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: '#FDEDEC',
    borderWidth: 1,
    borderColor: Colors.borderError,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: Colors.error,
    fontSize: Typography.caption.fontSize,
    textAlign: 'center',
    fontWeight: '600',
  },
  termsText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textDisabled,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
