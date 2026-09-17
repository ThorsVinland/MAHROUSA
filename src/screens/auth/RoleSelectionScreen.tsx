// ============================================================
// src/screens/auth/RoleSelectionScreen.tsx
// Modern Open-Space Role Selection Screen for MAHROUSA
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList, UserRole } from '../../types/auth.types';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { LogoHeader } from '../../components/auth/LogoHeader';
import { AppButton } from '../../components/auth/AppButton';
import { AuthErrorBoundary } from '../../components/auth/AuthErrorBoundary';

type ScreenProp = NativeStackNavigationProp<AuthStackParamList, 'RoleSelection'>;

interface Props {
  navigation: ScreenProp;
}

export const RoleSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('volunteer');

  const isVolunteer = selectedRole === 'volunteer';

  const handleContinue = () => {
    if (isVolunteer) {
      navigation.navigate('VolunteerSignUp');
    } else {
      navigation.navigate('OrganizationSignUp');
    }
  };

  const handleGoToLogin = () => {
    if (isVolunteer) {
      navigation.navigate('VolunteerLogin');
    } else {
      navigation.navigate('OrganizationLogin');
    }
  };

  return (
    <AuthErrorBoundary>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Logo & Brand Header */}
          <LogoHeader />

          {/* Title & Prompt Section */}
          <View style={styles.headerBox}>
            <Text style={styles.mainTitle}>اختر{'\n'}نوع الحساب</Text>
            <Text style={styles.englishSubtitle}>Select user type</Text>
            <Text style={styles.headerDescription}>
              حدد صفتك للبدء في الاستفادة من منصة محروسة للتضامن والعمل الميداني
            </Text>
          </View>

          {/* Role Cards Container */}
          <View style={styles.cardsContainer}>
            {/* 1. Volunteer Card */}
            <TouchableOpacity
              style={[
                styles.roleCard,
                isVolunteer && styles.selectedCardVolunteer,
              ]}
              onPress={() => setSelectedRole('volunteer')}
              activeOpacity={0.88}
            >
              <View style={styles.avatarWrapper}>
                <Image
                  source={require('../../assets/images/volunteer_card.jpg')}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>

              <View style={styles.cardDetails}>
                <View style={styles.roleHeaderRow}>
                  <Text style={styles.roleName}>متطوع</Text>
                  <View style={styles.tagBadgeVolunteer}>
                    <Text style={styles.tagBadgeTextVolunteer}>أفراد</Text>
                  </View>
                </View>

                <Text style={styles.roleSubtitleText}>
                  المشاركة في المبادرات وحملات التضامن
                </Text>

                <View style={styles.perksRow}>
                  <Text style={styles.perkText}>• ساعات موثقة</Text>
                  <Text style={[styles.perkText, { marginRight: 8 }]}>• مهام قريبة</Text>
                </View>
              </View>

              {isVolunteer && (
                <View style={styles.activeCheckmarkVolunteer}>
                  <Ionicons name="checkmark" size={16} color={Colors.surface} />
                </View>
              )}
            </TouchableOpacity>

            {/* 2. Organization Card */}
            <TouchableOpacity
              style={[
                styles.roleCard,
                !isVolunteer && styles.selectedCardOrg,
              ]}
              onPress={() => setSelectedRole('organization')}
              activeOpacity={0.88}
            >
              <View style={styles.avatarWrapper}>
                <Image
                  source={require('../../assets/images/org_card.jpg')}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>

              <View style={styles.cardDetails}>
                <View style={styles.roleHeaderRow}>
                  <Text style={styles.roleName}>جمعية / مؤسسة</Text>
                  <View style={styles.tagBadgeOrg}>
                    <Text style={styles.tagBadgeTextOrg}>منظمات</Text>
                  </View>
                </View>

                <Text style={styles.roleSubtitleText}>
                  إدارة المبادرات واستقطاب وإشراف المتطوعين
                </Text>

                <View style={styles.perksRow}>
                  <Text style={styles.perkText}>• إدارة الفرق</Text>
                  <Text style={[styles.perkText, { marginRight: 8 }]}>• تقارير ميدانية</Text>
                </View>
              </View>

              {!isVolunteer && (
                <View style={styles.activeCheckmarkOrg}>
                  <Ionicons name="checkmark" size={16} color={Colors.surface} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Primary Action Button */}
          <AppButton
            title={`المتابعة كـ ${isVolunteer ? 'متطوع' : 'جمعية'}`}
            onPress={handleContinue}
            style={styles.continueButton}
          />

          {/* Footer Direct Login Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerQuestion}>لديك حساب مسجل مسبقاً؟</Text>
            <TouchableOpacity onPress={handleGoToLogin} activeOpacity={0.7}>
              <Text style={styles.footerLoginLink}>
                {' '}تسجيل الدخول كـ {isVolunteer ? 'متطوع' : 'جمعية'}
              </Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: 8,
    paddingBottom: 28,
  },
  headerBox: {
    marginBottom: 20,
    paddingRight: 4,
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 38,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  englishSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  headerDescription: {
    fontSize: Typography.caption.fontSize + 1,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 6,
    lineHeight: 20,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  roleCard: {
    position: 'relative',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.borderDefault,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  selectedCardVolunteer: {
    borderColor: Colors.success,
    backgroundColor: '#F2FAF4',
  },
  selectedCardOrg: {
    borderColor: Colors.organization,
    backgroundColor: '#F9F4FB',
  },
  avatarWrapper: {
    width: 78,
    height: 78,
    borderRadius: 18,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cardDetails: {
    flex: 1,
    paddingRight: 14,
    alignItems: 'flex-end',
  },
  roleHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  roleName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  tagBadgeVolunteer: {
    backgroundColor: '#D1F2D9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagBadgeTextVolunteer: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  tagBadgeOrg: {
    backgroundColor: '#EBD9F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagBadgeTextOrg: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.organization,
  },
  roleSubtitleText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginBottom: 6,
    lineHeight: 16,
  },
  perksRow: {
    flexDirection: 'row-reverse',
  },
  perkText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeCheckmarkVolunteer: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    left: '50%',
    transform: [{ translateX: -12 }],
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  activeCheckmarkOrg: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    left: '50%',
    transform: [{ translateX: -12 }],
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.organization,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  continueButton: {
    marginTop: 6,
  },
  footerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerQuestion: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  footerLoginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.mainBlue,
  },
});
