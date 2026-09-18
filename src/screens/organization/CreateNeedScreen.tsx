// ============================================================
// src/screens/organization/CreateNeedScreen.tsx
// Screen for creating new volunteer needs / announcements to Firestore
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SolidarityMap } from '../../components/map/SolidarityMap';
import { useAuthStore } from '../../store/authStore';
import { WILAYAS } from '../../constants/algeria';
import { NeedType, PriorityLevel } from '../../types/need.types';
import { createNeed } from '../../services/needsService';

const NEED_TYPES: { id: NeedType; label: string; icon: string; desc: string }[] = [
  { id: 'يد عاملة', label: 'يد عاملة', icon: 'people', desc: 'متطوعون ميدانيون' },
  { id: 'مقر تخزين', label: 'مقر تخزين', icon: 'home', desc: 'مستودع أو نقطة تجميع' },
  { id: 'شاحنة', label: 'شاحنة', icon: 'bus', desc: 'نقل ولوجستيك' },
  { id: 'خبرة', label: 'خبرة', icon: 'school', desc: 'استشارة أو تخصص' },
];

const PRIORITIES: { id: PriorityLevel; label: string; badge: string; color: string; bg: string; borderColor: string }[] = [
  { id: 'urgent', label: 'عاجل', badge: 'بطاقة حمراء', color: '#E74C3C', bg: '#FEE2E2', borderColor: '#E74C3C' },
  { id: 'medium', label: 'متوسط', badge: 'بطاقة صفراء', color: '#D97706', bg: '#FEF3C7', borderColor: '#F59E0B' },
  { id: 'normal', label: 'عادي', badge: 'بطاقة خضراء', color: '#27AE60', bg: '#DCFCE7', borderColor: '#27AE60' },
];

