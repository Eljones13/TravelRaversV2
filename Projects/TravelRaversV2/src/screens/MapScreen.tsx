// ============================================================
// TRAVEL RAVERS — MapScreen (Full Offline Build)
// Accent: #00FF88 (Green) | Module: MAP
// GPS tracking, offline tiles, POI markers, squad meetup
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Platform, Alert, Linking, AppState, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

let Mapbox: any;
if (Platform.OS !== 'web') {
  Mapbox = require('@rnmapbox/maps').default;
  Mapbox!.setAccessToken('sk.eyJ1IjoiZWxqb25lczEzIiwiYSI6ImNsdHljY3IzMzBldmsya2xkY2hxNmpnbDEifQ.placeholder_token');
}
import Svg, { Defs, Pattern, Circle, Rect, Polygon as SvgPolygon } from 'react-native-svg';
import { Colors } from '../constants/colors';
import {
  startGPSTracking, stopGPSTracking,
  getMeetupPoint, saveMeetupPoint,
  checkOfflineTiles, getDistanceMetres, formatDistance,
  FESTIVAL_ZONES, FESTIVAL_POIS, DARK_MAP_STYLE, DEFAULT_CENTER,
  type LatLng, type POI, type MeetupPoint,
} from '../utils/mapService';

const ACCENT = Colors.module.MAP; // #00FF88
const { width: SW } = Dimensions.get('window');

type MapScreenProps = {
  navigation: { goBack: () => void; navigate: (screen: string) => void };
};

type SelectedMarker = {
  id: string;
  name: string;
  type: string;
  color: string;
  coordinate: LatLng;
  distance?: string;
};

// ── Corner brackets ────────────────────────────────────────
const CornerBrackets: React.FC<{ color: string; size?: number; width?: number }> = ({ color, size = 10, width = 2 }) => (
  <>
    <View style={[cs.cornerTL, { borderColor: color, width: size, height: size, borderTopWidth: width, borderLeftWidth: width }]} pointerEvents="none" />
    <View style={[cs.cornerTR, { borderColor: color, width: size, height: size, borderTopWidth: width, borderRightWidth: width }]} pointerEvents="none" />
    <View style={[cs.cornerBL, { borderColor: color, width: size, height: size, borderBottomWidth: width, borderLeftWidth: width }]} pointerEvents="none" />
    <View style={[cs.cornerBR, { borderColor: color, width: size, height: size, borderBottomWidth: width, borderRightWidth: width }]} pointerEvents="none" />
  </>
);

// ── POI dot marker ────────────────────────────────────────
const GlowDot: React.FC<{ color: string }> = ({ color }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
    <View style={[cs.poiDotOuter, { borderColor: color + '55' }]} />
    <View style={[cs.poiDotInner, {
      backgroundColor: color,
      ...Platform.select({
        web: { boxShadow: `0 0 8px ${color}` } as any,
        default: { shadowColor: color, shadowRadius: 6, shadowOpacity: 1, shadowOffset: { width: 0, height: 0 } },
      }),
    }]} />
  </View>
);

