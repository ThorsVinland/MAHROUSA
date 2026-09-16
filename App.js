import React from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { AlertProvider } from './src/context/AlertContext';

export default function App() {
  return (
    <ThemeProvider>
      <AlertProvider>
        <RootNavigator />
      </AlertProvider>
    </ThemeProvider>
  );
}
