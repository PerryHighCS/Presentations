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
- Every simulator still labels itself as a simplified educational model. Costs
  and pass rules are illustrative, not real prices or a build guide.
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

- [ ] Reread the task pager so every task asks students to find a relationship,
  not just to observe one (optional polish only).

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
- Slide 18 Resonance asks students to justify their design for each brief and
  name the near miss they rejected.

### Checklist

- [ ] Tune the brief numbers against the model (the auxiliary + switch + run
  capacitor rule is settled above).
- [ ] Build the workshop UI on slide 17 (reuse `buildMotorDrawing`, `drawLadder`,
  the torque-speed chart).
- [ ] Combination rules, including the fault and no-effect cases.
- [ ] Result card and per-requirement feedback.
- [ ] Update slides 16 and 18, the outline, and the activities index.
- [ ] Drive every brief with its intended pass and its near misses; stability
  and overflow checks.
- [ ] Review with the teacher, then commit.

---

## Day 3: Industrial Control Room missions

Keep the VFD Control Room and its model. Add mission cards that set a measurable
production target, with a live spec checklist that passes only when every spec
holds.

### Mission ideas (numbers to tune during the build)

| Mission | Spec | What it teaches |
|---|---|---|
| Mixer | Hold 1,140 ± 15 RPM at 90 % load for 10 s, no trips | Frequency sets speed, and slip pushes the shaft below sync |
| Conveyor soft start | Reach full speed at 100 % load in under 12 s with no overcurrent trip | The ramp time trade-off |
| Fan energy saver | Run the fan at 70 % speed, current under a limit | Lower frequency, less power |
| Overspeed | Reach 2,400 RPM with a 4 pole motor | Torque falls above 60 Hz; it works at light load only |

### Interface

- Mission selector, plus a Free run mode that keeps today's open exploration.
- Live spec checklist (each line pass or fail with the current value), and a
  hold timer for specs that must be held.
- Mission complete record showing the settings used.

### Checklist

- [ ] Tune mission numbers against the existing model so each is achievable and
  has a tempting wrong setting.
- [ ] Mission selector, spec checklist, hold timer, complete record.
- [ ] Replace the task pager on slide 13 and the tasks on slide 12 with the
  missions; update slide 17's Resonance to ask for the settings that met each
  spec and why.
- [ ] Update the outline and the activities index; checks; teacher review.

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

### Checklist

- [ ] Refactor `buildPrecision` so one engine steps three arm states in lockstep.
- [ ] Three-dial layout, shared graph, scoreboard, prediction lock.
- [ ] Prediction Resonance slide; renumber; update the outline and the index.
- [ ] Drive light, heavy, and overloaded runs with bumps; stability checks;
  teacher review.

---

## Day 5: Diagnostic Mystery

The Work Orders already differ the most. Lean further into deliberate diagnosis.

### Changes

- **Downtime budget:** each ticket has a downtime budget (for example 45
  minutes). Each test costs minutes: reading a display or observing about 2,
  an energized measurement by a qualified technician about 5, and a test that
  needs lockout about 15 (lockout takes time). Unsafe choices cost nothing but
  are still flagged. Running out of time ends the investigation.
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

### Checklist

- [ ] Test costs and a budget for each ticket, tuned so a careful student
  finishes with time to spare and a scattershot one runs out.
- [ ] History logs for all four tickets.
- [ ] Causes tab with strike-out toggles.
- [ ] Defend step and updated record.
- [ ] Update slide 10 (how it works), the outline, and the index; checks
  (every reading × cause, longest record); teacher review.

---

## Open questions

None right now. Add new ones here as they come up during the build.

## Progress

- [x] Plan written
- [ ] Day 2: Motor Design Workshop
- [ ] Day 3: Control Room missions
- [ ] Day 4: Head to Head
- [ ] Day 5: Diagnostic Mystery
- [ ] Day 1: optional task polish
