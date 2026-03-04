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
      <View style={[styles.gpsBadge, { borderColor: gpsColor }]}>
        <View style={[styles.gpsDot, { backgroundColor: gpsColor }]} />
        <Text style={[styles.gpsLabel, { color: gpsColor }]}>{gpsStatus}</Text>
      </View>

      {/* Screen title — centre */}
      <Text style={styles.title}>{title.toUpperCase()}</Text>

      {/* Battery — right */}
      <Text style={[styles.battery, { color: batteryColor }]}>
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
    paddingVertical: 10,
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
  },
  battery: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    minWidth: 36,
    textAlign: 'right',
  },
});
