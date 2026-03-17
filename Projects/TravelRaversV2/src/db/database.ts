// ============================================================
// TRAVEL RAVERS — Database Initialiser
// Native: expo-sqlite + Drizzle ORM (travel-ravers.db)
// Web:    silent mock — expo-sqlite NativeDatabase is not a
//         constructor in browsers. The mock returns empty arrays
//         so every screen renders without crashing.
// ============================================================

import { Platform } from 'react-native';
import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

// ── Web mock ──────────────────────────────────────────────────
// Provides a fully chainable no-op that mirrors the Drizzle query
// builder surface used across the app:
//   db.select().from().where().limit()  → []
//   db.insert().values()                → []
//   db.run()                            → undefined
function makeChain(): Record<string, unknown> {
  const chain: Record<string, unknown> = {
    from:    () => chain,
    where:   () => chain,
    limit:   () => Promise.resolve([]),
    values:  () => Promise.resolve([]),
    run:     () => Promise.resolve(undefined),
    // Thenability — so `await db.select()...` resolves cleanly
    then:    (onFulfilled: (v: never[]) => unknown) =>
               Promise.resolve([] as never[]).then(onFulfilled),
    catch:   (onRejected: (e: unknown) => unknown) =>
               Promise.resolve([] as never[]).catch(onRejected),
    finally: (onFinally: () => void) =>
               Promise.resolve([] as never[]).finally(onFinally),
  };
  return chain;
}

const WEB_MOCK = {
  select:  () => makeChain(),
  insert:  () => makeChain(),
  update:  () => makeChain(),
  delete:  () => makeChain(),
  run:     (_?: unknown) => Promise.resolve(undefined),
  execute: (_?: unknown) => Promise.resolve(undefined),
};

// ── Native factory (only called when Platform.OS !== 'web') ───
// Keeping openDatabaseSync inside this function body ensures it
// is never invoked during web bundle evaluation.
function createNativeDb(): ExpoSQLiteDatabase<typeof schema> {
  const expo = openDatabaseSync('travel-ravers.db');
  return drizzle(expo, { schema });
}

// ── Single exported db instance ───────────────────────────────
export const db: ExpoSQLiteDatabase<typeof schema> =
  Platform.OS === 'web'
    ? (WEB_MOCK as unknown as ExpoSQLiteDatabase<typeof schema>)
    : createNativeDb();

// ── Table creation (skipped on web) ───────────────────────────
let _initialised = false;

export async function initDatabase(): Promise<void> {
  if (_initialised || Platform.OS === 'web') return;

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS festivals (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      country      TEXT NOT NULL,
      start_date   TEXT NOT NULL,
      end_date     TEXT NOT NULL,
      ticket_price TEXT,
      latitude     REAL,
      longitude    REAL,
      is_cashless  INTEGER
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS artists (
      artist_id      TEXT PRIMARY KEY,
      festival_id    TEXT NOT NULL REFERENCES festivals(id),
      name           TEXT NOT NULL,
      genre          TEXT,
      vibe           TEXT,
      typical_stage  TEXT,
      energy_score   INTEGER,
      darkness_score INTEGER
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS festival_logistics (
      id                      TEXT PRIMARY KEY,
      festival_id             TEXT REFERENCES festivals(id),
      festival_name           TEXT NOT NULL,
      hospital_name           TEXT,
      hospital_distance_miles REAL,
      train_station           TEXT,
      avg_day_temp_c          REAL,
      avg_night_temp_c        REAL
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS weather_cache (
      id         TEXT PRIMARY KEY,
      fetched_at TEXT NOT NULL,
      payload    TEXT NOT NULL
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS expenses (
      id          TEXT PRIMARY KEY,
      festival_id TEXT,
      description TEXT NOT NULL,
      amount      REAL NOT NULL,
      paid_by     TEXT NOT NULL,
      category    TEXT NOT NULL,
      created_at  TEXT NOT NULL
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS setlist_tracks (
      id            TEXT PRIMARY KEY,
      festival_id   TEXT,
      title         TEXT NOT NULL,
      artist        TEXT NOT NULL,
      identified_at TEXT NOT NULL,
      spotify_uri   TEXT,
      notes         TEXT
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS squad_members (
      id                TEXT PRIMARY KEY,
      name              TEXT NOT NULL,
      nickname          TEXT,
      role              TEXT NOT NULL,
      avatar            TEXT NOT NULL,
      emergency_contact TEXT,
      phone             TEXT,
      created_at        TEXT NOT NULL
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS squad_config (
      id          TEXT PRIMARY KEY,
      squad_name  TEXT NOT NULL,
      homebase    TEXT,
      festival_id TEXT
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS pixel_albums (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      code       TEXT NOT NULL,
      created_at TEXT NOT NULL,
      reveal_at  TEXT
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS pixel_photos (
      id       TEXT PRIMARY KEY,
      album_id TEXT NOT NULL,
      uri      TEXT NOT NULL,
      taken_at TEXT NOT NULL
    )
  `);

  // ── Offline Radar waypoints ──────────────────────────────
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS waypoints (
      id         TEXT    PRIMARY KEY,
      title      TEXT    NOT NULL,
      latitude   REAL    NOT NULL,
      longitude  REAL    NOT NULL,
      icon_type  TEXT    NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  // ── Festival context (selected festival full JSON) ────────
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS festival_context (
      id        TEXT PRIMARY KEY,
      json_data TEXT NOT NULL
    )
  `);

  // ── Stages ───────────────────────────────────────────────
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS stages (
      id          TEXT PRIMARY KEY,
      festival_id TEXT NOT NULL,
      name        TEXT NOT NULL,
      color       TEXT NOT NULL
    )
  `);

  // ── User favourites ───────────────────────────────────────
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS user_faves (
      artist_id   TEXT NOT NULL,
      festival_id TEXT NOT NULL,
      PRIMARY KEY (artist_id, festival_id)
    )
  `);

  _initialised = true;
}
