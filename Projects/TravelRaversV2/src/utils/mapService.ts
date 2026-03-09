// ============================================================
// TRAVEL RAVERS — mapService.ts
// All map logic: GPS tracking, offline tile detection,
// meetup point storage, POI data, distance calculation
// ============================================================

import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Types ──────────────────────────────────────────────────

export type LatLng = { latitude: number; longitude: number };

export type POI = {
    id: string;
    name: string;
    type: 'medical' | 'water' | 'toilets' | 'lost_found' | 'entrance';
    coordinate: LatLng;
    color: string;
};

export type FestivalZone = {
    id: string;
    name: string;
    type: 'main_stage' | 'camping' | 'medical' | 'water' | 'exit';
    coordinates: LatLng[];
    color: string;
    fillOpacity: number;
};

export type MeetupPoint = {
    latitude: number;
    longitude: number;
    label: string;
    savedAt: string;
};

// ── Constants ──────────────────────────────────────────────

const MEETUP_KEY = 'tr_meetup_point';
const GPS_UPDATE_MS = 30_000; // 30 seconds

// Default festival: Glastonbury
export const DEFAULT_CENTER: LatLng = { latitude: 51.1485, longitude: -2.7144 };

// ── Zone data (Glastonbury approximation) ─────────────────

export const FESTIVAL_ZONES: FestivalZone[] = [
    {
        id: 'main_stage',
        name: 'MAIN STAGE',
        type: 'main_stage',
        color: '#00FFCC',
        fillOpacity: 0.12,
        coordinates: [
            { latitude: 51.1500, longitude: -2.7170 },
            { latitude: 51.1510, longitude: -2.7140 },
            { latitude: 51.1505, longitude: -2.7110 },
            { latitude: 51.1490, longitude: -2.7125 },
            { latitude: 51.1488, longitude: -2.7160 },
        ],
    },
    {
        id: 'camping',
        name: 'CAMPING FIELDS',
        type: 'camping',
        color: '#00FF88',
        fillOpacity: 0.1,
        coordinates: [
            { latitude: 51.1460, longitude: -2.7200 },
            { latitude: 51.1475, longitude: -2.7140 },
            { latitude: 51.1465, longitude: -2.7100 },
            { latitude: 51.1448, longitude: -2.7110 },
            { latitude: 51.1445, longitude: -2.7180 },
        ],
    },
    {
        id: 'medical',
        name: 'MEDICAL ZONE',
        type: 'medical',
        color: '#FF3344',
        fillOpacity: 0.15,
        coordinates: [
            { latitude: 51.1492, longitude: -2.7098 },
            { latitude: 51.1498, longitude: -2.7085 },
            { latitude: 51.1488, longitude: -2.7080 },
            { latitude: 51.1482, longitude: -2.7092 },
        ],
    },
    {
        id: 'water',
        name: 'WATER POINT',
        type: 'water',
        color: '#00BFFF',
        fillOpacity: 0.12,
        coordinates: [
            { latitude: 51.1478, longitude: -2.7155 },
            { latitude: 51.1483, longitude: -2.7145 },
            { latitude: 51.1477, longitude: -2.7138 },
            { latitude: 51.1472, longitude: -2.7148 },
        ],
    },
    {
        id: 'exit',
        name: 'MAIN EXIT',
        type: 'exit',
        color: '#FFB300',
        fillOpacity: 0.14,
        coordinates: [
            { latitude: 51.1455, longitude: -2.7220 },
            { latitude: 51.1460, longitude: -2.7210 },
            { latitude: 51.1450, longitude: -2.7205 },
            { latitude: 51.1445, longitude: -2.7215 },
        ],
    },
];

// ── POI data ──────────────────────────────────────────────

