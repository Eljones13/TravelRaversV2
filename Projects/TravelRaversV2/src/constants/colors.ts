// ============================================================
// TRAVEL RAVERS — COLOUR SYSTEM
// Source of truth: hud-design.md + assets/references/travel-ravers-v2.html
// DO NOT change these values without updating the reference HTML
// ============================================================

export const Colors = {
  // Core palette
  bg: '#03060f',           // Main app background (near-black navy)
  cyan: '#00f5ff',         // PRIMARY — borders, glows, highlights, active states
  magenta: '#ff00ff',      // SECONDARY — Radar screen, squad features
  yellow: '#ffff00',       // WARNING — alerts, custom events, caution states
  green: '#00ff88',        // SUCCESS — offline badge, confirmed actions, safe
  red: '#ff2244',          // DANGER — SOS, errors, critical alerts
  orange: '#ff8800',       // STAGE COLOUR — Timetable accents, warm highlights
  text: '#c8e8ff',         // BODY TEXT — soft blue-white
  dim: '#3a6a88',          // MUTED TEXT — labels, secondary info

  // Glass surfaces
  glass: 'rgba(6,16,32,0.6)',         // PANEL BASE
  glassBorder: 'rgba(0,245,255,0.18)', // GLASS BORDER — card edges

  // Tron Glass button palette (tron-glass-skill.md)
  tronBg: '#040C14',
  tronSurface: 'rgba(6, 16, 36, 0.85)',
  tronBorderBase: 'rgba(0, 200, 220, 0.3)',
  tronBorderBright: 'rgba(0, 255, 255, 0.8)',
  tronGlassBase: 'rgba(6, 16, 36, 0.88)',

  // Module accent colours (one per screen)
  module: {
    // ── PRIMARY (HomeScreen row 1 + 2) ──
    EVENTS: '#00FFFF',   // Cyan
    MAP: '#00FF88',   // Green
    TIMETABLE: '#FFB300',   // Amber
    KIT: '#FF8C00',   // Orange
    SOS: '#FF3344',   // Red
    TRACK: '#A855F7',   // Violet — TrackHunter
    // ── SECONDARY (HomeScreen row 3 + 4) ──
    RADAR: '#CC00FF',   // Purple — Nearby Festivals discovery
    WEATHER: '#00BFFF',   // Sky Blue — Weather & conditions
    PIXELPARTY: '#FF2D78',   // Hot Pink — Disposable photo albums
    BUDGET: '#FFD700',   // Gold — Expense splitter
    SQUAD: '#9D4EDD',   // Medium Purple — Squad hub
    SETUP: '#38BDF8',   // Light Blue — Squad configuration
  },
} as const;

export type ModuleId = keyof typeof Colors.module;
export type PrimaryModuleId = 'EVENTS' | 'MAP' | 'TIMETABLE' | 'KIT' | 'SOS' | 'TRACK';
export type SecondaryModuleId = 'RADAR' | 'WEATHER' | 'PIXELPARTY' | 'BUDGET' | 'SQUAD' | 'SETUP' | 'KIT';
