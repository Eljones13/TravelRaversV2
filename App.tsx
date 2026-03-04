import { Ionicons } from '@expo/vector-icons';
import { Orbitron_700Bold } from '@expo-google-fonts/orbitron';
import { ShareTechMono_400Regular } from '@expo-google-fonts/share-tech-mono';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import EventsScreen from './src/components/screens/EventsScreen';
import ScreenBackground from './src/components/shared/ScreenBackground';
import { COLOR_CYAN, FONT_DISPLAY } from './src/theme/tokens';

// ─── Placeholder screen factory ───────────────────────────────────────────────

function PlaceholderScreen({ name }: { name: string }) {
  return (
    <ScreenBackground>
      <View style={styles.center}>
        <Text style={styles.placeholderText}>{name}</Text>
      </View>
    </ScreenBackground>
  );
}

// EventsScreen imported from src/components/screens/EventsScreen
const RadarScreen  = () => <PlaceholderScreen name="RADAR" />;
const MapScreen    = () => <PlaceholderScreen name="MAP" />;
const TimesScreen  = () => <PlaceholderScreen name="TIMES" />;
const KitScreen    = () => <PlaceholderScreen name="KIT" />;
const SosScreen    = () => <PlaceholderScreen name="SOS" />;

// ─── Tab icon map ─────────────────────────────────────────────────────────────

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
  EVENTS: { active: 'radio',         inactive: 'radio-outline' },
  RADAR:  { active: 'wifi',          inactive: 'wifi-outline' },
  MAP:    { active: 'map',           inactive: 'map-outline' },
  TIMES:  { active: 'time',          inactive: 'time-outline' },
  KIT:    { active: 'bag',           inactive: 'bag-outline' },
  SOS:    { active: 'alert-circle',  inactive: 'alert-circle-outline' },
};

// ─── Navigator ────────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator();

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [fontsLoaded] = useFonts({
    Orbitron_700Bold,
    ShareTechMono_400Regular,
  });

  if (!fontsLoaded) {
    return <View style={styles.loading} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: COLOR_CYAN,
          tabBarInactiveTintColor: 'rgba(255,255,255,0.3)',
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ focused, color }) => {
            const icons = TAB_ICONS[route.name];
            const iconName = focused ? icons.active : icons.inactive;
            return <Ionicons name={iconName} size={20} color={color} />;
          },
        })}
      >
        <Tab.Screen name="EVENTS" component={EventsScreen} />
        <Tab.Screen name="RADAR"  component={RadarScreen} />
        <Tab.Screen name="MAP"    component={MapScreen} />
        <Tab.Screen name="TIMES"  component={TimesScreen} />
        <Tab.Screen name="KIT"    component={KitScreen} />
        <Tab.Screen name="SOS"    component={SosScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#000000',
  },
  tabBar: {
    backgroundColor: 'rgba(2,6,14,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,245,255,0.15)',
    paddingBottom: 4,
    height: 60,
  },
  tabLabel: {
    fontFamily: FONT_DISPLAY,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: FONT_DISPLAY,
    fontSize: 18,
    color: COLOR_CYAN,
    letterSpacing: 4,
  },
});
