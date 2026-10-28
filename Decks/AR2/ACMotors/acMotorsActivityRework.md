# AC Motors Unit: Activity Rework Plan

Working plan for giving each day's virtual activity a different kind of thinking.
Check items off as they land, and update the design notes when a decision
changes during the build. The slide lists in `acMotorsOutline.md` stay the source
of truth for what each deck contains; update them in the same change.

## Why

All five simulators currently ask students to do roughly the same thing: change a
setting, press Run, watch a diagram or graph, and explain the result. That is a
good investigation pattern, but repeated all week it invites clicking through
instead of thinking. Each day should use the simulator for a different purpose,
without turning every activity into a game.

| Day | Topic | Interaction | Students are trying to ... |
|---|---|---|---|
| 1 | Generators and phases | **Discover** | find how construction shapes the output |
| 2 | Starting single phase motors | **Design** | build a motor that meets a brief within a budget |
| 3 | Three phase motors and VFDs | **Operate** | tune a drive until a production spec is met |
| 4 | Stepper, brushless, servo | **Compare** | predict, then race three systems on one command |
| 5 | Selection and troubleshooting | **Diagnose** | find a hidden fault with limited downtime, then defend it |

## Ground rules for every rework

- Reuse each day's existing model where it already works; change the
  interaction, not the physics.
- Remove the "educational model" disclaimer from each simulator as its deck is
  reworked (done for Day 2).
- Fixed-height panels and feedback boxes, sized from the data, checked by
  driving every state (no jumps between stages).
- Text floors from `CLAUDE.md` (30 px prose, 22 px labels), 7:1 contrast, no em
  dashes, varied MCQ answer positions, Resonance only on dedicated slides with a
  `responseTimeLimitMs`.
- Update `.agent/knowledge/html5-activities-index.md` for each reworked engine.
- Per deck before committing: `audit.py` 0 problems, `validate-deck.py`,
  screenshots of every changed slide, permalink, project, and font checks.

---

## Day 1: Discovery Lab (no change)

The Generator Lab already fits discovery: students change construction (windings,
poles, field, speed) and find the relationships themselves.

- [x] Reread the task pager so every task asks students to find a relationship,
  not just to observe one (optional polish only). Tasks A to G (slide 11 and
  the slide 12 pager) now ask how speed sets frequency, how speed sets peak
  voltage, what the field changes (voltage, not frequency), what 4 poles change
  at one speed, how far apart the three peaks arrive (back at 2 poles, so the
  answer is 120°), how direction sets the peak order, and how adding phases
  steadies total power. Field and Poles had no task before.
- [x] Drop "· Simplified educational model" from the slide 12 tag.

---

## Day 2: Motor Design Workshop

Replace the "pick one of six designs" menu with a builder. Students start from
the main winding and rotor, add components, and test their design against a
customer brief.

### Components (illustrative costs)

| Component | Cost | What it does in the model |
|---|---|---|
| Base motor: main winding and rotor | $30 | Always included. Alone, it hums and cannot start. |
| Shading rings | +$8 | Weak shifted field: low starting torque, low efficiency. |
| Auxiliary winding | +$20 | Second winding that can shift the field. |
| Centrifugal switch | +$10 | Drops the auxiliary circuit (or the start capacitor) at 75 % speed. |
| Start capacitor | +$15 | Large phase shift for high starting torque; must be switched out. |
| Run capacitor | +$12 | Smaller phase shift that stays in; better running efficiency. |

### What a combination builds

| Components chosen | Result |
|---|---|
| none | Main only: hums, no starting torque. |
| shading rings | Shaded pole. |
| auxiliary + switch | Split phase. |
| auxiliary + switch + start capacitor | Capacitor start. |
| auxiliary + run capacitor | PSC. |
| auxiliary + switch + start + run capacitors | CSCR (the switch drops only the start capacitor). |
| auxiliary alone | Starts, but the auxiliary winding never drops out and overheats (fault). |
| auxiliary + start capacitor, no switch | The start capacitor stays in and fails (fault). |
| capacitor or switch without the auxiliary winding | Nothing to connect to: no effect, money wasted. |
| shading rings plus an auxiliary design | Behaves like the auxiliary design, with extra losses. |
| auxiliary + switch + run capacitor, no start capacitor | Starts with about PSC-level torque (the small run capacitor gives a modest phase shift), so it starts a fan or blower but stalls the compressor. At 75 % speed the switch removes the auxiliary winding **and** the run capacitor, so it runs and scores like split phase. The result card explains: "Your switch removed the run capacitor once the motor reached speed, so you paid for a capacitor that never runs." This sets up why a CSCR's switch drops only the start capacitor. |

### Customer briefs (numbers to tune during the build)

