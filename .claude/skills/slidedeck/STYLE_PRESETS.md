# Style Presets Reference

Curated visual styles for Frontend Slides. Each preset is inspired by real design references — no generic "AI slop" aesthetics. **Abstract shapes only — no illustrations.**

All presentations use **Reveal.js** for navigation, transitions, and fragment-based progressive reveal.

---

## ⚠️ CRITICAL: Reveal.js Architecture (Non-Negotiable)

**Read the full architecture section in SKILL.md first. Key constraints are summarized here.**

### How Reveal.js Scales Slides

Reveal.js renders a fixed canvas (default 1600×900) and scales it to fit the viewport using `transform: scale()` on `.reveal .slides`. This means:

- **Use `px` for all font sizes and spacing** — not `em`, not `clamp()`, not `vw`
  - Reveal.js JS sets `font-size` on `.reveal` as `~viewportHeight * 0.04` (~28px at 720px tall)
  - `em` values resolve against that ~28px AND Reveal also scales slides via transform — **double-shrinking**
  - `clamp()`/`vw` reference actual viewport, not canvas — they don't scale correctly with slides
  - `px` values are immune to base font-size and scale through the transform alone
- **Size for the canvas** — choose `px` values that look right in 1600×900
- **No media queries for font sizes** — Reveal's transform handles all responsiveness

### Required Base CSS (Include in ALL Presentations)

```css
/* ===========================================
   REVEAL.JS THEMING — apply explicitly.
   --r-* CSS vars only work with Reveal's bundled theme CSS files.
   Since we load reveal.css alone, use explicit rules instead.
   =========================================== */

/* .reveal-viewport is the class Reveal adds to <body> at runtime */
body,
.reveal-viewport {
    background: var(--bg);
    background-color: var(--bg);
}

.reveal {
    background: transparent;
    color: var(--text);
    font-family: var(--font-body);
}

/* Always reset these Reveal defaults */
.reveal h1, .reveal h2, .reveal h3,
.reveal h4, .reveal h5, .reveal h6 {
    color: var(--text);
    font-family: var(--font-display);
    font-weight: 700;
    line-height: 1.1;
    text-transform: none;   /* some Reveal themes force uppercase */
    margin: 0;
}

.reveal p, .reveal li, .reveal blockquote {
    color: var(--text-muted);
    font-family: var(--font-body);
}

/* ===========================================
   CSS CUSTOM PROPERTIES
   Use px — not em/clamp/vw. See above for why.
   =========================================== */
:root {
    /* Colors — override per preset */
    --bg:         #0a0f1c;
    --text:       #ffffff;
    --text-muted: rgba(255,255,255,0.6);
    --accent:     #00ffcc;

    /* Fonts */
    --font-display: 'Your Display Font', sans-serif;
    --font-body:    'Your Body Font', sans-serif;
    --font-mono:    'Your Mono Font', monospace;

    /* Typography — px sized for 1600×900 canvas
       Visual size at 1280×720 viewport (scale ≈ 0.8) is ~80% of these values */
    --title:  100px;   /* visual ~80px */
    --h2:      56px;   /* visual ~45px */
    --h3:      36px;   /* visual ~29px */
    --body:    25px;   /* visual ~20px */
    --small:   19px;   /* visual ~15px */
    --code:    21px;   /* visual ~17px */
    --tag:     15px;   /* visual ~12px */

    /* Spacing — also px */
    --pad:     72px;
    --gap:     26px;
    --gap-sm:  13px;
    --gap-lg:  52px;

    --ease: cubic-bezier(0.16, 1, 0.3, 1);
}

/* ===========================================
   REVEAL.JS STRUCTURAL OVERRIDES
   =========================================== */

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

/* CRITICAL: Do NOT set position on sections.
   Reveal needs position: absolute on sections for fade transitions.
   position: relative here makes slides 2-N appear blank. */
.reveal .slides > section {
    height: 100%;
    padding: 0 !important;   /* override Reveal's default 20px padding */
    box-sizing: border-box;
    text-align: left;
}

/* Slide inner wrapper — padding and centering live here (a div, not section) */
.slide-inner {
    width: 100%;
    height: 100%;
    padding: var(--pad);
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;   /* safe here — this is a div, not section */
    z-index: 2;
}

/* Reset Reveal <pre> defaults */
.reveal pre {
    font-family: var(--font-mono);
    font-size: var(--code);
    margin: 0;
    box-shadow: none;   /* Reveal adds a drop-shadow */
    width: auto;        /* Reveal forces 90% */
    text-align: left;
}

.reveal pre code {
    background: transparent;
    border: none;
    padding: 0;
    font-size: inherit;
    max-height: none;   /* Reveal caps at 400px */
}

/* Progress bar and slide number */
.reveal .progress { height: 3px; }
.reveal .progress span { background: var(--accent); }
.reveal .slide-number { font-family: var(--font-mono); font-size: 0.45em; background: transparent; }

/* Keep Reveal's controls visible on custom themes */
.reveal .controls {
    color: var(--accent);
    z-index: 30;
}

.reveal .controls .enabled {
    opacity: 0.95;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    .reveal .fragment {
        transition: opacity 0.2s ease !important;
        transform: none !important;
    }
}
```

