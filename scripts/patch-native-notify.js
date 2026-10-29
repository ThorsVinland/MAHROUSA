/**
 * Auto-patch native-notify v5.3.0 for Expo SDK 53+ Android & Expo Go compatibility
 */
const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'node_modules', 'native-notify', 'dist', 'index.js');

if (!fs.existsSync(targetPath)) {
  console.log('[patch-native-notify] native-notify not found, skipping patch.');
  process.exit(0);
}

let content = fs.readFileSync(targetPath, 'utf8');
let modified = false;

// 1. Patch isExpoGo
if (!content.includes('target.expoGoConfig != null')) {
  const oldIsExpoGo = `function isExpoGo() {
    try {
        if (expo_constants_1.default && typeof expo_constants_1.default.executionEnvironment === 'string') {
            return expo_constants_1.default.executionEnvironment === 'storeClient';
        }
        if (expo_constants_1.default && typeof expo_constants_1.default.appOwnership === 'string') {
            return expo_constants_1.default.appOwnership === 'expo';
        }
    }
    catch (error) {
        // expo-constants unavailable — assume a real build.
    }
    return false;
}`;

  const newIsExpoGo = `function isExpoGo() {
    try {
        const c = expo_constants_1.default || expo_constants_1;
        const target = (c && c.default) ? c.default : c;
        if (target) {
            if (target.executionEnvironment === 'storeClient') return true;
            if (target.appOwnership === 'expo') return true;
            if (target.expoGoConfig != null) return true;
        }
    }
    catch (error) {
        // expo-constants unavailable — assume a real build.
    }
    return false;
}`;

  if (content.includes(oldIsExpoGo)) {
    content = content.replace(oldIsExpoGo, newIsExpoGo);
    modified = true;
  }
}

// 2. Safe channel creation & expo go skip in registerForPushNotificationsAsync
if (!content.includes('Push notifications are not available in Expo Go on Android (SDK 53+)')) {
  const oldRegister = `async function registerForPushNotificationsAsync() {
    if (react_native_1.Platform.OS === 'web') {
        return { status: 'skipped', reason: 'Push notifications are not supported on web.' };
    }
    try {
        if (react_native_1.Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }`;

  const newRegister = `async function registerForPushNotificationsAsync() {
    if (react_native_1.Platform.OS === 'web') {
        return { status: 'skipped', reason: 'Push notifications are not supported on web.' };
    }
    try {
        if (react_native_1.Platform.OS === 'android' && isExpoGo()) {
            const reason = 'Push notifications are not available in Expo Go on Android (SDK 53+). Use a development build (\`npx expo run:android\` or an EAS dev build).';
            console.log('[native-notify] ' + reason);
            return { status: 'skipped', reason };
        }
        if (react_native_1.Platform.OS === 'android') {
            try {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            } catch (_chanErr) {}
        }`;

  if (content.includes(oldRegister)) {
    content = content.replace(oldRegister, newRegister);
    modified = true;
  }
}

if (modified) {
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log('[patch-native-notify] Successfully patched native-notify for Expo SDK 53+ Android compatibility.');
} else {
  console.log('[patch-native-notify] native-notify is already up to date.');
}
