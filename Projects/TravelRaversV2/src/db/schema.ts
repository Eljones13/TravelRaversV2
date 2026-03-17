// ============================================================
// TRAVEL RAVERS — Drizzle ORM Schema
// Tables: festivals, artists, festival_logistics, waypoints
// ============================================================

import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const festivals = sqliteTable('festivals', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  country: text('country').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  ticketPrice: text('ticket_price'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  isCashless: integer('is_cashless', { mode: 'boolean' }),
});

export const artists = sqliteTable('artists', {
  artistId: text('artist_id').primaryKey(),
  festivalId: text('festival_id')
    .notNull()
    .references(() => festivals.id),
  name: text('name').notNull(),
  genre: text('genre'),
  vibe: text('vibe'),
  typicalStage: text('typical_stage'),
  energyScore: integer('energy_score'),
  darknessScore: integer('darkness_score'),
});

export const festivalLogistics = sqliteTable('festival_logistics', {
  id: text('id').primaryKey(),
  festivalId: text('festival_id').references(() => festivals.id), // nullable — some entries may not have a matching festival
  festivalName: text('festival_name').notNull(),
  hospitalName: text('hospital_name'),
  hospitalDistanceMiles: real('hospital_distance_miles'),
  trainStation: text('train_station'),
  avgDayTempC: real('avg_day_temp_c'),
  avgNightTempC: real('avg_night_temp_c'),
});

// ── Weather cache ─────────────────────────────────────────────
export const weatherCache = sqliteTable('weather_cache', {
  id:        text('id').primaryKey(),          // festival_id
  fetchedAt: text('fetched_at').notNull(),     // ISO timestamp
  payload:   text('payload').notNull(),        // JSON blob from Open-Meteo
});

// ── Expenses (Budget splitter) ────────────────────────────────
export const expenses = sqliteTable('expenses', {
  id:          text('id').primaryKey(),
  festivalId:  text('festival_id'),
  description: text('description').notNull(),
  amount:      real('amount').notNull(),
  paidBy:      text('paid_by').notNull(),
  category:    text('category').notNull(),     // food | drinks | travel | camp | other
  createdAt:   text('created_at').notNull(),
});

// ── Setlist tracks (TrackHunter) ──────────────────────────────
export const setlistTracks = sqliteTable('setlist_tracks', {
  id:           text('id').primaryKey(),
  festivalId:   text('festival_id'),
  title:        text('title').notNull(),
  artist:       text('artist').notNull(),
  identifiedAt: text('identified_at').notNull(),  // ISO timestamp
  spotifyUri:   text('spotify_uri'),               // spotify:search:... deep link
  notes:        text('notes'),
});

// ── Squad members (SquadSetup) ────────────────────────────────
export const squadMembers = sqliteTable('squad_members', {
  id:               text('id').primaryKey(),
  name:             text('name').notNull(),
  nickname:         text('nickname'),
  role:             text('role').notNull(),          // CAPTAIN | NAVIGATOR | MEDIC | DJ | CREW
  avatar:           text('avatar').notNull(),         // emoji character
  emergencyContact: text('emergency_contact'),        // contact name
  phone:            text('phone'),
  createdAt:        text('created_at').notNull(),
});

// ── Squad config (single row, id='default') ───────────────────
export const squadConfig = sqliteTable('squad_config', {
  id:         text('id').primaryKey(),               // always 'default'
  squadName:  text('squad_name').notNull(),
  homebase:   text('homebase'),
  festivalId: text('festival_id'),
});

// ── Pixel Party albums & photos ───────────────────────────────
export const pixelAlbums = sqliteTable('pixel_albums', {
  id:        text('id').primaryKey(),
  name:      text('name').notNull(),
  code:      text('code').notNull(),                 // 6-char share code
  createdAt: text('created_at').notNull(),
  revealAt:  text('reveal_at'),                      // ISO date — photos locked until this date
});

export const pixelPhotos = sqliteTable('pixel_photos', {
  id:      text('id').primaryKey(),
  albumId: text('album_id').notNull(),
  uri:     text('uri').notNull(),                    // local expo-file-system URI
  takenAt: text('taken_at').notNull(),
});

// ── Offline Radar waypoints ────────────────────────────────────
// User-dropped pins stored fully offline — no network required.
// iconType maps to a Tron SVG variant (tent | stage | medic | food | exit | custom).
export const waypoints = sqliteTable('waypoints', {
  id:        text('id').primaryKey(),              // uuid generated client-side
  title:     text('title').notNull(),              // e.g. "My Tent", "Main Stage"
  latitude:  real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  iconType:  text('icon_type').notNull(),          // tent | stage | medic | food | exit | custom
  createdAt: integer('created_at').notNull(),      // Unix epoch ms (Date.now())
});

export type Festival = typeof festivals.$inferSelect;
export type NewFestival = typeof festivals.$inferInsert;
export type Artist = typeof artists.$inferSelect;
export type NewArtist = typeof artists.$inferInsert;
export type FestivalLogistics = typeof festivalLogistics.$inferSelect;
export type NewFestivalLogistics = typeof festivalLogistics.$inferInsert;
export type SetlistTrack = typeof setlistTracks.$inferSelect;
export type SquadMember = typeof squadMembers.$inferSelect;
export type SquadConfig = typeof squadConfig.$inferSelect;
export type PixelAlbum = typeof pixelAlbums.$inferSelect;
export type PixelPhoto = typeof pixelPhotos.$inferSelect;
export type Waypoint    = typeof waypoints.$inferSelect;
export type NewWaypoint = typeof waypoints.$inferInsert;
