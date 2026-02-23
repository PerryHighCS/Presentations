---
name: frontend-slides
description: Create stunning, animation-rich HTML presentations from scratch or by converting PowerPoint files. Use when the user wants to build a presentation, convert a PPT/PPTX to web, or create slides for a talk/pitch. Helps non-designers discover their aesthetic through visual exploration rather than abstract choices.
---

# Frontend Slides Skill

Create Reveal.js-powered HTML presentations that run entirely in the browser. This skill helps non-designers discover their preferred aesthetic through visual exploration ("show, don't tell"), then generates production-quality slide decks.

## Core Philosophy

1. **Reveal.js for Navigation** — Use Reveal.js (CDN) for slide transitions, keyboard/touch navigation, fragments, progress bar, and slide numbers. Do not write a custom SlidePresentation class.
2. **Show, Don't Tell** — People don't know what they want until they see it. Generate visual previews, not abstract choices.
3. **Distinctive Design** — Avoid generic "AI slop" aesthetics. Every presentation should feel custom-crafted.
4. **Production Quality** — Code should be well-commented, accessible, and performant.
5. **Canvas Fitting (CRITICAL)** — Every slide MUST fill the configured Reveal.js canvas (1600×900 by default). Content that overflows should be split across slides.

---

## CRITICAL: Reveal.js Architecture

**This section is mandatory for ALL presentations. Read it carefully before generating any code.**

### How Reveal.js Sizing Works

Reveal.js renders slides on a fixed **canvas** (configured as `width × height`, default 1600×900). It then scales the entire canvas using a CSS `transform: scale()` on `.reveal .slides` to fit the actual browser viewport. This has several important consequences:

1. **Use `px` for font sizes and spacing** — NOT `clamp()`, NOT `vw`, NOT `em` in CSS custom properties.
   - Reveal.js JS sets `font-size` on `.reveal` as `Math.floor(viewportHeight * 0.04)` (~28px at 720px viewport).
   - If you use `em` in custom properties, they resolve relative to that ~28px, then the slide is also scaled down by the transform. **Double-shrinking.**
   - `px` values are immune to the inherited font-size and scale correctly through the CSS transform alone.
   - `clamp()`/`vw` reference actual viewport dimensions, not canvas dimensions — they don't scale with slides.

2. **Size everything for the canvas** — Pick `px` values that look right in a 1600×900 layout. Reveal's transform handles all viewport responsiveness automatically.

3. **No media queries for font sizes** — Reveal's transform replaces them. You don't need `@media (max-height: 700px)` font-size overrides.

### Required HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presentation Title</title>

    <!-- Reveal.js base CSS — no theme file, we supply a full custom theme -->
    <link rel="stylesheet" href="https://unpkg.com/reveal.js@5/dist/reveal.css">

    <!-- Fonts (Google Fonts or Fontshare) -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=...">

    <style>
        /* See "Required CSS" section below */
    </style>
</head>
<body>
    <!-- Reveal.js wrapper — REQUIRED structure -->
    <div class="reveal">
        <div class="slides">

            <!-- Each <section> = one slide -->
            <section>
                <div class="slide-inner">
                    <h1>Presentation Title</h1>
                    <p>Subtitle or author</p>
                </div>
            </section>

            <!-- Content slide with fragments (progressive reveal) -->
            <section>
                <div class="slide-inner">
                    <h2>Slide Title</h2>
                    <ul>
                        <li class="fragment fade-up">First point (appears on keypress)</li>
                        <li class="fragment fade-up">Second point</li>
                        <li class="fragment fade-up">Third point</li>
                    </ul>
                </div>
            </section>

            <!-- Simultaneous reveal: same data-fragment-index -->
            <section>
                <div class="slide-inner split">
                    <div class="fragment fade-up" data-fragment-index="1">Left panel</div>
                    <div class="fragment fade-up" data-fragment-index="1">Right panel (same keypress)</div>
                </div>
            </section>

        </div>
    </div>

    <!-- Reveal.js library -->
    <script src="https://unpkg.com/reveal.js@5/dist/reveal.js"></script>
    <script>
        Reveal.initialize({
            hash: true,               // URL updates with slide number
            transition: 'fade',       // slide transition (fade/slide/convex/none)
            transitionSpeed: 'fast',
            backgroundTransition: 'none',
            center: false,            // we handle centering via flex in .slide-inner
            controls: false,          // no on-screen arrow buttons (keyboard/touch only)
            progress: true,           // thin progress bar at bottom
            slideNumber: 'c/t',       // "3 / 12" counter
            keyboard: true,
            touch: true,              // swipe on mobile
            fragments: true,
            width: 1600,              // canvas width — match your design
            height: 900,              // canvas height
            margin: 0.04,
            minScale: 0.2,
            maxScale: 2.5,
        });
    </script>
