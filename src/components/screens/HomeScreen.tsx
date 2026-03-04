import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFestivalStore } from '../../stores/festivalStore';
import {
  COLOR_CYAN,
  COLOR_GREEN,
  COLOR_MAGENTA,
  FONT_DISPLAY,
  FONT_MONO,
} from '../../theme/tokens';
import GlassPanel from '../shared/GlassPanel';
import GlowBorderCard from '../shared/GlowBorderCard';
import HudHeader from '../shared/HudHeader';
import MeshStatusBar from '../shared/MeshStatusBar';
import { NeonIcon, NeonIconName } from '../shared/NeonIcons';
import ScreenBackground from '../shared/ScreenBackground';

// ─── Types ────────────────────────────────────────────────────────────────────

type RootTabParamList = {
  HOME: undefined;
  EVENTS: undefined;
  RADAR: undefined;
  MAP: undefined;
  TIMES: undefined;
  KIT: undefined;
  SOS: undefined;
};

type NavProp = BottomTabNavigationProp<RootTabParamList>;

interface FeatureCard {
  id: keyof RootTabParamList;
  label: string;
  sublabel: string;
  icon: NeonIconName;
  color: string;
  sos?: boolean;
}

const FEATURE_CARDS: FeatureCard[] = [
  { id: 'EVENTS', label: 'EVENTS',    sublabel: 'Pick Your Festival', icon: 'EVENTS', color: '#00f5ff' },
  { id: 'RADAR',  label: 'RADAR',     sublabel: 'Find Your Squad',    icon: 'RADAR',  color: '#ff00ff' },
  { id: 'MAP',    label: 'MAP',       sublabel: 'Festival Map',       icon: 'MAP',    color: '#00ff88' },
  { id: 'TIMES',  label: 'TIMETABLE', sublabel: 'Set Schedule',       icon: 'TIMES',  color: '#ffcc00' },
  { id: 'KIT',    label: 'KIT',       sublabel: 'Packing List',       icon: 'KIT',    color: '#ff8c00' },
  { id: 'SOS',    label: 'SOS',       sublabel: 'Emergency',          icon: 'SOS',    color: '#ff0040', sos: true },
];

// ─── Task 1: Hero header ──────────────────────────────────────────────────────

const HERO_HEIGHT = 148;

function HeroHeader() {
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(scanAnim, {
        toValue: 1,
        duration: 3500,
        useNativeDriver: true,
      })
    ).start();
  }, [scanAnim]);

  const scanY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-2, HERO_HEIGHT],
  });

  const cornerBorderColor = 'rgba(255,255,255,0.25)';
  const cornerBase = { position: 'absolute' as const, width: 12, height: 12, borderColor: cornerBorderColor };

  return (
    <View style={styles.hero}>
      {/* HUD corner brackets */}
      <View style={[cornerBase, { top: 0, left: 0, borderTopWidth: 1.5, borderLeftWidth: 1.5 }]} />
      <View style={[cornerBase, { top: 0, right: 0, borderTopWidth: 1.5, borderRightWidth: 1.5 }]} />
      <View style={[cornerBase, { bottom: 0, left: 0, borderBottomWidth: 1.5, borderLeftWidth: 1.5 }]} />
      <View style={[cornerBase, { bottom: 0, right: 0, borderBottomWidth: 1.5, borderRightWidth: 1.5 }]} />

      {/* Animated scan line — clipped in its own overflow:hidden container */}
      <View style={styles.scanClip} pointerEvents="none">
        <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanY }] }]} />
      </View>

      <Text style={styles.heroEyebrow}>{'// OFFLINE FESTIVAL OS'}</Text>

      <View style={styles.heroTitleRow}>
        <Text style={styles.heroTitleCyan}>TRAVEL </Text>
        <Text style={styles.heroTitleMagenta}>RAVERS</Text>
      </View>

      <Text style={styles.heroTagline}>PACK · PLAN · PARTY · NO SIGNAL REQUIRED</Text>

      <View style={styles.heroStatusRow}>
        <Text style={styles.heroStatusItem}>CREW_SYNC: ACTIVE</Text>
        <Text style={styles.heroStatusDiv}>|</Text>
        <Text style={styles.heroStatusItem}>OFFLINE_DB: READY</Text>
        <Text style={styles.heroStatusDiv}>|</Text>
        <Text style={styles.heroStatusItem}>FESTIVALS: 8</Text>
      </View>
    </View>
  );
}

// ─── Task 2 helpers: card grid texture ───────────────────────────────────────

