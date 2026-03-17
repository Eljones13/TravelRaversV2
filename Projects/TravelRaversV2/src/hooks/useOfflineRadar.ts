// ============================================================
// TRAVEL RAVERS — useOfflineRadar
// Offline-first GPS + compass hook for the Radar module.
//
// ZERO network dependency — all maths run locally on-device.
//
// What this hook provides:
//   • Real-time GPS coordinates via expo-location watchPositionAsync
//   • Device compass heading via expo-location watchHeadingAsync
//     (watchHeadingAsync is the high-level API that sits on top of
//     the raw hardware magnetometer exposed by expo-sensors. Using
//     the OS-processed heading avoids manual tilt compensation and
//     magnetic declination calculations, giving a more accurate
//     and battery-efficient result than reading raw μT values.)
//   • haversineDistance()  — pure offline distance in metres
//   • absoluteBearing()    — true-North bearing to a target (°)
//   • relativeBearing()    — compass-adjusted bearing so a UI
//     arrow can point directly at the target in world space
//
// Usage:
//   const { heading, distance, bearing, error } = useOfflineRadar({
//     targetLat: 53.302,
//     targetLon: -2.579,   // e.g. Creamfields main stage
//   });
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import type {
  LocationObject,
  LocationSubscription,
  LocationHeadingObject,
} from 'expo-location';

// ─── Earth radius constant ───────────────────────────────────
// WGS-84 mean Earth radius in metres (used for Haversine).
const EARTH_RADIUS_M = 6_371_000;

// ─── Degree / Radian helpers ─────────────────────────────────

/** Convert degrees → radians */
const toRad = (deg: number): number => (deg * Math.PI) / 180;

/** Convert radians → degrees */
const toDeg = (rad: number): number => (rad * 180) / Math.PI;

// ─── Pure maths functions (export for unit testing) ──────────

/**
 * Haversine distance formula.
 *
 * Calculates the shortest great-circle distance (metres) between
 * two latitude/longitude points on the surface of the Earth.
 * Accurate to within ~0.5 % for distances < 500 km — more than
 * sufficient for a festival site.
 *
 * @param lat1 - User latitude  (decimal degrees)
 * @param lon1 - User longitude (decimal degrees)
 * @param lat2 - Target latitude  (decimal degrees)
 * @param lon2 - Target longitude (decimal degrees)
 * @returns Distance in metres
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_M * c;
}

/**
 * Absolute (true-North) bearing from point A to point B.
 *
 * Returns the initial bearing you would need to travel in a
 * straight line from A to reach B, measured clockwise from
 * geographic North (0 = N, 90 = E, 180 = S, 270 = W).
 *
 * @param lat1 - User latitude  (decimal degrees)
 * @param lon1 - User longitude (decimal degrees)
 * @param lat2 - Target latitude  (decimal degrees)
 * @param lon2 - Target longitude (decimal degrees)
 * @returns Bearing in degrees [0, 360)
 */
export function absoluteBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  // atan2 returns [-π, π]; normalise to [0, 360)
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * Relative bearing — the angle a UI arrow should display to
 * point directly at a target given the device's current
 * compass heading.
 *
 * Formula:  relativeBearing = (absoluteBearing − deviceHeading + 360) % 360
 *
 * Example:
 *   absoluteBearing = 90° (target is due East)
 *   deviceHeading   = 45° (device pointing NE)
 *   relativeBearing = 45° → arrow tilts 45° clockwise from up
 *
 * @param absBearing  - Absolute bearing to target (°)
 * @param deviceHeading - Current compass heading of device (°)
 * @returns Relative bearing in degrees [0, 360)
 */
export function relativeBearing(
  absBearing: number,
  deviceHeading: number,
): number {
  return (absBearing - deviceHeading + 360) % 360;
}

// ─── Hook types ──────────────────────────────────────────────

export interface UseOfflineRadarOptions {
  /**
   * Target latitude in decimal degrees.
   * Supply both targetLat and targetLon to get distance + bearing.
   */
  targetLat?: number;
  /**
   * Target longitude in decimal degrees.
   */
  targetLon?: number;
  /**
   * Location accuracy. Defaults to Balanced (good accuracy/battery trade-off).
   */
  accuracy?: Location.LocationAccuracy;
  /**
   * Minimum distance change (metres) required before a new GPS update is emitted.
   * Defaults to 2 m — appropriate for walking-speed navigation on a festival site.
   */
  distanceInterval?: number;
}

export interface UseOfflineRadarResult {
  /** Whether foreground location permission has been granted. */
  permissionGranted: boolean;

  /** Current device latitude (null until first GPS fix). */
  userLat: number | null;
  /** Current device longitude (null until first GPS fix). */
  userLon: number | null;

  /**
   * Device compass heading in degrees [0, 360).
   * 0 = North, 90 = East, 180 = South, 270 = West.
   * Uses trueHeading where available (requires location permission),
   * falls back to magHeading otherwise.
   * Null until first compass reading.
   */
  heading: number | null;

  /**
   * Straight-line Haversine distance to target in metres.
   * Null if no target is provided or GPS fix not yet acquired.
   */
  distance: number | null;