</body>
</html>
```

### Default Add-on: Toggleable Storyboard Strip

For future Reveal.js presentations generated by this skill, include a **storyboard strip by default** (unless the user asks not to include it).

Required behavior:

1. Provide a bottom storyboard panel that is hidden by default and toggles with a key (default: **`M`**).
2. Show **rendered slide thumbnails** with short captions.
3. Support click-to-navigate and active-slide highlighting.
4. Keep thumbnails true **16:9** and avoid covering slide content when open.

Integration standard:

- Use shared script **`js/reveal-storyboard.js`** to show the storyboard.
- Include storyboard container markup (`#storyboard`, `#storyboard-track`).
- After `Reveal.initialize(...)`, call `window.initRevealStoryboard({...})`.

Required storyboard HTML:

```html
<div id="storyboard" class="storyboard" aria-hidden="true">
    <div id="storyboard-track" class="storyboard-track"></div>
</div>
```

Required JavaScript:

```html
<script src="https://unpkg.com/reveal.js@5/dist/reveal.js"></script>
<script src="js/reveal-storyboard.js"></script>
<script>
if (window.initRevealStoryboard) {
    window.initRevealStoryboard({
        reveal: Reveal,
        storyboardId: 'storyboard',
        trackId: 'storyboard-track',
        toggleKey: 'm',
    });
}
</script>
```

Configuration:

- Configure via the `initRevealStoryboard({...})` options object (init-call-only).
- Keep storyboard shared scripts in top-level **`js/`** for reuse across decks.
- For GitHub Pages project sites (for example `/Presentations/`), use **relative local asset paths** like `../js/...` instead of root-absolute `/js/...`.
- Build thumbnails from cloned `<section>` nodes so design styles are faithfully previewed.
- Ensure cloned preview sections are explicitly visible (`present`) to avoid black thumbnails.
- Preserve existing Reveal keyboard controls; choose a toggle key that does not conflict with core navigation.

### Add-on: Iframe Instructor/Student Sync

Use shared script **`js/reveal-iframe-sync.js`** to sync slides via `postMessage` so that for decks embedded in an iframe, the instructor can control navigation and state from the host page, while students view a synced presentation in the iframe.

Minimal setup:

```html
<script src="https://unpkg.com/reveal.js@5/dist/reveal.js"></script>
<script src="js/reveal-iframe-sync.js"></script>
<script>
Reveal.initialize({
    // ... your Reveal config ...
    plugins: [ RevealIframeSync ],
    iframeSync: {
        role: 'instructor',
        deckId: 'my-deck',
        hostOrigin: '*',
        allowedOrigins: ['*']
    }
});
</script>
```

Contract:

- Student role listens for host commands (`next`, `prev`, `slide`, `setState`).
- Instructor role publishes state changes back to host.
- Default role should be `instructor` so asynchronous viewers retain full local navigation unless a host explicitly switches to `student`.
- Message scope can be constrained by `deckId` and `allowedOrigins`.
- On connect (and role changes), iframe posts `ready` with current role, deck state, and navigation capabilities.
- By default, students can navigate backward but not forward beyond the most recent instructor-synced position.
- Use `studentCanNavigateBack` / `studentCanNavigateForward` in `iframeSync` to tune this behavior.

