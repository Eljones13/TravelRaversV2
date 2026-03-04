import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Peer, useMeshStore } from '../../stores/meshStore';
import {
  COLOR_CYAN,
  COLOR_GREEN,
  COLOR_MAGENTA,
  COLOR_ORANGE,
  FONT_DISPLAY,
  FONT_MONO,
} from '../../theme/tokens';
import GlassPanel from '../shared/GlassPanel';
import HudHeader from '../shared/HudHeader';
import MeshStatusBar from '../shared/MeshStatusBar';
import ScreenBackground from '../shared/ScreenBackground';

// ─── Constants ────────────────────────────────────────────────────────────────

const DISH_SIZE    = 300;
const RADIUS       = DISH_SIZE / 2;
const INNER_RADIUS = RADIUS - 14;  // leaves room for compass labels
const MAX_RANGE    = 500;          // metres

// 5 evenly-spaced visual rings
const RINGS = [
  { ratio: 1 / 5, opacity: 0.50 },
  { ratio: 2 / 5, opacity: 0.38 },
  { ratio: 3 / 5, opacity: 0.27 },
  { ratio: 4 / 5, opacity: 0.18 },
  { ratio: 5 / 5, opacity: 0.12 },
];

// Range labels at real metric positions on right side
const RANGE_LABELS = [
  { metres: 100, px: (100 / 500) * INNER_RADIUS },
  { metres: 250, px: (250 / 500) * INNER_RADIUS },
  { metres: 500, px: (500 / 500) * INNER_RADIUS },
];

const DOT_SIZE    = 10;
const CENTER_SIZE = 8;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bearingToDir(bearing: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(bearing / 45) % 8];
}

function formatLastSeen(lastSeen: number): { label: string; color: string } {
  const elapsed = Date.now() - lastSeen;
  if (elapsed < 30_000) return { label: 'LIVE', color: COLOR_GREEN };
  return { label: `${Math.round(elapsed / 1000)}s ago`, color: COLOR_ORANGE };
}

// ─── Peer dot ─────────────────────────────────────────────────────────────────