### Reveal.initialize() Config (Standard)

```javascript
Reveal.initialize({
    hash: true,
    hashOneBasedIndex: true,
    transition: 'fade',
    transitionSpeed: 'fast',
    backgroundTransition: 'none',
    center: false,          // we handle centering in .slide-inner
    controls: true,         // on-screen arrow buttons
    controlsLayout: 'edges', // keep controls at the viewport edges
    progress: true,
    slideNumber: 'c/t',
    keyboard: true,
    touch: true,
    fragments: true,
    width: 1600,
    height: 900,
    margin: 0.04,
    minScale: 0.2,
    maxScale: 2.5,
});
```

### Slide Structure Checklist

Before finalizing any presentation, verify:

- [ ] `<div class="reveal"><div class="slides">` wraps all sections
- [ ] Each `<section>` contains a `.slide-inner` div for padding/layout
- [ ] No `position` property set on `.reveal .slides > section`
- [ ] All font sizes and spacing use `px` (not em/clamp/vw)
- [ ] Colors applied via explicit `.reveal`, `.reveal h1-h6`, `.reveal p/li` rules (not `--r-*` vars)
- [ ] `box-shadow: none; width: auto;` on `.reveal pre`
- [ ] `max-height: none;` on `.reveal pre code`
- [ ] `text-transform: none;` on `.reveal h1-h6`
- [ ] Reveal.js loaded from CDN: `reveal.css` in `<head>`, `reveal.js` before `</body>`
- [ ] `Reveal.initialize({...})` called after the script

---

## Dark Themes

### 1. Bold Signal

**Vibe:** Confident, bold, modern, high-impact

**Layout:** Colored card on dark gradient. Number top-left, title bottom-left.

**Typography:**
- Display: `Archivo Black` (900)
- Body: `Space Grotesk` (400/500)

**Colors:**
```css
:root {
    --bg:         #1a1a1a;
    --text:       #ffffff;
    --text-muted: rgba(255,255,255,0.6);
    --accent:     #FF5722;
    --card-bg:    #FF5722;
    --text-on-card: #1a1a1a;
}
```

**Signature Elements:**
- Bold colored card as focal point (orange, coral, or vibrant accent)
- Large section numbers (01, 02, etc.)
- Grid-based layout for precise alignment

---

### 2. Electric Studio

**Vibe:** Bold, clean, professional, high contrast

**Layout:** Split panel — white top, blue bottom. Brand marks in corners.

**Typography:**
- Display: `Manrope` (800)
- Body: `Manrope` (400/500)

**Colors:**
```css
:root {
    --bg:         #0a0a0a;
    --text:       #0a0a0a;
    --text-light: #ffffff;
    --accent:     #4361ee;
}
```

**Signature Elements:**
- Two-panel vertical split
- Accent bar on panel edge
- Minimal, confident spacing

---

### 3. Creative Voltage

**Vibe:** Bold, creative, energetic, retro-modern

**Layout:** Split panels — electric blue left, dark right.

**Typography:**
- Display: `Syne` (700/800)
- Mono: `Space Mono` (400/700)

**Colors:**
```css
:root {
    --bg:         #1a1a2e;
    --accent-blue: #0066ff;
    --accent-neon: #d4ff00;
    --text:       #ffffff;
}
```

**Signature Elements:**
- Electric blue + neon yellow contrast
- Halftone texture patterns
- Neon badge/callout chips

---

### 4. Dark Botanical

**Vibe:** Elegant, sophisticated, artistic, premium

**Layout:** Centered content on dark. Abstract soft shapes in corners.

**Typography:**
- Display: `Cormorant` (400/600) — elegant serif
- Body: `IBM Plex Sans` (300/400)

**Colors:**
```css
:root {
    --bg:         #0f0f0f;
    --text:       #e8e4df;
    --text-muted: #9a9590;
    --accent:     #d4a574;
    --accent-pink: #e8b4b8;
    --accent-gold: #c9b896;
}
```

**Signature Elements:**
- Abstract soft gradient circles (blurred, overlapping)
- Warm color accents (pink, gold, terracotta)
- Thin vertical accent lines
- **No illustrations — only abstract CSS shapes**

---

## Light Themes

### 5. Notebook Tabs

**Vibe:** Editorial, organized, elegant, tactile

**Layout:** Cream paper card on dark background. Colorful tabs on right edge.