### Add-on: Chalkboard

Use Reveal Chalkboard for live drawing/annotation during a presentation.

Minimal setup:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js-plugins@latest/chalkboard/style.css" />

<script src="https://unpkg.com/reveal.js@5/dist/reveal.js"></script>
<script src="https://cdn.jsdelivr.net/npm/reveal.js-plugins@latest/chalkboard/plugin.js"></script>
<script>
Reveal.initialize({
    // ... your Reveal config ...
    plugins: [ RevealChalkboard ],
    chalkboard: {
        boardmarkerWidth: 4,
        chalkWidth: 7
    }
});
</script>
```

Contract:

- Register `RevealChalkboard` in `plugins` and keep chalkboard options under `chalkboard`.
- Keep keys non-conflicting with deck navigation (default plugin bindings are acceptable).
- For iframe sync (`js/reveal-iframe-sync.js`), forward chalkboard commands/events through the same `postMessage` channel so student and instructor views stay aligned.

### Required CSS

Include this complete CSS block in every presentation. Adapt colors/fonts to the chosen style preset.

```css
/* ===========================================
   1. THEMING — apply colors and fonts explicitly.
   NOTE: --r-* CSS custom properties (like --r-background-color) are ONLY
   consumed by Reveal's bundled theme CSS files (black.css, moon.css, etc.).
   Since we load reveal.css alone (no theme), we MUST use explicit CSS rules.
   =========================================== */

/* .reveal-viewport is the class Reveal.js adds to <body> at runtime */
body,
.reveal-viewport {
    background: #0a0f1c;        /* ← your background color */
    background-color: #0a0f1c;
}

.reveal {
    background: transparent;
    color: #ffffff;
    font-family: 'Your Font', sans-serif;
}

/* Headings — reset Reveal's defaults (some themes force uppercase, add margins) */
.reveal h1,
.reveal h2,
.reveal h3,
.reveal h4,
.reveal h5,
.reveal h6 {
    color: #ffffff;
    font-family: 'Your Font', sans-serif;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.1;
    text-transform: none;   /* Reveal themes often set uppercase — always reset */
    margin: 0;
}

.reveal p,
.reveal li,
.reveal blockquote {
    color: rgba(255,255,255,0.7);
    font-family: 'Your Font', sans-serif;
}

/* Inline code chips */
.reveal :not(pre) > code {
    font-family: 'Your Mono Font', monospace;
    color: #00ffcc;
    background: rgba(0,255,204,0.1);
    padding: 0.1em 0.4em;
    border-radius: 4px;
}

