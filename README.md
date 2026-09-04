```markdown
# COGNIA | SIH 2026

> **Privacy-First Dual-Task Exergaming & Person-Centered Cognitive Therapy Platform for Dementia Care**  
> *Developed for the Smart India Hackathon (SIH) 2026 — Team Elite Control*

---

## 📌 Project Overview

**COGNIA** is a web-based digital therapeutic platform engineered to mitigate cognitive decline in patients with Mild Cognitive Impairment (MCI) and early-to-moderate Dementia. By integrating **Dual-Task Exergaming** with **Kitwood’s Person-Centered Care Framework**, COGNIA combines real-time seated physical movement tracking with dynamic cognitive recall exercises.

Designed specifically to address accessibility gaps in regional demographics—including the North Eastern Region (NER) of India—COGNIA eliminates static clinical repetition through dynamic LLM-driven prompt generation, client-side computer vision, and hands-free voice interaction.

---

## ⚡ Key Features

* **Dual-Task Exergaming:** Simultaneously engages physical motor execution (seated exercises) and cognitive recall to stimulate neuroplasticity and BDNF production.
* **Deterministic 6-Step Session Loop:** A structured Next.js state machine that eliminates navigation friction and prevents patient disorientation.
* **100% On-Device Pose Tracking:** Utilizes MediaPipe WebAssembly (WASM) to process video frames frame-by-frame inside local browser RAM—video data never touches a server.
* **Dynamic AI Prompt Generation:** Uses Groq-hosted LLMs with contextual seeding, caregiver-provided patient preferences, and recent-question history to generate seven-round sessions.
* **Anti-Repetition Engine:** Implements dynamic seed routing and anti-caching headers (`Cache-Control: no-store`) to ensure non-repetitive, fresh interactions every session.
* **Multimodal Voice Interface:** Uses browser Web Speech recognition first, Groq Whisper as an STT fallback, and Deepgram streaming TTS with browser speech fallback.
* **Caregiver Dashboard:** Tracks session accuracy, reaction times, consistency, mood check-ins, streaks, AI-generated insights, and downloadable PDF reports.

---

## 🧠 Clinical & Neurobiological Foundation


```

[Seated Physical Task] + [Cognitive Recall]
│
▼
Irisin Release
│
▼
Hippocampal BDNF
│
▼
Synaptogenesis & Neuroplasticity

```

1. **BDNF & Synaptogenesis:** Physical movement releases muscle-derived irisin, stimulating **Brain-Derived Neurotrophic Factor (BDNF)** in the hippocampus. Concurrent cognitive stimulation forces newly formed neurons into active neural circuits.
2. **Tom Kitwood’s Personhood Framework:** Replaces rigid clinical exams (like standard MMSE/MoCA tests) with personalized identity anchors—wrapping arithmetic, recall, and matching exercises inside familiar household and regional context.
3. **Zero Fall-Risk Design:** All physical interactions are calibrated strictly for seated execution (head tilts, arm raises, upper-body posture alignment).

---

## 🔄 The 6-Step Daily Session Flow


```

┌───────────────────────────────────────────────────────────────────┐
│                   COGNIA SESSION STATE MACHINE                    │
├───────────────────────────────────────────────────────────────────┤
│ Step 1: Greeting & Orientation ---> Temporal orientation          │
│ Step 2: Mood & Affective Check ---> Baseline emotional tracking   │
│ Step 3: Guided Breathing Pacer ---> Anxiety reduction             │
│ Step 4: Dual-Task Exergaming   ---> MediaPipe + Dynamic AI Quiz   │
│ Step 5: Task Verification      ---> Offline task confirmation     │
│ Step 6: Feedback & Streaks     ---> Longitudinal logging          │
└───────────────────────────────────────────────────────────────────┘

```

---

## 🏗 System Architecture


```

```
              ┌───────────────────────────────┐
              │    CAREGIVER ONBOARDING UI    │
              │ (Profile, Favorites, Context) │
              └───────────────┬───────────────┘
                              │
                              ▼

```

