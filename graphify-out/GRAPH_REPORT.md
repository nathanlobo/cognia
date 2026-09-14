# Graph Report - .  (2026-09-14)

## Corpus Check
- 73 files · ~178,907 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 289 nodes · 395 edges · 29 communities (20 shown, 9 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.88)
- Token cost: 1,650 input · 780 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Daily Patient Interactive Session|Daily Patient Interactive Session]]
- [[_COMMUNITY_Auth, Invites & Patient Creation APIs|Auth, Invites & Patient Creation APIs]]
- [[_COMMUNITY_Runtime Dependencies & AI SDKs|Runtime Dependencies & AI SDKs]]
- [[_COMMUNITY_Patient Routine, Check-In & Activities UI|Patient Routine, Check-In & Activities UI]]
- [[_COMMUNITY_TypeScript Build Configuration|TypeScript Build Configuration]]
- [[_COMMUNITY_Clinical Foundation & Digital Reminiscence|Clinical Foundation & Digital Reminiscence]]
- [[_COMMUNITY_Caregiver Patient Management & Modals|Caregiver Patient Management & Modals]]
- [[_COMMUNITY_Caregiver Analytics & Performance Dashboard|Caregiver Analytics & Performance Dashboard]]
- [[_COMMUNITY_Dev Tooling & Styling Dependencies|Dev Tooling & Styling Dependencies]]
- [[_COMMUNITY_Navigation Header & Patient Context Modals|Navigation Header & Patient Context Modals]]
- [[_COMMUNITY_Progressive Web App Manifest|Progressive Web App Manifest]]
- [[_COMMUNITY_Root Layout & Application Shell|Root Layout & Application Shell]]
- [[_COMMUNITY_Dynamic AI Level Generation API|Dynamic AI Level Generation API]]
- [[_COMMUNITY_Adaptive Question Bank Replenishment API|Adaptive Question Bank Replenishment API]]
- [[_COMMUNITY_Caregiver Clinical Insights Generator API|Caregiver Clinical Insights Generator API]]
- [[_COMMUNITY_Graphify Knowledge Graph Tools|Graphify Knowledge Graph Tools]]
- [[_COMMUNITY_PWA Icon Visual Assets|PWA Icon Visual Assets]]
- [[_COMMUNITY_ESLint Configuration|ESLint Configuration]]
- [[_COMMUNITY_Next.js Framework Configuration|Next.js Framework Configuration]]
- [[_COMMUNITY_PostCSS Build Configuration|PostCSS Build Configuration]]
- [[_COMMUNITY_AI Pair Programming Rules|AI Pair Programming Rules]]
- [[_COMMUNITY_Claude Memory Directives|Claude Memory Directives]]
- [[_COMMUNITY_Apple Touch Webclip Icon|Apple Touch Webclip Icon]]
- [[_COMMUNITY_Cognia Brand Identity Logo|Cognia Brand Identity Logo]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `supabase` - 15 edges
3. `POST()` - 8 edges
4. `startSTT()` - 8 edges
5. `getTTSEnabled()` - 7 edges
6. `speak()` - 7 edges
7. `stopSTT()` - 6 edges
8. `setTTSEnabled()` - 6 edges
9. `stopSpeech()` - 6 edges
10. `Interactive Dual-Task Exergame Component` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Dual-Task Exergaming Cognitive-Motor Paradigm` --implements--> `Interactive Dual-Task Exergame Component`  [INFERRED]
  README.md → components/GameScreen.tsx
- `Kitwood Personhood Framework for Dementia Therapy` --rationale_for--> `Reminiscence Digital Memory Scrapbook`  [INFERRED]
  README.md → components/PatientMemoriesScreen.tsx
- `Reminiscence Digital Memory Scrapbook` --references--> `Family Memory Album Visual Cover`  [EXTRACTED]
  components/PatientMemoriesScreen.tsx → public/images/memories/family_cover.jpg
- `Reminiscence Digital Memory Scrapbook` --references--> `Hobby & Passion Memory Album Cover`  [EXTRACTED]
  components/PatientMemoriesScreen.tsx → public/images/memories/hobby_cover.jpg
- `Reminiscence Digital Memory Scrapbook` --references--> `Regional & Hometown Memory Album Cover`  [EXTRACTED]
  components/PatientMemoriesScreen.tsx → public/images/memories/regional_cover.jpg

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Caregiver Monitoring & AI Insights Pipeline** — caregiver_dashboard_view, generate_insights_route, supabase_clinical_telemetry_db [INFERRED 0.85]
- **Cognitive-Physical Dual-Task Loop** — daily_session_state_machine, game_screen_interactive, stt_web_speech_engine, tts_speech_synthesis_engine, generate_levels_route [INFERRED 0.85]
- **Cognia Therapeutic & Neurobiological Foundation** — cognia_platform_overview, dual_task_exergaming, kitwood_person_centered_framework [EXTRACTED 1.00]
- **Patient Caregiver Authentication & Clinical Fabric** — auth_and_invite_system, supabase_clinical_telemetry_db, caregiver_dashboard_view [INFERRED 0.85]

## Communities (29 total, 9 thin omitted)

### Community 0 - "Daily Patient Interactive Session"
Cohesion: 0.07
Nodes (35): DailySessionScreenProps, listenForVoice(), Step, CameraStatus, GameScreenProps, GESTURE_LABELS, GESTURE_PROMPTS, GestureType (+27 more)

### Community 1 - "Auth, Invites & Patient Creation APIs"
Cohesion: 0.13
Nodes (23): POST(), POST(), consumeVerifiedEmail(), generateInviteCode(), generateOtp(), getFallbackInvite(), hashPassword(), incrementFallbackInviteUses() (+15 more)

### Community 2 - "Runtime Dependencies & AI SDKs"
Cohesion: 0.07
Nodes (27): dependencies, ai, @ai-sdk/google, @ai-sdk/openai, @heroicons/react, jspdf, jspdf-autotable, lucide-react (+19 more)

### Community 3 - "Patient Routine, Check-In & Activities UI"
Cohesion: 0.09
Nodes (12): ActivitiesProps, DOMAINS, CheckInProps, OverviewProps, WelcomeProps, StreakBannerProps, fetchPatientPreferences(), fetchPatientStreak() (+4 more)

### Community 4 - "TypeScript Build Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 5 - "Clinical Foundation & Digital Reminiscence"
Cohesion: 0.13
Nodes (19): Family Memory Album Visual Cover, Hobby & Passion Memory Album Cover, Regional & Hometown Memory Album Cover, OTP & Caregiver-Patient Invite Code System, Caregiver Clinical Dashboard, COGNIA Digital Therapeutic Platform, 6-Step Daily Companion State Machine, Dual-Task Exergaming Cognitive-Motor Paradigm (+11 more)

### Community 6 - "Caregiver Patient Management & Modals"
Cohesion: 0.12
Nodes (7): ConsentModalProps, DeletePatientModalProps, Patient, EditProfileModalProps, Profile, PatientProfileFormProps, fetchPatientHistory()

### Community 7 - "Caregiver Analytics & Performance Dashboard"
Cohesion: 0.16
Nodes (8): CaregiverDashboard(), CaregiverDashboardProps, formatDate(), GameSession, InsightBadgeProps, MetricCardProps, TrendChartProps, SessionResult

### Community 8 - "Dev Tooling & Styling Dependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/nodemailer, @types/react (+2 more)

### Community 9 - "Navigation Header & Patient Context Modals"
Cohesion: 0.22
Nodes (3): HeaderProps, NoPatientModalProps, ThemeToggle()

### Community 10 - "Progressive Web App Manifest"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 11 - "Root Layout & Application Shell"
Cohesion: 0.25
Nodes (4): lexend, metadata, viewport, ThemeProvider()

### Community 12 - "Dynamic AI Level Generation API"
Cohesion: 0.32
Nodes (7): determineDifficultyProfile(), DifficultyProfile, FALLBACK_ROUNDS, GenerationSchema, groq, POST(), RoundSchema

### Community 13 - "Adaptive Question Bank Replenishment API"
Cohesion: 0.50
Nodes (4): GenerationSchema, groq, POST(), RoundSchema

### Community 14 - "Caregiver Clinical Insights Generator API"
Cohesion: 0.50
Nodes (4): GenerationSchema, groq, InsightSchema, POST()

## Knowledge Gaps
- **131 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+126 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase` connect `Auth, Invites & Patient Creation APIs` to `Patient Routine, Check-In & Activities UI`, `Dynamic AI Level Generation API`, `Adaptive Question Bank Replenishment API`, `Caregiver Patient Management & Modals`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Tooling & Styling Dependencies` to `Runtime Dependencies & AI SDKs`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _131 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Daily Patient Interactive Session` be split into smaller, more focused modules?**
  _Cohesion score 0.07446808510638298 - nodes in this community are weakly interconnected._
- **Should `Auth, Invites & Patient Creation APIs` be split into smaller, more focused modules?**
  _Cohesion score 0.13445378151260504 - nodes in this community are weakly interconnected._
- **Should `Runtime Dependencies & AI SDKs` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `Patient Routine, Check-In & Activities UI` be split into smaller, more focused modules?**
  _Cohesion score 0.08547008547008547 - nodes in this community are weakly interconnected._