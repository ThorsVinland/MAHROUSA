// ============================================================
// src/navigation/VolunteerNavigator.js
// موجه شاشات المتطوع الموحد (Bottom Tabs + Stack Details)
// ============================================================

import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BottomNavBar } from "../components/home/BottomNavBar";
import { useAuthStore } from "../store/authStore";
import { subscribeToVolunteerTasks } from "../services/tasksService";
import { subscribeToLiveCrises } from "../services/crisesService";

// Screens
import HomeScreen from "../screens/volunteer/HomeScreen";
import MapScreen from "../screens/volunteer/MapScreen";
import MyTasksScreen from "../screens/volunteer/MyTasksScreen";
import ProfileScreen from "../screens/volunteer/ProfileScreen";
import NeedDetailsScreen from "../screens/volunteer/NeedDetailsScreen";
import TaskTrackingScreen from "../screens/volunteer/TaskTrackingScreen";
import SkillsSelectionScreen from "../screens/volunteer/SkillsSelectionScreen";
import RatingScreen from "../screens/volunteer/RatingScreen";
import NotificationsScreen from "../screens/common/NotificationsScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function VolunteerTabBar({ state, navigation }) {
  const currentRouteName = state.routes[state.index].name;
  let activeTab = "home";
  if (currentRouteName === "VolunteerMap") activeTab = "map";
  else if (currentRouteName === "VolunteerTasks") activeTab = "tasks";
  else if (currentRouteName === "VolunteerProfile") activeTab = "profile";

  const user = useAuthStore((s) => s.user);
  const currentUserId = user?.id || user?.phone || "user_guest";
  const userPhone = user?.phone;
  const [activeTasksCount, setActiveTasksCount] = useState(0);
  const [activeCrisesCount, setActiveCrisesCount] = useState(0);

  useEffect(() => {
    const unsub = subscribeToVolunteerTasks(
      currentUserId,
      userPhone,
      (tasks) => {
        const count = tasks.filter((t) => !t.isCompletedByMe).length;
        setActiveTasksCount(count);
      },
      () => {}
    );
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [currentUserId, userPhone]);

  // Subscribe to live crises count for the map badge
  useEffect(() => {
    const unsubCrises = subscribeToLiveCrises((crises) => {
      setActiveCrisesCount(crises.length);
    });
    return () => {
      if (typeof unsubCrises === "function") unsubCrises();
    };
  }, []);

  const handleTabChange = (tab) => {
    if (tab === "home") navigation.navigate("VolunteerHome");
    else if (tab === "map") navigation.navigate("VolunteerMap");
    else if (tab === "tasks") navigation.navigate("VolunteerTasks");
    else if (tab === "profile") navigation.navigate("VolunteerProfile");
  };

  return (
    <BottomNavBar
      activeTab={activeTab}
      onTabChange={handleTabChange}
      tasksBadgeCount={activeTasksCount}
      crisesBadgeCount={activeCrisesCount}
    />
  );
}

function VolunteerTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <VolunteerTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="VolunteerHome" component={HomeScreen} />
      <Tab.Screen name="VolunteerMap" component={MapScreen} />
      <Tab.Screen name="VolunteerTasks" component={MyTasksScreen} />
      <Tab.Screen name="VolunteerProfile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function VolunteerNavigator({ onLogout }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="VolunteerMain">
        {(props) => <VolunteerTabs {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="NeedDetails" component={NeedDetailsScreen} />
      <Stack.Screen name="TaskTracking" component={TaskTrackingScreen} />
      <Stack.Screen name="SkillsSelection" component={SkillsSelectionScreen} />
      <Stack.Screen name="Rating" component={RatingScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
