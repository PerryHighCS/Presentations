# AC Motors Unit: Build Outline

Working outline for the five decks built from `acMotorsPlan.md`. Each deck follows
the plan's arc (problem, principle, experiment, apply), runs its virtual
investigation as an inline simulator slide, and uses Resonance only on dedicated
question slides (predictions, investigation records, exit tickets).

Shared pieces:

- `Decks/AR2/ACMotors/theme.css` layers on `../theme.css` (terminal green). It adds
  cards, tables, MCQ/FRQ boxes, simulator controls, readout tiles, and the task
  pager used on every simulator slide.
- Phase colors are used the same way all week, always paired with a letter:
  A = amber, B = cyan, C = violet. Faults and trips are red.
- Simulator text (controls, readouts, logs) uses the 22 to 24 px label sizes, as
  the AC Circuits simulators do. Prose and questions stay at 30 px.

---

## Day 1: Generators and Phases (`Day1_Generators_and_Phases.html`)

1. Title
2. Essential question and objectives
3. The industrial power mystery: a 120 V outlet next to a three phase motor connection (L1, L2, L3)
4. Resonance (poll + FR): "Does three phase mean the electricity moves three times faster?" and "Why might these need different supplies?"
5. Generator energy conversion: mechanical in, changing flux, voltage out (what increases voltage)
6. Alternator animation: the Generator Lab engine locked to one winding
7. AC vs DC generator output: slip rings give a sine, a commutator gives pulsing DC
8. One winding: frequency, period, and f = RPM × P / 120
9. Adding a second winding: phase difference in electrical degrees
10. Three windings, three phases: 120° apart, same frequency
11. Investigation tasks A to G (predict, observe, explain)
12. **Generator Lab simulator**
13. Why industry uses three phase: constant total power, rotating field, efficient delivery
14. Split phase is not two phase (120/240 V residential service)
15. Single phase vs three phase review table
16. Resonance exit ticket (4 questions)

**Generator Lab:** rotor magnet inside a stator ring. Selecting 1, 2, or 3 phases
adds the physical winding (A at 0°, B at 120°, C at 240°) before its trace appears.
Controls: run/pause, step 15° while paused, speed 0 to 1,800 RPM, reverse, field
strength, 2 or 4 poles, trace toggles, total-power trace. Displays: scrolling
100 ms oscilloscope in real time units, frequency, RPM, peak voltage, phase
sequence (A-B-C or A-C-B), and a feedback line. Model: V = Vpk sin(θ − k·120°),
Vpk ∝ speed × field, f = RPM × P / 120. Animation runs in slow motion with the
factor shown.

## Day 2: Starting AC Motors (`Day2_Starting_AC_Motors.html`)

1. Title
2. Essential question and objectives
3. Warm up: three phase output beside a single sine
4. Resonance (poll + FR): which supply will start a motor more easily, and why
5. Inside an induction motor: stator, windings, rotor, air gap, shaft, bearings
6. A real induction motor: labeled photo of a motor taken apart (bearings, cooling fan)
7. The squirrel cage rotor: induced currents, no brushes, compared with a PM rotor
8. Single phase field: field viewer showing a pulsating field on a fixed axis
9. Why starting torque is a problem: two equal counter-rotating halves, hum, push start either way
10. Add a second winding and shift its current: field viewer with 0 to 90° phase shift
11. Shaded pole
12. Resistance start split phase (centrifugal switch)
13. Capacitor start (the capacitor shifts phase; it is not a burst of energy)
14. PSC and capacitor start capacitor run
15. Comparison table
16. The Design Workshop challenge: build, test, improve, and tasks A to F
17. **Motor Design Workshop simulator**
18. Resonance exit ticket (4 questions)

Students record their best design and one near miss for each brief on paper.

**Motor Design Workshop:** students build a motor from the base motor ($30) plus
shading rings, an auxiliary winding, a centrifugal switch, a start capacitor, and a
run capacitor, to meet one of four customer briefs (fan, blower, compressor,
conveyor), each with a budget and requirements. A 6 s test runs the illustrative
torque-speed model (switched designs drop their start circuit at 75 % speed). The
result card scores starting, cost, and efficiency or noise, and explains wasted or
misused parts. Details are in `acMotorsActivityRework.md`.

## Day 3: Three Phase Motors and VFDs (`Day3_Three_Phase_Motors_and_VFDs.html`)

1. Title
2. Essential question and objectives
3. Review challenge: single phase vs three phase field viewers side by side
4. Three phase stator fields (field viewer, three phase mode)
5. How the squirrel cage makes torque, and why slip is needed
6. Synchronous speed vs rotor speed, worked slip example (2.78 %)
7. Frequency and pole count: 2, 4, and 6 poles at 60 Hz
8. Resonance: slip calculation check
9. Introducing the VFD: "60 Hz arrives; how do we run slower?"
10. AC to DC to controlled AC (rectifier, DC link, inverter)
11. Resonance prediction: synchronous speed at 30 Hz, and what a VFD changes
12. Control Room missions A to E (mixer, conveyor, fan, overspeed, free run);
    students record each completed mission's settings on paper
