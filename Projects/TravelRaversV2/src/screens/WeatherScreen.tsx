// ============================================================
// TRAVEL RAVERS — WeatherScreen (Session 2-A: Full Build)
// Open-Meteo API (no key) · SQLite 2-hour cache · KIT alerts
// Accent: Sky Blue #00BFFF
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Platform,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db/database';
import { weatherCache, festivals } from '../db/schema';
import { Colors } from '../constants/colors';

// ── Constants ─────────────────────────────────────────────────
const C           = Colors.module.WEATHER;   // #00BFFF
const FESTIVAL_ID = 'creamfields-2026';
const CACHE_TTL   = 2 * 60 * 60 * 1000;     // 2 hours ms

// ── WMO weather code → emoji + label ─────────────────────────
const WMO: Record<number, { emoji: string; label: string }> = {
  0:  { emoji: '☀️',  label: 'CLEAR' },
  1:  { emoji: '🌤️', label: 'MOSTLY CLEAR' },
  2:  { emoji: '⛅',  label: 'PARTLY CLOUDY' },
  3:  { emoji: '🌥️', label: 'OVERCAST' },
  45: { emoji: '🌫️', label: 'FOG' },
  48: { emoji: '🌫️', label: 'FREEZING FOG' },
  51: { emoji: '🌦️', label: 'LIGHT DRIZZLE' },
  53: { emoji: '🌦️', label: 'DRIZZLE' },
  55: { emoji: '🌧️', label: 'HEAVY DRIZZLE' },
  61: { emoji: '🌧️', label: 'LIGHT RAIN' },
  63: { emoji: '🌧️', label: 'RAIN' },
  65: { emoji: '🌧️', label: 'HEAVY RAIN' },
  71: { emoji: '🌨️', label: 'LIGHT SNOW' },
  73: { emoji: '🌨️', label: 'SNOW' },
  75: { emoji: '❄️',  label: 'HEAVY SNOW' },
  80: { emoji: '🌦️', label: 'SHOWERS' },
  81: { emoji: '🌧️', label: 'HEAVY SHOWERS' },
  82: { emoji: '⛈️', label: 'VIOLENT SHOWERS' },
  95: { emoji: '⛈️', label: 'THUNDERSTORM' },
  96: { emoji: '⛈️', label: 'STORM + HAIL' },
  99: { emoji: '⛈️', label: 'SEVERE STORM' },
};
function wmo(code: number) {
  return WMO[code] ?? { emoji: '🌡️', label: 'UNKNOWN' };
}

// ── Open-Meteo response shape ─────────────────────────────────
interface WeatherData {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    weathercode: number;
    windspeed_10m: number;
    relativehumidity_2m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
  };
  daily: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
}

// ── KIT alert logic ───────────────────────────────────────────
function kitAlerts(d: WeatherData): string[] {
  const alerts: string[] = [];
  const maxRain = Math.max(...d.daily.precipitation_probability_max);
  const maxTemp = Math.max(...d.daily.temperature_2m_max);
  const minTemp = Math.min(...d.daily.temperature_2m_min);
  if (maxRain >= 60) alerts.push('🥾  PACK WELLIES — RAIN IN FORECAST');
  if (maxTemp >= 27) alerts.push('🧴  PACK SUNSCREEN — HOT DAYS AHEAD');
  if (minTemp <= 8)  alerts.push('🧥  PACK LAYERS — COLD NIGHTS EXPECTED');
  if (maxRain >= 80) alerts.push('⛺  SECURE YOUR TENT — STORM RISK');
  return alerts;
}

// ── Day abbreviation ──────────────────────────────────────────
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
function dayLabel(iso: string) { return DAYS[new Date(iso).getDay()]; }

// ── Glow helper ───────────────────────────────────────────────
function glow(color: string, r = 10) {
  return Platform.select({
    web: { boxShadow: `0 0 ${r}px ${color}55` } as object,
    default: { shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowRadius: r, shadowOpacity: 0.5 },
  });
}

