// ============================================================
// TRAVEL RAVERS — EventsScreen
// Session 1-B: Tron Glass consistent styling
// Accent: #00FFFF (Cyan) | Module: EVENTS
// Design: hud-design.md + tron-glass-skill.md
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Defs,
  Pattern,
  Circle,
  Rect,
  Line,
  Polygon,
} from 'react-native-svg';
import { GlowBorderCard } from '../components/GlowBorderCard';
import { Colors } from '../constants/colors';

const ACCENT = Colors.module.EVENTS; // #00FFFF

// ── Navigation type ──
type EventsScreenProps = {
  navigation: { goBack: () => void };
};

// ── Inline SVG icon ──
const IconEvents: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5" />
    <Rect x="3" y="8" width="18" height="2" fill={color} opacity="0.3" />
    <Circle cx="8" cy="14" r="1" fill={color} />
    <Circle cx="12" cy="14" r="1" fill={color} />
    <Circle cx="16" cy="14" r="1" fill={color} />
  </Svg>
);

// ── Corner brackets (Tron scan-line aesthetic) ──
const CornerBrackets: React.FC<{ color: string }> = ({ color }) => (
  <>
    <View style={[styles.cornerTL, { borderColor: color }]} pointerEvents="none" />
    <View style={[styles.cornerTR, { borderColor: color }]} pointerEvents="none" />
    <View style={[styles.cornerBL, { borderColor: color }]} pointerEvents="none" />
    <View style={[styles.cornerBR, { borderColor: color }]} pointerEvents="none" />
  </>
);

// ── Placeholder data ──
const STAGES = [
  { id: 'main', label: 'MAIN STAGE', sub: 'Arena · Capacity 40,000' },
  { id: 'forest', label: 'FOREST STAGE', sub: 'Woodland · Capacity 8,000' },
  { id: 'bass', label: 'BASS ARENA', sub: 'Indoor · Capacity 5,000' },
  { id: 'chill', label: 'CHILL GARDEN', sub: 'Outdoor · Capacity 2,000' },
];

const FEATURED = [
  { id: 'f1', artist: 'BICEP (LIVE)', time: 'FRI 22:30', stage: 'MAIN STAGE' },
  { id: 'f2', artist: 'CARIBOU', time: 'SAT 00:00', stage: 'FOREST STAGE' },
  { id: 'f3', artist: 'FOUR TET', time: 'SAT 23:00', stage: 'BASS ARENA' },
];

