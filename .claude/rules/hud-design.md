# TRAVEL RAVERS — HUD DESIGN RULES
## Read this before touching any visual component.

---

## THE AESTHETIC
Tron Legacy meets military HUD meets premium festival app.
NOT: flat emoji icons, gradients, rounded bubble buttons, white backgrounds.
YES: dark glass panels, neon outlines, glowing data readouts, animated borders.

Think: you are designing the UI for a futuristic weapon system
that happens to be used at raves.

---

## COLOUR RULES — EXACT HEX, NO SUBSTITUTIONS

| Token | Hex | Use |
|-------|-----|-----|
| Background | #03060f | Every screen base |
| Cyan | #00f5ff | Primary UI, borders, active states |
| Magenta | #ff00ff | Energy, vibe, mesh events |
| Green | #00ff88 | Success, GPS locked, offline ready |
| Orange | #ff8c00 | Warnings, aggro medium |
| Red | #ff0040 | Danger, SOS only — never decorative |
| Violet | #7b2fff | Mesh network events |
| White text | rgba(255,255,255,0.9) | Primary readable text |
| Dim text | rgba(255,255,255,0.45) | Secondary info |
| Dead text | rgba(255,255,255,0.2) | Disabled / inactive |

---

## TYPOGRAPHY RULES

### Orbitron_700Bold — DISPLAY FONT
- ALL headers, screen titles, card names, button labels
- ALWAYS uppercase — never mixed case
- letterSpacing: minimum 2, headers use 4-6
- textShadow always: same color as text, radius 6-12

### ShareTechMono_400Regular — DATA FONT  
- ALL numbers, coordinates, stats, status messages
- ALL system readouts (GPS LOCKED, MESH ACTIVE etc)
- lowercase with underscores: "mesh_active", "gps_locked"
- Never use for headings

---

## GLASS PANEL RULES — THE CORE COMPONENT

Every card/panel must have ALL of these:

### Structure (bottom to top):
1. **Outer glow** — position absolute, inset -1, borderRadius +2
   shadowColor: accentColor, shadowRadius: 16, shadowOpacity: 0.4
   
2. **Glass body**
   backgroundColor: rgba(6, 16, 36, 0.75)
   borderWidth: 1
   borderColor: accentColor + '40' (25% opacity)
   borderRadius: 20 minimum — NEVER less
   overflow: hidden — ALWAYS

3. **Top shine streak** — position absolute, top 0, left 0, right 0
   height: 1, backgroundColor: rgba(255,255,255,0.18)
   This is the most important detail — makes it look like real glass

4. **Bottom glow line** — position absolute, bottom 0, left 10%, right 10%
   height: 1, backgroundColor: accentColor, opacity: 0.4
   shadowColor: accentColor, shadowRadius: 4

5. **Inner radial glow** — position absolute, inset 0
   A View with accentColor at 6% opacity, centered
   Creates lit-from-within effect

6. **Corner brackets** — 4 corners, position absolute
   10x10, borderColor: accentColor at 50% opacity
   TL: borderTopWidth+borderLeftWidth, TR: borderTopWidth+borderRightWidth
   BL: borderBottomWidth+borderLeftWidth, BR: borderBottomWidth+borderRightWidth
   offset: 6px from corner

7. **Content** — on top of everything, zIndex: 2

### NEVER DO:
- Sharp corners (borderRadius 0 or less than 12)
- White or light backgrounds
- Solid filled backgrounds (always semi-transparent)
- Missing overflow:hidden (causes square bleeds)
- Flat icons with no glow

---

## ANIMATED BORDER — TRON LIGHT CYCLE EFFECT

The GlowBorderCard component wraps every home screen card.
The animation is a bright light tip racing around the border.

### Spec:
- Rotation: 360 degrees, 3000ms, loop infinitely
- useNativeDriver: true — ALWAYS
- The tip: full opacity accentColor, 40x40 circle
- The trail: fading from accentColor to transparent over ~90 degrees
- Border behind ray: 1px accentColor at 20% opacity (always visible base)
- On the card body: borderRadius 22
- On the rotation container: borderRadius 24 (2px larger than card)
- overflow: hidden on rotation container