function PeerDot({ peer }: { peer: Peer }) {
  const bearingRad  = (peer.bearing * Math.PI) / 180;
  const scaledDist  = (Math.min(peer.distance, MAX_RANGE) / MAX_RANGE) * INNER_RADIUS;
  const dotLeft     = RADIUS + Math.sin(bearingRad) * scaledDist - DOT_SIZE / 2;
  const dotTop      = RADIUS - Math.cos(bearingRad) * scaledDist - DOT_SIZE / 2;

  const ringScale   = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ringScale,   { toValue: 2.4, duration: 1400, useNativeDriver: true }),
          Animated.timing(ringScale,   { toValue: 1,   duration: 1400, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacity, { toValue: 0,   duration: 1400, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0.8, duration: 1400, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, [ringScale, ringOpacity]);

  return (
    <View style={{ position: 'absolute', left: dotLeft, top: dotTop }}>
      {/* Pulsing ring */}
      <Animated.View
        style={{
          position: 'absolute',
          width: DOT_SIZE,
          height: DOT_SIZE,
          borderRadius: DOT_SIZE / 2,
          borderWidth: 1,
          borderColor: peer.color,
          opacity: ringOpacity,
          transform: [{ scale: ringScale }],
        }}
      />
      {/* Solid dot */}
      <View style={{ width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2, backgroundColor: peer.color }} />
      {/* Name + distance chip */}
      <View style={{ position: 'absolute', left: DOT_SIZE + 4, top: -1 }}>
        <Text style={{ fontFamily: FONT_MONO, fontSize: 8, color: peer.color, lineHeight: 11 }}>
          {peer.name}
        </Text>
        <Text style={{ fontFamily: FONT_MONO, fontSize: 8, color: 'rgba(255,255,255,0.45)', lineHeight: 11 }}>
          {peer.distance}m
        </Text>
      </View>
    </View>
  );
}

// ─── Centre dot ───────────────────────────────────────────────────────────────

function CenterDot() {
  const pulseScale   = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale,   { toValue: 2.5, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseScale,   { toValue: 1,   duration: 900, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, { toValue: 0,   duration: 900, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.7, duration: 900, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, [pulseScale, pulseOpacity]);

  const offset = CENTER_SIZE / 2;

  return (
    <View style={{ position: 'absolute', left: RADIUS - offset, top: RADIUS - offset }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: CENTER_SIZE,
          height: CENTER_SIZE,
          borderRadius: CENTER_SIZE / 2,
          borderWidth: 1,
          borderColor: COLOR_CYAN,
          opacity: pulseOpacity,
          transform: [{ scale: pulseScale }],
        }}
      />
      <View style={{ width: CENTER_SIZE, height: CENTER_SIZE, borderRadius: CENTER_SIZE / 2, backgroundColor: COLOR_CYAN }} />
    </View>
  );
}

// ─── Radar dish ───────────────────────────────────────────────────────────────

function RadarDish({ peers }: { peers: Peer[] }) {
  const sweepAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(sweepAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [sweepAnim]);

  const sweep  = sweepAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg',   '360deg'] });
  const trail1 = sweepAnim.interpolate({ inputRange: [0, 1], outputRange: ['-18deg', '342deg'] });
  const trail2 = sweepAnim.interpolate({ inputRange: [0, 1], outputRange: ['-36deg', '324deg'] });
  const trail3 = sweepAnim.interpolate({ inputRange: [0, 1], outputRange: ['-54deg', '306deg'] });

  return (
    <View style={styles.dish}>
      {/* ── Background ── */}
      <View style={styles.dishBg} />

      {/* ── Range rings ── */}
      {RINGS.map((ring, i) => {
        const size = ring.ratio * INNER_RADIUS * 2;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 1,
              borderColor: COLOR_CYAN,
              opacity: ring.opacity,
              left: RADIUS - size / 2,
              top: RADIUS - size / 2,
            }}
          />
        );
      })}

      {/* ── Crosshairs ── */}
      <View style={styles.crossH} />
      <View style={styles.crossV} />

      {/* ── Compass labels ── */}
      <Text style={[styles.compass, { top: 3, left: RADIUS - 5 }]}>N</Text>
      <Text style={[styles.compass, { bottom: 3, left: RADIUS - 5 }]}>S</Text>
      <Text style={[styles.compass, { right: 4, top: RADIUS - 7 }]}>E</Text>
      <Text style={[styles.compass, { left: 4, top: RADIUS - 7 }]}>W</Text>

      {/* ── Range labels (right side of dish, below crosshair) ── */}
      {RANGE_LABELS.map(({ metres, px }) => (
        <Text
          key={metres}
          style={[styles.rangeLabel, { top: RADIUS + 3, left: RADIUS + px - 12 }]}
        >
          {metres}m
        </Text>
      ))}

      {/* ── Sweep trail (comet tail) ── */}
      <Animated.View style={[styles.sweepRow, { transform: [{ rotate: trail3 }], opacity: 0.08 }]}>
        <View style={styles.sweepBlank} /><View style={[styles.sweepLine, { backgroundColor: COLOR_MAGENTA }]} />
      </Animated.View>
      <Animated.View style={[styles.sweepRow, { transform: [{ rotate: trail2 }], opacity: 0.18 }]}>
        <View style={styles.sweepBlank} /><View style={[styles.sweepLine, { backgroundColor: COLOR_MAGENTA }]} />
      </Animated.View>
      <Animated.View style={[styles.sweepRow, { transform: [{ rotate: trail1 }], opacity: 0.35 }]}>
        <View style={styles.sweepBlank} /><View style={[styles.sweepLine, { backgroundColor: COLOR_MAGENTA }]} />
      </Animated.View>
      {/* Main sweep */}
      <Animated.View style={[styles.sweepRow, { transform: [{ rotate: sweep }] }]}>
        <View style={styles.sweepBlank} /><View style={[styles.sweepLine, { backgroundColor: COLOR_MAGENTA, opacity: 0.92 }]} />
      </Animated.View>

      {/* ── Centre dot ── */}
      <CenterDot />

      {/* ── Peer dots ── */}
      {peers.map((peer) => (
        <PeerDot key={peer.id} peer={peer} />
      ))}

      {/* ── Outer border (painted last so it sits on top) ── */}
      <View style={styles.dishBorder} pointerEvents="none" />
    </View>
  );
}

// ─── Status strip ─────────────────────────────────────────────────────────────

function StatusStrip({ peerCount }: { peerCount: number }) {
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.15, duration: 650, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1,    duration: 650, useNativeDriver: true }),
      ])
    ).start();
  }, [blinkAnim]);

  return (
    <View style={styles.strip}>
      {/* TRACKING */}
      <Text style={styles.stripItem}>
        <Text style={styles.stripKey}>TRACKING: </Text>
        <Text style={[styles.stripVal, { color: COLOR_GREEN }]}>{peerCount}/6</Text>
      </Text>

      <Text style={styles.stripDiv}>|</Text>

      {/* SWEEP — blinking */}
      <Animated.Text style={[styles.stripItem, { opacity: blinkAnim }]}>
        <Text style={styles.stripKey}>SWEEP: </Text>
        <Text style={[styles.stripVal, { color: COLOR_MAGENTA }]}>ACTIVE</Text>
      </Animated.Text>

      <Text style={styles.stripDiv}>|</Text>

      {/* P2P */}
      <Text style={styles.stripItem}>
        <Text style={styles.stripKey}>P2P: </Text>
        <Text style={[styles.stripVal, { color: COLOR_CYAN }]}>MESH</Text>
      </Text>
    </View>
  );
}

