import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  TextInput,
  useColorScheme 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CustomDropdown({
  label,
  options = [], // Array of { label, value }
  value,
  onSelect,
  placeholder = 'اختر...',
  iconName,
  error,
  style,
  themeMode,
  searchable = false,
  searchPlaceholder = 'ابحث...'
}) {
  const systemColorScheme = useColorScheme();
  const currentMode = themeMode || systemColorScheme;
  const isDarkMode = currentMode === 'dark';
  const colors = isDarkMode ? theme.dark : theme.light;

  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const textColor = colors.primaryText || (isDarkMode ? '#fff' : '#2C3E50');
  const bgColor = colors.cardBackground || (isDarkMode ? '#1e1e1e' : '#FDFEFE');
  const modalBgColor = colors.pageBackground || (isDarkMode ? '#121212' : theme.light.pageBackground);
  const borderColor = error ? (colors.urgentRed || '#E74C3C') : (isDarkMode ? '#333' : '#E0E0E0');
  const placeholderColor = isDarkMode ? '#888' : '#A6ACAF';

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = searchable && searchQuery 
    ? options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  const handleSelect = (item) => {
    onSelect(item.value);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: textColor }]}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.inputContainer, 
          { 
            backgroundColor: bgColor,
            borderColor: borderColor
          }
        ]}
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
      >
        {iconName && (
          <Ionicons 
            name={iconName} 
            size={20} 
            color={placeholderColor} 
            style={styles.iconStyle} 
          />
        )}
        
        <Text style={[styles.inputText, { color: selectedOption ? textColor : placeholderColor }]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        
        <Ionicons 
          name="chevron-down" 
          size={20} 
          color={placeholderColor} 
          style={styles.dropdownIcon} 
        />
      </TouchableOpacity>
      
      {error && <Text style={[styles.errorText, { color: colors.urgentRed || '#E74C3C' }]}>{error}</Text>}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalOverlay, { backgroundColor: modalBgColor }]}>
          <View style={[styles.modalHeader, { backgroundColor: bgColor, borderBottomColor: borderColor }]}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: textColor }]}>{label || placeholder}</Text>
            <View style={{ width: 24 }} />
          </View>

          {searchable && (
            <View style={[styles.searchContainer, { backgroundColor: bgColor }]}>
              <Ionicons name="search" size={20} color={placeholderColor} />
              <TextInput
                style={[styles.searchInput, { color: textColor }]}
                placeholder={searchPlaceholder}
                placeholderTextColor={placeholderColor}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          )}

          <FlatList
            data={filteredOptions}
            keyExtractor={(item, index) => item.value ? item.value.toString() : index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  { borderBottomColor: borderColor },
                  value === item.value && { backgroundColor: isDarkMode ? '#333' : '#F0F8FF' }
                ]}
                onPress={() => handleSelect(item)}
              >
                <Text style={[styles.optionText, { color: textColor }]}>{item.label}</Text>
                {value === item.value && (
                  <Ionicons name="checkmark" size={20} color={colors.mainBlue || '#2E86C1'} />
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
    paddingVertical: 8,
    fontFamily: 'System',
  },
  iconStyle: {
    marginLeft: 10,
  },
  dropdownIcon: {
    marginRight: 10,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    height: 40,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    textAlign: 'right',
    paddingHorizontal: 8,
    fontFamily: 'System',
  },
  listContainer: {
    padding: 16,
  },
  optionItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'System',
  },
});