/* Links */
.reveal a { color: #00ffcc; }

/* ===========================================
   2. CSS CUSTOM PROPERTIES
   IMPORTANT: Use px, not em/clamp/vw.
   Reveal scales the 1600×900 canvas via CSS transform — px values
   scale correctly with it. em/clamp/vw cause double-scaling issues.
   =========================================== */
:root {
    /* Colors */
    --bg:       #0a0f1c;
    --text:     #ffffff;
    --accent:   #00ffcc;

    /* Fonts */
    --font-ui:   'Your Display Font', sans-serif;
    --font-mono: 'Your Mono Font', monospace;

    /* Typography — px sized for 1600×900 canvas.
       At a 1280×720 viewport (scale ≈ 0.8), visuals are ~80% of these values.
       At a 1920×1080 viewport (scale ≈ 1.2), visuals are ~120% of these values. */
    --title:  100px;   /* visual ~80px at 1280×720 */
    --h2:      56px;   /* visual ~45px */
    --h3:      36px;   /* visual ~29px */
    --body:    25px;   /* visual ~20px */
    --small:   19px;   /* visual ~15px */
    --code:    21px;   /* visual ~17px */
    --tag:     15px;   /* visual ~12px — labels/eyebrows */

    /* Spacing — also px for same reason */
    --pad:     72px;   /* slide inner padding */
    --gap:     26px;   /* between content items */
    --gap-sm:  13px;   /* tight gaps */
    --gap-lg:  52px;   /* section breaks */

    /* Animation */
    --ease: cubic-bezier(0.16, 1, 0.3, 1);
}

/* ===========================================
   3. REVEAL.JS STRUCTURAL OVERRIDES
   =========================================== */

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

/* CRITICAL: Do NOT set position on sections.
   Reveal.js sets position: absolute on sections to layer and fade them.
   Overriding with position: relative breaks fade transitions — slides
   2 through N will appear blank after the title slide.
   Note: position: absolute elements are already their own positioning
   context, so child position: absolute elements (decorative glows, etc.)
   are already scoped without needing position: relative on the section. */
.reveal .slides > section {
    height: 100%;
    padding: 0 !important;   /* override Reveal's default 20px padding */
    box-sizing: border-box;
    text-align: left;
}

/* Slide inner wrapper — apply padding, centering, and overflow here.
   This is a <div>, not the <section>, so position: relative is safe. */
.slide-inner {
    width: 100%;
    height: 100%;
    max-width: 1440px;
    margin: 0 auto;
    padding: var(--pad);
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
    z-index: 2;
}

/* Center layout variant (for title/impact slides) */
.slide-center {
    align-items: center;
    text-align: center;
}

/* Reset Reveal.js <pre> defaults */
.reveal pre {
    font-family: var(--font-mono);
    font-size: var(--code);
    line-height: 1.8;
    margin: 0;
    box-shadow: none;   /* Reveal adds a drop-shadow by default */
    width: auto;        /* Reveal forces width: 90% by default */
    text-align: left;
}

/* Reset Reveal.js <code> defaults inside pre */
.reveal pre code {
    font-family: inherit;
    background: transparent;
    border: none;
    padding: 0;
    font-size: inherit;
    max-height: none;   /* Reveal caps at 400px by default */
}

/* Progress bar */
.reveal .progress { height: 3px; }
.reveal .progress span {
    background: var(--accent);
}

/* Slide number */
.reveal .slide-number {
    font-family: var(--font-mono);
    font-size: 0.45em;
    background: transparent;
}

/* ===========================================
   4. FRAGMENTS (progressive reveal)
   Use class="fragment fade-up" on any element.
   Use data-fragment-index="N" for simultaneous reveal.
   =========================================== */
.reveal .fragment.fade-up {
    transform: translateY(20px);
    transition: opacity 0.4s var(--ease), transform 0.4s var(--ease);
}

.reveal .fragment.fade-up.visible {
    transform: translateY(0);
}

/* ===========================================
   5. ANIMATIONS FOR SLIDE ENTRY
   Use .reveal section.present (not .is-visible or IntersectionObserver)
   =========================================== */
.reveal section.present .my-animation {
    animation: my-keyframe 0.6s var(--ease) forwards;
}

/* ===========================================
   6. REDUCED MOTION
   =========================================== */
@media (prefers-reduced-motion: reduce) {
    .reveal .fragment {
        transition: opacity 0.2s ease !important;
        transform: none !important;
    }
}
```

### Content Density Limits

Content that overflows the 1600×900 canvas should be split across slides.

| Slide Type | Maximum Content |
|------------|-----------------|
| Title slide | 1 heading + 1 subtitle + optional tagline |
| Content slide | 1 heading + 4-6 bullet points OR 1 heading + 2 paragraphs |
| Feature grid | 1 heading + 6 cards maximum (2×3 or 3×2 grid) |
| Code slide | 1 heading + 8-10 lines of code maximum |
| Quote slide | 1 quote (max 3 lines) + attribution |

### Reveal.js Gotchas (Hard-Won Lessons)

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| White background, invisible text | `--r-*` CSS vars ignored without theme file | Use explicit CSS rules on `.reveal-viewport`, `.reveal`, `.reveal h1-h6`, etc. |
| Slides 2-N appear blank | `position: relative` on `section` overrides Reveal's `position: absolute` needed for fade | Never set `position` on `.reveal .slides > section`. Use a `.slide-inner` div for padding/centering |
| Text smaller than expected | `em` values double-scaled: Reveal sets ~28px base font-size on `.reveal` via JS, then also scales slides via transform | Use `px` values sized for the canvas (e.g., 56px for a main heading in 1600×900) |
| Code blocks get a shadow + fixed width | Reveal.js defaults: `box-shadow` + `width: 90%` on `pre` | Reset: `box-shadow: none; width: auto;` |
| Code truncated at 400px height | Reveal.js default: `max-height: 400px` on `pre code` | Reset: `max-height: none;` |
| Headings uppercase | Some Reveal CSS sets `text-transform: uppercase` | Always reset: `text-transform: none;` on `.reveal h1-h6` |

---

## Phase 0: Detect Mode

First, determine what the user wants:

**Mode A: New Presentation**
- User wants to create slides from scratch
- Proceed to Phase 1 (Content Discovery)

**Mode B: PPT Conversion**
- User has a PowerPoint file (.ppt, .pptx) to convert
- Proceed to Phase 4 (PPT Extraction)

**Mode C: Existing Presentation Enhancement**
- User has an HTML presentation and wants to improve it
- Read the existing file, understand the structure, then enhance

---

## Phase 1: Content Discovery (New Presentations)

Before designing, understand the content. Ask via AskUserQuestion:

### Step 1.1: Presentation Context

**Question 1: Purpose**
- Header: "Purpose"
- Question: "What is this presentation for?"
- Options:
  - "Pitch deck" — Selling an idea, product, or company to investors/clients
  - "Teaching/Tutorial" — Explaining concepts, how-to guides, educational content
  - "Conference talk" — Speaking at an event, tech talk, keynote
  - "Internal presentation" — Team updates, strategy meetings, company updates

**Question 2: Slide Count**
- Header: "Length"
- Question: "Approximately how many slides?"
- Options:
  - "Short (5-10)" — Quick pitch, lightning talk
  - "Medium (10-20)" — Standard presentation
  - "Long (20+)" — Deep dive, comprehensive talk

**Question 3: Content**
- Header: "Content"
- Question: "Do you have the content ready, or do you need help structuring it?"
- Options:
  - "I have all content ready" — Just need to design the presentation
  - "I have rough notes" — Need help organizing into slides
  - "I have a topic only" — Need help creating the full outline

**Question 4: Fragments**
- Header: "Reveal mode"
- Question: "How should content appear on screen?"
- Options:
  - "All at once" — Each slide appears complete (good for self-paced/PDF export)
  - "Teach mode" — Key points reveal one-by-one on keypress (good for live teaching)
  - "Light fragments" — Only major reveals fragment, details appear together

If user has content, ask them to share it.

---

## Phase 2: Style Discovery (Visual Exploration)

**CRITICAL: This is the "show, don't tell" phase.**

Most people can't articulate design preferences in words. Generate mini-previews and let them react.

### How Users Choose Presets

**Option A: Guided Discovery (Default)**
- User answers mood questions
- Skill generates 3 preview files
- User picks their favorite

**Option B: Direct Selection**
- User requests a preset by name → skip to Phase 3

**Available Presets:**
| Preset | Vibe | Best For |
|--------|------|----------|
| Bold Signal | Confident, high-impact | Pitch decks, keynotes |
| Electric Studio | Clean, professional | Agency presentations |
| Creative Voltage | Energetic, retro-modern | Creative pitches |
| Dark Botanical | Elegant, sophisticated | Premium brands |
| Notebook Tabs | Editorial, organized | Reports, reviews |
| Pastel Geometry | Friendly, approachable | Product overviews |
| Split Pastel | Playful, modern | Creative agencies |
| Vintage Editorial | Witty, personality-driven | Personal brands |
| Neon Cyber | Futuristic, techy | Tech startups, CS education |
| Terminal Green | Developer-focused | Dev tools, APIs |
| Swiss Modern | Minimal, precise | Corporate, data |
| Paper & Ink | Literary, thoughtful | Storytelling |

### Step 2.0: Style Path Selection

**Question: Style Selection Method**
- Header: "Style"
- Question: "How would you like to choose your presentation style?"
- Options:
  - "Show me options" — Generate 3 previews based on my needs (recommended)
  - "I know what I want" — Let me pick from the preset list directly

### Step 2.1: Mood Selection (Guided Discovery)

**Question: Feeling**
- Header: "Vibe"
- Question: "What feeling should the audience have when viewing your slides?"
- Options:
  - "Impressed/Confident" — Professional, trustworthy
  - "Excited/Energized" — Innovative, bold, the future
  - "Calm/Focused" — Clear, thoughtful, easy to follow
  - "Inspired/Moved" — Emotional, storytelling, memorable
- multiSelect: true

### Step 2.2: Generate Style Previews

Based on mood, generate **3 style previews** in `.claude-design/slide-previews/`:

```
.claude-design/slide-previews/
├── style-a.html
├── style-b.html
└── style-c.html
```

**Preview files:** These are standalone title-slide demos (~50-100 lines). They do NOT need to use Reveal.js — simple single-page HTML with inline CSS animations is fine for previews. The full presentation will use Reveal.js.

Each preview should show:
- Typography (font choices, heading/body hierarchy)
- Color palette
- Animation style
- Overall aesthetic

**IMPORTANT: Never use:**
- Purple gradients on white backgrounds
- Inter, Roboto, or system fonts
- Standard blue primary colors
- Predictable centered hero layouts

**Use distinctive choices:**
- Unique font pairings (Clash Display, Satoshi, Cormorant Garamond, DM Sans, etc.)
- Cohesive color themes with personality
- Atmospheric backgrounds (gradients, subtle patterns, depth)
- Signature animation moments

| Mood | Style Options |
|------|---------------|
| Impressed/Confident | "Bold Signal", "Electric Studio", "Dark Botanical" |
| Excited/Energized | "Creative Voltage", "Neon Cyber", "Split Pastel" |
| Calm/Focused | "Notebook Tabs", "Paper & Ink", "Swiss Modern" |
| Inspired/Moved | "Dark Botanical", "Vintage Editorial", "Pastel Geometry" |

### Step 2.3: Present Previews

```
I've created 3 style previews:

**Style A: [Name]** — [1 sentence]
**Style B: [Name]** — [1 sentence]
**Style C: [Name]** — [1 sentence]

Open each file to compare:
- .claude-design/slide-previews/style-a.html
- .claude-design/slide-previews/style-b.html
- .claude-design/slide-previews/style-c.html

Which resonates most? Anything you'd change?
```

**Question: Pick Your Style**
- Header: "Style"
- Question: "Which style preview do you prefer?"
- Options:
  - "Style A: [Name]" — [Brief description]
  - "Style B: [Name]" — [Brief description]
  - "Style C: [Name]" — [Brief description]
  - "Mix elements" — Combine aspects from different styles

---

## Phase 3: Generate Presentation

Generate the full presentation using **Reveal.js** as described in the Architecture section above.

### File Structure

```
presentation.html    # Single self-contained file (CSS inline, JS via CDN)
assets/              # Images, if any
```

### Fragment Strategy

Choose fragment density based on user's reveal mode preference:

**All at once:** No `fragment` classes. Content appears complete when slide advances.

**Teach mode:** Aggressive fragmentation. Key ideas appear one-by-one. Good pacing:
- Bullet list: each `<li>` is a fragment
- Rhetorical questions: each sentence is a fragment
- Diagrams: reveal elements in logical teach order
- Code + result: code visible immediately for think time; result fragments in

**Light fragments:** Only major reveals fragment. Sub-points appear together.

**Fragment class reference:**
```html
<!-- Basic: appears on keypress -->
<li class="fragment fade-up">Point</li>

<!-- Simultaneous: same data-fragment-index -->
<div class="fragment fade-up" data-fragment-index="2">Left</div>
<div class="fragment fade-up" data-fragment-index="2">Right (same keypress)</div>

<!-- Plain fade (good for grids/wide elements) -->
<div class="fragment">Grid</div>
```

### Code Quality Requirements

**Comments:** Every major CSS/JS section should explain what it does and how to modify it.

**Accessibility:**
- Semantic HTML (`<section>`, `<nav>`, `<h1-h6>`)
- Keyboard navigation works (Reveal.js handles this)
- ARIA labels where needed
- Reduced motion support

---

## Phase 4: PPT Conversion

When converting PowerPoint files:

### Step 4.1: Extract Content

Use Python with `python-pptx` to extract:

```python
from pptx import Presentation
import os

def extract_pptx(file_path, output_dir):
    prs = Presentation(file_path)
    slides_data = []
    assets_dir = os.path.join(output_dir, 'assets')
    os.makedirs(assets_dir, exist_ok=True)

    for slide_num, slide in enumerate(prs.slides):
        slide_data = {
            'number': slide_num + 1,
            'title': '',
            'content': [],
            'images': [],
            'notes': ''
        }

        for shape in slide.shapes:
            if shape.has_text_frame:
                if shape == slide.shapes.title:
                    slide_data['title'] = shape.text
                else:
                    slide_data['content'].append({'type': 'text', 'content': shape.text})

            if shape.shape_type == 13:  # Picture
                image = shape.image
                image_name = f"slide{slide_num + 1}_img{len(slide_data['images']) + 1}.{image.ext}"
                image_path = os.path.join(assets_dir, image_name)
                with open(image_path, 'wb') as f:
                    f.write(image.blob)
                slide_data['images'].append({'path': f"assets/{image_name}"})

        if slide.has_notes_slide:
            slide_data['notes'] = slide.notes_slide.notes_text_frame.text

        slides_data.append(slide_data)

    return slides_data
```

### Step 4.2: Confirm Content

Present extracted content summary to user, then proceed to style selection (Phase 2).

### Step 4.3: Generate HTML

Convert content into chosen Reveal.js style, preserving text, images, and slide order.

---

## Phase 5: Delivery

### Final Output

When the presentation is complete:

1. **Clean up** — Delete `.claude-design/slide-previews/` if it exists

2. **Provide summary**
```
Your presentation is ready!

File: [filename].html
Style: [Style Name]
Slides: [count]

Navigation:
- Arrow keys (← → ↑ ↓) or Space to advance
- Swipe on touch devices
- Press F for fullscreen, Esc to exit
- Press ? to see all keyboard shortcuts

To customize:
- Colors/fonts: update the :root CSS variables and explicit .reveal rules at the top
- Canvas size: change width/height in Reveal.initialize()
- Fragments: add/remove class="fragment fade-up" on elements

Would you like any adjustments?
```

---

## Style Reference: Effect → Feeling Mapping

### Dramatic / Cinematic
- Slow fade-ins (1-1.5s)
- Dark backgrounds with spotlight effects
- Full-bleed images
- Fragment: entire sections reveal at once

### Techy / Futuristic
- Neon glow effects (box-shadow with accent color)
- Grid patterns on background
- Monospace fonts for accents
- Cyan, magenta, electric blue palette
- Fragment: line-by-line code reveals

### Playful / Friendly
- Bouncy easing (spring physics)
- Rounded corners (large radius)
- Pastel or bright colors
- Floating/bobbing animations

### Professional / Corporate
- Subtle, fast animations (200-300ms)
- Clean sans-serif fonts
- Navy, slate, or charcoal backgrounds
- Data visualization focus

### Calm / Minimal
- Very slow, subtle motion
- High whitespace
- Serif typography
- Generous padding

### Editorial / Magazine
- Strong typography hierarchy
- Pull quotes and callouts
- Serif headlines, sans-serif body
- Black and white with one accent

---

## Animation Patterns Reference

### Background Effects

```css
/* Gradient Mesh */
body::before {
    content: '';
    position: fixed; inset: 0;
    background:
        radial-gradient(ellipse at 20% 80%, rgba(120, 0, 255, 0.25) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(0, 255, 200, 0.15) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
}

/* Grid Pattern */
body::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
    z-index: 0;
}
```

### Slide-Entry Animations

Trigger via `.reveal section.present` (not IntersectionObserver — Reveal handles this):

```css
/* Keyframe triggered when slide becomes active */
.reveal section.present .hero-element {
    animation: hero-enter 0.8s var(--ease) 0.2s both;
}

@keyframes hero-enter {
    from { opacity: 0; transform: scale(0.9) translateY(30px); }
    to   { opacity: 1; transform: scale(1)   translateY(0);    }
}
```

### Interactive Effects

```javascript
/* 3D Tilt on Hover */
class TiltEffect {
    constructor(element) {
        this.element = element;
        element.style.transformStyle = 'preserve-3d';
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width  - 0.5;
            const y = (e.clientY - rect.top)  / rect.height - 0.5;
            element.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
        });
        element.addEventListener('mouseleave', () => {
            element.style.transform = '';
        });
    }
}
```

---

## Troubleshooting

### White background / invisible text after adding Reveal.js
- **Cause:** `--r-*` CSS custom properties are only consumed by Reveal's bundled theme files
- **Fix:** Apply colors with explicit CSS rules targeting `.reveal-viewport`, `.reveal`, `.reveal h1-h6`, `.reveal p/li`, etc.

### Slides 2-N appear blank after first slide
- **Cause:** `position: relative` set on `.reveal .slides > section`, overriding Reveal's `position: absolute` needed for fade transitions
- **Fix:** Remove any `position` from section rules. Put padding/centering in a `.slide-inner` div inside the section instead

### Text is smaller than expected
- **Cause:** `em` values in CSS custom properties double-scale (Reveal sets ~28px base font-size on `.reveal` via JS, then transform scales slides down too)
- **Fix:** Use `px` values in custom properties, sized for the canvas (e.g., `56px` for a main heading in a 1600×900 canvas)

### Code blocks have a shadow and fixed width
- **Cause:** Reveal.js defaults add `box-shadow` and force `width: 90%` on `<pre>`
- **Fix:** `box-shadow: none; width: auto;` on `.reveal pre`

### Code block content truncated
- **Cause:** Reveal.js sets `max-height: 400px` on `pre code`
- **Fix:** `max-height: none;` on `.reveal pre code`

### Fonts not loading
- Check Google Fonts / Fontshare URL is correct
- Ensure font family names in CSS match exactly

---

## Related Skills

- **learn** — Generate FORZARA.md documentation for the presentation
- **frontend-design** — For more complex interactive pages beyond slides

---

## Example Session Flow

1. User: "I want to create a pitch deck for my AI startup"
2. Skill asks about purpose, length, content, fragment mode
3. User shares bullet points and key messages
4. Skill asks about desired feeling (Impressed + Excited)
5. Skill generates 3 style preview HTML files
6. User picks Style B (Neon Cyber), asks for no scan lines
7. Skill generates full Reveal.js presentation
8. User requests tweaks to specific slides
9. Final presentation delivered

---

## Conversion Session Flow

1. User: "Convert my slides.pptx to a web presentation"
2. Skill extracts content and images from PPT
3. Skill confirms extracted content with user
4. Skill asks about fragment mode and desired feeling/style
5. Skill generates style previews
6. User picks a style
7. Skill generates Reveal.js HTML presentation
8. Final presentation delivered
