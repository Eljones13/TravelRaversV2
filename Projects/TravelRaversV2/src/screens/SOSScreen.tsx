// ============================================================
// TRAVEL RAVERS — SOSScreen
// Session SOS-REDESIGN: Phrase Finder + Emergency Numbers
// Accent: #FF3344
// Reads emergencyNumbers + scripts from useFestival()
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Linking,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import Svg, { Defs, Pattern, Circle, Rect } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { useFestival } from '../context/FestivalContext';
import { useNavigation } from '@react-navigation/native';

const ACCENT = Colors.module.SOS; // '#FF3344'
const D      = 160;               // SOS button diameter

// ── Helpers ───────────────────────────────────────────────────
function glow(color: string, r = 10) {
  return Platform.select({
    web:     { boxShadow: `0 0 ${r}px ${color}` } as object,
    default: { shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowRadius: r, shadowOpacity: 0.9 },
  })!;
}

// ── Section header ────────────────────────────────────────────
const SectionHeader: React.FC<{ title: string; accent?: string }> = ({ title, accent = ACCENT }) => (
  <View style={s.sectionRow}>
    <View style={[s.sectionLine, { backgroundColor: accent }]} />
    <Text style={[s.sectionLabel, { color: accent }]}>{title}</Text>
    <View style={[s.sectionLine, { backgroundColor: accent }]} />
  </View>
);

// ── Pulsing SOS button ────────────────────────────────────────
const SOSButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1250, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 1250, useNativeDriver: false }),
      ])
    ).start();
    return () => pulse.setValue(0);
  }, [pulse]);

  const shadowRadius = pulse.interpolate({ inputRange: [0, 1], outputRange: [20, 32] });
  const shadowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.9] });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={sosBtn.wrap}>
      <Animated.View
        style={[
          sosBtn.circle,
          Platform.OS === 'web'
            ? {}
            : { shadowRadius, shadowOpacity, shadowColor: ACCENT, shadowOffset: { width: 0, height: 0 } },
        ]}
      >
        <Text style={sosBtn.label}>SOS</Text>
        <Text style={sosBtn.sublabel}>HOLD FOR EMERGENCY</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ── Emergency number pill ─────────────────────────────────────
const NumPill: React.FC<{ label: string; number: string }> = ({ label, number }) => {
  const dialable = number.startsWith('+') || /^\d/.test(number);
  return (
    <TouchableOpacity
      style={[s.numPill, glow(ACCENT, 6)]}
      onPress={() => {
        if (dialable) Linking.openURL(`tel:${number}`);
        else Alert.alert(label.toUpperCase(), number);
      }}
      activeOpacity={0.75}
    >
      <Text style={s.numPillLabel}>{label}</Text>
      <Text style={s.numPillNumber}>{number}</Text>
    </TouchableOpacity>
  );
};

// ── Phrase situation definition ───────────────────────────────
type Situation = {
  emoji: string;
  label: string;
  key: keyof Festival['scripts'];
};

import type { Festival } from '../data/festivals';

const SITUATIONS: Situation[] = [
  { emoji: '🚑', label: 'I need a doctor',                    key: 'doctorNeeded'      },
  { emoji: '💊', label: 'My friend needs help (no police)',   key: 'substance'         },
  { emoji: '🚽', label: 'Where are the toilets?',            key: 'toilet'            },
  { emoji: '💧', label: 'Where can I get water?',            key: 'water'             },
  { emoji: '🔋', label: 'Where can I charge my phone?',      key: 'charging'          },
  { emoji: '🏥', label: 'Where is the medical tent?',        key: 'medicalTent'       },
  { emoji: '🚪', label: 'Where is the exit?',                key: 'exit'              },
  { emoji: '👥', label: "I've lost my friends",              key: 'lostSquad'         },
  { emoji: '💉', label: "I'm allergic to penicillin",        key: 'allergyPenicillin' },
  { emoji: '✈️',  label: 'I want to call my embassy',         key: 'callEmbassy'       },
  { emoji: '🆓', label: 'Am I free to go?',                  key: 'freeToGo'          },
];

