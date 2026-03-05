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
const RADIUS = 24;

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
    inputRange: [0, 1],
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
    overflow: 'hidden',
  },
  borderClip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: RADIUS,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  baseRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    overflow: 'hidden',
  },
  rotor: {
    position: 'absolute',
    width: '200%',
    height: '200%',
    top: '-50%',
    left: '-50%',
    overflow: 'hidden',
  },
  tip: {
    position: 'absolute',
    top: '25%',
    left: '44%',
    right: '44%',
    height: 12,
    borderRadius: 24,
    opacity: 1,
    overflow: 'hidden',
  },
  trail1: {
    position: 'absolute',
    top: '27%',
    left: '38%',
    right: '38%',
    height: 45,
    borderRadius: 24,
    opacity: 0.40,
    overflow: 'hidden',
  },
  trail2: {
    position: 'absolute',
    top: '37%',
    left: '32%',
    right: '32%',
    height: 75,
    borderRadius: 24,
    opacity: 0.10,
    overflow: 'hidden',
  },
  content: {
    position: 'absolute',
    top: BORDER_W,
    left: BORDER_W,
    right: BORDER_W,
    bottom: BORDER_W,
    borderRadius: RADIUS,
    overflow: 'hidden',
    backgroundColor: 'transparent', // Make inherently transparent to allow feature card backdrops
  },
});
