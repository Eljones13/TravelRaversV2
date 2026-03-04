import { create } from 'zustand';
import { Festival, FESTIVALS, Region } from '../data/festivals';

export type FilterOption = 'ALL' | Region;

interface FestivalStore {
  festivals: Festival[];
  selectedFestival: Festival | null;
  activeFestival: Festival | null;
  activeFilter: FilterOption;
  setSelectedFestival: (festival: Festival) => void;
  setActiveFestival: (festival: Festival) => void;
  clearActiveFestival: () => void;
  setActiveFilter: (filter: FilterOption) => void;
  filteredFestivals: () => Festival[];
}

export const useFestivalStore = create<FestivalStore>((set, get) => ({
  festivals: FESTIVALS,
  selectedFestival: null,
  activeFestival: null,
  activeFilter: 'ALL',

  setSelectedFestival: (festival) => set({ selectedFestival: festival }),

  setActiveFestival: (festival) => set({ activeFestival: festival }),

  clearActiveFestival: () => set({ activeFestival: null }),

  setActiveFilter: (filter) => set({ activeFilter: filter }),

  filteredFestivals: () => {
    const { festivals, activeFilter } = get();
    if (activeFilter === 'ALL') return festivals;
    return festivals.filter((f) => f.region === activeFilter);
  },
}));
