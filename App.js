import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { AlertProvider } from './src/context/AlertContext';
import registerNNPushToken from 'native-notify';
import { NATIVE_NOTIFY_CONFIG } from './src/config/nativeNotify';
import { requestNotificationPermissions, ensureNotificationChannel } from './src/services/pushNotificationService';

LogBox.ignoreLogs([
  '[expo-notifications]',
  '`expo-notifications` functionality is not fully supported in Expo Go',
  'Notification channel skipped',
  'ExpoNotificationChannelManager',
  'Call to function',
]);

import CustomToast from './src/components/common/CustomToast';

export default function App() {
  // تفعيل تسجيل Native Notify
  registerNNPushToken(NATIVE_NOTIFY_CONFIG.appId, NATIVE_NOTIFY_CONFIG.appToken, {
    onRegistered: (res) => console.log('✅ [Native Notify] Registered device successfully:', res?.status),
    onError: (err) => console.warn('⚠️ [Native Notify] Registration error:', err?.message || err),
  });

  // طلب إذن الإشعارات فور فتح التطبيق
  useEffect(() => {
    (async () => {
      try {
        await ensureNotificationChannel();
        await requestNotificationPermissions();
      } catch (_e) {}
    })();
  }, []);

  return (
    <ThemeProvider>
      <AlertProvider>
        <RootNavigator />
        <CustomToast />
      </AlertProvider>
    </ThemeProvider>
  );
}
