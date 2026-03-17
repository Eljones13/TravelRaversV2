// ============================================================
// TRAVEL RAVERS — FestivalContext
// Provides selected festival to every screen in the app.
// Persistence: AsyncStorage (festival ID) → hydrated from
// FESTIVALS array on startup. SQLite stores full JSON for
// offline screen consumption.
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { type Festival, FESTIVALS } from '../data/festivals';
import { db } from '../db/database';
import { sql } from 'drizzle-orm';

const STORAGE_KEY = 'selected_festival_id';

// ── Context shape ─────────────────────────────────────────────
type FestivalContextValue = {
  selectedFestival: Festival | null;
  isLoading: boolean;
  setFestival: (festival: Festival) => Promise<void>;
  clearFestival: () => Promise<void>;
};

const FestivalContext = createContext<FestivalContextValue | null>(null);

// ── SQLite write helper (native only) ────────────────────────
async function persistToSQLite(festival: Festival): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await db.run(sql`
      INSERT OR REPLACE INTO festival_context (id, json_data)
      VALUES (${festival.id}, ${JSON.stringify(festival)})
    `);
  } catch {
    // Non-fatal — AsyncStorage is the primary store
  }
}

// ── Provider ──────────────────────────────────────────────────
export const FestivalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedFestival, setSelectedFestivalState] = useState<Festival | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Hydrate from AsyncStorage on mount ──
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((id) => {
        if (id) {
          const found = FESTIVALS.find((f) => f.id === id) ?? null;
          setSelectedFestivalState(found);
        }
      })
      .catch(() => {
        // Could not read storage — start with no festival selected
      })
      .finally(() => setIsLoading(false));
  }, []);

  const setFestival = useCallback(async (festival: Festival): Promise<void> => {
    setSelectedFestivalState(festival);
    await AsyncStorage.setItem(STORAGE_KEY, festival.id);
    await persistToSQLite(festival);
  }, []);

  const clearFestival = useCallback(async (): Promise<void> => {
    setSelectedFestivalState(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <FestivalContext.Provider value={{ selectedFestival, isLoading, setFestival, clearFestival }}>
      {children}
    </FestivalContext.Provider>
  );
};

// ── useFestival hook ──────────────────────────────────────────
export function useFestival(): FestivalContextValue {
  const ctx = useContext(FestivalContext);
  if (!ctx) {
    throw new Error('useFestival must be used inside <FestivalProvider>');
  }
  return ctx;
}
