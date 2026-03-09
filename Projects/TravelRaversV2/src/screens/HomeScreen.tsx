// ============================================================
// TRAVEL RAVERS — HomeScreen (Clean Rewrite)
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
const ROW1_SIZE = Math.floor((SCREEN_W - 32 - 16) / 3);
const ROW2_SIZE = Math.floor(ROW1_SIZE * 0.88);

const MODULES = [
  { id: 'TRACK', label: 'TRACK', color: '#A855F7', icon: require('../../assets/icons/track.png'), screen: 'Track' },
  { id: 'PHOTO', label: 'PHOTO', color: '#FF2D78', icon: require('../../assets/icons/photo.png'), screen: 'PixelParty' },
  { id: 'RADAR', label: 'RADAR', color: '#CC00FF', icon: require('../../assets/icons/radar.png'), screen: 'Radar' },
  { id: 'MAP', label: 'MAP', color: '#00FF88', icon: require('../../assets/icons/map.png'), screen: 'Map' },
  { id: 'TIMETABLE', label: 'TIMETABLE', color: '#FFB300', icon: require('../../assets/icons/timetable.png'), screen: 'Timetable' },
  { id: 'SQUAD', label: 'SQUAD', color: '#9D4EDD', icon: require('../../assets/icons/squad.png'), screen: 'SquadPanel' },
] as const;

function HomeScreen() {
  const navigation = useNavigation<any>();
  const ROW1 = MODULES.slice(0, 3);
  const ROW2 = MODULES.slice(3, 6);

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

        {/* GRID ROW 1 */}
        <View style={styles.row}>
          {ROW1.map((mod) => (
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

        {/* GRID ROW 2 */}
        <View style={[styles.row, { marginTop: 8 }]}>
          {ROW2.map((mod) => (
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
  logo: { width: SCREEN_W * 0.5, height: 90, marginBottom: 8 },
  pill: {
    borderWidth: 1,
    borderColor: '#00FFCC',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginBottom: 16,
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 8,
  },
});