**Typography:**
- Display: `Bodoni Moda` (400/700)
- Body: `DM Sans` (400/500)

**Colors:**
```css
:root {
    --bg:       #2d2d2d;
    --bg-page:  #f8f6f1;
    --text:     #1a1a1a;
    --tab-1:    #98d4bb;
    --tab-2:    #c7b8ea;
    --tab-3:    #f4b8c5;
    --tab-4:    #a8d8ea;
    --tab-5:    #ffe6a7;
}
```

**Signature Elements:**
- Paper container with subtle shadow
- Colorful section tabs on right edge (vertical text)
- Binder hole decorations on left

---

### 6. Pastel Geometry

**Vibe:** Friendly, organized, modern, approachable

**Layout:** White card on pastel background. Vertical pills on right edge.

**Typography:**
- Display: `Plus Jakarta Sans` (700/800)
- Body: `Plus Jakarta Sans` (400/500)

**Colors:**
```css
:root {
    --bg:           #c8d9e6;
    --card-bg:      #faf9f7;
    --pill-pink:    #f0b4d4;
    --pill-mint:    #a8d4c4;
    --pill-sage:    #5a7c6a;
    --pill-lavender:#9b8dc4;
}
```

**Signature Elements:**
- Rounded card with soft shadow
- Vertical pills on right edge with varying heights
- Consistent pill width, heights vary: short → medium → tall → medium → short

---

### 7. Split Pastel

**Vibe:** Playful, modern, friendly, creative

**Layout:** Two-color vertical split (peach left, lavender right).

**Typography:**
- Display: `Outfit` (700/800)
- Body: `Outfit` (400/500)

**Colors:**
```css
:root {
    --bg-peach:    #f5e6dc;
    --bg-lavender: #e4dff0;
    --text:        #1a1a1a;
    --badge-mint:  #c8f0d8;
    --badge-yellow:#f0f0c8;
    --badge-pink:  #f0d4e0;
}
```

**Signature Elements:**
- Split background colors
- Playful badge pills with icons
- Grid pattern overlay on right panel

---

### 8. Vintage Editorial

**Vibe:** Witty, confident, editorial, personality-driven

**Layout:** Centered content on cream. Abstract geometric shapes as accent.

**Typography:**
- Display: `Fraunces` (700/900) — distinctive serif
- Body: `Work Sans` (400/500)

**Colors:**
```css
:root {
    --bg:          #f5f3ee;
    --text:        #1a1a1a;
    --text-muted:  #555555;
    --accent-warm: #e8d4c0;
}
```

**Signature Elements:**
- Abstract geometric shapes (circle outline + line + dot)
- Bold bordered CTA boxes
- **No illustrations — only geometric CSS shapes**

---

## Specialty Themes

### 9. Neon Cyber

**Vibe:** Futuristic, techy, dark academia for CS

**Typography:**
- UI: `Space Grotesk` (400/500/700) — Google Fonts
- Mono: `JetBrains Mono` — Google Fonts

**Colors:**
```css
:root {
    --bg:          #020813;
    --bg-card:     #081120;
    --text:        #ddeeff;
    --text-muted:  rgba(221,238,255,0.55);
    --text-dim:    rgba(221,238,255,0.25);
    --cyan:        #00ffff;
    --cyan-border: rgba(0,255,255,0.2);
    --purple:      #b46fff;
    --gold:        #ffd700;
    --green:       #4dffb4;
}
```

**Typography tokens (px for 1600×900 canvas):**
```css
:root {
    --title:  100px;
    --h2:      56px;
    --h3:      36px;
    --body:    25px;
    --small:   19px;
    --code:    21px;
    --tag:     15px;
    --pad:     72px;
    --gap:     26px;
    --gap-sm:  13px;
    --gap-lg:  52px;
}
```

**Explicit Reveal theme application:**
```css
body, .reveal-viewport {
    background: #020813;
    background-color: #020813;
}
.reveal {
    background: transparent;
    color: #ddeeff;
    font-family: 'Space Grotesk', sans-serif;
}
.reveal h1, .reveal h2, .reveal h3,
.reveal h4, .reveal h5, .reveal h6 {
    color: #ddeeff;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    letter-spacing: -0.02em;
    text-transform: none;
    margin: 0;
}
.reveal p, .reveal li, .reveal blockquote {
    color: rgba(221,238,255,0.55);
    font-family: 'Space Grotesk', sans-serif;
}
.reveal :not(pre) > code {
    font-family: 'JetBrains Mono', monospace;
    color: #00ffff;
    background: rgba(0,255,255,0.07);
    padding: 0.1em 0.38em;
    border-radius: 4px;
    border: 1px solid rgba(0,255,255,0.18);
}
.reveal .progress span {
    background: linear-gradient(90deg, #00ffff, #b46fff);
    box-shadow: 0 0 10px rgba(0,255,255,0.4);
}
```

