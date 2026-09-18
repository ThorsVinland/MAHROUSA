import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { TopBar } from '../../components/home/TopBar';

export default function OrgDashboardScreen() {
  const { colors: Colors } = useTheme();
  const { user } = useAuthStore();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const orgUser = user as any;
  const wilaya = orgUser?.wilaya || 'الجزائر العاصمة';

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar wilaya={wilaya} />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Quick Stats Placeholder */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>نظرة عامة</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>مهمة نشطة</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>45</Text>
              <Text style={styles.statLabel}>متطوع متاح</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>120</Text>
              <Text style={styles.statLabel}>ساعة موثقة</Text>
            </View>
          </View>
        </View>

        {/* Recent Needs / Tasks */}
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>المهام الحالية</Text>
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>لا توجد مهام نشطة حالياً.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.pageBackground,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80, // For BottomNavBar
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primaryText,
    marginBottom: 12,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0EBE1',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primaryNavy,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  recentContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  placeholderCard: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0EBE1',
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.placeholder,
    fontWeight: '600',
  },
});