  /**
   * Relative bearing to target adjusted for device heading.
   * Use this to rotate a UI arrow — 0° means the target is
   * directly ahead of the device's current facing direction.
   * Null if no target or heading not yet available.
   */
  bearing: number | null;

  /**
   * Absolute true-North bearing to target.
   * Useful for displaying a fixed compass rose.
   * Null if no target or GPS fix not yet acquired.
   */
  absoluteBearingToTarget: number | null;

  /**
   * Human-readable error string, or null when everything is working.
   */
  error: string | null;
}

// ─── Hook implementation ─────────────────────────────────────

export function useOfflineRadar(
  options: UseOfflineRadarOptions = {},
): UseOfflineRadarResult {
  const {
    targetLat,
    targetLon,
    accuracy = Location.LocationAccuracy.Balanced,
    distanceInterval = 2,
  } = options;

  // ── State ──────────────────────────────────────────────────
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [userLat, setUserLat]     = useState<number | null>(null);
  const [userLon, setUserLon]     = useState<number | null>(null);
  const [heading, setHeading]     = useState<number | null>(null);
  const [error, setError]         = useState<string | null>(null);

  // Refs keep the latest GPS/heading values accessible inside
  // the cleanup callbacks without causing re-subscription.
  const latRef     = useRef<number | null>(null);
  const lonRef     = useRef<number | null>(null);
  const headingRef = useRef<number | null>(null);

  // Subscription handles for cleanup
  const posSubRef     = useRef<LocationSubscription | null>(null);
  const headingSubRef = useRef<LocationSubscription | null>(null);

  // ── Permission + subscription setup ───────────────────────
  useEffect(() => {
    let cancelled = false;

    async function startTracking(): Promise<void> {
      // 1. Request foreground location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (cancelled) return;

      if (status !== 'granted') {
        setError('Location permission denied. Enable it in device Settings to use Radar.');
        setPermissionGranted(false);
        return;
      }

      setPermissionGranted(true);
      setError(null);

      // 2. Subscribe to GPS position updates
      try {
        posSubRef.current = await Location.watchPositionAsync(
          {
            accuracy,
            distanceInterval,
          },
          (location: LocationObject) => {
            if (cancelled) return;
            const { latitude, longitude } = location.coords;
            latRef.current = latitude;
            lonRef.current  = longitude;
            setUserLat(latitude);
            setUserLon(longitude);
          },
        );
      } catch (e) {
        if (!cancelled) {
          setError(`GPS error: ${e instanceof Error ? e.message : String(e)}`);
        }
      }

      // 3. Subscribe to compass heading via expo-location
      //    watchHeadingAsync uses the device magnetometer (same
      //    hardware as expo-sensors Magnetometer) but applies
      //    OS-level tilt compensation and magnetic declination
      //    correction, giving a stable, accurate compass heading
      //    without manual signal processing.
      try {
        headingSubRef.current = await Location.watchHeadingAsync(
          (headingObj: LocationHeadingObject) => {
            if (cancelled) return;
            // Prefer trueHeading (requires GPS signal) — it
            // accounts for magnetic declination at the device's
            // actual position. Fall back to magnetic heading.
            const h =
              headingObj.trueHeading >= 0
                ? headingObj.trueHeading
                : headingObj.magHeading;
            headingRef.current = h;
            setHeading(h);
          },
        );
      } catch (e) {
        if (!cancelled) {
          // Compass failure is non-fatal — arrows use absolute
          // bearing instead; distance still works fine.
          setError(`Compass error: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    }

    startTracking();

    // Cleanup: remove subscriptions when component unmounts
    return () => {
      cancelled = true;
      posSubRef.current?.remove();
      headingSubRef.current?.remove();
    };
  }, [accuracy, distanceInterval]);

  // ── Derived values (calculated on every render from state) ─
  // These are cheap pure-function calls — no useCallback needed.

  let distance:                number | null = null;
  let absoluteBearingToTarget: number | null = null;
  let bearing:                 number | null = null;

  if (
    userLat !== null &&
    userLon !== null &&
    targetLat !== undefined &&
    targetLon !== undefined
  ) {
    distance                = haversineDistance(userLat, userLon, targetLat, targetLon);
    absoluteBearingToTarget = absoluteBearing(userLat, userLon, targetLat, targetLon);

    if (heading !== null) {
      bearing = relativeBearing(absoluteBearingToTarget, heading);
    }
  }

  return {
    permissionGranted,
    userLat,
    userLon,
    heading,
    distance,
    bearing,
    absoluteBearingToTarget,
    error,
  };
}

// ─── Formatting helpers (exported for UI convenience) ─────────

/**
 * Format a distance value into a human-readable string.
 *   < 1 000 m  →  "342 m"
 *   ≥ 1 000 m  →  "1.3 km"
 */
export function formatDistance(metres: number | null): string {
  if (metres === null) return '---';
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

/**
 * Format a bearing into a cardinal direction label.
 * Useful for displaying "NE · 342 m" style readouts.
 */
export function formatCardinal(degrees: number | null): string {
  if (degrees === null) return '---';
  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return cardinals[index];
}
