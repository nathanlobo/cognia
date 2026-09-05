# Graph Report - C:/Users/nathan/Developer_Lobo/cognia  (2026-09-05)

## Corpus Check
- 60 files · ~170,288 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 250 nodes · 313 edges · 26 communities (18 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.82)
- Token cost: 1,650 input · 1,240 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Speech & Interactive Game Loop|Speech & Interactive Game Loop]]
- [[_COMMUNITY_Patient Dashboard & Therapy UI|Patient Dashboard & Therapy UI]]
- [[_COMMUNITY_Caregiver & Profile Management|Caregiver & Profile Management]]
- [[_COMMUNITY_TypeScript Build Configuration|TypeScript Build Configuration]]
- [[_COMMUNITY_Application Production Dependencies|Application Production Dependencies]]
- [[_COMMUNITY_Project Metadata & Dev Dependencies|Project Metadata & Dev Dependencies]]
- [[_COMMUNITY_Caregiver Analytics & Metrics|Caregiver Analytics & Metrics]]
- [[_COMMUNITY_Cross-Cutting Architecture & Media|Cross-Cutting Architecture & Media]]
- [[_COMMUNITY_Header & Shared Modals|Header & Shared Modals]]
- [[_COMMUNITY_Root Layout & Theming|Root Layout & Theming]]
- [[_COMMUNITY_PWA Web Manifest|PWA Web Manifest]]
- [[_COMMUNITY_Dynamic Level Generation API|Dynamic Level Generation API]]
- [[_COMMUNITY_Caregiver Insights API|Caregiver Insights API]]
- [[_COMMUNITY_Product Overview & Clinical Domains|Product Overview & Clinical Domains]]
- [[_COMMUNITY_Graphify Agents Workflow|Graphify Agents Workflow]]
- [[_COMMUNITY_Next.js Build Config|Next.js Build Config]]
- [[_COMMUNITY_ESLint Linter Configuration|ESLint Linter Configuration]]
- [[_COMMUNITY_PostCSS Style Pipeline|PostCSS Style Pipeline]]
- [[_COMMUNITY_Claude Coding Directives|Claude Coding Directives]]
- [[_COMMUNITY_AI Pair Programming Guidelines|AI Pair Programming Guidelines]]
- [[_COMMUNITY_Cognia Brand Logo|Cognia Brand Logo]]
- [[_COMMUNITY_Apple Touch PWA Icon|Apple Touch PWA Icon]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `supabase` - 10 edges
3. `startSTT()` - 8 edges
4. `getTTSEnabled()` - 7 edges
5. `speak()` - 7 edges
6. `stopSTT()` - 6 edges
7. `setTTSEnabled()` - 6 edges
8. `stopSpeech()` - 6 edges
9. `scripts` - 5 edges
10. `SessionResult` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Reminiscence Digital Memory Scrapbook` --references--> `Family Memory Album Visual Cover`  [EXTRACTED]
  components/PatientMemoriesScreen.tsx → public/images/memories/family_cover.jpg
- `Reminiscence Digital Memory Scrapbook` --references--> `Hobby & Passion Memory Album Cover`  [EXTRACTED]
  components/PatientMemoriesScreen.tsx → public/images/memories/hobby_cover.jpg
- `Reminiscence Digital Memory Scrapbook` --references--> `Regional & Hometown Memory Album Cover`  [EXTRACTED]
  components/PatientMemoriesScreen.tsx → public/images/memories/regional_cover.jpg
- `listenForVoice()` --calls--> `startSTT()`  [EXTRACTED]
  components/DailySessionScreen.tsx → lib/stt.ts
- `listenForVoice()` --calls--> `stopSTT()`  [EXTRACTED]
  components/DailySessionScreen.tsx → lib/stt.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Cognitive-Physical Dual-Task Loop** — daily_session_state_machine, game_screen_interactive, stt_web_speech_engine, tts_speech_synthesis_engine, generate_levels_route [INFERRED 0.85]
- **Caregiver Monitoring & AI Insights Pipeline** — caregiver_dashboard_view, generate_insights_route, supabase_clinical_telemetry_db [INFERRED 0.85]

## Communities (26 total, 8 thin omitted)

### Community 0 - "Speech & Interactive Game Loop"
Cohesion: 0.07
Nodes (35): DailySessionScreenProps, listenForVoice(), Step, CameraStatus, GameScreenProps, GESTURE_LABELS, GESTURE_PROMPTS, GestureType (+27 more)

### Community 1 - "Patient Dashboard & Therapy UI"
Cohesion: 0.08
Nodes (13): ActivitiesProps, DOMAINS, CheckInProps, OverviewProps, WelcomeProps, StreakBannerProps, fetchPatientHistory(), fetchPatientPreferences() (+5 more)

### Community 2 - "Caregiver & Profile Management"
Cohesion: 0.10
Nodes (12): ConsentModalProps, DeletePatientModalProps, Patient, EditProfileModalProps, Profile, LoginScreenProps, PatientProfileFormProps, supabase (+4 more)

### Community 3 - "TypeScript Build Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 4 - "Application Production Dependencies"
Cohesion: 0.11
Nodes (18): dependencies, ai, @ai-sdk/google, @ai-sdk/openai, @heroicons/react, jspdf, jspdf-autotable, lucide-react (+10 more)

### Community 5 - "Project Metadata & Dev Dependencies"
Cohesion: 0.11
Nodes (17): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+9 more)

### Community 6 - "Caregiver Analytics & Metrics"
Cohesion: 0.16
Nodes (8): CaregiverDashboard(), CaregiverDashboardProps, formatDate(), GameSession, InsightBadgeProps, MetricCardProps, TrendChartProps, SessionResult

### Community 7 - "Cross-Cutting Architecture & Media"
Cohesion: 0.18
Nodes (13): Family Memory Album Visual Cover, Hobby & Passion Memory Album Cover, Regional & Hometown Memory Album Cover, Caregiver Clinical Dashboard, 6-Step Daily Companion State Machine, Interactive Dual-Task Exergame Component, Clinical Caregiver Insights Generator API, AI Dynamic Level Generation API (+5 more)

### Community 8 - "Header & Shared Modals"
Cohesion: 0.22
Nodes (3): HeaderProps, NoPatientModalProps, ThemeToggle()

### Community 9 - "Root Layout & Theming"
Cohesion: 0.25
Nodes (4): lexend, metadata, viewport, ThemeProvider()

### Community 10 - "PWA Web Manifest"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 11 - "Dynamic Level Generation API"
Cohesion: 0.32
Nodes (7): determineDifficultyProfile(), DifficultyProfile, FALLBACK_ROUNDS, GenerationSchema, groq, POST(), RoundSchema

### Community 12 - "Caregiver Insights API"
Cohesion: 0.50
Nodes (4): GenerationSchema, groq, InsightSchema, POST()

### Community 13 - "Product Overview & Clinical Domains"
Cohesion: 0.67
Nodes (3): Cognia App Overview, Cognitive Exercise Domains, Physical & Cognitive Dual-Task Protocol

## Knowledge Gaps
- **124 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+119 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase` connect `Caregiver & Profile Management` to `Patient Dashboard & Therapy UI`, `Dynamic Level Generation API`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Application Production Dependencies` to `Project Metadata & Dev Dependencies`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _126 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Speech & Interactive Game Loop` be split into smaller, more focused modules?**
  _Cohesion score 0.07446808510638298 - nodes in this community are weakly interconnected._
- **Should `Patient Dashboard & Therapy UI` be split into smaller, more focused modules?**
  _Cohesion score 0.08465608465608465 - nodes in this community are weakly interconnected._
- **Should `Caregiver & Profile Management` be split into smaller, more focused modules?**
  _Cohesion score 0.10317460317460317 - nodes in this community are weakly interconnected._
- **Should `TypeScript Build Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._