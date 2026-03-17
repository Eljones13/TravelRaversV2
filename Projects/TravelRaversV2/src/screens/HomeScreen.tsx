// ============================================================
// TRAVEL RAVERS — HomeScreen
// Session HOME-3D-GLASS: True 3-layer 3D glass HUD cards
//
//  CARD LAYER STACK (bottom → top, all clipped by borderRadius 20):
//    L1 — Deep dark base:  rgba(6,16,36,0.95)  via backgroundColor
//    L2 — Shine gradient:  LinearGradient rgba(fff,0.08) → transparent
//    L3 — Light-catch lip: View h=1.5, white, opacity 0.15 (absolute top)
//
//  BRACKETS — SVG L-shapes, visible ONLY when card is pressed
//  HEIGHT MATH — (SCREEN_H - HEADER_H - TAB_H - 60) / 4  (user spec)
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, ImageBackground, TouchableOpacity,
  Dimensions, StyleSheet, Platform, Alert, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Line } from 'react-native-svg';
import {
  Calendar, MapPin, Clock, Package, AlertTriangle,
  Headphones, Radio, Cloud, Camera, Wallet, Users, Settings,
  type LucideIcon,
} from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { useFestival } from '../context/FestivalContext';
import { db } from '../db/database';
import { weatherCache } from '../db/schema';
import { eq } from 'drizzle-orm';

// ── Screen dimensions ─────────────────────────────────────────
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── Layout constants ──────────────────────────────────────────
const HEADER_H  = 108;   // logo 58 + gap 6 + pill ~34 + gap 10
const TAB_H     = Platform.OS === 'ios' ? 82 : 64;
const HORIZ_PAD = 16;
const GAP       = 8;
const COLS      = 3;
const ROWS      = 4;

// User-specified height formula: (SCREEN_H - HEADER_H - TAB_H - 60) / 4
// The 60 absorbs safe-area top, row gaps, and breathing room
const CARD_H = Math.floor((SCREEN_H - HEADER_H - TAB_H - 60) / ROWS);
// Width formula: (screenWidth - 48) / 3  — 48 = 2×16 padding + 2×8 gap
const CARD_W = Math.floor((SCREEN_W - 48) / 3);

// Corner bracket — inset inside the 20px curve so they sit on the flat face
const B_INSET = 12;
const B_ARM   = 10;
const B_THICK = 1;   // hairline when idle, slightly thicker suggestion via color

// ── Glow helpers ──────────────────────────────────────────────
function glowIdle(color: string) {
  return Platform.select({
    web: { boxShadow: `0 0 8px ${color}33` } as object,
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 8,
      shadowOpacity: 0.3,
      elevation: 4,
    },
  });
}
function glowActive(color: string) {
  return Platform.select({
    web: { boxShadow: `0 0 22px ${color}AA, 0 0 40px ${color}44` } as object,
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 22,
      shadowOpacity: 0.9,
      elevation: 16,
    },
  });
}

// ── SVG Corner Brackets — shown only when pressed ─────────────
const Corners: React.FC<{ color: string }> = ({ color }) => {
  const i = B_INSET;
  const a = B_ARM;
  const t = B_THICK;
  const w = CARD_W;
  const h = CARD_H;
  return (
    <Svg
      width={w}
      height={h}
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
    >
      {/* Top-left */}
      <Line x1={i}     y1={i + a} x2={i}         y2={i}     stroke={color} strokeWidth={t} />
      <Line x1={i}     y1={i}     x2={i + a}     y2={i}     stroke={color} strokeWidth={t} />
      {/* Top-right */}
      <Line x1={w - i} y1={i + a} x2={w - i}     y2={i}     stroke={color} strokeWidth={t} />
      <Line x1={w - i} y1={i}     x2={w - i - a} y2={i}     stroke={color} strokeWidth={t} />
      {/* Bottom-left */}
      <Line x1={i}     y1={h - i - a} x2={i}         y2={h - i} stroke={color} strokeWidth={t} />
      <Line x1={i}     y1={h - i}     x2={i + a}     y2={h - i} stroke={color} strokeWidth={t} />
      {/* Bottom-right */}
      <Line x1={w - i} y1={h - i - a} x2={w - i}     y2={h - i} stroke={color} strokeWidth={t} />
      <Line x1={w - i} y1={h - i}     x2={w - i - a} y2={h - i} stroke={color} strokeWidth={t} />
    </Svg>
  );
};

