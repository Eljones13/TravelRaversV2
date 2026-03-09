// ============================================================
// TRAVEL RAVERS — Navigation
// Overnight session: All 12 module screens accessible from HomeStack
//   - Bottom tab navigator: HOME | SQUAD
//   - HomeStack: HomeScreen + ALL 12 module screens
//   - SquadStack: SquadPanelScreen + 5 secondary module screens
//   - Tab bar: Tron glass styling — dark bg, cyan/magenta glows
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

// ── Screen imports — HOME stack (all 12 modules) ──
import { HomeScreen } from '../screens/HomeScreen';
import { EventsScreen } from '../screens/EventsScreen';
import { MapScreen } from '../screens/MapScreen';
import { TimetableScreen } from '../screens/TimetableScreen';
import { KitScreen } from '../screens/KitScreen';
import { SOSScreen } from '../screens/SOSScreen';
import { TrackScreen } from '../screens/TrackScreen';
import { RadarScreen } from '../screens/RadarScreen';
import { WeatherScreen } from '../screens/WeatherScreen';
import { PixelPartyScreen } from '../screens/PixelPartyScreen';
import { BudgetScreen } from '../screens/BudgetScreen';
import { SquadPanelScreen } from '../screens/SquadPanelScreen';
import { SquadSetupScreen } from '../screens/SquadSetupScreen';

// ── Stack param lists ──
export type HomeStackParamList = {
  HomeMain: undefined;
  Events: undefined;
  Map: undefined;
  Timetable: undefined;
  Kit: undefined;
  SOS: undefined;
  Track: undefined;
  Radar: undefined;
  Weather: undefined;
  PixelParty: undefined;
  Budget: undefined;
  SquadPanel: undefined;
  SquadSetup: undefined;
};

export type SquadStackParamList = {
  SquadPanel: undefined;
  Radar: undefined;
  Weather: undefined;
  PixelParty: undefined;
  Budget: undefined;
  SquadSetup: undefined;
};

export type RootTabParamList = {
  HomeTab: undefined;
  SquadTab: undefined;
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const SquadStack = createNativeStackNavigator<SquadStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

const stackOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: Colors.bg },
  animation: 'fade' as const,
} as const;

// ── HOME Stack — all 12 screens accessible from HomeScreen ──
function HomeStackNavigator(): React.ReactElement {
  return (
    <HomeStack.Navigator screenOptions={stackOptions} initialRouteName="HomeMain">
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="Events" component={EventsScreen} />
      <HomeStack.Screen name="Map" component={MapScreen} />
      <HomeStack.Screen name="Timetable" component={TimetableScreen} />
      <HomeStack.Screen name="Kit" component={KitScreen} />
      <HomeStack.Screen name="SOS" component={SOSScreen} />
      <HomeStack.Screen name="Track" component={TrackScreen} />
      <HomeStack.Screen name="Radar" component={RadarScreen} />
      <HomeStack.Screen name="Weather" component={WeatherScreen} />
      <HomeStack.Screen name="PixelParty" component={PixelPartyScreen} />
      <HomeStack.Screen name="Budget" component={BudgetScreen} />
      <HomeStack.Screen name="SquadPanel" component={SquadPanelScreen} />
      <HomeStack.Screen name="SquadSetup" component={SquadSetupScreen} />
    </HomeStack.Navigator>
  );
}

// ── SQUAD Stack — shortcut tab for squad-focused flow ──
function SquadStackNavigator(): React.ReactElement {
  return (
    <SquadStack.Navigator screenOptions={stackOptions} initialRouteName="SquadPanel">
      <SquadStack.Screen name="SquadPanel" component={SquadPanelScreen} />
      <SquadStack.Screen name="Radar" component={RadarScreen} />
      <SquadStack.Screen name="Weather" component={WeatherScreen} />
      <SquadStack.Screen name="PixelParty" component={PixelPartyScreen} />
      <SquadStack.Screen name="Budget" component={BudgetScreen} />
      <SquadStack.Screen name="SquadSetup" component={SquadSetupScreen} />
    </SquadStack.Navigator>
  );
}

// ── Tab Bar Icons ──
// Rendered directly in tabBarIcon configuration

// ── App Navigator (Root) ──
export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: tabStyles.bar,
          tabBarActiveTintColor: '#00FFCC',
          tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
          tabBarIcon: ({ color, focused }) => {
            const iconName = route.name === 'HomeTab' ? 'home-outline' : 'people-outline';
            return (
              <View style={focused ? (route.name === 'HomeTab' ? tabStyles.iconWrapperActive : tabStyles.iconWrapperActiveMagenta) : tabStyles.iconWrapper}>
                <Ionicons name={iconName} size={22} color={color} />
              </View>
            );
          },
          tabBarLabel: ({ color }) => (
            <Text style={[tabStyles.label, { color }]}>
              {route.name === 'HomeTab' ? 'HOME' : 'SQUAD'}
            </Text>
          ),
        })}
      >
        <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
        <Tab.Screen name="SquadTab" component={SquadStackNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

// ── Tab bar styles ──
const tabStyles = StyleSheet.create({
  bar: {
    backgroundColor: 'rgba(3,6,15,0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,245,255,0.12)',
    height: Platform.OS === 'ios' ? 80 : 64,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 6,
    ...Platform.select({
      web: { boxShadow: `0px -2px 8px ${Colors.cyan}14` } as any,
      default: { shadowColor: Colors.cyan, shadowOffset: { width: 0, height: -2 }, shadowRadius: 8, shadowOpacity: 0.08 }
    }),
    elevation: 16,
  },
  label: {
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  iconWrapperActive: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,245,255,0.06)',
    ...Platform.select({
      web: { boxShadow: `0px 0px 6px ${Colors.cyan}80` } as any,
      default: { shadowColor: Colors.cyan, shadowOffset: { width: 0, height: 0 }, shadowRadius: 6, shadowOpacity: 0.5 }
    }),
  },
  iconWrapperActiveMagenta: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,0,255,0.06)',
    ...Platform.select({
      web: { boxShadow: `0px 0px 6px ${Colors.magenta}80` } as any,
      default: { shadowColor: Colors.magenta, shadowOffset: { width: 0, height: 0 }, shadowRadius: 6, shadowOpacity: 0.5 }
    }),
  },
  iconWrapper: {
    padding: 4,
  },
});
