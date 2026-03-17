// ============================================================
// TRAVEL RAVERS — RadarScreen (Full Rebuild)
// SVG radar globe with sweep animation, squad dot positions.
// Accent: #CC00FF (Purple)
// TODO: replace mock data with real expo-location + Supabase
//       Realtime in native build
// ============================================================

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, {
  Circle,
  Line,
  G,
  Text as SvgText,
  Defs,
  RadialGradient,
  Stop,
  Path,
} from 'react-native-svg';
import { Colors } from '../constants/colors';
import { useFestival } from '../context/FestivalContext';

const ACCENT = Colors.module.RADAR; // #CC00FF

// ── Radar geometry ────────────────────────────────────────────
const D = 280;           // SVG canvas diameter
const CX = D / 2;        // center x
const CY = D / 2;        // center y
const R  = 130;          // outer ring radius (= 200M range)
const MAX_RANGE_M = 200;

// ── Mock squad data ───────────────────────────────────────────
// TODO: replace with real expo-location + Supabase Realtime in native build
type SquadMember = {
  name: string;
  initial: string;
  color: string;
  status: 'AT STAGE' | 'LOST' | 'OFFLINE';
  dx: number; // pixel offset from radar center (+right, -left)
  dy: number; // pixel offset from radar center (+down,  -up)
};

const MOCK_SQUAD: SquadMember[] = [
  { name: 'MAYA',  initial: 'M', color: '#00FFCC', status: 'AT STAGE', dx:  42, dy: -28 },
  { name: 'JAX',   initial: 'J', color: '#FF2D78', status: 'LOST',     dx:  18, dy:  58 },
  { name: 'REMI',  initial: 'R', color: '#A855F7', status: 'OFFLINE',  dx: -58, dy: -12 },
];

const STATUS_COLOR: Record<SquadMember['status'], string> = {
  'AT STAGE': Colors.green,
  'LOST':     Colors.orange,
  'OFFLINE':  Colors.dim,
};

// ── Blinking pill (for LOST status) ──────────────────────────
const BlinkPill: React.FC<{ color: string; label: string }> = ({ color, label }) => {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.25, duration: 500, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1,    duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, [anim]);
  return (
    <Animated.View
      style={[
        s.statusPill,
        { borderColor: color + '66', backgroundColor: color + '18', opacity: anim },
      ]}
    >
      <Text style={[s.statusPillText, { color }]}>{label}</Text>
    </Animated.View>
  );
};

// ── Pulsing YOUR dot (renders as plain Views over SVG) ────────
const PulsingDot: React.FC = () => {
  const scale   = useRef(new Animated.Value(1)).current;
  const ringOp  = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale,  { toValue: 2.6, duration: 1000, useNativeDriver: true }),
          Animated.timing(scale,  { toValue: 1,   duration: 1000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ringOp, { toValue: 0,   duration: 1000, useNativeDriver: true }),
          Animated.timing(ringOp, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, [scale, ringOp]);

  return (
    <View style={s.pulseWrap}>
      <Animated.View style={[s.pulseRing, { transform: [{ scale }], opacity: ringOp }]} />
      <View style={s.pulseDot} />
    </View>
  );
};

