import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Circle, Line, Path, Rect, Svg } from 'react-native-svg';
import { useFestivalStore } from '../../stores/festivalStore';
import {
  COLOR_CYAN,
  COLOR_GREEN,
  FONT_DISPLAY,
  FONT_MONO,
} from '../../theme/tokens';
import GlassPanel from '../shared/GlassPanel';
import HudHeader from '../shared/HudHeader';
import MeshStatusBar from '../shared/MeshStatusBar';
import ScreenBackground from '../shared/ScreenBackground';

// ─── Types ────────────────────────────────────────────────────────────────────

type RootTabParamList = {
  HOME:   undefined;
  EVENTS: undefined;
  RADAR:  undefined;
  MAP:    undefined;
  TIMES:  undefined;
  KIT:    undefined;
  SOS:    undefined;
};

type NavProp = BottomTabNavigationProp<RootTabParamList>;

interface FeatureCard {
  id:       keyof RootTabParamList;
  label:    string;
  sublabel: string;
  color:    string;
  sos?:     boolean;
}

const FEATURE_CARDS: FeatureCard[] = [
  { id: 'EVENTS', label: 'EVENTS',    sublabel: 'Pick Your Festival', color: '#00f5ff' },
  { id: 'RADAR',  label: 'RADAR',     sublabel: 'Find Your Squad',    color: '#ff00ff' },
  { id: 'MAP',    label: 'MAP',       sublabel: 'Festival Map',       color: '#00ff88' },
  { id: 'TIMES',  label: 'TIMETABLE', sublabel: 'Set Schedule',       color: '#ffcc00' },
  { id: 'KIT',    label: 'KIT',       sublabel: 'Packing List',       color: '#ff8c00' },
  { id: 'SOS',    label: 'SOS',       sublabel: 'Emergency',          color: '#ff0040', sos: true },
];

// ─── SVG card icons ───────────────────────────────────────────────────────────

function CardSvgIcon({ id, color }: { id: keyof RootTabParamList; color: string }) {
  const s = 1.5;
  switch (id) {
    case 'EVENTS':
      return (
        <Svg width={40} height={40} viewBox="0 0 40 40">
          <Circle cx={20} cy={34} r={2} fill={color} />
          <Path d="M13 28 Q20 21 27 28" stroke={color} strokeWidth={s} fill="none" strokeLinecap="round" />
          <Path d="M8 23 Q20 11 32 23"  stroke={color} strokeWidth={s} fill="none" strokeLinecap="round" />
          <Path d="M4 18 Q20 2 36 18"   stroke={color} strokeWidth={s} fill="none" strokeLinecap="round" />
        </Svg>
      );
    case 'RADAR':
      return (
        <Svg width={40} height={40} viewBox="0 0 40 40">
          <Path d="M20 4 L36 20 L20 36 L4 20 Z" stroke={color} strokeWidth={s} fill="none" />
          <Line x1={20} y1={4}  x2={20} y2={36} stroke={color} strokeWidth={1} opacity={0.5} />
          <Line x1={4}  y1={20} x2={36} y2={20} stroke={color} strokeWidth={1} opacity={0.5} />
          <Circle cx={20} cy={20} r={3} stroke={color} strokeWidth={s} fill="none" />
        </Svg>
      );
    case 'MAP':
      return (
        <Svg width={40} height={40} viewBox="0 0 40 40">
          <Path d="M20 4 L34 12 L34 28 L20 36 L6 28 L6 12 Z" stroke={color} strokeWidth={s} fill="none" />
          <Circle cx={20} cy={20} r={3} fill={color} />
        </Svg>
      );
    case 'TIMES':
      return (
        <Svg width={40} height={40} viewBox="0 0 40 40">
          <Circle cx={20} cy={20} r={15} stroke={color} strokeWidth={s} fill="none" />
          {/* Hour hand → 10 o'clock */}
          <Line x1={20} y1={20} x2={12} y2={12} stroke={color} strokeWidth={s} strokeLinecap="round" />
          {/* Minute hand → 2 o'clock */}
          <Line x1={20} y1={20} x2={28} y2={12} stroke={color} strokeWidth={s} strokeLinecap="round" />
          <Circle cx={20} cy={20} r={1.5} fill={color} />
        </Svg>
      );
    case 'KIT':
      return (
        <Svg width={40} height={40} viewBox="0 0 40 40">
          <Rect x={10} y={14} width={20} height={22} rx={3} stroke={color} strokeWidth={s} fill="none" />
          <Path d="M14 14 Q14 6 20 6 Q26 6 26 14" stroke={color} strokeWidth={s} fill="none" />
          <Rect x={13} y={22} width={14} height={8} rx={2} stroke={color} strokeWidth={1} fill="none" opacity={0.7} />
        </Svg>
      );
    case 'SOS':
      return (
        <Svg width={40} height={40} viewBox="0 0 40 40">
          <Path d="M20 6 L36 32 L4 32 Z" stroke={color} strokeWidth={s} fill="none" strokeLinejoin="round" />
          <Line x1={20} y1={16} x2={20} y2={24} stroke={color} strokeWidth={s} strokeLinecap="round" />
          <Circle cx={20} cy={28} r={1.5} fill={color} />
        </Svg>
      );
    default:
      return null;
  }
}

// ─── Hero header ──────────────────────────────────────────────────────────────

