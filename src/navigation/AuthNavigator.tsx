// ============================================================
// src/navigation/AuthNavigator.tsx
// Authentication Stack Navigator with Strict Typing
// ============================================================

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/auth.types';

// Screens
import { RoleSelectionScreen } from '../screens/auth/RoleSelectionScreen';
import { VolunteerSignUpScreen } from '../screens/auth/VolunteerSignUpScreen';
import { VolunteerLoginScreen } from '../screens/auth/VolunteerLoginScreen';
import { OrganizationSignUpScreen } from '../screens/auth/OrganizationSignUpScreen';
import { OrganizationLoginScreen } from '../screens/auth/OrganizationLoginScreen';
import { WaitingApprovalScreen } from '../screens/auth/WaitingApprovalScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="RoleSelection"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="VolunteerSignUp" component={VolunteerSignUpScreen} />
      <Stack.Screen name="VolunteerLogin" component={VolunteerLoginScreen} />
      <Stack.Screen name="OrganizationSignUp" component={OrganizationSignUpScreen} />
      <Stack.Screen name="OrganizationLogin" component={OrganizationLoginScreen} />
      <Stack.Screen name="WaitingApproval" component={WaitingApprovalScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
