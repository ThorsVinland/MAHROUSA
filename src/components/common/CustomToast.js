import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';

export default function CustomToast() {
  const { colors, isDarkMode } = useTheme();

  const toastConfig = {
    customInfo: ({ text1 }) => (
      <View style={[
        styles.toastContainer, 
        { 
          backgroundColor: isDarkMode ? '#333333' : colors.primaryDarkBlue || '#1A5276',
          borderColor: isDarkMode ? '#555' : 'transparent',
          borderWidth: isDarkMode ? 1 : 0
        }
      ]}>
        <Text style={[styles.toastText, { color: '#FFFFFF' }]}>{text1}</Text>
      </View>
    )
  };

  return <Toast config={toastConfig} />;
}

const styles = StyleSheet.create({
  toastContainer: {
    minHeight: 50,
    width: '90%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    marginBottom: 20,
  },
  toastText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});
