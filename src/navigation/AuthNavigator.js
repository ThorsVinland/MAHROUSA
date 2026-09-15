// ============================================================
// src/navigation/AuthNavigator.js
// موجه شاشات المصادقة والتسجيل لتطبيق محروسة
// ============================================================

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../features/auth/screens/LoginScreen';
import SelectRoleScreen from '../features/auth/screens/SelectRoleScreen';
import RegisterScreen from '../features/auth/screens/RegisterScreen';
import SplashScreen from '../features/auth/screens/SplashScreen';
import SelectLocationScreen from '../features/auth/screens/SelectLocationScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator({ onLoginSuccess }) {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} onLoginSuccess={onLoginSuccess} />}
      </Stack.Screen>
      <Stack.Screen name="SelectRole" component={SelectRoleScreen} />
      <Stack.Screen name="Register">
        {(props) => <RegisterScreen {...props} onLoginSuccess={onLoginSuccess} />}
      </Stack.Screen>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="SelectLocation" component={SelectLocationScreen} />
    </Stack.Navigator>
  );
}