// ── YOU ARE HERE dot ───────────────────────────────────────
const YouAreDot: React.FC = () => (
  <View style={{ alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}>
    <View style={[cs.youOuter, Platform.select({
      web: { boxShadow: `0 0 14px ${Colors.cyan}` } as any,
      default: { shadowColor: Colors.cyan, shadowRadius: 10, shadowOpacity: 0.8, shadowOffset: { width: 0, height: 0 } },
    }) as any]} />
    <View style={cs.youInner} />
    <Text style={cs.youLabel}>YOU</Text>
  </View>
);

// ── Main Screen ───────────────────────────────────────────
export const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const mapRef = useRef<any>(null);
  const appState = useRef(AppState.currentState);

  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [meetupPoint, setMeetupPoint] = useState<MeetupPoint | null>(null);
  const [offlineLoaded, setOfflineLoaded] = useState<boolean | null>(null); // null = checking
  const [selectedMarker, setSelectedMarker] = useState<SelectedMarker | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // ── Load meetup + offline status on mount ────────────────
  useEffect(() => {
    (async () => {
      const [mp, offline] = await Promise.all([getMeetupPoint(), checkOfflineTiles()]);
      if (mp) setMeetupPoint(mp);
      setOfflineLoaded(offline);
    })();
  }, []);

  // ── GPS tracking (stop when backgrounded) ────────────────
  useEffect(() => {
    startGPSTracking(setUserLocation);

    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background') stopGPSTracking();
      if (nextState === 'active' && appState.current !== 'active') startGPSTracking(setUserLocation);
      appState.current = nextState;
    });

    return () => {
      stopGPSTracking();
      sub.remove();
    };
  }, []);

  // ── Long press → save meetup ─────────────────────────────
  const handleLongPress = useCallback(async (e: any) => {
    const coord: LatLng = e.nativeEvent.coordinate;
    await saveMeetupPoint(coord);
    const mp = await getMeetupPoint();
    if (mp) setMeetupPoint(mp);
    Alert.alert('MEETUP POINT SET', `${coord.latitude.toFixed(5)}° N  ${Math.abs(coord.longitude).toFixed(5)}° W\nSquad can now see this point.`);
  }, []);

  // ── Tap marker ────────────────────────────────────────────
  const handleTapMarker = useCallback((poi: POI) => {
    const distance = userLocation
      ? formatDistance(getDistanceMetres(userLocation, poi.coordinate))
      : null;
    setSelectedMarker({
      id: poi.id,
      name: poi.name,
      type: poi.type.replace('_', ' ').toUpperCase(),
      color: poi.color,
      coordinate: poi.coordinate,
      distance: distance ?? undefined,
    });
  }, [userLocation]);

  // ── Navigate to Google Maps ───────────────────────────────
  const handleNavigate = useCallback((coord: LatLng, label: string) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${label}&ll=${coord.latitude},${coord.longitude}`,
      android: `geo:0,0?q=${coord.latitude},${coord.longitude}(${label})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${coord.latitude},${coord.longitude}`,
    })!;
    Linking.openURL(url);
  }, []);

  // ── Filtered POIs ─────────────────────────────────────────
  const filteredPOIs = activeFilter === 'ALL'
    ? FESTIVAL_POIS
    : FESTIVAL_POIS.filter(p => p.type === activeFilter.toLowerCase() || p.type.includes(activeFilter.toLowerCase()));

  const FILTERS = ['ALL', 'MEDICAL', 'WATER', 'TOILETS', 'LOST_FOUND', 'ENTRANCE'];

  return (
    <SafeAreaView style={cs.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* ── Header ── */}
      <View style={cs.header}>
        <TouchableOpacity onPress={navigation.goBack} style={cs.backBtn}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <SvgPolygon points="15,5 7,12 15,19" fill={ACCENT} />
          </Svg>
          <Text style={[cs.backText, { color: ACCENT }]}>BACK</Text>
        </TouchableOpacity>

        <Text style={[cs.headerTitle, { color: ACCENT }, Platform.select({
          web: { textShadow: `0 0 8px ${ACCENT}` } as any,
          default: { textShadowColor: ACCENT, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
        })!]}>
          MAP
        </Text>

        {/* Offline / Live badge */}
        <View style={[cs.offlineBadge, {
          borderColor: offlineLoaded === null ? Colors.dim : offlineLoaded ? Colors.green + '88' : Colors.red + '88',
          backgroundColor: offlineLoaded === null ? 'transparent' : offlineLoaded ? Colors.green + '15' : Colors.red + '15',
        }]}>
          <View style={[cs.offlineDot, {
            backgroundColor: offlineLoaded === null ? Colors.dim : offlineLoaded ? Colors.green : Colors.red,
          }]} />
          <Text style={[cs.offlineBadgeText, { color: offlineLoaded === null ? Colors.dim : offlineLoaded ? Colors.green : Colors.red }]}>
            {offlineLoaded === null ? 'CHECKING' : offlineLoaded ? 'OFFLINE MAP' : 'LIVE MAP'}
          </Text>
        </View>
      </View>

      {/* ── Map ── */}
      <View style={cs.mapContainer}>
        {Platform.OS === 'web' || !Mapbox ? (
          <View style={[cs.map, { alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ color: Colors.cyan, fontFamily: 'Orbitron_700Bold', fontSize: 16 }}>MAPBOX NOT SUPPORTED ON WEB</Text>
            <Text style={{ color: Colors.dim, fontFamily: 'ShareTechMono_400Regular', fontSize: 12, marginTop: 8 }}>Please test Map on a physical device.</Text>
          </View>
        ) : (
          <Mapbox.MapView
            style={cs.map}
            styleURL="mapbox://styles/eljones13/cltycb0zx00x801r8h44h0p4o"
            onLongPress={handleLongPress}
            onPress={() => setSelectedMarker(null)}
            compassEnabled={false}
            scaleBarEnabled={false}
            logoEnabled={false}
            attributionEnabled={false}
          >
            <Mapbox.Camera
              defaultSettings={{
                centerCoordinate: [DEFAULT_CENTER.longitude, DEFAULT_CENTER.latitude],
                zoomLevel: 14.5,
              }}
            />

            {/* Festival zone overlays */}
            {FESTIVAL_ZONES.map(zone => (
              <Mapbox.ShapeSource
                key={zone.id}
                id={`source-${zone.id}`}
                shape={{
                  type: 'Feature',
                  geometry: {
                    type: 'Polygon',
                    coordinates: [
                      [
                        ...zone.coordinates.map(c => [c.longitude, c.latitude]),
                        [zone.coordinates[0].longitude, zone.coordinates[0].latitude] // Close the polygon
                      ]
                    ]
                  },
                  properties: {}
                }}
              >
                <Mapbox.FillLayer
                  id={`fill-${zone.id}`}
                  style={{
                    fillColor: zone.color,
                    fillOpacity: zone.fillOpacity,
                    fillOutlineColor: zone.color,
                  }}
                />
                <Mapbox.LineLayer
                  id={`line-${zone.id}`}
                  style={{
                    lineColor: zone.color,
                    lineWidth: 1.5,
                    lineOpacity: 0.6,
                  }}
                />
              </Mapbox.ShapeSource>
            ))}

            {/* POI markers */}
            {filteredPOIs.map(poi => (
              <Mapbox.MarkerView
                key={poi.id}
                id={poi.id}
                coordinate={[poi.coordinate.longitude, poi.coordinate.latitude]}
              >
                <TouchableOpacity onPress={() => handleTapMarker(poi)} activeOpacity={0.8}>
                  <GlowDot color={poi.color} />
                </TouchableOpacity>
              </Mapbox.MarkerView>
            ))}

            {/* YOU ARE HERE */}
            {userLocation && (
              <Mapbox.MarkerView
                id="userLocation"
                coordinate={[userLocation.longitude, userLocation.latitude]}
              >
                <YouAreDot />
              </Mapbox.MarkerView>
            )}

            {/* Squad meetup point */}
            {meetupPoint && (
              <Mapbox.MarkerView
                id="meetupPoint"
                coordinate={[meetupPoint.longitude, meetupPoint.latitude]}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSelectedMarker({
                    id: 'meetup',
                    name: 'SQUAD MEETUP',
                    type: 'MEETUP',
                    color: '#9D4EDD',
                    coordinate: { latitude: meetupPoint.latitude, longitude: meetupPoint.longitude },
                    distance: userLocation ? formatDistance(getDistanceMetres(userLocation, { latitude: meetupPoint.latitude, longitude: meetupPoint.longitude })) : undefined,
                  })}
                >
                  <View style={cs.meetupMarker}>
                    <View style={[cs.meetupDot, Platform.select({
                      web: { boxShadow: '0 0 12px #9D4EDD' } as any,
                      default: { shadowColor: '#9D4EDD', shadowRadius: 8, shadowOpacity: 1, shadowOffset: { width: 0, height: 0 } },
                    }) as any]} />
                    <Text style={cs.meetupLabel}>MEETUP</Text>
                  </View>
                </TouchableOpacity>
              </Mapbox.MarkerView>
            )}

          </Mapbox.MapView>
        )}

        {/* Download nudge if no offline pack */}
        {offlineLoaded === false && (
          <TouchableOpacity
            style={cs.downloadNudge}
            onPress={() => navigation.navigate('Downloads')}
            activeOpacity={0.85}
          >
            <Text style={cs.downloadNudgeText}>⚠ NO OFFLINE PACK  →  DOWNLOAD NOW</Text>
            <CornerBrackets color={Colors.yellow} size={8} width={1} />
          </TouchableOpacity>
        )}

        {/* Long press hint */}
        <View style={cs.hintPill} pointerEvents="none">
          <Text style={cs.hintText}>LONG PRESS TO SET MEETUP POINT</Text>
        </View>
      </View>

      {/* ── POI filter chips ── */}
      <View style={cs.filterRow}>
        {FILTERS.map(f => {
          const isActive = activeFilter === f;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[cs.chip, isActive && { backgroundColor: ACCENT + '22', borderColor: ACCENT + '88' }]}
            >
              <Text style={[cs.chipText, { color: isActive ? ACCENT : Colors.dim }]}>
                {f.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Bottom sheet — tap to dismiss ── */}
      {selectedMarker && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setSelectedMarker(null)}
          style={cs.sheetOverlay}
        >
          <View style={[cs.sheet, { borderTopColor: selectedMarker.color + '88' }]}>
            <CornerBrackets color={selectedMarker.color} size={10} width={1.5} />

            <View style={cs.sheetDot}>
              <View style={[cs.sheetDotInner, { backgroundColor: selectedMarker.color }]} />
            </View>
            <Text style={[cs.sheetName, { color: selectedMarker.color }]}>{selectedMarker.name}</Text>
            <Text style={cs.sheetType}>{selectedMarker.type}</Text>

            {selectedMarker.distance && (
              <Text style={[cs.sheetDist, { color: Colors.cyan }]}>{selectedMarker.distance} AWAY</Text>
            )}

            <TouchableOpacity
              style={[cs.navBtn, { borderColor: selectedMarker.color + '88' }]}
              onPress={() => handleNavigate(selectedMarker.coordinate, selectedMarker.name)}
            >
              <Text style={[cs.navBtnText, { color: selectedMarker.color }]}>NAVIGATE →</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────
const cs = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,245,255,0.1)',
    backgroundColor: 'rgba(3,6,15,0.95)',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 60 },
  backText: { fontSize: 10, letterSpacing: 2, fontWeight: '700', fontFamily: 'Orbitron_700Bold' },
  headerTitle: { fontSize: 14, fontFamily: 'Orbitron_700Bold', letterSpacing: 3, textTransform: 'uppercase' },
  offlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  offlineDot: { width: 6, height: 6, borderRadius: 3 },
  offlineBadgeText: { fontSize: 8, letterSpacing: 2, fontFamily: 'ShareTechMono_400Regular', textTransform: 'uppercase' },

  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },

  downloadNudge: {
    position: 'absolute', top: 10, left: 10, right: 10,
    backgroundColor: 'rgba(255,179,0,0.12)', borderWidth: 1,
    borderColor: Colors.yellow + '66', borderRadius: 8,
    paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center',
  },
  downloadNudgeText: { color: Colors.yellow, fontSize: 10, letterSpacing: 2, fontFamily: 'Orbitron_700Bold', textAlign: 'center' },

  hintPill: {
    position: 'absolute', bottom: 12, left: SW / 2 - 120, width: 240,
    backgroundColor: 'rgba(3,6,15,0.75)', borderRadius: 12,
    paddingVertical: 5, paddingHorizontal: 12, alignItems: 'center',
  },
  hintText: { color: Colors.dim, fontSize: 8, letterSpacing: 1.5, fontFamily: 'ShareTechMono_400Regular' },

  // POI dot
  poiDotOuter: { position: 'absolute', width: 20, height: 20, borderRadius: 10, borderWidth: 1 },
  poiDotInner: { width: 10, height: 10, borderRadius: 5 },

  // YOU dot
  youOuter: { position: 'absolute', width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: Colors.cyan + '55', backgroundColor: Colors.cyan + '22' },
  youInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.cyan },
  youLabel: { position: 'absolute', bottom: -14, fontSize: 7, color: Colors.cyan, letterSpacing: 1.5, fontFamily: 'Orbitron_700Bold' },

  // Meetup
  meetupMarker: { alignItems: 'center' },
  meetupDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#9D4EDD', borderWidth: 2, borderColor: '#9D4EDD55' },
  meetupLabel: { fontSize: 7, color: '#9D4EDD', letterSpacing: 1.5, fontFamily: 'Orbitron_700Bold', marginTop: 2 },

  // Filter chips
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingVertical: 8, gap: 6, backgroundColor: 'rgba(3,6,15,0.95)', borderTopWidth: 1, borderTopColor: 'rgba(0,245,255,0.1)' },
  chip: { borderWidth: 1, borderColor: 'rgba(0,200,220,0.2)', borderRadius: 14, paddingVertical: 4, paddingHorizontal: 10, backgroundColor: 'rgba(6,16,36,0.6)' },
  chipText: { fontSize: 8, letterSpacing: 2, fontFamily: 'Orbitron_700Bold', textTransform: 'uppercase' },

  // Bottom sheet
  sheetOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, top: 0, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: 'rgba(6,16,36,0.96)',
    borderTopWidth: 1.5, borderLeftWidth: 1, borderRightWidth: 1,
    borderColor: 'rgba(0,200,220,0.2)',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32,
    alignItems: 'center', gap: 6,
    ...Platform.select({
      web: { boxShadow: '0 -4px 20px rgba(0,245,255,0.12)' } as any,
      default: { shadowColor: Colors.cyan, shadowRadius: 20, shadowOpacity: 0.15, shadowOffset: { width: 0, height: -4 } },
    }),
  },
  sheetDot: { width: 32, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 8 },
  sheetDotInner: { width: 32, height: 3, borderRadius: 2 },
  sheetName: { fontSize: 16, fontFamily: 'Orbitron_700Bold', letterSpacing: 2, textTransform: 'uppercase' },
  sheetType: { fontSize: 9, color: Colors.dim, letterSpacing: 2, fontFamily: 'ShareTechMono_400Regular', textTransform: 'uppercase' },
  sheetDist: { fontSize: 12, fontFamily: 'Orbitron_700Bold', letterSpacing: 1.5, marginTop: 4 },
  navBtn: { marginTop: 12, borderWidth: 1, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 32, backgroundColor: 'rgba(0,255,136,0.06)' },
  navBtnText: { fontSize: 11, fontFamily: 'Orbitron_700Bold', letterSpacing: 2 },

  // Corners
  cornerTL: { position: 'absolute', top: 0, left: 0 },
  cornerTR: { position: 'absolute', top: 0, right: 0 },
  cornerBL: { position: 'absolute', bottom: 0, left: 0 },
  cornerBR: { position: 'absolute', bottom: 0, right: 0 },
});
