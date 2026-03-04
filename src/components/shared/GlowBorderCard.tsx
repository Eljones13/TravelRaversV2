import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface GlowBorderCardProps {
  children: React.ReactNode;
  color: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  duration?: number;
}

const BORDER_W = 1.5;
const RADIUS   = 24;

// ─── How it works ─────────────────────────────────────────────────────────────
//
//  [outer]  position:relative, borderRadius 24
//    [borderClip]  absolute, inset -1.5, borderRadius 25.5, overflow:hidden
//                  shows a dim base ring at rest
//      [rotor]  Animated, 200%×200%, centered (-50%,-50%), rotates
//               A narrow beam at 'top: 25%' aligns with the card's top edge.
//               Three strips (tip → trail → fade) span ~90° of arc.
//    [content]  absolute, inset +1.5, borderRadius 24, overflow:hidden
//               solid bg covers the rotor's interior — only the thin ring
//               between borderClip and content is visible.
//               Children render here.
//
// ─────────────────────────────────────────────────────────────────────────────

export default function GlowBorderCard({
  children,
  color,
  style,
  contentStyle,
  duration = 3000,
}: GlowBorderCardProps) {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      })
    ).start();
  }, [spinAnim, duration]);

  const rotate = spinAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.outer, style]}>
      {/* ── Border clip layer ── */}
      <View style={styles.borderClip}>
        {/* Dim base ring */}
        <View style={[styles.baseRing, { borderColor: color + '22' }]} pointerEvents="none" />

        {/* Rotating beam */}
        <Animated.View style={[styles.rotor, { transform: [{ rotate }] }]}>
          {/* Tip — full opacity, tight spot, strong glow */}
          <View style={[
            styles.tip,
            {
              backgroundColor: color,
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 20,
              shadowOpacity: 1,
              elevation: 8,
            },
          ]} />
          {/* Trail segment 1 — 90° arc, fades to 40% */}
          <View style={[styles.trail1, { backgroundColor: color }]} />
          {/* Trail segment 2 — fades to 12% */}
          <View style={[styles.trail2, { backgroundColor: color }]} />
        </Animated.View>
      </View>

      {/* ── Content layer — covers interior, reveals border ring ── */}
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: RADIUS,
  },

  // Clips the rotor to the card shape + thin border band
  borderClip: {
    position: 'absolute',
    top:    -BORDER_W,
    left:   -BORDER_W,
    right:  -BORDER_W,
    bottom: -BORDER_W,
    borderRadius: RADIUS + BORDER_W,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  // Very dim ring visible when the ray isn't passing
  baseRing: {
    position: 'absolute',
    top:    0,
    left:   0,
    right:  0,
    bottom: 0,
    borderRadius: RADIUS + BORDER_W,
    borderWidth: 1,
  },

  // 200%×200%, centered — rotation happens around its center (= card center)
  rotor: {
    position: 'absolute',
    width:  '200%',
    height: '200%',
    top:  '-50%',
    left: '-50%',
  },

  // ── Beam segments ──
  // top: '25%' places the strip at the card's top border in rotor coordinates.
  // left/right '44%' each → beam is ~12% of rotor width (≈ 20px) centered.

  // Tip: bright, narrow, short — the leading bright dot
  tip: {
    position: 'absolute',
    top:    '25%',
    left:   '44%',
    right:  '44%',
    height: 8,
    borderRadius: 4,
    opacity: 1,
  },

  // Trail 1: widens and fades — covers ~45° arc
  trail1: {
    position: 'absolute',
    top:    '27%',
    left:   '40%',
    right:  '40%',
    height: 28,
    borderRadius: 3,
    opacity: 0.40,
  },

  // Trail 2: wider, very dim — covers remaining ~45° arc (total ~90°)
  trail2: {
    position: 'absolute',
    top:    '37%',
    left:   '34%',
    right:  '34%',
    height: 36,
    borderRadius: 3,
    opacity: 0.10,
  },

  // Content sits on top, inset by BORDER_W to reveal the thin border ring
  content: {
    position: 'absolute',
    top:    BORDER_W,
    left:   BORDER_W,
    right:  BORDER_W,
    bottom: BORDER_W,
    borderRadius: RADIUS,
    overflow: 'hidden',
    backgroundColor: 'rgba(2,6,16,0.92)',
  },
});
