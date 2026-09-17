import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import VolunteerNavigator from '../../navigation/VolunteerNavigator';

export default function VolunteerMainScreen({ onLogout }) {
  return (
    <NavigationContainer independent={true}>
      <VolunteerNavigator onLogout={onLogout} />
    </NavigationContainer>
  );
}
