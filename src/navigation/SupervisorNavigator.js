// ============================================================
// src/navigation/SupervisorNavigator.js
// موجه شاشات المتطوع المشرف (Bottom Tabs + Stack Screens)
// ============================================================

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../hooks/useTheme';

// Screens
import SupervisorDashboardScreen from '../features/supervisor/screens/SupervisorDashboardScreen';
import TeamManagementScreen from '../features/supervisor/screens/TeamManagementScreen';
import FieldReportScreen from '../features/supervisor/screens/FieldReportScreen';
import ResourceFormScreen from '../features/supervisor/screens/ResourceFormScreen';
import RequestSupervisorRoleScreen from '../features/supervisor/screens/RequestSupervisorRoleScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function SupervisorTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
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

          if (route.name === 'SupervisorDashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'SupervisorTeams') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'SupervisorReports') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          }

          return <Ionicons name={iconName} size={size || 24} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="SupervisorDashboard" 
        component={SupervisorDashboardScreen} 
        options={{ tabBarLabel: 'لوحة الإشراف' }} 
      />
      <Tab.Screen 
        name="SupervisorTeams" 
        component={TeamManagementScreen} 
        options={{ tabBarLabel: 'الفرق الميدانية' }} 
      />
      <Tab.Screen 
        name="SupervisorReports" 
        component={FieldReportScreen} 
        options={{ tabBarLabel: 'التقارير' }} 
      />
    </Tab.Navigator>
  );
}

export default function SupervisorNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="SupervisorMain" component={SupervisorTabs} />
      <Stack.Screen name="ResourceForm" component={ResourceFormScreen} />
      <Stack.Screen name="RequestSupervisorRole" component={RequestSupervisorRoleScreen} />
    </Stack.Navigator>
  );
}
