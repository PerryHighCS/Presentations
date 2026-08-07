# Reusable Deck-Local HTML5 Activities

Index of custom interactive widgets built directly inside a presentation's own
HTML/CSS/JS (vanilla, no external libraries). These are distinct from
ActiveBits-hosted "embedded activities" (see
`.agent/skills/vendor/syncdeck/references/AVAILABLE_ACTIVITIES.md`) — everything
here lives inline in the deck itself and is meant to be copied/adapted, not
launched.

When building a new interactive moment, check this list first. If an existing
engine fits the shape of the interaction (classify items, trace state
step-by-step, select-all-that-apply, timed random prompt, progressive reveal,
drag-to-correct-target), copy the relevant `init*` function and markup from the
source file and re-skin it with new content rather than inventing a new
mechanism.

## Generic, highly reusable engines

### Variable-box code trace
- **Where:** `Decks/HPy/Unit 1 - Basic Programming Constructs/1.2 - Data, Expressions, and Variables/1.2-data-expressions-and-variables.html` (`initVarBoxTrace`, JS ~1938-2115, HTML ~362-383)
- **Also reimplemented as:** `initCallTrace` in `.../1.3 - Functions/1.3-functions.html` (JS ~1793-1981); `initBranchTrace` in `.../1.4 - Conditionals/1.4-conditionals.html` (JS ~1737-1927)
- **Concept:** step through a code listing line-by-line (`done`/`current`/`pending` highlighting) while dragging value "chips" onto empty variable boxes to trace program state.
- **Mechanism:** native HTML5 drag-and-drop (`draggable`, `dragstart`/`dragover`/`drop`) with a click-to-select fallback for accessibility; a state object tracks the current step index and box values, with correct/incorrect feedback.
- **Reuse:** very generic — works for any procedural code sequence where you want learners to predict variable state at each step. Follows the `data-fragment-trace` code-tracing convention in AGENTS.md (current-line-is-next-to-execute).

### Chip-to-bin classifier
- **Where:** same file as above, `initTypeSort` (HTML ~775, JS ~2115+) — sorts values into data-type bins (int/float/str/bool)
- **Also reimplemented as:** `initTruthySort` in `1.3-functions.html` (truthy/falsy); `initBoolSort` in `1.4-conditionals.html` (boolean-expression sort)
- **Concept:** drag chips from a tray into labeled bins; a "N of M sorted" counter tracks progress and correctly-placed chips are removed from the tray.
- **Mechanism:** same drag/drop + click-fallback mechanism as the variable-box trace.
- **Reuse:** very generic classification pattern — swap bin labels and chip data for any "sort these into categories" exercise (data types, even/odd, parts of speech, etc.).

### Select-all-that-apply scenario matcher
- **Where:** `Decks/AR2/ShopSafety/Industrial_Warning_Signs.html`, `initChooseGame` (section ~595-616, JS ~877-990)
- **Concept:** present a scenario, learner multi-selects applicable chips from a bank, "Check Answer" marks each `state-correct`/`state-incorrect`/`state-missed` with a scored summary ("N of M correct, X missed, Y extra").
- **Mechanism:** pure click-based (no drag), `chosen` map tracks selection state, resets on `Reveal slidechanged`.
- **Reuse:** strong generic fit for any "select all that apply against a scenario" assessment.

### Staged progressive-reveal scenario
- **Where:** `Decks/AR2/ShopSafety/Making_Warnings_Unnecessary.html` — three instances of the same engine: `initBeyondGame` (~1324-1391, section `#beyond-game` ~661), `initPpeGame` (~1391-1466, `#ppe-game` ~835), `initRiskyGame` (~1466-1523, `#risky-game` ~962)
- **Concept:** a scenario description with a sequence of hidden "stage" panels; each button click reveals the next stage (marking prior ones `.done`) until all are shown, then advances to the next scenario.
- **Mechanism:** click-driven progressive reveal, per-scenario reset on slide change, no drag/drop.
- **Reuse:** generic step-by-step walkthrough pattern (hazard→control→limit, cause→effect chains, any staged reveal).

### Timed random-prompt game shell
- **Where:** `Decks/AR1/Engineering Communication/Disruptus.html` (section ~274-307, JS ~343-465)
- **Concept:** round-based brainstorming game — reveals a random "mode," deals random cards, runs a 60s countdown with low-time warning and completion sound.
- **Mechanism:** `data-state` attribute state machine (`idle`→`mode`→`cards`→`done`), plain `setInterval` timer, resets on `Reveal slidechanged`. No external libraries.
- **Reuse:** generic "randomized-prompt + timed-round" mini-game shell, independent of the card art — good for any brainstorming/warm-up activity.

### Flip-card flashcard quiz
- **Where:** `Decks/AR2/ShopSafety/Industrial_Warning_Signs.html`, `initSignGame` (section ~437-459, JS ~807-877)
- **Concept:** click-to-reveal meaning, with prev/next navigation through a deck of items.
- **Mechanism:** simple click handler toggling a revealed state; no drag/drop or scoring.
- **Reuse:** lightweight, generic flashcard-style reveal pattern.