// ─── Squad list ───────────────────────────────────────────────────────────────

function SquadList({ peers }: { peers: Peer[] }) {
  return (
    <GlassPanel style={styles.squadPanel}>
      <Text style={styles.squadHeading}>SQUAD NODE LIST</Text>
      {peers.map((peer, i) => {
        const { label, color } = formatLastSeen(peer.lastSeen);
        return (
          <View
            key={peer.id}
            style={[styles.squadRow, i < peers.length - 1 && styles.squadRowBorder]}
          >
            <View style={[styles.squadDot, { backgroundColor: peer.color }]} />
            <Text style={styles.squadName}>{peer.name}</Text>
            <Text style={styles.squadMeta}>
              {peer.distance}m {bearingToDir(peer.bearing)}
            </Text>
            <Text style={[styles.squadSeen, { color }]}>{label}</Text>
          </View>
        );
      })}
    </GlassPanel>
  );
}

// ─── Radar screen ─────────────────────────────────────────────────────────────

export default function RadarScreen() {
  const peers = useMeshStore((s) => s.peers);

  return (
    <ScreenBackground>
      <HudHeader title="RADAR" gpsStatus="LOCKED" batteryPercent={82} />
      <MeshStatusBar />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <RadarDish peers={peers} />
        <StatusStrip peerCount={peers.length} />
        <SquadList peers={peers} />
      </ScrollView>
    </ScreenBackground>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 32,
    gap: 14,
  },

  // ── Dish ──
  dish: {
    width: DISH_SIZE,
    height: DISH_SIZE,
  },
  dishBg: {
    position: 'absolute',
    width: DISH_SIZE,
    height: DISH_SIZE,
    borderRadius: RADIUS,
    backgroundColor: '#010810',
  },
  dishBorder: {
    position: 'absolute',
    width: DISH_SIZE,
    height: DISH_SIZE,
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(0,245,255,0.28)',
  },
  crossH: {
    position: 'absolute',
    top: RADIUS - 0.5,
    left: 0,
    width: DISH_SIZE,
    height: 1,
    backgroundColor: COLOR_CYAN,
    opacity: 0.12,
  },
  crossV: {
    position: 'absolute',
    left: RADIUS - 0.5,
    top: 0,
    width: 1,
    height: DISH_SIZE,
    backgroundColor: COLOR_CYAN,
    opacity: 0.12,
  },
  compass: {
    position: 'absolute',
    fontFamily: FONT_MONO,
    fontSize: 9,
    color: COLOR_CYAN,
    opacity: 0.55,
  },
  rangeLabel: {
    position: 'absolute',
    fontFamily: FONT_MONO,
    fontSize: 7,
    color: COLOR_CYAN,
    opacity: 0.38,
  },

  // ── Sweep ──
  sweepRow: {
    position: 'absolute',
    top: RADIUS - 1,
    left: 0,
    width: DISH_SIZE,
    height: 2,
    flexDirection: 'row',
  },
  sweepBlank: {
    width: RADIUS,
    height: 2,
  },
  sweepLine: {
    width: RADIUS,
    height: 2,
  },

  // ── Status strip ──
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 4,
    width: '100%',
  },
  stripItem: {
    fontFamily: FONT_MONO,
    fontSize: 10,
  },
  stripKey: {
    fontFamily: FONT_MONO,
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
  },
  stripVal: {
    fontFamily: FONT_MONO,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  stripDiv: {
    fontFamily: FONT_MONO,
    fontSize: 10,
    color: 'rgba(255,255,255,0.15)',
  },

  // ── Squad list ──
  squadPanel: {
    width: '92%',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  squadHeading: {
    fontFamily: FONT_DISPLAY,
    fontSize: 10,
    color: COLOR_CYAN,
    letterSpacing: 2,
    opacity: 0.65,
    marginBottom: 8,
  },
  squadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    gap: 8,
  },
  squadRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,245,255,0.07)',
  },
  squadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  squadName: {
    fontFamily: FONT_DISPLAY,
    fontSize: 10,
    color: '#ffffff',
    flex: 1,
    letterSpacing: 0.5,
  },
  squadMeta: {
    fontFamily: FONT_MONO,
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  squadSeen: {
    fontFamily: FONT_MONO,
    fontSize: 10,
    minWidth: 52,
    textAlign: 'right',
  },
});
