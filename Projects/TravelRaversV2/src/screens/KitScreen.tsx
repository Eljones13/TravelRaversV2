// ============================================================
// TRAVEL RAVERS — KitScreen
// Session 1-B: Tron Glass consistent styling
// Accent: #FF8C00 (Orange) | Module: KIT
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
  Line,
} from 'react-native-svg';
import { GlowBorderCard } from '../components/GlowBorderCard';
import { Colors } from '../constants/colors';

const ACCENT = Colors.module.KIT; // #FF8C00

// ── Navigation type ──
type KitScreenProps = {
  navigation: { goBack: () => void };
};

// ── Inline SVG icon ──
const IconKit: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="8" width="16" height="13" rx="1" stroke={color} strokeWidth="1.5" />
    <Rect x="8" y="5" width="8" height="3" rx="1" stroke={color} strokeWidth="1.2" />
    <Rect x="11" y="8" width="2" height="5" fill={color} opacity="0.6" />
    <Rect x="8" y="13" width="8" height="1.5" fill={color} opacity="0.4" />
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

// ── Data types ──
interface KitItem {
  id: string;
  name: string;
  packed: boolean;
  priority: 'ESSENTIAL' | 'RECOMMENDED' | 'OPTIONAL';
}

interface KitCategory {
  id: string;
  label: string;
  icon: string;
  items: KitItem[];
}

// ── Placeholder packing list data ──
const KIT_CATEGORIES: KitCategory[] = [
  {
    id: 'shelter',
    label: 'SHELTER',
    icon: '⛺',
    items: [
      { id: 'sh1', name: 'TENT (WITH PEGS)', packed: false, priority: 'ESSENTIAL' },
      { id: 'sh2', name: 'SLEEPING BAG', packed: false, priority: 'ESSENTIAL' },
      { id: 'sh3', name: 'SLEEPING MAT', packed: false, priority: 'RECOMMENDED' },
      { id: 'sh4', name: 'TARP / CANOPY', packed: false, priority: 'OPTIONAL' },
    ],
  },
  {
    id: 'clothing',
    label: 'CLOTHING',
    icon: '👕',
    items: [
      { id: 'cl1', name: 'WATERPROOF JACKET', packed: false, priority: 'ESSENTIAL' },
      { id: 'cl2', name: 'WELLIES / BOOTS', packed: false, priority: 'ESSENTIAL' },
      { id: 'cl3', name: 'WARM LAYERS (×3)', packed: false, priority: 'ESSENTIAL' },
      { id: 'cl4', name: 'FESTIVAL OUTFIT', packed: false, priority: 'RECOMMENDED' },
      { id: 'cl5', name: 'SOCKS (×5 PAIRS)', packed: false, priority: 'RECOMMENDED' },
    ],
  },
  {
    id: 'essentials',
    label: 'ESSENTIALS',
    icon: '🔑',
    items: [
      { id: 'es1', name: 'PHONE + CHARGER', packed: false, priority: 'ESSENTIAL' },
      { id: 'es2', name: 'POWER BANK', packed: false, priority: 'ESSENTIAL' },
      { id: 'es3', name: 'CASH (£100+)', packed: false, priority: 'ESSENTIAL' },
      { id: 'es4', name: 'WRISTBAND / TICKET', packed: false, priority: 'ESSENTIAL' },
      { id: 'es5', name: 'ID / PASSPORT', packed: false, priority: 'ESSENTIAL' },
    ],
  },
  {
    id: 'hygiene',
    label: 'HYGIENE',
    icon: '🧴',
    items: [
      { id: 'hy1', name: 'DRY SHAMPOO', packed: false, priority: 'RECOMMENDED' },
      { id: 'hy2', name: 'WET WIPES (×2 PACKS)', packed: false, priority: 'ESSENTIAL' },
      { id: 'hy3', name: 'SUN CREAM SPF50', packed: false, priority: 'ESSENTIAL' },
      { id: 'hy4', name: 'INSECT REPELLENT', packed: false, priority: 'RECOMMENDED' },
    ],
  },
];

