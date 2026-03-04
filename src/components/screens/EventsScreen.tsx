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

// ─── Score colour helpers ──────────────────────────────────────────────────────

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
  const accent = festival.accentColor;

  const handlePress = () => {
    setSelectedFestival(festival);
    console.log('[EventsScreen] selected:', festival.id);
  };

  return (
    <View style={styles.cardOuter}>
      {/* Outer glow */}
      <Pressable
        onPress={handlePress}
        style={[
          styles.cardWrapper,
          {
            shadowColor: accent,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 12,
            shadowOpacity: 0.35,
            elevation: 10,
          },
        ]}
      >
        <GlassPanel
          style={[
            styles.card,
            { borderColor: 'rgba(255,255,255,0.10)' },
          ]}
        >
          {/* Task 1: Top shine streak */}
          <View style={styles.shineTop} pointerEvents="none" />
          {/* Task 1: Bottom shine streak */}
          <View style={styles.shineBottom} pointerEvents="none" />

          {/* Task 3: Left accent bar with stronger glow */}
          <View style={[
            styles.accentBar,
            {
              backgroundColor: accent,
              shadowColor: accent,
              shadowOffset: { width: 4, height: 0 },
              shadowRadius: 12,
              shadowOpacity: 1,
              elevation: 8,
            },
          ]} />

          {/* Task 4: Left colour wash */}
          <View
            pointerEvents="none"
            style={[styles.accentWash, { backgroundColor: accent + '0D' }]}
          />

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
                      backgroundColor: accent + '26',
                      borderColor: accent,
                      shadowColor: accent,
                      shadowOffset: { width: 0, height: 0 },
                      shadowRadius: 4,
                      shadowOpacity: 0.7,
                    },
                  ]}
                >
                  <Text style={[styles.genreLabel, { color: accent }]}>
                    {genre}
                  </Text>
                </View>
              ))}
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <Text style={styles.statKey}>AGGRO </Text>
              <Text style={[
                styles.statValue,
                {
                  color: aggroColor(festival.aggroScore),
                  textShadowColor: aggroColor(festival.aggroScore),
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 6,
                },
              ]}>
                {festival.aggroScore}/10
              </Text>
              <Text style={styles.statSpacer}>{'  ·  '}</Text>
              <Text style={styles.statKey}>FIRST-TIMER </Text>
              <Text style={[
                styles.statValue,
                {
                  color: firstTimerColor(festival.firstTimerScore),
                  textShadowColor: firstTimerColor(festival.firstTimerScore),
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 6,
                },
              ]}>
                {festival.firstTimerScore}/10
              </Text>
            </View>
          </View>
        </GlassPanel>
      </Pressable>
    </View>
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
        style={styles.scrollView}
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
  scrollView: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 8,
  },


  // Card outer (holds corner blobs + pressable)
  cardOuter: {
    marginHorizontal: 12,
    marginBottom: 14,
    position: 'relative',
  },

  // Card pressable wrapper
  cardWrapper: {
    zIndex: 1,
  },

  // GlassPanel inner (Task 1)
  card: {
    flexDirection: 'row',
    overflow: 'hidden',
    width: '100%',
  },

  // Shine streaks (Task 1)
  shineTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    zIndex: 2,
  },
  shineBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    zIndex: 2,
  },

  // Accent bar (Task 3)
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    zIndex: 1,
  },

  // Left colour wash (Task 4)
  accentWash: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 120,
    zIndex: 1,
  },

  // Card content
  cardContent: {
    flex: 1,
    paddingLeft: 14,
    paddingRight: 12,
    paddingVertical: 12,
    gap: 6,
    zIndex: 2,
  },
  festivalName: {
    fontFamily: FONT_DISPLAY,
    fontSize: 17,
    letterSpacing: 1,
    color: '#ffffff',
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
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
    fontSize: 13,
    letterSpacing: 0.5,
  },
  statSpacer: {
    fontFamily: FONT_MONO,
    fontSize: 10,
    color: 'rgba(255,255,255,0.2)',
  },
});