// ── Module definitions ────────────────────────────────────────
type ModuleDef = {
  id: string;
  label: string;
  sublabel: string;
  color: string;
  Icon: LucideIcon;
  screen: string | null;
};

const MODULES: ModuleDef[] = [
  { id: 'EVENTS',     label: 'EVENTS',      sublabel: 'LINEUPS & INFO',     color: '#00f5ff', Icon: Calendar,      screen: 'Events'     },
  { id: 'MAP',        label: 'MAP',         sublabel: 'OFFLINE MAP',         color: '#00ff88', Icon: MapPin,        screen: 'Map'        },
  { id: 'TIMETABLE',  label: 'TIMETABLE',   sublabel: 'SETS & CLASHES',      color: '#ffb300', Icon: Clock,         screen: 'Timetable'  },
  { id: 'KIT',        label: 'KIT',         sublabel: 'PACKING LIST',        color: '#ff8800', Icon: Package,       screen: 'Kit'        },
  { id: 'SOS',        label: 'SOS',         sublabel: 'EMERGENCY & WELFARE', color: '#ff2244', Icon: AlertTriangle, screen: 'SOS'        },
  { id: 'TRACK',      label: 'TRACK',       sublabel: 'MUSIC ID & LINK',     color: '#a855f7', Icon: Headphones,    screen: 'Track'      },
  { id: 'RADAR',      label: 'RADAR',       sublabel: 'FIND TENT/SQUAD',     color: '#cc00ff', Icon: Radio,         screen: 'Radar'      },
  { id: 'WEATHER',    label: 'WEATHER',     sublabel: 'FORECAST',            color: '#00bfff', Icon: Cloud,         screen: 'Weather'    },
  { id: 'PIXELPARTY', label: 'PIXEL PARTY', sublabel: 'SHARED PHOTO ALBUM',  color: '#ff2d78', Icon: Camera,        screen: 'PixelParty' },
  { id: 'BUDGET',     label: 'BUDGET',      sublabel: 'EXPENSES & SPLIT',    color: '#ffd700', Icon: Wallet,        screen: 'Budget'     },
  { id: 'SQUAD',      label: 'SQUAD',       sublabel: 'MEMBERS',             color: '#9d4edd', Icon: Users,         screen: 'SquadPanel' },
  { id: 'SETUP',      label: 'SETUP',       sublabel: 'FESTIVAL & SETTINGS', color: '#38bdf8', Icon: Settings,      screen: 'SquadSetup' },
];

// ── HomeGridCard — 3-layer 3D glass ──────────────────────────
const HomeGridCard: React.FC<{ module: ModuleDef; onPress: () => void }> = ({
  module,
  onPress,
}) => {
  const [pressed, setPressed] = useState(false);
  const { color, Icon } = module;

  // Border colour: accent at 40% opacity = hex '66'
  const borderColor = color + '66';

  return (
    <Pressable
      style={[
        s.card,
        { borderColor: pressed ? color + '99' : borderColor },
        pressed ? glowActive(color) : glowIdle(color),
      ]}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      {/*
       * LAYER 1 — Deep dark base
       * Provided by s.card backgroundColor: rgba(6,16,36,0.95)
       * overflow:'hidden' on the Pressable clips all children to borderRadius 20
       */}

      {/*
       * LAYER 2 — Shine gradient (top white → transparent)
       * Creates the internal 3D light-through-glass effect
       */}
      <LinearGradient
        colors={['rgba(255,255,255,0.08)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/*
       * LAYER 3 — Light-catch lip
       * 1.5px bright streak at the very top edge simulates bevelled glass
       */}
      <View style={s.lip} pointerEvents="none" />

      {/* ── HUD content ── */}

      {/* TITLE — top-left, white, Orbitron */}
      <Text style={s.cardTitle} numberOfLines={1}>
        {module.label}
      </Text>

      {/* ICON — top-right, accent colour */}
      <View style={s.iconWrap}>
        <Icon size={20} color={color} strokeWidth={1.5} />
      </View>

      {/* SUBLABEL — bottom-left, accent colour, micro ShareTechMono */}
      <Text style={[s.cardSublabel, { color }]} numberOfLines={2}>
        {module.sublabel}
      </Text>

      {/* BRACKETS — SVG Tron L-shapes, only rendered when pressed */}
      {pressed && <Corners color={color} />}
    </Pressable>
  );
};

// ── WMO emoji (subset — used for pill display) ────────────────
const PILL_WMO: Record<number, string> = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '🌥️',
  45: '🌫️', 51: '🌦️', 53: '🌦️', 61: '🌧️', 63: '🌧️',
  65: '🌧️', 80: '🌦️', 81: '🌧️', 95: '⛈️',
};

