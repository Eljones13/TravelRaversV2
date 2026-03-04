import React, { useEffect, useRef } from 'react';
import { Animated, ImageBackground, StyleSheet, View } from 'react-native';
import { COLOR_CYAN, COLOR_MAGENTA } from '../../theme/tokens';

const BG_IMAGE = require('../../assets/rave-festival-bg.jpg');

interface ScreenBackgroundProps {
  children: React.ReactNode;
}

export default function ScreenBackground({ children }: ScreenBackgroundProps) {
  const orb1Scale = useRef(new Animated.Value(1)).current;
  const orb2Scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Scale, {
          toValue: 1.2,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(orb1Scale, {
          toValue: 1.0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Scale, {
          toValue: 1.15,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(orb2Scale, {
          toValue: 1.0,
          duration: 3500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [orb1Scale, orb2Scale]);

  return (
    <ImageBackground source={BG_IMAGE} style={styles.container} resizeMode="cover" imageStyle={styles.image}>
      {/* Dark overlay */}
      <View style={styles.overlay} />

      {/* Orb 1 — top right, cyan */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          { transform: [{ scale: orb1Scale }] },
        ]}
      />

      {/* Orb 2 — bottom left, magenta */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          { transform: [{ scale: orb2Scale }] },
        ]}
      />

      {/* Scanline overlay */}
      <View style={styles.scanlines} pointerEvents="none">
        {Array.from({ length: 60 }).map((_, i) => (
          <View key={i} style={styles.scanline} />
        ))}
      </View>

      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3,6,15,0.78)',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 280,
    height: 280,
    top: -60,
    right: -60,
    backgroundColor: COLOR_CYAN,
    opacity: 0.12,
  },
  orb2: {
    width: 220,
    height: 220,
    bottom: -50,
    left: -50,
    backgroundColor: COLOR_MAGENTA,
    opacity: 0.09,
  },
  scanlines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  scanline: {
    height: 1,
    backgroundColor: '#ffffff',
    opacity: 0.04,
  },
});
