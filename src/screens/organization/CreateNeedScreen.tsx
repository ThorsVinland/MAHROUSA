// ============================================================
// src/screens/organization/CreateNeedScreen.tsx
// Screen for creating new volunteer needs / announcements to Firestore
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomPhoneInput from '../../components/common/CustomPhoneInput';
import DatePickerModal from '../../components/common/DatePickerModal';
import { SolidarityMap } from '../../components/map/SolidarityMap';
import { WILAYAS } from '../../constants/algeria';
import { useAlert } from '../../context/AlertContext';
import { useTheme } from '../../context/ThemeContext';
import { MAP_MARKERS } from '../../data/homeMockData';
import { createNeed, subscribeToAllNeeds } from '../../services/needsService';
import { subscribeToLiveCrises } from '../../services/crisesService';
import { useAuthStore } from '../../store/authStore';
import { MapMarker } from '../../types/home.types';
import { NeedType, PriorityLevel } from '../../types/need.types';
const PhoneInput = CustomPhoneInput as React.ComponentType<any>;

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

export default function CreateNeedScreen({ navigation, route }: any) {
  const { colors: Colors, isDarkMode } = useTheme();
  const { showAlert }: any = useAlert();
  const { user } = useAuthStore();
  const styles = useMemo(() => getStyles(Colors), [Colors]);

  const orgUser = user as any;

  const initialCrisisTitle = route?.params?.crisisTitle;
  const initialWilaya = route?.params?.wilaya;
  const initialDesc = route?.params?.crisisDescription;

  // Form State
  const [title, setTitle] = useState(initialCrisisTitle ? `استجابة لأزمة ${initialCrisisTitle}` : '');
  const [needType, setNeedType] = useState<NeedType>('يد عاملة');
  const [quantity, setQuantity] = useState('10');
  const [phone, setPhone] = useState(orgUser?.phone || orgUser?.phoneNumber || '');
  const [description, setDescription] = useState(initialDesc ? `دعم عاجل لمواجهة أزمة ${initialCrisisTitle}: ${initialDesc}` : '');
  const [priority, setPriority] = useState<PriorityLevel>('urgent');

  // Origin Location (الانطلاق / نقطة التجمع)
  const [selectedWilayaCode, setSelectedWilayaCode] = useState(initialWilaya || orgUser?.wilaya || '16');
  const [locationDetails, setLocationDetails] = useState('');
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Destination Location (موقع الوصول)
  const [destinationWilayaCode, setDestinationWilayaCode] = useState<string>('');
  const [destinationLocationDetails, setDestinationLocationDetails] = useState('');
  const [destinationLocation, setDestinationLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Dates
  const today = new Date();
  const defaultEnd = new Date();
  defaultEnd.setDate(today.getDate() + 7);

  const [startDateObj, setStartDateObj] = useState(today);
  const [endDateObj, setEndDateObj] = useState(defaultEnd);

  const formatLocalDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const startDate = useMemo(() => formatLocalDate(startDateObj), [startDateObj]);
  const endDate = useMemo(() => formatLocalDate(endDateObj), [endDateObj]);

  // Modals & Navigation
  const [activeWilayaTarget, setActiveWilayaTarget] = useState<'origin' | 'destination'>('origin');
  const [isWilayaModalVisible, setIsWilayaModalVisible] = useState(false);
  const [wilayaSearch, setWilayaSearch] = useState('');

  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [mapTarget, setMapTarget] = useState<'origin' | 'destination'>('origin');
  const [tempPickedLocation, setTempPickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [tempSelectedCrisis, setTempSelectedCrisis] = useState<MapMarker | null>(null);

  const [isStartDatePickerVisible, setIsStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setIsEndDatePickerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Published Crises (Live Firestore Crises + Live Firestore Needs)
  const [publishedCrises, setPublishedCrises] = useState<MapMarker[]>([]);

  useEffect(() => {
    let currentNeedsCrises: MapMarker[] = [];
    let currentDashboardCrises: MapMarker[] = [];

    const combineAll = () => {
      const combined = [...currentDashboardCrises];
      currentNeedsCrises.forEach((fMarker) => {
        if (!combined.some((c) => c.id === fMarker.id)) {
          combined.push(fMarker);
        }
      });
      setPublishedCrises(combined);
    };

    const unsubCrises = subscribeToLiveCrises((crises) => {
      currentDashboardCrises = crises;
      combineAll();
    });

    const unsubNeeds = subscribeToAllNeeds((needs) => {
      currentNeedsCrises = needs
        .filter((n) => n.coordinates && n.coordinates.lat && n.coordinates.lng)
        .map((n) => ({
          id: n.id,
          city: `${n.wilayaName || ''} - ${n.title}`,
          latitude: n.coordinates!.lat,
          longitude: n.coordinates!.lng,
          type: n.priority === 'urgent' ? 'crisis' : 'resource',
        }));
      combineAll();
    });

    return () => {
      if (unsubCrises) unsubCrises();
      if (unsubNeeds) unsubNeeds();
    };
  }, []);

  // Selected Origin Wilaya Object
  const selectedWilayaObj = useMemo(() => {
    const cleanCode = selectedWilayaCode?.padStart(2, '0');
    return WILAYAS.find((w) => w.value === cleanCode || w.value === selectedWilayaCode) || WILAYAS[15];
  }, [selectedWilayaCode]);

  // Selected Destination Wilaya Object
  const selectedDestWilayaObj = useMemo(() => {
    if (!destinationWilayaCode) return null;
    const cleanCode = destinationWilayaCode.padStart(2, '0');
    return WILAYAS.find((w) => w.value === cleanCode || w.value === destinationWilayaCode) || null;
  }, [destinationWilayaCode]);

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

  const handleOpenMap = (target: 'origin' | 'destination') => {
    setMapTarget(target);
    setTempPickedLocation(target === 'origin' ? pickedLocation : destinationLocation);
    setTempSelectedCrisis(null);
    setIsMapModalVisible(true);
  };

  const handleConfirmMapSelection = () => {
    if (!tempPickedLocation) {
      showAlert('تنبيه', 'يرجى الضغط على الخريطة لتحديد الموقع أولاً أو اختيار إحدى الأزمات.');
      return;
    }

    if (mapTarget === 'origin') {
      setPickedLocation(tempPickedLocation);
      if (tempSelectedCrisis && !locationDetails.trim()) {
        setLocationDetails(tempSelectedCrisis.city);
      }
    } else {
      setDestinationLocation(tempPickedLocation);
      if (tempSelectedCrisis && !destinationLocationDetails.trim()) {
        setDestinationLocationDetails(tempSelectedCrisis.city);
      }
    }

    setIsMapModalVisible(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      showAlert('تنبيه', 'يرجى إدخال عنوان الإعلان أو الاحتياج.');
      return;
    }
    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      showAlert('تنبيه', 'يرجى تحديد عدد الأشخاص المطلوب بشكل صحيح.');
      return;
    }
    if (!phone.trim()) {
      showAlert('تنبيه', 'يرجى كتابة رقم هاتف التواصل للجمعية.');
      return;
    }

    try {
      setIsSubmitting(true);

      const orgName =
        orgUser?.name ||
        orgUser?.organizationName ||
        orgUser?.fullName ||
        'جمعية محروسة';

        let cleanPhone = phone.trim();
        if (cleanPhone.startsWith('+213')) cleanPhone = cleanPhone.substring(4);
        else if (cleanPhone.startsWith('00213')) cleanPhone = cleanPhone.substring(5);
        cleanPhone = cleanPhone.replace(/^0+/, '');

        await createNeed({
          title: title.trim(),
          needType: needType,
          quantity: qtyNum,
          wilaya: selectedWilayaObj.value,
          wilayaName: selectedWilayaObj.label,
          locationDetails: locationDetails.trim() || selectedWilayaObj.label,
          coordinates: pickedLocation,
          destinationWilaya: selectedDestWilayaObj?.value || '',
          destinationWilayaName: selectedDestWilayaObj?.label || '',
          destinationDetails: destinationLocationDetails.trim() || '',
          destinationCoordinates: destinationLocation,
          startDate: startDate,
          endDate: endDate,
          priority: priority,
          description: description.trim(),
          organizationId: orgUser?.id || orgUser?.phone || 'org_default',
          organizationName: orgName,
          organizationPhone: '+213' + cleanPhone,
        });

      setIsSubmitting(false);

      showAlert('تم بنجاح ✓', 'تم نشر إعلان الاحتياج بنجاح وستظهر فوراً لجميع المتطوعين!', [
        { text: 'تم', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      setIsSubmitting(false);
      console.error('Error submitting need:', error);
      showAlert('خطأ', error?.message || 'فشل في نشر الاحتياج، يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 38 }} />
        <Text style={styles.headerTitle}>نشر إعلان احتياج جديد</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={Colors.primaryNavy} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* 1. عنوان الاحتياج */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>عنوان الإعلان / الاحتياج</Text>
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
          <Text style={styles.label}>نوع الاحتياج</Text>
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
          <Text style={styles.label}>درجة الأولوية</Text>
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
          <Text style={styles.label}>عدد الأشخاص المطلوبين</Text>
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

          {/* Quick Presets (Horizontal Scrollable) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetsScrollContent}
            style={styles.presetsScrollView}
          >
            {[5, 10, 20, 30, 50, 100].map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.presetChip, quantity === String(num) && styles.presetChipActive]}
                onPress={() => handleQuickQuantity(num)}
                activeOpacity={0.7}
              >
                <Text style={[styles.presetText, quantity === String(num) && styles.presetTextActive]}>
                  {num} شخص
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 5. المدة: من تاريخ ... إلى تاريخ ... */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>المدة الزمنية</Text>
          <View style={styles.dateRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.subLabel}>بداية من تاريخ:</Text>
              <TouchableOpacity
                style={styles.dateInputContainer}
                onPress={() => setIsStartDatePickerVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateInputText}>{startDate}</Text>
                <Ionicons name="calendar-outline" size={20} color={Colors.primaryNavy} />
              </TouchableOpacity>
            </View>

            <View style={{ width: 15 }} />

            <View style={{ flex: 1 }}>
              <Text style={styles.subLabel}>إلى غاية تاريخ:</Text>
              <TouchableOpacity
                style={styles.dateInputContainer}
                onPress={() => setIsEndDatePickerVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateInputText}>{endDate}</Text>
                <Ionicons name="calendar-outline" size={20} color={Colors.primaryNavy} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 6. الموقع / نقطة التجمع (الانطلاق) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>الموقع / نقطة التجمع</Text>

          <TouchableOpacity
            style={styles.dropdownSelector}
            onPress={() => {
              setActiveWilayaTarget('origin');
              setIsWilayaModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
            <Text style={[styles.dropdownText, { flex: 1, textAlign: 'right', marginRight: 10 }]}>
              الولاية: {selectedWilayaObj.label}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { marginTop: 10 }]}
            placeholder="اكتب اسم الحي أو الشارع بدقة..."
            placeholderTextColor={Colors.placeholder}
            value={locationDetails}
            onChangeText={setLocationDetails}
            textAlign="right"
          />

          <TouchableOpacity
            style={[styles.mapButton, pickedLocation && styles.mapButtonActive]}
            onPress={() => handleOpenMap('origin')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="location-sharp"
              size={22}
              color={pickedLocation ? Colors.success : Colors.mainBlue}
            />
            <Text style={[styles.mapButtonText, pickedLocation && { color: Colors.success }]}>
              {pickedLocation
                ? 'تم تحديد موقع الانطلاق على الخريطة ✓'
                : 'تحديد موقع الانطلاق من الخريطة (اختياري)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 7. موقع الوصول (الوجهة) */}
        <View style={styles.formGroup}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.label}>موقع الوصول</Text>
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalBadgeText}>اختياري / وجهة المساعدة</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.dropdownSelector}
            onPress={() => {
              setActiveWilayaTarget('destination');
              setIsWilayaModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
            <Text style={[styles.dropdownText, { flex: 1, textAlign: 'right', marginRight: 10 }]}>
              الولاية: {selectedDestWilayaObj ? selectedDestWilayaObj.label : 'اختر ولاية الوصول (اختياري)'}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { marginTop: 10 }]}
            placeholder="اكتب تفاصيل أو عنوان موقع الوصول..."
            placeholderTextColor={Colors.placeholder}
            value={destinationLocationDetails}
            onChangeText={setDestinationLocationDetails}
            textAlign="right"
          />

          <TouchableOpacity
            style={[styles.mapButton, styles.destinationMapBtn, destinationLocation && styles.mapButtonActive]}
            onPress={() => handleOpenMap('destination')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={destinationLocation ? 'checkmark-circle' : 'flag'}
              size={22}
              color={destinationLocation ? Colors.success : '#C0392B'}
            />
            <Text style={[styles.mapButtonText, { color: destinationLocation ? Colors.success : '#C0392B' }]}>
              {destinationLocation
                ? 'تم تحديد موقع الوصول على الخريطة ✓'
                : 'تحديد موقع الوصول من الخريطة (أو اختر من الأزمات المنشورة)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 8. رقم هاتف الجمعية */}
        <View style={styles.formGroup}>
          <PhoneInput
            label="رقم هاتف التواصل للجمعية"
            placeholder="أدخل رقم الهاتف"
            themeMode={isDarkMode ? 'dark' : 'light'}
            countryCode="+213"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {/* 9. تفاصيل إضافية */}
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
            <Text style={styles.submitButtonText}>نشر</Text>
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
            <Text style={styles.modalTitle}>
              {activeWilayaTarget === 'origin' ? 'اختر ولاية الانطلاق / التجمع' : 'اختر ولاية الوصول'}
            </Text>
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
              const currentCode = activeWilayaTarget === 'origin' ? selectedWilayaObj.value : selectedDestWilayaObj?.value;
              const isSelected = currentCode === item.value;
              return (
                <TouchableOpacity
                  style={[styles.wilayaItem, isSelected && styles.wilayaItemSelected]}
                  onPress={() => {
                    if (activeWilayaTarget === 'origin') {
                      setSelectedWilayaCode(item.value);
                    } else {
                      setDestinationWilayaCode(item.value);
                    }
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

      {/* Map Picker Modal (Shows Crises Markers) */}
      <Modal visible={isMapModalVisible} animationType="slide" onRequestClose={() => setIsMapModalVisible(false)}>
        <SafeAreaView style={styles.modalSafeArea} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsMapModalVisible(false)} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>إلغاء</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {mapTarget === 'origin' ? 'تحديد موقع الانطلاق' : 'تحديد موقع الوصول'}
            </Text>
          </View>

          {/* Helper Banner */}
          <View style={[styles.mapTipBar, mapTarget === 'destination' && styles.mapTipBarDest]}>
            <Ionicons
              name={mapTarget === 'destination' ? 'warning' : 'information-circle'}
              size={20}
              color={mapTarget === 'destination' ? '#C0392B' : Colors.mainBlue}
            />
            <Text style={[styles.mapTipText, mapTarget === 'destination' && { color: '#922B21' }]}>
              {mapTarget === 'destination'
                ? '💡 يمكنك الضغط مباشرة على إحدى الأزمات المنشورة (🚨) لتحديدها كنقطة وصول، أو النقر على أي مكان بالخريطة.'
                : '💡 اضغط على أي مكان بالخريطة لتحديد إحداثيات موقع الانطلاق والتجمع بدقة.'}
            </Text>
          </View>

          <View style={styles.modalMapContainer}>
            <SolidarityMap
              markers={publishedCrises}
              pickedLocation={tempPickedLocation}
              onMapPress={(coords) => {
                setTempPickedLocation(coords);
                setTempSelectedCrisis(null);
              }}
              onSelectMarker={(marker) => {
                setTempPickedLocation({ lat: marker.latitude, lng: marker.longitude });
                setTempSelectedCrisis(marker);
              }}
            />
          </View>

          <View style={styles.modalFooter}>
            {tempSelectedCrisis && (
              <View style={styles.selectedCrisisBanner}>
                <Text style={styles.selectedCrisisTitle}>
                  🚨 تم اختيار أزمة: {tempSelectedCrisis.city}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.confirmMapButton, !tempPickedLocation && { opacity: 0.6 }]}
              onPress={handleConfirmMapSelection}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmMapText}>
                {tempPickedLocation ? 'تأكيد الموقع المحدد' : 'يرجى النقر على الخريطة لتحديد الموقع'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Start Date Picker Modal */}
      <DatePickerModal
        visible={isStartDatePickerVisible}
        onClose={() => setIsStartDatePickerVisible(false)}
        onConfirm={setStartDateObj}
        initialDate={startDateObj}
        minDate={today}
        title="اختر تاريخ البداية"
      />

      {/* End Date Picker Modal */}
      <DatePickerModal
        visible={isEndDatePickerVisible}
        onClose={() => setIsEndDatePickerVisible(false)}
        onConfirm={setEndDateObj}
        initialDate={endDateObj}
        minDate={startDateObj}
        title="اختر تاريخ النهاية"
      />
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
    sectionHeaderRow: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: '700',
      color: Colors.primaryText,
      marginBottom: 8,
      textAlign: 'right',
    },
    optionalBadge: {
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    optionalBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#B45309',
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
    presetsScrollView: {
      marginTop: 10,
    },
    presetsScrollContent: {
      flexDirection: 'row-reverse',
      gap: 8,
      paddingVertical: 2,
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
    dateInputContainer: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    dateInputText: {
      fontSize: 15,
      fontWeight: '600',
      color: Colors.primaryText,
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
    destinationMapBtn: {
      borderColor: '#E74C3C',
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
    mapTipBar: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      backgroundColor: '#EBF5FB',
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#D4E6F1',
    },
    mapTipBarDest: {
      backgroundColor: '#FDEDEC',
      borderBottomColor: '#FADBD8',
    },
    mapTipText: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: '#1B4F72',
      textAlign: 'right',
      lineHeight: 18,
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
    selectedCrisisBanner: {
      backgroundColor: '#FEF2F2',
      borderWidth: 1,
      borderColor: '#F87171',
      borderRadius: 12,
      padding: 10,
      marginBottom: 10,
      alignItems: 'center',
    },
    selectedCrisisTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: '#B91C1C',
      textAlign: 'center',
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