### Implementation pattern:
```
Outer View (position relative, borderRadius 22)
  └── Rotating View (position absolute, inset -1.5, borderRadius 24, overflow hidden)
       └── Child View (width 200%, height 200%, top -50%, left -50%)
            ├── Bright tip View (accentColor full opacity)
            └── Trail View (accentColor fading)
  └── Card body View (margin 1.5, borderRadius 20, overflow hidden)
       └── Content
```

---

## ICON RULES — SVG ONLY, NO IONICONS

All icons must be custom SVG using react-native-svg.
Style: outlined strokes, no fills, neon glow.

### Spec for every icon:
```jsx
<Svg width={40} height={40} viewBox="0 0 40 40">
  <Path
    d="..."
    stroke={cardColor}
    strokeWidth={1.5}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</Svg>
```

Wrap in View with:
```
shadowColor: cardColor
shadowOffset: { width: 0, height: 0 }
shadowRadius: 16
shadowOpacity: 1
elevation: 8
```

### Icon designs:
- **EVENTS**: Three concentric arcs radiating from bottom-centre (radio waves)
- **RADAR**: Diamond/rhombus with crosshair lines, small dot at centre
- **MAP**: Hexagon outline with location dot in centre
- **TIMETABLE**: Circle with clock hands at 10:10, tick marks at 12/3/6/9
- **KIT**: Backpack outline — rectangle body, curved top, two shoulder straps
- **SOS**: Equilateral triangle with exclamation mark inside

---

## SCREEN BACKGROUND — EVERY SCREEN

```
Layer 1: backgroundColor #03060f (base)
Layer 2: ImageBackground src/assets/rave-festival-bg.jpg
         overlay: rgba(3,6,15,0.78) covers entire image
Layer 3: Orb 1 — top-right, #00f5ff, 280x280, opacity 0.12
         Animated pulse: scale 1.0 → 1.2 → 1.0, 5000ms loop
Layer 4: Orb 2 — bottom-left, #ff00ff, 220x220, opacity 0.09
         Animated pulse: scale 1.0 → 1.15 → 1.0, 7000ms loop
Layer 5: Scanlines — 60 horizontal lines, opacity 0.04
Layer 6: Children content
```

All Animated values: useNativeDriver: true

---

## HUD HEADER — TOP OF EVERY SCREEN

```
[● LOCKED]  SCREEN NAME  82%
```

- Container: backgroundColor rgba(3,6,15,0.92)
  paddingHorizontal 16, paddingVertical 12
  borderBottomWidth 1, borderBottomColor rgba(0,245,255,0.12)

- GPS pill states:
  LOCKED: backgroundColor rgba(0,255,136,0.15), border #00ff88, text #00ff88
  WEAK: backgroundColor rgba(255,140,0,0.15), border #ff8c00, text #ff8c00
  OFF: backgroundColor rgba(255,0,64,0.15), border #ff0040, text #ff0040
  All with glow shadow matching pill color

- Title: Orbitron, fontSize 14, letterSpacing 4, color #00f5ff
  textShadow: #00f5ff, radius 8

- Battery: ShareTechMono, fontSize 11
  >20%: rgba(255,255,255,0.6) | ≤20%: #ff8c00

---

## MESH STATUS BAR

Thin strip below HudHeader on every screen.
Cycles every 3000ms between:
- "SCANNING FOR SQUAD..."
- "MESH ACTIVE // SEARCHING"
- "NO NODES DETECTED"
- "OFFLINE_READY // STANDBY"

Font: ShareTechMono, fontSize 9, color #00f5ff, opacity 0.5
Fade transition: 300ms out, swap text, 300ms in

---

## FILTER TABS

Used on Events screen and wherever filtering is needed.

Active pill:
- backgroundColor: rgba(0,245,255,0.2)
- borderColor: #00f5ff
- borderWidth: 1
- color: #00f5ff
- textShadow: #00f5ff radius 6

