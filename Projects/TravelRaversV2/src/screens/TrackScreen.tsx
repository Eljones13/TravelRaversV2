// ============================================================
// TRAVEL RAVERS — TrackScreen (TrackHunter stub)
// Session TRACK-HUNTER-STUB: Preview screen for ACRCloud
// music ID feature. Full build scheduled for future session.
// Accent: #A855F7 (violet)
//
// TODO (Future session): Full TrackHunter build
//   1. expo-av for microphone access
//   2. expo-permissions for RECORD_AUDIO
//   3. ACRCloud API: https://www.acrcloud.com/docs/
//   4. 8-second audio capture + base64 encode
//   5. POST to ACRCloud identify endpoint
//   6. Save identified track to setlist (SQLite user_faves)
// ============================================================

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, Pattern, Circle, Rect } from 'react-native-svg';
import { Colors } from '../constants/colors';

const ACCENT = Colors.module.TRACK; // '#A855F7'

// ── Helpers ───────────────────────────────────────────────────
function glow(color: string, r = 10) {
  return Platform.select({
    web:     { boxShadow: `0 0 ${r}px ${color}` } as object,
    default: { shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowRadius: r, shadowOpacity: 0.9 },
  })!;
}

// ── Pulsing mic button ────────────────────────────────────────
const PulsingMicButton: React.FC = () => {
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const ring = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1.55, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(val, { toValue: 1,    duration: 0,    useNativeDriver: true }),
        ])
      );
    const r1 = ring(pulse1, 0);
    const r2 = ring(pulse2, 700);
    r1.start();
    r2.start();
    return () => { r1.stop(); r2.stop(); };
  }, [pulse1, pulse2]);

  return (
    <View style={btn.wrap}>
      {/* Outer pulse rings */}
      <Animated.View
        pointerEvents="none"
        style={[btn.ring, { transform: [{ scale: pulse1 }], opacity: pulse1.interpolate({ inputRange: [1, 1.55], outputRange: [0.35, 0] }) }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[btn.ring, { transform: [{ scale: pulse2 }], opacity: pulse2.interpolate({ inputRange: [1, 1.55], outputRange: [0.22, 0] }) }]}
      />

      {/* Main circle */}
      <View style={[btn.circle, glow(ACCENT, 18)]}>
        <Text style={btn.micSymbol}>⬤</Text>
        <Text style={btn.micLabel}>MIC</Text>
      </View>
    </View>
  );
};

// ── MAIN SCREEN ───────────────────────────────────────────────
export function TrackScreen() {
  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>

      {/* Dot-grid background */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern id="dotTH" width="40" height="40" patternUnits="userSpaceOnUse">
              <Circle cx="1" cy="1" r="0.5" fill="rgba(168,85,247,0.05)" />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#dotTH)" />
        </Svg>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={[s.headerTitle, glow(ACCENT, 14)]}>TRACK HUNTER</Text>
          <Text style={s.headerSubtitle}>ID TRACKS IN REAL TIME</Text>
        </View>

        {/* ── Pulsing hold button ── */}
        <View style={s.btnSection}>
          <PulsingMicButton />
          <Text style={s.holdLabel}>HOLD TO IDENTIFY</Text>
          <Text style={s.holdSublabel}>POWERED BY ACRCLOUD — COMING SOON</Text>
        </View>

        {/* ── Coming soon card ── */}
        <View style={[s.infoCard, glow(ACCENT, 8)]}>
          <View style={s.cardShine} pointerEvents="none" />
          <Text style={s.cardHeading}>TRACK HUNTER COMING SOON</Text>
          <Text style={s.cardBody}>
            Hold your phone up to any speaker and identify the track playing in seconds.
            Saves directly to your festival setlist so you never lose a track ID again.
          </Text>

          {/* Coming soon badge */}
          <View style={s.badge}>
            <Text style={s.badgeText}>COMING SOON</Text>
          </View>
        </View>

        {/* ── How it works ── */}
        <View style={s.stepsCard}>
          <View style={s.cardShine} pointerEvents="none" />
          {[
            { step: '01', text: 'Hold your phone near any speaker' },
            { step: '02', text: '8 seconds of audio captured' },
            { step: '03', text: 'ACRCloud identifies the track' },
            { step: '04', text: 'Auto-saved to your setlist' },
          ].map(({ step, text }) => (
            <View key={step} style={s.stepRow}>
              <Text style={s.stepNum}>{step}</Text>
              <Text style={s.stepText}>{text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default TrackScreen;

// ── Pulsing button styles ──────────────────────────────────────
const D = 160; // button diameter

const btn = StyleSheet.create({
  wrap: {
    width: D,
    height: D,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: D,
    height: D,
    borderRadius: D / 2,
    borderWidth: 2,
    borderColor: ACCENT,
  },
  circle: {
    width: D,
    height: D,
    borderRadius: D / 2,
    borderWidth: 2.5,
    borderColor: ACCENT,
    backgroundColor: ACCENT + '18',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  micSymbol: {
    fontSize: 38,
    color: ACCENT,
    lineHeight: 42,
  },
  micLabel: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 10,
    color: ACCENT,
    letterSpacing: 4,
  },
});

// ── Screen styles ─────────────────────────────────────────────
const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Colors.bg },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },

  // Header
  header: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 6,
  },
  headerTitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 22,
    color: ACCENT,
    letterSpacing: 5,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 10,
    color: Colors.dim,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },

  // Button section
  btnSection: {
    alignItems: 'center',
    gap: 18,
    marginBottom: 32,
  },
  holdLabel: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 13,
    color: '#ffffff',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  holdSublabel: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 9,
    color: Colors.dim,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Info card
  infoCard: {
    position: 'relative',
    backgroundColor: Colors.glass,
    borderWidth: 1.5,
    borderColor: ACCENT + '55',
    borderRadius: 16,
    overflow: 'hidden',
    padding: 20,
    gap: 10,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  cardShine: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  cardHeading: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 10,
    color: ACCENT,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  cardBody: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  badge: {
    borderWidth: 1,
    borderColor: ACCENT + '66',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: ACCENT + '10',
    marginTop: 4,
  },
  badgeText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 9,
    color: ACCENT,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },

  // Steps card
  stepsCard: {
    position: 'relative',
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: ACCENT + '33',
    borderRadius: 14,
    overflow: 'hidden',
    padding: 18,
    gap: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepNum: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 18,
    color: ACCENT + '55',
    letterSpacing: 1,
    width: 28,
    textAlign: 'center',
  },
  stepText: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 12,
    color: Colors.text,
    letterSpacing: 1,
    flex: 1,
  },
});
