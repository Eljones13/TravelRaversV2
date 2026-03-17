// ============================================================
// TRAVEL RAVERS — Database Seed
// Populates festivals, artists, festival_logistics
// Safe to call multiple times — checks before inserting
// ============================================================

import { db } from './database';
import { festivals as festivalsTable, artists as artistsTable, festivalLogistics as logisticsTable } from './schema';
import festivalsData from './seed-data/festivals2026.json';
import artistsData from './seed-data/creamfields_artists_2026.json';
import logisticsData from './seed-data/logistics.json';

// Maps logistics festivalName strings to festival IDs in festivals2026.json
const LOGISTICS_NAME_TO_ID: Record<string, string> = {
  'Creamfields 2026': 'creamfields-2026',
  'Boomtown Fair':    'boomtown-2026',
  // 'Glastonbury' has no match in festivals2026.json — festival_id will be null
};

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function seedDatabase(): Promise<void> {
  // Guard: skip if festivals already exist
  const existing = await db
    .select({ id: festivalsTable.id })
    .from(festivalsTable)
    .limit(1);

  if (existing.length > 0) {
    console.log('[DB] Seed already applied — skipping');
    return;
  }

  console.log('[DB] Seeding festivals...');
  await db.insert(festivalsTable).values(
    festivalsData.map((f) => ({
      id: f.id,
      name: f.name,
      country: f.country,
      startDate: f.startDate,
      endDate: f.endDate,
      ticketPrice: f.ticketPrice ?? null,
      latitude: f.latitude ?? null,
      longitude: f.longitude ?? null,
      isCashless: f.isCashless,
    }))
  );

  console.log(`[DB] Inserted ${festivalsData.length} festivals`);

  console.log('[DB] Seeding Creamfields 2026 artists...');
  await db.insert(artistsTable).values(
    artistsData.map((a) => ({
      artistId: a.artistId,
      festivalId: 'creamfields-2026',
      name: a.name,
      genre: a.genre ?? null,
      vibe: a.vibe ?? null,
      typicalStage: a.typicalStage ?? null,
      energyScore: a.energyScore ?? null,
      darknessScore: a.darknessScore ?? null,
    }))
  );

  console.log(`[DB] Inserted ${artistsData.length} artists → linked to creamfields-2026`);

  console.log('[DB] Seeding festival logistics...');
  await db.insert(logisticsTable).values(
    logisticsData.map((l) => ({
      id:                     `logistics-${slugify(l.festivalName)}`,
      festivalId:             LOGISTICS_NAME_TO_ID[l.festivalName] ?? null,
      festivalName:           l.festivalName,
      hospitalName:           l.nearestHospitalName ?? null,
      hospitalDistanceMiles:  l.hospitalDistanceMiles ?? null,
      trainStation:           l.nearestTrainStation ?? null,
      avgDayTempC:            l.avgDayTempC ?? null,
      avgNightTempC:          l.avgNightTempC ?? null,
    }))
  );

  console.log(`[DB] Inserted ${logisticsData.length} logistics rows`);
  console.log('[DB] Seed complete ✓');
}