// ── WeatherScreen ─────────────────────────────────────────────
export const WeatherScreen: React.FC = () => {
  const navigation  = useNavigation<any>();
  const [data,      setData]      = useState<WeatherData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const loadWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Check SQLite cache — serve if < 2h old
      const cached = await db.select().from(weatherCache)
        .where(eq(weatherCache.id, FESTIVAL_ID)).limit(1);

      if (cached[0]) {
        const age = Date.now() - new Date(cached[0].fetchedAt).getTime();
        if (age < CACHE_TTL) {
          setData(JSON.parse(cached[0].payload) as WeatherData);
          setFromCache(true);
          setLoading(false);
          return;
        }
      }

      // 2. Get festival lat/lon from DB
      const fest = await db
        .select({ lat: festivals.latitude, lon: festivals.longitude })
        .from(festivals).where(eq(festivals.id, FESTIVAL_ID)).limit(1);

      const lat = fest[0]?.lat ?? 53.302;
      const lon = fest[0]?.lon ?? -2.579;

      // 3. Fetch Open-Meteo (no API key)
      const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,relativehumidity_2m` +
        `&hourly=precipitation_probability,temperature_2m` +
        `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&timezone=Europe%2FLondon&forecast_days=5`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as WeatherData;

      // 4. Upsert into SQLite cache (fire-and-forget — non-blocking)
      void db.run(sql`
        INSERT OR REPLACE INTO weather_cache (id, fetched_at, payload)
        VALUES (${FESTIVAL_ID}, ${new Date().toISOString()}, ${JSON.stringify(json)})
      `);

      setData(json);
      setFromCache(false);
    } catch {
      setError('NO SIGNAL — SHOWING CACHED DATA');
      // Fallback: serve stale cache
      try {
        const stale = await db.select().from(weatherCache)
          .where(eq(weatherCache.id, FESTIVAL_ID)).limit(1);
        if (stale[0]) {
          setData(JSON.parse(stale[0].payload) as WeatherData);
          setFromCache(true);
        }
      } catch { /* no cache */ }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWeather(); }, [loadWeather]);

  // ── Hero (current conditions) ─────────────────────────────────
  function Hero({ d }: { d: WeatherData }) {
    const cur = d.current;
    const { emoji, label } = wmo(cur.weathercode);
    return (
      <View style={[s.heroCard, glow(C, 14)]}>
        <LinearGradient colors={['rgba(255,255,255,0.07)', 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject} pointerEvents="none" />
        <View style={s.lip} pointerEvents="none" />
        <View style={s.heroRow}>
          <Text style={s.heroEmoji}>{emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.heroTemp}>{Math.round(cur.temperature_2m)}°C</Text>
            <Text style={s.heroFeels}>FEELS {Math.round(cur.apparent_temperature)}°C</Text>
            <Text style={[s.heroLabel, { color: C }]}>{label}</Text>
          </View>
        </View>
        <View style={s.statsRow}>
          {[
            { val: `${Math.round(cur.windspeed_10m)}`, unit: 'KM/H WIND' },
            { val: `${cur.relativehumidity_2m}%`,      unit: 'HUMIDITY'  },
            { val: `${d.daily.precipitation_probability_max[0]}%`, unit: 'RAIN TODAY' },
          ].map((st, i) => (
            <React.Fragment key={st.unit}>
              {i > 0 && <View style={s.statDiv} />}
              <View style={s.stat}>
                <Text style={s.statVal}>{st.val}</Text>
                <Text style={s.statKey}>{st.unit}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </View>
    );
  }

  // ── Hourly rain bars ──────────────────────────────────────────
  function HourlyBars({ d }: { d: WeatherData }) {
    const now = new Date();
    const nowH = now.getHours();
    const startIdx = d.hourly.time.findIndex(t =>
      new Date(t).toDateString() === now.toDateString() && new Date(t).getHours() >= nowH
    );
    const times = d.hourly.time.slice(startIdx, startIdx + 12);
    const probs = d.hourly.precipitation_probability.slice(startIdx, startIdx + 12);
    return (
      <View style={[s.card, glow(C, 8)]}>
        <LinearGradient colors={['rgba(255,255,255,0.04)', 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject} pointerEvents="none" />
        <View style={s.lip} pointerEvents="none" />
        <Text style={s.sectionTitle}>NEXT 12 HOURS — RAIN %</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={s.barsRow}>
            {times.map((t, i) => {
              const pct = probs[i] ?? 0;
              const h   = new Date(t).getHours();
              const barH = Math.max(4, Math.floor((pct / 100) * 48));
              const col  = pct >= 60 ? C : pct >= 30 ? C + 'AA' : C + '44';
              return (
                <View key={t} style={s.barItem}>
                  <Text style={s.barPct}>{pct}%</Text>
                  <View style={s.barTrack}>
                    <View style={[s.barFill, { height: barH, backgroundColor: col }]} />
                  </View>
                  <Text style={s.barHour}>{String(h).padStart(2, '0')}H</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── 5-day forecast ────────────────────────────────────────────
  function DailyForecast({ d }: { d: WeatherData }) {
    return (
      <View style={[s.card, glow(C, 8)]}>
        <LinearGradient colors={['rgba(255,255,255,0.04)', 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject} pointerEvents="none" />
        <View style={s.lip} pointerEvents="none" />
        <Text style={s.sectionTitle}>5-DAY FORECAST</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={s.dailyRow}>
            {d.daily.time.map((t, i) => {
              const { emoji } = wmo(d.daily.weathercode[i]);
              return (
                <View key={t} style={[s.dayCard, { borderColor: C + '33' }]}>
                  <Text style={s.dayName}>{dayLabel(t)}</Text>
                  <Text style={s.dayEmoji}>{emoji}</Text>
                  <Text style={[s.dayMax, { color: C }]}>{Math.round(d.daily.temperature_2m_max[i])}°</Text>
                  <Text style={s.dayMin}>{Math.round(d.daily.temperature_2m_min[i])}°</Text>
                  <Text style={s.dayRain}>💧{d.daily.precipitation_probability_max[i]}%</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── KIT alerts card ───────────────────────────────────────────
  function KitAlerts({ d }: { d: WeatherData }) {
    const alerts = kitAlerts(d);
    if (!alerts.length) return null;
    return (
      <View style={[s.alertCard, glow('#ff8800', 10)]}>
        <LinearGradient colors={['rgba(255,136,0,0.08)', 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject} pointerEvents="none" />
        <View style={[s.lip, { backgroundColor: '#ff8800', opacity: 0.4 }]} pointerEvents="none" />
        <Text style={s.alertTitle}>⚠️  KIT ALERTS</Text>
        {alerts.map(a => <Text key={a} style={s.alertItem}>{a}</Text>)}
      </View>
    );
  }

  // ── Main render ───────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={[s.backText, { color: C }]}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[s.headerTitle, { color: C }]}>WEATHER</Text>
          <Text style={s.headerSub}>CREAMFIELDS 2026</Text>
        </View>
        <View style={[s.badge,
          fromCache
            ? { borderColor: Colors.dim + '66', backgroundColor: 'rgba(58,106,136,0.1)' }
            : { borderColor: Colors.green + '66', backgroundColor: 'rgba(0,255,136,0.08)' }
        ]}>
          <Text style={[s.badgeText, { color: fromCache ? Colors.dim : Colors.green }]}>
            {fromCache ? '💾 CACHED' : '🌐 LIVE'}
          </Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={s.centred}>
          <ActivityIndicator color={C} size="large" />
          <Text style={s.loadingText}>FETCHING CONDITIONS…</Text>
        </View>
      ) : !data ? (
        <View style={s.centred}>
          <Text style={s.errorText}>{error ?? 'NO DATA'}</Text>
          <TouchableOpacity style={[s.retryBtn, { borderColor: C + '66' }]} onPress={loadWeather}>
            <Text style={[s.retryText, { color: C }]}>↺  RETRY</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}>
          {error && (
            <View style={s.errorBanner}>
              <Text style={s.errorBannerText}>{error}</Text>
            </View>
          )}
          <Hero d={data} />
          <HourlyBars d={data} />
          <DailyForecast d={data} />
          <KitAlerts d={data} />
          <TouchableOpacity style={[s.refreshBtn, glow(C, 8)]} onPress={loadWeather}>
            <Text style={[s.refreshText, { color: C }]}>↺  REFRESH CONDITIONS</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { padding: 12, gap: 10 },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderBottomWidth: 1, borderBottomColor: C + '22',
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C + '44', backgroundColor: C + '11',
  },
  backText: { fontSize: 18, fontWeight: '700' },
  headerTitle: {
    fontFamily: 'Orbitron_700Bold', fontSize: 13, letterSpacing: 3, textTransform: 'uppercase',
  },
  headerSub: {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 9,
    color: Colors.dim, letterSpacing: 2, textTransform: 'uppercase',
  },
  badge: {
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3,
  },
  badgeText: {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 8, letterSpacing: 1, textTransform: 'uppercase',
  },

  centred:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 11,
    color: Colors.dim, letterSpacing: 2, textTransform: 'uppercase',
  },
  errorText: {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 11,
    color: Colors.red, letterSpacing: 2, textTransform: 'uppercase',
    textAlign: 'center', paddingHorizontal: 32,
  },
  retryBtn: {
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8,
  },
  retryText: {
    fontFamily: 'Orbitron_700Bold', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
  },
  errorBanner: {
    backgroundColor: 'rgba(255,34,68,0.08)', borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: Colors.red + '44',
  },
  errorBannerText: {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 9, color: Colors.red,
    letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'center',
  },

  // Shared card
  card: {
    backgroundColor: 'rgba(6,16,36,0.92)', borderRadius: 14,
    borderWidth: 1, borderColor: C + '33', overflow: 'hidden', padding: 14,
  },
  lip: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 1.5, backgroundColor: 'white', opacity: 0.15,
  },
  sectionTitle: {
    fontFamily: 'Orbitron_700Bold', fontSize: 9, color: C,
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12,
  },

  // Hero
  heroCard: {
    backgroundColor: 'rgba(6,16,36,0.95)', borderRadius: 16,
    borderWidth: 1.5, borderColor: C + '55', overflow: 'hidden', padding: 18,
  },
  heroRow:   { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  heroEmoji: { fontSize: 54 },
  heroTemp:  { fontFamily: 'Orbitron_700Bold', fontSize: 40, color: '#fff', lineHeight: 44 },
  heroFeels: {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 10,
    color: Colors.dim, letterSpacing: 1.5, textTransform: 'uppercase',
  },
  heroLabel: {
    fontFamily: 'Orbitron_700Bold', fontSize: 11, letterSpacing: 2,
    textTransform: 'uppercase', marginTop: 3,
  },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: C + '22', paddingTop: 12,
  },
  stat:    { flex: 1, alignItems: 'center' },
  statVal: { fontFamily: 'Orbitron_700Bold', fontSize: 16, color: '#fff' },
  statKey: {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 8,
    color: Colors.dim, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 2,
  },
  statDiv: { width: 1, height: 28, backgroundColor: C + '22' },

  // Hourly bars
  barsRow: { flexDirection: 'row', gap: 6, paddingBottom: 4 },
  barItem: { alignItems: 'center', width: 34 },
  barPct: {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 7,
    color: Colors.text, letterSpacing: 0.5, marginBottom: 4,
  },
  barTrack: {
    width: 12, height: 48, backgroundColor: 'rgba(0,191,255,0.08)',
    borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden',
  },
  barFill:  { width: '100%', borderRadius: 4 },
  barHour: {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 7,
    color: Colors.dim, letterSpacing: 0.5, marginTop: 4,
  },

  // Daily
  dailyRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  dayCard: {
    width: 72, alignItems: 'center', padding: 10,
    backgroundColor: C + '0A', borderRadius: 10, borderWidth: 1,
  },
  dayName: {
    fontFamily: 'Orbitron_700Bold', fontSize: 8,
    color: Colors.dim, letterSpacing: 1.5, marginBottom: 6,
  },
  dayEmoji: { fontSize: 22, marginBottom: 4 },
  dayMax:   { fontFamily: 'Orbitron_700Bold', fontSize: 14, letterSpacing: 0.5 },
  dayMin:   { fontFamily: 'ShareTechMono_400Regular', fontSize: 10, color: Colors.dim, marginTop: 2 },
  dayRain:  {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 8,
    color: Colors.text + 'AA', marginTop: 4,
  },

  // Alerts
  alertCard: {
    backgroundColor: 'rgba(6,16,36,0.92)', borderRadius: 14,
    borderWidth: 1, borderColor: '#ff8800' + '55', overflow: 'hidden', padding: 14, gap: 8,
  },
  alertTitle: {
    fontFamily: 'Orbitron_700Bold', fontSize: 10,
    color: '#ff8800', letterSpacing: 2, textTransform: 'uppercase',
  },
  alertItem: {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 11,
    color: Colors.text, letterSpacing: 1, textTransform: 'uppercase',
  },

  refreshBtn: {
    borderWidth: 1, borderColor: C + '44', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center', backgroundColor: C + '08', marginTop: 4,
  },
  refreshText: {
    fontFamily: 'Orbitron_700Bold', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
  },
});

export default WeatherScreen;