Inactive pill:
- backgroundColor: transparent
- borderColor: rgba(255,255,255,0.15)
- color: rgba(255,255,255,0.4)

Font: Orbitron, fontSize 10, uppercase, letterSpacing 1
borderRadius: 20 (full pill shape)

---

## DATA CARDS (Festival/Event cards)

Left accent bar:
- width: 4, height: 100%, position absolute left
- backgroundColor: accentColor
- shadowColor: accentColor, shadowOffset {4,0}, shadowRadius 12, shadowOpacity 1
- Creates horizontal light bleed into card

Score colours:
- AGGRO: >7 = #ff0040, >4 = #ff8c00, ≤4 = #00ff88
- FIRST-TIMER: >7 = #00ff88, >4 = #ff8c00, ≤4 = #ff0040

Genre tags:
- backgroundColor: accentColor + '20' (12% opacity)
- borderColor: accentColor, borderWidth 1
- borderRadius: 10
- shadowColor: accentColor, shadowRadius 4, shadowOpacity 0.6

---

## RADAR SCREEN SPEC

Circular HUD dish, centred on screen.

- 5 concentric rings: #00f5ff, opacity decreasing outward (0.3 → 0.06)
- Crosshair: thin cyan lines through centre
- Compass labels: N S E W in ShareTechMono, cyan, small
- Range labels: 100m, 250m, 500m on right side
- Rotating sweep: magenta #ff00ff, conic gradient trail
  Full rotation: 4000ms, loop
- Centre dot: #00f5ff, 8px, pulsing
- Peer dots: 10px, peer color, pulsing ring
- Peer labels: name + distance chip in ShareTechMono

---

## MAP SCREEN SPEC — TRON LEGACY

This is the most visually important screen.

- Base: near-black #010408
- Perspective grid floor: converging lines from bottom-centre
  Line color: rgba(0,245,255,0.08) — very subtle
  Creates Tron Legacy arena floor effect
- Festival zones: glowing OUTLINED polygons only — no solid fills
  Border: accentColor, width 2, glowing shadow
- Stage markers: bright dots with bloom/glow, label chips
- Medical tents: red pulsing circles
- Water points: blue ripple animation
- User location: bright white/cyan pulsing dot
- Squad dots: coloured with light trail history
- Everything has a scanline overlay on top

NO Google Maps style. NO filled shapes. NO light backgrounds.
This screen should look like the Identity Disc arena from Tron Legacy.

---

## SOS SCREEN SPEC

- Full screen red tint: rgba(40,0,0,0.9) overlay
- Large hold button: circular, 120px diameter
  Red border rgba(255,0,64,0.6), pulsing
  3-second hold to activate
  SVG progress ring animates around button during hold
- "HOLD 3s TO ACTIVATE" in ShareTechMono below button
- On activation: full screen red flash, haptics
- GPS coordinates displayed in ShareTechMono

---

## ANIMATION PRINCIPLES

1. useNativeDriver: true — ALWAYS on transforms and opacity
2. No layout animations with useNativeDriver (width/height = JS thread)
3. Pulse animations: scale 1.0 → target → 1.0, Animated.sequence + loop
4. Fade transitions: opacity 0 → 1 or 1 → 0, 300ms
5. Rotation: interpolate 0 → '360deg', loop
6. All animations start on mount, cleanup on unmount with animation.stop()

---

## WHAT MAKES IT LOOK PREMIUM VS AMATEUR

| Amateur | Premium |
|---------|---------|
| Ionicon emoji icons | Custom SVG outlined strokes |
| Sharp corners | borderRadius 20+ everywhere |
| Missing overflow:hidden | overflow:hidden on every layer |
| Flat backgrounds | Semi-transparent glass with radial glow |
| No text shadows | textShadow on every header |
| Static borders | Animated rotating light ray |
| White/grey icons | Neon colored icons with glow shadow |
| No top shine | 1px rgba(255,255,255,0.18) shine on every panel |
| Hard card edges | Fade overlays blending card into background |
| Generic spacing | Precise spacing matching design system |

---

*Travel Ravers HUD Design System // © 2026 Errol Jones*
