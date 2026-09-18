import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import VolunteerNavigator from '../../navigation/VolunteerNavigator';
import { useTheme } from '../../context/ThemeContext';
import theme from '../../theme/colors';

export default function VolunteerMainScreen({ onLogout }) {
  const { isDarkMode, colors } = useTheme();
  const pageBgColor = colors.pageBackground || (isDarkMode ? '#121212' : theme.light.pageBackground);

  return (
    <>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={pageBgColor}
      />
      <NavigationContainer independent={true}>
        <VolunteerNavigator onLogout={onLogout} />
      </NavigationContainer>
    </>
  );
}