export default function CreateNeedScreen({ navigation }: any) {
  const { colors: Colors } = useTheme();
  const { user } = useAuthStore();
  const styles = useMemo(() => getStyles(Colors), [Colors]);

  const orgUser = user as any;

  // Form State
  const [title, setTitle] = useState('');
  const [needType, setNeedType] = useState<NeedType>('يد عاملة');
  const [quantity, setQuantity] = useState('10');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState(orgUser?.wilaya || '16');
  const [locationDetails, setLocationDetails] = useState('');
  const [phone, setPhone] = useState(orgUser?.phone || orgUser?.phoneNumber || '');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('urgent');

  // Dates
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const defaultEndStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  }, []);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEndStr);

  // Modals
  const [isWilayaModalVisible, setIsWilayaModalVisible] = useState(false);
  const [wilayaSearch, setWilayaSearch] = useState('');
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected Wilaya Object
  const selectedWilayaObj = useMemo(() => {
    const cleanCode = selectedWilayaCode?.padStart(2, '0');
    return WILAYAS.find((w) => w.value === cleanCode || w.value === selectedWilayaCode) || WILAYAS[15];
  }, [selectedWilayaCode]);

  const filteredWilayas = useMemo(() => {
    if (!wilayaSearch.trim()) return WILAYAS;
    return WILAYAS.filter(
      (w) =>
        w.label.toLowerCase().includes(wilayaSearch.toLowerCase()) ||
        w.value.includes(wilayaSearch)
    );
  }, [wilayaSearch]);

  const handleQuickQuantity = (num: number) => {
    setQuantity(String(num));
  };

  const handleAdjustQuantity = (delta: number) => {
    const current = parseInt(quantity, 10) || 0;
    const nextVal = Math.max(1, current + delta);
    setQuantity(String(nextVal));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال عنوان الإعلان أو الاحتياج.');
      return;
    }
    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      Alert.alert('تنبيه', 'يرجى تحديد عدد الأشخاص المطلوب بشكل صحيح.');
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert('تنبيه', 'يرجى تحديد مدة الاحتياج (من تاريخ ... إلى تاريخ ...).');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('تنبيه', 'يرجى كتابة رقم هاتف التواصل للجمعية.');
      return;
    }

    try {
      setIsSubmitting(true);

      const orgName =
        orgUser?.name ||
        orgUser?.organizationName ||
        orgUser?.fullName ||
        'جمعية محروسة';

      await createNeed({
        title: title.trim(),
        needType: needType,
        quantity: qtyNum,
        wilaya: selectedWilayaObj.value,
        wilayaName: selectedWilayaObj.label,
        locationDetails: locationDetails.trim() || selectedWilayaObj.label,
        coordinates: pickedLocation,
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        priority: priority,
        description: description.trim(),
        organizationId: orgUser?.id || orgUser?.phone || 'org_default',
        organizationName: orgName,
        organizationPhone: phone.trim(),
      });

      setIsSubmitting(false);

      Alert.alert('تم بنجاح ✓', 'تم نشر إعلان الاحتياج في Firestore بنجاح وستظهر فوراً لجميع المتطوعين!', [
        { text: 'تم', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      setIsSubmitting(false);
      console.error('Error submitting need:', error);
      Alert.alert('خطأ', error?.message || 'فشل في نشر الاحتياج، يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-forward" size={20} color={Colors.primaryNavy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>نشر إعلان احتياج جديد</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* 1. عنوان الاحتياج */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>عنوان الإعلان / الاحتياج *</Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: مطلوب متطوعون لتوزيع المساعدات في حي السلام"
            placeholderTextColor={Colors.placeholder}
            value={title}
            onChangeText={setTitle}
            textAlign="right"
          />
        </View>

        {/* 2. نوع الاحتياج */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>نوع الاحتياج *</Text>
          <View style={styles.needTypesGrid}>
            {NEED_TYPES.map((item) => {
              const isSelected = needType === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                  onPress={() => setNeedType(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.typeIconBox, isSelected && styles.typeIconBoxSelected]}>
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={isSelected ? '#FFFFFF' : Colors.mainBlue}
                    />
                  </View>
                  <Text style={[styles.typeTitle, isSelected && styles.typeTitleSelected]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.typeDesc, isSelected && styles.typeDescSelected]}>
                    {item.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. الأولوية (أحمر، أصفر، أخضر) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>درجة الأولوية (نوع البطاقة) *</Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map((p) => {
              const isSelected = priority === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.priorityCard,
                    { borderColor: isSelected ? p.color : '#E5E7EB', backgroundColor: isSelected ? p.bg : Colors.surface },
                  ]}
                  onPress={() => setPriority(p.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                  <Text style={[styles.priorityLabel, { color: p.color, fontWeight: isSelected ? '800' : '600' }]}>
                    {p.label}
                  </Text>
                  <Text style={styles.priorityBadge}>{p.badge}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 4. الكمية: عدد الأشخاص */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>الكمية: عدد الأشخاص المطلوبين *</Text>
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => handleAdjustQuantity(-1)}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={20} color={Colors.primaryNavy} />
            </TouchableOpacity>

            <TextInput
              style={styles.stepperInput}
              keyboardType="number-pad"
              value={quantity}
              onChangeText={setQuantity}
              textAlign="center"
            />

            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => handleAdjustQuantity(1)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color={Colors.primaryNavy} />
            </TouchableOpacity>
          </View>

          {/* Quick Presets */}
          <View style={styles.presetsRow}>
            {[5, 10, 20, 30, 50].map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.presetChip, quantity === String(num) && styles.presetChipActive]}
                onPress={() => handleQuickQuantity(num)}
              >
                <Text style={[styles.presetText, quantity === String(num) && styles.presetTextActive]}>
                  {num} شخص
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 5. المدة: من تاريخ ... إلى تاريخ ... */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>المدة الزمنية (من تاريخ ... إلى تاريخ ...) *</Text>
          <View style={styles.dateRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.subLabel}>إلى غاية تاريخ:</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.placeholder}
                value={endDate}
                onChangeText={setEndDate}
                textAlign="center"
              />
            </View>

            <View style={{ width: 12 }} />

            <View style={{ flex: 1 }}>
              <Text style={styles.subLabel}>من تاريخ:</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.placeholder}
                value={startDate}
                onChangeText={setStartDate}
                textAlign="center"
              />
            </View>
          </View>
        </View>

        {/* 6. الموقع (الولاية + تفاصيل الموقع + الخريطة) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>الموقع والولاية *</Text>
          <TouchableOpacity
            style={styles.dropdownSelector}
            onPress={() => setIsWilayaModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
            <Text style={styles.dropdownText}>{selectedWilayaObj.label}</Text>
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { marginTop: 10 }]}
            placeholder="تفاصيل العنوان (البلدية، الحي، نقطة التجمع...)"
            placeholderTextColor={Colors.placeholder}
            value={locationDetails}
            onChangeText={setLocationDetails}
            textAlign="right"
          />

          <TouchableOpacity
            style={[styles.mapButton, pickedLocation && styles.mapButtonActive]}
            onPress={() => setIsMapModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="location-sharp"
              size={22}
              color={pickedLocation ? Colors.success : Colors.mainBlue}
            />
            <Text style={[styles.mapButtonText, pickedLocation && { color: Colors.success }]}>
              {pickedLocation
                ? 'تم تحديد الإحداثيات على الخريطة ✓'
                : 'تحديد الموقع الجغرافي على الخريطة (اختياري)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 7. هاتف التواصل */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>رقم هاتف التواصل للجمعية *</Text>
          <TextInput
            style={styles.input}
            placeholder="05 / 06 / 07 ..."
            placeholderTextColor={Colors.placeholder}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            textAlign="right"
          />
        </View>

        {/* 8. تفاصيل إضافية */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>تفاصيل إضافية وشروط المتطوعين</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="اكتب أية شروط خاصة، المعدات المطلوبة، أو معلومات تفيد المتطوعين..."
            placeholderTextColor={Colors.placeholder}
            value={description}
            onChangeText={setDescription}
            textAlign="right"
            multiline
            numberOfLines={4}
          />
        </View>
      </ScrollView>

      {/* Footer Submit */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>نشر الاحتياج في Firestore</Text>
              <Ionicons name="cloud-upload-outline" size={22} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Wilaya Selection Modal */}
      <Modal visible={isWilayaModalVisible} animationType="slide" onRequestClose={() => setIsWilayaModalVisible(false)}>
        <SafeAreaView style={styles.modalSafeArea} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsWilayaModalVisible(false)} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>إغلاق</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>اختر الولاية</Text>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={Colors.placeholder} />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث باسم الولاية أو رقمها..."
              placeholderTextColor={Colors.placeholder}
              value={wilayaSearch}
              onChangeText={setWilayaSearch}
              textAlign="right"
            />
          </View>

          <FlatList
            data={filteredWilayas}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => {
              const isSelected = selectedWilayaObj.value === item.value;
              return (
                <TouchableOpacity
                  style={[styles.wilayaItem, isSelected && styles.wilayaItemSelected]}
                  onPress={() => {
                    setSelectedWilayaCode(item.value);
                    setIsWilayaModalVisible(false);
                  }}
                >
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color={Colors.mainBlue} />}
                  <Text style={[styles.wilayaItemText, isSelected && styles.wilayaItemTextSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Modal>

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
              <Text style={styles.confirmMapText}>تأكيد الموقع المحدد</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: Colors.pageBackground,
    },
    header: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
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
      marginBottom: 22,
    },
    label: {
      fontSize: 14,
      fontWeight: '700',
      color: Colors.primaryText,
      marginBottom: 8,
      textAlign: 'right',
    },
    subLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: Colors.textSecondary,
      marginBottom: 4,
      textAlign: 'right',
    },
    input: {
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 13,
      fontSize: 15,
      color: Colors.primaryText,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    needTypesGrid: {
      flexDirection: 'row-reverse',
      flexWrap: 'wrap',
      gap: 10,
    },
    typeCard: {
      width: '48%',
      backgroundColor: Colors.surface,
      borderWidth: 1.5,
      borderColor: '#E5E7EB',
      borderRadius: 16,
      padding: 12,
      alignItems: 'center',
    },
    typeCardSelected: {
      borderColor: Colors.mainBlue,
      backgroundColor: '#F0F8FF',
    },
    typeIconBox: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: '#EBF5FB',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    typeIconBoxSelected: {
      backgroundColor: Colors.mainBlue,
    },
    typeTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: Colors.primaryText,
      marginBottom: 2,
    },
    typeTitleSelected: {
      color: Colors.mainBlue,
    },
    typeDesc: {
      fontSize: 11,
      color: Colors.textSecondary,
      textAlign: 'center',
    },
    typeDescSelected: {
      color: Colors.mainBlue,
    },
    priorityRow: {
      flexDirection: 'row-reverse',
      gap: 8,
    },
    priorityCard: {
      flex: 1,
      borderRadius: 14,
      borderWidth: 1.5,
      paddingVertical: 12,
      paddingHorizontal: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    priorityDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginBottom: 4,
    },
    priorityLabel: {
      fontSize: 14,
      marginBottom: 2,
    },
    priorityBadge: {
      fontSize: 10,
      color: Colors.textSecondary,
      fontWeight: '600',
    },
    stepperContainer: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      backgroundColor: Colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      overflow: 'hidden',
    },
    stepperBtn: {
      width: 50,
      height: 48,
      backgroundColor: '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepperInput: {
      flex: 1,
      fontSize: 18,
      fontWeight: '800',
      color: Colors.primaryNavy,
      paddingVertical: 10,
    },
    presetsRow: {
      flexDirection: 'row-reverse',
      gap: 8,
      marginTop: 8,
    },
    presetChip: {
      backgroundColor: Colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    presetChipActive: {
      backgroundColor: Colors.primaryNavy,
      borderColor: Colors.primaryNavy,
    },
    presetText: {
      fontSize: 12,
      fontWeight: '600',
      color: Colors.textSecondary,
    },
    presetTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    dateRow: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
    },
    dropdownSelector: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    dropdownText: {
      fontSize: 15,
      fontWeight: '700',
      color: Colors.primaryText,
    },
    mapButton: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.surface,
      borderWidth: 1.5,
      borderColor: Colors.mainBlue,
      borderStyle: 'dashed',
      borderRadius: 12,
      paddingVertical: 14,
      marginTop: 10,
      gap: 8,
    },
    mapButtonActive: {
      borderColor: Colors.success,
      backgroundColor: '#F0FDF4',
    },
    mapButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: Colors.mainBlue,
    },
    footer: {
      padding: 18,
      backgroundColor: Colors.surface,
      borderTopWidth: 1,
      borderTopColor: '#F0EBE1',
    },
    submitButton: {
      flexDirection: 'row-reverse',
      backgroundColor: Colors.primaryNavy,
      borderRadius: 16,
      paddingVertical: 15,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      elevation: 2,
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
      padding: 6,
    },
    modalCloseText: {
      color: '#E74C3C',
      fontSize: 15,
      fontWeight: '700',
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: '#1A1A2E',
    },
    searchBox: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      margin: 14,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      gap: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 14,
    },
    wilayaItem: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: '#F0EBE1',
      backgroundColor: '#FFFFFF',
    },
    wilayaItemSelected: {
      backgroundColor: '#F0F8FF',
    },
    wilayaItemText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#1A1A2E',
    },
    wilayaItemTextSelected: {
      color: Colors.mainBlue,
      fontWeight: '800',
    },
    modalMapContainer: {
      flex: 1,
    },
    modalFooter: {
      padding: 16,
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
    },
    confirmMapButton: {
      backgroundColor: '#27AE60',
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: 'center',
    },
    confirmMapText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
  });
