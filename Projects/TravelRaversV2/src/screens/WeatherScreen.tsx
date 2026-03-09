// ============================================================
// TRAVEL RAVERS — WeatherScreen (Stub)
// Session 1-C: Secondary module stub — full build in Session 2-A
// Accent: Sky Blue (#00BFFF)
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlowBorderCard } from '../components/GlowBorderCard';
import { Colors } from '../constants/colors';

type WeatherScreenProps = {
  navigation: { goBack: () => void };
};

export const WeatherScreen: React.FC<WeatherScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.backBtn} onTouchEnd={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </View>
        <View>
          <Text style={styles.title}>WEATHER</Text>
          <Text style={styles.subtitle}>Conditions & Forecast</Text>
        </View>
      </View>
      <View style={styles.body}>
        <GlowBorderCard accentColor={Colors.module.WEATHER}>
          <View style={styles.content}>
            <Text style={styles.emoji}>🌦</Text>
            <Text style={styles.comingSoonLabel}>COMING IN PHASE 2</Text>
            <Text style={styles.comingSoonTitle}>WEATHER</Text>
            <Text style={styles.desc}>
              Live conditions from Open-Meteo.{'\n'}
              Rain %, wind, UV index, 5-day forecast.{'\n'}
              Smart kit alerts (rain → pack wellies).{'\n'}
              Caches offline before the festival.
            </Text>
          </View>
        </GlowBorderCard>
      </View>
    </SafeAreaView>
  );
};

const C = Colors.module.WEATHER;
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  header: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderBottomWidth: 1,
    borderBottomColor: `${C}22`,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${C}44`,
    backgroundColor: `${C}11`,
  },
  backText: { color: C, fontSize: 16, fontWeight: '700' },
  title: {
    color: C,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    ...Platform.select({
      web: { textShadow: `0px 0px 8px ${C}` } as any,
      default: { textShadowColor: C, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 }
    }),
  },
  subtitle: { color: Colors.dim, fontSize: 9, letterSpacing: 2, marginTop: 2, textTransform: 'uppercase' },
  body: { flex: 1, padding: 16, justifyContent: 'center' },
  content: { alignItems: 'center', paddingVertical: 24 },
  emoji: { fontSize: 48, marginBottom: 20 },
  comingSoonLabel: { color: Colors.dim, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 },
  comingSoonTitle: {
    color: C,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 4,
    textTransform: 'uppercase',
    ...Platform.select({
      web: { textShadow: `0px 0px 12px ${C}` } as any,
      default: { textShadowColor: C, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12 }
    }),
    marginBottom: 16,
  },
  desc: { color: Colors.text, fontSize: 13, lineHeight: 22, textAlign: 'center', opacity: 0.7 },
});
