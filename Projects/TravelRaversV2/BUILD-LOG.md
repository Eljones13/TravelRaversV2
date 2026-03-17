# TRAVEL RAVERS BUILD LOG
# Session handoff document — update at END of every session
# Last Updated: 2026-03-17

---

### SESSION COMPLETE ✅ — MiniPlayerBar Visibility Fix (2026-03-17)

---

### Session MINIPLAYER-FIX — MiniPlayerBar not rendering (2026-03-17)
**Status:** COMPLETE ✅

**Root cause (3 bugs):**

1. **`MusicContext.tsx` — `currentTrack` was `null` on init**
   → `MiniPlayerBar` had `if (!currentTrack) return null` → bar never appeared until user visited TrackScreen
   → Fix: Set initial state to `DEFAULT_TRACK = { title: 'TRAVEL RAVERS MIXES', artist: 'soundcloud.com/travel-ravers', url: '...' }`

2. **`MiniPlayerBar.tsx` — null guard returned null**
   → Removed `if (!currentTrack) return null`
   → Added fallback: `const track = currentTrack ?? DEFAULT_TRACK` for safe rendering
   → Added `minHeight: BAR_H` to bar style so web flex layout can't collapse it to 0

3. **`src/navigation/index.tsx` — ROOT CAUSE: Tab.Navigator fills `flex: 1` entirely**
   → `Tab.Navigator` internally occupies 100% of its parent View including its own tab bar
   → `MiniPlayerBar` as a sibling View was pushed off the bottom of the viewport (rendered but invisible below fold)
   → Fix: Wrapped `<MiniPlayerBar />` in `<View style={{ position: 'absolute', bottom: TAB_BAR_H, left: 0, right: 0, zIndex: 999, elevation: 999 }}>` where `TAB_BAR_H = Platform.OS === 'ios' ? 80 : 64`
   → This overlays the bar at exactly the right height above the tab bar on all screens

**Files changed:**
- `src/context/MusicContext.tsx` — Added `DEFAULT_TRACK` constant, set as initial `currentTrack` state
- `src/components/MiniPlayerBar.tsx` — Removed null guard, added `track` fallback, added `minHeight: BAR_H`
- `src/navigation/index.tsx` — Added `TAB_BAR_H` constant, wrapped MiniPlayerBar in absolute-positioned View

**TypeScript:** `npx tsc --noEmit` — ✅ ZERO errors

**NEXT SESSION:**
- TimetableScreen: load initial favedIds from SQLite on mount
- HomeScreen pill: weatherCache hardcodes 'creamfields-2026' — update to use selectedFestival.id
- Verify MiniPlayerBar on device (native build) — `npx expo run:ios` or `run:android`

---

### SESSION COMPLETE ✅ — SOS Redesign + Festival Script Expansion (2026-03-17)

---

### Session SOS-REDESIGN — Phrase Finder + Emergency Numbers + festival.ts update (2026-03-17)
**Status:** COMPLETE ✅

**Files updated:**
- `src/data/festivals.ts` — Festival type `scripts` object extended with 3 new fields: `toilet`, `water`, `exit`. All 50 festivals updated with correct local-language translations (Thai, Dutch, French, German, English, Spanish, Croatian, Italian, Portuguese, Romanian, Hungarian, Dutch/French bilingual). Node.js script used to batch-insert fields based on each festival's `language` field.
- `src/screens/SOSScreen.tsx` — Full redesign. See layout below.

**TypeScript fix during update:**
- French `l'eau` and Italian `Dov'è l'uscita?` used unescaped apostrophes inside single-quoted strings. Fixed by switching those specific strings to double quotes.

**SOSScreen layout (top → bottom):**
1. **Header** — "SOS // WELFARE" Orbitron red glow + `selectedFestival.name` subtitle
2. **SOS Circle Button (160px)** — Pulsing `Animated.loop` shadow between r=20/r=32, red border. `onPress` → Alert with CALL POLICE option → `Linking.openURL('tel:...')` using festival number or '999'
3. **Emergency Numbers Row** — 3 pill cards: POLICE / AMBULANCE / FESTIVAL MEDICAL from `selectedFestival.emergencyNumbers`. Each `onPress` → `Linking.openURL('tel:...')` or Alert for non-dialable (e.g. "See info desk")
4. **Phrase Finder** — 11 situation rows (glass cards, emoji + label + chevron). Tap row → sets `selectedSit` state. Active row: red border glow
5. **Translation Card** — Slides in with `Animated.spring` + fade when situation selected. Shows: English label, language badge pill, large Orbitron phrase text, TAP TO COPY button (expo-clipboard, 2s green COPIED flash), "SHOW TO STAFF" hint. Tapping different row updates the card
6. **I AM SAFE check-in** — Full-width green button → 2-step Alert
7. **No-festival fallback** — Red card + SELECT FESTIVAL button → navigation

**11 situations mapped to scripts keys:**
🚑 doctorNeeded, 💊 substance, 🚽 toilet, 💧 water, 🔋 charging, 🏥 medicalTent, 🚪 exit, 👥 lostSquad, 💉 allergyPenicillin, ✈️ callEmbassy, 🆓 freeToGo

**TypeScript:** `npx tsc --noEmit` — ✅ ZERO errors

**NEXT SESSION:**
- Fix MiniPlayerBar visibility (currently shows on TrackScreen where SoundCloud player lives — consider hiding on TrackScreen tab)
- TimetableScreen: load initial favedIds from SQLite on mount
- HomeScreen pill: weatherCache hardcodes 'creamfields-2026' — update to use selectedFestival.id

---

### SESSION COMPLETE ✅ — SoundCloud Modal + TrackHunter Stub (2026-03-17)

---

### Session TRACK-MODAL — SoundCloudModal + TrackHunter stub (2026-03-17)
**Status:** COMPLETE ✅

**Files created:**
- `src/components/SoundCloudModal.tsx` — Full-screen slide-up Modal (animationType="slide"). Drag handle pill, pink header + ✕ close button, 5-bar animated EqVisualiser, NOW PLAYING track title, SoundCloud WebView embed (same URL as before), volume hint text, Spotify Coming Soon dim button. Safe area aware. Opens from MiniPlayerBar tap.

**Files updated:**
- `src/components/MiniPlayerBar.tsx` — Added `useState(false)` for `modalOpen`. Tap anywhere → `setModalOpen(true)`. Play/Pause still toggles context only. Chevron removed (modal replaces it). Renders `<SoundCloudModal visible={modalOpen} onClose={() => setModalOpen(false)} />` below bar.
- `src/screens/TrackScreen.tsx` — Replaced SoundCloud player screen with clean TrackHunter stub. Violet `#A855F7` accent. Pulsing 160px circle mic button (2 ring Animated.loop, staggered 700ms delay). "HOLD TO IDENTIFY" + "POWERED BY ACRCLOUD — COMING SOON" label. Info glass card with body copy. 4-step how-it-works card. COMING SOON violet badge pill. MiniPlayerBar still visible above tab bar on this screen.

**Architecture notes:**
- SoundCloudModal is self-contained — owns its own WebView instance and webLoaded state
- MiniPlayerBar no longer uses `setIsExpanded` from MusicContext for navigation — modal replaces that
- TrackScreen is now a stub preview only — no imports from MusicContext or WebView
- Full TrackHunter build requires: expo-av (mic), expo-permissions, ACRCloud API, SQLite setlist write

**TypeScript:** `npx tsc --noEmit` — ✅ ZERO errors

**NEXT SESSION:**
- SoundCloud API: fetch real track list for RECENT UPLOADS
- TimetableScreen: load initial favedIds from SQLite on mount
- HomeScreen pill: weatherCache hardcodes 'creamfields-2026' — should use selectedFestival.id
- TrackHunter full build: ACRCloud integration, mic permission, 8s capture, setlist save

---

### SESSION COMPLETE ✅ — SoundCloud Music Player (2026-03-17)

---

### Session TRACK-SOUNDCLOUD — MusicContext + MiniPlayerBar + TrackScreen (2026-03-17)
**Status:** COMPLETE ✅

**Files created:**
- `src/context/MusicContext.tsx` — Global player state: `isPlaying`, `currentTrack`, `isExpanded`, `setCurrentTrack`, `togglePlay`. `MusicProvider` + `useMusic()` hook.
- `src/components/MiniPlayerBar.tsx` — 56px persistent bar above tab bar. EqBar animated equaliser (3 bars, staggered Animated.loop when playing, freeze when paused). Play/pause circle button, expand chevron, track title + artist. Only renders when `currentTrack !== null`. Hot pink `#FF2D78` accent.

**Files updated:**
- `src/screens/TrackScreen.tsx` — Full rebuild. SoundCloud WebView embed (`react-native-webview`). Animated 5-bar EqVisualiser. Animated progress bar (simulated). Glass circle play/pause/skip controls. WebView card with loading state. 3 placeholder `SetCard` rows. Spotify Coming Soon dim button. Sets `currentTrack` in MusicContext on mount so MiniPlayerBar appears immediately.
- `App.tsx` — Wrapped `<MusicProvider>` inside `<FestivalProvider>`.
- `src/navigation/index.tsx` — `TabNavigator` wrapped in `<View style={{ flex: 1 }}>`, `<MiniPlayerBar />` rendered below `<Tab.Navigator>` so it floats above the tab bar on every screen.

**Packages installed:**
- `react-native-webview` — for SoundCloud embed WebView

