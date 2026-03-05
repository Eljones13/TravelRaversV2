# TRAVEL RAVERS — CLAUDE.md
## Root truth file. Read this before touching any file.

---

## WHO IS BUILDING THIS
Errol Jones (eljones13). Not a professional developer.
Explain things in plain English. Always read existing files before making changes.
Confirm each fix before moving to the next.

---

## WHAT IS TRAVEL RAVERS
An offline-first festival survival app. Works with ZERO mobile signal.
Uses Bluetooth mesh networking (Bridgefy) — more phones = stronger network.
Target: 18-35 year old electronic music festival attendees.

**Tagline:** Pack. Plan. Party. No Signal Required.

**Core features:**
- Squad Radar — see friends on tactical HUD radar via Bluetooth mesh
- Offline Maps — pre-downloaded festival maps, GPS dot, stage markers
- Timetable — festival schedule with DJ vibe profiles
- Aggrometer — crowd energy levels per stage
- SOS — emergency broadcast to ALL nearby Travel Ravers users
- Kit List — offline survival checklist
- Squad Mesh — share pins and locations via Bluetooth

---

## PROJECT LOCATION
```
~/Projects/TravelRaversV2
```
Bundle ID: com.eljones13.travelravers
Expo account: eljones13
EAS Project ID: 414f9351-9a7c-4498-b38c-349f77622cec

---

## TECH STACK — NEVER CHANGE THESE
- React Native + Expo SDK 55
- Bridgefy SDK — Bluetooth mesh (API key: c42986b8-9496-4f85-aca6-c8c32f1ddfc2 SANDBOX)
- Mapbox (@rnmapbox/maps) — offline maps
- WatermelonDB — local offline storage
- Zustand — state management
- Supabase — cloud sync only when signal available
- EAS Build — Android + iOS builds
- TypeScript throughout — zero errors always

---

## DESIGN SYSTEM — EXACT VALUES, NO SUBSTITUTIONS

### Colours
```
Background:     #03060f
Cyan:           #00f5ff  ← primary interaction, borders, data readouts
Magenta:        #ff00ff  ← accents, vibe, energy
Green:          #00ff88  ← success, offline ready, GPS locked
Orange:         #ff8c00  ← warnings, aggro medium
Red:            #ff0040  ← danger, SOS only
Violet:         #7b2fff  ← mesh events
```

### Glass panels
```
Background:     rgba(8, 20, 40, 0.55)
Border:         rgba(0, 245, 255, 0.22)
Border radius:  20-24 (curved, never sharp)
overflow:       hidden on EVERY nested View
```

### Fonts
```
Orbitron_700Bold         ← ALL headers, labels, buttons — always UPPERCASE
ShareTechMono_400Regular ← ALL data readouts, mono text, system status
```

### Background layers (every screen)
1. Base: #03060f
2. ImageBackground: src/assets/rave-festival-bg.jpg — dark overlay rgba(3,6,15,0.78)
3. Orb 1: top-right, cyan #00f5ff, 280x280, opacity 0.12, pulse 5000ms
4. Orb 2: bottom-left, magenta #ff00ff, 220x220, opacity 0.09, pulse 7000ms
5. Scanlines: horizontal lines, opacity 0.04, pointerEvents none
6. Children on top

### Card style — Tron Legacy aesthetic
- Curved corners: borderRadius 20-24 on EVERY layer, overflow hidden everywhere
- Animated rotating light ray around border (use GlowBorderCard component)
- Inner grid texture: subtle lines in card color at 6% opacity
- Top shine: rgba(255,255,255,0.18) height 1.5px
- Bottom shine: rgba(255,255,255,0.06) height 1px
- Outer glow shadow: accentColor, shadowRadius 16, opacity 0.4
- Icons: SVG outlined strokes — NOT flat emoji Ionicons

---

## CURRENT BUILD STATE

### ✅ Phase 0 — Project setup COMPLETE
### ✅ Phase 1 — Navigation shell COMPLETE
### ✅ Phase 2 — Events screen COMPLETE
### ✅ Phase 3 — Home screen COMPLETE

### 🔲 Phase 4 — Radar screen NEXT
### 🔲 Phase 5 — Map screen (Tron Legacy style)
### 🔲 Phase 6 — Timetable screen
### 🔲 Phase 7 — Kit screen
### 🔲 Phase 8 — SOS screen
### 🔲 Phase 9 — GPS (expo-location)
### 🔲 Phase 10 — WatermelonDB persistence
### 🔲 Phase 11 — Bridgefy real SDK
### 🔲 Phase 12 — Mapbox offline packs
### 🔲 Phase 13 — Supabase sync

