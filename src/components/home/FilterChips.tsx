// ============================================================
// src/components/home/FilterChips.tsx
// Filter chips for needs category with RTL support
// ============================================================

import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { FilterType } from '../../types/home.types';

interface FilterChipsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

interface ChipItem {
  id: FilterType;
  label: string;
}

const CHIPS: ChipItem[] = [
  { id: 'all', label: 'الكل' },
  { id: 'urgent', label: 'عاجل 🔴' },
  { id: 'labor', label: 'يد عاملة 👐' },
  { id: 'resources', label: 'موارد 📦' },
];

export const FilterChips: React.FC<FilterChipsProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const { colors: Colors } = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {CHIPS.map((chip) => {
          const isActive = activeFilter === chip.id;
          const isUrgent = chip.id === 'urgent';

          return (
            <TouchableOpacity
              key={chip.id}
              onPress={() => onFilterChange(chip.id)}
              activeOpacity={0.8}
              style={[
                styles.chip,
                isActive && styles.activeChip,
                !isActive && isUrgent && styles.urgentInactiveChip,
                !isActive && !isUrgent && styles.defaultInactiveChip,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  isActive && styles.activeChipText,
                  !isActive && isUrgent && styles.urgentInactiveText,
                  !isActive && !isUrgent && styles.defaultInactiveText,
                ]}
              >
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  scrollContainer: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 18,
    gap: 8,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  activeChip: {
    backgroundColor: Colors.primaryNavy,
    borderColor: Colors.primaryNavy,
  },
  urgentInactiveChip: {
    backgroundColor: Colors.surface,
    borderColor: Colors.urgent,
  },
  defaultInactiveChip: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderDefault,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  urgentInactiveText: {
    color: Colors.urgent,
  },
  defaultInactiveText: {
    color: Colors.textSecondary,
  },
});