**Architecture notes:**
- SoundCloud URL: `https://soundcloud.com/travel-ravers`
- WebView embed URL uses `visual=true` for waveform artwork player, `color=%23FF2D78` for pink branding
- On web: iframe rendered directly (WebView = iframe in React Native Web). On native: full WebView with `allowsInlineMediaPlayback` + `mediaPlaybackRequiresUserAction={false}`
- MiniPlayerBar position: inside TabNavigator View container, below Tab.Navigator — stacks above tab bar due to React Native layout (Tab.Navigator fills flex:1, MiniPlayerBar renders below it in document order, tab bar uses `tabBarStyle` position at the bottom of Tab.Navigator only)
- MusicContext is pure UI/state — no actual audio API. WebView handles all audio natively.
- `PLACEHOLDER_SETS` array: 3 fake track cards. TODO: Replace with SoundCloud API `/tracks` endpoint.

**TypeScript:** `npx tsc --noEmit` — ✅ ZERO errors
**Web export:** `npx expo export --platform web` — ✅ Clean build

**NEXT SESSION:**
- SoundCloud API: fetch real track list from `https://api.soundcloud.com/users/travel-ravers/tracks`
- Full expanded player modal (when isExpanded = true, slide-up full screen with WebView)
- TimetableScreen: load initial favedIds from SQLite on mount
- HomeScreen pill: weatherCache hardcodes 'creamfields-2026' — should use selectedFestival.id
- MiniPlayerBar: wire `setIsExpanded(true)` to open full TrackScreen from any tab

---

### SESSION COMPLETE ✅ — SOS / Welfare Screen Rebuild (2026-03-17)

---

### Session SOS-REBUILD — Full SOS/Welfare screen with FestivalContext (2026-03-17)
**Status:** COMPLETE ✅

**Files updated:**
- `src/screens/SOSScreen.tsx` — Full rebuild. Now reads from `useFestival().selectedFestival`.

**New sections added:**
1. **SCREEN HEADER** — "SOS // WELFARE" Orbitron red glow + selectedFestival.name subtitle (or "SELECT FESTIVAL")
2. **EMERGENCY NUMBERS** — Three tap-to-call glass cards: POLICE / AMBULANCE / FESTIVAL MEDICAL from `selectedFestival.emergencyNumbers`. Festival medical shows Alert if number is not dialable (e.g. "See info desk").
3. **LOCAL LANGUAGE SCRIPTS** — "SAY THIS // [language] PHRASES" + 8 ScriptPhraseCard components from `selectedFestival.scripts`. Each card: English label (dim), local phrase (Orbitron bold), TAP TO COPY button → `expo-clipboard` + 2s "COPIED" confirmation. Phrase colors: red for medical, amber for legal/welfare, cyan for logistics.
4. **HYDRATION REMINDER TOGGLE** — Switch component. On native: requests notification permissions then schedules 90-min repeating notification via `expo-notifications`. On web: shows Alert as fallback. `cancelAllScheduledNotificationsAsync` on toggle-off.
5. **I AM SAFE CHECK-IN** — Full-width green button → 2-step Alert confirmation.
6. **No-festival fallback** — Prominent red card "NO FESTIVAL SELECTED" with navigation button to FestivalSelect.

**Kept from original screen:**
- Mesh Broadcast hold-to-SOS button (ring animation + sent state)
- Sharpie Protocol card
- Quick Response action rows (Squad Leader / Festival Medic / Security)
- Emergency Contacts (personal SQLite-backed contacts + modal)
- RAVESafe harm reduction tips

**Packages installed:**
- `expo-clipboard` — for TAP TO COPY functionality

**TypeScript fixes:**
- `expo-notifications` trigger: public `TimeIntervalTriggerInput` has no `type` field (unlike native internal types). Use `{ seconds, repeats }` only.
- Removed `Notifications.SchedulableTriggerInputTypes` (not exported in this version ~0.28.x).

**TypeScript:** `npx tsc --noEmit` — ✅ ZERO errors

**NEXT SESSION:**
- TimetableScreen: load initial favedIds from SQLite on mount
- Rajdhani font not yet loaded in App.tsx — ArtistBioModal falls back to ShareTechMono
- HomeScreen pill weatherCache: still hardcodes 'creamfields-2026' — should use selectedFestival.id
- Test SOSScreen on device: notifications require native build (not Expo Go web)

---

### SESSION COMPLETE ✅ — Festival CSV Import (2026-03-17)

---

### Session CSV-IMPORT — 50 global festivals loaded from CSV (2026-03-17)
**Status:** COMPLETE ✅

**Files updated:**
- `src/data/festivals.ts` — Festival type extended with `vibe`, `camping`, `scripts` fields. Replaced 7 festivals with all 50 from CSV.

**Type additions:**
```typescript
vibe: string;         // e.g. "Techno / Electronic"
camping: boolean;     // true/false from CSV
scripts: {
  doctorNeeded: string;
  allergyPenicillin: string;
  freeToGo: string;
  callEmbassy: string;
  lostSquad: string;
  substance: string;
  medicalTent: string;
  charging: string;
};
```

**50 festivals loaded:** EDC Thailand, Tomorrowland, Ultra Europe, Roskilde, Glastonbury, Creamfields, Parklife, Reading & Leeds, Download, Bestival, Sziget, Untold, Balaton Sound, EXIT Festival, Electric Castle, Primavera Sound, Sonar, Mad Cool, Melt!, Fusion, Awakenings, Amsterdam Open Air, Mysteryland, Dour, Rock Werchter, Pukkelpop, Hellfest, We Love Green, Nuits Sonores, Mutek Montreal, Burning Man, Coachella, Lollapalooza, Bonnaroo, Electric Forest, Lightning in a Bottle, Shambhala, Splendour in the Grass, Laneway Festival, Beyond The Valley + others.

**Local-language SOS scripts:** 11 languages — Thai, Dutch, French, German, Spanish, Croatian, Italian, Portuguese, Romanian, Hungarian, English. Each festival has 8 emergency phrases in local language.

**Architecture notes:**
- All CSV-sourced festivals have `stages: []` and `artists: []` (Timetable screen shows "No artists scheduled" fallback)
- Country field: `'UK'` for UK festivals, `'EU'` for all others (including Thailand/USA/Australia per spec)
- Category: vibe-based mapping → electronic / multi-genre / carnival / concert
- The original 7 detail-rich festivals (Creamfields/Glastonbury etc.) were replaced — SOS screen now reads `festival.scripts` from FestivalContext

**TypeScript:** `npx tsc --noEmit` — ✅ ZERO errors

**NEXT SESSION:**
- SOS screen: read emergencyNumbers + scripts from useFestival().selectedFestival
- TimetableScreen: load initial favedIds from SQLite on mount
- Rajdhani font not yet loaded in App.tsx — ArtistBioModal bio falls back to ShareTechMono
- HomeScreen pill weatherCache: still hardcodes 'creamfields-2026' — should use selectedFestival.id

---

### SESSION COMPLETE ✅ — Timetable + ArtistBioModal + Radar (2026-03-17)

---

### Session TIMETABLE-RADAR — TimetableScreen rebuild + ArtistBioModal + RadarScreen rebuild (2026-03-17)
**Status:** COMPLETE ✅

**Files created:**
- `src/components/ArtistBioModal.tsx` — Bottom sheet modal, slide-up Animated.spring, PanResponder swipe-down. Artist name, genre/origin tags, bio, WHAT TO EXPECT bullets (generated from bio/genre keywords), set info row (stage/day/time), fave toggle button. Accent bar in artist's accentColor.

**Files replaced:**
- `src/screens/TimetableScreen.tsx` — Full rebuild: reads from useFestival().selectedFestival.artists. Day tabs FRI/SAT/SUN, stage chips (horizontal scroll, from festival.stages), artist rows (time col + left accent bar + name + genre pill + stage name + star), NOW PLAYING blinking badge (current time vs startTime/endTime), clash detector for faved artists (amber warning card), opens ArtistBioModal on row tap. SQLite fire-and-forget for user_faves on star toggle. "SELECT A FESTIVAL FIRST" fallback if no festival.
- `src/screens/RadarScreen.tsx` — Full rebuild: SVG radar globe (280×280, R=130). Concentric rings at 33%/66%/100% with labels 50M/100M/200M. Lat/lng grid lines (10% opacity). Rotating sweep (Animated.loop, 3s, Easing.linear) as Animated.View over SVG. YOUR dot: pulsing cyan circle (scale + opacity loop). Squad dots: MAYA/JAX/REMI mock data at computed pixel offsets from center, tap shows tooltip. Squad member cards with avatar, distance calc, blinking LOST pill. PING SQUAD button (Alert). Offline fallback card (isOffline=false for now, shows amber card + QR button).

**BONUS — HomeScreen pill:** Already wired in previous session (selectedFestival.name + clearFestival). No changes needed.

**Architecture notes:**
- TimetableScreen: favedIds in Set<string> state (in-memory). SQLite user_faves written on toggle (fire-and-forget try-catch). Initial load from SQLite not yet implemented — faves reset on app restart.
- RadarScreen: All squad data is mock (MOCK_SQUAD array). TODO comment added. Replace with expo-location + Supabase Realtime in native build.
- TypeScript fix: db.run() returns SQLiteRunResult (sync on native) — must use try-catch, not .catch()

**TypeScript:** `npx tsc --noEmit` — ✅ ZERO errors
**Web export:** `npx expo export --platform web` — ✅ Clean build

**NEXT SESSION:**
- SOS screen: read emergencyNumbers from useFestival().selectedFestival.emergencyNumbers (police/ambulance/festivalMedical)
- TimetableScreen: load initial favedIds from SQLite on mount
- Rajdhani font not yet loaded in App.tsx — ArtistBioModal bio falls back to ShareTechMono (works, just not ideal)

---