export const FESTIVAL_POIS: POI[] = [
    { id: 'med1', name: 'MEDICAL TENT A', type: 'medical', color: '#FF3344', coordinate: { latitude: 51.1495, longitude: -2.7090 } },
    { id: 'med2', name: 'MEDICAL TENT B', type: 'medical', color: '#FF3344', coordinate: { latitude: 51.1468, longitude: -2.7160 } },
    { id: 'wat1', name: 'WATER STATION 1', type: 'water', color: '#00BFFF', coordinate: { latitude: 51.1480, longitude: -2.7148 } },
    { id: 'wat2', name: 'WATER STATION 2', type: 'water', color: '#00BFFF', coordinate: { latitude: 51.1505, longitude: -2.7130 } },
    { id: 'toi1', name: 'TOILETS BLOCK A', type: 'toilets', color: '#FFB300', coordinate: { latitude: 51.1486, longitude: -2.7168 } },
    { id: 'toi2', name: 'TOILETS BLOCK B', type: 'toilets', color: '#FFB300', coordinate: { latitude: 51.1462, longitude: -2.7125 } },
    { id: 'lf1', name: 'LOST & FOUND', type: 'lost_found', color: '#00FFCC', coordinate: { latitude: 51.1490, longitude: -2.7155 } },
    { id: 'ent1', name: 'MAIN ENTRANCE', type: 'entrance', color: '#00FF88', coordinate: { latitude: 51.1452, longitude: -2.7218 } },
];

// ── Dark map style (Tron / Aubergine theme) ───────────────

export const DARK_MAP_STYLE = [
    { elementType: 'geometry', stylers: [{ color: '#0a0e1a' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0e1a' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#3a6a88' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2744' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#00f5ff22' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#00152a' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative', elementType: 'labels', stylers: [{ color: '#3a6a88' }] },
];

// ── GPS tracking ──────────────────────────────────────────

let locationSubscription: Location.LocationSubscription | null = null;

export async function requestLocationPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
}

export async function startGPSTracking(
    onUpdate: (location: LatLng) => void
): Promise<void> {
    if (locationSubscription) locationSubscription.remove();

    const granted = await requestLocationPermission();
    if (!granted) return;

    locationSubscription = await Location.watchPositionAsync(
        {
            accuracy: Location.Accuracy.High,
            timeInterval: GPS_UPDATE_MS,
            distanceInterval: 10,
        },
        (loc) => {
            onUpdate({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }
    );
}

export function stopGPSTracking(): void {
    if (locationSubscription) {
        locationSubscription.remove();
        locationSubscription = null;
    }
}

// ── Meetup point (AsyncStorage, no SQLite needed) ─────────

export async function getMeetupPoint(): Promise<MeetupPoint | null> {
    try {
        const raw = await AsyncStorage.getItem(MEETUP_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export async function saveMeetupPoint(coord: LatLng): Promise<void> {
    const point: MeetupPoint = {
        latitude: coord.latitude,
        longitude: coord.longitude,
        label: 'SQUAD MEETUP',
        savedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(MEETUP_KEY, JSON.stringify(point));
}

// ── Offline tile check ────────────────────────────────────

export async function checkOfflineTiles(festivalId = 'glastonbury'): Promise<boolean> {
    try {
        const path = `${FileSystem.documentDirectory}tr_packs/${festivalId}/map_tiles.json`;
        const info = await FileSystem.getInfoAsync(path);
        return info.exists;
    } catch {
        return false;
    }
}

// ── Distance calculation (Haversine) ─────────────────────

export function getDistanceMetres(a: LatLng, b: LatLng): number {
    const R = 6371000;
    const φ1 = (a.latitude * Math.PI) / 180;
    const φ2 = (b.latitude * Math.PI) / 180;
    const Δφ = ((b.latitude - a.latitude) * Math.PI) / 180;
    const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180;
    const x = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function formatDistance(metres: number): string {
    if (metres < 1000) return `${Math.round(metres)}M`;
    return `${(metres / 1000).toFixed(1)}KM`;
}
