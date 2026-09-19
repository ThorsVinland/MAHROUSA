// ============================================================
// src/screens/volunteer/SupervisorTeamScreen.tsx
// Real-time Supervisor Team Management synced with Firestore
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Pressable,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAlert } from '../../context/AlertContext';
import { useAuthStore } from '../../store/authStore';
import CustomPhoneInput from '../../components/common/CustomPhoneInput';
import { normalizeDigits } from '../../utils/formatters';
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

interface TeamMember {
  id: string;
  name: string;
  phone: string;
  role: string;
  status: string;
  createdAt?: any;
}

const TEAM_ROLES = [
  { id: 'سائق / نقل', label: '🚛 سائق / نقل' },
  { id: 'مساعد لوجستي', label: '📦 مساعد لوجستي' },
  { id: 'إسعاف وتمريض', label: '⚕️ إسعاف وتمريض' },
  { id: 'توزيع وإغاثة', label: '🤲 توزيع وإغاثة' },
  { id: 'تنظيم وتنسيق', label: '📋 تنظيم وتنسيق' },
  { id: 'other', label: '🔧 دور آخر' },
];

export default function SupervisorTeamScreen() {
  const { colors: Colors, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();
  const { user } = useAuthStore();

  const supervisorPhone = user?.phone || user?.id || '';

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole] = useState('');

  // 1. Real-time Firestore synchronization for team members
  useEffect(() => {
    if (!supervisorPhone) {
      setIsLoading(false);
      return;
    }

    const teamRef = collection(db, 'volunteers', supervisorPhone, 'team');
    const unsubscribe = onSnapshot(
      teamRef,
      (snapshot) => {
        const members: TeamMember[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          members.push({
            id: docSnap.id,
            name: data.name || 'متطوع مسجل',
            phone: data.phone || '',
            role: data.role || 'عضو فريق',
            status: data.status || 'متاح',
            createdAt: data.createdAt,
          });
        });
        // Sort newest first
        members.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setTeamMembers(members);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching team members from Firestore:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [supervisorPhone]);

  // 2. Add New Member to Firestore
  const handleAddMember = async () => {
    const cleanPhone = normalizeDigits(newMemberPhone).replace(/^0/, '').trim();
    if (!cleanPhone || cleanPhone.length < 8) {
      showAlert('تنبيه', 'يرجى إدخال رقم هاتف جزائري صالح مكون من 9 أرقام.');
      return;
    }

    const finalRole = selectedRole === 'other' ? customRole.trim() : selectedRole;
    if (!finalRole) {
      showAlert('تنبيه', 'يرجى اختيار دور المتطوع في الفريق أو تحديده يدوياً.');
      return;
    }

    try {
      setIsSubmitting(true);
      const fullPhone = `0${cleanPhone}`;
      const intlPhone = `+213${cleanPhone}`;

      // Check if the volunteer exists in Firestore to get their real name
      let memberName = 'متطوع';
      try {
        const vSnap = await getDoc(doc(db, 'volunteers', fullPhone));
        if (vSnap.exists()) {
          memberName = vSnap.data()?.fullName || memberName;
        } else {
          const vSnap2 = await getDoc(doc(db, 'volunteers', intlPhone));
          if (vSnap2.exists()) {
            memberName = vSnap2.data()?.fullName || memberName;
          }
        }
      } catch (err) {
        console.warn('Notice checking volunteer name:', err);
      }

      // Add to Firestore team subcollection
      const teamRef = collection(db, 'volunteers', supervisorPhone, 'team');
      await addDoc(teamRef, {
        name: memberName,
        phone: fullPhone,
        role: finalRole,
        status: 'متاح',
        createdAt: serverTimestamp(),
      });

      setNewMemberPhone('');
      setSelectedRole('');
      setCustomRole('');
      setIsAddModalVisible(false);
      Keyboard.dismiss();
      showAlert('تم بنجاح', `تمت إضافة المتطوع (${memberName}) إلى فريقك.`);
    } catch (error) {
      console.error('Error adding team member:', error);
      showAlert('خطأ', 'فشل في إضافة المتطوع إلى الفريق، يرجى المحاولة لاحقاً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Remove Member from Firestore
  const handleRemoveMember = (id: string, name: string) => {
    showAlert('تأكيد الحذف', `هل أنت متأكد من رغبتك في إزالة المتطوع (${name}) من فريقك؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'إزالة',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'volunteers', supervisorPhone, 'team', id));
            showAlert('تم بنجاح', 'تمت إزالة المتطوع من الفريق.');
          } catch (err) {
            console.error('Error removing team member:', err);
            showAlert('خطأ', 'تعذر إزالة المتطوع، حاول مجدداً.');
          }
        },
      },
    ]);
  };

  const handleCallMember = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: Colors.pageBackground }]}
      edges={['top', 'bottom', 'left', 'right']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: Colors.border || '#F0EBE1' }]}>
        <View style={{ width: 32 }} />
        <Text style={[styles.headerTitle, { color: Colors.primaryNavy }]}>إدارة الفريق</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.primaryNavy} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors.primaryNavy }]}>
            أعضاء فريقي المعتمدين ({teamMembers.length})
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.mainBlue} />
            <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>
              جاري تحميل أعضاء الفريق...
            </Text>
          </View>
        ) : teamMembers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={56} color={Colors.placeholder} />
            <Text style={[styles.emptyStateTitle, { color: Colors.primaryText }]}>
              لا يوجد أعضاء في فريقك حالياً
            </Text>
            <Text style={[styles.emptyStateText, { color: Colors.textSecondary }]}>
              اضغط على زر "إضافة متطوع للفريق" بالأسفل لإضافة أعضاء وتوزيع المهام الميدانية.
            </Text>
          </View>
        ) : (
          teamMembers.map((member) => (
            <View
              key={member.id}
              style={[styles.memberCard, { backgroundColor: Colors.surface }]}
            >
              <View style={styles.memberInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {member.name ? member.name.charAt(0).toUpperCase() : 'م'}
                  </Text>
                </View>
                <View style={styles.memberTextContainer}>
                  <Text style={[styles.memberName, { color: Colors.primaryText }]}>
                    {member.name}
                  </Text>
                  <View style={styles.roleRow}>
                    <Text style={[styles.memberRole, { color: Colors.textSecondary }]}>
                      {member.role}
                    </Text>
                    <Text style={styles.dotSeparator}> • </Text>
                    <Text
                      style={[
                        styles.statusText,
                        { color: member.status === 'متاح' ? '#27AE60' : '#F59E0B' },
                      ]}
                    >
                      {member.status}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.memberActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F0FDF4' }]}
                  onPress={() => handleCallMember(member.phone)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="call" size={18} color="#27AE60" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#FEF2F2' }]}
                  onPress={() => handleRemoveMember(member.id, member.name)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={18} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Member Floating Bottom Bar */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: Colors.surface, borderTopColor: Colors.border || '#F0EBE1' },
        ]}
      >
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: Colors.mainBlue }]}
          onPress={() => setIsAddModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>إضافة متطوع للفريق</Text>
        </TouchableOpacity>
      </View>

      {/* Add Member Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          Keyboard.dismiss();
          setIsAddModalVisible(false);
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            Keyboard.dismiss();
            setIsAddModalVisible(false);
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}
          >
            <Pressable
              style={[styles.modalContent, { backgroundColor: Colors.surface }]}
              onPress={(e) => e.stopPropagation()}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: Colors.primaryNavy }]}>
                    إضافة متطوع إلى الفريق
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      setIsAddModalVisible(false);
                    }}
                    style={styles.closeBtn}
                  >
                    <Ionicons name="close" size={24} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.formDesc, { color: Colors.textSecondary }]}>
                  أدخل رقم هاتف المتطوع المسجل في تطبيق محروسة لإضافته لفريقك.
                </Text>

                {/* Phone Input matching Register */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: Colors.primaryText }]}>
                    رقم هاتف المتطوع
                  </Text>
                  <CustomPhoneInput
                    label=""
                    error=""
                    style={{}}
                    themeMode={isDarkMode ? 'dark' : 'light'}
                    value={newMemberPhone}
                    onChangeText={setNewMemberPhone}
                    iconName="call-outline"
                  />
                </View>

                {/* Role Options */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: Colors.primaryText }]}>
                    دور المتطوع في الفريق
                  </Text>
                  <View style={styles.rolesGrid}>
                    {TEAM_ROLES.map((roleItem) => {
                      const isSelected = selectedRole === roleItem.id;
                      return (
                        <TouchableOpacity
                          key={roleItem.id}
                          style={[
                            styles.roleChip,
                            {
                              backgroundColor: isSelected
                                ? Colors.mainBlue
                                : (isDarkMode ? '#1E293B' : '#F8FAFC'),
                              borderColor: isSelected
                                ? Colors.mainBlue
                                : (Colors.border || '#E2E8F0'),
                            },
                          ]}
                          onPress={() => setSelectedRole(roleItem.id)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.roleChipText,
                              { color: isSelected ? '#FFFFFF' : Colors.primaryText },
                            ]}
                          >
                            {roleItem.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Custom Role Input if "other" is selected */}
                {selectedRole === 'other' && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: Colors.primaryText }]}>
                      حدد الدور المطلوب
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: Colors.pageBackground,
                          borderColor: Colors.border || '#E5E7EB',
                          color: Colors.primaryText,
                        },
                      ]}
                      placeholder="مثال: مسؤول اتصالات، إسعافات أولية..."
                      placeholderTextColor={Colors.placeholder}
                      value={customRole}
                      onChangeText={setCustomRole}
                      textAlign="right"
                    />
                  </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: Colors.mainBlue }]}
                  onPress={handleAddMember}
                  activeOpacity={0.85}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>إضافة المتطوع للفريق</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scrollContainer: { padding: 20, paddingBottom: 110 },
  sectionHeader: { marginBottom: 16, alignItems: 'flex-end' },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  loadingBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  loadingText: { fontSize: 14, marginTop: 10 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50, paddingHorizontal: 20 },
  emptyStateTitle: { fontSize: 17, fontWeight: '800', marginTop: 16, textAlign: 'center' },
  emptyStateText: { fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 22 },
  memberCard: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  memberInfo: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#0284C7' },
  memberTextContainer: { flex: 1, alignItems: 'flex-end' },
  memberName: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  roleRow: { flexDirection: 'row-reverse', alignItems: 'center' },
  memberRole: { fontSize: 13, fontWeight: '500' },
  dotSeparator: { fontSize: 13, color: '#9CA3AF' },
  statusText: { fontSize: 13, fontWeight: '700' },
  memberActions: { flexDirection: 'row-reverse', gap: 8, marginLeft: 8 },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  addBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    padding: 20,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  closeBtn: { padding: 4 },
  formDesc: {
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'right',
    lineHeight: 20,
  },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
  },
  rolesGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