const PRIORITY_COLORS: Record<string, string> = {
  ESSENTIAL: Colors.module.SOS,       // Red
  RECOMMENDED: Colors.module.TIMETABLE, // Amber
  OPTIONAL: Colors.dim,
};

export const KitScreen: React.FC<KitScreenProps> = ({ navigation }) => {
  // Track packed state per item id
  const [packed, setPacked] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>('shelter');

  const togglePacked = (itemId: string) => {
    setPacked((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Calculate overall progress
  const allItems = KIT_CATEGORIES.flatMap((c) => c.items);
  const packedCount = allItems.filter((i) => packed[i.id]).length;
  const totalCount = allItems.length;
  const progressPct = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const activeCat = KIT_CATEGORIES.find((c) => c.id === activeCategory) ?? KIT_CATEGORIES[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* ── Dot grid background overlay ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern id="dotGridK" width="44" height="44" patternUnits="userSpaceOnUse">
              <Circle cx="1" cy="1" r="0.5" fill="rgba(0,245,255,0.08)" />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#dotGridK)" />
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
          <IconKit size={18} color={ACCENT} />
          <Text style={[styles.headerTitle, { color: ACCENT }]}>
            KIT
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerSub}>PACKING LIST</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Progress card ── */}
        <GlowBorderCard accentColor={ACCENT} style={styles.progressCard}>
          <View style={styles.progressRow}>
            <View>
              <Text style={styles.progressLabel}>PACKING PROGRESS</Text>
              <Text style={[styles.progressPct, { color: ACCENT }]}>{progressPct}%</Text>
              <Text style={styles.progressSub}>{packedCount} OF {totalCount} ITEMS PACKED</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarTrack, { borderColor: ACCENT + '44' }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    { backgroundColor: ACCENT, width: `${progressPct}%` as `${number}%` },
                  ]}
                />
              </View>
              <View style={styles.progressMarkers}>
                {[0, 25, 50, 75, 100].map((mark) => (
                  <Text key={mark} style={styles.progressMarker}>{mark}</Text>
                ))}
              </View>
            </View>
          </View>
          <CornerBrackets color={ACCENT} />
        </GlowBorderCard>

        {/* ── Category tabs ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
          style={styles.tabRow}
        >
          {KIT_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const catItems = cat.items;
            const catPacked = catItems.filter((i) => packed[i.id]).length;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                style={[
                  styles.tabChip,
                  isActive && {
                    backgroundColor: ACCENT + '22',
                    borderColor: ACCENT + '88',
                  },
                ]}
              >
                <Text style={styles.tabIcon}>{cat.icon}</Text>
                <Text style={[styles.tabText, { color: isActive ? ACCENT : Colors.dim }]}>
                  {cat.label}
                </Text>
                <Text style={[styles.tabCount, { color: isActive ? ACCENT : Colors.dim }]}>
                  {catPacked}/{catItems.length}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Section label ── */}
        <View style={styles.sectionRow}>
          <View style={[styles.sectionLine, { backgroundColor: ACCENT }]} />
          <Text style={[styles.sectionLabel, { color: ACCENT }]}>
            {activeCat.icon} {activeCat.label}
          </Text>
          <View style={[styles.sectionLine, { backgroundColor: ACCENT }]} />
        </View>

        {/* ── Item checklist ── */}
        {activeCat.items.map((item) => {
          const isPacked = packed[item.id] ?? false;
          const priorityColor = PRIORITY_COLORS[item.priority] ?? Colors.dim;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => togglePacked(item.id)}
              activeOpacity={0.75}
              style={styles.itemWrapper}
            >
              <View
                style={[
                  styles.itemRow,
                  isPacked && { opacity: 0.45 },
                ]}
              >
                {/* Checkbox */}
                <View style={[styles.checkbox, { borderColor: ACCENT + '88' }]}>
                  {isPacked && (
                    <Svg width={10} height={10} viewBox="0 0 12 12" fill="none">
                      <Polygon points="2,6 5,9 10,3" stroke={ACCENT} strokeWidth="2" fill="none" />
                    </Svg>
                  )}
                </View>
                {/* Text */}
                <View style={styles.itemText}>
                  <Text
                    style={[
                      styles.itemName,
                      isPacked
                        ? { color: Colors.dim, textDecorationLine: 'line-through' }
                        : { color: Colors.text },
                    ]}
                  >
                    {item.name}
                  </Text>
                </View>
                {/* Priority badge */}
                <View style={[styles.priorityBadge, { borderColor: priorityColor + '55' }]}>
                  <Text style={[styles.priorityText, { color: priorityColor }]}>
                    {item.priority}
                  </Text>
                </View>
              </View>
              <CornerBrackets color={isPacked ? Colors.dim : ACCENT} />
            </TouchableOpacity>
          );
        })}

        {/* ── Weather alert card (smart kit tip) ── */}
        <GlowBorderCard accentColor={Colors.module.MAP} style={styles.weatherTipCard}>
          <View style={styles.weatherTipRow}>
            <Text style={[styles.weatherTipIcon, { color: Colors.module.MAP }]}>☂</Text>
            <View style={styles.weatherTipText}>
              <Text style={[styles.weatherTipTitle, { color: Colors.module.MAP }]}>
                RAIN FORECAST
              </Text>
              <Text style={styles.weatherTipBody}>
                70% RAIN ON SATURDAY · WELLIES ADDED TO YOUR ESSENTIALS
              </Text>
            </View>
          </View>
          <CornerBrackets color={Colors.module.MAP} />
        </GlowBorderCard>

        {/* ── Scan line ── */}
        <View style={styles.scanLine}>
          <Svg width="100%" height="2">
            <Line x1="0" y1="1" x2="100%" y2="1" stroke={ACCENT} strokeWidth="0.5" strokeOpacity="0.3" />
          </Svg>
        </View>

        <Text style={styles.footerNote}>
          SESSION 1-B — TRON GLASS KIT SCREEN COMPLETE
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

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40, paddingTop: 8 },

  // Progress card
  progressCard: { marginTop: 8 },
  progressRow: { gap: 12 },
  progressLabel: {
    color: Colors.dim,
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  progressPct: { fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  progressSub: { color: Colors.dim, fontSize: 9, letterSpacing: 1, marginTop: 2 },
  progressBarContainer: { marginTop: 8 },
  progressBarTrack: {
    height: 6,
    borderWidth: 1,
    borderRadius: 3,
    backgroundColor: 'rgba(6,16,36,0.8)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    ...Platform.select({
      web: { boxShadow: `0px 0px 4px ${ACCENT}` } as any,
      default: { shadowColor: ACCENT, shadowOffset: { width: 0, height: 0 }, shadowRadius: 4, shadowOpacity: 0.8 }
    }),
    elevation: 4,
  },
  progressMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressMarker: { color: Colors.dim, fontSize: 7, letterSpacing: 1 },

  // Category tabs
  tabRow: { marginTop: 12 },
  tabScroll: { paddingHorizontal: 16, gap: 8 },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,200,220,0.2)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(6,16,36,0.6)',
  },
  tabIcon: { fontSize: 12 },
  tabText: { fontSize: 9, letterSpacing: 2, fontWeight: '700', textTransform: 'uppercase' },
  tabCount: { fontSize: 9, letterSpacing: 1 },

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

  // Checklist items
  itemWrapper: { marginHorizontal: 16, marginBottom: 6, position: 'relative' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6,16,36,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(0,200,220,0.2)',
    borderRadius: 10,
    padding: 12,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6,16,36,0.6)',
  },
  itemText: { flex: 1 },
  itemName: { fontSize: 11, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase' },
  priorityBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  priorityText: { fontSize: 7, fontWeight: '700', letterSpacing: 1 },

  // Weather tip card
  weatherTipCard: {},
  weatherTipRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  weatherTipIcon: { fontSize: 24 },
  weatherTipText: { flex: 1 },
  weatherTipTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  weatherTipBody: { color: Colors.dim, fontSize: 10, letterSpacing: 1, marginTop: 3, lineHeight: 15 },

  // Scan line + footer
  scanLine: { marginHorizontal: 16, marginTop: 8, marginBottom: 8 },
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