// ── HomeScreen ────────────────────────────────────────────────
function HomeScreen() {
  const navigation = useNavigation<any>();
  const { selectedFestival, clearFestival } = useFestival();

  // Mini weather strip — loaded from SQLite cache (non-blocking)
  const [wx, setWx] = useState<{ emoji: string; temp: number } | null>(null);

  useEffect(() => {
    db.select().from(weatherCache)
      .where(eq(weatherCache.id, 'creamfields-2026')).limit(1)
      .then(rows => {
        if (!rows[0]) return;
        const d = JSON.parse(rows[0].payload);
        const temp = Math.round(d?.current?.temperature_2m ?? 0);
        const code = d?.current?.weathercode ?? 0;
        setWx({ emoji: PILL_WMO[code] ?? '🌡️', temp });
      })
      .catch(() => { /* no cache — stay silent */ });
  }, []);

  const handlePress = (mod: ModuleDef) => {
    if (mod.screen) {
      navigation.navigate(mod.screen);
    } else {
      Alert.alert('Coming Soon', `${mod.label} is being built. Stay tuned!`);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/rave-festival-bg.jpg')}
      style={s.root}
      imageStyle={{ opacity: 0.12, resizeMode: 'cover' } as object}
    >
      <SafeAreaView style={s.safe} edges={['top']}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          <Image
            source={require('../../assets/logo-v2.png')}
            style={s.logo}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={s.pillWrap}
            onPress={async () => {
              await clearFestival();
            }}
            activeOpacity={0.7}
          >
            <View style={s.pill}>
              {wx && (
                <Text style={s.pillWeather}>{wx.emoji} {wx.temp}°C  ·  </Text>
              )}
              <Text style={s.pillText}>
                {selectedFestival ? selectedFestival.name : 'SELECT FESTIVAL'}  ›
              </Text>
            </View>
            <Text style={s.pillChange}>CHANGE</Text>
          </TouchableOpacity>
        </View>

        {/* ── 12-MODULE GRID — no scroll, flexWrap fills 4 × 3 ── */}
        <View style={s.grid}>
          {MODULES.map((mod) => (
            <HomeGridCard
              key={mod.id}
              module={mod}
              onPress={() => handlePress(mod)}
            />
          ))}
        </View>

      </SafeAreaView>
    </ImageBackground>
  );
}

export { HomeScreen };
export default HomeScreen;

// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  safe: {
    flex: 1,
  },

  // ── Header ──────────────────────────────────────────────────
  header: {
    height: HEADER_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 80,
    marginBottom: 6,
  },
  pillWrap: {
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cyan + '44',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,245,255,0.04)',
  },
  pillChange: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 8,
    color: Colors.dim,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 3,
  },
  pillWeather: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 9,
    color: Colors.module.WEATHER,
    letterSpacing: 1,
  },
  pillText: {
    color: Colors.cyan,
    fontFamily: 'Orbitron_700Bold',
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // ── Grid ────────────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HORIZ_PAD,
    gap: GAP,
    alignContent: 'flex-start',
  },

  // ── Card — Layer 1 base + clipping container ─────────────────
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',                     // clips gradient + lip to rounded corners
    backgroundColor: 'rgba(6,16,36,0.95)', // L1: deep dark navy base
  },

  // Layer 3 — light-catch lip
  lip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'white',
    opacity: 0.15,
  },

  // TITLE — top-left
  cardTitle: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 36,
    fontFamily: 'Orbitron_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#ffffff',
  },

  // ICON — top-right
  iconWrap: {
    position: 'absolute',
    top: 8,
    right: 10,
  },

  // SUBLABEL — bottom-left, accent color applied inline
  cardSublabel: {
    position: 'absolute',
    bottom: 9,
    left: 12,
    right: 8,
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 6.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    lineHeight: 9,
  },
});