┌───────────────────┐    ┌─────────────────┐    ┌───────────────────┐
│  PATIENT DEVICE   │    │ SUPABASE ENGINE │    │ DYNAMIC AI ENGINE │
│ ───────────────── │    │ ─────────────── │    │ ───────────────── │
│ • Web Speech API  │<==>│ • PostgreSQL DB │<==>│ • Groq LLM        │
│ • MediaPipe WASM  │    │ • RLS Security  │    │ • Anti-Cache Seed │
│ • Local Processing│    │ • Profiling     │    │ • NER Context     │
└───────────────────┘    └────────┬────────┘    └───────────────────┘
│
▼
┌───────────────────────────────┐
│     CAREGIVER DASHBOARD       │
│ (Progress & PDF Reports)       │
└───────────────────────────────┘

```

---

## 🛡 Privacy & Security Architecture

* **Client-Side Pose Processing:** MediaPipe processes camera frames in the browser. The application sends landmark-derived session results rather than video files to the server.
* **Data Minimization:** Session results store performance indicators such as accuracy, reaction time, timestamp, mood, and round results; caregiver profile preferences are stored for personalization.
* **Row Level Security (RLS):** Patient records in PostgreSQL are isolated per caregiver/institution using cryptographic user-ID authentication policies.
* **Non-Diagnostic Positioning:** COGNIA is presented as a cognitive wellness companion and does not replace professional medical assessment or care.

---

## 🛠 Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js (React) | Application architecture & state machine management |
| **Styling & UI** | Tailwind CSS / Lucide | High-contrast, accessible UI design |
| **Computer Vision** | MediaPipe Pose (WASM) | Client-side 33-landmark 3D skeletal tracking |
| **Voice Processing** | Web Speech API, Groq Whisper, Deepgram | Speech recognition with a server fallback and streaming text-to-speech |
| **AI Generator** | Groq via AI SDK | Dynamic, context-injected prompt generation |
| **Database** | Supabase (PostgreSQL) | Profiles, relationships, question bank, session results, preferences, and streaks |
| **Deployment** | Vercel | Edge rendering and zero-latency routing |

### Application Routes

* `/` — Landing and role selection.
* `/patient` — Patient login, daily session, check-in, memories, activities, routine, and profile views.
* `/caregiver` — Caregiver login, patient management, progress dashboard, insights, and PDF export.
* `/terms` — Terms, privacy, and consent information.

The server-side API routes are `/api/generate-levels`, `/api/generate-insights`, `/api/replenish-bank`, `/api/transcribe`, and `/api/tts`.

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18.0.0 or higher)
* npm, yarn, or pnpm
* Modern web browser with webcam and microphone permissions (Chrome/Edge recommended)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nathanlobo/Cognia.git
   cd Cognia

```

2. **Install dependencies:**
```bash
npm install

```


3. **Configure Environment Variables:**
Create a `.env.local` file in the root directory:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI and Voice Provider Configuration
GROQ_API_KEY=your-groq-api-key
DEEPGRAM_API_KEY=your-deepgram-api-key

# Optional development-only demo seeding and automatic login
NEXT_PUBLIC_ENABLE_AUTO_LOGIN=false

```


4. **Run the development server:**
```bash
npm run dev

```


5. **Access the application:**
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💼 Business & Scaling Model (B2B SaaS)

COGNIA operates a hybrid model focused on scalable enterprise deployment:

* **B2C Caregiver Subscription:** Direct access for individual families to run daily routines at home.
* **B2B Institutional Licensing:** A planned enterprise tier for **Memory Care Clinics, Rehabilitation Centers, and Neurology Departments**, potentially providing:
* Multi-patient centralized management portals.
* Longitudinal progression telemetry and automated PDF clinical trend exports.
* Custom API integrations with Electronic Health Record (EHR) systems.

The current implementation includes caregiver patient management, longitudinal session telemetry, and PDF reports. EHR integrations and subscription billing are not implemented yet.



---

## 👥 Team Details — Elite Control (SIH 2026)

* **Project:** COGNIA — Privacy-First Dual-Task Exergaming Platform
* **Event:** Smart India Hackathon (SIH) 2026
* **Category:** Healthcare & Digital Therapeutics / Software

---

## 📄 License

This project is developed for evaluation under the **Smart India Hackathon 2026**. All rights reserved.

---

## Contributors

* [**Nathan Lobo**](https://github.com/nathanlobo)
* [**Joshua Fernandes**](https://github.com/JoshuaFernandes-code)
* [**Chinmayee Kelkar**](https://github.com/Cyee22)
