import React, { useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import SelectRoleScreen from '../screens/auth/SelectRoleScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen';
import VolunteerMainScreen from '../screens/main/VolunteerMainScreen';
import OrganizationMainScreen from '../screens/main/OrganizationMainScreen';

export default function RootNavigator() { 
  const [currentScreen, setCurrentScreen] = useState('SelectRole'); // SelectRole, Register, Login, VerifyOTP, VolunteerMain, OrganizationMain
  const [selectedRole, setSelectedRole] = useState(null); // 'volunteer' or 'organization'
  const [otpPhoneNumber, setOtpPhoneNumber] = useState('');
  const [flowData, setFlowData] = useState(null);

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
      if (currentScreen !== 'SelectRole') {
        setCurrentScreen('SelectRole');
        return true; // منع الخروج من التطبيق
      }
      return false; // السماح بالخروج إذا كنا في الصفحة الأولى
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
