# Graph Report - dementia  (2026-09-02)

## Corpus Check
- 61 files · ~169,973 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 239 nodes · 294 edges · 27 communities (19 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0f995b26`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `supabase` - 10 edges
3. `startSTT()` - 7 edges
4. `speak()` - 7 edges
5. `getTTSEnabled()` - 6 edges
6. `stopSpeech()` - 6 edges
7. `scripts` - 5 edges
8. `SessionResult` - 5 edges
9. `stopSTT()` - 5 edges
10. `setTTSEnabled()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `listenForVoice()` --calls--> `startSTT()`  [EXTRACTED]
  components/DailySessionScreen.tsx → lib/stt.ts
- `listenForVoice()` --calls--> `stopSTT()`  [EXTRACTED]
  components/DailySessionScreen.tsx → lib/stt.ts
- `GameSession` --references--> `SessionResult`  [EXTRACTED]
  components/CaregiverDashboard.tsx → components/GameScreen.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Clinical Neuroplasticity Foundation** — readme_dual_task_exergaming, readme_bdnf_neuroplasticity, readme_person_centered_care [EXTRACTED 1.00]

## Communities (27 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (13): ConsentModalProps, DeletePatientModalProps, Patient, EditProfileModalProps, Profile, LoginScreenProps, PatientProfileFormProps, fetchPatientHistory() (+5 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (33): DailySessionScreenProps, listenForVoice(), Step, CameraStatus, GameScreenProps, GESTURE_LABELS, GESTURE_PROMPTS, GestureType (+25 more)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (9): DiaryProps, OverviewProps, WelcomeProps, StreakBannerProps, fetchPatientPreferences(), fetchPatientStreak(), FlowState, hashToScreen (+1 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (18): dependencies, ai, @ai-sdk/google, @ai-sdk/openai, @heroicons/react, jspdf, jspdf-autotable, lucide-react (+10 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (17): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.16
Nodes (8): CaregiverDashboard(), CaregiverDashboardProps, formatDate(), GameSession, InsightBadgeProps, MetricCardProps, TrendChartProps, SessionResult

### Community 7 - "Community 7"
Cohesion: 0.24
Nodes (9): determineDifficultyProfile(), DifficultyProfile, DOMAINS, FALLBACK_ROUNDS, GenerationSchema, GESTURES, groq, POST() (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.22
Nodes (3): HeaderProps, NoPatientModalProps, ThemeToggle()

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (4): lexend, metadata, viewport, ThemeProvider()

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 11 - "Community 11"
Cohesion: 0.50
Nodes (4): GenerationSchema, groq, InsightSchema, POST()

### Community 12 - "Community 12"
Cohesion: 0.67
Nodes (3): BDNF & Synaptogenesis, Dual-Task Exergaming, 6-Step Daily Session Flow

### Community 22 - "Community 22"
Cohesion: 0.50
Nodes (3): AI LLM Provider Configuration, Application Settings, Supabase Configuration

## Knowledge Gaps
- **117 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+112 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase` connect `Community 0` to `Community 7`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 4` to `Community 5`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _122 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09274193548387097 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08305647840531562 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._