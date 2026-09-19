// ============================================================
// src/components/auth/AppDropdown.tsx
// Universal searchable Arabic dropdown modal with outside dismiss
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export interface DropdownOption {
  id?: string | number;
  label?: string;
  name?: string;
  code?: string | number;
  value?: string;
  [key: string]: any;
}

interface AppDropdownProps {
  label?: string;
  icon?: any;
  value: string;
  options: (DropdownOption | string)[];
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const AppDropdown: React.FC<AppDropdownProps> = ({
  label,
  icon,
  value,
  options = [],
  onChange,
  error,
  placeholder = 'اختر...',
  disabled = false,
}) => {
  const { colors: Colors, isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Normalize options list
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { id: opt, label: opt, value: opt };
      }
      const optId = String(opt.id ?? opt.code ?? opt.value ?? opt.name ?? opt.label ?? '');
      const optLabel = String(opt.label ?? opt.name ?? opt.id ?? opt.value ?? '');
      return { id: optId, label: optLabel, value: optId };
    });
  }, [options]);

  // Selected label display
  const selectedLabel = useMemo(() => {
    if (!value) return '';
    const found = normalizedOptions.find(
      (o) => o.value === value || o.id === value || o.label === value
    );
    return found ? found.label : value;
  }, [value, normalizedOptions]);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter((o) =>
      o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    );
  }, [normalizedOptions, searchQuery]);

  const handleSelect = (itemValue: string) => {
    onChange(itemValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: Colors.textPrimary }]}>{label}</Text>}

      <TouchableOpacity
        style={[
          styles.triggerBtn,
          {
            backgroundColor: Colors.surface,
            borderColor: error ? Colors.urgent : isDarkMode ? '#2D3748' : '#E5E7EB',
          },
          disabled && { opacity: 0.6 },
        ]}
        onPress={() => {
          if (!disabled) {
            setSearchQuery('');
            setIsOpen(true);
          }
        }}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <View style={styles.triggerInner}>
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color={error ? Colors.urgent : Colors.textSecondary}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.selectedText,
              { color: selectedLabel ? Colors.textPrimary : Colors.textSecondary },
            ]}
            numberOfLines={1}
          >
            {selectedLabel || placeholder}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
      </TouchableOpacity>

      {error ? <Text style={[styles.errorText, { color: Colors.urgent }]}>{error}</Text> : null}

      {/* Dropdown Selection Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <Pressable
            style={[
              styles.modalCard,
              { backgroundColor: Colors.surface, borderColor: isDarkMode ? '#2D3748' : '#E5E7EB' },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsOpen(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: Colors.textPrimary }]}>
                {label ? `اختر ${label}` : 'اختر من القائمة'}
              </Text>
            </View>

            {/* Search Input (shown when options > 5) */}
            {normalizedOptions.length > 5 && (
              <View
                style={[
                  styles.searchBox,
                  {
                    backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB',
                    borderColor: isDarkMode ? '#334155' : '#E5E7EB',
                  },
                ]}
              >
                <Ionicons name="search" size={18} color={Colors.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: Colors.textPrimary }]}
                  placeholder="ابحث هنا..."
                  placeholderTextColor={Colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  textAlign="right"
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            {/* Options List */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => `${item.value}_${index}`}
              style={styles.list}
              contentContainerStyle={{ paddingVertical: 6 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = item.value === value || item.id === value;
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      isSelected && {
                        backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF',
                      },
                    ]}
                    onPress={() => handleSelect(item.value)}
                    activeOpacity={0.7}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={18} color={Colors.mainBlue} />
                    )}
                    <Text
                      style={[
                        styles.optionText,
                        { color: isSelected ? Colors.mainBlue : Colors.textPrimary },
                        isSelected && { fontWeight: '800' },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
                    لا توجد خيارات مطابقة للبحث
                  </Text>
                </View>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default AppDropdown;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'right',
  },
  triggerBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  triggerInner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  icon: {
    marginLeft: 4,
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 2,
  },
  list: {
    maxHeight: 340,
  },
  optionItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginVertical: 2,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  emptyBox: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
