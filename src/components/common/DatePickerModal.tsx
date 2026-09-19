import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate?: Date;
  minDate?: Date;
  title?: string;
}

const ITEM_HEIGHT = 46;

export default function DatePickerModal({
  visible,
  onClose,
  onConfirm,
  initialDate = new Date(),
  minDate = new Date(),
  title = 'اختر التاريخ',
}: DatePickerModalProps) {
  const { colors, isDarkMode } = useTheme();

  const [day, setDay] = useState(initialDate.getDate());
  const [month, setMonth] = useState(initialDate.getMonth() + 1);
  const [year, setYear] = useState(initialDate.getFullYear());

  const daysRef = useRef<ScrollView>(null);
  const monthsRef = useRef<ScrollView>(null);
  const yearsRef = useRef<ScrollView>(null);

  // تحديث القيم عند فتح المودال
  useEffect(() => {
    if (visible) {
      setDay(initialDate.getDate());
      setMonth(initialDate.getMonth() + 1);
      setYear(initialDate.getFullYear());
    }
  }, [visible, initialDate]);

  // عدد الأيام في الشهر المحدد
  const getDaysInMonth = (m: number, y: number) => new Date(y, m, 0).getDate();
  const daysInCurrentMonth = getDaysInMonth(month, year);

  // تأمين الأيام عند تغيير الشهر/السنة
  useEffect(() => {
    if (day > daysInCurrentMonth) {
      setDay(daysInCurrentMonth);
    }
  }, [month, year, daysInCurrentMonth]);

  // القوائم
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  const handleScroll = (event: any, setter: (val: number) => void, data: number[]) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (index >= 0 && index < data.length) {
      setter(data[index]);
    }
  };

  const handleConfirm = () => {
    const selectedDate = new Date(year, month - 1, day, 12, 0, 0);

    // التحقق من التاريخ الأدنى بمقارنة الأيام فقط دون الساعات
    if (minDate) {
      const minDateStart = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate(), 0, 0, 0);
      const selStart = new Date(year, month - 1, day, 0, 0, 0);
      if (selStart.getTime() < minDateStart.getTime()) {
        onConfirm(new Date(minDateStart.getFullYear(), minDateStart.getMonth(), minDateStart.getDate(), 12, 0, 0));
        onClose();
        return;
      }
    }

    onConfirm(selectedDate);
    onClose();
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#1A1A2E';
  const bgColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const overlayColor = 'rgba(0, 0, 0, 0.65)';
  const primaryColor = colors?.primaryNavy || colors?.mainBlue || '#1A5276';
  const activeNumberColor = isDarkMode ? '#5DADE2' : primaryColor;
  const unselectedNumberColor = isDarkMode ? '#7F8C8D' : '#95A5A6';
  const highlightBg = isDarkMode ? '#2C3E50' : '#EBF5FB';
  const highlightBorder = isDarkMode ? '#3498DB' : '#AED6F1';
  const wheelBoxBg = isDarkMode ? '#262626' : '#F8FAFC';
  const wheelBoxBorder = isDarkMode ? '#333333' : '#E2E8F0';

  const renderWheel = (
    data: number[],
    selectedValue: number,
    setter: (val: number) => void,
    ref: any,
    label: string
  ) => {
    const selectedIndex = data.indexOf(selectedValue);

    const scrollToValue = (val: number, animated = true) => {
      setter(val);
      const idx = data.indexOf(val);
      if (idx >= 0 && ref.current) {
        ref.current.scrollTo({ y: idx * ITEM_HEIGHT, animated });
      }
    };

    const handleStep = (delta: number) => {
      const nextIdx = Math.max(0, Math.min(data.length - 1, selectedIndex + delta));
      scrollToValue(data[nextIdx], true);
    };

    return (
      <View style={styles.wheelColumn}>
        {/* Step Up Button */}
        <TouchableOpacity
          style={styles.arrowBtn}
          onPress={() => handleStep(-1)}
          activeOpacity={0.6}
        >
          <Ionicons name="chevron-up" size={18} color={isDarkMode ? '#9CA3AF' : '#64748B'} />
        </TouchableOpacity>

        <Text style={[styles.wheelLabel, { color: isDarkMode ? '#9CA3AF' : '#64748B' }]}>
          {label}
        </Text>

        <View style={[styles.wheelWrapper, { backgroundColor: wheelBoxBg, borderColor: wheelBoxBorder }]}>
          <View
            style={[styles.highlight, { backgroundColor: highlightBg, borderColor: highlightBorder }]}
            pointerEvents="none"
          />
          <ScrollView
            ref={ref}
            nestedScrollEnabled={true}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onMomentumScrollEnd={(e) => handleScroll(e, setter, data)}
            onScrollEndDrag={(e) => handleScroll(e, setter, data)}
            contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
            onLayout={() => {
              if (selectedIndex >= 0 && ref.current) {
                ref.current.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
              }
            }}
          >
            {data.map((item, index) => {
              const isSelected = item === selectedValue;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.item, { height: ITEM_HEIGHT }]}
                  activeOpacity={0.7}
                  onPress={() => scrollToValue(item, true)}
                >
                  <Text
                    style={[
                      styles.itemText,
                      {
                        color: isSelected ? activeNumberColor : unselectedNumberColor,
                        fontWeight: isSelected ? '800' : '500',
                        fontSize: isSelected ? 20 : 16,
                        opacity: isSelected ? 1 : 0.45,
                      },
                    ]}
                  >
                    {item < 10 ? `0${item}` : item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Step Down Button */}
        <TouchableOpacity
          style={styles.arrowBtn}
          onPress={() => handleStep(1)}
          activeOpacity={0.6}
        >
          <Ionicons name="chevron-down" size={18} color={isDarkMode ? '#9CA3AF' : '#64748B'} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.container, { backgroundColor: bgColor }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Wheels */}
          <View style={styles.pickerContainer}>
            {renderWheel(days, day, setDay, daysRef, 'اليوم')}
            {renderWheel(months, month, setMonth, monthsRef, 'الشهر')}
            {renderWheel(years, year, setYear, yearsRef, 'السنة')}
          </View>

          {/* Actions */}
          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: primaryColor }]}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmBtnText}>تأكيد التاريخ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  pickerContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 6,
  },
  wheelColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  arrowBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelLabel: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  wheelWrapper: {
    width: '100%',
    height: ITEM_HEIGHT * 3,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 14,
    borderWidth: 1,
  },
  highlight: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    borderRadius: 10,
    borderWidth: 1.5,
    zIndex: -1,
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    textAlign: 'center',
  },
  confirmBtn: {
    backgroundColor: '#1A5276',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
