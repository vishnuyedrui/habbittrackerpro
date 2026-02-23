

# Fix Coffee Cup Background and Enhance Steam Animation

## Overview
Two issues to fix: remove the visible dark rectangular background behind the coffee cup image, and make the steam particles larger with a wispy/wavy animation path.

## Changes

### 1. Remove dark background behind coffee cup (`src/components/FloatingCoffee.tsx`)
- The dark rectangle is caused by the coffee cup PNG having a non-transparent background. The container div and the `motion.div` wrapper may also be contributing with default background styles.
- Remove any background styling from the wrapper elements.
- Add `mix-blend-mode` or ensure the image itself has no background by making the container fully transparent.
- Remove the `bg-background/80` from the "Buy me a coffee" label or make it more subtle.

### 2. Enhance steam particles (`src/components/FloatingCoffee.tsx`)
- Increase particle sizes (from 4-8px to 6-14px range)
- Increase opacity (from 0.5 peak to 0.7 peak) using `bg-foreground/20` instead of `bg-foreground/10`
- Add wavy/wispy motion by using keyframe arrays for the `x` property to create a sinusoidal path (e.g., `x: [0, 4, -4, 6]`) instead of a straight line
- Increase the vertical travel distance for more dramatic steam effect
- Add more particles (5 instead of 3) for a fuller look

### Technical Details

**Steam particle changes:**
- Class: `bg-foreground/20` (more visible)
- Size range: `6 + i * 3` pixels
- Y animation: longer travel (`-24 - i * 6`)
- X animation: wavy path using multi-point keyframe arrays like `[0, 5, -3, 7, 0]`
- Container: taller (`h-12`) to accommodate larger travel

**Background fix:**
- Ensure no background color or dark overlay on the coffee image container
- The image should float transparently over the page content

**File modified:**
- `src/components/FloatingCoffee.tsx`