const HERO_HEIGHT = 240;

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
    inputRange:  [0, 1],
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

      {/* Scan line */}
      <View style={styles.scanClip} pointerEvents="none">
        <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanY }] }]} />
      </View>

      <Image
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        source={require('../../assets/logo-v2.png')}
        style={styles.heroLogo}
        resizeMode="cover"
      />

      <Text style={styles.heroTagline}>PACK · PLAN · PARTY</Text>

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

// ─── Card diagonal texture ────────────────────────────────────────────────────

function CardDiagonals({ color }: { color: string }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {[20, 50, 80].map((left, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: '-25%',
            left: `${left}%`,
            width: 1,
            height: '150%',
            backgroundColor: color,
            opacity: 0.04,
            transform: [{ rotate: '45deg' }],
          }}
        />
      ))}
    </View>
  );
}

// ─── Card corner brackets ─────────────────────────────────────────────────────

function CardCorners({ color }: { color: string }) {
  const borderColor = color + '99';
  const base = { position: 'absolute' as const, width: 14, height: 14, borderColor };
  return (
    <>
      <View pointerEvents="none" style={[base, { top: 10, left: 10,   borderTopWidth: 1.5,    borderLeftWidth: 1.5 }]} />
      <View pointerEvents="none" style={[base, { top: 10, right: 10,  borderTopWidth: 1.5,    borderRightWidth: 1.5 }]} />
      <View pointerEvents="none" style={[base, { bottom: 10, left: 10,  borderBottomWidth: 1.5, borderLeftWidth: 1.5 }]} />
      <View pointerEvents="none" style={[base, { bottom: 10, right: 10, borderBottomWidth: 1.5, borderRightWidth: 1.5 }]} />
    </>
  );
}

// ─── Animated light trail ─────────────────────────────────────────────────────

function CardTrail({ color }: { color: string }) {
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(dotAnim, { toValue: 1, duration: 2200, useNativeDriver: true })
    ).start();
  }, [dotAnim]);

  const translateX = dotAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 140] });

  return (
    <View pointerEvents="none" style={[styles.trailLine, { backgroundColor: color + '4D' }]}>
      <Animated.View
        style={[styles.trailDot, { backgroundColor: color, shadowColor: color, transform: [{ translateX }] }]}
      />
    </View>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────

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
        { shadowColor: card.color, shadowOffset: { width: 0, height: 0 }, shadowRadius: 16, shadowOpacity: 0.4, elevation: 10 },
      ]}
    >
      <View style={[styles.card, card.sos ? styles.cardSos : null, { borderColor: card.color + '66' }]}>
        <CardDiagonals color={card.color} />
        <CardCorners color={card.color} />

        {card.sos && (
          <Animated.View
            pointerEvents="none"
            style={[styles.sosPulseOverlay, { opacity: sosPulse, borderColor: card.color }]}
          />
        )}

        <View style={[
          styles.cardInner,
          { shadowColor: card.color, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, shadowOpacity: 0.5, elevation: 8 },
        ]}>
          {/* Top shine */}
          <View pointerEvents="none" style={styles.cardShine} />
          <View style={{ shadowColor: card.color, shadowRadius: 16, shadowOpacity: 1, shadowOffset: { width: 0, height: 0 } }}>
            <CardSvgIcon id={card.id} color={card.color} />
          </View>
          <Text style={styles.cardName}>{card.label}</Text>
          <Text style={[styles.cardSub, { color: card.color + 'B3' }]}>{card.sublabel}</Text>
        </View>

        <CardTrail color={card.color} />
      </View>
    </Pressable>
  );
}

// ─── Active festival banner ───────────────────────────────────────────────────

function ActiveBanner() {
  const activeFestival = useFestivalStore((s) => s.activeFestival);
  if (!activeFestival) return null;

  return (
    <GlassPanel style={styles.banner}>
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
      <HudHeader title="" gpsStatus="LOCKED" batteryPercent={82} />
      <MeshStatusBar />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeroHeader />
        <ActiveBanner />
        <Text style={styles.sectionLabel}>{'// SELECT MODULE'}</Text>
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
  // Hero
  hero: {
    height: HERO_HEIGHT,
    marginHorizontal: 0,
    marginTop: 0,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  scanClip: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 2,
    backgroundColor: 'rgba(0,245,255,0.18)',
  },
  heroLogo: {
    width: '100%',
    height: 180,
    marginLeft: -10,
    marginBottom: -15,
  },
  heroTagline: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    color: COLOR_CYAN,
    letterSpacing: 1,
    textShadowColor: COLOR_CYAN,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
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
    color: '#ff00ff',
    opacity: 0.7,
    letterSpacing: 0.5,
  },
  heroStatusDiv: {
    fontFamily: FONT_MONO,
    fontSize: 8,
    color: 'rgba(255,255,255,0.2)',
  },

  // Section label
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

  // Scroll
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 28,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    rowGap: 14,
    columnGap: 12,
    justifyContent: 'space-between',
  },

  // Cards
  cardWrapper: {
    width: '47%',
    aspectRatio: 1,
    minHeight: 160,
    borderRadius: 22,
    overflow: 'hidden',
  },
  card: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: 'rgba(1,4,12,0.95)',
  },
  cardSos: {
    backgroundColor: 'rgba(20,2,4,0.95)',
  },
  sosPulseOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderWidth: 1.5,
    borderRadius: 22,
  },
  cardInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(8,18,38,0.75)',
  },
  cardShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
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
    bottom: 0, left: 0, right: 0,
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

  // Active banner
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
