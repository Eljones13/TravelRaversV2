// ============================================================
// TRAVEL RAVERS — SquadPanelScreen
// Session 1-C: Secondary module hub — accessed via SQUAD bottom tab
// Shows 5 secondary modules: Radar, Weather, PixelParty, Budget, SquadSetup
// Accent: Magenta/Purple palette
// Design: hud-design.md — glass depth, Orbitron, glow borders, corner brackets
// ============================================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, Pattern, Circle, Rect, Path } from 'react-native-svg';
import { TronGlassButton } from '../components/TronGlassButton';
import { Colors, SecondaryModuleId } from '../constants/colors';

type SquadPanelScreenProps = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

// ── Module definitions ──
interface SecondaryModule {
  id: SecondaryModuleId;
  label: string;
  sublabel: string;
  screen: string;
  Icon: React.FC<{ size: number; color: string }>;
}

// ── SVG Icons for secondary modules ──
const IconRadar: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1" opacity="0.5" />
    <Circle cx="12" cy="12" r="2" fill={color} opacity="0.7" />
    <Rect x="11.5" y="3" width="1" height="9" fill={color} opacity="0.6" />
  </Svg>
);

const IconWeather: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.5" />
    <Path d="M5 16C5 13.79 8.13 12 12 12C15.87 12 19 13.79 19 16C19 18.21 15.87 20 12 20C8.13 20 5 18.21 5 16Z" stroke={color} strokeWidth="1.2" opacity="0.6" />
    <Rect x="7" y="17" width="1.5" height="4" rx="0.75" fill={color} opacity="0.7" />
    <Rect x="11" y="18" width="1.5" height="4" rx="0.75" fill={color} opacity="0.7" />
    <Rect x="15" y="17" width="1.5" height="4" rx="0.75" fill={color} opacity="0.7" />
  </Svg>
);

const IconPixelParty: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="1.5" />
    <Circle cx="12" cy="12" r="3.5" stroke={color} strokeWidth="1.2" />
    <Circle cx="17.5" cy="7.5" r="1" fill={color} opacity="0.8" />
    <Rect x="5" y="7" width="3" height="2" rx="0.5" fill={color} opacity="0.4" />
  </Svg>
);

const IconBudget: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="6" width="18" height="13" rx="2" stroke={color} strokeWidth="1.5" />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.2" />
    <Rect x="3" y="9" width="18" height="1.5" fill={color} opacity="0.2" />
    <Rect x="11" y="4" width="2" height="4" rx="1" fill={color} opacity="0.6" />
  </Svg>
);

const IconSquad: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="7" r="3" stroke={color} strokeWidth="1.5" />
    <Circle cx="15" cy="7" r="3" stroke={color} strokeWidth="1.5" />
    <Path d="M3 19C3 16.2386 5.68629 14 9 14C12.3137 14 15 16.2386 15 19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M15 14C17.7614 14 20 15.7909 20 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const IconKit: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="8" width="18" height="13" rx="2" stroke={color} strokeWidth="1.5" />
    <Path d="M8 8V6C8 4.34 9.34 3 11 3H13C14.66 3 16 4.34 16 6V8" stroke={color} strokeWidth="1.2" />
    <Rect x="10" y="13" width="4" height="3" rx="1" fill={color} opacity="0.6" />
    <Rect x="6" y="13" width="2" height="1.5" rx="0.5" fill={color} opacity="0.4" />
    <Rect x="16" y="13" width="2" height="1.5" rx="0.5" fill={color} opacity="0.4" />
  </Svg>
);