// ── RadarGlobe — static SVG elements + squad dots ─────────────
const RadarGlobe: React.FC<{
  sweepRotation: Animated.AnimatedInterpolation<string | number>;
  tooltip: string | null;
  onMemberTap: (name: string) => void;
}> = ({ sweepRotation, tooltip, onMemberTap }) => (
  <View style={s.radarWrap}>
    {/* Static SVG layer */}
    <Svg width={D} height={D} style={StyleSheet.absoluteFillObject}>
      <Defs>
        <RadialGradient id="sweepGrad2" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor={ACCENT} stopOpacity={0.55} />
          <Stop offset="45%"  stopColor={ACCENT} stopOpacity={0.2} />
          <Stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* Dark fill */}
      <Circle cx={CX} cy={CY} r={R} fill="rgba(3,6,15,0.92)" />

      {/* Grid lines (lat/lng simulation) */}
      {([-3, -2, -1, 0, 1, 2, 3] as const).map((i) => (
        <React.Fragment key={`g${i}`}>
          <Line
            x1={CX + (i * R) / 3.5} y1={CY - R}
            x2={CX + (i * R) / 3.5} y2={CY + R}
            stroke={ACCENT} strokeWidth={0.4} opacity={0.1}
          />
          <Line
            x1={CX - R} y1={CY + (i * R) / 3.5}
            x2={CX + R} y2={CY + (i * R) / 3.5}
            stroke={ACCENT} strokeWidth={0.4} opacity={0.1}
          />
        </React.Fragment>
      ))}

      {/* Concentric range rings at 33% / 66% / 100% */}
      <Circle cx={CX} cy={CY} r={R * 0.33} fill="none" stroke={ACCENT} strokeWidth={0.8} opacity={0.18} />
      <Circle cx={CX} cy={CY} r={R * 0.66} fill="none" stroke={ACCENT} strokeWidth={0.8} opacity={0.18} />
      <Circle cx={CX} cy={CY} r={R * 1.0}  fill="none" stroke={ACCENT} strokeWidth={1.2} opacity={0.5} />

      {/* Ring labels */}
      <SvgText x={CX + R * 0.33 + 4} y={CY - 3} fill={Colors.dim} fontSize={7} opacity={0.7}>50M</SvgText>
      <SvgText x={CX + R * 0.66 + 4} y={CY - 3} fill={Colors.dim} fontSize={7} opacity={0.7}>100M</SvgText>
      <SvgText x={CX + R       - 24} y={CY - 7} fill={Colors.dim} fontSize={7} opacity={0.7}>200M</SvgText>

      {/* Squad dots */}
      {MOCK_SQUAD.map((m) => {
        const mx   = CX + m.dx;
        const my   = CY + m.dy;
        const dist = Math.sqrt(m.dx * m.dx + m.dy * m.dy);
        if (dist > R - 10) return null;
        return (
          <G key={m.name} onPress={() => onMemberTap(m.name)}>
            <Circle cx={mx} cy={my} r={10} fill={m.color + '2A'} stroke={m.color} strokeWidth={1.5} />
            <SvgText x={mx} y={my + 4} textAnchor="middle" fill={m.color} fontSize={10}>
              {m.initial}
            </SvgText>
          </G>
        );
      })}
    </Svg>

    {/* Animated sweep layer */}
    <Animated.View
      style={[StyleSheet.absoluteFillObject, { transform: [{ rotate: sweepRotation }] }]}
      pointerEvents="none"
    >
      <Svg width={D} height={D}>
        {/* Trail wedge */}
        <Path
          d={`M ${CX} ${CY} L ${CX} ${CY - R} A ${R} ${R} 0 0 0 ${CX - R * Math.sin((55 * Math.PI) / 180)} ${CY - R * Math.cos((55 * Math.PI) / 180)} Z`}
          fill={`${ACCENT}44`}
        />
        {/* Leading edge */}
        <Line x1={CX} y1={CY} x2={CX} y2={CY - R} stroke={ACCENT} strokeWidth={1.5} opacity={0.9} />
      </Svg>
    </Animated.View>

    {/* YOUR dot (centered, above sweep) */}
    <View style={[StyleSheet.absoluteFillObject, s.yourDotWrap]} pointerEvents="none">
      <PulsingDot />
    </View>

    {/* Tooltip */}
    {tooltip && (
      <View style={s.tooltipCard} pointerEvents="none">
        <Text style={s.tooltipName}>{tooltip}</Text>
        <Text style={s.tooltipSub}>LAST SEEN: JUST NOW</Text>
      </View>
    )}
  </View>
);