### Multi-base binary/decimal odometer
- **Where:** `Decks/CSP/Unit 1 - Digital Information/1.5 - Overflow and Rounding/1.5-overflow-and-rounding.html` (`#binary-odometer` section, `initBinaryOdometer`)
- **Concept:** an 8-bit value is displayed simultaneously as a row of binary bit tiles and a 3-digit decimal readout. Start/Stop buttons drive a `setInterval` counter, a speed slider controls the tick interval, and a value slider (0-255) jumps straight to any 8-bit value. Crossing 255 wraps to 0 and fires a flashing "Overflow!" banner.
- **Mechanism:** plain `setInterval`/`clearInterval` counter loop (same slidechanged-cleanup pattern as the Disruptus timer), a `render()` function that derives both the bit tiles and the decimal digits from one shared integer so the two bases never drift out of sync, and a CSS keyframe animation retriggered via an `offsetWidth` reflow trick for the overflow flash.
- **Reuse:** generalizes to any "watch a fixed-width counter wrap around" demonstration, swap the bit width/base pair (e.g. hex/decimal, a 4-bit nibble) by changing the `padStart` width and the number of bit tiles.

### Algorithm growth-rate race
- **Where:** `Decks/CSP/Algorithms/unreasonable-time.html` (HTML ~856-920, JS ~1140-1270)
- **Concept:** simulates multiple algorithms (log n, n, n², 2ⁿ) racing to complete n "steps" on a shared clock, driven by a slider for n; bars fill proportionally with live counts/percentages.
- **Mechanism:** `requestAnimationFrame` timing loop, no canvas, pure DOM/CSS bars.
- **Reuse:** generic "race N processes against a shared clock" pattern, reusable for any compare-growth-curves topic beyond Big-O.

### Pushbutton/toggle state-chain stepper with animated transitions
- **Where:** `Decks/AR2/StateMachines/State_Machines_Intro.html` (`#sm-diagram` chain of `.chain-node` circles and `data-arc="0"`..`"8"` SVG transitions ~line 286, buttons ~line 355, `initStateMachineDemo` JS in the trailing `<script>`)
- **Concept:** a horizontal chain of numbered state circles connected by curved SVG arcs (plus a wide return arc looping the last node back to the first), driven by a Start button and a Step button. When the buttons appear, the whole diagram dims except the next relevant trigger arc/label. Pressing the right button "draws" that arc's path from tail to arrowhead, then lights up the destination state and shifts the highlight to the following trigger, so exactly one state and one upcoming trigger are ever highlighted at a time.
- **Mechanism:** `path.getTotalLength()` + `stroke-dasharray`/`stroke-dashoffset` animated via a forced-reflow + CSS transition (the classic SVG "line draw" technique), with the arrowhead `<marker>` opacity held at 0 until the draw finishes so it doesn't appear to float ahead of the line; a `currentArc`/`DEST[]` lookup table drives a `chain-dimmed` container class plus `.active`/`.highlight` toggles on nodes and arcs. Demo state activates/deactivates via `Reveal.on('fragmentshown'/'fragmenthidden', ...)` scoped to the specific buttons fragment (not just `slidechanged`), so stepping backward past that fragment cleanly un-dims everything.
- **Reuse:** the dasharray/dashoffset draw-in plus marker-delay trick generalizes to "animate any SVG path drawing itself" (wiring diagrams, flowcharts, causal chains); the dim-all-but-the-next-highlighted-element pattern generalizes to any guided step-through of a diagram.

## Topic-coupled but reusable *mechanism*

### Drag-to-correct-target credential/tool matching
- **Where:** `Decks/CSP/Cybersecurity/public-private-key-lab.html` (cards ~500-1050, staged wiring/validation ~1280-1433); adapted again in `Decks/CSP/Cybersecurity/protecting-data.html` (cards ~710-1050, wiring ~1950-2059)
- **Concept:** draggable `.key-card` elements (public/private keys) dropped onto `[data-drop-zone]` targets across multiple staged slides (`data-crypto-lab="encrypt"|"decrypt"|"signature"|"tamper"|...`), validating whether the correct key was used, plus a tamper-detection text input.
- **Mechanism:** native drag-and-drop with click/keyboard fallback, per-slide state machine keyed off `data-crypto-lab`.
- **Reuse:** content (asymmetric encryption) is specific, but the drag-a-labeled-card-onto-a-labeled-slot-with-correctness-validation mechanism generalizes to any "which credential/tool goes where" simulation.

### Fragment-synced diagram morph
- **Where:** `Decks/AR1/DCCircuits/EX7_Parallel_and_Mixed_Circuits.html` (JS ~1994-2110)
- **Concept:** as Reveal fragments advance/reverse across several slides, a parallel-branch circuit diagram visually collapses into its series equivalent (and expands back) in sync with fragment navigation.
- **Mechanism:** toggles a `.collapsing` class deferred via `requestAnimationFrame` to guarantee the CSS transition starts from the correct state, avoiding a transition/reflow race condition.
- **Reuse:** diagram-specific, but the "rAF-deferred class toggle synced to fragment events" technique generalizes to any before/after visual transformation tied to slide progression (equivalent circuits, chemical reactions, state diagrams, etc.).

---

*Last surveyed 2026-07-26 across Decks/HPy, Decks/CSP, Decks/AR1, Decks/AR2.
Line numbers are approximate — re-check with the file itself before copying.
When you build a new substantial, reusable deck-local activity, add an entry
here.*
