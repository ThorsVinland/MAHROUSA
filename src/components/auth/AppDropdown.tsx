// ============================================================
// src/components/auth/AppDropdown.tsx
// Searchable Modal Dropdown matching AppInput Style
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface DropdownOption {
  label: string;
  value: string;
}

interface AppDropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const AppDropdown: React.FC<AppDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  error,
  icon,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentValue, setCurrentValue] = useState(value);

  // Sync internal state with external prop changes
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === currentValue),
    [options, currentValue]
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.trim().toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [options, searchQuery]);

  const handleSelect = (selectedValue: string) => {
    setCurrentValue(selectedValue);
    onChange(selectedValue);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.triggerBox,
          {
            borderColor: error
              ? Colors.borderError
              : currentValue
              ? Colors.borderFocus
              : Colors.borderDefault,
          },
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />

        <View style={styles.contentRow}>
          <Text
            style={[
              styles.valueText,
              { color: selectedOption ? Colors.textPrimary : Colors.placeholder },
            ]}
            numberOfLines={1}
          >
            {selectedOption ? selectedOption.label : label}
          </Text>

          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={currentValue ? Colors.mainBlue : Colors.textSecondary}
              style={styles.rightIcon}
            />
          )}
        </View>

        {currentValue ? <Text style={styles.floatingLabel}>{label}</Text> : null}
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Modal with Search & Scroll */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{label}</Text>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="ابحث هنا..."
                placeholderTextColor={Colors.placeholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Options List */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = item.value === currentValue;
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionRow,
                      isSelected && styles.selectedOptionRow,
                    ]}
                    onPress={() => handleSelect(item.value)}
                    activeOpacity={0.7}
                  >
                    {isSelected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={Colors.mainBlue}
                      />
                    ) : (
                      <View style={{ width: 22 }} />
                    )}
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.selectedOptionLabel,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  triggerBox: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 12,
    height: 54,
    paddingHorizontal: 14,
    backgroundColor: Colors.surface,
  },
  contentRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  valueText: {
    fontSize: Typography.body.fontSize,
    textAlign: 'right',
    flex: 1,
  },
  floatingLabel: {
    position: 'absolute',
    top: -10,
    right: 14,
    backgroundColor: Colors.surface,
    paddingHorizontal: 4,
    fontSize: 12,
    color: Colors.mainBlue,
    fontWeight: '500',
  },
  errorText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.error,
    textAlign: 'right',
    marginTop: 4,
    marginRight: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    textAlign: 'right',
    fontSize: Typography.body.fontSize,
    marginRight: 8,
    color: Colors.textPrimary,
  },
  optionRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDefault,
  },
  selectedOptionRow: {
    backgroundColor: Colors.lightBlue,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  optionLabel: {
    fontSize: Typography.body.fontSize,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  selectedOptionLabel: {
    color: Colors.mainBlue,
    fontWeight: '700',
  },
});
