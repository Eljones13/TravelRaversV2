// ============================================================
// TRAVEL RAVERS — TrackScreen (Stub)
// Session 1-C: Added as primary module — full build in Session 3-A
// TrackHunter: hold to record, ACRCloud identifies the track
// Accent: Violet (#A855F7)
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Circle } from 'react-native-svg';
import { GlowBorderCard } from '../components/GlowBorderCard';
import { Colors } from '../constants/colors';

type TrackScreenProps = {
  navigation: { goBack: () => void };
};

const BackIcon: React.FC = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="11.5" width="14" height="1.5" fill={Colors.module.TRACK} opacity="0.8" />
    <Rect x="5" y="11.5" width="6" height="1.5" fill={Colors.module.TRACK} transform="rotate(-45 5 11.5)" />
    <Rect x="5" y="13" width="6" height="1.5" fill={Colors.module.TRACK} transform="rotate(45 5 13)" />
  </Svg>
);

export const TrackScreen: React.FC<TrackScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={styles.backBtn}
            // @ts-ignore — TouchableOpacity used in full build; pressable stub here
            onTouchEnd={() => navigation.goBack()}
          >
            <BackIcon />
          </View>
          <View>
            <Text style={styles.screenIcon}>🎵</Text>
          </View>
        </View>
        <View>
          <Text style={styles.title}>TRACK HUNTER</Text>
          <Text style={styles.subtitle}>ID That Track</Text>
        </View>
      </View>

      {/* ── Coming Soon Card ── */}
      <View style={styles.body}>
        <GlowBorderCard accentColor={Colors.module.TRACK}>
          <View style={styles.comingSoonContent}>
            {/* Radar scan animation placeholder */}
            <View style={styles.scanCircleOuter}>
              <View style={styles.scanCircleMid}>
                <View style={styles.scanCircleInner}>
                  <Circle cx="0" cy="0" r="0" fill="none" />
                </View>
              </View>
            </View>

            <Text style={styles.comingSoonLabel}>COMING IN PHASE 3</Text>
            <Text style={styles.comingSoonTitle}>TRACK HUNTER</Text>
            <Text style={styles.comingSoonDesc}>
              Hold to record 8 seconds of audio.{'\n'}
              ACRCloud identifies the track.{'\n'}
              Save to your festival setlist.{'\n'}
              Export to Spotify playlist.
            </Text>

            {/* Feature chips */}
            <View style={styles.featureRow}>
              {['RECORD', 'IDENTIFY', 'SAVE', 'EXPORT'].map((f) => (
                <View key={f} style={styles.featureChip}>
                  <Text style={styles.featureChipText}>{f}</Text>
                </View>
              ))}
            </View>
          </View>
        </GlowBorderCard>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.module.TRACK}22`,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${Colors.module.TRACK}44`,
    backgroundColor: `${Colors.module.TRACK}11`,
  },
  screenIcon: {
    fontSize: 20,
  },
  title: {
    color: Colors.module.TRACK,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    ...Platform.select({
      web: { textShadow: `0px 0px 8px ${Colors.module.TRACK}` } as any,
      default: { textShadowColor: Colors.module.TRACK, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 }
    }),
    textAlign: 'right',
  },
  subtitle: {
    color: Colors.dim,
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 2,
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  body: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  comingSoonContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  scanCircleOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: `${Colors.module.TRACK}33`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  scanCircleMid: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: `${Colors.module.TRACK}55`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanCircleInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.module.TRACK}22`,
    borderWidth: 1,
    borderColor: Colors.module.TRACK,
  },
  comingSoonLabel: {
    color: Colors.dim,
    fontSize: 9,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  comingSoonTitle: {
    color: Colors.module.TRACK,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 4,
    textTransform: 'uppercase',
    ...Platform.select({
      web: { textShadow: `0px 0px 12px ${Colors.module.TRACK}` } as any,
      default: { textShadowColor: Colors.module.TRACK, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12 }
    }),
    marginBottom: 16,
  },
  comingSoonDesc: {
    color: Colors.text,
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featureChip: {
    backgroundColor: `${Colors.module.TRACK}18`,
    borderWidth: 1,
    borderColor: `${Colors.module.TRACK}44`,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  featureChipText: {
    color: Colors.module.TRACK,
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: '600',
  },
});
