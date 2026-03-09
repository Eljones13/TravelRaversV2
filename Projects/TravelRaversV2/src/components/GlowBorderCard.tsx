// ============================================================
// TRAVEL RAVERS — GlowBorderCard Component
// Glass panel treatment from hud-design.md (.panel class)
// Used for: screen sections, content blocks, info cards
// ============================================================

import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';

interface GlowBorderCardProps {
  children: React.ReactNode;
  accentColor?: string;
  style?: ViewStyle;
  noPadding?: boolean;
}

export const GlowBorderCard: React.FC<GlowBorderCardProps> = ({
  children,
  accentColor = Colors.cyan,
  style,
  noPadding = false,
}) => {
  return (
    <View
      style={[
        styles.card,
        {
          borderColor: `${accentColor}26`,   // 15% opacity border
          ...Platform.select({
            web: { boxShadow: `0px 0px 8px ${accentColor}26` } as any,
            default: { shadowColor: accentColor, shadowOffset: { width: 0, height: 0 }, shadowRadius: 8, shadowOpacity: 0.15 }
          }),
        },
        noPadding ? styles.noPadding : null,
        style,
      ]}
    >
      {/* Top gradient accent line (panel::before equivalent) */}
      <View
        style={[styles.topLine, { backgroundColor: accentColor }]}
        pointerEvents="none"
      />

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(0,245,255,0.025)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
    // Shadows moved to inline Platform.select
    // Android
    elevation: 4,
  },
  noPadding: {
    padding: 0,
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: '15%',
    right: '15%',
    height: 1,
    opacity: 0.4,
  },
});
