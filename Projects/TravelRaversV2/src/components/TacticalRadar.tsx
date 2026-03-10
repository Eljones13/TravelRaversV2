import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G, Defs, RadialGradient, Stop, Path } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withRepeat,
    withTiming,
    Easing,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');
const RADAR_SIZE = width - 48; // Fit within screen with margins
const CENTER = RADAR_SIZE / 2;
const MAX_RADIUS = CENTER - 20;

// Reanimated SVG components
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface RadarPoint {
    id: string;
    name: string;
    distance: number; // in meters
    bearing: number; // 0-360 degrees
    isUser?: boolean;
}

interface TacticalRadarProps {
    points?: RadarPoint[];
    maxRange?: number; // Maximum range the radar displays (e.g., 1000m)
}

export default function TacticalRadar({
    points = [],
    maxRange = 1000
}: TacticalRadarProps) {

    // Animation value for the sweeping line (0 to 360 degrees)
    const rotation = useSharedValue(0);

    useEffect(() => {
        // Start continuous 360 sweep taking 4 seconds per full rotation
        rotation.value = withRepeat(
            withTiming(360, {
                duration: 4000,
                easing: Easing.linear,
            }),
            -1,
            false
        );
    }, []);

    // Style for the sweeping radar slice
    const animatedSweepStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: CENTER },
                { translateY: CENTER },
                { rotate: `${rotation.value}deg` },
                { translateX: -CENTER },
                { translateY: -CENTER },
            ],
        };
    });

    // Helper to convert polar coordinates to Cartesian for rendering dots
    const getCoordinates = (bearing: number, distance: number) => {
        // Bound the distance to maxRange so points don't draw outside the radar
        const boundedDistance = Math.min(distance, maxRange);

        // Convert distance to pixel radius
        const r = (boundedDistance / maxRange) * MAX_RADIUS;

        // Convert bearing (0 is North) to math angle (0 is East)
        const angleInRadians = (bearing - 90) * (Math.PI / 180);

        return {
            x: CENTER + r * Math.cos(angleInRadians),
            y: CENTER + r * Math.sin(angleInRadians),
        };
    };

    return (
        <View style={styles.container}>
            <Svg width={RADAR_SIZE} height={RADAR_SIZE}>
                <Defs>
                    {/* Subtle background glow for the radar dish */}
                    <RadialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                        <Stop offset="0%" stopColor={Colors.module.RADAR} stopOpacity="0.15" />
                        <Stop offset="80%" stopColor={Colors.module.RADAR} stopOpacity="0.05" />
                        <Stop offset="100%" stopColor={Colors.bg} stopOpacity="0" />
                    </RadialGradient>
                </Defs>

                {/* Radar Background Glow */}
                <Circle cx={CENTER} cy={CENTER} r={MAX_RADIUS} fill="url(#radarGlow)" />

                {/* Concentric Rings */}
                {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
                    <Circle
                        key={`ring-${i}`}
                        cx={CENTER}
                        cy={CENTER}
                        r={MAX_RADIUS * scale}
                        stroke={Colors.module.RADAR}
                        strokeWidth="1"
                        strokeOpacity={scale === 1 ? 0.6 : 0.2}
                        fill="none"
                    />
                ))}

                {/* Crosshairs (N, S, E, W) */}
                <Line x1={CENTER} y1={20} x2={CENTER} y2={RADAR_SIZE - 20} stroke={Colors.module.RADAR} strokeWidth="1" strokeOpacity="0.3" />
                <Line x1={20} y1={CENTER} x2={RADAR_SIZE - 20} y2={CENTER} stroke={Colors.module.RADAR} strokeWidth="1" strokeOpacity="0.3" />

                {/* Cardinal Direction Text */}
                <SvgText x={CENTER} y={15} fill={Colors.module.RADAR} fontSize="10" fontFamily="Orbitron_700Bold" textAnchor="middle" opacity="0.8">N</SvgText>
                <SvgText x={CENTER} y={RADAR_SIZE - 5} fill={Colors.module.RADAR} fontSize="10" fontFamily="Orbitron_700Bold" textAnchor="middle" opacity="0.8">S</SvgText>
                <SvgText x={RADAR_SIZE - 8} y={CENTER + 3} fill={Colors.module.RADAR} fontSize="10" fontFamily="Orbitron_700Bold" textAnchor="end" opacity="0.8">E</SvgText>
                <SvgText x={8} y={CENTER + 3} fill={Colors.module.RADAR} fontSize="10" fontFamily="Orbitron_700Bold" textAnchor="start" opacity="0.8">W</SvgText>

                {/* 45-degree angled ticks */}
                {[45, 135, 225, 315].map((angle, i) => {
                    const innerR = MAX_RADIUS * 0.95;
                    const outerR = MAX_RADIUS;
                    const rad = (angle - 90) * (Math.PI / 180);
                    return (
                        <Line
                            key={`tick-${i}`}
                            x1={CENTER + innerR * Math.cos(rad)}
                            y1={CENTER + innerR * Math.sin(rad)}
                            x2={CENTER + outerR * Math.cos(rad)}
                            y2={CENTER + outerR * Math.sin(rad)}
                            stroke={Colors.module.RADAR}
                            strokeWidth="1"
                            strokeOpacity="0.5"
                        />
                    );
                })}

                {/* Animated Sweeping Line (The Pink Pulse) */}
                <AnimatedG animatedProps={animatedSweepStyle}>
                    {/* Create a wedge/gradient sweep by drawing a thick line from center */}
                    {/* We use stroke-dasharray as a hack to make a cone, but a simple glowing line with a gradient path is cleaner */}
                    <Path
                        d={`M ${CENTER} ${CENTER} L ${CENTER} ${CENTER - MAX_RADIUS} A ${MAX_RADIUS} ${MAX_RADIUS} 0 0 1 ${CENTER + MAX_RADIUS * Math.sin(45 * Math.PI / 180)} ${CENTER - MAX_RADIUS * Math.cos(45 * Math.PI / 180)} Z`}
                        fill={Colors.module.RADAR}
                        opacity="0.15"
                    />
                    <Line
                        x1={CENTER}
                        y1={CENTER}
                        x2={CENTER}
                        y2={CENTER - MAX_RADIUS}
                        stroke={Colors.module.RADAR}
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </AnimatedG>

                {/* Center Pulse (The User) */}
                <Circle cx={CENTER} cy={CENTER} r="6" fill={Colors.module.RADAR} />
                <Circle cx={CENTER} cy={CENTER} r="12" stroke={Colors.module.RADAR} strokeWidth="1" strokeOpacity="0.4" fill="none" />

                {/* Plot the Points (Squad) */}
                {points.map((pt, i) => {
                    const coords = getCoordinates(pt.bearing, pt.distance);
                    // Don't draw points if distance is 0 (that's the user in the centre)
                    if (pt.distance === 0) return null;

                    return (
                        <G key={`point-${i}`}>
                            {/* Squad Glow Dot */}
                            <Circle cx={coords.x} cy={coords.y} r="5" fill="#FFF" />
                            <Circle cx={coords.x} cy={coords.y} r="10" fill="#FFF" opacity="0.3" />
                            <Circle cx={coords.x} cy={coords.y} r="15" stroke="#FFF" strokeWidth="1" strokeOpacity="0.2" fill="none" />

                            {/* Info Label Box pointing to the dot */}
                            <Line
                                x1={coords.x}
                                y1={coords.y}
                                x2={coords.x + 15}
                                y2={coords.y - 15}
                                stroke={Colors.module.RADAR}
                                strokeWidth="1"
                                opacity="0.6"
                            />
                            {/* Data Tag Background */}
                            <Path
                                d={`M ${coords.x + 15} ${coords.y - 15} L ${coords.x + 100} ${coords.y - 15} L ${coords.x + 100} ${coords.y - 30} L ${coords.x + 15} ${coords.y - 30} Z`}
                                fill={Colors.bg}
                                opacity="0.8"
                                stroke={Colors.module.RADAR}
                                strokeWidth="1"
                                strokeOpacity="0.5"
                            />
                            <SvgText
                                x={coords.x + 20}
                                y={coords.y - 18}
                                fill={Colors.module.RADAR}
                                fontSize="8"
                                fontFamily="ShareTechMono_400Regular"
                            >
                                {`${pt.name.toUpperCase()}: ${Math.round(pt.distance)}m`}
                            </SvgText>
                        </G>
                    );
                })}
            </Svg>

            {/* Corner Brackets for Tactical Feel */}
            <View style={[styles.cornerBracket, styles.topLeft]} />
            <View style={[styles.cornerBracket, styles.topRight]} />
            <View style={[styles.cornerBracket, styles.bottomLeft]} />
            <View style={[styles.cornerBracket, styles.bottomRight]} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
    },
    cornerBracket: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: Colors.module.RADAR,
        opacity: 0.5,
    },
    topLeft: {
        top: 10,
        left: 10,
        borderTopWidth: 2,
        borderLeftWidth: 2,
    },
    topRight: {
        top: 10,
        right: 10,
        borderTopWidth: 2,
        borderRightWidth: 2,
    },
    bottomLeft: {
        bottom: 10,
        left: 10,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
    },
    bottomRight: {
        bottom: 10,
        right: 10,
        borderBottomWidth: 2,
        borderRightWidth: 2,
    },
});
