import React from 'react';
import { LogBox } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { AlertProvider } from './src/context/AlertContext';

LogBox.ignoreLogs([
  '[expo-notifications]',
  '`expo-notifications` functionality is not fully supported in Expo Go',
  'Notification channel skipped',
  'ExpoNotificationChannelManager',
  'Call to function',
]);

import CustomToast from './src/components/common/CustomToast';

export default function App() {
  return (
    <ThemeProvider>
      <AlertProvider>
        <RootNavigator />
        <CustomToast />
      </AlertProvider>
    </ThemeProvider>
  );
}
