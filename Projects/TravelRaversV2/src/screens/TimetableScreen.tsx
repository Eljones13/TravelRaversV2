// ============================================================
// TRAVEL RAVERS — TimetableScreen
// Session 1-B: Tron Glass consistent styling
// Accent: #FFB300 (Amber) | Module: TIMETABLE
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
  Polygon,
} from 'react-native-svg';
import { GlowBorderCard } from '../components/GlowBorderCard';
import { Colors } from '../constants/colors';

const ACCENT = Colors.module.TIMETABLE; // #FFB300

// ── Navigation type ──
type TimetableScreenProps = {
  navigation: { goBack: () => void };
};

// ── Inline SVG icon ──
const IconTimetable: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5" />
    <Rect x="7" y="8" width="10" height="1.5" fill={color} opacity="0.8" />
    <Rect x="7" y="12" width="7" height="1.5" fill={color} opacity="0.6" />
    <Rect x="7" y="16" width="10" height="1.5" fill={color} opacity="0.4" />
  </Svg>
);

// ── Corner brackets ──
const CornerBrackets: React.FC<{ color: string }> = ({ color }) => (
  <>
    <View style={[styles.cornerTL, { borderColor: color }]} pointerEvents="none" />
    <View style={[styles.cornerTR, { borderColor: color }]} pointerEvents="none" />
    <View style={[styles.cornerBL, { borderColor: color }]} pointerEvents="none" />
    <View style={[styles.cornerBR, { borderColor: color }]} pointerEvents="none" />
  </>
);

// ── Placeholder data ──
const DAYS: string[] = ['WED', 'THU', 'FRI', 'SAT', 'SUN'];

const STAGES_TT: string[] = ['ALL STAGES', 'MAIN', 'FOREST', 'BASS', 'CHILL'];

interface SetItem {
  id: string;
  artist: string;
  stage: string;
  start: string;
  end: string;
  genre: string;
  starred: boolean;
}

const SETS_BY_DAY: Record<string, SetItem[]> = {
  WED: [],
  THU: [
    { id: 't1', artist: 'OPENING CEREMONY', stage: 'MAIN', start: '20:00', end: '21:00', genre: 'EVENT', starred: false },
    { id: 't2', artist: 'DJ SETS', stage: 'BASS', start: '22:00', end: '02:00', genre: 'ELECTRONIC', starred: false },
  ],
  FRI: [
    { id: 'f1', artist: 'BICEP (LIVE)', stage: 'MAIN', start: '22:30', end: '00:00', genre: 'ELECTRONIC', starred: true },
    { id: 'f2', artist: 'FLOATING POINTS', stage: 'FOREST', start: '23:00', end: '01:00', genre: 'JAZZ / ELECTRONIC', starred: false },
    { id: 'f3', artist: 'MIDLAND', stage: 'BASS', start: '21:00', end: '22:30', genre: 'TECHNO', starred: false },
    { id: 'f4', artist: 'ROSS FROM FRIENDS', stage: 'CHILL', start: '20:00', end: '21:30', genre: 'HOUSE', starred: false },
  ],
  SAT: [
    { id: 's1', artist: 'CARIBOU', stage: 'FOREST', start: '00:00', end: '01:30', genre: 'PSYCHEDELIC', starred: true },
    { id: 's2', artist: 'FOUR TET', stage: 'BASS', start: '23:00', end: '01:00', genre: 'ELECTRONIC', starred: true },
    { id: 's3', artist: 'PEGGY GOU', stage: 'MAIN', start: '21:00', end: '22:30', genre: 'HOUSE', starred: false },
    { id: 's4', artist: 'OBJEKT', stage: 'BASS', start: '21:00', end: '23:00', genre: 'TECHNO', starred: false },
  ],
  SUN: [
    { id: 'u1', artist: 'CLOSING SET', stage: 'MAIN', start: '22:00', end: '00:00', genre: 'TBC', starred: false },
  ],
};

// Stage colour mapping for timetable slots
const STAGE_COLORS: Record<string, string> = {
  MAIN: Colors.module.EVENTS,    // Cyan
  FOREST: Colors.module.MAP,       // Green
  BASS: Colors.module.RADAR,     // Purple
  CHILL: Colors.module.KIT,       // Orange
  EVENT: Colors.module.TIMETABLE, // Amber
  TBC: Colors.dim,
};

