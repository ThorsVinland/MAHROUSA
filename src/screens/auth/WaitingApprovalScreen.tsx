// ============================================================
// src/screens/auth/WaitingApprovalScreen.tsx
// Waiting Approval & Verification Progress Screen for Organizations
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types/auth.types';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { LogoHeader } from '../../components/auth/LogoHeader';
import { AppButton } from '../../components/auth/AppButton';
import { AuthErrorBoundary } from '../../components/auth/AuthErrorBoundary';

type ScreenProp = NativeStackNavigationProp<AuthStackParamList, 'WaitingApproval'>;

interface Props {
  navigation: ScreenProp;
}

export const WaitingApprovalScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <AuthErrorBoundary>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LogoHeader />

          {/* Success Badge */}
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark" size={44} color={Colors.surface} />
          </View>

          <Text style={styles.title}>تم إرسال طلب الاعتماد بنجاح</Text>

          <Text style={styles.description}>
            سيتم مراجعة وثائق وبيانات جمعيتكم من قبل فريق محروسة خلال 24 إلى 48 ساعة للتأكد من الصفة القانونية.
          </Text>

          <Text style={styles.smsNotice}>
            ستصلكم رسالة نصية قصيرة SMS تحتوي على رمز التفعيل فور الانتهاء من التدقيق.
          </Text>

          {/* 3-Step Progress Card */}
          <View style={styles.progressCard}>
            {/* Step 1: Done */}
            <View style={styles.stepRow}>
              <View style={[styles.stepDot, styles.stepDotDone]}>
                <Ionicons name="checkmark" size={16} color={Colors.surface} />
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepTitleDone}>تم استلام الطلب والملف</Text>
                <Text style={styles.stepSubtitle}>تم تسجيل البيانات في النظام بنجاح</Text>
              </View>
            </View>

            <View style={styles.stepLine} />

            {/* Step 2: In Progress */}
            <View style={styles.stepRow}>
              <View style={[styles.stepDot, styles.stepDotProgress]}>
                <Ionicons name="time" size={16} color={Colors.surface} />
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepTitleProgress}>قيد التدقيق والمراجعة</Text>
                <Text style={styles.stepSubtitle}>جاري مطابقة رقم الاعتماد القانوني</Text>
              </View>
            </View>

            <View style={styles.stepLine} />

            {/* Step 3: Pending */}
            <View style={styles.stepRow}>
              <View style={[styles.stepDot, styles.stepDotPending]}>
                <Ionicons name="shield-checkmark" size={16} color={Colors.textDisabled} />
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepTitlePending}>التفعيل ومنح الصلاحيات</Text>
                <Text style={styles.stepSubtitle}>فتح لوحة القيادة وإطلاق المبادرات</Text>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <AppButton
            title="العودة لشاشة الاختيار الرئيسية"
            variant="outlined"
            onPress={() => navigation.navigate('RoleSelection')}
            style={styles.backButton}
          />
        </ScrollView>
      </SafeAreaView>
    </AuthErrorBoundary>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  smsNotice: {
    fontSize: Typography.caption.fontSize + 1,
    color: Colors.mainBlue,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  progressCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    marginBottom: 28,
  },
  stepRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 14,
  },
  stepDotDone: {
    backgroundColor: Colors.success,
  },
  stepDotProgress: {
    backgroundColor: Colors.warning,
  },
  stepDotPending: {
    backgroundColor: Colors.borderDefault,
  },
  stepTextContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  stepTitleDone: {
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.success,
  },
  stepTitleProgress: {
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.warning,
  },
  stepTitlePending: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  stepSubtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stepLine: {
    width: 2,
    height: 24,
    backgroundColor: Colors.borderDefault,
    marginRight: 15,
    marginVertical: 4,
  },
  backButton: {
    marginTop: 8,
  },
});
