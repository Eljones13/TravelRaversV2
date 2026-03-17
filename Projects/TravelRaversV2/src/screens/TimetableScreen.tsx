// ============================================================
// TRAVEL RAVERS — TimetableScreen (Full Rebuild)
// Reads artists from FestivalContext. Day tabs FRI/SAT/SUN.
// Stage chips, artist rows, clash detector, ArtistBioModal.
// Accent: #FFB300 (Amber)
// ============================================================

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Defs, Pattern, Circle, Rect, Polygon } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { useFestival } from '../context/FestivalContext';
import { type Artist } from '../data/festivals';
import { ArtistBioModal } from '../components/ArtistBioModal';
import { db } from '../db/database';
import { sql } from 'drizzle-orm';

const ACCENT = Colors.module.TIMETABLE; // #FFB300

// ── Day mapping ───────────────────────────────────────────────
type DayKey = 'FRI' | 'SAT' | 'SUN';
const DAY_MAP: Record<DayKey, Artist['day']> = {
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
};
const DAYS: DayKey[] = ['FRI', 'SAT', 'SUN'];

// ── Time helpers ──────────────────────────────────────────────
function toMins(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function isNowPlaying(start: string, end: string): boolean {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const s = toMins(start);
  let e = toMins(end);
  if (e < s) e += 24 * 60; // midnight crossover
  const nowAdj = nowMins < s && e > 24 * 60 ? nowMins + 24 * 60 : nowMins;
  return nowAdj >= s && nowAdj < e;
}

function timesOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
  const s1m = toMins(s1);
  let e1m = toMins(e1);
  const s2m = toMins(s2);
  let e2m = toMins(e2);
  if (e1m < s1m) e1m += 24 * 60;
  if (e2m < s2m) e2m += 24 * 60;
  return s1m < e2m && s2m < e1m;
}

// ── Blinking NOW badge ────────────────────────────────────────
const NowBadge: React.FC = () => {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1,   duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [anim]);
  return (
    <Animated.Text style={[s.nowBadge, { opacity: anim }]}>NOW</Animated.Text>
  );
};

