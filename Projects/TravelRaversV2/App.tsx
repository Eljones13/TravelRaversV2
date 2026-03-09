// ============================================================
// TRAVEL RAVERS — App Entry Point
// SafeAreaProvider + Orbitron font loading + Splash Screen
// ============================================================

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Orbitron_700Bold, Orbitron_900Black } from '@expo-google-fonts/orbitron';
import { ShareTechMono_400Regular } from '@expo-google-fonts/share-tech-mono';
import * as SplashScreen from 'expo-splash-screen';
import { AppNavigator } from './src/navigation';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Orbitron_700Bold,
    Orbitron_900Black,
    ShareTechMono_400Regular,
  });

  React.useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
