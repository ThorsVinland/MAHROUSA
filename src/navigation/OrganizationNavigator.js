// ============================================================
// src/navigation/OrganizationNavigator.js
// Organization Screens Navigation (Bottom Tabs + Stack)
// ============================================================

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomNavBar } from '../components/home/BottomNavBar';

// Screens
import OrgDashboardScreen from '../screens/organization/OrgDashboardScreen';
import OrgMapScreen from '../screens/organization/OrgMapScreen';
import OrgNeedsScreen from '../screens/organization/OrgNeedsScreen';
import OrgProfileScreen from '../screens/organization/OrgProfileScreen';
import CreateNeedScreen from '../screens/organization/CreateNeedScreen';
import EmergencyModeScreen from '../screens/organization/EmergencyModeScreen';
import NotificationsScreen from '../screens/common/NotificationsScreen';
import { subscribeToLiveCrises } from '../services/crisesService';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function OrganizationTabBar({ state, navigation }) {
  const currentRouteName = state.routes[state.index].name;
  let activeTab = 'home';
  if (currentRouteName === 'OrgMap') activeTab = 'map';
  else if (currentRouteName === 'OrgNeeds') activeTab = 'tasks';
  else if (currentRouteName === 'OrgProfile') activeTab = 'profile';

  const [activeCrisesCount, setActiveCrisesCount] = React.useState(0);

  React.useEffect(() => {
    const unsub = subscribeToLiveCrises((crises) => {
      setActiveCrisesCount(crises.length);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const handleTabChange = (tab) => {
    if (tab === 'home') navigation.navigate('OrgDashboard');
    else if (tab === 'map') navigation.navigate('OrgMap');
    else if (tab === 'tasks') navigation.navigate('OrgNeeds');
    else if (tab === 'profile') navigation.navigate('OrgProfile');
  };

  return (
    <BottomNavBar
      activeTab={activeTab}
      onTabChange={handleTabChange}
      tasksBadgeCount={0}
      crisesBadgeCount={activeCrisesCount}
      labels={{
        home: 'الرئيسية',
        map: 'الخريطة',
        tasks: 'الاحتياجات',
        profile: 'حسابي',
      }}
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
      <Tab.Screen name="OrgMap" component={OrgMapScreen} />
      <Tab.Screen name="OrgNeeds" component={OrgNeedsScreen} />
      <Tab.Screen name="OrgProfile" component={OrgProfileScreen} />
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
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