| Brief | Budget | Requirements | Intended cheapest pass |
|---|---|---|---|
| Bathroom exhaust fan | $45 | Starts, quiet | Shaded pole ($38) |
| Ventilation blower, 12 h a day | $70 | Starts, efficiency at least 70 % | PSC ($62) |
| Workshop compressor | $80 | Starts against a loaded cylinder within 2 s | Capacitor start ($75) |
| Loaded conveyor, all day | $95 | Starts a high-inertia load, efficiency at least 75 % | CSCR ($87) |

Each brief should have one cheapest passing design, and the near misses should
fail on a specific, explainable criterion (over budget, stalls, too inefficient,
start winding overheats).

### Interface

- Brief card (load, budget, requirements) with a brief selector.
- Component checklist with running total and budget bar.
- Cross section showing the parts that are fitted; ladder schematic built from
  the chosen parts (reuse `drawLadder`).
- **Test design** runs the existing torque-speed model and shows the chart and
  operating point.
- Result card: one row per requirement (pass or fail, with the reason), plus
  total cost. Students then improve and retest.

### Deck changes

- Slide 16 (tasks) becomes the design briefs and the build-test-improve loop.
- Slide 17 becomes the Design Workshop.
- The old slide 18 debrief Resonance is removed; students record their best
  design and one near miss on paper (task F on slide 16).

### Checklist

- [x] Tune the brief numbers against the model (the auxiliary + switch + run
  capacitor rule is settled above).
- [x] Build the workshop UI on slide 17 (reuse `buildMotorDrawing`, `drawLadder`,
  the torque-speed chart).
- [x] Combination rules, including the fault and no-effect cases.
- [x] Result card and per-requirement feedback.
- [x] Update slides 16 and 18, the outline, and the activities index.
- [x] Drive every brief with its intended pass and its near misses; stability
  and overflow checks.
- [x] Review with the teacher, then commit.

---

## Day 3: Industrial Control Room missions

Keep the VFD Control Room and its model. Add mission cards that set a measurable
production target, with a live spec checklist that passes only when every spec
holds.

### Mission ideas (numbers to tune during the build)

| Mission | Spec | What it teaches |
|---|---|---|
| Mixer | Hold 1,140 ± 15 RPM at 90 % load for 10 s | Frequency sets speed, and slip pushes the shaft below sync |
| Conveyor soft start | Reach 1,700 RPM at 100 % load, 3× inertia, within 10 s of Start with no overcurrent trip | The ramp time trade-off |
| Fan energy saver | Run the fan (torque ∝ speed²) at 70 % speed under 1.5 kW for 10 s | Lower frequency, much less power |
| Overspeed | Hold 2,400 RPM with a 4 pole motor within FLA and at least 60 % load | Torque per amp falls above 60 Hz; it works at light load only |

Tuned results (all 4 pole): the mixer passes at 40 Hz only (38 Hz from 120f/P
gives 1,093 RPM); conveyor ramps of 1 to 6 s trip OC (5 s is the default), 7 to
10 s pass, and 11 s takes 10.8 s; the fan passes at 41 to 42 Hz (1.37 kW at
42 Hz, 37 % of full speed power); overspeed passes from 82 Hz at 60 or 65 % load
(80 and 81 Hz fall short by the slip, and 70 % load draws 6.9 A). Two model
changes made this honest: a speed-squared fan load, and current = torque × f/60
above 60 Hz (field weakening), consistent with the existing 150 × 60/f torque
limit. Missions fix the motor and load (overspeed leaves the load free, starting
at 100 %); the operator sets frequency and ramp. Free run keeps every control
open.

### Interface

- Mission selector, plus a Free run mode that keeps today's open exploration.
- Live spec checklist (each line pass or fail with the current value), and a
  hold timer for specs that must be held.
- Mission complete record showing the settings used.

### Checklist

- [x] Tune mission numbers against the existing model so each is achievable and
  has a tempting wrong setting.
- [x] Mission selector, spec checklist, hold timer, complete record.
- [x] Replace the task pager on slide 13 and the tasks on slide 12 with the
  missions. The old slide 17 results Resonance is removed; students record each
  completed mission's settings, and why they worked, on paper (slide 12).
- [x] Drop "· Educational model, not a commissioning tool" from the slide 13 tag.
- [x] Update the outline and the activities index; checks.
- [x] Teacher review, then commit.

---

## Day 4: Head to Head

Rework Precision Under Pressure so the three systems run side by side from one
command, under one shared load, with one shared Bump.

### Interface

- Three arm dials in a row: stepper, brushless, servo, each with its own error
  tile and the feedback it really has.
