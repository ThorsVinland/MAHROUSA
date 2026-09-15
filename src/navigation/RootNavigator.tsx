// ============================================================
// src/navigation/RootNavigator.tsx
// Root Navigator Driven by Zustand Auth Store
// ============================================================

import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../constants/colors';

// Navigators
import AuthNavigator from './AuthNavigator';

// @ts-ignore
import RawVolunteerNavigator from './VolunteerNavigator';
// @ts-ignore
import RawOrganizationNavigator from './OrganizationNavigator';

const VolunteerNavigator = RawVolunteerNavigator as React.ComponentType<{ onLogout?: () => void }>;
const OrganizationNavigator = RawOrganizationNavigator as React.ComponentType<{ onLogout?: () => void }>;

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.mainBlue,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.textPrimary,
    border: Colors.borderDefault,
  },
};

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <NavigationContainer theme={navigationTheme}>
      {!isAuthenticated || !user ? (
        <AuthNavigator />
      ) : user.role === 'organization' ? (
        <OrganizationNavigator onLogout={logout} />
      ) : (
        <VolunteerNavigator onLogout={logout} />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
