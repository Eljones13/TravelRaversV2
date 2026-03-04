import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { GLASS_BACKGROUND, GLASS_BORDER } from '../../theme/tokens';

interface GlassPanelProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function GlassPanel({ children, style }: GlassPanelProps) {
  return (
    <View style={[styles.panel, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: GLASS_BACKGROUND,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
