# Graph Report - cognia  (2026-09-11)

## Corpus Check
- 66 files · ~178,907 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 309 nodes · 412 edges · 29 communities (23 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ed1eaed0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Authentication & Setup|Authentication & Setup]]
- [[_COMMUNITY_Patient Audio & Profile|Patient Audio & Profile]]
- [[_COMMUNITY_Speech to Text & Games|Speech to Text & Games]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Dependencies|Dependencies]]
- [[_COMMUNITY_Dev Dependencies & Scripts|Dev Dependencies & Scripts]]
- [[_COMMUNITY_Caregiver Dashboard|Caregiver Dashboard]]
- [[_COMMUNITY_Game Session & Progress|Game Session & Progress]]
- [[_COMMUNITY_Core UI Components|Core UI Components]]
- [[_COMMUNITY_Layout & Theme|Layout & Theme]]
- [[_COMMUNITY_App Manifest|App Manifest]]
- [[_COMMUNITY_Level Generation|Level Generation]]
- [[_COMMUNITY_Insights Generation|Insights Generation]]
- [[_COMMUNITY_Patient Activities|Patient Activities]]
- [[_COMMUNITY_Patient Check-in|Patient Check-in]]
- [[_COMMUNITY_Patient Overview|Patient Overview]]
- [[_COMMUNITY_Next Config|Next Config]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 28|Community 28]]

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
10. `scripts` - 5 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `verifyOtp()`  [EXTRACTED]
  app/api/auth/verify-otp/route.ts → lib/auth.ts
- `GET()` --calls--> `getFallbackInvite()`  [EXTRACTED]
  app/api/invites/validate/route.ts → lib/auth.ts
- `POST()` --calls--> `verifyPassword()`  [EXTRACTED]
  app/api/auth/login/route.ts → lib/auth.ts
- `POST()` --calls--> `generateOtp()`  [EXTRACTED]
  app/api/auth/send-otp/route.ts → lib/auth.ts
- `POST()` --calls--> `storeOtp()`  [EXTRACTED]
  app/api/auth/send-otp/route.ts → lib/auth.ts

## Import Cycles
- None detected.

## Communities (29 total, 6 thin omitted)

### Community 0 - "Authentication & Setup"
Cohesion: 0.12
Nodes (7): ConsentModalProps, DeletePatientModalProps, Patient, EditProfileModalProps, Profile, PatientProfileFormProps, fetchPatientHistory()

### Community 1 - "Patient Audio & Profile"
Cohesion: 0.13
Nodes (23): POST(), POST(), consumeVerifiedEmail(), generateInviteCode(), generateOtp(), getFallbackInvite(), hashPassword(), incrementFallbackInviteUses() (+15 more)

### Community 2 - "Speech to Text & Games"
Cohesion: 0.07
Nodes (35): DailySessionScreenProps, listenForVoice(), Step, CameraStatus, GameScreenProps, GESTURE_LABELS, GESTURE_PROMPTS, GestureType (+27 more)

### Community 3 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 4 - "Dependencies"
Cohesion: 0.11
Nodes (18): dependencies, ai, @ai-sdk/google, @ai-sdk/openai, @heroicons/react, jspdf, jspdf-autotable, lucide-react (+10 more)

### Community 5 - "Dev Dependencies & Scripts"
Cohesion: 0.11
Nodes (17): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+9 more)

### Community 6 - "Caregiver Dashboard"
Cohesion: 0.16
Nodes (8): CaregiverDashboard(), CaregiverDashboardProps, formatDate(), GameSession, InsightBadgeProps, MetricCardProps, TrendChartProps, SessionResult

### Community 7 - "Game Session & Progress"
Cohesion: 0.09
Nodes (12): ActivitiesProps, DOMAINS, CheckInProps, OverviewProps, WelcomeProps, StreakBannerProps, fetchPatientPreferences(), fetchPatientStreak() (+4 more)

### Community 8 - "Core UI Components"
Cohesion: 0.22
Nodes (3): HeaderProps, NoPatientModalProps, ThemeToggle()

### Community 9 - "Layout & Theme"
Cohesion: 0.25
Nodes (4): lexend, metadata, viewport, ThemeProvider()

### Community 10 - "App Manifest"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 11 - "Level Generation"
Cohesion: 0.11
Nodes (19): dependencies, ai, @ai-sdk/google, @ai-sdk/openai, @heroicons/react, jspdf, jspdf-autotable, lucide-react (+11 more)

### Community 12 - "Insights Generation"
Cohesion: 0.50
Nodes (4): GenerationSchema, groq, InsightSchema, POST()

### Community 13 - "Patient Activities"
Cohesion: 0.50
Nodes (3): AI and Voice Provider Configuration, Optional development-only demo seeding and automatic login, Supabase Configuration

### Community 25 - "Community 25"
Cohesion: 0.11
Nodes (18): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/nodemailer, @types/react (+10 more)

### Community 26 - "Community 26"
Cohesion: 0.32
Nodes (7): determineDifficultyProfile(), DifficultyProfile, FALLBACK_ROUNDS, GenerationSchema, groq, POST(), RoundSchema

### Community 28 - "Community 28"
Cohesion: 0.50
Nodes (4): GenerationSchema, groq, POST(), RoundSchema

## Knowledge Gaps
- **155 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+150 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase` connect `Patient Audio & Profile` to `Authentication & Setup`, `Community 26`, `Community 28`, `Game Session & Progress`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Level Generation` to `Community 25`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Dependencies` to `Dev Dependencies & Scripts`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _155 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Authentication & Setup` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Patient Audio & Profile` be split into smaller, more focused modules?**
  _Cohesion score 0.13445378151260504 - nodes in this community are weakly interconnected._
- **Should `Speech to Text & Games` be split into smaller, more focused modules?**
  _Cohesion score 0.07446808510638298 - nodes in this community are weakly interconnected._