export const TimetableScreen: React.FC<TimetableScreenProps> = ({ navigation }) => {
  const [activeDay, setActiveDay] = useState<string>('FRI');
  const [activeStage, setActiveStage] = useState<string>('ALL STAGES');

  const daySets = SETS_BY_DAY[activeDay] ?? [];
  const filtered = activeStage === 'ALL STAGES'
    ? daySets
    : daySets.filter((s) => s.stage === activeStage);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* ── Dot grid background overlay ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern id="dotGridTT" width="44" height="44" patternUnits="userSpaceOnUse">
              <Circle cx="1" cy="1" r="0.5" fill="rgba(0,245,255,0.08)" />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#dotGridTT)" />
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
          <IconTimetable size={18} color={ACCENT} />
          <Text style={[styles.headerTitle, { color: ACCENT }]}>
            TIMETABLE
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerSub}>SET TIMES</Text>
        </View>
      </View>

      {/* ── Day selector — sticky below header ── */}
      <View style={styles.daySelectorRow}>
        {DAYS.map((day) => {
          const isActive = activeDay === day;
          return (
            <TouchableOpacity
              key={day}
              onPress={() => setActiveDay(day)}
              style={[
                styles.dayBtn,
                isActive && {
                  backgroundColor: ACCENT + '22',
                  borderColor: ACCENT,
                },
              ]}
            >
              <Text style={[styles.dayBtnText, { color: isActive ? ACCENT : Colors.dim }]}>
                {day}
              </Text>
              {isActive && <View style={[styles.dayActiveLine, { backgroundColor: ACCENT }]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Stage filter ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stageScroll}
          style={styles.stageFilterRow}
        >
          {STAGES_TT.map((stage) => {
            const isActive = activeStage === stage;
            const stageColor = STAGE_COLORS[stage] ?? ACCENT;
            return (
              <TouchableOpacity
                key={stage}
                onPress={() => setActiveStage(stage)}
                style={[
                  styles.stageChip,
                  isActive && {
                    backgroundColor: stageColor + '22',
                    borderColor: stageColor + '88',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.stageChipText,
                    { color: isActive ? stageColor : Colors.dim },
                  ]}
                >
                  {stage}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Set list ── */}
        {filtered.length === 0 ? (
          <GlowBorderCard accentColor={ACCENT} style={styles.emptyCard}>
            <Text style={styles.emptyText}>NO SETS SCHEDULED YET</Text>
            <CornerBrackets color={ACCENT} />
          </GlowBorderCard>
        ) : (
          filtered.map((set) => {
            const stageColor = STAGE_COLORS[set.stage] ?? ACCENT;
            return (
              <TouchableOpacity
                key={set.id}
                activeOpacity={0.75}
                style={styles.setWrapper}
              >
                <View style={styles.setItem}>
                  {/* Time column */}
                  <View style={styles.timeCol}>
                    <Text style={[styles.setStart, { color: ACCENT }]}>{set.start}</Text>
                    <View style={[styles.timeLine, { backgroundColor: stageColor }]} />
                    <Text style={styles.setEnd}>{set.end}</Text>
                  </View>
                  {/* Divider */}
                  <View style={[styles.setDivider, { backgroundColor: stageColor }]} />
                  {/* Info column */}
                  <View style={styles.setInfo}>
                    <View style={styles.setInfoTop}>
                      <Text style={[styles.setArtist, { color: Colors.text }]}>{set.artist}</Text>
                      {set.starred && (
                        <Text style={[styles.starBadge, { color: ACCENT }]}>★</Text>
                      )}
                    </View>
                    <View style={styles.setMeta}>
                      <View style={[styles.stagePill, { borderColor: stageColor + '66' }]}>
                        <Text style={[styles.stagePillText, { color: stageColor }]}>{set.stage}</Text>
                      </View>
                      <Text style={styles.setGenre}>{set.genre}</Text>
                    </View>
                  </View>
                </View>
                <CornerBrackets color={stageColor} />
              </TouchableOpacity>
            );
          })
        )}

        {/* ── Clashes warning card ── */}
        {filtered.length > 1 && (
          <GlowBorderCard accentColor={ACCENT} style={styles.clashCard}>
            <Text style={[styles.clashTitle, { color: ACCENT }]}>⚡ CLASH DETECTOR</Text>
            <Text style={styles.clashBody}>
              {filtered.length} ACTS OVERLAP ON {activeDay}.{'\n'}
              TAP AN ACT TO ADD TO YOUR STARRED LIST.
            </Text>
            <CornerBrackets color={ACCENT} />
          </GlowBorderCard>
        )}

        <Text style={styles.footerNote}>
          SESSION 1-B — TRON GLASS TIMETABLE SCREEN COMPLETE
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

  // Day selector
  daySelectorRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,245,255,0.08)',
  },
  dayBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderWidth: 0,
    position: 'relative',
  },
  dayBtnText: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  dayActiveLine: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 2,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40, paddingTop: 8 },

  stageFilterRow: { marginTop: 8 },
  stageScroll: { paddingHorizontal: 16, gap: 8 },
  stageChip: {
    borderWidth: 1,
    borderColor: 'rgba(0,200,220,0.2)',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(6,16,36,0.6)',
  },
  stageChipText: { fontSize: 9, letterSpacing: 2, fontWeight: '700', textTransform: 'uppercase' },

  // Set list items
  setWrapper: { marginHorizontal: 16, marginBottom: 8, position: 'relative' },
  setItem: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'rgba(6,16,36,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(0,200,220,0.2)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  timeCol: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  setStart: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  timeLine: { width: 1, height: 16, opacity: 0.5 },
  setEnd: { color: Colors.dim, fontSize: 9 },
  setDivider: { width: 2, opacity: 0.4 },
  setInfo: { flex: 1, padding: 12 },
  setInfoTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  setArtist: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', flex: 1 },
  starBadge: { fontSize: 16 },
  setMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  stagePill: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  stagePillText: { fontSize: 8, fontWeight: '700', letterSpacing: 1.5 },
  setGenre: { color: Colors.dim, fontSize: 9, letterSpacing: 1 },

  // Empty state
  emptyCard: { marginTop: 16 },
  emptyText: {
    color: Colors.dim,
    fontSize: 10,
    letterSpacing: 3,
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  // Clash card
  clashCard: { marginTop: 8 },
  clashTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  clashBody: { color: Colors.dim, fontSize: 10, letterSpacing: 1, lineHeight: 16 },

  footerNote: {
    color: Colors.dim,
    fontSize: 8,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },

  cornerTL: {
    position: 'absolute', top: 0, left: 0,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderRadius: 2,
  },
  cornerTR: {
    position: 'absolute', top: 0, right: 0,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderRadius: 2,
  },
  cornerBL: {
    position: 'absolute', bottom: 0, left: 0,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderRadius: 2,
  },
  cornerBR: {
    position: 'absolute', bottom: 0, right: 0,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderRadius: 2,
  },
});
