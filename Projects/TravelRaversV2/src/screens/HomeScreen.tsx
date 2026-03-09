// ============================================================
// TRAVEL RAVERS — HomeScreen (Session 5-B: Bigger buttons + SOS)
// ============================================================

import React from 'react';
import {
  View, Text, Image, ImageBackground,
  TouchableOpacity, Dimensions, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { TronGlassButton } from '../components/TronGlassButton';

const { width: SCREEN_W } = Dimensions.get('window');
const ROW1_SIZE = Math.floor((SCREEN_W - 32 - 8) / 3);
const ROW2_SIZE = Math.floor(ROW1_SIZE * 0.92);

const ROW1_MODULES = [
  { id: 'TRACK', label: 'TRACK', color: '#A855F7', icon: require('../../assets/icons/track.png'), screen: 'Track' },
  { id: 'PHOTO', label: 'PHOTO', color: '#FF2D78', icon: require('../../assets/icons/photo.png'), screen: 'PixelParty' },
  { id: 'RADAR', label: 'RADAR', color: '#CC00FF', icon: require('../../assets/icons/radar.png'), screen: 'Radar' },
] as const;

const ROW2_MODULES = [
  { id: 'MAP', label: 'MAP', color: '#00FF88', icon: require('../../assets/icons/map.png'), screen: 'Map' },
  { id: 'TIMETABLE', label: 'TIMETABLE', color: '#FFB300', icon: require('../../assets/icons/timetable.png'), screen: 'Timetable' },
  { id: 'SOS', label: 'SOS', color: '#FF3344', icon: require('../../assets/icons/squad.png'), screen: 'SOS' },
] as const;

function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <ImageBackground
      source={require('../../assets/rave-festival-bg.jpg')}
      style={styles.root}
      imageStyle={{ opacity: 0.18, resizeMode: 'cover' } as any}
    >
      <SafeAreaView style={styles.safe}>

        {/* LOGO */}
        <Image
          source={require('../../assets/logo-v2.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* FESTIVAL PILL */}
        <TouchableOpacity style={styles.pill} onPress={() => console.log('event selector')}>
          <Text style={styles.pillText}>SELECT YOUR FESTIVAL →</Text>
        </TouchableOpacity>

        {/* GRID ROW 1: TRACK | PHOTO | RADAR */}
        <View style={styles.row}>
          {ROW1_MODULES.map((mod) => (
            <TronGlassButton
              key={mod.id}
              label={mod.label}
              sublabel=""
              iconSource={mod.icon}
              buttonSize={ROW1_SIZE}
              accentColor={mod.color}
              onPress={() => navigation.navigate(mod.screen)}
            />
          ))}
        </View>

        {/* GRID ROW 2: MAP | TIMETABLE | SOS */}
        <View style={[styles.row, { marginTop: 8 }]}>
          {ROW2_MODULES.map((mod) => (
            <TronGlassButton
              key={mod.id}
              label={mod.label}
              sublabel=""
              iconSource={mod.icon}
              buttonSize={ROW2_SIZE}
              accentColor={mod.color}
              onPress={() => navigation.navigate(mod.screen)}
            />
          ))}
        </View>

      </SafeAreaView>
    </ImageBackground>
  );
}

export { HomeScreen };
export default HomeScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#03060f' },
  safe: { flex: 1, alignItems: 'center', paddingTop: 8 },
  logo: { width: SCREEN_W * 0.5, height: 80, marginBottom: 6 },
  pill: {
    borderWidth: 1,
    borderColor: '#00FFCC',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginBottom: 14,
    backgroundColor: 'rgba(0,255,204,0.06)',
  },
  pillText: {
    color: '#00FFCC',
    fontFamily: 'Orbitron_700Bold',
    fontSize: 11,
    letterSpacing: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
});
