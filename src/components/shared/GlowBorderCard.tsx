import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

interface GlowBorderCardProps {
  children: React.ReactNode;
  color: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  duration?: number;
}

const BORDER_W = 1.5;
const RADIUS   = 22;

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
        {/* Inner radial glow from centre in card color at 8% opacity */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg height="100%" width="100%">
            <Defs>
              <RadialGradient id="glow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor={color} stopOpacity="0.08" />
                <Stop offset="100%" stopColor={color} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#glow)" />
          </Svg>
        </View>

        {/* Top shine line: rgba(255,255,255,0.20) height 1px */}
        <View style={styles.topShine} pointerEvents="none" />

        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: RADIUS,
    overflow: 'hidden',
  },

  // Clips the rotor to the card shape + thin border band
  borderClip: {
    position: 'absolute',
    top:    0,
    left:   0,
    right:  0,
    bottom: 0,
    borderRadius: RADIUS,
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
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
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
  tip: {
    position: 'absolute',
    top:    '25%',
    left:   '44%',
    right:  '44%',
    height: 8,
    borderRadius: 4,
    opacity: 1,
  },

  trail1: {
    position: 'absolute',
    top:    '27%',
    left:   '40%',
    right:  '40%',
    height: 28,
    borderRadius: 3,
    opacity: 0.40,
  },

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
    borderRadius: RADIUS - BORDER_W,
    overflow: 'hidden',
    backgroundColor: 'rgba(3,6,15,0.4)',
  },

  topShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.20)',
    zIndex: 10,
  },
});
