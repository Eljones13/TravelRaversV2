# ERROL LLOYD JONES — CLAUDE COWORK OPERATING SYSTEM
**PROJECT PATH: ~/Projects/TravelRaversV2 — ALL files go here, never in Downloads**

**Last Updated:** March 2026
**Owner:** Errol Lloyd Jones | E.L.Jones Enterprise LTD
**Location:** Livingston, Scotland, GB (GMT)
**Trading As:** Swarv Barbershop | Jumpstart Careers | Travel Ravers | Stinker Ninja & Sticky Magoo

---

## WHO I AM

I am a 50-year-old barber of 34 years, founder, author, and creator. I built my insights from thousands of conversations with young people in my barber's chair. I am not a developer — I am a non-technical founder using AI to build a business empire across four distinct brands. My voice is the "Concerned Dad / Wise Barber" — direct, warm, empathetic, street-wise, no corporate fluff.

I have a stutter which I am actively managing. I prefer written communication over verbal where possible.

---

## MY FOUR BRANDS (THE EMPIRE)

### 1. JUMPSTART CAREERS (jumpstartcareers.co.uk)
**What it is:** UK EdTech platform using the Volume Experience Method (VEM) to help 18-24 NEETs and school leavers find employment
**Core philosophy:** "Every NO is training for your eventual YES"
**Tech stack:** React 18 / Tailwind CSS / Supabase / Vite — hosted on Hostinger
**GitHub:** github.com/Eljones13/jumpstart-careers-new
**Revenue model:** Free for users, B2G paid by councils/Jobcentres/Youth Hubs
**Status:** Platform exists, pivoting from schools (15-16) to 18-24 NEETs
**Priority:** HIGH — Spring 2026 Youth Guarantee launch timing is critical

### 2. TRAVEL RAVERS (travelraverschecklist.com / travelravers.com)
**What it is:** Festival travel planning website + offline-first mobile app for UK/EU ravers aged 18-30
**Tech stack:** React 18 / TypeScript / Vite / Tailwind / ShadcnUI (website); React Native + Expo / Drizzle ORM + SQLite / Supabase (app)
**App project folder:** ~/Projects/TravelRaversV2
**Revenue model:** Affiliate links (Amazon tag: icouldwatcham-21, Skyscanner, Booking.com, SafetyWing) + in-app subscription ($4.99/month or $39.99/year)
**Status:** Phase 1 complete. Phase 2 (Weather, Squad, Budget) next.
**Priority:** MEDIUM — 2026 festival season is the window

### 3. STINKER NINJA & STICKY MAGOO
**What it is:** 13-book children's series (ages 7-10) — gross-out humor + anti-bullying themes
**Characters:** Charlie Gassowitz (Stinker Ninja) + Alex Dripman (Sticky Magoo)
**Publishing:** Amazon Kindle KDP (ebook + print on demand)
**Status:** All 13 stories written. Illustration workflow not confirmed. No books published yet.
**Priority:** MEDIUM — passive income stream once launched

### 4. VEM CONTENT ENGINE (Books & IP)
**What it is:** Published books and curriculum IP for the Volume Experience Method
**Books in pipeline:** The VEM Guide, Meditations for Job Seekers, Career Confidence: Lessons from Oz, The Hidden Gatekeepers (ATS), Desire-to-Hired, Interview Skills from Carnegie, The Careers Confident Puzzle Book
**Publishing:** Amazon KDP
**Status:** Outlines complete, manuscripts in progress
**Priority:** MEDIUM — supports Jumpstart Careers authority and passive income

---

## MY NORTH STAR GOALS

### Q1-Q2 2026 (Now — June 2026)
- [ ] Complete Jumpstart Careers 18-24 pivot (remove school features, add adult features)
- [ ] Launch revised jumpstartcareers.co.uk targeting NEETs
- [ ] Register on DWP BravoSolution portal
- [ ] Send 50 partnership emails to Jobcentre Plus districts
- [ ] Incorporate Jumpstart Careers Ltd at Companies House
- [ ] Publish first Stinker Ninja book on KDP
- [ ] Complete Travel Ravers SEO remediation (Phase 1)

### Q3 2026 (July — September 2026)
- [ ] Land 2-3 council/Youth Hub contracts (£5K+ each)
- [ ] Reach 100 active Jumpstart Careers pilot users
- [ ] Begin Travel Ravers app build (fork offline-first template)
- [ ] Publish 3 more Stinker Ninja books
- [ ] Complete Meditations for Job Seekers book

### By End 2026
- [ ] £10K MRR from Jumpstart Careers B2G contracts
- [ ] Travel Ravers app live on App Store
- [ ] All 13 Stinker Ninja books published
- [ ] VEM book series live on Amazon

---

## MY AI WORKFLOW STACK

