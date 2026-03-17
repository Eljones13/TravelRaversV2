// ============================================================
// TRAVEL RAVERS — TronGlassButton Component
// 3-Layer Glass Spec — refactored 2026-03-16
//
// Layer stack (bottom → top, all clipped by overflow:'hidden'):
//   L1 — Base:  backgroundColor rgba(6,16,36,0.95) — deep dark navy
//   L2 — Shine: expo-linear-gradient  rgba(255,255,255,0.08) → transparent
//   L3 — Lip:   absolute top View  h=1.5  white  opacity=0.15
//
// Border:  1.5px  rgba(accentColor, 0.4)  + platform glow shadow
// Pulse:   Animated.View overlay carries the pulsing glow ring
// HUD:     SVG L-shape corner brackets — only when pressed/active
// Fonts:   Orbitron_700Bold (title)  |  ShareTechMono_400Regular (sublabel)
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BORDER_RADIUS  = 20;
const BRACKET_ARM    = 10;
const BRACKET_INSET  = 8;
const BRACKET_SW     = 1.5;

// ─── Props ──────────────────────────────────────────────────────────────────

interface TronGlassButtonProps {
  label:        string;
  sublabel:     string;
  icon?:        React.ReactNode;
  iconSource?:  ImageSourcePropType | null;
  buttonSize?:  number;
  accentColor:  string;   // hex e.g. '#00FFFF'
  onPress:      () => void;
  columns?:     2 | 3;
}

// ─── SVG HUD corner brackets ────────────────────────────────────────────────
// L-shaped brackets in all 4 corners — only rendered when pressed/active.
// Inset 8px from container edges so they sit comfortably inside the 20px curve.

interface HudBracketsProps {
  color: string;
  size:  number;
}

const HudBrackets: React.FC<HudBracketsProps> = ({ color, size }) => {
  const i  = BRACKET_INSET;
  const a  = BRACKET_ARM;
  const sw = BRACKET_SW;
  const s  = size;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Svg width={s} height={s}>
        {/* Top-Left */}
        <Path
          d={`M ${i + a} ${i} L ${i} ${i} L ${i} ${i + a}`}
          stroke={color}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="square"
        />
        {/* Top-Right */}
        <Path
          d={`M ${s - i - a} ${i} L ${s - i} ${i} L ${s - i} ${i + a}`}
          stroke={color}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="square"
        />
        {/* Bottom-Left */}
        <Path
          d={`M ${i} ${s - i - a} L ${i} ${s - i} L ${i + a} ${s - i}`}
          stroke={color}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="square"
        />
        {/* Bottom-Right */}
        <Path
          d={`M ${s - i} ${s - i - a} L ${s - i} ${s - i} L ${s - i - a} ${s - i}`}
          stroke={color}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="square"
        />
      </Svg>
    </View>
  );
};

// ─── TronGlassButton ────────────────────────────────────────────────────────

