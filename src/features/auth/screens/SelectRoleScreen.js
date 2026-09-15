import { SafeAreaView } from 'react-native-safe-area-context';
// ============================================================
// src/features/auth/screens/SelectRoleScreen.js
// واجهة اختيار نوع الحساب بتصميم عصري مفتوح (Open Space) مستوحى من النموذج
// ============================================================

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
   
  TouchableOpacity, 
  StatusBar, 
  ScrollView,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../../hooks/useTheme';
import { spacing, typography, radius, shadows } from '../../../theme';

const { width } = Dimensions.get('window');

export default function SelectRoleScreen({ onSelect, onGoToLogin, navigation }) {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [selectedRole, setSelectedRole] = useState('volunteer'); // 'volunteer' أو 'organization' فقط

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (onSelect) {
      onSelect(selectedRole);
    } else if (navigation?.navigate) {
      navigation.navigate('Register', { role: selectedRole });
    }
  };

  const handleGoToLogin = () => {
    if (onGoToLogin) {
      onGoToLogin();
    } else if (navigation?.navigate) {
      navigation.navigate('Login', { initialRole: selectedRole });
    }
  };

  const isVolunteer = selectedRole === 'volunteer';
  const isOrg = selectedRole === 'organization';

  return (
    <SafeAreaView edges={["top", "bottom", "left", "right"]} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background}
      />

      {/* عناصر هندسية جمالية في الخلفية (نفس فلسفة الصورة التوضيحية) */}
      <View style={styles.backgroundDecorations} pointerEvents="none">
        {/* مربع مائل بلون خوخي فاتح */}
        <View style={[styles.decorShape, styles.decorSquare, { borderColor: '#FDBA74' }]} />
        {/* معين بلون فيروزي فاتح */}
        <View style={[styles.decorShape, styles.decorDiamond, { borderColor: '#5EEAD4' }]} />
        {/* خط تموج أصفر */}
        <View style={[styles.decorSquiggle, { borderColor: '#FDE047' }]} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        {/* Top Navigation Bar: Indicator Pill & Theme Toggle */}
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={[styles.themeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isDarkMode ? 'sunny-outline' : 'moon-outline'} 
              size={20} 
              color={colors.text} 
            />
          </TouchableOpacity>

          {/* Indicator Pill المستوحى من التصميم المرجعي */}
          <View style={styles.indicatorPillContainer}>
            <View style={[styles.indicatorBar, { backgroundColor: colors.border }]} />
            <View style={[styles.indicatorBarActive, { backgroundColor: colors.accent || '#5B50E6' }]} />
            <View style={[styles.indicatorBar, { backgroundColor: colors.border }]} />
          </View>

          <View style={{ width: 40 }} />
        </View>

        {/* Large Open-Space Header */}
        <View style={styles.headerSection}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>
            اختر{'\n'}نوع الحساب
          </Text>
          <Text style={[styles.englishSubtitle, { color: colors.textSecondary }]}>
            Select user type
          </Text>
          <Text style={[styles.headerDescription, { color: colors.textSecondary }]}>
            حدد صفتك للبدء في الاستفادة من منصة محروسة للتضامن والعمل الميداني
          </Text>
        </View>

        {/* Roles Selection Cards (Only 2 roles: Volunteer & Organization) */}
        <View style={styles.cardsContainer}>

          {/* 1. Volunteer Card (متطوع) */}
          <TouchableOpacity
            style={[
              styles.userCard,
              { 
                backgroundColor: isDarkMode ? colors.surface : (colors.volunteerLight || '#ECFDF5'),
                borderColor: isVolunteer ? (colors.volunteer || '#10B981') : (colors.volunteerBorder || '#A7F3D0'),
                borderWidth: isVolunteer ? 2.5 : 1,
              },
              isVolunteer && styles.selectedCardGlow,
            ]}
            onPress={() => handleRoleSelect('volunteer')}
            activeOpacity={0.88}
          >
            {/* الصورة التوضيحية للشخصية */}
            <View style={[styles.avatarWrapper, { backgroundColor: colors.surface }]}>
              <Image 
                source={require('../../../assets/images/volunteer_card.jpg')}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>

            {/* تفاصيل البطاقة */}
            <View style={styles.cardDetails}>
              <View style={styles.roleHeaderRow}>
                <Text style={[styles.roleName, { color: colors.text }]}>
                  متطوع
                </Text>
                <View style={[styles.tagBadge, { backgroundColor: colors.volunteer + '20' }]}>
                  <Text style={[styles.tagBadgeText, { color: colors.volunteer }]}>أفراد</Text>
                </View>
              </View>

              <Text style={[styles.roleSubtitleText, { color: colors.textSecondary }]}>
                المشاركة في المبادرات وحملات التضامن
              </Text>

              <View style={styles.perksRow}>
                <View style={styles.perkItem}>
                  <Ionicons name="sparkles-outline" size={14} color={colors.volunteer} />
                  <Text style={[styles.perkText, { color: colors.textSecondary }]}>ساعات موثقة</Text>
                </View>
                <View style={[styles.perkItem, { marginRight: 10 }]}>
                  <Ionicons name="location-outline" size={14} color={colors.volunteer} />
                  <Text style={[styles.perkText, { color: colors.textSecondary }]}>مهام قريبة</Text>
                </View>
              </View>
            </View>

            {/* أيقونة التحديد النشطة أسفل البطاقة تماماً مثل الصورة المرجعية */}
            {isVolunteer && (
              <View style={[styles.activeCheckmarkBadge, { backgroundColor: colors.volunteer || '#10B981' }]}>
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          {/* 2. Organization Card (جمعية / مؤسسة) */}
          <TouchableOpacity
            style={[
              styles.userCard,
              { 
                backgroundColor: isDarkMode ? colors.surface : (colors.organizationLight || '#F5EEF8'),
                borderColor: isOrg ? (colors.organization || '#8B5CF6') : (colors.organizationBorder || '#DDD6FE'),
                borderWidth: isOrg ? 2.5 : 1,
              },
              isOrg && styles.selectedCardGlow,
            ]}
            onPress={() => handleRoleSelect('organization')}
            activeOpacity={0.88}
          >
            {/* الصورة التوضيحية للشخصية */}
            <View style={[styles.avatarWrapper, { backgroundColor: colors.surface }]}>
              <Image 
                source={require('../../../assets/images/org_card.jpg')}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>

            {/* تفاصيل البطاقة */}
            <View style={styles.cardDetails}>
              <View style={styles.roleHeaderRow}>
                <Text style={[styles.roleName, { color: colors.text }]}>
                  جمعية / مؤسسة
                </Text>
                <View style={[styles.tagBadge, { backgroundColor: colors.organization + '20' }]}>
                  <Text style={[styles.tagBadgeText, { color: colors.organization }]}>منظمات</Text>
                </View>
              </View>

              <Text style={[styles.roleSubtitleText, { color: colors.textSecondary }]}>
                إدارة المبادرات واستقطاب وإشراف المتطوعين
              </Text>

              <View style={styles.perksRow}>
                <View style={styles.perkItem}>
                  <Ionicons name="people-outline" size={14} color={colors.organization} />
                  <Text style={[styles.perkText, { color: colors.textSecondary }]}>إدارة الفرق</Text>
                </View>
                <View style={[styles.perkItem, { marginRight: 10 }]}>
                  <Ionicons name="analytics-outline" size={14} color={colors.organization} />
                  <Text style={[styles.perkText, { color: colors.textSecondary }]}>تقارير ميدانية</Text>
                </View>
              </View>
            </View>

            {/* أيقونة التحديد النشطة أسفل البطاقة */}
            {isOrg && (
              <View style={[styles.activeCheckmarkBadge, { backgroundColor: colors.organization || '#8B5CF6' }]}>
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

        </View>

        {/* Action Button: Continue */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              { 
                backgroundColor: isOrg ? colors.organization : (colors.accent || '#5B50E6'),
              }
            ]}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>
              المتابعة كـ {isOrg ? 'جمعية' : 'متطوع'}
            </Text>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          </TouchableOpacity>
        </View>

        {/* Footer Login Link */}
        <View style={styles.footerRow}>
          <Text style={[styles.footerQuestion, { color: colors.textSecondary }]}>
            لديك حساب مسجل مسبقاً؟
          </Text>
          <TouchableOpacity onPress={handleGoToLogin} activeOpacity={0.7}>
            <Text style={[styles.footerLoginLink, { color: colors.accent || '#5B50E6' }]}>
              {' '}تسجيل الدخول
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
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
    justifyContent: 'space-between',
  },

  /* Background Floating Geometries */
  backgroundDecorations: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorShape: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderWidth: 2,
    opacity: 0.45,
  },
  decorSquare: {
    top: 60,
    left: 24,
    transform: [{ rotate: '25deg' }],
    borderRadius: 8,
  },
  decorDiamond: {
    top: 240,
    right: 20,
    transform: [{ rotate: '45deg' }],
    borderRadius: 6,
  },
  decorSquiggle: {
    position: 'absolute',
    top: 180,
    left: -15,
    width: 50,
    height: 18,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    opacity: 0.4,
    transform: [{ rotate: '-10deg' }],
  },

  /* Top Bar */
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  themeBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  indicatorPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  indicatorBar: {
    width: 14,
    height: 5,
    borderRadius: 4,
  },
  indicatorBarActive: {
    width: 24,
    height: 5,
    borderRadius: 4,
  },

  /* Open-Space Header Section */
  headerSection: {
    marginBottom: spacing.xl,
    paddingRight: 4,
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 44,
    textAlign: 'right',
    letterSpacing: -0.5,
  },
  englishSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 4,
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  headerDescription: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right',
    marginTop: spacing.sm,
  },

  /* Role Selection Cards */
  cardsContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  userCard: {
    position: 'relative',
    borderRadius: 26,
    padding: spacing.lg,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    minHeight: 140,
    ...shadows.sm,
  },
  selectedCardGlow: {
    ...shadows.md,
  },
  avatarWrapper: {
    width: 88,
    height: 88,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xs,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cardDetails: {
    flex: 1,
    paddingRight: spacing.md,
    alignItems: 'flex-end', // RTL
  },
  roleHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  roleName: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'right',
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  roleSubtitleText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  perksRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  perkItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  perkText: {
    fontSize: 12,
    fontWeight: '600',
  },

  /* Floating Selection Checkmark Indicator (Matches reference image) */
  activeCheckmarkBadge: {
    position: 'absolute',
    bottom: -12,
    alignSelf: 'center',
    left: '50%',
    transform: [{ translateX: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    ...shadows.md,
    zIndex: 10,
  },

  /* Continue Button */
  actionContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  continueButton: {
    height: 56,
    borderRadius: 30,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    ...shadows.md,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  /* Footer */
  footerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  footerQuestion: {
    fontSize: 14,
  },
  footerLoginLink: {
    fontSize: 14,
    fontWeight: '800',
  },
});