function CardGridTexture({ color }: { color: string }) {
  const lineColor = color + '10'; // ~6%
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: 9 }).map((_, i) => (
        <View
          key={`h${i}`}
          style={{ position: 'absolute', left: 0, right: 0, top: (i + 1) * 14, height: 1, backgroundColor: lineColor }}
        />
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <View
          key={`v${i}`}
          style={{ position: 'absolute', top: 0, bottom: 0, left: (i + 1) * 14, width: 1, backgroundColor: lineColor }}
        />
      ))}
    </View>
  );
}

// ─── Task 2 helpers: card corner brackets ────────────────────────────────────

function CardCorners({ color }: { color: string }) {
  const borderColor = color + '99'; // 60%
  const base = { position: 'absolute' as const, width: 14, height: 14, borderColor };
  return (
    <>
      <View pointerEvents="none" style={[base, { top: 10, left: 10, borderTopWidth: 1.5, borderLeftWidth: 1.5 }]} />
      <View pointerEvents="none" style={[base, { top: 10, right: 10, borderTopWidth: 1.5, borderRightWidth: 1.5 }]} />
      <View pointerEvents="none" style={[base, { bottom: 10, left: 10, borderBottomWidth: 1.5, borderLeftWidth: 1.5 }]} />
      <View pointerEvents="none" style={[base, { bottom: 10, right: 10, borderBottomWidth: 1.5, borderRightWidth: 1.5 }]} />
    </>
  );
}

// ─── Task 2 helpers: animated light trail ────────────────────────────────────

