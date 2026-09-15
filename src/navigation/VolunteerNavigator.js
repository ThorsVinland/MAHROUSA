// ============================================================
// src/navigation/VolunteerNavigator.js
// موجه شاشات المتطوع (Bottom Tabs + Stack Details)
// ============================================================

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../hooks/useTheme';

// Screens
import HomeScreen from '../features/volunteer/screens/HomeScreen';
import MapScreen from '../features/volunteer/screens/MapScreen';
import MyTasksScreen from '../features/volunteer/screens/MyTasksScreen';
import ProfileScreen from '../features/volunteer/screens/ProfileScreen';
import NeedDetailsScreen from '../features/volunteer/screens/NeedDetailsScreen';
import TaskTrackingScreen from '../features/volunteer/screens/TaskTrackingScreen';
import SkillsSelectionScreen from '../features/volunteer/screens/SkillsSelectionScreen';
import RatingScreen from '../features/volunteer/screens/RatingScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function VolunteerTabs() {
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

          if (route.name === 'VolunteerHome') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'VolunteerMap') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'VolunteerTasks') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          } else if (route.name === 'VolunteerProfile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size || 24} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="VolunteerHome" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'الرئيسية' }} 
      />
      <Tab.Screen 
        name="VolunteerMap" 
        component={MapScreen} 
        options={{ tabBarLabel: 'الخريطة' }} 
      />
      <Tab.Screen 
        name="VolunteerTasks" 
        component={MyTasksScreen} 
        options={{ tabBarLabel: 'مهامي' }} 
      />
      <Tab.Screen 
        name="VolunteerProfile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'حسابي' }} 
      />
    </Tab.Navigator>
  );
}

export default function VolunteerNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="VolunteerMain" component={VolunteerTabs} />
      <Stack.Screen name="NeedDetails" component={NeedDetailsScreen} />
      <Stack.Screen name="TaskTracking" component={TaskTrackingScreen} />
      <Stack.Screen name="SkillsSelection" component={SkillsSelectionScreen} />
      <Stack.Screen name="Rating" component={RatingScreen} />
    </Stack.Navigator>
  );
}
