// ============================================================
// TRAVEL RAVERS — FestivalSelectScreen
// Shown on first launch (no festival selected) and from Setup.
// Filter chips + 2-col festival grid + ENTER FESTIVAL button.
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useFestival } from '../context/FestivalContext';
import { FESTIVALS, type Festival } from '../data/festivals';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = Math.floor((SCREEN_W - 48) / 2); // 2-col grid, 16px side pad + 16px gap

// ── Filter definitions ────────────────────────────────────────
type FilterKey = 'all' | 'uk' | 'eu' | 'carnival';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',     label: 'ALL'        },
  { key: 'uk',      label: '🇬🇧 UK'     },
  { key: 'eu',      label: '🌍 EU'      },
  { key: 'carnival', label: '🎪 CARNIVAL' },
];

function applyFilter(festivals: Festival[], filter: FilterKey): Festival[] {
  switch (filter) {
    case 'uk':      return festivals.filter((f) => f.country === 'UK');
    case 'eu':      return festivals.filter((f) => f.country === 'EU');
    case 'carnival': return festivals.filter((f) => f.category === 'carnival');
    default:        return festivals;
  }
}

// ── Blinking offline badge dot ────────────────────────────────
const BlinkDot: React.FC = () => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.2, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return <Animated.View style={[s.dot, { opacity }]} />;
};

