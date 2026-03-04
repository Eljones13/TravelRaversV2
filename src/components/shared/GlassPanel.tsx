import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface GlassPanelProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function GlassPanel({ children, style }: GlassPanelProps) {
  return (
    <View style={[styles.panel, style]}>
      <BlurView intensity={28} tint="dark" style={styles.blur}>
        {/* Top shine */}
        <View style={styles.topHighlight} />

        {/* HUD corner brackets */}
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />

        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: 'rgba(12,24,48,0.70)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  blur: {
    flex: 1,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  corner: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  cornerTL: {
    top: 6,
    left: 6,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
  },
  cornerTR: {
    top: 6,
    right: 6,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
  },
  cornerBL: {
    bottom: 6,
    left: 6,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
  },
  cornerBR: {
    bottom: 6,
    right: 6,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
  },
});
