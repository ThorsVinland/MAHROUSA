import React, { useState, useEffect, useRef } from 'react';
import { BackHandler, View, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from '../screens/auth/SplashScreen';
import SelectRoleScreen from '../screens/auth/SelectRoleScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen';
import VolunteerMainScreen from '../screens/main/VolunteerMainScreen';
import OrganizationMainScreen from '../screens/main/OrganizationMainScreen';
import { useAuthStore } from '../store/authStore';
import { registerForPushNotificationsAsync, startLiveNotificationListener } from '../services/pushNotificationService';
import { registerIndieID } from 'native-notify';

export default function RootNavigator() { 
  const [currentScreen, setCurrentScreen] = useState('Loading'); // Loading, Splash, SelectRole, Register, Login, VerifyOTP, VolunteerMain, OrganizationMain
  const [selectedRole, setSelectedRole] = useState(null); // 'volunteer' or 'organization'
  const [otpPhoneNumber, setOtpPhoneNumber] = useState('');
  const [flowData, setFlowData] = useState(null);
  const backPressCountRef = useRef(0);
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  // تسجيل جهاز المستخدم واستماع حي لجميع الإشعارات لإظهارها في شريط إشعارات الهاتف مباشرة
  useEffect(() => {
    registerForPushNotificationsAsync(user);
    if (user?.phone) {
      try {
        registerIndieID(String(user.phone).trim(), 34005, 'ILijd1fKUZshCckkCJC7EF');
      } catch (_err) {}
    }
    const unsubscribe = startLiveNotificationListener(user);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        // await AsyncStorage.clear();
        const hasLaunched = await AsyncStorage.getItem('hasLaunchedBefore');
        if (hasLaunched === 'true') {
          if (isAuthenticated && user) {
            setCurrentScreen(user.role === 'organization' ? 'OrganizationMain' : 'VolunteerMain');
          } else {
            setCurrentScreen('SelectRole'); // تخطي شاشة الترحيب إذا دخل من قبل
          }
        } else {
          setCurrentScreen('Splash');
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
        setCurrentScreen('Splash');
      }
    };
    checkFirstLaunch();
  }, []);

  // Listen for logout events from the store
  useEffect(() => {
    if (!isAuthenticated && (currentScreen === 'VolunteerMain' || currentScreen === 'OrganizationMain')) {
      handleLogout();
    }
  }, [isAuthenticated]);

  // دعم زر الرجوع الخاص بالهاتف (أندرويد)
  useEffect(() => {
    const backAction = () => {
      if (currentScreen === 'VolunteerMain' || currentScreen === 'OrganizationMain') {
        return false; // الخروج من التطبيق
      }
      if (currentScreen === 'VerifyOTP') {
        setCurrentScreen('Login'); // العودة للوجين مبدئيا
        return true;
      }
      if (currentScreen === 'SelectRole') {
        if (backPressCountRef.current === 0) {
          backPressCountRef.current = 1;
          Toast.show({
            type: 'customInfo',
            text1: 'اضغط مرة أخرى للخروج من التطبيق',
            position: 'bottom',
            bottomOffset: 80,
          });
          setTimeout(() => {
            backPressCountRef.current = 0;
          }, 2000);
          return true; // منع الخروج وانتظار الضغطة الثانية
        } else {
          BackHandler.exitApp();
          return true;
        }
      }
      if (currentScreen !== 'Splash') {
        setCurrentScreen('SelectRole');
        return true; // منع الخروج من التطبيق
      }
      return false; // السماح بالخروج إذا كنا في شاشة الترحيب
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [currentScreen]);

  const handleVerifySuccess = () => {
    // توجيه المستخدم للواجهة الرئيسية حسب دوره
    if (selectedRole === 'organization') {
      setCurrentScreen('OrganizationMain');
    } else {
      setCurrentScreen('VolunteerMain');
    }
  };

  const handleLogout = () => {
    setCurrentScreen('SelectRole');
    setSelectedRole(null);
    setOtpPhoneNumber('');
    setFlowData(null);
  };

  if (currentScreen === 'Loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#1A5276" />
      </View>
    );
  }

  if (currentScreen === 'Splash') {
    return (
      <SplashScreen 
        onFinish={async () => {
          try {
            await AsyncStorage.setItem('hasLaunchedBefore', 'true');
          } catch (e) {}
          setCurrentScreen('SelectRole');
        }} 
      />
    );
  }

  if (currentScreen === 'VolunteerMain') {
    return <VolunteerMainScreen onLogout={handleLogout} />;
  }

  if (currentScreen === 'OrganizationMain') {
    return <OrganizationMainScreen onLogout={handleLogout} />;
  }

  if (currentScreen === 'VerifyOTP') {
    return (
      <VerifyOtpScreen 
        phoneNumber={otpPhoneNumber}
        flowData={flowData}
        onVerifySuccess={(finalRole) => {
          setSelectedRole(finalRole);
          if (finalRole === 'organization') {
            setCurrentScreen('OrganizationMain');
          } else {
            setCurrentScreen('VolunteerMain');
          }
        }}
        onBack={() => setCurrentScreen('Login')}
      />
    );
  }

  if (currentScreen === 'SelectRole') {
    return (
      <SelectRoleScreen 
        onSelect={(role) => {
          setSelectedRole(role);
          setCurrentScreen('Login');
        }}
        onGoToLogin={() => setCurrentScreen('Login')}
      />
    );
  }

  if (currentScreen === 'Register') {
    return (
      <RegisterScreen 
        role={selectedRole}
        onBack={() => setCurrentScreen('Login')}
        onGoToLogin={() => setCurrentScreen('Login')}
        onGoToVerifyOtp={(phone, data) => {
          setOtpPhoneNumber(phone);
          setFlowData(data);
          setCurrentScreen('VerifyOTP');
        }}
      />
    );
  }

  // Fallback to Login
  return (
    <LoginScreen 
      selectedRole={selectedRole}
      onGoToRegister={() => setCurrentScreen('Register')} 
      onBack={() => setCurrentScreen('SelectRole')}
      onGoToVerifyOtp={(phone, data) => {
        setOtpPhoneNumber(phone);
        setFlowData(data);
        setCurrentScreen('VerifyOTP');
      }}
    />
  );
}
