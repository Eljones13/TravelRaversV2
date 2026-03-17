// ============================================================
// TRAVEL RAVERS — ArtistBioModal
// Bottom sheet modal with artist bio, set info, fave toggle.
// Slide-up via Animated.spring, swipe-down via PanResponder.
// ============================================================

import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  PanResponder,
  Animated,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { type Artist, type Festival } from '../data/festivals';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_H = Math.min(SCREEN_H * 0.82, 680);

// ── Bullet point generator ────────────────────────────────────
function getBullets(artist: Artist): string[] {
  const g = artist.genre.toLowerCase();
  const b = artist.bio.toLowerCase();
  const bullets: string[] = [];

  if (b.includes('relentless') || b.includes('ferocious') || b.includes('brutal') || b.includes('intense'))
    bullets.push('Relentless, uncompromising energy');
  else if (b.includes('euphoric') || b.includes('emotional') || b.includes('beauty') || b.includes('profound'))
    bullets.push('Emotional, euphoric journey');
  else if (b.includes('hypnotic') || b.includes('trance') || b.includes('meditative') || b.includes('patient'))
    bullets.push('Hypnotic, trance-inducing sets');
  else if (b.includes('party') || b.includes('fun') || b.includes('joy') || b.includes('sweat'))
    bullets.push('Pure dance floor joy');
  else
    bullets.push('High-energy festival performance');

  if (g.includes('techno'))
    bullets.push('Hard-hitting techno machinery');
  else if (g.includes('house'))
    bullets.push('Deep, soulful house grooves');
  else if (g.includes('drum') || g.includes('bass'))
    bullets.push('Thundering bass and drum drops');
  else if (g.includes('reggae') || g.includes('soca') || g.includes('dancehall'))
    bullets.push('Authentic sound system culture');
  else if (g.includes('rock') || g.includes('indie'))
    bullets.push('Guitar-driven anthems and hooks');
  else if (g.includes('pop'))
    bullets.push('Massive pop crossover moments');
  else if (g.includes('ambient') || g.includes('idm'))
    bullets.push('Otherworldly sonic landscapes');
  else
    bullets.push(`${artist.genre} masterclass`);

  if (artist.origin === 'United Kingdom' || artist.origin === 'Northern Ireland')
    bullets.push('UK underground royalty');
  else if (artist.origin === 'Belgium')
    bullets.push('Belgian techno excellence');
  else if (artist.origin === 'Sweden')
    bullets.push('Scandinavian electronic precision');
  else if (artist.origin === 'Russia')
    bullets.push('Eastern European club intensity');
  else if (artist.origin === 'Germany')
    bullets.push('Berlin underground sound');
  else if (artist.origin === 'Italy')
    bullets.push('Mediterranean musical depth');
  else
    bullets.push(`${artist.origin} — world-class sound`);

  return bullets;
}

// ── Props ─────────────────────────────────────────────────────
type Props = {
  visible: boolean;
  artist: Artist | null;
  festival: Festival | null;
  isFaved: boolean;
  onToggleFave: () => void;
  onClose: () => void;
};