- One command (target, speed, load) drives all three at once.
- Students lock in a prediction ("which arms end within 1° of the target after a
  bump?") before Run unlocks.
- One shared position-vs-time graph: the dashed command plus three actual
  traces. Each system gets its own line thickness, drawn thickest first, so
  when the traces overlap (light loads) every line still shows as a stripe
  inside the one beneath it. Each trace also has its own color and a label at
  its right end, so nothing depends on color alone.
- Scoreboard after each run: final error, lost steps, settle time, cost.

### Deck changes

- Slide 14 becomes the challenge and prediction.
- A dedicated Resonance prediction slide before the race (MCQ, varied answer
  position), per the rule that activities get their own slides.
- Slide 15 becomes the head to head simulator.

### Build notes

- Slides: 14 challenge, 15 Resonance prediction (heavy load plus a bump:
  only the servo), 16 the simulator. The old task pager is gone; the four
  races are listed on slide 14.
- One Run is the race: the move, then, with Bump on, the same 0.3 s knock on
  all three arms 1 s after arrival. Changing the command clears the locked
  prediction.
- Servo tuning change: anti-windup (the integral only builds below the torque
  limit). Without it, a bump under medium load left the servo parked 1.3°
  past the target for about 8 s while heavy load recovered, which read as
  "the servo fails at medium."
- A run ends only when a servo is within 1° of the command (or faulted), so
  a servo held by friction while its integral builds is never scored early.

### Checklist

- [x] Refactor `buildPrecision` so one engine steps three arm states in lockstep.
- [x] Three-dial layout, shared graph, scoreboard, prediction lock.
- [x] Prediction Resonance slide; renumber; update the outline and the index.
- [x] Drop "· Simplified educational model" from the simulator slide tag.
- [x] Drive light, heavy, and overloaded runs with bumps; stability checks.
- [x] Teacher review, then commit.

---

## Day 5: Diagnostic Mystery

The Work Orders already differ the most. Lean further into deliberate diagnosis.

### Changes

- **Downtime budget:** each ticket has a downtime budget (for example 45
  minutes). Each test costs minutes: reading a display or observing about 2,
  an energized measurement by a qualified technician about 5, and a test that
  needs lockout about 15 (lockout takes time). Unsafe choices show a time on
  the same scale (so a blank cost never gives them away) and are charged when
  picked, as well as flagged. Running out of time ends the investigation.
- **Machine history:** a log for each ticket (recent work, changes upstream,
  past failures), including some entries that do not matter.
- **Eliminate (scored):** the possible causes are listed during the
  investigation, and students strike out the ones the evidence rules out.
  Strikes count in the record: the elimination point needs at least one wrong
  cause struck out and the true cause never struck out at submission. Striking
  out the true cause shows in the record as the evidence that was misread.
- **Defend:** before submitting, students tag the evidence chips that support
  their diagnosis. The record checks that the tagged evidence includes a key
  reading.
- **Record:** scored out of 6: key evidence, safety, elimination, diagnosis,
  repair, and defended evidence. It also shows downtime used against the
  budget.

### Interface notes

The info panel is already full. Likely layout: tabs inside the info panel
(Ticket, History, Causes), with the downtime meter in the top bar next to the
status chip.

### Build notes

- Costs: reading a display, records, or observing 2 min; an energized
  measurement or a test cycle (the indexer's slow rerun, the conveyor's IR
  reading after 5 min of running) 5 min; lockout 15 min. Budgets and the
  careful vs. every-safe-test totals: fan 37 / 57 of 45, pump 17 / 28 of 25,
  conveyor 12 / 34 of 30, indexer 37 / 54 of 40.
- Unsafe tests carry a time too (2 min for hands-on ones, 5 min for the
  rest) and are charged when picked, decided after review: a blank cost
  gave them away before students read the procedure.
- Out of time means no untried test fits in what is left; the status chip
  turns OUT OF TIME and Diagnose stays available.
- Each history log gives one lead per possible cause plus one irrelevant
  entry, so history points to tests rather than answers (for example, the
  pump's motor was replaced last month for every cause; only the nameplate
  test shows whether the replacement was wrong).
- Defend is its own step after Diagnose; at least one tagged reading is
  needed to submit. The defended point checks for a key reading of the
  actual cause.
- Record rows were shortened (no quoting the wrong choice back) so the worst
  case fits; downtime and useful-test count moved into the record header.

### Checklist

- [x] Test costs and a budget for each ticket, tuned so a careful student
  finishes with time to spare and a scattershot one runs out.
- [x] History logs for all four tickets.
- [x] Drop "· Simplified educational model" from the slide 11 tag and the
  "Simplified model. Readings are illustrative." note in the info panel.
- [x] Causes tab with strike-out toggles.
- [x] Defend step and updated record.
- [x] Update slide 10 (how it works), the outline, and the index; checks
  (every stage of every ticket, longest record, scattershot runs out).
- [x] Teacher review, then commit.

---

## Open questions

None right now. Add new ones here as they come up during the build.

## Progress

- [x] Plan written
- [x] Day 2: Motor Design Workshop
- [x] Day 3: Control Room missions
- [x] Day 4: Head to Head
- [x] Day 5: Diagnostic Mystery
- [x] Day 1: optional task polish