### SESSION COMPLETE ✅ — Festival Context System (2026-03-17)

---

### Session FESTIVAL-CONTEXT — Festival data, context, selector screen (2026-03-17)
**Status:** COMPLETE ✅

**Files created:**
- `src/data/festivals.ts` — Festival and Artist types + FESTIVALS array (7 festivals, 8 artists each)
- `src/context/FestivalContext.tsx` — React context, useFestival() hook, AsyncStorage + SQLite persistence
- `src/screens/FestivalSelectScreen.tsx` — Filter chips, 2-col FlatList grid, blinking offline badge, ENTER button

**Files updated:**
- `src/db/database.ts` — Added `festival_context`, `stages`, `user_faves` tables to initDatabase()
- `src/navigation/index.tsx` — Added RootStack + RootNavigator (FestivalSelect → MainApp gate); TabNavigator extracted
- `App.tsx` — Wrapped AppNavigator with `<FestivalProvider>`

**PART 1 — Festivals data:**
- 7 festivals: Creamfields, Glastonbury, Parklife, Terminal V, Tomorrowland, Houghton, Notting Hill
- All with real GPS coords, emergency numbers, timezone, currency, stages, 8 artists each
- Full artist bios (2-3 sentences), stage assignments, day/time slots, accent colours

**PART 2 — FestivalContext:**
- `selectedFestival: Festival | null` — null triggers FestivalSelectScreen
- `isLoading: boolean` — true while AsyncStorage hydrates (prevents flashing FestivalSelect)
- `setFestival(festival)` — saves ID to AsyncStorage key 'selected_festival_id', writes JSON to SQLite festival_context table
- `clearFestival()` — removes from AsyncStorage (e.g., for switching festival from Setup)
- Auto-hydrates on app start from FESTIVALS array via stored ID

**PART 3 — DB tables added:**
- `festival_context (id TEXT PK, json_data TEXT)` — selected festival full JSON for offline screens
- `stages (id TEXT PK, festival_id TEXT, name TEXT, color TEXT)`
- `user_faves (artist_id TEXT, festival_id TEXT, PRIMARY KEY (artist_id, festival_id))`

**PART 4 — FestivalSelectScreen:**
- Filter chips: ALL | 🇬🇧 UK | 🌍 EU | 🎪 CARNIVAL (horizontal ScrollView)
- Festival grid: FlatList numColumns=2, card width (SCREEN_W - 48) / 2
- Each card: glass bg, accent border, emoji, name, dates, location, capacity, checkmark when selected
- Selected state: accent border + glow shadow
- ENTER FESTIVAL button: disabled+greyed until selection; on press calls setFestival() → RootNavigator auto-routes to MainApp
- Blinking offline dot: Animated.loop opacity pulse

**Navigation architecture:**
- RootStack: FestivalSelect (selectedFestival === null) OR MainApp (tab navigator)
- All transitions via `animation: 'fade'` — no jarring slides
- isLoading guard prevents white flash during AsyncStorage hydration

**TypeScript:** `npx tsc --noEmit` — ✅ ZERO errors
- Fixed: Platform.select shadow type error → replaced with `Platform.OS === 'web'` ternary
**Web export:** `npx expo export --platform web` — ✅ Clean build, exported to dist/

**NEXT SESSION:**
- HomeScreen pill (currently hard-coded "CREAMFIELDS 2026") should read from useFestival()
- EventsScreen and TimetableScreen should pull from selectedFestival.artists
- Setup screen should expose a "Change Festival" button calling clearFestival()

---

### Session HOME-BUG-FIX — HomeScreen logo + grid fixes (2026-03-17)
**Status:** COMPLETE ✅

**Files changed:** `src/screens/HomeScreen.tsx`

**BUG 1 — Logo placeholder fixed:**
- Logo style changed from `width: SCREEN_W * 0.5, height: 58` → `width: 180, height: 80`
- `resizeMode="contain"` already set on the Image element — no change needed
- File reference was already correct: `logo-v2.png` (exists in assets/)

**BUG 2 — Grid showing 2 columns fixed:**
- `HORIZ_PAD` changed from `10` → `16`
- `GAP` changed from `7` → `8`
- `CARD_W` formula updated to explicit `Math.floor((SCREEN_W - 48) / 3)` per spec
  - Old: `(SCREEN_W - 34) / 3` — too wide on some devices, caused row overflow
  - New: `(SCREEN_W - 48) / 3` — 48 = 2×16 padding + 2×8 gap
- All 12 modules confirmed present: EVENTS, MAP, TIMETABLE, KIT, SOS, TRACK, RADAR, WEATHER, PIXEL PARTY, BUDGET, SQUAD, SETUP

**TypeScript:** `npx tsc --noEmit` — ✅ ZERO errors
**Web export:** `npx expo export --platform web` — ✅ No build errors — exported to dist/

---

### Session RADAR-VISUAL-UPGRADE — RadarScreen v2 visual fidelity upgrade (2026-03-16)
**Status:** COMPLETE ✅

**`src/screens/RadarScreen.tsx` — three premium visual upgrades applied:**

**1 — True Frosted Glass (expo-blur)**
- `BlurView` from `expo-blur` (v13.0.3) added as `absoluteFill` base layer on:
  - **Waypoint deck section** (`deckSection`): `tint="dark" intensity={40}` + `rgba(3,6,15,0.55)` dark tint overlay — `overflow:'hidden'` added to style to clip BlurView
  - **DROP PIN button** (`dropPinBtn`): `tint="dark" intensity={50}` + `rgba(6,16,36,0.65)` overlay — already had `overflow:'hidden'`; removed solid `backgroundColor` from style
  - **Add Pin Modal card** (`modalCard`): `tint="dark" intensity={60}` + `rgba(6,16,36,0.75)` overlay — already had `overflow:'hidden'`; removed solid `backgroundColor` from style
- Layer order on all BlurView containers: BlurView → dark tint overlay → LinearGradient shine (L2) → 1.5px white lip (L3) → content

