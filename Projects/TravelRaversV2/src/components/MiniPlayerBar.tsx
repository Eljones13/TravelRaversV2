// ============================================================
// TRAVEL RAVERS — MiniPlayerBar
// Persistent thin bar sitting ABOVE the bottom tab bar.
// Only visible when a track is loaded (currentTrack !== null).
// Tap anywhere → opens SoundCloudModal.
// Play/Pause button → toggles isPlaying (context only).
// Accent: #FF2D78 (hot pink / PIXELPARTY module colour)
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { useMusic } from '../context/MusicContext';
import { SoundCloudModal } from './SoundCloudModal';
import { Colors } from '../constants/colors';

const ACCENT = Colors.module.PIXELPARTY; // '#FF2D78'
const BAR_H  = 56;

// ── Equaliser bar component ───────────────────────────────────
const EqBar: React.FC<{ height: number; delay: number; isPlaying: boolean }> = ({
  height,
  delay,
  isPlaying,
}) => {
  const anim = useRef(new Animated.Value(height * 0.3)).current;
  const loop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isPlaying) {
      loop.current = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: height,       duration: 180, useNativeDriver: false }),
          Animated.timing(anim, { toValue: height * 0.2, duration: 260, useNativeDriver: false }),
          Animated.timing(anim, { toValue: height * 0.7, duration: 200, useNativeDriver: false }),
          Animated.timing(anim, { toValue: height * 0.1, duration: 220, useNativeDriver: false }),
        ])
      );
      loop.current.start();
    } else {
      loop.current?.stop();
      loop.current = null;
      Animated.timing(anim, { toValue: height * 0.3, duration: 150, useNativeDriver: false }).start();
    }
    return () => { loop.current?.stop(); loop.current = null; };
  }, [isPlaying, anim, height, delay]);

  return (
    <Animated.View
      style={{
        width: 3,
        height: anim,
        borderRadius: 1.5,
        backgroundColor: ACCENT,
        alignSelf: 'flex-end',
        ...Platform.select({
          web:     { boxShadow: `0 0 4px ${ACCENT}` } as object,
          default: { shadowColor: ACCENT, shadowRadius: 4, shadowOpacity: 0.8, shadowOffset: { width: 0, height: 0 } },
        }),
      }}
    />
  );
};

// ── MiniPlayerBar ─────────────────────────────────────────────
export const MiniPlayerBar: React.FC = () => {
  const { isPlaying, currentTrack, togglePlay } = useMusic();
  const [modalOpen, setModalOpen] = useState(false);

  // Always render — currentTrack is seeded from MusicContext default
  const track = currentTrack ?? { title: 'TRAVEL RAVERS MIXES', artist: 'soundcloud.com/travel-ravers', url: '' };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => setModalOpen(true)}
        style={s.bar}
      >
        {/* Top glow line */}
        <View style={s.glowLine} pointerEvents="none" />

        {/* Equaliser */}
        <View style={s.eqWrap} pointerEvents="none">
          <EqBar height={22} delay={0}   isPlaying={isPlaying} />
          <EqBar height={16} delay={80}  isPlaying={isPlaying} />
          <EqBar height={26} delay={160} isPlaying={isPlaying} />
        </View>

        {/* Track info */}
        <View style={s.info}>
          <Text style={s.title} numberOfLines={1}>{track.title}</Text>
          <Text style={s.artist} numberOfLines={1}>{track.artist}</Text>
        </View>

        {/* Play / Pause */}
        <TouchableOpacity
          style={s.playBtn}
          onPress={(e) => { e.stopPropagation?.(); togglePlay(); }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Text style={s.playSymbol}>{isPlaying ? '▐▐' : '▶'}</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      <SoundCloudModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

const s = StyleSheet.create({
  bar: {
    height: BAR_H,
    minHeight: BAR_H,
    backgroundColor: 'rgba(3,6,15,0.97)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,45,120,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
    zIndex: 100,
    ...Platform.select({
      web:     { boxShadow: `0 -2px 12px rgba(255,45,120,0.12)` } as object,
      default: {
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 8,
        shadowOpacity: 0.18,
        elevation: 20,
      },
    }),
  },

  glowLine: {
    position: 'absolute',
    top: 1,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,45,120,0.15)',
  },

  eqWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 28,
    width: 16,
    flexShrink: 0,
  },

  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 10,
    color: '#ffffff',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  artist: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 8,
    color: ACCENT,
    letterSpacing: 1,
    marginTop: 2,
  },

  playBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: ACCENT + '99',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT + '12',
    flexShrink: 0,
    ...Platform.select({
      web:     { boxShadow: `0 0 8px ${ACCENT}88` } as object,
      default: { shadowColor: ACCENT, shadowRadius: 8, shadowOpacity: 0.5, shadowOffset: { width: 0, height: 0 } },
    }),
  },
  playSymbol: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 9,
    color: ACCENT,
    letterSpacing: 1,
  },
});
