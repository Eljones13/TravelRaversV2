import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Festival } from '../../data/festivals';
import { FilterOption, useFestivalStore } from '../../stores/festivalStore';
import {
  COLOR_GREEN,
  COLOR_ORANGE,
  COLOR_RED,
  FONT_DISPLAY,
  FONT_MONO,
} from '../../theme/tokens';
import GlassPanel from '../shared/GlassPanel';
import HudHeader from '../shared/HudHeader';
import MeshStatusBar from '../shared/MeshStatusBar';
import ScreenBackground from '../shared/ScreenBackground';

// ─── Filter bar ───────────────────────────────────────────────────────────────

const FILTERS: FilterOption[] = ['ALL', 'UK', 'EU', 'CARNIVAL', 'CONCERT'];

function FilterBar() {
  const activeFilter    = useFestivalStore((s) => s.activeFilter);
  const setActiveFilter = useFestivalStore((s) => s.setActiveFilter);

  return (
    <View style={styles.filterRow}>
      {FILTERS.map((f) => {
        const active = f === activeFilter;
        return (
          <Pressable
            key={f}
            onPress={() => setActiveFilter(f)}
            style={[styles.filterPill, active && styles.filterPillActive]}
          >
            <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
              {f}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Score colour helper ───────────────────────────────────────────────────────

function aggroColor(score: number): string {
  if (score > 7) return COLOR_RED;
  if (score > 4) return COLOR_ORANGE;
  return COLOR_GREEN;
}

function firstTimerColor(score: number): string {
  if (score > 7) return COLOR_GREEN;
  if (score > 4) return COLOR_ORANGE;
  return COLOR_RED;
}

// ─── Festival card ────────────────────────────────────────────────────────────

function FestivalCard({ festival }: { festival: Festival }) {
  const setSelectedFestival = useFestivalStore((s) => s.setSelectedFestival);

  const handlePress = () => {
    setSelectedFestival(festival);
    console.log('[EventsScreen] selected:', festival.id);
  };

  return (
    <Pressable onPress={handlePress} style={styles.cardWrapper}>
      <GlassPanel style={styles.card}>
        {/* Left accent bar */}
        <View style={[styles.accentBar, { backgroundColor: festival.accentColor }]} />

        <View style={styles.cardContent}>
          {/* Name */}
          <Text style={styles.festivalName}>{festival.name}</Text>

          {/* Location + dates */}
          <Text style={styles.festivalMeta}>
            {festival.location} · {festival.dates}
          </Text>

          {/* Description */}
          <Text style={styles.festivalDesc}>{festival.description}</Text>

          {/* Genre tags */}
          <View style={styles.genreRow}>
            {festival.genres.map((genre) => (
              <View
                key={genre}
                style={[
                  styles.genreTag,
                  {
                    backgroundColor: `${festival.accentColor}26`,
                    borderColor: festival.accentColor,
                  },
                ]}
              >
                <Text style={[styles.genreLabel, { color: festival.accentColor }]}>
                  {genre}
                </Text>
              </View>
            ))}
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <Text style={styles.statKey}>AGGRO </Text>
            <Text style={[styles.statValue, { color: aggroColor(festival.aggroScore) }]}>
              {festival.aggroScore}/10
            </Text>
            <Text style={styles.statSpacer}>{'  ·  '}</Text>
            <Text style={styles.statKey}>FIRST-TIMER </Text>
            <Text style={[styles.statValue, { color: firstTimerColor(festival.firstTimerScore) }]}>
              {festival.firstTimerScore}/10
            </Text>
          </View>
        </View>
      </GlassPanel>
    </Pressable>
  );
}

// ─── Events screen ────────────────────────────────────────────────────────────

export default function EventsScreen() {
  const filteredFestivals = useFestivalStore((s) => s.filteredFestivals);

  return (
    <ScreenBackground>
      <HudHeader title="EVENTS" gpsStatus="LOCKED" batteryPercent={82} />
      <MeshStatusBar />
      <FilterBar />
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredFestivals().map((festival) => (
          <FestivalCard key={festival.id} festival={festival} />
        ))}
      </ScrollView>
    </ScreenBackground>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Filter bar
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  filterPillActive: {
    backgroundColor: 'rgba(0,245,255,0.25)',
    borderColor: '#00f5ff',
  },
  filterLabel: {
    fontFamily: FONT_DISPLAY,
    fontSize: 10,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
  },
  filterLabelActive: {
    color: '#00f5ff',
  },

  // List
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
    gap: 10,
  },

  // Card
  cardWrapper: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accentBar: {
    width: 3,
    alignSelf: 'stretch',
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
  },
  festivalName: {
    fontFamily: FONT_DISPLAY,
    fontSize: 16,
    color: '#ffffff',
  },
  festivalMeta: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  festivalDesc: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 16,
  },

  // Genre tags
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  genreTag: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  genreLabel: {
    fontFamily: FONT_MONO,
    fontSize: 9,
    letterSpacing: 0.5,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statKey: {
    fontFamily: FONT_MONO,
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.5,
  },
  statValue: {
    fontFamily: FONT_MONO,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  statSpacer: {
    fontFamily: FONT_MONO,
    fontSize: 10,
    color: 'rgba(255,255,255,0.2)',
  },
});
