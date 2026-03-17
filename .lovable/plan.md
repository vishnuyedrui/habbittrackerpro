

## Plan: Math Lock Gamification, Sounds, Confetti, Memes & Adaptive Difficulty

### Overview
Add gamification layers on top of the existing MathPuzzleLock without changing existing UI, question banks, or level selection logic. New features are implemented as helper modules and integrated into the lock overlay.

### New Files

**`src/lib/mathlock-sounds.ts`** — Web Audio API sound effects
- Functions: `playCorrectSound()`, `playWrongSound()`, `playUnlockFanfare()`, `playTickSound()`, `playStreakSound()`, `playRecordSound()`
- `isMuted()` / `toggleMute()` using localStorage `mathlock_muted`
- All sounds generated via OscillatorNode/GainNode (no external files)

**`src/lib/mathlock-confetti.ts`** — Pure canvas confetti
- `launchConfetti(canvas: HTMLCanvasElement)` — spawns particles in gold/red/blue/green/purple/pink, animates for 3s, fades out
- Uses requestAnimationFrame, no external libs

**`src/lib/mathlock-gamification.ts`** — All gamification state read/write
- XP: `getXP()`, `addXP(level)`, XP values per level (10/25/50)
- Rank: `getRank(xp)` returns emoji+name for Bronze/Silver/Gold/Diamond/Legend thresholds
- Streak: `getStreak()`, `updateStreak()` — tracks dates in `mathlock_streak` JSON, resets if gap > 1 day
- Best times: `getBestTime(level)`, `setBestTime(level, seconds)` — returns whether new record
- Lives: `getLives()`, `loseLife()`, `getRefillTime()` — 3 lives, refill every 10 min from last depletion timestamp
- Performance/Adaptive: `recordSolve(level, timeMs, correct)`, `getStats()`, `getAutoLevel()` — tracks last N solves, computes avg time and accuracy, determines auto-level suggestions
- Meme shuffle: `getNextMemeIndex(attemptNumber)` — Fisher-Yates shuffle stored in sessionStorage, pools by severity (1-20 mild, 21-60 medium, 61-100 savage)

**`src/data/mathlock-memes.ts`** — 100 meme objects
- Each: `{ keyword, caption, roast, emoji }` — all 100 from the spec
- No images (meme keywords only, displayed as text cards with emoji)

### Modified Files

**`src/components/MathPuzzleLock.tsx`** — Integrate all features into existing structure

Changes to `LockOverlay`:
- Add state: `lives`, `xp`, `rank`, `streak`, `solveStartTime`, `showMeme`, `currentMeme`, `showConfetti`, `showXpFloat`, `showRankUp`, `showRecord`, `statsOpen`
- Add canvas ref for confetti overlay
- Add mute button (fixed top-right)
- On correct: play sound, add XP, check rank up, check best time, update streak, record performance, launch confetti, show floating XP text, delay unlock to 2.5s
- On wrong: play sound, lose life, show meme popup for 2.5s, then auto-dismiss
- Lives system replaces the old 5-attempt cooldown: 0 lives = 60s cooldown, lives refill every 10 min
- During cooldown: play tick sound each second

Changes to `LevelSelection`:
- Add XP bar at top: "Total XP: 320"
- Add rank badge: "👑 Legend"
- Add streak counter: "🔥 5 Day Streak!"
- Add best times per level: "⚡ Best: 12s"
- Add collapsible stats panel (avg time, accuracy, auto level, total solved)
- Add "🧠 Adaptive Mode: ON" badge
- Show adaptive level suggestion toast when threshold crossed

Changes to `QuestionScreen`:
- Replace attempt counter with hearts display: ❤️❤️❤️ (animate out on loss)
- Show "❤️ refills in Xm" when lives < 3
- Start timer on question load for best time tracking
- Keep existing hint system, question tracker, cooldown display

Changes to `AccessGranted`:
- Add full-screen confetti canvas
- Show bouncing ✅ checkmark
- Show floating "+25 XP! ✨" animation
- Show rank if upgraded: "🎉 RANK UP! You are now 🥇 Gold!"
- Show "🏆 NEW RECORD!" if applicable
- Delay transition to 2.5s

New sub-component `MemePopup`:
- Dark overlay with bounce-in card
- Shows caption (bold) + roast (italic) + emoji row (🤣💀😤🔥)
- "Share this roast 😂" button (copies text to clipboard)
- Auto-dismisses after 2.5s with slide-out animation

**`tailwind.config.ts`** — Add keyframes if needed for float-up, heart-pop animations

### Behavioral Notes
- Lives system: 3 lives per refill cycle (10 min). Wrong answer = -1 life. 0 lives = 60s cooldown (same as existing). Lives state persisted in localStorage with timestamp.
- Adaptive: After every 5 solves, check avg time. If Easy avg < 10s for 5 consecutive → suggest Medium. If Medium avg < 15s → suggest Hard. If Hard fails 3 in a row → suggest Medium. Store suggestion in `mathlock_autolevel`, show as toast on next level selection screen.
- Memes: No actual images loaded. Each meme is rendered as a styled text card with the keyword as a title, caption as heading, roast as subtitle, and emoji reactions row. This avoids external image dependencies.

### File Summary

| Action | File |
|--------|------|
| Create | `src/lib/mathlock-sounds.ts` |
| Create | `src/lib/mathlock-confetti.ts` |
| Create | `src/lib/mathlock-gamification.ts` |
| Create | `src/data/mathlock-memes.ts` |
| Edit | `src/components/MathPuzzleLock.tsx` |
| Edit | `tailwind.config.ts` (add float-up, heart-pop keyframes) |

No new dependencies. No database changes. No existing UI changes.

