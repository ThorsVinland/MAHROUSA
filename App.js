import React from 'react';
import { LogBox } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { AlertProvider } from './src/context/AlertContext';
import registerNNPushToken from 'native-notify';
import { NATIVE_NOTIFY_CONFIG } from './src/config/nativeNotify';

LogBox.ignoreLogs([
  '[expo-notifications]',
  '`expo-notifications` functionality is not fully supported in Expo Go',
  'Notification channel skipped',
  'ExpoNotificationChannelManager',
  'Call to function',
]);

import CustomToast from './src/components/common/CustomToast';

export default function App() {
  registerNNPushToken(NATIVE_NOTIFY_CONFIG.appId, NATIVE_NOTIFY_CONFIG.appToken, {
    onRegistered: (res) => console.log('✅ [Native Notify] Registered device successfully:', res?.status),
    onError: (err) => console.warn('⚠️ [Native Notify] Registration error:', err?.message || err),
  });

  return (
    <ThemeProvider>
      <AlertProvider>
        <RootNavigator />
        <CustomToast />
      </AlertProvider>
    </ThemeProvider>
  );
}
