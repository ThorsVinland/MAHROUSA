// ============================================================
// src/screens/organization/CreateNeedScreen.tsx
// Screen for creating new volunteer needs / crisis alerts
// ============================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SolidarityMap } from '../../components/map/SolidarityMap';
import { useAuthStore } from '../../store/authStore';

const VOLUNTEER_ROLES = ['أطباء', 'سائقون', 'مسعفون', 'لوجستيك', 'ميداني', 'دعم نفسي', 'أشغال شاقة'];

export default function CreateNeedScreen({ navigation }: any) {
  const { colors: Colors } = useTheme();
  const { user } = useAuthStore();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const [title, setTitle] = useState('');
  const [departureWilaya, setDepartureWilaya] = useState('');
  const [arrivalWilaya, setArrivalWilaya] = useState('');
  const orgUser = user as any;
  const [phone, setPhone] = useState(orgUser?.phoneNumber || '');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  // Map Picker State
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSubmit = () => {
    if (!title || !departureWilaya || !arrivalWilaya || !phone || !pickedLocation) {
      Alert.alert('خطأ', 'يرجى تعبئة جميع الحقول وتحديد الموقع على الخريطة.');
      return;
    }
    
    // TODO: Connect to Firebase
    Alert.alert('تم بنجاح', 'تم نشر إعلان الاحتياج بنجاح!', [
      { text: 'حسناً', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-forward" size={20} color={Colors.primaryNavy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>نشر إعلان احتياج</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Form Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>عنوان/نوع الاحتياج *</Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: مطلوب قافلة طبية عاجلة"
            placeholderTextColor={Colors.placeholder}
            value={title}
            onChangeText={setTitle}
            textAlign="right"
          />
        </View>

        <View style={styles.rowGroup}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>ولاية الوصول *</Text>
            <TextInput
              style={styles.input}
              placeholder="الولاية المتضررة"
              placeholderTextColor={Colors.placeholder}
              value={arrivalWilaya}
              onChangeText={setArrivalWilaya}
              textAlign="right"
            />
          </View>
          <View style={{ width: 12 }} />
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>ولاية الإقلاع *</Text>
            <TextInput
              style={styles.input}
              placeholder="ولاية الجمعية"
              placeholderTextColor={Colors.placeholder}
              value={departureWilaya}
              onChangeText={setDepartureWilaya}
              textAlign="right"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>رقم هاتف التواصل للجمعية *</Text>
          <TextInput
            style={styles.input}
            placeholder="رقم الهاتف"
            placeholderTextColor={Colors.placeholder}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            textAlign="right"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>نوع المتطوعين المطلوبين (يمكن اختيار أكثر من واحد)</Text>
          <View style={styles.rolesContainer}>
            {VOLUNTEER_ROLES.map((role) => {
              const isSelected = selectedRoles.includes(role);
              return (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleChip, isSelected && styles.roleChipActive]}
                  onPress={() => toggleRole(role)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.roleChipText, isSelected && styles.roleChipTextActive]}>
                    {role}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>تفاصيل إضافية</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="اكتب أي تفاصيل أخرى قد تفيد المتطوعين..."
            placeholderTextColor={Colors.placeholder}
            value={description}
            onChangeText={setDescription}
            textAlign="right"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>تحديد الموقع الجغرافي *</Text>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => setIsMapModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="map-outline" size={24} color={pickedLocation ? Colors.success : Colors.mainBlue} />
            <Text style={[styles.mapButtonText, pickedLocation && { color: Colors.success }]}>
              {pickedLocation ? 'تم تحديد الموقع بنجاح ✓' : 'افتح الخريطة لتحديد الموقع'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
          <Text style={styles.submitButtonText}>نشر الاحتياج</Text>
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Map Picker Modal */}
      <Modal visible={isMapModalVisible} animationType="slide" onRequestClose={() => setIsMapModalVisible(false)}>
        <SafeAreaView style={styles.modalSafeArea} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsMapModalVisible(false)} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>إغلاق</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>اضغط على الخريطة لتحديد الموقع</Text>
          </View>
          <View style={styles.modalMapContainer}>
            <SolidarityMap
              onMapPress={(coords) => setPickedLocation(coords)}
              pickedLocation={pickedLocation}
            />
          </View>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.confirmMapButton}
              onPress={() => setIsMapModalVisible(false)}
            >
              <Text style={styles.confirmMapText}>تأكيد الموقع</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.pageBackground,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE1',
    backgroundColor: Colors.surface,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0EBE1',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primaryText,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 20,
  },
  rowGroup: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryText,
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  rolesContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 10,
  },
  roleChip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  roleChipActive: {
    backgroundColor: Colors.mainBlue,
    borderColor: Colors.mainBlue,
  },
  roleChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  roleChipTextActive: {
    color: '#FFFFFF',
  },
  mapButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.mainBlue,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  mapButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.mainBlue,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#F0EBE1',
  },
  submitButton: {
    flexDirection: 'row-reverse',
    backgroundColor: Colors.mainBlue,
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#F8F4EE',
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCloseBtn: {
    padding: 8,
  },
  modalCloseText: {
    color: '#E74C3C',
    fontSize: 15,
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  modalMapContainer: {
    flex: 1,
  },
  modalFooter: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  confirmMapButton: {
    backgroundColor: '#27AE60',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmMapText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