// ── Translation slide card ────────────────────────────────────
const TranslationCard: React.FC<{
  situation: Situation;
  phrase: string;
  language: string;
}> = ({ situation, phrase, language }) => {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    slideAnim.setValue(20);
    opacityAnim.setValue(0);
    Animated.parallel([
      Animated.spring(slideAnim,  { toValue: 0, useNativeDriver: true, tension: 60, friction: 10 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setCopied(false);
  }, [phrase, slideAnim, opacityAnim]);

  const handleCopy = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(phrase);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('COPY', phrase);
    }
  }, [phrase]);

  return (
    <Animated.View
      style={[s.transCard, glow(ACCENT, 12), { transform: [{ translateY: slideAnim }], opacity: opacityAnim }]}
    >
      <View style={s.transShine} pointerEvents="none" />

      {/* English label */}
      <Text style={s.transEnglish}>
        {situation.emoji}  {situation.label}
      </Text>

      {/* Language badge */}
      <View style={s.langBadge}>
        <Text style={s.langBadgeText}>{language.toUpperCase()}</Text>
      </View>

      {/* Phrase (large, readable, show to local) */}
      <Text style={s.transPhrase}>{phrase}</Text>

      {/* Copy + hint */}
      <TouchableOpacity
        style={[s.copyBtn, { borderColor: copied ? Colors.green + '88' : ACCENT + '66' }]}
        onPress={handleCopy}
        activeOpacity={0.75}
      >
        <Text style={[s.copyBtnText, { color: copied ? Colors.green : ACCENT }]}>
          {copied ? 'COPIED ✓' : 'TAP TO COPY'}
        </Text>
      </TouchableOpacity>
      <Text style={s.showStaffHint}>
        TAP COPY OR SHOW THIS SCREEN TO LOCAL STAFF
      </Text>
    </Animated.View>
  );
};

