import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet,  TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../../hooks/useTheme';
import useAuth from '../../../hooks/useAuth';
import { spacing, typography, radius, shadows } from '../../../theme';

export default function OrgDashboardScreen() {
  const { colors } = useTheme();
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={[styles.iconBox, { backgroundColor: colors.organization + '20' }]}>
          <Ionicons name="business" size={48} color={colors.organization} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>لوحة تحكم الجمعية / الهيئة</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          مرحباً بك {user?.name || ''} ({user?.phone || ''})
        </Text>

        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.urgent }]}
          onPress={logout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginLeft: 8 }} />
          <Text style={styles.logoutText}>تسجيل الخروج والعودة لصفحة الدخول</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    padding: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
    ...shadows.lg,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    width: '100%',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
});