export const TronGlassButton: React.FC<TronGlassButtonProps> = ({
  label,
  sublabel,
  icon,
  iconSource,
  buttonSize: buttonSizeProp,
  accentColor,
  onPress,
  columns = 3,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.55)).current;
  const [pressed, setPressed] = useState(false);

  // ── Platform glow shadow (outer, on the non-clipping wrapper) ────────────
  const outerGlowShadow = Platform.select({
    web: {
      boxShadow: pressed
        ? `0 0 18px ${accentColor}99, 0 0 32px ${accentColor}44`
        : `0 0 10px ${accentColor}44, 0 0 20px ${accentColor}22`,
    } as any,
    default: {
      shadowColor:   accentColor,
      shadowOffset:  { width: 0, height: 0 },
      shadowRadius:  pressed ? 14 : 8,
      shadowOpacity: pressed ? 0.7  : 0.4,
      elevation:     pressed ? 14   : 8,
    },
  })!;

  const iconGlowShadow = Platform.select({
    web: { filter: `drop-shadow(0 0 8px ${accentColor})` } as any,
    default: {
      shadowColor:   accentColor,
      shadowOffset:  { width: 0, height: 0 },
      shadowRadius:  8,
      shadowOpacity: 0.95,
    },
  })!;

  // ── Pulsing glow ring ─────────────────────────────────────────────────────
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1,    duration: 2200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.55, duration: 2200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // ── Dimensions ───────────────────────────────────────────────────────────
  const col        = columns === 2 ? 2 : 3;
  const buttonSize = buttonSizeProp ?? Math.floor((SCREEN_WIDTH - 48) / col);

  // ── Colour helpers ───────────────────────────────────────────────────────
  // accentColor + '66' → 40% opacity  (e.g. '#00FFFF66')
  const borderColor = accentColor + '66';

  return (
    // Outer wrapper: no overflow:hidden so shadow isn't clipped on native
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.shadowWrapper,
        { width: buttonSize, height: buttonSize },
        outerGlowShadow,
      ]}
    >

      {/* Pulsing glow ring — absolute, behind inner container */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          styles.pulseRing,
          { borderColor, opacity: pulseAnim },
        ]}
        pointerEvents="none"
      />

      {/* ── Inner container: overflow:'hidden' clips all visual layers ── */}
      <View style={[styles.innerContainer, { borderColor }]}>

        {/* LAYER 1 — Deep dark base */}
        <View style={styles.base} />

        {/* LAYER 2 — The Shine (expo-linear-gradient, absolute fill) */}
        <LinearGradient
          colors={['rgba(255,255,255,0.08)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* LAYER 3 — The Lip (top edge light-catch) */}
        <View style={styles.lip} pointerEvents="none" />

        {/* ── Content ─────────────────────────────────────────────────── */}
        <View style={styles.content}>

          {/* Icon */}
          <View style={iconGlowShadow}>
            {iconSource ? (
              <Image
                source={iconSource}
                style={{
                  width:      buttonSize * 0.62,
                  height:     buttonSize * 0.62,
                  resizeMode: 'contain',
                }}
              />
            ) : (
              icon
            )}
          </View>

          {/* Title — Orbitron */}
          <Text
            style={styles.label}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {label}
          </Text>

          {/* Sublabel — Share Tech Mono */}
          {!!sublabel && (
            <Text
              style={[styles.sublabel, { color: accentColor }]}
              numberOfLines={1}
            >
              {sublabel}
            </Text>
          )}

        </View>

        {/* HUD BRACKETS — SVG L-shapes, visible only when pressed/active */}
        {pressed && <HudBrackets color={accentColor} size={buttonSize} />}

      </View>
    </TouchableOpacity>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Outer shell — no overflow:hidden so native shadow renders correctly
  shadowWrapper: {
    borderRadius: BORDER_RADIUS,
  },

  // Pulsing glow ring sits between shadow wrapper and inner container
  pulseRing: {
    borderRadius: BORDER_RADIUS,
    borderWidth:  1.5,
  },

  // Inner container — overflow:hidden clips L1/L2/L3 to the 20px curve
  innerContainer: {
    width:        '100%',
    height:       '100%',
    borderRadius: BORDER_RADIUS,
    overflow:     'hidden',
    borderWidth:  1.5,
  },

  // LAYER 1 — deep dark base
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,16,36,0.95)',
  },

  // LAYER 3 — top-edge lip (light catch)
  lip: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    height:          1.5,
    backgroundColor: '#ffffff',
    opacity:         0.15,
  },

  // Content stack
  content: {
    width:             '100%',
    height:            '100%',
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 6,
    paddingVertical:   8,
    gap:               4,
  },

  // Title — Orbitron_700Bold
  label: {
    fontSize:      10,
    letterSpacing: 2,
    textAlign:     'center',
    textTransform: 'uppercase',
    color:         '#FFFFFF',
    fontFamily:    'Orbitron_700Bold',
  },

  // Sublabel — ShareTechMono_400Regular
  sublabel: {
    fontSize:      8,
    letterSpacing: 1.5,
    textAlign:     'center',
    textTransform: 'uppercase',
    fontFamily:    'ShareTechMono_400Regular',
    opacity:       0.82,
  },
});
