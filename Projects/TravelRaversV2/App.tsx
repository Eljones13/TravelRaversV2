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
import { FestivalProvider } from './src/context/FestivalContext';
import { MusicProvider } from './src/context/MusicContext';
import { initDatabase } from './src/db/database';
import { seedDatabase } from './src/db/seed';

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

  // Initialise SQLite tables and seed on first launch
  React.useEffect(() => {
    initDatabase()
      .then(() => seedDatabase())
      .catch((err) => console.error('[DB] Init error:', err));
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <FestivalProvider>
          <MusicProvider>
            <AppNavigator />
          </MusicProvider>
        </FestivalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
