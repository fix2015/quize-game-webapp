# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JungleGuess — an interactive photo quiz web app (kid-friendly, jungle-themed). The user sees a photo and guesses what it is from 3 multiple-choice options. Features XP progression, levels, streaks, power-ups, lives, achievements, and a world map with 9 worlds containing 110 topic categories.

## Commands

```bash
npm run dev      # Start dev server (Vite)
npm run build    # Production build
npx tsc --noEmit # Type check without emitting
```

## Tech Stack

- React 18 + TypeScript
- Vite (with Tailwind CSS via @tailwindcss/vite plugin)
- Zustand for state management (persisted to localStorage)
- Framer Motion for animations
- React Router DOM for routing

## Architecture

### Data Flow
- **Topic JSON files** live in `public/topics/{topic_name}.json` (symlinked from `guess-quiz-generator/topics/`). Each file is an array of `{ answer, search, difficulty }` objects.
- **Images** live in `public/images/{slug}.{ext}` (symlinked from `guess-quiz-generator/images/`). Slug = `answer.toLowerCase().replace(/ /g, '_').replace(/'/g, '')`. Most are `.jpg`, fallback to `.jpeg`, `.png`, `.webp`.
- Topics are fetched at runtime via `fetch('/topics/{name}.json')`, not bundled.

### State Management
- `src/store/gameStore.ts` — single Zustand store with `persist` middleware (key: `jungleguess-storage`). Holds XP, level, coins, lives, completed quizzes, achievements, power-ups, daily streaks.
- Level computed from XP using formula: `xp_needed = 50 * level^2 + 50 * level`

### Routing
| Route | Screen |
|---|---|
| `/` | Home — world map with category grid |
| `/category/:topicFile` | Category — difficulty selector (Easy/Medium/Hard) |
| `/quiz/:topicFile/:difficulty` | Quiz — core gameplay |
| `/results` | Results — stars, XP, coins earned (state passed via `location.state`) |
| `/dashboard` | Dashboard — stats, achievements, category progress |

### Key Patterns
- **Wrong answers** are always drawn from the same topic file (not random categories), making them plausible distractors.
- **Difficulty unlocking**: Medium requires 2+ stars on Easy, Hard requires 2+ stars on Medium.
- **World unlocking**: Each world has a `unlockLevel` threshold defined in `src/data/worlds.ts`.
- **Timer**: Easy=10s, Medium=7s, Hard=5s. Uses 100ms interval for smooth progress bar.
- **Lives**: 5 max, regenerate 1 every 10 minutes. Quiz ends when lives hit 0.
- **Type-only imports**: Use `import type` for interfaces/types to avoid Rolldown build errors with interface re-exports.

### Directory Structure
- `src/screens/` — full-page route components
- `src/components/` — reusable UI (AnswerButton, TimerBar, QuizPhoto, etc.)
- `src/hooks/` — useQuiz (question loading/sequencing), useTimer (countdown)
- `src/data/` — static definitions (worlds, levels, achievements)
- `src/utils/` — pure functions (image path resolution, scoring, wrong answer generation)
- `src/store/` — Zustand store

## Styling

Tailwind CSS with custom theme tokens defined in `src/index.css` under `@theme`. Brand colors: jungle green (#2E7D32), golden (#F9A825), earth brown (#5D4037), tropical orange (#FF6F00). Fonts: Fredoka (headings), Nunito (body) loaded via Google Fonts in `index.html`.
