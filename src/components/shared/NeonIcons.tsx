import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

interface NeonIconProps {
  color: string;
  size?: number;
}

// Shared glow layer: renders the same paths twice — wide+dim for bloom, thin+bright for edge
function GlowStroke({
  color,
  children,
  size,
}: {
  color: string;
  size: number;
  children: (strokeWidth: number, stroke: string, opacity: number) => React.ReactNode;
}) {
  return (
    <>
      {/* Bloom layer */}
      {children(5, color, 0.25)}
      {/* Sharp layer */}
      {children(1.5, color, 1)}
    </>
  );
}

// EVENTS — radio/broadcast: concentric arcs + center dot
export function EventsIcon({ color, size = 36 }: NeonIconProps) {
  const c = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <GlowStroke color={color} size={size}>
        {(sw, stroke, opacity) => (
          <>
            <Path
              d={`M ${c - 14} ${c + 7} A 16 16 0 0 1 ${c + 14} ${c + 7}`}
              stroke={stroke} strokeWidth={sw} fill="none"
              strokeLinecap="round" opacity={opacity}
            />
            <Path
              d={`M ${c - 9} ${c + 4} A 10 10 0 0 1 ${c + 9} ${c + 4}`}
              stroke={stroke} strokeWidth={sw} fill="none"
              strokeLinecap="round" opacity={opacity}
            />
            <Path
              d={`M ${c - 4} ${c + 1} A 5 5 0 0 1 ${c + 4} ${c + 1}`}
              stroke={stroke} strokeWidth={sw} fill="none"
              strokeLinecap="round" opacity={opacity}
            />
            <Circle cx={c} cy={c + 1} r={2} stroke={stroke} strokeWidth={sw} fill="none" opacity={opacity} />
            <Line x1={c} y1={c - 1} x2={c} y2={c - 10}
              stroke={stroke} strokeWidth={sw} strokeLinecap="round" opacity={opacity} />
          </>
        )}
      </GlowStroke>
    </Svg>
  );
}

// RADAR — wifi arcs: 3 arcs + base dot
export function RadarIcon({ color, size = 36 }: NeonIconProps) {
  const c = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <GlowStroke color={color} size={size}>
        {(sw, stroke, opacity) => (
          <>
            <Path
              d={`M ${c - 14} ${c + 4} A 18 18 0 0 1 ${c + 14} ${c + 4}`}
              stroke={stroke} strokeWidth={sw} fill="none"
              strokeLinecap="round" opacity={opacity}
            />
            <Path
              d={`M ${c - 9} ${c + 3} A 11 11 0 0 1 ${c + 9} ${c + 3}`}
              stroke={stroke} strokeWidth={sw} fill="none"
              strokeLinecap="round" opacity={opacity}
            />
            <Path
              d={`M ${c - 4.5} ${c + 2} A 5.5 5.5 0 0 1 ${c + 4.5} ${c + 2}`}
              stroke={stroke} strokeWidth={sw} fill="none"
              strokeLinecap="round" opacity={opacity}
            />
            <Circle cx={c} cy={c + 5} r={1.5} stroke={stroke} strokeWidth={sw} fill={stroke} opacity={opacity} />
          </>
        )}
      </GlowStroke>
    </Svg>
  );
}

// MAP — folded map: rectangle with diagonal fold line + location pin
export function MapIcon({ color, size = 36 }: NeonIconProps) {
  const c = size / 2;
  const pad = 5;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <GlowStroke color={color} size={size}>
        {(sw, stroke, opacity) => (
          <>
            <Path
              d={`M ${pad + 4} ${pad} L ${c - 1} ${pad + 4} L ${c + 5} ${pad} L ${size - pad} ${pad + 4} L ${size - pad} ${size - pad} L ${c + 5} ${size - pad - 4} L ${c - 1} ${size - pad} L ${pad + 4} ${size - pad - 4} Z`}
              stroke={stroke} strokeWidth={sw} fill="none"
              strokeLinejoin="round" opacity={opacity}
            />
            <Line x1={c - 1} y1={pad + 4} x2={c - 1} y2={size - pad}
              stroke={stroke} strokeWidth={sw} opacity={opacity * 0.5} />
            <Line x1={c + 5} y1={pad} x2={c + 5} y2={size - pad - 4}
              stroke={stroke} strokeWidth={sw} opacity={opacity * 0.5} />
            <Circle cx={c + 2} cy={c - 1} r={3} stroke={stroke} strokeWidth={sw} fill="none" opacity={opacity} />
            <Line x1={c + 2} y1={c + 2} x2={c + 2} y2={c + 6}
              stroke={stroke} strokeWidth={sw} strokeLinecap="round" opacity={opacity} />
          </>
        )}
      </GlowStroke>
    </Svg>
  );
}