export const EventsScreen: React.FC<EventsScreenProps> = ({ navigation }) => {
  const [activeStage, setActiveStage] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* ── Dot grid background overlay (HomeScreen pattern) ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern id="dotGridE" width="44" height="44" patternUnits="userSpaceOnUse">
              <Circle cx="1" cy="1" r="0.5" fill="rgba(0,245,255,0.08)" />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#dotGridE)" />
        </Svg>
      </View>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.backBtn}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Polygon points="15,5 7,12 15,19" fill={ACCENT} />
          </Svg>
          <Text style={[styles.backText, { color: ACCENT }]}>BACK</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <IconEvents size={18} color={ACCENT} />
          <Text style={[styles.headerTitle, { color: ACCENT }]}>
            EVENTS
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerSub}>LINEUP &amp; STAGES</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Active Festival card ── */}
        <GlowBorderCard accentColor={ACCENT} style={styles.festivalCard}>
          <View style={styles.festivalRow}>
            <View>
              <Text style={styles.festivalLabel}>ACTIVE FESTIVAL</Text>
              <Text style={[styles.festivalName, { color: ACCENT }]}>GLASTONBURY 2026</Text>
              <Text style={styles.festivalDate}>25 – 29 JUNE · PILTON, SOMERSET</Text>
            </View>
            <View style={[styles.statusPill, { borderColor: ACCENT + '55' }]}>
              <View style={[styles.statusDot, { backgroundColor: ACCENT }]} />
              <Text style={[styles.statusText, { color: ACCENT }]}>LIVE</Text>
            </View>
          </View>
          <View style={styles.festivalStats}>
            {[
              { label: 'STAGES', value: '12' },
              { label: 'ACTS', value: '180+' },
              { label: 'DAYS', value: '5' },
            ].map((stat) => (
              <View key={stat.label} style={styles.statBlock}>
                <Text style={[styles.statValue, { color: ACCENT }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
          <CornerBrackets color={ACCENT} />
        </GlowBorderCard>

        {/* ── Divider ── */}
        <View style={styles.sectionRow}>
          <View style={[styles.sectionLine, { backgroundColor: ACCENT }]} />
          <Text style={[styles.sectionLabel, { color: ACCENT }]}>STAGES</Text>
          <View style={[styles.sectionLine, { backgroundColor: ACCENT }]} />
        </View>

        {/* ── Stage list ── */}
        {STAGES.map((stage) => {
          const isActive = activeStage === stage.id;
          return (
            <TouchableOpacity
              key={stage.id}
              onPress={() => setActiveStage(isActive ? null : stage.id)}
              activeOpacity={0.75}
              style={styles.stageItemWrapper}
            >
              <View
                style={[
                  styles.stageItem,
                  isActive && { borderColor: ACCENT + '88', backgroundColor: ACCENT + '14' },
                ]}
              >
                <View style={styles.stageItemLeft}>
                  <View style={[styles.stageDot, { backgroundColor: ACCENT }]} />
                  <View>
                    <Text style={[styles.stageItemLabel, { color: isActive ? ACCENT : Colors.text }]}>
                      {stage.label}
                    </Text>
                    <Text style={styles.stageItemSub}>{stage.sub}</Text>
                  </View>
                </View>
                <Text style={[styles.chevron, { color: ACCENT }]}>{isActive ? '▲' : '▼'}</Text>
              </View>
              <CornerBrackets color={ACCENT} />
            </TouchableOpacity>
          );
        })}

        {/* ── Divider ── */}
        <View style={styles.sectionRow}>
          <View style={[styles.sectionLine, { backgroundColor: ACCENT }]} />
          <Text style={[styles.sectionLabel, { color: ACCENT }]}>FEATURED ACTS</Text>
          <View style={[styles.sectionLine, { backgroundColor: ACCENT }]} />
        </View>

        {/* ── Featured acts ── */}
        {FEATURED.map((act) => (
          <GlowBorderCard key={act.id} accentColor={ACCENT} style={styles.actCard}>
            <View style={styles.actRow}>
              <View>
                <Text style={[styles.actName, { color: Colors.text }]}>{act.artist}</Text>
                <Text style={styles.actMeta}>{act.stage}</Text>
              </View>
              <View style={[styles.timePill, { borderColor: ACCENT + '55' }]}>
                <Text style={[styles.timeText, { color: ACCENT }]}>{act.time}</Text>
              </View>
            </View>
            <CornerBrackets color={ACCENT} />
          </GlowBorderCard>
        ))}

        {/* ── Scan line divider ── */}
        <View style={styles.scanLine}>
          <Svg width="100%" height="2">
            <Line x1="0" y1="1" x2="100%" y2="1" stroke={ACCENT} strokeWidth="0.5" strokeOpacity="0.3" />
          </Svg>
        </View>

        <Text style={styles.footerNote}>
          SESSION 1-B — TRON GLASS EVENTS SCREEN COMPLETE
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
};

// ── Styles ──
const CORNER_SIZE = 10;
const CORNER_WIDTH = 2;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,245,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 60 },
  backText: { fontSize: 10, letterSpacing: 2, fontWeight: '700' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
    textTransform: 'uppercase',
    ...Platform.select({
      web: { textShadow: `0px 0px 8px ${ACCENT}` } as any,
      default: { textShadowColor: ACCENT, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 }
    }),
  },
  headerRight: { minWidth: 60, alignItems: 'flex-end' },
  headerSub: { color: Colors.dim, fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase' },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40, paddingTop: 8 },

  // Festival card
  festivalCard: { marginTop: 8 },
  festivalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  festivalLabel: {
    color: Colors.dim,
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  festivalName: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  festivalDate: { color: Colors.dim, fontSize: 10, letterSpacing: 1, marginTop: 2 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 8, letterSpacing: 2, fontWeight: '700' },
  festivalStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 },
  statBlock: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  statLabel: { color: Colors.dim, fontSize: 8, letterSpacing: 2, marginTop: 2 },

  // Section divider
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    gap: 8,
  },
  sectionLine: { flex: 1, height: 1, opacity: 0.25 },
  sectionLabel: { fontSize: 9, letterSpacing: 3, fontWeight: '700', textTransform: 'uppercase' },

  // Stage list items
  stageItemWrapper: {
    marginHorizontal: 16,
    marginBottom: 8,
    position: 'relative',
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(6,16,36,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(0,200,220,0.2)',
    borderRadius: 10,
    padding: 14,
  },
  stageItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    ...Platform.select({
      web: { boxShadow: `0px 0px 6px ${ACCENT}` } as any,
      default: { shadowColor: ACCENT, shadowOffset: { width: 0, height: 0 }, shadowRadius: 6, shadowOpacity: 1 }
    }),
    elevation: 4,
  },
  stageItemLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  stageItemSub: { color: Colors.dim, fontSize: 9, letterSpacing: 1, marginTop: 2 },
  chevron: { fontSize: 10, fontWeight: '700' },

  // Featured acts
  actCard: {},
  actRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actName: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  actMeta: { color: Colors.dim, fontSize: 9, letterSpacing: 1, marginTop: 2 },
  timePill: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  timeText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },

  // Footer
  scanLine: { marginHorizontal: 16, marginTop: 8, marginBottom: 8 },
  footerNote: {
    color: Colors.dim,
    fontSize: 8,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 8,
    textTransform: 'uppercase',
  },

  // Corner brackets
  cornerTL: {
    position: 'absolute', top: 0, left: 0,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH,
    borderRadius: 2,
  },
  cornerTR: {
    position: 'absolute', top: 0, right: 0,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH,
    borderRadius: 2,
  },
  cornerBL: {
    position: 'absolute', bottom: 0, left: 0,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH,
    borderRadius: 2,
  },
  cornerBR: {
    position: 'absolute', bottom: 0, right: 0,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH,
    borderRadius: 2,
  },
});
