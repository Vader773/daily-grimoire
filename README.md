# QuestLine | Gamify Your Life ⚔️

**QuestLine** is a privacy-focused, local-first productivity application that turns your life into an RPG. Track tasks, build habits, conquer goals, and level up your character as you improve your real life.

![Social Preview](/og-image.png)

## 🌟 Key Features

### 🛡️ Core Gameplay
- **Task Management**: Create one-off quests with varying difficulty tiers (Trivial to Boss).
- **XP System**: Earn Experience Points for every completed task. Level up and unlock prestige.
- **Leagues**: Compete against your own consistency. Rise from **Bronze** to **Diamond** based on your daily activity.

### 🏹 Three Pillars of Progression
1.  **Goals (Strategy)**: Long-term targets.
    -   *Progressive*: Reach a specific number (e.g., "Read 50 Books").
    -   *Frequency*: Consistency targets (e.g., "Workout 3x/Week").
    -   *Accumulator*: Collect items or hours (e.g., "Save $5000").
2.  **Habits (Automation)**: Recurring daily or weekly protocols.
    -   Build streaks and earn bonus XP for consistency.
    -   "Atomic Habits" logic: Difficulty scales with your streak.
3.  **Vices (Corruption)**: Track bad habits you want to break.
    -   Monitor "Clean Streaks" and visualize your recovery on a timeline.

### 📊 Analytics & Insights
- **Heatmaps**: GitHub-style contribution graphs for your productivity.
- **Charts**: Visual breakdown of your XP sources and consistency.
- **Dashboard**: A "Head-Up Display" (HUD) for your life.

---

## 🛠️ Technical Architecture

QuestLine is built as a **Local-First** Single Page Application (SPA). It respects your data ownership—everything is stored on your device.

**Tech Stack:**
-   **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Icons**: [Lucide React](https://lucide.dev/)

**Data Persistence:**
-   All application state (Goals, Tasks, Streaks, Vices) is persisted via `localStorage`.
-   **No Database Required**: There is no backend server. Your data lives in your browser.
-   **Offline Capable**: Works fully offline after initial load.

---

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18 or higher recommended)
-   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/questline.git
    cd questline
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

---

## 📂 Project Structure

```bash
src/
├── components/         # UI Components (Modals, Cards, Widgets)
│   ├── onboarding/     # Overlay & Tutorial Logic
│   └── ui/             # Reusable Design System elements
├── config/             # Game configuration (Leagues, XP Tables)
├── hooks/              # Custom React Hooks
├── pages/              # Main Route Views (Index, etc.)
├── stores/             # Zustand State Stores
│   ├── gameStore.ts    # CORE LOGIC: Tasks, Goals, XP, Streaks
│   └── tutorialStore.ts # Onboarding state
└── App.tsx             # Main Entry & Routing
```

## 🎮 Gamification Logic

### Adaptive Difficulty
QuestLine uses an "Adaptive Gap" algorithm for long-term goals. As you get closer to your target, the "next step" becomes harder or adjusts to ensure you maintain momentum, preventing early burnout or late-game stalling.

### Streak Protection
The global streak system requires daily engagement. Missing *one day* resets your global multiplier to zero. However, specific habits track their own independent streaks, allowing you to maintain partial victories even if you miss a "Perfect Day."

---

## 🔒 Privacy & Data

QuestLine is 100% free and open.
-   **No Tracking**: We do not track your usage.
-   **No Accounts**: No login is required.
-   **Your Data**: Export/Import functionality (Coming Soon) allows you to backup your saves.

---

*Gamify Your Life. Conquer Your Day.*
