import React, { useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import SelectRoleScreen from '../screens/auth/SelectRoleScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

export default function RootNavigator() { 
  const [currentScreen, setCurrentScreen] = useState('SelectRole'); // SelectRole, Register, Login
  const [selectedRole, setSelectedRole] = useState(null); // 'volunteer' or 'organization'

  // دعم زر الرجوع الخاص بالهاتف (أندرويد)
  useEffect(() => {
    const backAction = () => {
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
      />
    );
  }

  // Fallback to Login
  return (
    <LoginScreen 
      onGoToRegister={() => setCurrentScreen('Register')} 
      onBack={() => setCurrentScreen('SelectRole')}
    />
  );
}