13. **VFD Control Room simulator** with missions
14. Starting a motor without a VFD: contactor, overload relay, pushbuttons, and why not an on/off switch
15. Starting and stopping an industrial motor: **three wire start/stop simulator**
16. Overload protection, and stop vs trip vs emergency stop
17. Resonance exit ticket

**VFD Control Room:** frequency 10 to 90 Hz, 2/4/6 poles (each swaps in a
different motor and nameplate), load 0 to 150 %, accel/decel ramp 1 to 20 s,
Start/Stop/E-stop/Reset. Model: sync = 120f/P; slip rpm ∝ torque (V/Hz region, so
slip % grows at low frequency); above 60 Hz the voltage caps at 460 V, so current
= torque × f/60 and torque available falls as 60/f; accel torque = inertia × ramp
rate; current limit 150 % → overcurrent trip; sustained > 115 % → overload trip.
Stop ramps down, a fault coasts, E-stop removes power and needs a reset. Displays:
output waveforms, field dial, sync vs shaft speed bars, slip %, torque %, current,
drive state, warnings, nameplate.

Missions fix the machine (4 pole motor, load, inertia) and show a live spec
checklist; hold missions complete after every spec passes at steady speed for
10 s, and record the settings used:

| Mission | Spec | Passes | Tempting wrong setting |
|---|---|---|---|
| Mixer, 90 % load | 1,125 to 1,155 RPM, held 10 s | 40 Hz only | 38 Hz (120f/P, ignores slip) |
| Conveyor, 100 % load, 3× inertia | 1,700 RPM within 10 s of Start, no trip | ramp 7 to 10 s | 5 s default trips OC; 11 s too slow |
| Fan (torque ∝ speed²) | 1,200 to 1,250 RPM, at most 1.5 kW, held 10 s | 41 to 42 Hz | 44 Hz (1.56 kW) |
| Overspeed, load starts at 100 % | ≥ 2,400 RPM, ≤ 6.7 A, load ≥ 60 %, held 10 s | 82 Hz and up at 60 to 65 % load | 80 to 81 Hz (slip); 70 % load (over FLA) |

Free run keeps every control open (130 % load overload; Stop vs trip vs E-stop).

**Three wire control:** Stop (NC), Start (NO, momentary), M coil, M holding
contact, OL contact; buttons for Start, Stop, OL trip, and power loss.

## Day 4: Stepper, Brushless, and Servo (`Day4_Stepper_Brushless_Servo.html`)

1. Title
2. Essential question and objectives
3. Hook: fan, 3D printer axis, robot arm joint (what each needs from its motor)
4. Resonance: why not the same motor for all three?
5. Brushed DC review (commutator and brushes)
6. Brushless construction (PM rotor, stator windings, ESC, Hall sensors)
7. Electronic commutation: **commutation demo** in BLDC mode with a live Hall code table
8. Stepper operation: the same demo in stepper mode (step, half step)
9. Step angle calculation (1.8°, 200 steps, 50 steps for 90°, 3D printer example, microstepping)
10. Resonance: step count check
11. Open loop positioning and lost steps
12. Servo feedback loop
13. Resonance: what makes a system a servo
14. Precision Under Pressure: the challenge (three systems, predictions)
15. **Precision Under Pressure simulator**
16. Motor selection comparison table
17. Resonance exit ticket: toy vehicle, drone, robot arm joint, 3D printer axis

**Precision Under Pressure:** systems are an open loop stepper, BLDC speed
control, and a servo with an encoder. Inputs: target angle, speed, load
(light/medium/heavy), bump disturbance, run/pause/reset. Model: the stepper loses
steps in groups of 4 when demanded torque exceeds the torque available at that
step rate, and never knows it. BLDC regulates speed and runs for the computed
time, so it drifts and coasts. The servo uses a torque-limited PD loop with
response time, and raises a following-error fault when saturated too long.
Displays: dial with commanded and actual pointers, error, encoder signal (servo
only), position-vs-time graph, controller indicators, cost and complexity.

## Day 5: Selection and Troubleshooting (`Day5_Motor_Selection_and_Troubleshooting.html`)

1. Title
2. Essential question and objectives
3. "The motor is humming, but the shaft is not turning."
4. Resonance FR: what information do you need?
5. Six step diagnostic process
6. Safe troubleshooting (LOTO, stored energy, qualified testing)
7. Lockout/tagout: the six steps, a locked and tagged disconnect, a lock and unique key for every worker
8. Mechanical vs electrical vs control faults
9. Resonance: fault type and safety check (3 MCQ)
10. How the work orders work
11. **Motor Maintenance Work Orders simulator**
12. Engineering selection challenge (choose one of four applications)
13. Unit concept summary
14. Resonance: final reflection

Students record each work order (tests, readings, diagnosis, repair, safety) and
their selection justification on paper.

**Work Orders:** four work orders (ventilation fan, industrial pump, overheating
conveyor motor, positioning error), each with a hidden cause drawn from 3 or 4
possibilities. A New Fault button draws another. Students run tests, safe and
unsafe. Useful tests reveal readings rather than answers, irrelevant tests return
valid but unhelpful data, and unsafe choices raise a warning. At least one test is
required before the Diagnose stage unlocks. The diagnosis and repair choices then
produce a scored record (out of 4): key evidence checked, unsafe attempts,
diagnosis, and repair, plus how many tests could tell the causes apart and an
explanation of the actual cause.