// ── Festival card ─────────────────────────────────────────────
const FestivalCard: React.FC<{
  festival: Festival;
  selected: boolean;
  onPress: () => void;
}> = ({ festival, selected, onPress }) => {
  const glowStyle: object = selected
    ? Platform.OS === 'web'
      ? { boxShadow: `0 0 18px ${festival.accentColor}66, 0 0 6px ${festival.accentColor}33` } as object
      : {
          shadowColor: festival.accentColor,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 14,
          shadowOpacity: 0.5,
          elevation: 12,
        }
    : {};

  return (
    <TouchableOpacity
      style={[
        s.card,
        {
          borderColor: selected
            ? festival.accentColor + '99'
            : 'rgba(0,245,255,0.15)',
        },
        glowStyle,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Shine gradient */}
      <LinearGradient
        colors={['rgba(255,255,255,0.06)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Selected checkmark */}
      {selected && (
        <View style={[s.checkmark, { backgroundColor: festival.accentColor + '22' }]}>
          <Text style={[s.checkmarkText, { color: festival.accentColor }]}>✓</Text>
        </View>
      )}

      {/* Emoji */}
      <Text style={s.cardEmoji}>{festival.emoji}</Text>

      {/* Name */}
      <Text style={s.cardName} numberOfLines={2}>
        {festival.name}
      </Text>

      {/* Dates + location */}
      <Text style={s.cardDates} numberOfLines={1}>{festival.dates}</Text>
      <Text style={s.cardLocation} numberOfLines={1}>{festival.location}</Text>

      {/* Capacity */}
      <Text style={[s.cardCapacity, { color: festival.accentColor }]}>
        {festival.capacity}
      </Text>
    </TouchableOpacity>
  );
};

// ── Main screen ───────────────────────────────────────────────
export function FestivalSelectScreen() {
  const { setFestival } = useFestival();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [pendingFestival, setPendingFestival] = useState<Festival | null>(null);
  const [entering, setEntering] = useState(false);

  const filtered = applyFilter(FESTIVALS, activeFilter);

  const handleEnter = useCallback(async () => {
    if (!pendingFestival || entering) return;
    setEntering(true);
    // setFestival persists to AsyncStorage + SQLite,
    // then FestivalContext updates selectedFestival →
    // RootNavigator auto-switches to MainApp.
    await setFestival(pendingFestival);
    setEntering(false);
  }, [pendingFestival, entering, setFestival]);

  const renderCard = useCallback(
    ({ item }: { item: Festival }) => (
      <FestivalCard
        festival={item}
        selected={pendingFestival?.id === item.id}
        onPress={() => setPendingFestival(item)}
      />
    ),
    [pendingFestival]
  );

  return (
    <View style={s.root}>
      {/* Scanline overlay */}
      <LinearGradient
        colors={[
          'rgba(0,245,255,0.012)',
          'transparent',
          'rgba(0,245,255,0.012)',
          'transparent',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFillObject, s.scanlines]}
        pointerEvents="none"
      />

      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

        {/* ── Header row ── */}
        <View style={s.headerRow}>
          <View style={s.headerTextBlock}>
            <Text style={s.heading}>SELECT YOUR EVENT</Text>
            <Text style={s.subtitle}>TAP YOUR FESTIVAL // OFFLINE DATA LOADS</Text>
          </View>
          <View style={s.offlineBadge}>
            <BlinkDot />
            <Text style={s.offlineText}>READY</Text>
          </View>
        </View>

        {/* ── Filter chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterRow}
          style={s.filterScroll}
        >
          {FILTERS.map((f) => {
            const active = activeFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[
                  s.chip,
                  active
                    ? {
                        borderColor: Colors.cyan,
                        backgroundColor: 'rgba(0,245,255,0.08)',
                      }
                    : {
                        borderColor: 'rgba(0,245,255,0.18)',
                        backgroundColor: 'transparent',
                      },
                ]}
                onPress={() => setActiveFilter(f.key)}
              >
                <Text
                  style={[
                    s.chipText,
                    { color: active ? Colors.cyan : Colors.dim },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Festival grid ── */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          numColumns={2}
          columnWrapperStyle={s.columnWrapper}
          contentContainerStyle={s.gridContent}
          showsVerticalScrollIndicator={false}
        />

        {/* ── ENTER FESTIVAL button ── */}
        <View style={s.enterWrap}>
          <TouchableOpacity
            style={[
              s.enterBtn,
              !pendingFestival && s.enterBtnDisabled,
            ]}
            onPress={handleEnter}
            disabled={!pendingFestival || entering}
            activeOpacity={0.8}
          >
            {entering ? (
              <ActivityIndicator color={Colors.cyan} size="small" />
            ) : (
              <Text
                style={[
                  s.enterText,
                  !pendingFestival && s.enterTextDisabled,
                ]}
              >
                ⚡ ENTER FESTIVAL // LOAD OFFLINE PACK
              </Text>
            )}
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

export default FestivalSelectScreen;

// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scanlines: {
    // Repeating effect simulated via gradient — actual repeat handled by opacity layers
    opacity: 0.6,
  },
  safe: {
    flex: 1,
  },

  // ── Header ──────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTextBlock: {
    flex: 1,
    marginRight: 12,
  },
  heading: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 16,
    letterSpacing: 4,
    color: '#00FFCC',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 9,
    letterSpacing: 2,
    color: Colors.dim,
    textTransform: 'uppercase',
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.3)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,255,136,0.05)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
  },
  offlineText: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 9,
    letterSpacing: 2,
    color: Colors.green,
    textTransform: 'uppercase',
  },

  // ── Filter chips ─────────────────────────────────────────────
  filterScroll: {
    maxHeight: 44,
    marginBottom: 12,
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // ── Grid ─────────────────────────────────────────────────────
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  columnWrapper: {
    gap: 16,
    marginBottom: 16,
  },

  // ── Festival card ────────────────────────────────────────────
  card: {
    width: CARD_W,
    backgroundColor: 'rgba(0,245,255,0.03)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    overflow: 'hidden',
    minHeight: 160,
  },
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 12,
    fontFamily: 'Orbitron_700Bold',
  },
  cardEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardName: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 11,
    letterSpacing: 2,
    color: '#ffffff',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  cardDates: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 9,
    color: Colors.dim,
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardLocation: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 9,
    color: Colors.dim,
    letterSpacing: 1,
    marginBottom: 8,
  },
  cardCapacity: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 10,
    letterSpacing: 1,
  },

  // ── Enter button ─────────────────────────────────────────────
  enterWrap: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },
  enterBtn: {
    borderWidth: 1,
    borderColor: 'rgba(0,245,255,0.4)',
    borderRadius: 10,
    backgroundColor: 'rgba(0,245,255,0.08)',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  enterBtnDisabled: {
    borderColor: 'rgba(0,245,255,0.12)',
    backgroundColor: 'rgba(0,245,255,0.02)',
  },
  enterText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 11,
    letterSpacing: 3,
    color: Colors.cyan,
    textTransform: 'uppercase',
  },
  enterTextDisabled: {
    color: Colors.dim,
  },
});
