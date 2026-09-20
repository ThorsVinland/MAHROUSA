// ============================================================
// src/screens/auth/OrganizationSignUpScreen.tsx
// Organization Registration Screen with Fully Reactive Form Controller
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
import { WILAYAS, ORG_TYPES, getCommunesByWilaya } from '../../constants/algeria';
import { LogoHeader } from '../../components/auth/LogoHeader';
import { AppInput } from '../../components/auth/AppInput';
import { AppDropdown } from '../../components/auth/AppDropdown';
import { AppButton } from '../../components/auth/AppButton';
import { AuthErrorBoundary } from '../../components/auth/AuthErrorBoundary';
import { useOrganizationSignUp } from '../../hooks/auth/useOrganizationSignUp';

type ScreenProp = NativeStackNavigationProp<AuthStackParamList, 'OrganizationSignUp'>;

interface Props {
  navigation: ScreenProp;
}

export const OrganizationSignUpScreen: React.FC<Props> = ({ navigation }) => {
  const { form, isLoading, errorMessage, onSubmit } = useOrganizationSignUp(() => {
    navigation.navigate('WaitingApproval');
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
              <Text style={styles.title}>تسجيل جمعية / هيئة</Text>
              <Text style={styles.subtitle}>
                انضمّوا وأعلنوا احتياجاتكم ومبادراتكم للمتطوعين
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate('OrganizationLogin')}
                style={styles.loginLinkRow}
              >
                <Text style={styles.loginLinkText}>
                  لدى جمعيتك حساب مفعل؟ <Text style={styles.loginLinkHighlight}>سجّل الدخول</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Organization Name */}
            <Controller
              control={form.control}
              name="orgName"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <AppInput
                  label="اسم الجمعية / المنظمة"
                  placeholder="مثال: جمعية الأمل الخيرية"
                  icon="business-outline"
                  value={value}
                  onChangeText={onChange}
                  error={error?.message}
                  editable={!isLoading}
                />
              )}
            />

            {/* Organization Type */}
            <Controller
              control={form.control}
              name="orgType"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <AppDropdown
                  label="نوع الهيئة أو المنظمة"
                  icon="layers-outline"
                  value={value}
                  options={ORG_TYPES}
                  onChange={onChange}
                  error={error?.message}
                />
              )}
            />

            {/* Legal Number */}
            <Controller
              control={form.control}
              name="legalNumber"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <AppInput
                  label="رقم الاعتماد القانوني"
                  placeholder="مثال: 1420 / 2021"
                  icon="document-text-outline"
                  helperText="يمكنك إيجاده في وثيقة الاعتماد الصادرة عن الولاية أو وزارة الداخلية"
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

            {/* Manager Name */}
            <Controller
              control={form.control}
              name="managerName"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <AppInput
                  label="اسم المسؤول المعتمد"
                  placeholder="الاسم الكامل لممثل الجمعية"
                  icon="person-outline"
                  value={value}
                  onChangeText={onChange}
                  error={error?.message}
                  editable={!isLoading}
                />
              )}
            />

            {/* Manager Phone */}
            <Controller
              control={form.control}
              name="managerPhone"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <AppInput
                  label="رقم هاتف المسؤول"
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

            <AppButton
              title="إرسال طلب التسجيل"
              onPress={onSubmit}
              loading={isLoading}
              disabled={isLoading}
            />

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
    paddingBottom: 180,
    flexGrow: 1,
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
    color: Colors.organization,
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
});
