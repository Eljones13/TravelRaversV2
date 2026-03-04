import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  COLOR_CYAN,
  COLOR_GREEN,
  COLOR_ORANGE,
  COLOR_RED,
  FONT_DISPLAY,
  FONT_MONO,
} from '../../theme/tokens';

export type GpsStatus = 'LOCKED' | 'WEAK' | 'OFF';

interface HudHeaderProps {
  title: string;
  gpsStatus: GpsStatus;
  batteryPercent: number;
}

const GPS_COLORS: Record<GpsStatus, string> = {
  LOCKED: COLOR_GREEN,
  WEAK:   COLOR_ORANGE,
  OFF:    COLOR_RED,
};

export default function HudHeader({ title, gpsStatus, batteryPercent }: HudHeaderProps) {
  const gpsColor    = GPS_COLORS[gpsStatus];
  const batteryColor = batteryPercent <= 20 ? COLOR_ORANGE : 'rgba(255,255,255,0.6)';

  return (
    <View style={styles.container}>
      {/* GPS badge — left */}
      <View style={[
        styles.gpsBadge,
        {
          borderColor: gpsColor,
          shadowColor: gpsColor,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 6,
          shadowOpacity: 0.9,
          elevation: 4,
        },
      ]}>
        <View style={[styles.gpsDot, { backgroundColor: gpsColor }]} />
        <Text style={[styles.gpsLabel, { color: gpsColor }]}>{gpsStatus}</Text>
      </View>

      {/* Screen title — centre */}
      <Text style={styles.title}>{title.toUpperCase()}</Text>

      {/* Battery — right */}
      <Text style={[
        styles.battery,
        {
          color: batteryColor,
          textShadowColor: batteryColor,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 6,
        },
      ]}>
        {batteryPercent}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(3,6,15,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,245,255,0.12)',
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
  },
  gpsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  gpsLabel: {
    fontFamily: FONT_MONO,
    fontSize: 9,
    letterSpacing: 1,
  },
  title: {
    fontFamily: FONT_DISPLAY,
    fontSize: 14,
    color: COLOR_CYAN,
    letterSpacing: 2,
    textShadowColor: 'rgba(0,245,255,0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  battery: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    minWidth: 36,
    textAlign: 'right',
  },
});