---

## COMPONENT INVENTORY — REUSE, NEVER DUPLICATE

| Component | Location | What it does |
|-----------|----------|-------------|
| ScreenBackground | src/components/shared/ | Rave bg + orbs + scanlines |
| GlassPanel | src/components/shared/ | Glass card wrapper |
| GlowBorderCard | src/components/shared/ | Animated Tron rotating border |
| HudHeader | src/components/shared/ | GPS badge + title + battery |
| MeshStatusBar | src/components/shared/ | Cycling mesh status messages |

---

## HARDCODED DATA — NEVER FETCHED FROM NETWORK

### 8 Festivals (src/data/festivals.ts)
Creamfields (#00f5ff) | Terminal V (#ff00ff) | Parklife (#00ff88)
Glastonbury (#ffcc00) | Notting Hill Carnival (#ff8c00)
Tomorrowland (#7b2fff) | O2 Arena (#ff0040) | Houghton (#00f5ff)

Each festival: id, name, location, dates, region, genres,
accentColor, aggroScore, firstTimerScore, description

### Zustand Stores (src/stores/)
- festivalStore — festivals, selectedFestival, activeFestival, activeFilter
- meshStore — peers (4 fake), connectionStatus

### 4 Fake mesh peers (meshStore)
SANDY — bearing 45, distance 180, color #00f5ff
BASE CAMP — bearing 260, distance 320, color #ff8c00
RTAG — bearing 190, distance 90, color #00ff88
DEX — bearing 310, distance 140, color #ff00ff

---

## ASSETS
```
src/assets/
├── rave-festival-bg.jpg   ← background image (every screen)
├── logo-v1.png            ← Travel Ravers logo dramatic version
└── logo-v2.png            ← Travel Ravers logo clean version
```

---

## SCREENS BUILT SO FAR

### HomeScreen.tsx (✅ built)
- Dashboard: 6 Tron-style feature cards in 2-column grid
- TRAVEL RAVERS title with cyan/magenta gradient
- Active festival banner when festival is selected
- Each card navigates to correct tab

### EventsScreen.tsx (✅ built)
- Filter tabs: ALL | UK | EU | CARNIVAL | CONCERT
- Festival cards: accent bar, genre tags, aggro/first-timer scores
- Tap card → confirmation → setActiveFestival → navigate HOME

### All other screens = placeholder only (name centred in cyan Orbitron)

---

## MANDATORY RULES

1. ONE FILE AT A TIME — show file, wait for OK, then next
2. READ BEFORE EDITING — always read the file first
3. TSC AFTER EVERY FILE — npx tsc --noEmit, fix all errors immediately
4. EXPO-DOCTOR AFTER INSTALLS — must show 17/17
5. CURVED CORNERS ALWAYS — borderRadius 20+ everywhere, overflow hidden
6. OFFLINE FIRST — every feature works in airplane mode
7. STUB UNBUILT FEATURES — mark: // TODO: REAL IMPL — stubbed
8. MAX 300 LINES PER FILE — split if getting long
9. GIT AFTER EVERY PHASE — git add -A && git commit -m "Phase X: description"
10. NO LOREM IPSUM — all text must be real Travel Ravers copy

---

## SESSION START COMMAND
Paste this at the start of every Claude Code session:
```
Read CLAUDE.md.
Tell me which phase we are on.
Do not start coding until I give the instruction.
Show me one file at a time. Wait for OK before each next step.
```

---

## BUILD COMMANDS
```bash
npx expo start --web      # browser preview at localhost:8082
npx tsc --noEmit          # TypeScript check — must be 0 errors
npx expo-doctor           # health check — must be 17/17
git add -A && git commit -m "Phase X: description"
```

---

## VISUAL REFERENCES FOR UPCOMING SCREENS
- Radar: circular HUD dish, magenta sweep, squad dots with ping rings
- Map: TRON LEGACY — dark grid floor, glowing outlined zones (no fills),
  circuit board texture, neon zone labels, user dot with bloom glow
- Timetable: real festival stage photo blurred behind glass panels,
  set times as glass cards, NOW PLAYING badge
- DJ cards: huge neon name, TECHNO/ACID genre chips, circular play button,
  RPG stats (VIBE: DARK, FIRST-TIMER SCORE: 8/10)
- SOS: full screen red, 3-second hold button with circular progress ring

---

*Travel Ravers // Pack. Plan. Party. No Signal Required. // © 2026 Errol Jones*
