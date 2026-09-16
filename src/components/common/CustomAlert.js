import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, useColorScheme } from 'react-native';
import theme from '../../theme/colors';
import { useTheme } from '../../context/ThemeContext';

export default function CustomAlert({ visible, title, message, buttons, onClose }) {
  const { isDarkMode: customIsDarkMode, colors } = useTheme();
  const systemColorScheme = useColorScheme();
  
  const isDark = (customIsDarkMode !== undefined) ? customIsDarkMode : (systemColorScheme === 'dark');
  const themeColors = colors || (isDark ? theme.dark : theme.light);

  const cardBgColor = themeColors.cardBackground || (isDark ? '#1E1E1E' : '#FFFFFF');
  const textColor = themeColors.primaryText || (isDark ? '#FFFFFF' : theme.light.primaryDarkBlue);
  const subtitleColor = isDark ? '#AAAAAA' : '#7F8C8D';
  const mainBlue = themeColors.mainBlue || '#2E86C1';
  const borderColor = isDark ? '#333' : '#E0E0E0';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.alertBox, { backgroundColor: cardBgColor }]}>
          {title ? <Text style={[styles.title, { color: textColor }]}>{title}</Text> : null}
          {message ? <Text style={[styles.message, { color: subtitleColor }]}>{message}</Text> : null}
          
          <View style={[styles.buttonsContainer, { borderColor }]}>
            {buttons && buttons.map((btn, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button, 
                  index > 0 && { borderRightWidth: 1, borderColor }
                ]}
                onPress={() => {
                  onClose();
                  if (btn.onPress) btn.onPress();
                }}
              >
                <Text style={[
                  styles.buttonText, 
                  { color: btn.style === 'destructive' ? '#E74C3C' : mainBlue },
                  btn.style === 'cancel' && { color: subtitleColor, fontWeight: 'normal' }
                ]}>
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: '80%',
    borderRadius: 16,
    paddingTop: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: 'row-reverse',
    width: '100%',
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
