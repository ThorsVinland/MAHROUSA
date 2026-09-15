// ============================================================
// src/navigation/OrganizationNavigator.js
// موجه شاشات الجمعيات والمؤسسات (Bottom Tabs + Stack Screens)
// ============================================================

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../hooks/useTheme';

// Screens
import OrgDashboardScreen from '../features/organization/screens/OrgDashboardScreen';
import CreateNeedScreen from '../features/organization/screens/CreateNeedScreen';
import ApplicantsScreen from '../features/organization/screens/ApplicantsScreen';
import ResourcesPoolScreen from '../features/organization/screens/ResourcesPoolScreen';
import EmergencyModeScreen from '../features/organization/screens/EmergencyModeScreen';
import OrgReportsScreen from '../features/organization/screens/OrgReportsScreen';
import OrgRegistrationScreen from '../features/organization/screens/OrgRegistrationScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function OrganizationTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.organization,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'OrgDashboard') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'CreateNeed') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Applicants') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'ResourcesPool') {
            iconName = focused ? 'cube' : 'cube-outline';
          }

          return <Ionicons name={iconName} size={size || 24} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="OrgDashboard" 
        component={OrgDashboardScreen} 
        options={{ tabBarLabel: 'لوحة الجمعية' }} 
      />
      <Tab.Screen 
        name="CreateNeed" 
        component={CreateNeedScreen} 
        options={{ tabBarLabel: 'طلب احتياج' }} 
      />
      <Tab.Screen 
        name="Applicants" 
        component={ApplicantsScreen} 
        options={{ tabBarLabel: 'المتطوعون' }} 
      />
      <Tab.Screen 
        name="ResourcesPool" 
        component={ResourcesPoolScreen} 
        options={{ tabBarLabel: 'الموارد' }} 
      />
    </Tab.Navigator>
  );
}

export default function OrganizationNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="OrgMain" component={OrganizationTabs} />
      <Stack.Screen name="EmergencyMode" component={EmergencyModeScreen} />
      <Stack.Screen name="OrgReports" component={OrgReportsScreen} />
      <Stack.Screen name="OrgRegistration" component={OrgRegistrationScreen} />
    </Stack.Navigator>
  );
}