**2 — Radar Sweep Animation**
- New sub-component `RadarSweepSvg` (memo'd): pure SVG wedge rendered inside a rotating `Animated.View`
  - **Trail wedge** (70° CCW from 12 o'clock): SVG arc `sweep-flag=0` path filled with `RadialGradient id="sweepGrad"`
  - **Leading-edge spike** (8° CW from 12 o'clock): SVG arc `sweep-flag=1` path filled with `RadialGradient id="leadGrad"`
  - **Leading-edge hairline**: `Path` stroke in ACCENT at 1.5px opacity 0.9
  - Both gradients use `gradientUnits="userSpaceOnUse"` centred at circle origin `(r, r)` — ensures correct radial fade regardless of wedge bounding box
  - `sweepGrad`: ACCENT at 0% opacity 0.55 → 0.25 at 45% → transparent at 100%
  - `leadGrad`: white at 0% opacity 0.55 → ACCENT 0.45 at 35% → transparent at 100%
- Rotation animation: `sweepAnim` (Animated.Value 0→1) driven by `Animated.loop(Animated.timing({ duration: 3500, easing: Easing.linear, useNativeDriver: true }))` — loop started in `useEffect` on mount, cleaned up on unmount
- `sweepRotation` interpolation: `[0,1]` → `['0deg','360deg']` — seamless loop (360°≡0° visually)

**3 — Concentric Distance Rings**
- New sub-component `ConcentricRingsSvg` (memo'd): 4 static SVG `Circle` elements
  - Radii at 25% / 42% / 60% / 80% of housing radius
  - `stroke={ACCENT}` `strokeWidth={1}` `fill="none"` `opacity={0.10}`
- Rendered as `absoluteFillObject` inside housing, wrapped in `View pointerEvents="none"`

**Housing z-order (bottom → top):**
L1 dark base → L2 LinearGradient shine → ConcentricRingsSvg → RadarSweepSvg (Animated.View) → L3 white lip → Cardinals → Crosshair/Arrow → HUD brackets

**TypeScript:** `npx tsc --noEmit` — ✅ ZERO errors
- `Easing` imported from 'react-native' (not reanimated)
- `BlurView` `pointerEvents` prop accepted (BlurView extends View)
- `RadialGradient gradientUnits` accepted by react-native-svg types
- `Stop stopOpacity` typed as `NumberProp` (string | number) — number values used

---

### Session RADAR-SCREEN — RadarScreen full HUD build (2026-03-16)
**Status:** COMPLETE ✅

**`src/screens/RadarScreen.tsx` — rebuilt from stub:**

**Screen sections:**

**1 — Tron Header**
- `‹ RADAR` back button — Orbitron, ACCENT (#CC00FF)
- `GpsStatusPill` component — glass pill with coloured dot + ShareTechMono label
  - `SATELLITE LOCK` (green) — GPS fix + compass heading both active
  - `GPS ONLY` (amber) — position acquired but no compass heading yet
  - `ACQUIRING...` (amber) — waiting for first GPS fix
  - `NO SIGNAL` (red) — permission denied or error

**2 — Core HUD (circular compass housing)**
- 3-Layer Glass Spec on circular container:
  - `HOUSING_SIZE = min(SCREEN_W × 0.78, 300)` — responsive, max 300px diameter
  - Outer `Animated.View` (no overflow:hidden) — carries `glowStyle` shadow without native clipping
  - Inner `View` (overflow:hidden, borderRadius = radius, borderWidth:2) — clips L1/L2/L3 to circle
  - L1 — `rgba(6,16,36,0.95)` absoluteFill base
  - L2 — `expo-linear-gradient` shine (rgba(255,255,255,0.08) → transparent)
  - L3 — 1.5px white lip (opacity 0.15, absolute top)
- Cardinal markers N/E/S/W (ShareTechMono, inside the clipped circle) — N in red (aviation convention)
- HUD corner brackets — inline SVG `Path` L-shapes at 5% inset, 7% arm length, opacity 0.6
- **Standby state** (no target selected):
  - `CrosshairSvg` — concentric rings + gapped crosshair lines in ACCENT colour
  - Housing border opacity pulsed by `Animated.loop` (0.35 → 0.9 → 0.35 at 1600ms each cycle)
  - "◉ STANDBY" label in place of distance
- **Locked state** (waypoint selected + GPS fix):
  - `ArrowSvg` — navigation arrow (tip-up, arrowhead + narrow tail), ACCENT fill + white right-half highlight
  - `Animated.View` wraps arrow with `transform: [{ rotate: arrowRotation }]`
  - Rotation driven by `bearingAnim` (Animated.Value) — `Animated.timing` with 260ms duration
  - `shortestRotation()` ensures animation always takes the ≤180° arc (no backward spin on 359°→1° wrap)
  - Interpolation: `[-36000, 36000]` → `['-36000deg', '36000deg']` — linear 1:1, `extrapolate: 'extend'`, `useNativeDriver: true`
  - Standby pulse stops; housing opacity snaps to 0.75

**3 — Distance + bearing readout (below housing)**
- `formatDistance()` output split into NUM + UNIT displayed at different font sizes
  - NUM: ShareTechMono 46px, white with ACCENT text-shadow glow
  - UNIT: ShareTechMono 18px, dim blue-white
  - CARDINAL: Orbitron 16px, ACCENT (e.g. "NE") from `formatCardinal(bearing)`
- `HDG 045°` heading readout in ShareTechMono dim colour below distance

**4 — Waypoint deck (bottom strip)**
- `DROP PIN` button (always first in scroll) — 3-layer glass, cyan accent, disabled + alert when no GPS fix
- Saved waypoints rendered via `TronGlassButton`:
  - Selected: full `ACCENT` (#CC00FF)
  - Unselected: `ACCENT + 'AA'` (dimmed ~67% opacity)
  - Tap to select/deselect as radar target
- `✕` delete tap under each card → `Alert.alert` confirm → Drizzle `db.delete(waypoints).where(eq(waypoints.id, wp.id))`
- Empty state nudge: ShareTechMono "DROP A PIN AT YOUR TENT · STAGE · EXIT"

**5 — Add Pin Modal (bottom sheet)**
- `Modal animationType="slide"` — slides up from bottom
- `KeyboardAvoidingView` — `padding` mode on iOS
- 3-layer glass on the modal card (same L1/L2/L3 spec, top-left/right radius 24px)
- `TextInput` — autoCapitalize characters, max 24 chars, ShareTechMono, ACCENT border
- Icon type selector row: 6 options (⛺ TENT · 🎵 STAGE · 🏥 MEDIC · 🍕 FOOD · 🚪 EXIT · 📍 PIN)
- Selected icon: ACCENT border + ACCENT + '22' background
- SAVE disabled (opacity 0.4) when no GPS fix; active when locked

**TypeScript fix:**
- `let color = Colors.yellow` inferred as literal `'#ffff00'` due to `as const` — widened to `let color: string` to accept all colour assignments

**TypeScript:** `npx tsc --noEmit` = **0 errors**

---

### Session RADAR-FOUNDATION — Offline Radar schema + hook (2026-03-16)
**Status:** COMPLETE ✅

**New package installed:**
- `expo-sensors@55.0.8` — provides hardware access to Accelerometer, Gyroscope, Magnetometer. Installed via `npm install expo-sensors --legacy-peer-deps` (compatible with Expo SDK 51 project).

**`src/db/schema.ts` — added `waypoints` table:**
```
waypoints:
  id         TEXT    PRIMARY KEY          — uuid generated client-side
  title      TEXT    NOT NULL             — e.g. "My Tent", "Main Stage"
  latitude   REAL    NOT NULL
  longitude  REAL    NOT NULL
  icon_type  TEXT    NOT NULL             — tent | stage | medic | food | exit | custom
  created_at INTEGER NOT NULL             — Unix epoch ms (Date.now())
```
- Exported `Waypoint` + `NewWaypoint` types via `$inferSelect` / `$inferInsert`

**`src/db/database.ts` — added DDL:**
- `CREATE TABLE IF NOT EXISTS waypoints (...)` added to `initDatabase()`

**`src/hooks/useOfflineRadar.ts` — new custom hook:**

**GPS:**
- `Location.requestForegroundPermissionsAsync()` — requests permission on mount, sets `permissionGranted` state
- `Location.watchPositionAsync({ accuracy: Balanced, distanceInterval: 2 })` — live GPS subscription, updates `userLat` / `userLon` state
- Subscription stored in `posSubRef`, removed on unmount

**Compass heading:**
- `Location.watchHeadingAsync()` from `expo-location` — OS-processed compass heading
- Prefers `trueHeading` (GPS-corrected magnetic declination) when ≥ 0; falls back to `magHeading`
- Subscription stored in `headingSubRef`, removed on unmount
- Note: `watchHeadingAsync` reads the same physical magnetometer as `expo-sensors.Magnetometer` but with OS-level tilt compensation and magnetic declination applied — more accurate for a compass arrow than raw μT values

**Pure maths (all offline, zero network):**
- `haversineDistance(lat1, lon1, lat2, lon2): number` — WGS-84 great-circle distance in metres (R = 6 371 000 m)
- `absoluteBearing(lat1, lon1, lat2, lon2): number` — true-North bearing in degrees [0, 360)
- `relativeBearing(absBearing, deviceHeading): number` — compass-adjusted arrow angle for UI

**Hook return shape:**
```ts
{
  permissionGranted: boolean
  userLat:                  number | null
  userLon:                  number | null
  heading:                  number | null   // compass °, 0=N, 90=E
  distance:                 number | null   // metres to target
  bearing:                  number | null   // relative bearing for UI arrow
  absoluteBearingToTarget:  number | null   // true-North bearing
  error:                    string | null
}
```

**Utility exports (for RadarScreen UI):**
- `formatDistance(metres)` — "342 m" / "1.3 km" / "---"
- `formatCardinal(degrees)` — "N" / "NE" / "SW" etc.

**All pure maths functions exported** — ready to be imported individually in unit tests.

**TypeScript:** `npx tsc --noEmit` = **0 errors**

---

### Session TRONGLASS-REFACTOR — TronGlassButton 3-Layer Glass Spec (2026-03-16)
**Status:** COMPLETE ✅

**`src/components/TronGlassButton.tsx` — full refactor:**

**3-Layer Glass Stack (all clipped by `overflow:'hidden'` + `borderRadius:20`):**
```
L1 — Base:  backgroundColor rgba(6,16,36,0.95) — deep dark navy (absoluteFill View)
L2 — Shine: expo-linear-gradient  rgba(255,255,255,0.08) → transparent  (top→bottom)
L3 — Lip:   absolute View  h=1.5  backgroundColor='#ffffff'  opacity=0.15  (top edge)
```

**Structural changes:**
- Container split into two shells:
  - `shadowWrapper` (TouchableOpacity, no `overflow:'hidden'`) — carries platform glow shadow; native shadow is not clipped
  - `innerContainer` (View, `overflow:'hidden'`) — clips L1/L2/L3 to the 20px curve
- `BORDER_RADIUS` updated from 24 → **20**
- `borderWidth: 1.5` on `innerContainer` with `borderColor: accentColor + '66'` (40% opacity)
- `pulseRing` — `Animated.View` (absoluteFill, behind inner container) carries the pulsing border glow animation (opacity 0.55 → 1.0 loop)

**Gradient — migrated from SVG to expo-linear-gradient:**
- Removed `LinearGradient`, `Defs`, `Stop`, `Rect` imports from `react-native-svg`
- Added `import { LinearGradient } from 'expo-linear-gradient'`
- `colors={['rgba(255,255,255,0.08)', 'transparent']}` — top shine only (spec-exact)

**HUD corner brackets — upgraded to SVG L-shapes:**
- `react-native-svg` `Path` elements — 4 L-shaped corners via SVG `d` path strings
- `BRACKET_ARM=10`, `BRACKET_INSET=8`, `BRACKET_SW=1.5`
- Inset 8px ensures brackets sit comfortably inside the 20px curve
- **Conditional** — only rendered when `pressed === true` (tactile HUD feedback on tap)
- Wrapped in `View pointerEvents="none"` for correct TypeScript SVG interop

**Press state:**
- `useState<boolean>(pressed)` tracks `onPressIn` / `onPressOut`
- Brackets appear on press; glow shadow intensifies (shadowRadius 8→14, opacity 0.4→0.7)

**Typography fixes:**
- Label:    `fontFamily: 'Orbitron_700Bold'` — unchanged
- Sublabel: `fontFamily: 'ShareTechMono_400Regular'` — **added** (was missing)
- Sublabel `letterSpacing` raised from 0.6 → **1.5** (meets minimum 1.5px rule)

**Removed:** `scanAnim` (scan line animation) — not part of the 3-Layer Glass Spec

**TypeScript:** `npx tsc --noEmit` = **0 errors**

---

## CURRENT STATUS
Phase: 3 — Advanced Features (Sessions 2-B + 3-A/B/C COMPLETE)
Next Session: Events Screen or Timetable Screen
Build Health: Sessions 2-A/B/C + 3-A/B/C complete. 9 of 12 screens fully built. npx tsc --noEmit = 0 errors.

---

### Session 2-B — SquadSetupScreen full build (2026-03-15)
**Status:** COMPLETE ✅

**`src/screens/SquadSetupScreen.tsx` — rebuilt from stub:**
- **SQLite `squad_members` table**: `id, name, nickname, role, avatar, emergency_contact, phone, created_at`
- **SQLite `squad_config` table**: `id='default', squad_name, homebase, festival_id` — `INSERT OR REPLACE` upsert
- **Squad name**: inline editable `TextInput` on tap, saved to SQLite on blur
- **Homebase**: inline editable — store meetup point text
- **Member list**: glass cards with emoji avatar, name, nickname, role chip (coloured by role), phone, emergency contact
- **5 roles**: CAPTAIN (red) · NAVIGATOR (green) · MEDIC (green) · DJ (violet) · CREW (purple)
- **Add Member modal**: `KeyboardAvoidingView` bottom sheet — avatar emoji picker (10 options), name/nickname/role/emergency contact/phone fields
- **Delete**: swipe-confirm `Alert.alert` → `db.delete().where(eq(id))`
- **FAB**: fixed bottom-right, purple glow
- 100% offline — no network calls

**`src/db/schema.ts`** — added `squadMembers`, `squadConfig` tables + exported types
**`src/db/database.ts`** — added `CREATE TABLE IF NOT EXISTS squad_members` + `squad_config`

---

### Session 3-A/B — TrackScreen full build (2026-03-15)
**Status:** COMPLETE ✅

**`src/screens/TrackScreen.tsx` — rebuilt from stub:**
- **Hold-to-record**: `Pressable` `onPressIn/onPressOut` + 50ms interval tracks elapsed time
- **8-second SVG ring animation**: 3 concentric `Circle` rings with `strokeDasharray`/`strokeDashoffset` driven by `progress (0→1)` — outer ring progresses forward, mid ring counter-rotates
- **Demo ACRCloud mode**: on 8s completion → 1.8s "identifying" state → random track from 12-track pool
- **Ring states**: idle (dim 30%) → recording (accent colour) → identifying (yellow) → result/saved (green center)
- **Center overlay**: shows "HOLD" icon → countdown seconds → "ID'ING..." → ✓
- **Result card**: title + artist + "SAVE TO SETLIST" / "DISCARD" actions
- **Setlist**: `db.insert(setlistTracks).values()` → displayed below scanner sorted by `identified_at` DESC
- **Spotify export**: `Linking.openURL('spotify:search:...')` with web fallback `https://open.spotify.com/search/...`
- Saved setlist badge in header

**`src/db/schema.ts`** — added `setlistTracks` table + exported `SetlistTrack` type
**`src/db/database.ts`** — added `CREATE TABLE IF NOT EXISTS setlist_tracks`

---

### Session 3-C/D — PixelPartyScreen full build (2026-03-15)
**Status:** COMPLETE ✅

**`src/screens/PixelPartyScreen.tsx` — rebuilt from stub:**
- **SQLite `pixel_albums` table**: `id, name, code (6-char), created_at, reveal_at`
- **SQLite `pixel_photos` table**: `id, album_id, uri (local), taken_at`
- **Two views**: album list (FlatList) ↔ album detail (ScrollView) — no navigation push needed
- **Create album modal**: name + optional reveal date → `genCode()` generates 6-char alphanumeric code
- **Join by code**: `Modal` → enter 6 chars → matches local album by code
- **Album detail**: share code displayed in large glowing text (replace QR), lock/reveal state, add photo buttons
- **Camera/Gallery**: dynamic `require('expo-image-picker')` in try/catch — safe without package installed; shows install instructions on error
- **Disposable camera lock**: if `reveal_at` is in future, photos show 🔒 LOCKED state
- **Photo grid**: shows emoji placeholders with timestamp (real image display requires expo-image-picker + `<Image>` component — Phase 4)
- **Supabase upsell nudge**: cloud sync upsell card at bottom of both views → `Alert.alert('Travel Ravers Pro'...)`
- **Delete album**: confirm `Alert` → cascade delete photos + album

**`src/db/schema.ts`** — added `pixelAlbums`, `pixelPhotos` tables + exported types
**`src/db/database.ts`** — added `CREATE TABLE IF NOT EXISTS pixel_albums` + `pixel_photos`

**NOTE**: `npx expo install expo-image-picker` needed to enable camera/gallery on device. Screen works without it (graceful fallback alert).

**TypeScript**: `npx tsc --noEmit` = **0 errors** across all sessions.

---

### Session 2-A — WeatherScreen full build (2026-03-15)
**Status:** COMPLETE ✅

**`src/screens/WeatherScreen.tsx` — rebuilt from stub:**
- Open-Meteo API fetch (no key): `current` + `hourly` + `daily` — `latitude`/`longitude` queried from `festivals` SQLite table (fallback: Creamfields 53.302°N, -2.579°W)
- **SQLite 2-hour cache**: `INSERT OR REPLACE INTO weather_cache` — serves stale data on network failure
- **KIT alerts** (smart logic): rain ≥60% → 🥾 Wellies | temp ≥27°C → 🧴 Sunscreen | min ≤8°C → 🧥 Layers | rain ≥80% → ⛺ Tent
- **UI sections**: Hero card (temp/feels/condition/wind/humidity) · Hourly rain bars (next 12h) · 5-day forecast horizontal scroll · KIT alerts card
- LIVE/CACHED badge in header
- Retry button on full fetch failure; stale cache served as fallback with error banner
- WMO weather code → emoji + label mapping (all codes 0–99)

**`src/db/schema.ts`** — added `weatherCache` table (`id`, `fetched_at`, `payload` TEXT JSON)
**`src/db/database.ts`** — added `CREATE TABLE IF NOT EXISTS weather_cache`

**HomeScreen WeatherWidget:**
- `HomeScreen.tsx` imports `weatherCache`, reads SQLite on mount (non-blocking)
- Pill now shows `{emoji} {temp}°C · CREAMFIELDS 2026 ›` when cache is warm
- No HEADER_H change — weather strip sits inline inside the existing pill

---

### Session 2-C — BudgetScreen full build (2026-03-15)
**Status:** COMPLETE ✅

**`src/screens/BudgetScreen.tsx` — rebuilt from stub:**
- **SQLite `expenses` table**: `id, festival_id, description, amount, paid_by, category, created_at`
- **Add Expense modal**: Description · Amount (£) · Paid By · Category picker (FOOD/DRINKS/TRAVEL/CAMP/OTHER with emoji) — bottom-sheet `KeyboardAvoidingView` modal with glass styling
- **Expense list**: scrollable glass cards with category emoji badge, delete with confirmation Alert
- **Settlement calculator**: min-cash-flow algorithm → shows `FROM → TO: £X.XX` for each debt; "ALL SQUARE" state if no debts
- **WhatsApp share**: `Linking.openURL('whatsapp://send?text=...')` with full summary (total, settlements, festival name)
- **FAB button**: `+ ADD EXPENSE` floats over scroll content
- Empty state card when no expenses logged
- Summary card: TOTAL SPENT · PEOPLE · AVG/PERSON

**`src/db/schema.ts`** — added `expenses` table
**`src/db/database.ts`** — added `CREATE TABLE IF NOT EXISTS expenses`

**TypeScript:** `npx tsc --noEmit` PASSED CLEAN (0 errors)

---

### Session DB-SEED — Drizzle ORM Schema + SQLite Seed (2026-03-14)
**Status:** COMPLETE ✅
- Installed `drizzle-orm@0.45.1`
- Added `resolveJsonModule: true` to tsconfig.json
- Created `src/db/schema.ts` — Drizzle schema for `festivals` (20 rows) and `artists` (15 rows) tables
- Created `src/db/database.ts` — opens `travel-ravers.db` via expo-sqlite, creates tables with `CREATE TABLE IF NOT EXISTS` via drizzle raw SQL, exports `db` (drizzle instance) + `initDatabase()`
- Created `src/db/seed.ts` — reads `festivals2026.json` (20 festivals) and `creamfields_artists_2026.json` (15 artists), inserts on first run only (guard check prevents duplicate seed)
- Created `src/db/index.ts` — clean re-exports
- Updated `App.tsx` — calls `initDatabase()` then `seedDatabase()` in useEffect on startup
- Artists linked to `festivalId: 'creamfields-2026'` (foreign key to festivals table)
- TypeScript: `npx tsc --noEmit` PASSED CLEAN (0 errors)
- Expo dev server started — seed executes automatically on first app launch

**DB structure:**
```
festivals:          id | name | country | start_date | end_date | ticket_price | latitude | longitude | is_cashless
artists:            artist_id | festival_id | name | genre | vibe | typical_stage | energy_score | darkness_score
festival_logistics: id | festival_id | festival_name | hospital_name | hospital_distance_miles | train_station | avg_day_temp_c | avg_night_temp_c
```

**Seed data:**
- 20 festivals (Creamfields, Tomorrowland x2, Boomtown, Awakenings, Parklife, Terminal V, Junction 2, Houghton, Dekmantel, Forbidden Forest, Ultra Europe, Sonus, Time Warp, Stone Techno, Kappa FuturFestival, Pavilion, Lost & Found, Sub City, Drumcode)
- 15 Creamfields 2026 artists (Calvin Harris, Carl Cox, Charlotte de Witte, Chase & Status, Amelie Lens, Andy C, Fisher, Adam Beyer, Eric Prydz, Disclosure, Sub Focus, Armin van Buuren, CamelPhat, Martin Garrix, Ben Nicky)
- 3 logistics rows (Creamfields 2026 → creamfields-2026, Boomtown Fair → boomtown-2026, Glastonbury → null festival_id — not yet in festivals table)

### Session SOS-MESH-HERO — Mesh Broadcast hero component (2026-03-14)
**Status:** COMPLETE ✅

**Added to SOSScreen.tsx — top of ScrollView, above Sharpie Protocol:**

**State added:**
- `isHolding: boolean` — Pressable active
- `holdProgress: number` (0–100) — drives SVG arc offset
- `sosSent: boolean` — toggles between hold/sent states
- `intervalRef` — setInterval handle (cleared on unmount via useEffect cleanup)
- `progressRef` — shadow ref tracking progress inside setInterval callback (avoids stale closure)
- `p1/p2/p3: Animated.Value` — 3 staggered expanding pulse rings for sent state
- `sosBeat: Animated.Value` — heartbeat scale on "SOS SENT" circle

**Hold mechanic:**
- `Pressable onPressIn` → starts `setInterval(30ms)`, increments `progressRef.current` by 1 per tick
- 100 ticks × 30ms = exactly 3 000ms → sets `sosSent = true`
- `Pressable onPressOut` → clears interval, resets progress to 0 (if not already sent)
- Early release at any point resets cleanly to 0

**SVG progress ring:**
- `RING_SIZE = 220`, `RING_R = 95`, `STROKE_W = 7`
- `CIRCUMFERENCE = 2π × 95 ≈ 596.9`
- Track ring: `stroke="rgba(255,51,68,0.15)"`
- Progress arc: `strokeDasharray={CIRCUMFERENCE}`, `strokeDashoffset={CIRCUMFERENCE × (1 - progress/100)}`
- SVG rotated −90° so arc starts at 12 o'clock
- `strokeLinecap="round"` for clean arc ends
- Inner face (168px circle) absolutely centred — shows "SOS" + "HOLD 3 SEC" / "XX%"

**Translation card (not-sent state):**
- Glass card below button: "LOCATION: 51.2194° N, 4.4025° E"
- "I NEED A DOCTOR" in 28px Orbitron
- "SHOW TO STAFF / MEDICAL PERSONNEL" in ShareTechMono

**Sent state:**
- 3 `Animated.View` pulse rings staggered at 0 / 667 / 1 333ms — expand scale 1→2.5, opacity 0.55→0
- `sosBeat` loop: scale 1→1.12→1 every 600ms on the SOS SENT circle
- Mesh stats glass card: MESH HOPS · SIGNAL · RADIUS · STATUS with cyan keys + ShareTechMono values
- `resetSOS` callback resets all state + animation values → `Animated.Value(0)` reset triggers re-animation on next send
- Large green "✅ I'M SAFE — CANCEL SOS" button with green glow

**TypeScript:** `npx tsc --noEmit` PASSED CLEAN (0 errors)

---

### Session DB-WEB-FIX — database.ts web platform guard (2026-03-14)
**Status:** COMPLETE ✅

**Problem:** `npx expo start --web` crashed with:
`Uncaught TypeError: _ExpoSQLiteNext.default.NativeDatabase is not a constructor at openDatabaseSync`
Root cause: `openDatabaseSync('travel-ravers.db')` was called at module evaluation time (top-level), not inside a function. expo-sqlite has no browser implementation.

**Fix in `src/db/database.ts`:**
- `openDatabaseSync` call moved inside `createNativeDb()` function — never executed during web bundle evaluation
- `Platform.OS === 'web'` ternary selects `WEB_MOCK` (browser) or `createNativeDb()` (native)
- `WEB_MOCK` is a chainable no-op object implementing the Drizzle query surface used across the app:
  - `select().from().where().limit()` → `Promise.resolve([])`
  - `insert().values()` → `Promise.resolve([])`
  - `run()` → `Promise.resolve(undefined)`
  - `.then()/.catch()/.finally()` on chain — makes `await db.select()...` resolve cleanly
- `initDatabase()` early-returns on web (`if (_initialised || Platform.OS === 'web') return`)
- Export typed as `ExpoSQLiteDatabase<typeof schema>` on both paths — full type safety preserved
- TypeScript: `npx tsc --noEmit` PASSED CLEAN (0 errors)

**Result:** Web build renders all screens. SQLite queries silently return `[]` in the browser. Native (iOS/Android) behaviour unchanged.

---

### Session SOS-PHASE1 — SOSScreen full rebuild (2026-03-14)
**Status:** COMPLETE ✅

**UI Structure — 3 sections as specified:**

**TOP — The Sharpie Protocol card**
- Multi-layer Tron glass card: `Colors.glass` base + diagonal SVG LinearGradient overlay + 2px top-edge shine
- Corner brackets + `#FF3344` border glow (12px radius)
- Inline SVG pen/marker icon in a small icon box
- Orbitron title + Share Tech Mono body text

**MIDDLE — 2×2 TronGlassButton quick-action grid**
- Button size: `(screenWidth - 48) / 2` — perfect 2-col layout
- All 4 buttons use inline SVG icons (no `@expo/vector-icons`)
- **SQUAD LEADER** — calls `contacts[0]` via `tel:` deep link, falls back to add-contact modal
- **FESTIVAL MEDIC** — Alert with on-site instructions
- **SECURITY** — Alert with hi-vis staff instructions
- **HOSPITAL** — sublabel dynamically populated from SQLite `festival_logistics` via Drizzle ORM; `eq(festivalLogistics.festivalId, 'creamfields-2026')` query; opens Maps on press
- Hospital name metadata strip rendered below grid when data is available

**BOTTOM — RAVESafe harm reduction (static, offline-always)**
- 4 tip cards: HYDRATION PACING · OVER-AMPING SIGNS · HEAT STROKE · BUDDY SYSTEM
- Each card: glass background + per-topic accent glow + corner brackets + bullet lines
- Colours: Cyan · Sky Blue · Yellow · Green (from `Colors` constants only)

**Emergency Contacts section (preserved)**
- Raw expo-sqlite on `travel-ravers.db` (unified db name — previously used `travel_ravers.db`)
- CALL + TEXT action buttons, delete with confirmation alert
- Dashed "ADD EMERGENCY CONTACT" button when < 3 contacts stored

**Key technical details:**
- `db.select().from(festivalLogistics).where(eq(...)).limit(1)` — Drizzle ORM async query in useEffect
- Graceful degradation: hospital button shows "LOADING..." if logistics query fails
- `glowStyle()` helper: Platform.select web boxShadow / native shadow
- TypeScript: `npx tsc --noEmit` PASSED CLEAN (0 errors)

---

### Session DB-LOGISTICS — festival_logistics table + seed (2026-03-14)
**Status:** COMPLETE ✅
- Added `festivalLogistics` table to `src/db/schema.ts` — links to festivals via nullable `festival_id` FK
- Added `CREATE TABLE IF NOT EXISTS festival_logistics` DDL to `src/db/database.ts`
- Updated `src/db/seed.ts` — imports `logistics.json`, maps festival names to IDs via `LOGISTICS_NAME_TO_ID` lookup, inserts 3 rows
- Name mapping: "Creamfields 2026" → creamfields-2026, "Boomtown Fair" → boomtown-2026, "Glastonbury" → null (not in festivals2026.json)
- Logistics PKs generated as slugs: `logistics-creamfields-2026`, `logistics-boomtown-fair`, `logistics-glastonbury`
- Exported `FestivalLogistics` and `NewFestivalLogistics` types from schema
- TypeScript: `npx tsc --noEmit` PASSED CLEAN (0 errors)

---

### Session HOME-3D-GLASS — True 3-layer 3D glass card rewrite (2026-03-14)
**Status:** COMPLETE ✅

**Complete rewrite of `HomeGridCard` in `src/screens/HomeScreen.tsx`**

**Card layer stack (bottom → top, all clipped by `overflow:'hidden'` + `borderRadius:20`):**
```
L1 — Base:      backgroundColor: 'rgba(6,16,36,0.95)'  — deep dark navy
L2 — Shine:     LinearGradient  rgba(255,255,255,0.08) → transparent (top→bottom)
L3 — Lip:       View h=1.5, backgroundColor:'white', opacity:0.15 (absolute top edge)
```
`expo-linear-gradient` used for Layer 2 — already installed (`~13.0.2`)

**Border:** `borderWidth: 1.5`, color = `accent + '66'` (40% opacity) at idle, `accent + '99'` when pressed

**Height formula (user-specified):**
```
CARD_H = Math.floor((SCREEN_H - HEADER_H - TAB_H - 60) / 4)
```
The 60px absorbs safe-area top, row gaps, and breathing room

**Corner brackets:** SVG L-shapes with `strokeWidth: 1`, inset 12px inside the 20px curve.
**Now conditional** — `{pressed && <Corners color={color} />}` — brackets only appear on press, giving tactile HUD feedback

**HUD element positions (unchanged):**
- Title: `top:10, left:12` — Orbitron 700, 10px, white, letterSpacing 1.5
- Icon: `top:8, right:10` — Lucide, size 20, accent color
- Sublabel: `bottom:9, left:12` — ShareTechMono, 6.5px, full accent color (no opacity modifier)

**Glow:** idle `shadowRadius:8, opacity:0.3` → active `shadowRadius:22, opacity:0.9`

**TypeScript:** `npx tsc --noEmit` PASSED CLEAN (0 errors)

---

### Session HOME-OS-HUD — Single-screen HUD layout (2026-03-14)
**Status:** COMPLETE ✅

**Complete rewrite of `src/screens/HomeScreen.tsx`**

**One-screen rule — no ScrollView:**
- Replaced `ScrollView` with `View` using `flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start'`
- 12 cards fill 4 rows × 3 cols automatically via flexWrap

**Height/width math:**
```
HEADER_H   = 108px  (logo 58 + gap 6 + pill 34 + gap 10)
SAFE_TOP   = 52px iOS / 24px Android  (estimated)
TAB_H      = 82px iOS / 64px Android
availableH = SCREEN_H - SAFE_TOP - TAB_H - HEADER_H
CARD_H     = (availableH - GAP × 3) / 4
CARD_W     = (SCREEN_W - HORIZ_PAD×2 - GAP × 2) / 3
GAP = 7, HORIZ_PAD = 10
```

**3D glass — 3 layers (overflow: 'hidden' clips all to borderRadius: 20):**
1. Base: `rgba(4,10,26,0.92)` dark navy via `card.backgroundColor`
2. Frosted overlay: absoluteFill `rgba(255,255,255,0.04)` View
3. Top-edge highlight: 1px `rgba(255,255,255,0.18)` View — bevelled glass effect

**HUD element positions (all absolute):**
- Title: `top: 10, left: 12` — Orbitron_700Bold, 10px, white, letterSpacing 1.5
- Icon: `top: 8, right: 10` — `size={20}`, module color, strokeWidth 1.5
- Sublabel: `bottom: 9, left: 12` — ShareTechMono, 6.5px, `color + 'CC'` (80% module accent)

**SVG corner brackets:** strokeWidth → 1 (thinner), inset → 13px (inside 20px radius), arm → 11px. `Corners` now accepts `w` and `h` props (since cards are no longer square).

**SafeAreaView:** `edges={['top']}` only — bottom edge handled by tab navigator

**TypeScript:** `npx tsc --noEmit` PASSED CLEAN (0 errors)

---

### Session HOME-OS — Premium micro-text grid polish (2026-03-14)
**Status:** COMPLETE ✅

**NotebookLM research (Travel Ravers HQ):**
Confirmed: white labels, glassmorphism surfaces (`rgba(8,20,40,0.55)`), min 1.5px letter-spacing, all-uppercase, military HUD corner brackets, module-coloured icons, glow borders.

**Changes to `src/screens/HomeScreen.tsx`:**
- `ICON_SIZE`: 32 → **34**
- Card background: hardcoded `rgba(6,16,36,0.88)` → **`Colors.glass`** (`rgba(6,16,32,0.6)`)
- Card border radius: 6 → **10** (rounder glass feel, matches notebook spec)
- `cardShine` border radius updated to match: 6 → 10
- Label color: was `{ color: moduleColor }` → now **`'#ffffff'`** (white) — module color reserved for icon, border, and glow only
- `letterSpacing: 1.5` on label (unchanged — already met 1.5px minimum from notebook)
- Icon `size={34}`, `strokeWidth={1.4}`, module colour — unchanged from V2 apart from size bump
- Sublabel: ShareTechMono, 7px, `rgba(200,232,255,0.45)` — unchanged
- All 12 navigation routes preserved — no "Coming Soon" alerts needed (all screens exist)

**TypeScript:** `npx tsc --noEmit` PASSED CLEAN (0 errors)

---

### Session HOME-GRID-V2 — HomeGridCard layout refinement (2026-03-14)
**Status:** COMPLETE ✅

**Changes to `src/screens/HomeScreen.tsx`:**

**Card layout — absolute positioning:**
- Label: `position: 'absolute', top: 9, left: 10` — Orbitron 700, 8px, 1.5 letter-spacing, module color
- Icon: `position: 'absolute'`, computed `top = CARD_SIZE/2 - ICON_SIZE/2 - 4`, `left = CARD_SIZE/2 - ICON_SIZE/2` — optically centred with slight upward shift
- Sublabel: `position: 'absolute', bottom: 8, left: 10` — ShareTechMono, 7px, `rgba(200,232,255,0.45)`, lineHeight 10

**Icon refinements:**
- Fixed `size={32}` (was `CARD_SIZE * 0.27`)
- Tinted halo ring: `View` with `backgroundColor: color + '18'`, `borderRadius: 24`, `width/height: ICON_SIZE + 16 = 48px`, centred
- MODULES array now stores `Icon: LucideIcon` (component reference) — icon rendered inside `HomeGridCard` so `size`/`color` props are applied at render, not at array definition time

**Press glow — two intensity levels:**
- `useState(false)` pressed state on `Pressable` (`onPressIn`/`onPressOut`)
- Idle: `shadowRadius: 8, shadowOpacity: 0.3` (web: `boxShadow 0 0 8px color33`)
- Active: `shadowRadius: 18, shadowOpacity: 0.8` + border opacity `88` (web: double boxShadow `color99 + color44`)

**`overflow: 'hidden'` removed** from card — was clipping icon halo glow; corner brackets remain within card bounds so no visual change

**paddingBottom: 120** on scroll `contentContainerStyle` — row 4 clears tab bar on all device sizes

**TypeScript:** `npx tsc --noEmit` PASSED CLEAN (0 errors)

---

### Session HOME-GRID — Full 12-module HomeScreen rebuild (2026-03-14)
**Status:** COMPLETE ✅

**Changes to `src/screens/HomeScreen.tsx`:**

**Removed:** Old 2-row, 6-button layout using `TronGlassButton` with `.png` icon assets.

**New `HomeGridCard` component:**
- Perfect square: `width: CARD_SIZE, aspectRatio: 1`
- Layout math: `CARD_SIZE = Math.floor((SCREEN_W - HORIZ_PAD*2 - GAP*2) / 3)` (HORIZ_PAD=12, GAP=8)
- Background: `rgba(6,16,36,0.88)` (Tron glass dark)
- Border: 1px, module color at 30% opacity (`color + '4D'`)
- Outer glow: `glowStyle(color, 10)` — `Platform.select` web boxShadow / native shadowColor
- Top-edge glass shine: 1px `rgba(255,255,255,0.06)` border top inside absoluteFill view
- Rounded corners: `borderRadius: 6`

**SVG corner brackets (`Corners` component):**
- Uses `react-native-svg` `Line` elements — no bitmap assets
- 4 corner L-shapes: arm = `CARD_SIZE * 0.14`, inset = 5, strokeWidth = 1.5
- Rendered as `StyleSheet.absoluteFillObject` overlay with `pointerEvents="none"`

**12 modules (3×4 grid in display order):**
```
Row 1: EVENTS (#00f5ff)  | MAP (#00ff88)   | TIMETABLE (#ffb300)
Row 2: KIT (#ff8800)     | SOS (#ff2244)   | TRACK (#a855f7)
Row 3: RADAR (#cc00ff)   | WEATHER (#00bfff)| PIXEL PARTY (#ff2d78)
Row 4: BUDGET (#ffd700)  | SQUAD (#9d4edd) | SETUP (#38bdf8)
```

**Icons (lucide-react-native — installed this session):**
`Calendar · MapPin · Clock · Package · AlertTriangle · Headphones · Radio · Cloud · Camera · Wallet · Users · Settings`
Icon size: `CARD_SIZE * 0.27`, strokeWidth: 1.5

**Navigation — all 12 wired to real screens:**
Events · Map · Timetable · Kit · SOS · Track · Radar · Weather · PixelParty · Budget · SquadPanel · SquadSetup
No "Coming Soon" alerts needed — all screens exist in HomeStack.

**Festival pill:** Shows "CREAMFIELDS 2026 ›" — Alert on press (festival switching arrives in Setup).

**Typography:**
- Label: `Orbitron_700Bold`, `CARD_SIZE * 0.083` px, 1.2 letter-spacing, uppercase, module color
- Sublabel: `ShareTechMono_400Regular`, `CARD_SIZE * 0.063` px, `rgba(200,232,255,0.5)`, uppercase

**Package added:** `lucide-react-native` (installed with `--legacy-peer-deps`)
**TypeScript fix:** Used `LucideIcon` type from lucide-react-native for `makeIcon` helper (avoids propTypes mismatch)
**TypeScript:** `npx tsc --noEmit` PASSED CLEAN (0 errors)

---

### Session SOS-TRANSLATOR — Smart auto-translation + column button layout (2026-03-14)
**Status:** COMPLETE ✅

**Changes to `src/screens/SOSScreen.tsx`:**

**Button layout fix:**
- Changed `actionGrid` from `flexDirection: 'row', flexWrap: 'wrap'` to `flexDirection: 'column', gap: 10`
- `TronGlassButton` is square-only — cannot render as horizontal rows
- Created new `HeroActionRow` component inside SOSScreen.tsx: full-width `TouchableOpacity` with `flexDirection: 'row'`, 72px height, icon box (40×40) + label/sublabel stack + chevron `›` — same 5-layer Tron glass aesthetic
- All 4 quick-action buttons rebuilt as `HeroActionRow` instances

**New state + query:**
- Added `festivalCountry: string` state (default `'UK'`)
- Added second Drizzle query in `useEffect`: `db.select({ country: festivals.country }).from(festivals).where(eq(festivals.id, 'creamfields-2026')).limit(1)` → sets `festivalCountry`

**SURVIVAL_DICT constant (7 countries):**
```
Croatia · Spain · Belgium · Germany · Netherlands · UK · Italy
Fields: lang (display name), doctor (local translation), charge (local translation)
```

**Smart Survival Translator section (replaces static translation card):**
- `phrases = SURVIVAL_DICT[festivalCountry] ?? SURVIVAL_DICT['UK']`
- `isEnglish = festivalCountry === 'UK' || !(festivalCountry in SURVIVAL_DICT)`
- Language badge (`CROATIAN`, `DUTCH / FR`, etc.) + "AUTO-DETECTED: CROATIA" hint row
- **Medical card** (red glow, `#FF3344`): `🏥 MEDICAL` tag + English hint (hidden if UK) + large Orbitron translated phrase
- **Device card** (cyan glow): `🔋 DEVICE` tag + English hint (hidden if UK) + large Orbitron translated phrase
- UK festivals: no hint line — only the large English phrase is shown

**TypeScript:** `npx tsc --noEmit` PASSED CLEAN (0 errors)

---

## HOW TO START A SESSION
Paste this prompt into Claude Code:
"Read CLAUDE.md, TRAVEL-RAVERS-BUILD-PLAN.md, and BUILD-LOG.md. Find the next incomplete task marked [ ]. Read the skill file listed for that task. Build it. Update this BUILD-LOG when done."

---

## COMPLETED SESSIONS

### Session 1-A — Logo Fix + Button Foundation (2026-03-06)
**Status:** COMPLETE
- Scaffolded full Expo React Native project at TravelRaversV2/
- Created TronGlassButton.tsx with all 5 visual depth layers
- Created GlowBorderCard.tsx (glass panel for content blocks)
- Fixed hero logo container (overflow hidden, resizeMode contain)
- Built HomeScreen with 2x3 TronGlassButton module grid
- Created 6 stub screens (Events, Radar, Map, Timetable, Kit, SOS)
- Created navigation (stack nav, all 7 screens wired)
- Created Colors constants

---

### Session 1-B — Consistent Styling Across All Screens (2026-03-06)
**Status:** COMPLETE
- EventsScreen.tsx — full Tron glass screen with festival card, stage list, featured act cards
- MapScreen.tsx — Tron grid map placeholder, POI category filter chips, zone list, GPS status card
- TimetableScreen.tsx — day selector, stage filter chips, set time list, clash detector card
- KitScreen.tsx — packing progress bar, category tabs, interactive checklist, smart weather tip card
- Corner brackets on ALL interactive elements across all screens
- TypeScript: `npx tsc --noEmit` PASSED CLEAN (0 errors)

---

### Session 1-C — Navigation Restructure (2026-03-06)
**Status:** COMPLETE
- Bottom tab navigator added (HOME tab = HomeStack, SQUAD tab = SquadStack)
- HOME tab: HomeScreen + 6 primary module screens in nested stack
- SQUAD tab: SquadPanelScreen + 5 secondary module screens in nested stack
- HomeScreen: RADAR replaced with TRACK (TrackHunter) as 6th primary module
- New screens: TrackScreen, SquadPanelScreen, WeatherScreen, PixelPartyScreen, BudgetScreen, SquadSetupScreen
- Tab bar: Tron glass dark styling — cyan for HOME, magenta for SQUAD
- TypeScript: `npx tsc --noEmit` PASSED CLEAN (0 errors)

---

### Overnight Polish Session (2026-03-07)
**Status:** COMPLETE
**Tasks delivered:**
- App.tsx: Fixed broken import order, added Orbitron + ShareTechMono font loading, SplashScreen.preventAutoHideAsync, clean SafeAreaProvider structure
- TronGlassButton.tsx: Full redesign to match tron-icons.png reference — deeper dark background with dark teal gradient, stronger neon border glow, diagonal glass gradient layer, pulsing border animation, supports columns={3} for 12-module grid layout, improved corner brackets
- HomeScreen.tsx: Replaced travel-ravers-logo.png with logo-v1.png (actual brand logo), 12-module 3x4 grid layout, added icons for Radar/Weather/PixelParty/Budget/Squad/Setup, "MISSION CONTROL" section divider
- navigation/index.tsx: All 12 screens added to HomeStack so every module is accessible from HomeScreen — Radar, Weather, PixelParty, Budget, SquadPanel, SquadSetup all added
- colors.ts: Added SETUP module colour (#38BDF8 — Light Blue), updated SecondaryModuleId type to include SETUP
- CLAUDE.md: Created at project root ~/Projects/TravelRaversV2/CLAUDE.md with app tech rules section
- BUILD-LOG.md: Created at project root ~/Projects/TravelRaversV2/BUILD-LOG.md

**Design changes from tron-icons.png reference:**
- Background gradient: #071628 top → #020810 bottom (darker, more dramatic than before)
- Border radius: 14px with matching corner bracket radius
- Inner radial glow: stronger, centred at 60% vertical (not centred)
- Top reflection: 2px white band (was 1px) for stronger glass effect
- Bottom accent strip: 75% opacity, 15% inset from edges
- Corner brackets now have matching border-radius to container shape
- Icon size: 28px for 3-col (was 32px for 2-col) — right proportion for smaller tile

---

### Session 1-D — Map and Radar Enhancements (2026-03-10)
**Status:** COMPLETE
- TacticalRadar.tsx: Fully implemented glowing, animated 360 sweeping radar natively via SVG and reanimated.
- MapScreen.tsx: Fully converted to `@rnmapbox/maps` using offline-first approach and custom `mapbox://styles/eljones13/cltycb0zx00x801r8h44h0p4o` dark theme.
- mapService.ts: Added offline region downloading functionality and conditional logic to support web environments without crashing.
- Web support: Implemented graceful UI fallback for the `MapScreen` on web build since Mapbox limits web support in this configuration. Added `metro.config.js` aliases.
- EAS Build: Initialized local project-specific repo to avoid permissions issues and sent `eas build --platform android` to queue.

---

## PROJECT STRUCTURE

```
~/Projects/TravelRaversV2/
  App.tsx                     ENTRY POINT — SafeAreaProvider + fonts + splash
  CLAUDE.md                   AI operating instructions for this project
  BUILD-LOG.md                This file — session handoff
  assets/
    logo-v1.png               BRAND LOGO — neon "TRAVEL RAVERS" with compass
    tron-icons.png            DESIGN REFERENCE — Tron icon aesthetic
    travel-ravers-logo.png    OLD placeholder (keep for now)
  src/
    constants/
      colors.ts               ALL COLOURS — never hard-code elsewhere
    components/
      TronGlassButton.tsx     Module buttons — redesigned for 3-col grid
      GlowBorderCard.tsx      Content panels
    screens/
      HomeScreen.tsx          12-module launcher grid
      EventsScreen.tsx        Phase 1-B complete
      MapScreen.tsx           Phase 1-B complete
      TimetableScreen.tsx     Phase 1-B complete
      KitScreen.tsx           Phase 1-B complete
      SOSScreen.tsx           Stub
      TrackScreen.tsx         Stub — Phase 3-A
      RadarScreen.tsx         Stub
      WeatherScreen.tsx       Stub — Phase 2-A NEXT
      PixelPartyScreen.tsx    Stub — Phase 3-C
      BudgetScreen.tsx        Stub — Phase 2-C
      SquadPanelScreen.tsx    Stub — Phase 2-B
      SquadSetupScreen.tsx    Stub — Phase 2-B
    navigation/
      index.tsx               HomeStack (all 12) + SquadStack + Tab navigator
    db/
      schema.ts               Drizzle schema — festivals + artists tables
      database.ts             expo-sqlite init + drizzle instance + table creation
      seed.ts                 Seed function — reads JSON, inserts on first run
      index.ts                Clean re-exports
      seed-data/
        festivals2026.json    20 UK/EU festivals
        creamfields_artists_2026.json  15 Creamfields artists
        creamfields_2026_full_lineup.json  Full day-by-day lineup (225 artists)
```

---

## BLOCKERS

None current.

Previous blocker resolved: `travel-ravers-logo.png` was a 1x1 placeholder — now using `logo-v1.png` (actual brand logo).

---

## NOTES FOR SESSION 2-A

**Goal:** Weather Screen — full build from Travel Ravers build plan.

**Task list from TRAVEL-RAVERS-BUILD-PLAN.md:**
- [ ] Create WeatherScreen.tsx (replace current stub — fully functional)
- [ ] Fetch from Open-Meteo API using festival GPS coordinates
- [ ] Display: current temp, feels like, rain %, wind speed, UV index
- [ ] Hourly forecast horizontal scroll strip
- [ ] 5-day forecast cards
- [ ] Cache last fetch in SQLite (show "Last updated X mins ago" if offline)
- [ ] Smart KIT alerts (rain → add wellies to packing list)
- [ ] Mini weather widget on HomeScreen under hero logo

**Skill file:** travel-ravers-features.md (Weather section)
**API:** https://api.open-meteo.com (free, no API key needed)
**SQLite:** requires `expo-sqlite` — run `npx expo install expo-sqlite` first

**Navigation note:** WeatherScreen is now accessible from BOTH HomeStack (tap Weather tile on HomeScreen) AND SquadStack (SQUAD tab → Weather). Access path from home: HomeScreen → Weather tile.

---

## ARCHITECTURE NOTES (for reference across all sessions)

**Design rules from hud-design.md (never break these):**
1. Background always #03060f — never white, never light grey
2. Fonts: Orbitron (headings) + Share Tech Mono (data) + Rajdhani (body)
3. All cards: glass treatment — never solid flat colours
4. All borders must glow — never plain grey borders
5. Letter spacing minimum 1.5px on all labels
6. All text uppercase for labels/headings

**Module colour map:**
- EVENTS: #00FFFF (Cyan) | MAP: #00FF88 (Green) | TIMETABLE: #FFB300 (Amber)
- KIT: #FF8C00 (Orange) | SOS: #FF3344 (Red) | TRACK: #A855F7 (Violet)
- RADAR: #CC00FF (Purple) | WEATHER: #00BFFF (Sky Blue) | PIXELPARTY: #FF2D78 (Hot Pink)
- BUDGET: #FFD700 (Gold) | SQUAD: #9D4EDD (Medium Purple) | SETUP: #38BDF8 (Light Blue)
