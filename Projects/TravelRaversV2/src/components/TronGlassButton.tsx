// ============================================================
// TRAVEL RAVERS — TronGlassButton Component
// Redesigned to match tron-icons.png reference
// Five-layer visual depth: dark base → diagonal glass gradient
// → neon border glow → top shine scan line → inner radial glow
// Supports 3-column grid layout (default) and 2-column
// ============================================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Rect } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TronGlassButtonProps {
  label: string;
  sublabel: string;
  icon?: React.ReactNode;
  iconSource?: ImageSourcePropType | null;
  buttonSize?: number;
  accentColor: string; // e.g. '#00FFFF'
  onPress: () => void;
  columns?: 2 | 3;   // grid columns — 3 is default (12-module grid)
}

export const TronGlassButton: React.FC<TronGlassButtonProps> = ({
  label,
  sublabel,
  icon,
  iconSource,
  buttonSize: buttonSizeProp,
  accentColor,
  onPress,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.55)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;

  // Platform-specific glow styles
  const outerGlowShadow = Platform.select({
    web: { boxShadow: `0 0 16px ${accentColor}, 0 0 32px ${accentColor}60, inset 0 0 12px ${accentColor}20` } as any,
    default: { shadowColor: accentColor, shadowOffset: { width: 0, height: 0 }, shadowRadius: 16, shadowOpacity: 1, elevation: 14 },
  })!;

  const iconGlowShadow = Platform.select({
    web: { filter: `drop-shadow(0 0 8px ${accentColor})` } as any,
    default: { shadowColor: accentColor, shadowOffset: { width: 0, height: 0 }, shadowRadius: 8, shadowOpacity: 0.95 },
  })!;

  // Pulsing border opacity
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.55, duration: 2200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Scan line sweep animation
  useEffect(() => {
    const scan = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 3500, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(scanAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    scan.start();
    return () => scan.stop();
  }, [scanAnim]);

  // Button dimensions — use passed prop, or default 3-column layout
  const buttonSize = buttonSizeProp ?? (SCREEN_WIDTH - 48) / 3;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.wrapper,
        {
          width: buttonSize,
          height: buttonSize,
        },
      ]}
    >
      {/* LAYER 1: Outer pulsing glow ring */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          styles.outerGlow,
          { borderColor: accentColor, opacity: pulseAnim },
          outerGlowShadow,
        ]}
        pointerEvents="none"
      />

      {/* LAYER 2: Dark glass base with tron-teal tint */}
      <View style={[styles.glassBase, { borderColor: accentColor + '66' }]}>

        {/* LAYER 3a: Background gradient (3D depth from top) */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id={`bgGrad-${label}`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="rgba(255,255,255,0.08)" stopOpacity="1" />
                <Stop offset="40%" stopColor="rgba(255,255,255,0)" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            {/* bg gradient */}
            <Rect x="0" y="0" width="100%" height="100%" fill={`url(#bgGrad-${label})`} />
          </Svg>
        </View>

        {/* LAYER 4: Top glass reflection — 2px white band at top */}
        <View style={styles.topReflection} pointerEvents="none" />

        {/* CONTENT: Icon + Label + Sublabel */}
        <View style={styles.content}>
          <View style={[styles.iconWrapper, iconGlowShadow]}>
            {iconSource ? (
              <Image
                source={iconSource}
                style={{ width: buttonSize * 0.62, height: buttonSize * 0.62, resizeMode: 'contain' }}
              />
            ) : (
              icon
            )}
          </View>
          <Text
            style={[styles.label, { color: '#FFFFFF' }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {label}
          </Text>
          {!!sublabel && (
            <Text
              style={[styles.sublabel, { color: accentColor }]}
              numberOfLines={1}
            >
              {sublabel}
            </Text>
          )}
        </View>

      </View>

      {/* Corner brackets — Tron HUD aesthetic */}
      <View style={[styles.cornerTL, { borderColor: accentColor }]} pointerEvents="none" />
      <View style={[styles.cornerTR, { borderColor: accentColor }]} pointerEvents="none" />
      <View style={[styles.cornerBL, { borderColor: accentColor }]} pointerEvents="none" />
      <View style={[styles.cornerBR, { borderColor: accentColor }]} pointerEvents="none" />

    </TouchableOpacity>
  );
};

const CORNER_SIZE = 10;
const CORNER_WIDTH = 2;
const BORDER_RADIUS = 24;

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
  },
  outerGlow: {
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
  },
  glassBase: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
    borderWidth: 1.5,
    backgroundColor: 'rgba(7, 24, 36, 0.85)',
  },
  topReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: 1,
    opacity: 0.75,
  },
  content: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 8,
    gap: 4,
  },
  iconWrapper: {
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
    color: '#00FFCC',
    fontFamily: 'Orbitron_700Bold',
  },
  sublabel: {
    fontSize: 8,
    letterSpacing: 0.6,
    textAlign: 'center',
    opacity: 0.82,
    textTransform: 'uppercase',
  },
  // Corner brackets
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderTopLeftRadius: BORDER_RADIUS,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderTopRightRadius: BORDER_RADIUS,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderBottomLeftRadius: BORDER_RADIUS,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderBottomRightRadius: BORDER_RADIUS,
  },
});