| Tool | Role |
|------|------|
| **Claude Code (YOU)** | Control Tower — write code, manage files, run builds |
| **Claude.ai** | Strategy, writing, long-form thinking |
| **Perplexity** | Research, live market data, competitor analysis |
| **NotebookLM** | Deep document analysis, workshop material generation |
| **Gemini** | React component generation, UI design from specs |
| **Lovable.ai** | Website/app scaffolding |
| **HeyGen** | Avatar video production |
| **Canva Pro** | Design, book layout |
| **Leonardo AI** | Children's book illustrations |

---

## NOTEBOOKLM INTEGRATION

The `notebooklm` CLI tool is installed and authenticated on this system. Use it as a research layer before building any major feature.

**CLI reference:**
- `notebooklm list` — show all notebooks
- `notebooklm use [partial-id]` — set active notebook context
- `notebooklm ask "[question]"` — query the active notebook

**Travel Ravers notebooks:**
- `2cec9263` — **Travel Ravers HQ** (main product research — use this for app features)
- `463b2f29` — **Travel Ravers Engineer** (technical build notes)

**When to use NotebookLM:**
Before building any major feature (Radar, Pixel Party, Track Hunter, Budget, Weather, Squad), run:
```
notebooklm use 2cec9263
notebooklm ask "What are the exact business rules and UX requirements for [Feature Name]?"
```
Use the response to:
1. Confirm the feature scope matches Errol's original vision
2. Extract any brand voice or "Concerned Dad" copy requirements
3. Identify any offline-first or safety constraints that must be respected
4. Ensure the build stays 'Unbreakable' — no feature ships without its research pass

**Rule:** If NotebookLM returns content that contradicts the current build plan, flag it to Errol before proceeding.

---

## HOW I LIKE TO WORK

- Break big tasks into small daily steps
- Show me what you're doing before you do it
- Always save outputs to files — don't just show in chat
- If you're unsure what I want, ask ONE clarifying question
- Prioritise revenue-generating tasks over nice-to-haves
- Remind me of my goals if I go off track
- Use the "Concerned Dad" voice in all content you write for me

---

## TRAVEL RAVERS APP — TECH RULES (never break these)

1. **Project folder:** `~/Projects/TravelRaversV2` — all files go here
2. **Run app:** `cd ~/Projects/TravelRaversV2 && npx expo start`
3. **Background:** always `#03060f` — never white, never light grey
4. **Fonts:** Orbitron (headings) + Share Tech Mono (data) + Rajdhani (body)
5. **All cards:** glass treatment — never solid flat colours
6. **All borders:** must glow — never plain grey borders
7. **Letter spacing:** minimum 1.5px on all labels
8. **All text:** uppercase for labels/headings
9. **Colours:** only from `src/constants/colors.ts` — never hard-code hex values
10. **Icons:** SVG inline — no @expo/vector-icons dependency for core screens
11. **TypeScript:** run `npx tsc --noEmit` before marking any session complete

---

## KEY TERMINOLOGY (GLOSSARY)

- **VEM** = Volume Experience Method
- **Blank Box Anxiety** = Fear young people feel facing empty application forms
- **Rejection Muscle** = Resilience built through repeated rejection exposure
- **10-App Rule** = VEM's core: 10 job applications per week
- **NEET** = Not in Education, Employment, or Training
- **Gatsby Benchmarks** = 8 UK national career guidance standards schools must meet
- **Concerned Dad** = My brand persona/voice
- **Wise Barber** = My authority positioning (34 years of barbershop wisdom)
- **Sneakernet QR Sharing** = Travel Ravers offline data transfer feature
- **RAVESafe** = Travel Ravers harm reduction module
- **Atlantean Delegation** = Using AI agents to handle grunt work

## SKILL FILES
LEONARDO SKILL: ~/Downloads/Errol-Cowork/skills/leonardo-asset-skill.md
Run this before every session that needs icons. Claude Browser reads and executes it.
Results log must be updated after every icon generation session.

## SELF-IMPROVEMENT RULE (applies to all skills)
At the end of every session that uses a skill file:
1. Add an entry to RESULTS LOG at the bottom of that skill file
2. Record: what worked, what failed, what prompt change fixed it
3. Update the KNOWN ERRORS & FIXES section with anything new discovered
4. Never delete old entries — the log is the memory

## KNOWN ERRORS & FIXES (update this list every session)
- TypeScript shadow props: use Platform.select boxShadow on web, elevation on native
- Expo font loading: always await before rendering, check fontsLoaded AND fontError both
- 3-column grid: use gap not margin — margin causes overflow on narrow screens
- White screen: always run npx expo start --web --clear after file changes
- Token efficiency: do not explain steps in chat — write to files and act silently

## SESSION START RULE
Every Antigravity session must begin with:
1. Read CLAUDE.md (this file)
2. Read BUILD-LOG.md — find TONIGHT'S SESSION or NEXT SESSION block
3. Execute tasks silently — no explanations in chat
4. Mark each completed task ✅ DONE in BUILD-LOG.md as you go
5. Write SESSION COMPLETE at top of BUILD-LOG when all tasks done
6. Run npx tsc --noEmit — fix any errors before closing
