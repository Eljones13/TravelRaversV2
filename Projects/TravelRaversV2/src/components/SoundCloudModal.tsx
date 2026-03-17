// ============================================================
// TRAVEL RAVERS — SoundCloudModal
// Full-screen slide-up modal with SoundCloud WebView embed.
// Triggered from MiniPlayerBar tap.
// Accent: #FF2D78 (hot pink)
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useMusic } from '../context/MusicContext';

const ACCENT = Colors.module.PIXELPARTY; // '#FF2D78'

const SOUNDCLOUD_EMBED_URL =
  'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/travel-ravers' +
  '&color=%23FF2D78&auto_play=false&hide_related=false&show_comments=false' +
  '&show_user=true&show_reposts=false&show_teaser=true&visual=true';

// ── Helpers ───────────────────────────────────────────────────
function glow(color: string, r = 10) {
  return Platform.select({
    web:     { boxShadow: `0 0 ${r}px ${color}` } as object,
    default: { shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowRadius: r, shadowOpacity: 0.9 },
  })!;
}

// ── Animated equaliser (5 bars) ───────────────────────────────
const EqVisualiser: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  const bars = [
    useRef(new Animated.Value(8)).current,
    useRef(new Animated.Value(18)).current,
    useRef(new Animated.Value(12)).current,
    useRef(new Animated.Value(22)).current,
    useRef(new Animated.Value(10)).current,
  ];
  const SPEEDS = [320, 480, 260, 380, 440];
  const MAXES  = [20, 36, 28, 40, 24];
  const loops  = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    loops.current.forEach(l => l.stop());
    loops.current = [];
    if (!isPlaying) {
      bars.forEach((b, i) => {
        Animated.timing(b, { toValue: MAXES[i]! * 0.25, duration: 200, useNativeDriver: false }).start();
      });
      return;
    }
    bars.forEach((bar, i) => {
      const l = Animated.loop(
        Animated.sequence([
          Animated.timing(bar, { toValue: MAXES[i]!,        duration: SPEEDS[i]!, useNativeDriver: false }),
          Animated.timing(bar, { toValue: MAXES[i]! * 0.15, duration: SPEEDS[i]!, useNativeDriver: false }),
        ])
      );
      l.start();
      loops.current.push(l);
    });
    return () => loops.current.forEach(l => l.stop());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  return (
    <View style={s.eqVisualiser}>
      {bars.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            s.eqBar,
            {
              height: anim,
              ...Platform.select({
                web:     { boxShadow: `0 0 6px ${ACCENT}` } as object,
                default: { shadowColor: ACCENT, shadowRadius: 6, shadowOpacity: 0.9, shadowOffset: { width: 0, height: 0 } },
              }),
            },
          ]}
        />
      ))}
    </View>
  );
};

// ── SoundCloudModal ───────────────────────────────────────────
type Props = {
  visible: boolean;
  onClose: () => void;
};

export const SoundCloudModal: React.FC<Props> = ({ visible, onClose }) => {
  const { isPlaying, currentTrack } = useMusic();
  const [webLoaded, setWebLoaded] = useState(false);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

        {/* Top glow border */}
        <View style={s.topGlow} pointerEvents="none" />

        {/* Drag handle */}
        <View style={s.dragHandle} />

        {/* Header row */}
        <View style={s.headerRow}>
          <Text style={[s.headerTitle, glow(ACCENT, 10)]}>TRAVEL RAVERS // SOUNDS</Text>
          <TouchableOpacity style={s.closeBtn} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={s.closeX}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Equaliser visualiser */}
        <EqVisualiser isPlaying={isPlaying} />

        {/* Now playing info */}
        <View style={s.nowPlayingRow}>
          <Text style={s.nowLabel}>NOW PLAYING</Text>
          <Text style={[s.nowTitle, glow(ACCENT, 6)]} numberOfLines={1}>
            {currentTrack?.title ?? 'TRAVEL RAVERS MIXES'}
          </Text>
        </View>

        {/* SoundCloud WebView embed */}
        <View style={[s.webCard, glow(ACCENT, 10)]}>
          <View style={s.webShine} pointerEvents="none" />
          {Platform.OS === 'web' ? (
            <View style={s.webContainer}>
              {/* @ts-ignore — iframe valid on web */}
              <iframe
                src={SOUNDCLOUD_EMBED_URL}
                style={{
                  width: '100%',
                  height: 300,
                  border: 'none',
                  borderRadius: 8,
                  backgroundColor: '#03060f',
                }}
                allow="autoplay"
                scrolling="no"
              />
            </View>
          ) : (
            <WebView
              source={{ uri: SOUNDCLOUD_EMBED_URL }}
              style={s.webView}
              scrollEnabled={false}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              onLoad={() => setWebLoaded(true)}
              onLoadStart={() => setWebLoaded(false)}
              originWhitelist={['*']}
            />
          )}
          {!webLoaded && Platform.OS !== 'web' && (
            <View style={s.webLoading}>
              <Text style={s.webLoadingText}>LOADING SOUNDCLOUD...</Text>
            </View>
          )}
        </View>

        {/* Volume hint */}
        <Text style={s.hint}>
          USE WIDGET CONTROLS FOR FULL PLAYBACK · AUDIO PLAYS IN BACKGROUND
        </Text>

        {/* Spotify coming soon */}
        {/* TODO: Replace SoundCloud embed with Spotify Web Playback SDK once tracks are released */}
        <TouchableOpacity
          style={s.spotifyBtn}
          onPress={() =>
            Alert.alert(
              'SPOTIFY COMING SOON',
              'Travel Ravers releases coming to Spotify soon! Follow us to be notified.',
            )
          }
          activeOpacity={0.7}
        >
          <Text style={s.spotifyText}>SPOTIFY COMING SOON</Text>
        </TouchableOpacity>

      </SafeAreaView>
    </Modal>
  );
};

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'rgba(3,6,15,0.98)',
    paddingHorizontal: 16,
  },

  topGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,45,120,0.4)',
  },

  dragHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dim + '66',
    marginTop: 12,
    marginBottom: 8,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  headerTitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 14,
    color: ACCENT,
    letterSpacing: 3,
    textTransform: 'uppercase',
    flex: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dim + '55',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexShrink: 0,
  },
  closeX: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 12,
    color: Colors.dim,
  },

  // Equaliser
  eqVisualiser: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    height: 44,
    alignSelf: 'center',
    marginBottom: 16,
  },
  eqBar: {
    width: 5,
    borderRadius: 2.5,
    backgroundColor: ACCENT,
  },

  // Now playing
  nowPlayingRow: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
  },
  nowLabel: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 8,
    color: Colors.dim,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  nowTitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 14,
    color: '#ffffff',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  // WebView
  webCard: {
    position: 'relative',
    backgroundColor: '#03060f',
    borderWidth: 1.5,
    borderColor: ACCENT + '55',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
  },
  webShine: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.06)',
    zIndex: 1,
  },
  webContainer: {
    width: '100%',
    height: 300,
    overflow: 'hidden',
  },
  webView: {
    height: 300,
    backgroundColor: '#03060f',
  },
  webLoading: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#03060f',
  },
  webLoadingText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 10,
    color: ACCENT,
    letterSpacing: 3,
  },

  hint: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 8,
    color: Colors.dim,
    letterSpacing: 1.5,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 20,
  },

  spotifyBtn: {
    borderWidth: 1,
    borderColor: Colors.dim + '44',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  spotifyText: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 10,
    color: Colors.dim,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