// 6 secondary modules — SQUAD tab
const SECONDARY_MODULES: SecondaryModule[] = [
  { id: 'RADAR', label: 'Radar', sublabel: 'Nearby Festivals', screen: 'Radar', Icon: IconRadar },
  { id: 'WEATHER', label: 'Weather', sublabel: 'Conditions & Rain', screen: 'Weather', Icon: IconWeather },
  { id: 'PIXELPARTY', label: 'Pixel Party', sublabel: 'Shared Albums', screen: 'PixelParty', Icon: IconPixelParty },
  { id: 'BUDGET', label: 'Budget', sublabel: 'Split Expenses', screen: 'Budget', Icon: IconBudget },
  { id: 'SQUAD', label: 'Squad', sublabel: 'Build Your Crew', screen: 'SquadSetup', Icon: IconSquad },
  { id: 'KIT', label: 'Kit', sublabel: 'Pack Checklist', screen: 'Kit', Icon: IconKit },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SquadPanelScreen: React.FC<SquadPanelScreenProps> = ({ navigation }) => {
  // Pulsing title animation
  const pulseAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.7, duration: 2200, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulseAnim]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* ── Background: dot grid ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern id="dotGridSquad" width="44" height="44" patternUnits="userSpaceOnUse">
              <Circle cx="1" cy="1" r="0.5" fill="rgba(204,0,255,0.07)" />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#dotGridSquad)" />
        </Svg>
      </View>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Animated.Text style={[styles.headerTitle, { opacity: pulseAnim }]}>
            SQUAD HQ
          </Animated.Text>
          <Text style={styles.headerSubtitle}>SECONDARY MODULES</Text>
        </View>
        {/* Member count badge — placeholder */}
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>NO SQUAD YET</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Section label ── */}
        <View style={styles.sectionHeader}>
          {/* Left rule */}
          <View style={styles.sectionRule} />
          <Text style={styles.sectionLabel}>SECONDARY MODULES</Text>
          {/* Right rule */}
          <View style={styles.sectionRule} />
        </View>

        {/* ── 2×2 + 1 module grid ── */}
        <View style={styles.moduleGrid}>
          {SECONDARY_MODULES.map((module) => (
            <TronGlassButton
              key={module.id}
              label={module.label}
              sublabel={module.sublabel}
              icon={<module.Icon size={32} color={Colors.module[module.id]} />}
              accentColor={Colors.module[module.id]}
              onPress={() => navigation.navigate(module.screen)}
            />
          ))}
          {/* Spacer to centre 5th item in 2-col grid */}
          <View style={styles.gridSpacer} />
        </View>

        {/* ── Phase tracker card ── */}
        <View style={styles.phaseCard}>
          {/* Corner brackets — cyan */}
          <View style={[styles.cornerTL, { borderColor: 'rgba(204,0,255,0.6)' }]} />
          <View style={[styles.cornerTR, { borderColor: 'rgba(204,0,255,0.6)' }]} />
          <View style={[styles.cornerBL, { borderColor: 'rgba(204,0,255,0.6)' }]} />
          <View style={[styles.cornerBR, { borderColor: 'rgba(204,0,255,0.6)' }]} />

          <Text style={styles.phaseTitle}>BUILD PROGRESS</Text>
          <View style={styles.phaseRows}>
            {[
              { label: 'RADAR', phase: 'Phase 2', done: false },
              { label: 'WEATHER', phase: 'Phase 2', done: false },
              { label: 'PIXEL PARTY', phase: 'Phase 3', done: false },
              { label: 'BUDGET', phase: 'Phase 2', done: false },
              { label: 'SQUAD SETUP', phase: 'Phase 2', done: false },
            ].map((item) => (
              <View key={item.label} style={styles.phaseRow}>
                <View style={[styles.phaseDot, { backgroundColor: item.done ? Colors.green : Colors.dim }]} />
                <Text style={styles.phaseLabel}>{item.label}</Text>
                <Text style={styles.phaseTag}>{item.phase}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── SOS Backup Banner ── */}
        <TouchableOpacity
          style={styles.sosBanner}
          onPress={() => navigation.navigate('SOS' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.sosBannerText}>⚠  SOS / WELFARE →</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const CORNER_SIZE = 10;
const CORNER_W = 1.5;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  // ── Header ──
  header: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(204,0,255,0.12)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: Colors.magenta,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
    textTransform: 'uppercase',
    ...Platform.select({
      web: { textShadow: `0px 0px 10px ${Colors.magenta}` } as any,
      default: { textShadowColor: Colors.magenta, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }
    }),
  },
  headerSubtitle: {
    color: Colors.dim,
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  badgeContainer: {
    alignItems: 'flex-end',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(157,78,221,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(157,78,221,0.3)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 5,
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.module.SQUAD,
    ...Platform.select({
      web: { boxShadow: `0px 0px 4px ${Colors.module.SQUAD}` } as any,
      default: { shadowColor: Colors.module.SQUAD, shadowOffset: { width: 0, height: 0 }, shadowRadius: 4, shadowOpacity: 0.8 }
    }),
  },
  badgeText: {
    color: Colors.module.SQUAD,
    fontSize: 8,
    letterSpacing: 1.5,
    fontWeight: '600',
  },

  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // ── Section header ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  sectionRule: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(204,0,255,0.15)',
  },
  sectionLabel: {
    color: Colors.dim,
    fontSize: 9,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  // ── Module Grid ── (3-column for 6 items)
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingTop: 0,
    justifyContent: 'space-between',
  },
  gridSpacer: {
    width: '47%',
    margin: '1.5%',
  },

  // ── Phase tracker card ──
  phaseCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: 'rgba(6,16,32,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(204,0,255,0.15)',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  phaseTitle: {
    color: Colors.dim,
    fontSize: 9,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  phaseRows: {
    gap: 10,
  },
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  phaseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  phaseLabel: {
    flex: 1,
    color: Colors.text,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  phaseTag: {
    color: Colors.dim,
    fontSize: 9,
    letterSpacing: 1,
    backgroundColor: 'rgba(204,0,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(204,0,255,0.2)',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },

  // SOS banner
  sosBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255,51,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,51,68,0.45)',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 0 10px rgba(255,51,68,0.2)' } as any,
      default: { shadowColor: '#FF3344', shadowRadius: 8, shadowOpacity: 0.2, shadowOffset: { width: 0, height: 0 } },
    }),
  },
  sosBannerText: {
    color: '#FF3344',
    fontSize: 12,
    fontFamily: 'Orbitron_700Bold',
    letterSpacing: 3,
  },

  // Corner brackets
  cornerTL: { position: 'absolute', top: 0, left: 0, width: CORNER_SIZE, height: CORNER_SIZE, borderTopWidth: CORNER_W, borderLeftWidth: CORNER_W, borderRadius: 2 },
  cornerTR: { position: 'absolute', top: 0, right: 0, width: CORNER_SIZE, height: CORNER_SIZE, borderTopWidth: CORNER_W, borderRightWidth: CORNER_W, borderRadius: 2 },
  cornerBL: { position: 'absolute', bottom: 0, left: 0, width: CORNER_SIZE, height: CORNER_SIZE, borderBottomWidth: CORNER_W, borderLeftWidth: CORNER_W, borderRadius: 2 },
  cornerBR: { position: 'absolute', bottom: 0, right: 0, width: CORNER_SIZE, height: CORNER_SIZE, borderBottomWidth: CORNER_W, borderRightWidth: CORNER_W, borderRadius: 2 },
});