function CardTrail({ color }: { color: string }) {
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(dotAnim, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: true,
      })
    ).start();
  }, [dotAnim]);

  const translateX = dotAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 140],
  });

  return (
    <View
      pointerEvents="none"
      style={[styles.trailLine, { backgroundColor: color + '4D' }]}
    >
      <Animated.View
        style={[
          styles.trailDot,
          {
            backgroundColor: color,
            shadowColor: color,
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
}

// ─── Task 2: Feature card ─────────────────────────────────────────────────────

function FeatureCardItem({ card }: { card: FeatureCard }) {
  const navigation = useNavigation<NavProp>();
  const sosPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!card.sos) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(sosPulse, { toValue: 0.15, duration: 700, useNativeDriver: true }),
        Animated.timing(sosPulse, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [sosPulse, card.sos]);

  return (
    <Pressable
      onPress={() => navigation.navigate(card.id)}
      style={[
        styles.cardWrapper,
        {
          shadowColor: card.color,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 16,
          shadowOpacity: 0.4,
          elevation: 10,
        },
      ]}
    >
      <GlassPanel
        style={[
          styles.card,
          card.sos ? styles.cardSos : { backgroundColor: 'rgba(2,6,16,0.85)' },
          { borderColor: card.color + '66', borderRadius: 24 },
        ]}
      >
        <CardGridTexture color={card.color} />
        <CardCorners color={card.color} />

        {/* SOS pulsing border overlay */}
        {card.sos && (
          <Animated.View
            pointerEvents="none"
            style={[styles.sosPulseOverlay, { opacity: sosPulse, borderColor: card.color }]}
          />
        )}

        <View style={styles.cardInner}>
          <NeonIcon name={card.icon} color={card.color} size={36} />
          <Text style={styles.cardName}>{card.label}</Text>
          <Text style={[styles.cardSub, { color: card.color + 'B3' }]}>{card.sublabel}</Text>
        </View>

        <CardTrail color={card.color} />
      </GlassPanel>
    </Pressable>
  );
}

// ─── Task 3: Perspective grid background ─────────────────────────────────────
// Horizontal lines denser at top (horizon) spreading toward bottom — floor depth illusion

const GRID_ROWS = [4, 11, 20, 31, 44, 59, 74, 88, 97];

function PerspectiveGrid() {
  return (
    <View style={styles.perspGrid} pointerEvents="none">
      {GRID_ROWS.map((pct, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${pct}%`,
            height: 1,
            backgroundColor: `rgba(0,245,255,${(0.035 + i * 0.008).toFixed(3)})`,
          }}
        />
      ))}
      {/* Fanned vertical lines — rotated from bottom-center */}
      {[-60, -42, -26, -12, 0, 12, 26, 42, 60].map((angle, i) => (
        <View
          key={`f${i}`}
          style={{
            position: 'absolute',
            bottom: 0,
            alignSelf: 'center',
            width: 1,
            height: '120%',
            backgroundColor: 'rgba(0,245,255,0.04)',
            transform: [{ rotate: `${angle}deg` }],
          }}
        />
      ))}
    </View>
  );
}

// ─── Task 4: Active festival banner ──────────────────────────────────────────

function ActiveBanner() {
  const activeFestival = useFestivalStore((s) => s.activeFestival);
  if (!activeFestival) return null;

  return (
    <GlassPanel style={styles.banner}>
      {/* Cyan left accent border */}
      <View style={styles.bannerAccent} />
      <View style={styles.bannerInner}>
        <View style={styles.bannerDot} />
        <View>
          <Text style={styles.bannerLabel}>ACTIVE EVENT</Text>
          <Text style={styles.bannerName}>{activeFestival.name}</Text>
        </View>
      </View>
    </GlassPanel>
  );
}

// ─── Home screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  return (
    <ScreenBackground>
      <HudHeader title="TRAVEL RAVERS" gpsStatus="LOCKED" batteryPercent={82} />
      <MeshStatusBar />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeroHeader />
        <ActiveBanner />
        <PerspectiveGrid />

        {/* Task 4: Section label */}
        <Text style={styles.sectionLabel}>{'// SELECT MODULE'}</Text>

        {/* Task 4: Card grid */}
        <View style={styles.grid}>
          {FEATURE_CARDS.map((card) => (
            <FeatureCardItem key={card.id} card={card} />
          ))}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Task 1: Hero
  hero: {
    height: HERO_HEIGHT,
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  scanClip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(0,245,255,0.18)',
  },
  heroEyebrow: {
    fontFamily: FONT_MONO,
    fontSize: 9,
    color: COLOR_CYAN,
    letterSpacing: 3,
    opacity: 0.6,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTitleCyan: {
    fontFamily: FONT_DISPLAY,
    fontSize: 32,
    letterSpacing: 2,
    color: COLOR_CYAN,
    textShadowColor: COLOR_CYAN,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  heroTitleMagenta: {
    fontFamily: FONT_DISPLAY,
    fontSize: 32,
    letterSpacing: 2,
    color: COLOR_MAGENTA,
    textShadowColor: COLOR_MAGENTA,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  heroTagline: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
  },
  heroStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  heroStatusItem: {
    fontFamily: FONT_MONO,
    fontSize: 8,
    color: COLOR_CYAN,
    opacity: 0.4,
    letterSpacing: 0.5,
  },
  heroStatusDiv: {
    fontFamily: FONT_MONO,
    fontSize: 8,
    color: 'rgba(255,255,255,0.2)',
  },

  // Task 3: Perspective grid
  perspGrid: {
    width: '100%',
    height: 100,
    backgroundColor: '#010408',
    overflow: 'hidden',
    marginBottom: 4,
  },

  // Task 4: Section label
  sectionLabel: {
    fontFamily: FONT_MONO,
    fontSize: 9,
    color: COLOR_CYAN,
    opacity: 0.5,
    letterSpacing: 1,
    marginHorizontal: 12,
    marginBottom: 10,
    marginTop: 4,
  },

  // Task 4: Grid layout
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 28,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    rowGap: 14,
    columnGap: 12,
    justifyContent: 'space-between',
  },

  // Task 2: Card
  cardWrapper: {
    width: '47%',
    aspectRatio: 1,
    minHeight: 160,
    borderRadius: 24,
    overflow: 'hidden',
  },
  card: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardSos: {
    backgroundColor: 'rgba(30,4,4,0.90)',
  },
  sosPulseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1.5,
    borderRadius: 24,
  },
  cardInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardName: {
    fontFamily: FONT_DISPLAY,
    fontSize: 12,
    color: '#ffffff',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  cardSub: {
    fontFamily: FONT_MONO,
    fontSize: 9,
    textAlign: 'center',
  },
  trailLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    overflow: 'hidden',
  },
  trailDot: {
    width: 12,
    height: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    shadowOpacity: 1,
    elevation: 3,
  },

  // Task 4: Active banner
  banner: {
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 2,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  bannerAccent: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: COLOR_CYAN,
    shadowColor: COLOR_CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    shadowOpacity: 1,
  },
  bannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    flex: 1,
  },
  bannerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLOR_GREEN,
    shadowColor: COLOR_GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 5,
    shadowOpacity: 1,
  },
  bannerLabel: {
    fontFamily: FONT_MONO,
    fontSize: 8,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  bannerName: {
    fontFamily: FONT_DISPLAY,
    fontSize: 13,
    color: COLOR_CYAN,
    letterSpacing: 1,
    textShadowColor: COLOR_CYAN,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