// ── Main component ────────────────────────────────────────────
export const TimetableScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { selectedFestival } = useFestival();

  const [activeDay, setActiveDay]     = useState<DayKey>('FRI');
  const [activeStage, setActiveStage] = useState<string>('ALL STAGES');
  const [favedIds, setFavedIds]       = useState<Set<string>>(new Set());
  const [modalArtist, setModalArtist] = useState<Artist | null>(null);

  // ── Toggle fave ──────────────────────────────────────────────
  const toggleFave = useCallback((artist: Artist) => {
    if (!selectedFestival) return;
    setFavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(artist.id)) {
        next.delete(artist.id);
        // fire-and-forget SQLite delete
        try { db.run(sql`DELETE FROM user_faves WHERE artist_id = ${artist.id} AND festival_id = ${selectedFestival.id}`); } catch {}
      } else {
        next.add(artist.id);
        try { db.run(sql`INSERT OR IGNORE INTO user_faves (artist_id, festival_id) VALUES (${artist.id}, ${selectedFestival.id})`); } catch {}

      }
      return next;
    });
  }, [selectedFestival]);

  // ── No festival selected ──────────────────────────────────────
  if (!selectedFestival) {
    return (
      <SafeAreaView style={s.safeArea} edges={['top']}>
        <View style={s.noFestivalWrap}>
          <Text style={s.noFestivalText}>SELECT A FESTIVAL FIRST</Text>
          <TouchableOpacity
            style={s.noFestivalBtn}
            onPress={() => navigation.navigate('FestivalSelect')}
          >
            <Text style={s.noFestivalBtnText}>GO TO FESTIVAL SELECT</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Filter pipeline ───────────────────────────────────────────
  const dayArtists = selectedFestival.artists.filter(
    (a) => a.day === DAY_MAP[activeDay]
  );
  const filtered = (
    activeStage === 'ALL STAGES'
      ? dayArtists
      : dayArtists.filter((a) => a.stage === activeStage)
  ).slice().sort((a, b) => toMins(a.startTime) - toMins(b.startTime));

  // ── Clash detection ───────────────────────────────────────────
  const favedOnDay = dayArtists.filter((a) => favedIds.has(a.id));
  const clashes: [Artist, Artist][] = [];
  for (let i = 0; i < favedOnDay.length; i++) {
    for (let j = i + 1; j < favedOnDay.length; j++) {
      if (timesOverlap(
        favedOnDay[i].startTime, favedOnDay[i].endTime,
        favedOnDay[j].startTime, favedOnDay[j].endTime
      )) {
        clashes.push([favedOnDay[i], favedOnDay[j]]);
      }
    }
  }

  // ── Stage chip list ───────────────────────────────────────────
  const stageChips = ['ALL STAGES', ...selectedFestival.stages.map((s) => s.id)];

  const getStageColor = (stageId: string): string =>
    selectedFestival.stages.find((s) => s.id === stageId)?.color ?? Colors.dim;

  const getStageName = (stageId: string): string =>
    selectedFestival.stages.find((s) => s.id === stageId)?.name ?? stageId;

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>

      {/* Dot grid bg */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern id="dotTT" width="40" height="40" patternUnits="userSpaceOnUse">
              <Circle cx="1" cy="1" r="0.6" fill="rgba(0,245,255,0.07)" />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#dotTT)" />
        </Svg>
      </View>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Polygon points="15,5 7,12 15,19" fill={ACCENT} />
          </Svg>
          <Text style={s.backText}>BACK</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>TIMETABLE</Text>
          <Text style={s.headerSub}>{selectedFestival.name}</Text>
        </View>
        <View style={{ minWidth: 60 }} />
      </View>

      {/* ── Day tabs ── */}
      <View style={s.dayRow}>
        {DAYS.map((day) => {
          const active = activeDay === day;
          return (
            <TouchableOpacity
              key={day}
              style={[s.dayTab, active && s.dayTabActive]}
              onPress={() => { setActiveDay(day); setActiveStage('ALL STAGES'); }}
            >
              <Text style={[s.dayTabText, { color: active ? ACCENT : Colors.dim }]}>{day}</Text>
              {active && <View style={s.dayUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Stage chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.stageRow}
        style={s.stageScroll}
      >
        {stageChips.map((chipId) => {
          const active = activeStage === chipId;
          const color = chipId === 'ALL STAGES' ? ACCENT : getStageColor(chipId);
          const label = chipId === 'ALL STAGES' ? 'ALL STAGES' : getStageName(chipId).toUpperCase();
          return (
            <TouchableOpacity
              key={chipId}
              style={[
                s.stageChip,
                active && { borderColor: color + '99', backgroundColor: color + '18' },
              ]}
              onPress={() => setActiveStage(chipId)}
            >
              <Text style={[s.stageChipText, { color: active ? color : Colors.dim }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Clash warning ── */}
        {clashes.length > 0 && clashes.map(([a, b], i) => (
          <View key={i} style={s.clashCard}>
            <Text style={s.clashTitle}>⚡ CLASH DETECTED</Text>
            <Text style={s.clashBody}>
              {a.name}  vs  {b.name}{'\n'}
              {a.startTime}–{a.endTime}  ·  {b.startTime}–{b.endTime}
            </Text>
          </View>
        ))}

        {/* ── Artist list ── */}
        {filtered.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>NO SETS SCHEDULED</Text>
          </View>
        ) : (
          filtered.map((artist) => {
            const stageColor = getStageColor(artist.stage);
            const isFaved = favedIds.has(artist.id);
            const nowPlaying = isNowPlaying(artist.startTime, artist.endTime);

            return (
              <TouchableOpacity
                key={artist.id}
                style={s.artistRow}
                onPress={() => setModalArtist(artist)}
                activeOpacity={0.75}
              >
                {/* Left accent bar (stage color) */}
                <View style={[s.rowAccentBar, { backgroundColor: stageColor }]} />

                {/* Time column */}
                <View style={s.timeCol}>
                  <Text style={[s.timeStart, { color: ACCENT }]}>{artist.startTime}</Text>
                  <View style={[s.timeDivider, { backgroundColor: stageColor }]} />
                  <Text style={s.timeEnd}>{artist.endTime}</Text>
                </View>

                {/* Info column */}
                <View style={s.infoCol}>
                  <View style={s.infoTop}>
                    <Text style={s.artistName} numberOfLines={1}>{artist.name}</Text>
                    {nowPlaying && <NowBadge />}
                  </View>
                  <View style={s.infoMeta}>
                    <View style={[s.genrePill, { borderColor: stageColor + '55', backgroundColor: stageColor + '15' }]}>
                      <Text style={[s.genrePillText, { color: stageColor }]}>
                        {artist.genre.toUpperCase().slice(0, 18)}
                      </Text>
                    </View>
                    <Text style={s.stageName}>{getStageName(artist.stage).toUpperCase()}</Text>
                  </View>
                </View>

                {/* Star */}
                <TouchableOpacity
                  style={s.starBtn}
                  onPress={(e) => { e.stopPropagation(); toggleFave(artist); }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[s.star, { color: isFaved ? ACCENT : Colors.dim + '88' }]}>
                    {isFaved ? '★' : '☆'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}

      </ScrollView>

      {/* ── Artist Bio Modal ── */}
      <ArtistBioModal
        visible={modalArtist !== null}
        artist={modalArtist}
        festival={selectedFestival}
        isFaved={modalArtist ? favedIds.has(modalArtist.id) : false}
        onToggleFave={() => { if (modalArtist) toggleFave(modalArtist); }}
        onClose={() => setModalArtist(null)}
      />

    </SafeAreaView>
  );
};

export default TimetableScreen;

// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,245,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 60 },
  backText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 9,
    color: ACCENT,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 14,
    color: ACCENT,
    letterSpacing: 3,
    textTransform: 'uppercase',
    ...Platform.select({
      web: { textShadow: `0px 0px 8px ${ACCENT}` } as any,
      default: { textShadowColor: ACCENT, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
    }),
  },
  headerSub: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 8,
    color: Colors.dim,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 2,
  },

  // Day tabs
  dayRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,245,255,0.08)',
  },
  dayTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    position: 'relative',
  },
  dayTabActive: {
    backgroundColor: ACCENT + '10',
  },
  dayTabText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 11,
    letterSpacing: 2,
  },
  dayUnderline: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: ACCENT,
  },

  // Stage chips
  stageScroll: { maxHeight: 46, marginVertical: 8 },
  stageRow: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  stageChip: {
    borderWidth: 1,
    borderColor: 'rgba(0,200,220,0.2)',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(6,16,36,0.5)',
  },
  stageChipText: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingVertical: 8, paddingBottom: 32 },

  // Clash card
  clashCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: ACCENT + '55',
    borderRadius: 10,
    backgroundColor: ACCENT + '0D',
    padding: 12,
  },
  clashTitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 10,
    color: ACCENT,
    letterSpacing: 2,
    marginBottom: 4,
  },
  clashBody: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 9,
    color: ACCENT + 'BB',
    letterSpacing: 1,
    lineHeight: 14,
  },

  // Artist row
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(6,16,36,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(0,200,220,0.18)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  rowAccentBar: {
    width: 3,
    alignSelf: 'stretch',
    opacity: 0.7,
  },
  timeCol: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 3,
  },
  timeStart: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 10,
    letterSpacing: 1,
  },
  timeDivider: {
    width: 1,
    height: 12,
    opacity: 0.5,
  },
  timeEnd: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 9,
    color: Colors.dim,
  },
  infoCol: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 8,
    paddingRight: 4,
  },
  infoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  artistName: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 11,
    color: Colors.text,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    flex: 1,
  },
  nowBadge: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 8,
    color: Colors.green,
    letterSpacing: 2,
    borderWidth: 1,
    borderColor: Colors.green + '66',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  infoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  genrePill: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  genrePillText: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 7,
    letterSpacing: 1,
  },
  stageName: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 8,
    color: Colors.dim,
    letterSpacing: 1,
  },
  starBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  star: {
    fontSize: 18,
  },

  // Empty state
  emptyCard: {
    marginHorizontal: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.dim + '33',
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 10,
    color: Colors.dim,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  // No festival
  noFestivalWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 32,
  },
  noFestivalText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 14,
    color: Colors.dim,
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  noFestivalBtn: {
    borderWidth: 1,
    borderColor: ACCENT + '55',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  noFestivalBtnText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 10,
    color: ACCENT,
    letterSpacing: 2,
  },
});