// ── Main screen ───────────────────────────────────────────────
export const RadarScreen: React.FC = () => {
  const navigation      = useNavigation<any>();
  const { selectedFestival } = useFestival();
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [isOffline]     = useState(false);

  const sweepAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sweepAnim, {
        toValue:  1,
        duration: 3000,
        easing:   Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [sweepAnim]);

  const sweepRotation = sweepAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleMemberTap = useCallback((name: string) => {
    setTooltip(name);
    setTimeout(() => setTooltip(null), 2500);
  }, []);

  const handlePing = useCallback(() => {
    Alert.alert(
      'PING SQUAD',
      'Notification sent to your squad.\n\n(Requires Supabase + expo-notifications in native build.)'
    );
  }, []);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>‹ RADAR</Text>
        </TouchableOpacity>
        <View style={s.gpsRow}>
          <View style={s.gpsDot} />
          <Text style={s.gpsText}>GPS ACTIVE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Globe ── */}
        <View style={s.globeSection}>
          <Text style={s.festivalLabel}>
            {selectedFestival?.name ?? 'FESTIVAL'} · SITE RADAR
          </Text>
          <RadarGlobe
            sweepRotation={sweepRotation}
            tooltip={tooltip}
            onMemberTap={handleMemberTap}
          />
          <Text style={s.rangeNote}>MAX RANGE: 200M  ·  TAP DOT TO IDENTIFY</Text>
        </View>

        {/* ── Offline card ── */}
        {isOffline && (
          <View style={s.offlineCard}>
            <Text style={s.offlineTitle}>⚡ OFFLINE MODE — NO SIGNAL</Text>
            <Text style={s.offlineBody}>
              Live squad positions unavailable.{'\n'}Last known positions shown.
            </Text>
            <TouchableOpacity style={s.qrBtn}>
              <Text style={s.qrBtnText}>SHOW QR MEETUP CODE</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Squad cards ── */}
        <View style={s.squadSection}>
          <Text style={s.sectionTitle}>YOUR SQUAD</Text>
          {MOCK_SQUAD.map((m) => {
            const sc = STATUS_COLOR[m.status];
            const distM = Math.round(
              (Math.sqrt(m.dx * m.dx + m.dy * m.dy) / R) * MAX_RANGE_M
            );
            return (
              <View key={m.name} style={s.memberCard}>
                <View style={[s.avatar, { backgroundColor: m.color + '22', borderColor: m.color + '66' }]}>
                  <Text style={[s.avatarInitial, { color: m.color }]}>{m.initial}</Text>
                </View>
                <View style={s.memberInfo}>
                  <Text style={s.memberName}>{m.name}</Text>
                  <Text style={s.memberDist}>~{distM}M FROM YOU</Text>
                </View>
                {m.status === 'LOST' ? (
                  <BlinkPill color={sc} label={m.status} />
                ) : (
                  <View style={[s.statusPill, { borderColor: sc + '55', backgroundColor: sc + '15' }]}>
                    <Text style={[s.statusPillText, { color: sc }]}>{m.status}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* ── PING SQUAD ── */}
        <TouchableOpacity style={s.pingBtn} onPress={handlePing} activeOpacity={0.8}>
          <Text style={s.pingBtnText}>📡  PING SQUAD</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default RadarScreen;

// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(204,0,255,0.15)',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backBtn: {},
  backText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 11,
    color: ACCENT,
    letterSpacing: 2,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.green + '44',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.green + '08',
  },
  gpsDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.green },
  gpsText: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 8,
    color: Colors.green,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  scrollContent: { paddingBottom: 40 },

  globeSection: { alignItems: 'center', paddingTop: 20, paddingBottom: 12 },
  festivalLabel: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 9,
    color: Colors.dim,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  radarWrap: {
    width: D,
    height: D,
    position: 'relative',
    ...Platform.select({
      web: { boxShadow: `0 0 40px ${ACCENT}22, 0 0 80px ${ACCENT}0A` } as any,
      default: {
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 32,
        shadowOpacity: 0.4,
        elevation: 20,
      },
    }),
  },
  yourDotWrap: { alignItems: 'center', justifyContent: 'center' },
  pulseWrap: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  pulseRing: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.cyan,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.cyan,
    ...Platform.select({
      web: { boxShadow: `0 0 10px ${Colors.cyan}` } as any,
      default: {
        shadowColor: Colors.cyan,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 6,
        shadowOpacity: 1,
        elevation: 6,
      },
    }),
  },
  rangeNote: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 8,
    color: Colors.dim,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 12,
  },
  tooltipCard: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(3,6,15,0.96)',
    borderWidth: 1,
    borderColor: ACCENT + '55',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: 'center',
  },
  tooltipName: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 10,
    color: ACCENT,
    letterSpacing: 2,
  },
  tooltipSub: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 7,
    color: Colors.dim,
    letterSpacing: 1,
    marginTop: 2,
  },

  offlineCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.yellow + '44',
    borderRadius: 10,
    backgroundColor: Colors.yellow + '08',
    padding: 16,
  },
  offlineTitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 10,
    color: Colors.yellow,
    letterSpacing: 2,
    marginBottom: 6,
  },
  offlineBody: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 10,
    color: Colors.yellow + 'BB',
    letterSpacing: 1,
    lineHeight: 16,
    marginBottom: 12,
  },
  qrBtn: {
    borderWidth: 1,
    borderColor: Colors.yellow + '55',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  qrBtnText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 9,
    color: Colors.yellow,
    letterSpacing: 2,
  },

  squadSection: { paddingHorizontal: 16, paddingTop: 8 },
  sectionTitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 10,
    color: ACCENT,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6,16,36,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(204,0,255,0.18)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 14,
  },
  memberInfo: { flex: 1 },
  memberName: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 11,
    color: Colors.text,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  memberDist: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 9,
    color: Colors.dim,
    letterSpacing: 1,
    marginTop: 2,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillText: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  pingBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: ACCENT + '55',
    borderRadius: 10,
    backgroundColor: ACCENT + '0A',
    paddingVertical: 16,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: `0 0 16px ${ACCENT}22` } as any,
      default: {
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 12,
        shadowOpacity: 0.3,
        elevation: 8,
      },
    }),
  },
  pingBtnText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 12,
    color: ACCENT,
    letterSpacing: 3,
  },
});