export const ArtistBioModal: React.FC<Props> = ({
  visible,
  artist,
  festival,
  isFaved,
  onToggleFave,
  onClose,
}) => {
  const slideAnim = useRef(new Animated.Value(SHEET_H)).current;
  const panY = useRef(new Animated.Value(0)).current;

  // Slide up when visible
  useEffect(() => {
    if (visible) {
      panY.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SHEET_H,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim, panY]);

  const triggerClose = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: SHEET_H,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
  }, [slideAnim, onClose]);

  // PanResponder for swipe-down to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 8,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) panY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80 || g.vy > 1.2) {
          triggerClose();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  if (!artist || !festival) return null;

  const stageDef = festival.stages.find((s) => s.id === artist.stage);
  const stageColor = stageDef?.color ?? Colors.cyan;
  const bullets = getBullets(artist);

  const shadowGlowStyle: object = Platform.OS === 'web'
    ? { boxShadow: `0 0 30px ${artist.accentColor}33` } as object
    : {
        shadowColor: artist.accentColor,
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 20,
        shadowOpacity: 0.25,
        elevation: 24,
      };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={triggerClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={s.backdrop}
        activeOpacity={1}
        onPress={triggerClose}
      />

      {/* Sheet */}
      <Animated.View
        style={[
          s.sheet,
          shadowGlowStyle,
          { transform: [{ translateY: Animated.add(slideAnim, panY) }] },
        ]}
      >
        {/* Accent top bar */}
        <View style={[s.accentBar, { backgroundColor: artist.accentColor }]} />

        {/* Drag handle */}
        <View {...panResponder.panHandlers} style={s.handleArea}>
          <View style={s.handle} />
        </View>

        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          scrollEnabled
        >
          {/* Artist name */}
          <Text style={s.artistName}>{artist.name}</Text>

          {/* Tag row: genre + origin */}
          <View style={s.tagRow}>
            <View style={[s.tag, { borderColor: artist.accentColor + '66', backgroundColor: artist.accentColor + '18' }]}>
              <Text style={[s.tagText, { color: artist.accentColor }]}>{artist.genre.toUpperCase()}</Text>
            </View>
            <View style={[s.tag, { borderColor: Colors.dim + '44' }]}>
              <Text style={[s.tagText, { color: Colors.dim }]}>{artist.origin.toUpperCase()}</Text>
            </View>
          </View>

          {/* Bio */}
          <Text style={s.bio}>{artist.bio}</Text>

          {/* WHAT TO EXPECT */}
          <Text style={[s.sectionHeader, { color: Colors.module.TIMETABLE }]}>WHAT TO EXPECT</Text>
          {bullets.map((b, i) => (
            <View key={i} style={s.bulletRow}>
              <View style={[s.bulletDot, { backgroundColor: artist.accentColor }]} />
              <Text style={s.bulletText}>{b}</Text>
            </View>
          ))}

          {/* Set info row */}
          <View style={[s.setInfoRow, { borderColor: stageColor + '33', backgroundColor: stageColor + '0A' }]}>
            <View style={[s.setInfoItem, { borderRightWidth: 1, borderRightColor: stageColor + '22' }]}>
              <Text style={[s.setInfoLabel, { color: stageColor }]}>STAGE</Text>
              <Text style={s.setInfoValue}>{stageDef?.name ?? artist.stage}</Text>
            </View>
            <View style={[s.setInfoItem, { borderRightWidth: 1, borderRightColor: stageColor + '22' }]}>
              <Text style={[s.setInfoLabel, { color: stageColor }]}>DAY</Text>
              <Text style={s.setInfoValue}>{artist.day.toUpperCase().slice(0, 3)}</Text>
            </View>
            <View style={s.setInfoItem}>
              <Text style={[s.setInfoLabel, { color: stageColor }]}>TIME</Text>
              <Text style={s.setInfoValue}>{artist.startTime} – {artist.endTime}</Text>
            </View>
          </View>

          {/* Fave toggle */}
          <TouchableOpacity
            style={[
              s.faveBtn,
              {
                borderColor: isFaved ? artist.accentColor + '88' : Colors.dim + '44',
                backgroundColor: isFaved ? artist.accentColor + '18' : 'transparent',
              },
            ]}
            onPress={onToggleFave}
            activeOpacity={0.75}
          >
            <Text style={[s.faveBtnText, { color: isFaved ? artist.accentColor : Colors.dim }]}>
              {isFaved ? '★  UNFAVE THIS SET' : '☆  ADD TO MY FAVES'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

export default ArtistBioModal;

// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_H,
    backgroundColor: 'rgba(3,6,15,0.97)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  accentBar: {
    height: 3,
    width: '100%',
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  artistName: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 22,
    color: '#ffffff',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  tag: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 8,
    letterSpacing: 1.5,
  },
  bio: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 10,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  bulletText: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 11,
    color: Colors.text,
    flex: 1,
  },
  setInfoRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 24,
    marginBottom: 20,
    overflow: 'hidden',
  },
  setInfoItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  setInfoLabel: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 8,
    letterSpacing: 2,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  setInfoValue: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 10,
    color: '#ffffff',
    letterSpacing: 1,
  },
  faveBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  faveBtnText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
