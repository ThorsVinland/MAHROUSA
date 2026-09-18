// src/navigation/OrganizationNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomNavBar } from '../components/home/BottomNavBar';

// Screens
import OrgDashboardScreen from '../screens/organization/OrgDashboardScreen';
import ResourcesPoolScreen from '../screens/organization/ResourcesPoolScreen';
import OrgReportsScreen from '../screens/organization/OrgReportsScreen';
import ApplicantsScreen from '../screens/organization/ApplicantsScreen';
import CreateNeedScreen from '../screens/organization/CreateNeedScreen';
import EmergencyModeScreen from '../screens/organization/EmergencyModeScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function OrganizationTabBar({ state, navigation }) {
  const currentRouteName = state.routes[state.index].name;
  let activeTab = 'home';
  if (currentRouteName === 'OrgResources') activeTab = 'map';
  else if (currentRouteName === 'OrgReports') activeTab = 'tasks';
  else if (currentRouteName === 'OrgApplicants') activeTab = 'profile';

  const handleTabChange = (tab) => {
    if (tab === 'home') navigation.navigate('OrgDashboard');
    else if (tab === 'map') navigation.navigate('OrgResources');
    else if (tab === 'tasks') navigation.navigate('OrgReports');
    else if (tab === 'profile') navigation.navigate('OrgApplicants');
  };

  return (
    <BottomNavBar
      activeTab={activeTab}
      onTabChange={handleTabChange}
      tasksBadgeCount={0}
    />
  );
}

function OrganizationTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <OrganizationTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="OrgDashboard" component={OrgDashboardScreen} />
      <Tab.Screen name="OrgResources" component={ResourcesPoolScreen} />
      <Tab.Screen name="OrgReports" component={OrgReportsScreen} />
      <Tab.Screen name="OrgApplicants" component={ApplicantsScreen} />
    </Tab.Navigator>
  );
}

export default function OrganizationNavigator({ onLogout }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="OrganizationMain">
        {(props) => <OrganizationTabs {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="CreateNeed" component={CreateNeedScreen} />
      <Stack.Screen name="EmergencyMode" component={EmergencyModeScreen} />
    </Stack.Navigator>
  );
}
