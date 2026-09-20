import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { useAlert } from '../../context/AlertContext';
import { useTheme } from '../../context/ThemeContext';
import { submitSupervisorRequest } from '../../services/authService';
import { AppDropdown } from '../../components/auth/AppDropdown';
import { WILAYAS, getCommunesByWilaya } from '../../constants/algeria';

const RESOURCE_OPTIONS = [
  'شاحنة خفيفة (أقل من 3 طن)',
  'شاحنة ثقيلة (أكثر من 3 طن)',
  'مقر تخزين (مستودع)',
  'معدات بناء / حفر',
  'سيارة إسعاف / سيارة نفعية',
  'خبرة متخصصة (إدارة أزمات، طب...)',
  'أخرى (تحديد يدوياً)'
];

const DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

export default function SupervisorUpgradeScreen() {
  const { colors: Colors } = useTheme();
  const navigation = useNavigation<any>();
  const { user, setUser } = useAuthStore();
  const { showAlert } = useAlert();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [customResource, setCustomResource] = useState('');
  const [capacity, setCapacity] = useState('');
  
  const [wilaya, setWilaya] = useState('');
  const [commune, setCommune] = useState('');
  
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timeOfDay, setTimeOfDay] = useState('كل اليوم'); // 'صباح', 'مساء', 'كل اليوم'

  // Modal State for Multi-Select Dropdown
  const [isResourceModalVisible, setIsResourceModalVisible] = useState(false);

  const communesOptions = useMemo(() => {
    if (!wilaya) return [];
    return getCommunesByWilaya(wilaya);
  }, [wilaya]);

  const toggleResource = (res: string) => {
    if (selectedResources.includes(res)) {
      setSelectedResources(selectedResources.filter(r => r !== res));
    } else {
      setSelectedResources([...selectedResources, res]);
    }
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = async () => {
    if (selectedResources.length === 0 || !wilaya || !commune || selectedDays.length === 0) {
      showAlert('تنبيه', 'الرجاء ملء جميع الحقول الإلزامية واختيار الأيام والموارد.');
      return;
    }

    const finalResources = [...selectedResources];
    if (finalResources.includes('أخرى (تحديد يدوياً)') && customResource.trim()) {
      finalResources.push(`أخرى: ${customResource.trim()}`);
    }

    try {
      setIsSubmitting(true);
      const userPhone = user?.phone || user?.id || '';
      const requestData = {
        resources: finalResources,
        capacity: capacity.trim(),
        wilaya,
        commune,
        availabilityDays: selectedDays,
        availabilityTime: timeOfDay,
      };

      await submitSupervisorRequest(userPhone, requestData);

      if (user) {
        setUser({ ...user, hasPendingUpgrade: true });
      }

      setIsSubmitting(false);
      showAlert(
        'تم تقديم الطلب بنجاح', 
        'تم إرسال طلبك وسوف يتم دراسته في غضون 24 ساعة. شكراً لتعاونك!',
        [{ text: 'حسناً', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      setIsSubmitting(false);
      console.error('Supervisor upgrade error:', error);
      showAlert('خطأ', 'فشل في إرسال طلب الترقية، يرجى المحاولة مرة أخرى.');
    }
  };

  const getResourceDisplayText = () => {
    if (selectedResources.length === 0) return 'اختر الموارد (يمكنك اختيار أكثر من واحد)...';
    if (selectedResources.length === 1) return selectedResources[0];
    return `تم اختيار ${selectedResources.length} موارد`;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors.pageBackground }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: Colors.border || '#F0EBE1' }]}>
        <View style={{ width: 24 }} />
        <Text style={[styles.headerTitle, { color: Colors.primaryNavy }]}>طلب ترقية إلى متطوع مشرف</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.primaryNavy} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.formDesc}>
            هل تملك موارد إضافية تود التطوع بها؟ املأ التفاصيل أدناه ليتم ترقيتك إلى مشرف وربطك مع الجمعيات التي تحتاج مواردك.
          </Text>

          {/* Resources Multi-Select Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>نوع الموارد المتوفرة لديك</Text>
            <TouchableOpacity 
              style={[styles.multiSelectTrigger, { backgroundColor: Colors.surface, borderColor: Colors.border || '#E5E7EB' }]}
              onPress={() => setIsResourceModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
              <Text style={[styles.multiSelectText, { color: selectedResources.length > 0 ? Colors.primaryText : Colors.placeholder }]}>
                {getResourceDisplayText()}
              </Text>
            </TouchableOpacity>
          </View>

          {selectedResources.includes('أخرى (تحديد يدوياً)') && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>يرجى تحديد المورد</Text>
              <TextInput
                style={[styles.input, { backgroundColor: Colors.surface, borderColor: Colors.border || '#E5E7EB', color: Colors.primaryText }]}
                placeholder="أدخل نوع المورد يدوياً..."
                placeholderTextColor={Colors.placeholder}
                value={customResource}
                onChangeText={setCustomResource}
                textAlign="right"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>السعة والتفاصيل (اختياري)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Colors.surface, borderColor: Colors.border || '#E5E7EB', color: Colors.primaryText, minHeight: 80 }]}
              placeholder="مثال: شاحنة بوزن 10 طن..."
              placeholderTextColor={Colors.placeholder}
              value={capacity}
              onChangeText={setCapacity}
              textAlign="right"
              multiline
            />
          </View>

          {/* Location Dropdowns */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>موقع المورد (الولاية)</Text>
            <AppDropdown
              label="اختر الولاية"
              value={wilaya}
              options={WILAYAS}
              onChange={(val) => { setWilaya(val); setCommune(''); }}
              icon="map-outline"
            />
          </View>

          {wilaya ? (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>موقع المورد (البلدية)</Text>
              <AppDropdown
                label="اختر البلدية"
                value={commune}
                options={communesOptions}
                onChange={setCommune}
                icon="location-outline"
              />
            </View>
          ) : null}

          {/* Availability: Days */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>أيام التفرغ المتاحة</Text>
            <View style={styles.chipsContainer}>
              {DAYS.map(day => {
                const isSelected = selectedDays.includes(day);
                return (
                  <TouchableOpacity 
                    key={day}
                    style={[styles.chip, { 
                      backgroundColor: isSelected ? Colors.mainBlue : Colors.surface,
                      borderColor: isSelected ? Colors.mainBlue : (Colors.border || '#E5E7EB')
                    }]}
                    onPress={() => toggleDay(day)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : Colors.textSecondary }]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Availability: Time */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>وقت التفرغ المفضل</Text>
            <View style={styles.chipsContainer}>
              {['صباح', 'مساء', 'كل اليوم'].map(time => {
                const isSelected = timeOfDay === time;
                return (
                  <TouchableOpacity 
                    key={time}
                    style={[styles.chip, { 
                      backgroundColor: isSelected ? Colors.primaryNavy : Colors.surface,
                      borderColor: isSelected ? Colors.primaryNavy : (Colors.border || '#E5E7EB')
                    }]}
                    onPress={() => setTimeOfDay(time)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : Colors.textSecondary }]}>{time}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: Colors.mainBlue }]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>تقديم الطلب</Text>
            )}
          </TouchableOpacity>

          {/* Bottom Spacer for keyboard scrolling */}
          <View style={{ height: 160 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Resource Multi-Select Modal */}
      <Modal
        visible={isResourceModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsResourceModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setIsResourceModalVisible(false)}
        >
          <Pressable 
            style={[styles.modalContent, { backgroundColor: Colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsResourceModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: Colors.primaryText }]}>تحديد الموارد</Text>
            </View>
            
            <FlatList 
              data={RESOURCE_OPTIONS}
              keyExtractor={item => item}
              renderItem={({ item }) => {
                const isSelected = selectedResources.includes(item);
                return (
                  <TouchableOpacity 
                    style={[styles.modalOption, isSelected && { backgroundColor: Colors.lightBlue }]}
                    onPress={() => toggleResource(item)}
                    activeOpacity={0.7}
                  >
                    {isSelected ? (
                      <Ionicons name="checkbox" size={24} color={Colors.mainBlue} />
                    ) : (
                      <Ionicons name="square-outline" size={24} color={Colors.placeholder} />
                    )}
                    <Text style={[styles.modalOptionText, isSelected && { color: Colors.mainBlue, fontWeight: '700' }]}>{item}</Text>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
            
            <TouchableOpacity style={[styles.modalConfirmBtn, { backgroundColor: Colors.mainBlue }]} onPress={() => setIsResourceModalVisible(false)}>
              <Text style={styles.modalConfirmText}>تأكيد</Text>
            </TouchableOpacity>
          </Pressable>
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
  scrollContainer: { padding: 20, paddingBottom: 180 },
  formDesc: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'right',
    lineHeight: 24,
    marginBottom: 24,
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  multiSelectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
  },
  multiSelectText: {
    fontSize: 15,
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  chipsContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeBtn: { padding: 4 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  modalOption: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: 'right',
    flex: 1,
    color: '#374151',
  },
  modalConfirmBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
