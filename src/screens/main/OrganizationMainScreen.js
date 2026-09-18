import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import OrganizationNavigator from '../../navigation/OrganizationNavigator';
import { useTheme } from '../../context/ThemeContext';
import theme from '../../theme/colors';

export default function OrganizationMainScreen({ onLogout }) {
  const { isDarkMode, colors } = useTheme();
  const pageBgColor = colors.pageBackground || (isDarkMode ? '#121212' : theme.light.pageBackground);

  return (
    <>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={pageBgColor}
      />
      <NavigationContainer independent={true}>
        <OrganizationNavigator onLogout={onLogout} />
      </NavigationContainer>
    </>
  );
}
