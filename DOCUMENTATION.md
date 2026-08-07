# 🚀 FocusFlow Hub — Complete Application Documentation

FocusFlow Hub is an all-in-one personal productivity, time-blocking, habit tracking, and note-taking web and mobile application designed with an offline-first architecture, multi-language support (English & Nepali), and exact Bikram Sambat (BS) date synchronization.

---

## 🛠️ 1. Tech Stack & Architecture

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom HSL CSS variable themes
- **UI Components**: Shadcn UI (Radix primitives) + Lucide React Icons
- **Icons & Visuals**: Lucide React Icons
- **Date Engine**: Date-fns + Custom Bikram Sambat (BS) Converter Engine
- **State & Storage**: Offline-first LocalStorage persistence with Base64 media serialisation
- **Mobile Packaging**: Capacitor JS + GitHub Actions Android APK automated builder

---

## 🎨 2. Design System & Theme Palette

The visual design follows a modern, minimal, and high-contrast system optimized for both light and dark modes:

- **Light Mode Background**: Soft Off-White (`#F8F9FA`) with subtle ambient radial glow
- **Dark Mode Background**: Deep Charcoal (`#121212`)
- **Primary Color**: Navy Blue (`#1E3A8A` / HSL `224 64% 33%`)
- **Secondary Color**: Slate Gray (`#64748B` / HSL `215 16% 47%`)
- **Accent Color**: Emerald Green (`#10B981` / HSL `160 84% 39%`)
- **Card Styling**: Rounded corners (`14px / 0.875rem`), subtle borders (`#E5E7EB`), soft ambient shadows
- **Interactive States**: Smooth transform transitions and micro-animations

---

## 📅 3. Dual Calendar Engine (AD & Bikram Sambat BS)

Located in `src/utils/nepaliDate.ts`:

- **Exact Calendar Engine**: Uses exact reference tables for Bikram Sambat years (`2075` through `2087 BS`) mapping exact day counts per month and reference Gregorian start dates.
- **Devanagari Numerals**: Converts numbers into Devanagari script (`०, १, २, ३, ४, ५, ६, ७, ८, ९`).
- **Synchronized Display**: Always aligns live system time to exact Nepali months (e.g., *Falgun*, *Chaitra*, *Baishakh*) alongside the Gregorian calendar.

---

## 📱 4. Functional Modules

### 1️⃣ Today Planner (`src/components/today/TodayPlanner.tsx`)
- **Hourly Timeline**: Time-blocked schedule from 6:00 AM to 11:00 PM.
- **Unscheduled Tasks Tray**: Collects tasks without set times and allows one-click hour allocation.
- **Focus Timer Modal (`FocusTimerModal.tsx`)**: Built-in 25-minute Pomodoro timer with progress ring dial, play/pause controls, and instant task completion.

### 2️⃣ Quick Capture Inbox (`src/components/capture/QuickCapture.tsx`)
- **Multi-Media Input**: Capture text, camera photos, videos, and live audio recordings via browser Microphone API.
- **Permanent Base64 Storage**: Converts images/audio into persistent Base64 Data URLs so attachments never break on reload.
- **Task Conversion**: Convert any inbox item directly into a planned task for Today with a single tap.

### 3️⃣ Notes & Ideas Workspace (`src/components/notes/NotesSection.tsx`)
- **Full CRUD Operations**: Create, edit, search, categorise, and delete permanent notes.
- **Pin to Top**: Keep high-priority guidelines or principles pinned at the top.
- **Theme Color Cards**: Assign color accents (Emerald, Blue, Amber, Purple) to individual notes.

### 4️⃣ Habit Tracker & Consistency (`src/components/habits/HabitTracker.tsx`)
- **Streaks Engine**: Calculates active daily and weekly streaks using historical logs (`src/utils/habitUtils.ts`).
- **90-Day Interactive Matrix**: Heatmap modal showing day-by-day consistency grid with click-to-toggle logging.

### 5️⃣ Weekly Review & AI Brief (`src/components/review/WeeklyReview.tsx`)
- **Performance Brief**: Auto-generated text summary calculating completion percentages for tasks and habits.
- **Tag & Habit Breakdown**: Visual tag distribution and progress bars.
- **Journal**: Weekly reflection journal saved permanently by week start date.

### 6️⃣ Someday / Maybe Bucket (`src/components/someday/SomedayList.tsx`)
- **Future Inspiration**: Organised by categories (Books, Places, Projects, Ideas).
- **"Surprise Me" Feature**: Built-in randomizer pick modal to beat decision fatigue.

---

## 💾 5. Data Storage Schema (`src/services/storage.ts`)

All data is managed locally with high durability:

| Storage Key | Content Type |
|---|---|
| `ff_tasks` | Task array (titles, dates, time slots, completion) |
| `ff_captures` | Media captures (text, Base64 image/audio strings, tags) |
| `ff_notes` | Permanent notes (titles, content, colors, categories, pinned state) |
| `ff_habits` | Active habit target configurations |
| `ff_habit_logs` | Historical completion timestamps per habit |
| `ff_someday` | Future wishlist and bucket items |
| `ff_weekly_notes` | Reflection journal entries |

---

## 📦 6. Building & Android APK Deployment

### Option A: PWABuilder (Easiest)
1. Deploy project to Vercel.
2. Go to [pwabuilder.com](https://www.pwabuilder.com/).
3. Paste your Vercel URL and click **Package for Android** to download the APK.

### Option B: Automated GitHub Actions
Pushing to your GitHub repository automatically triggers `.github/workflows/build-apk.yml`, which builds the Android APK in the cloud. Download the generated `.apk` under the **Actions > Artifacts** section of your GitHub repo.