**Signature Elements:**
- Deep navy (#020813) background with subtle cyan grid texture on body
- Cyan (#00ffff) primary accent, purple (#b46fff) secondary, gold (#ffd700) tertiary
- Code cards: dark bg-card with cyan border, JetBrains Mono
- Array/memory visualizations with color-coded cell highlights
- `.glow` divs (position: absolute, border-radius: 50%) for ambient color blobs
- Progress bar styled with cyan→purple gradient + glow
- **No scan lines** (distracting in teaching contexts)

---

### 10. Terminal Green

**Vibe:** Developer-focused, hacker aesthetic

**Typography:** `JetBrains Mono` (monospace only)

**Colors:**
```css
:root {
    --bg:     #0d1117;
    --text:   #39d353;
    --dim:    rgba(57,211,83,0.4);
    --accent: #39d353;
}
```

**Signature Elements:** Blinking cursor, code syntax styling, scan-line texture (light — 1-2% opacity)

---

### 11. Swiss Modern

**Vibe:** Clean, precise, Bauhaus-inspired

**Typography:** `Archivo` (800) + `Nunito` (400)

**Colors:**
```css
:root {
    --bg:     #ffffff;
    --text:   #000000;
    --accent: #ff3300;
}
```

**Signature Elements:** Visible grid, asymmetric layouts, geometric shapes, red accent only

---

### 12. Paper & Ink

**Vibe:** Editorial, literary, thoughtful

**Typography:** `Cormorant Garamond` + `Source Serif 4`

**Colors:**
```css
:root {
    --bg:     #faf9f7;
    --text:   #1a1a1a;
    --accent: #c41e3a;
}
```

**Signature Elements:** Drop caps, pull quotes, elegant horizontal rules

---

## Font Pairing Quick Reference

| Preset | Display Font | Body Font | Source |
|--------|--------------|-----------|--------|
| Bold Signal | Archivo Black | Space Grotesk | Google |
| Electric Studio | Manrope | Manrope | Google |
| Creative Voltage | Syne | Space Mono | Google |
| Dark Botanical | Cormorant | IBM Plex Sans | Google |
| Notebook Tabs | Bodoni Moda | DM Sans | Google |
| Pastel Geometry | Plus Jakarta Sans | Plus Jakarta Sans | Google |
| Split Pastel | Outfit | Outfit | Google |
| Vintage Editorial | Fraunces | Work Sans | Google |
| Neon Cyber | Space Grotesk | Space Grotesk / JetBrains Mono | Google |
| Terminal Green | JetBrains Mono | JetBrains Mono | Google |

---

## DO NOT USE (Generic AI Patterns)

**Fonts:** Inter, Roboto, Arial, system fonts as display

**Colors:** `#6366f1` (generic indigo), purple gradients on white

**Layouts:** Everything centered, generic hero sections, identical card grids

**Decorations:** Realistic illustrations, gratuitous glassmorphism, drop shadows without purpose

---

## Troubleshooting

### White background / invisible text after Reveal.js

- **Cause:** `--r-*` CSS custom properties only work with Reveal's bundled theme files
- **Fix:** Apply all colors with explicit CSS rules targeting `.reveal-viewport`, `.reveal`, `.reveal h1-h6`, `.reveal p/li`

### Slides 2-N appear blank

- **Cause:** `position: relative` on `.reveal .slides > section` overrides Reveal's `position: absolute` needed for fade transitions
- **Fix:** Remove any `position` from section CSS. Put padding and centering inside a `.slide-inner` div instead

### Text smaller than expected

- **Cause:** `em`/`clamp()`/`vw` values double-scale with Reveal's architecture
- **Fix:** Use `px` values sized for the 1600×900 canvas. Reference: `--h2: 56px` gives ~45px visual at a 1280×720 viewport

### Code blocks shadowed / wrong width / truncated

- **Reveal defaults:** `box-shadow` on `pre`, `width: 90%` on `pre`, `max-height: 400px` on `pre code`
- **Fix:**
  ```css
  .reveal pre { box-shadow: none; width: auto; }
  .reveal pre code { max-height: none; }
  ```

### Fragment animations not firing

- Check `Reveal.initialize()` includes `fragments: true`
- Elements need `class="fragment"` (plus optional `fade-up`, `fade-in`, etc.)
- For simultaneous reveal, use matching `data-fragment-index="N"` values

### Testing Recommendations

Test at these viewport sizes in browser DevTools:
- **Desktop:** 1920×1080, 1440×900, 1280×720
- **Tablet:** 1024×768 (landscape), 768×1024 (portrait)
- **Mobile:** 375×667, 414×896
- **Press `?`** in Reveal.js to see all keyboard shortcuts