// TIMETABLE — clock: circle + tick marks + hands
export function TimesIcon({ color, size = 36 }: NeonIconProps) {
  const c = size / 2;
  const r = size / 2 - 4;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <GlowStroke color={color} size={size}>
        {(sw, stroke, opacity) => (
          <>
            <Circle cx={c} cy={c} r={r} stroke={stroke} strokeWidth={sw} fill="none" opacity={opacity} />
            {/* 12, 3, 6, 9 tick marks */}
            <Line x1={c} y1={c - r + 1} x2={c} y2={c - r + 4}
              stroke={stroke} strokeWidth={sw} strokeLinecap="round" opacity={opacity} />
            <Line x1={c + r - 1} y1={c} x2={c + r - 4} y2={c}
              stroke={stroke} strokeWidth={sw} strokeLinecap="round" opacity={opacity} />
            <Line x1={c} y1={c + r - 1} x2={c} y2={c + r - 4}
              stroke={stroke} strokeWidth={sw} strokeLinecap="round" opacity={opacity} />
            <Line x1={c - r + 1} y1={c} x2={c - r + 4} y2={c}
              stroke={stroke} strokeWidth={sw} strokeLinecap="round" opacity={opacity} />
            {/* Hour hand — pointing ~10 o'clock */}
            <Line x1={c} y1={c} x2={c - 5} y2={c - 6}
              stroke={stroke} strokeWidth={sw} strokeLinecap="round" opacity={opacity} />
            {/* Minute hand — pointing ~2 o'clock */}
            <Line x1={c} y1={c} x2={c + 6} y2={c - 4}
              stroke={stroke} strokeWidth={sw} strokeLinecap="round" opacity={opacity} />
            <Circle cx={c} cy={c} r={1.5} stroke={stroke} strokeWidth={1} fill={stroke} opacity={opacity} />
          </>
        )}
      </GlowStroke>
    </Svg>
  );
}

// KIT — bag: rounded rectangle body + curved handle
export function KitIcon({ color, size = 36 }: NeonIconProps) {
  const c = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <GlowStroke color={color} size={size}>
        {(sw, stroke, opacity) => (
          <>
            {/* Bag body */}
            <Rect
              x={5} y={13} width={size - 10} height={size - 16}
              rx={4} ry={4}
              stroke={stroke} strokeWidth={sw} fill="none" opacity={opacity}
            />
            {/* Handle arc */}
            <Path
              d={`M ${c - 6} 13 Q ${c - 6} 6 ${c} 6 Q ${c + 6} 6 ${c + 6} 13`}
              stroke={stroke} strokeWidth={sw} fill="none"
              strokeLinecap="round" opacity={opacity}
            />
            {/* Centre zip line */}
            <Line x1={5} y1={c + 1} x2={size - 5} y2={c + 1}
              stroke={stroke} strokeWidth={sw} opacity={opacity * 0.4} />
            {/* Zip pull */}
            <Circle cx={c} cy={c + 1} r={2} stroke={stroke} strokeWidth={sw} fill="none" opacity={opacity} />
          </>
        )}
      </GlowStroke>
    </Svg>
  );
}

// SOS — alert circle: circle + exclamation mark
export function SosIcon({ color, size = 36 }: NeonIconProps) {
  const c = size / 2;
  const r = size / 2 - 3;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <GlowStroke color={color} size={size}>
        {(sw, stroke, opacity) => (
          <>
            <Circle cx={c} cy={c} r={r} stroke={stroke} strokeWidth={sw} fill="none" opacity={opacity} />
            <Line x1={c} y1={c - 7} x2={c} y2={c + 1}
              stroke={stroke} strokeWidth={sw} strokeLinecap="round" opacity={opacity} />
            <Circle cx={c} cy={c + 6} r={1.5} stroke={stroke} strokeWidth={1} fill={stroke} opacity={opacity} />
          </>
        )}
      </GlowStroke>
    </Svg>
  );
}

// ─── Icon map ─────────────────────────────────────────────────────────────────

export type NeonIconName = 'EVENTS' | 'RADAR' | 'MAP' | 'TIMES' | 'KIT' | 'SOS';

const ICON_MAP: Record<NeonIconName, React.ComponentType<NeonIconProps>> = {
  EVENTS: EventsIcon,
  RADAR:  RadarIcon,
  MAP:    MapIcon,
  TIMES:  TimesIcon,
  KIT:    KitIcon,
  SOS:    SosIcon,
};

interface NeonIconContainerProps {
  name: NeonIconName;
  color: string;
  size?: number;
}

export function NeonIcon({ name, color, size = 36 }: NeonIconContainerProps) {
  const IconComponent = ICON_MAP[name];
  return (
    <View
      style={{
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 12,
        shadowOpacity: 0.9,
        elevation: 6,
      }}
    >
      <IconComponent color={color} size={size} />
    </View>
  );
}