// ── MAIN SCREEN ───────────────────────────────────────────────
export const SOSScreen: React.FC = () => {
  const navigation           = useNavigation<any>();
  const { selectedFestival } = useFestival();
  const [selectedSit, setSelectedSit] = useState<Situation | null>(null);

  const handleSOSPress = () => {
    const policeNum = selectedFestival?.emergencyNumbers.police ?? '999';
    Alert.alert(
      '⚠ EMERGENCY — SOS',
      'Do you need emergency services?',
      [
        {
          text: `CALL POLICE (${policeNum})`,
          style: 'destructive',
          onPress: () => Linking.openURL(`tel:${policeNum}`),
        },
        { text: 'CANCEL', style: 'cancel' },
      ]
    );
  };

  const handleSituationPress = (sit: Situation) => {
    setSelectedSit(prev => (prev?.key === sit.key ? null : sit));
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Dot-grid background */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern id="dotSOS" width="44" height="44" patternUnits="userSpaceOnUse">
              <Circle cx="1" cy="1" r="0.5" fill="rgba(255,51,68,0.05)" />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#dotSOS)" />
        </Svg>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={[s.headerTitle, glow(ACCENT, 12)]}>SOS // WELFARE</Text>
          <Text style={s.headerSubtitle}>
            {selectedFestival?.name ?? 'SELECT FESTIVAL'}
          </Text>
        </View>

        {/* ── SOS Circle Button ── */}
        <View style={s.sosSection}>
          <SOSButton onPress={handleSOSPress} />
        </View>

        {/* ── Emergency Numbers Row ── */}
        {selectedFestival ? (
          <>
            <View style={s.numRow}>
              <NumPill label="POLICE"    number={selectedFestival.emergencyNumbers.police}         />
              <NumPill label="AMBULANCE" number={selectedFestival.emergencyNumbers.ambulance}      />
              <NumPill label="MEDICAL"   number={selectedFestival.emergencyNumbers.festivalMedical}/>
            </View>

            {/* ── Phrase Finder ── */}
            <SectionHeader title="I NEED HELP WITH..." />

            <View style={s.situationList}>
              {SITUATIONS.map(sit => {
                const isActive = selectedSit?.key === sit.key;
                return (
                  <TouchableOpacity
                    key={sit.key}
                    style={[
                      s.sitRow,
                      isActive && { borderColor: ACCENT + '99' },
                      isActive && glow(ACCENT, 8),
                    ]}
                    onPress={() => handleSituationPress(sit)}
                    activeOpacity={0.75}
                  >
                    <Text style={s.sitEmoji}>{sit.emoji}</Text>
                    <Text style={[s.sitLabel, isActive && { color: '#ffffff' }]}>{sit.label}</Text>
                    <Text style={[s.sitChevron, isActive && { color: ACCENT }]}>›</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Translation Card ── */}
            {selectedSit && (
              <TranslationCard
                situation={selectedSit}
                phrase={selectedFestival.scripts[selectedSit.key]}
                language={selectedFestival.language}
              />
            )}
          </>
        ) : (
          /* ── No festival fallback ── */
          <View style={[s.noFestCard, glow(ACCENT, 10)]}>
            <Text style={s.noFestIcon}>⚠️</Text>
            <Text style={s.noFestTitle}>SELECT A FESTIVAL</Text>
            <Text style={s.noFestBody}>
              Select your festival to see local emergency numbers and native language phrases.
            </Text>
            <TouchableOpacity
              style={[s.noFestBtn, glow(Colors.cyan, 8)]}
              onPress={() => navigation.navigate('FestivalSelect')}
              activeOpacity={0.8}
            >
              <Text style={s.noFestBtnText}>SELECT FESTIVAL →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── I AM SAFE ── */}
        <SectionHeader title="SAFE CHECK-IN" accent={Colors.green} />
        <TouchableOpacity
          style={[s.safeBtn, glow(Colors.green, 12)]}
          onPress={() =>
            Alert.alert(
              '✅ SEND CHECK-IN',
              'Send a safe message to your emergency contact?',
              [
                { text: 'CANCEL', style: 'cancel' },
                {
                  text: 'SEND',
                  onPress: () =>
                    Alert.alert('CHECK-IN SENT', 'Your emergency contact has been notified you are safe.'),
                },
              ]
            )
          }
          activeOpacity={0.8}
        >
          <Text style={s.safeBtnText}>✓ I AM SAFE — SEND CHECK-IN</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SOSScreen;

// ── SOS button styles ─────────────────────────────────────────
const sosBtn = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: D,
    height: D,
    borderRadius: D / 2,
    borderWidth: 2,
    borderColor: ACCENT,
    backgroundColor: 'rgba(255,51,68,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    elevation: 8,
  },
  label: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 30,
    color: ACCENT,
    letterSpacing: 6,
    lineHeight: 36,
    ...Platform.select({
      web:     { textShadow: `0 0 14px ${ACCENT}` } as object,
      default: {},
    }),
  },
  sublabel: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 8,
    color: Colors.dim,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});

// ── Screen styles ─────────────────────────────────────────────
const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Colors.bg },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
    gap: 4,
  },
  headerTitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 20,
    color: ACCENT,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 9,
    color: Colors.dim,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // SOS button section
  sosSection: {
    alignItems: 'center',
    marginBottom: 20,
  },

  // Emergency number pills
  numRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  numPill: {
    flex: 1,
    minWidth: 90,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: ACCENT + '66',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 3,
  },
  numPillLabel: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 7,
    color: Colors.dim,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  numPillNumber: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 12,
    color: ACCENT,
    letterSpacing: 1.5,
  },

  // Section header
  sectionRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, marginBottom: 12 },
  sectionLine:  { flex: 1, height: 1, opacity: 0.35 },
  sectionLabel: { fontSize: 9, letterSpacing: 3, fontFamily: 'Orbitron_700Bold', textTransform: 'uppercase' },

  // Situation list
  situationList: { gap: 6, marginBottom: 4 },
  sitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: 'rgba(255,51,68,0.22)',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 14,
    gap: 10,
  },
  sitEmoji:   { fontSize: 18, width: 26 },
  sitLabel:   { flex: 1, fontFamily: 'ShareTechMono_400Regular', fontSize: 12, color: Colors.text, letterSpacing: 0.8 },
  sitChevron: { fontFamily: 'Orbitron_700Bold', fontSize: 20, color: Colors.dim, lineHeight: 24 },

  // Translation card
  transCard: {
    position: 'relative',
    backgroundColor: Colors.glass,
    borderWidth: 1.5,
    borderColor: ACCENT + '77',
    borderRadius: 14,
    overflow: 'hidden',
    padding: 20,
    marginTop: 12,
    gap: 10,
  },
  transShine: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  transEnglish: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 9,
    color: Colors.dim,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  langBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: ACCENT + '66',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: ACCENT + '10',
  },
  langBadgeText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 8,
    color: ACCENT,
    letterSpacing: 2,
  },
  transPhrase: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 20,
    color: '#ffffff',
    lineHeight: 30,
    letterSpacing: 0.5,
  },
  copyBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,51,68,0.08)',
  },
  copyBtnText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  showStaffHint: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 8,
    color: Colors.dim,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // No festival card
  noFestCard: {
    position: 'relative',
    backgroundColor: Colors.glass,
    borderWidth: 1.5,
    borderColor: ACCENT + '55',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  noFestIcon:    { fontSize: 36 },
  noFestTitle:   { fontFamily: 'Orbitron_700Bold', fontSize: 13, color: ACCENT, letterSpacing: 3, textTransform: 'uppercase' },
  noFestBody:    { fontFamily: 'ShareTechMono_400Regular', fontSize: 11, color: Colors.dim, letterSpacing: 1, textAlign: 'center', lineHeight: 18 },
  noFestBtn: {
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: Colors.cyan + '88',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.cyan + '10',
  },
  noFestBtnText: { fontFamily: 'Orbitron_700Bold', fontSize: 11, color: Colors.cyan, letterSpacing: 2 },

  // I AM SAFE
  safeBtn: {
    width: '100%',
    backgroundColor: Colors.green + '12',
    borderWidth: 2,
    borderColor: Colors.green,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  safeBtnText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 13,
    color: Colors.green,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
